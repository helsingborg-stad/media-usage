<?php

namespace MediaUsage;

class Scanner
{
   /**
    * $attachments
    *
    * Scanned attachments. Including attachment ID, URL & usage/relations found.
    * @var array
    */
    public $attachments = array();

   /**
    * $queue
    *
    * Scan queue of attachments, each attachment defined as array [ID => URL].
    * @var array
    */
    private $queue = array();

   /**
    * $limit
    *
    * Limits number of attachments per scan. Set to -1 to scan all in one run, else it will scan in chunks.
    * @var int
    */
    public $limit = 16;

   /**
    * $postmeta, $termmeta, $options
    *
    * Pre-queried data from mysql meta/options tables.
    * @var array
    */
    private $postmeta = array(), $termmeta = array(), $options = array();

   /**
    * $metaTableQuery
    *
    * Tells if pre-queried meta data is avalible.
    * @var boolean
    */
    private $metaTableQuery = false;

   /**
    * __construct()
    *
    * Class constructor method
    * @param mixed/array/string/int $attachments Attachment id's to scan for.
    */
    public function __construct($attachments = null)
    {
        $this->addToQueue($attachments);
    }

   /**
    * scan()
    *
    * Scans usage of attachments defined in class propety '$queue' through post content & meta tables. Goes through the queue in chunks if class propety '$limit' is > 0.
    * @param mixed/array/boolean $target Defines which queries to use when scanning. Set to "all" to run all avalible queries.
    * @return void/boolean
    */
    public function scan($target = 'all')
    {
        if (!is_array($this->queue) || empty($this->queue)) {
            return false;
        }

        $i = 0;
        foreach ($this->queue as $id => $url) {
            $attachment = array(
                'id'        => $id,
                'url'       => $url,
                'relations' => array()
            );

            $contentRelations = apply_filters('MediaUsage/Scan/ContentRelationFilter', $this->scanPostContent($url, $id), $id, $url);
            $metaRelations = apply_filters('MediaUsage/Scan/MetaRelationFilter', $this->scanMetaTables($id, $target), $id, $url);

            $attachment['relations'] = array_merge($attachment['relations'], $contentRelations);
            $attachment['relations'] = array_merge($attachment['relations'], $metaRelations);

            $this->attachments[] = apply_filters('MediaUsage/Scan/AttachmentScannedFilter', $attachment);

            //Remove from queue
            unset($this->queue[$id]);

            //Do stuff after scan
            do_action('MediaUsage/Scan/AttachmentScannedAction', $attachment);

            //Run method in chunks
            if ($this->limit > 0 && $i >= $this->limit) {
                $this->scan($target);
                return;
            }

            $i++;
        }
    }

   /**
    * scanPostContent()
    *
    * Scans for attachment URL in post content
    * @param string $url Attachment URL
    * @param mixed/int/string $id Attachment ID
    * @return array
    */
    private function scanPostContent($url, $id)
    {
        $urlParts = pathinfo($url);
        $urlParts['dirname'] = str_replace(home_url(), '', $urlParts['dirname']);
        $url = '%' . $urlParts['dirname'] . '/' . $urlParts['filename'] . '%.' . $urlParts['extension'] . '%';

        global $wpdb;
        $tablePrefix = $wpdb->prefix;

        $sql = "SELECT
                    '{$id}' as attachment_id,
                    ID as object_id,
                    'content' as relation_type,
                    post_title,
                    post_type
                FROM {$tablePrefix}posts
                WHERE post_content LIKE '$url';";

        return $wpdb->get_results($sql, ARRAY_A);
    }

   /**
    * scanMetaTables()
    *
    * Scans for attachment ID in meta tables
    * @param mixed/string/int $id Attachment ID
    * @param mixed/string/array $query Defines which queries to use when scanning. Set to "all" to run all avalible queries.
    * @return array
    */
    private function scanMetaTables($id, $query = 'all')
    {
        $this->preQueryMetaTables($query);
        $relations = array();

        $metaTablesToSearch = array(
            'postmeta',
            'termmeta',
            'options'
        );

        //Loop through pre-queried meta tables
        foreach ($metaTablesToSearch as $table) {
            if (!isset($this->$table) || !is_array($this->$table) || empty($this->$table)) {
                continue;
            }

            //Filter for matching keys with matching attachment ID
            $relation = array_filter($this->$table, function($item) use ($table, $id) {
                if (isset($item['attachment_id']) && $item['attachment_id'] == $id) {
                    return $item;
                }
            });

            $relations = array_merge($relations, $relation);
        }

        return $relations;
    }

   /**
    * preQueryMetaTables()
    *
    * Pre-queries meta table data to avoid multiple sql queries. This method will query meta/options that has a value of an existing attachment ID.
    * @param mixed/string/array $query Defines which queries to use when scanning. Set to "all" to run all avalible queries.
    * @return void
    */
    private function preQueryMetaTables($query = 'all')
    {
        //Perhaps data already exists
        if ($this->metaTableQuery == true) {
            return;
        }

        global $wpdb;
        $tablePrefix = $wpdb->prefix;

        $sqlQueries = array(
            'postmeta' => "SELECT
                                meta_value as attachment_id,
                                meta_id as object_id,
                                CASE WHEN meta_key = '_thumbnail_id' THEN 'thumbnail' ELSE 'postmeta' END as relation_type,
                                meta_key,
                                post_id
                            FROM {$tablePrefix}postmeta LEFT JOIN {$tablePrefix}posts ON {$tablePrefix}postmeta.meta_value = {$tablePrefix}posts.ID
                            WHERE {$tablePrefix}posts.post_type = 'attachment';",
            'termmeta' => "SELECT
                                meta_value as attachment_id,
                                meta_id as object_id,
                                'termmeta' as relation_type,
                                meta_key,
                                term_id
                            FROM {$tablePrefix}termmeta LEFT JOIN {$tablePrefix}posts ON {$tablePrefix}termmeta.meta_value = {$tablePrefix}posts.ID
                            WHERE {$tablePrefix}posts.post_type = 'attachment';",
            'options' => "SELECT
                                option_value as attachment_id,
                                option_id as object_id,
                                'option' as relation_type,
                                option_name
                            FROM {$tablePrefix}options LEFT JOIN {$tablePrefix}posts ON {$tablePrefix}options.option_value = {$tablePrefix}posts.ID
                            WHERE {$tablePrefix}posts.post_type = 'attachment';"
        );

        $sqlQueries = apply_filters('MediaUsage/Scanner/metaQueries', $sqlQueries, $query);

        foreach ($sqlQueries as $key => $sql) {
            if (is_string($query) && $query != 'all' && $key != $query || is_array($query) && !in_array($key, $query)) {
                continue;
            }

            if (get_transient('media_scanner_' . $key)) {
                $this->$key = get_transient('media_scanner_' . $key);
                continue;
            }

            $results = $wpdb->get_results($sql, ARRAY_A);
            $this->$key = $results;

            //Cache results
            set_transient('media_scanner_' . $key, $results, 1 * HOUR_IN_SECONDS);
        }

        //Let us know the data is avalible
        $this->metaTableQuery = true;
    }

   /**
    * addToQueue()
    *
    * Validates if it's an existing attachment and appends it to the queue if true
    * @param mixed/string/array $attachments Attachment id's to enqueue, accepts single id (string) or multiple ids (array).
    * @return void
    */
    public function addToQueue($attachments)
    {
        $attachments = (!is_array($attachments)) ? array($attachments) : $attachments;

        if (empty($attachments) || !$attachments) {
            return false;
        }

        foreach ($attachments as $attachment) {
            if (!is_numeric($attachment) || get_post_type($attachment) != 'attachment') {
                continue;
            }

            $this->queue[$attachment] = wp_get_attachment_url($attachment);
        }
    }
}

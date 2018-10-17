<?php

namespace MediaUsage;

class App
{
    public static $installed = false;
    public static $relationTableName = 'attachment_relationships';

    public function __construct()
    {
        add_action('admin_init', '\MediaUsage\App::checkInstall');
        add_action('MediaUsage/Scan/AttachmentScannedAction', array($this, 'saveRelationsToDatabaseAfterScan'), 6, 1);
        add_filter('MediaUsage/Scan/ContentRelationFilter', array($this, 'filterScanByPostType'), 10, 1);
        add_filter('MediaUsage/Scan/MetaRelationFilter', array($this, 'filterScanByPostType'), 10, 1);
        add_action('admin_enqueue_scripts', array($this, 'registerScripts'), 6);
        add_action('admin_enqueue_scripts', array($this, 'enqueueScriptsAndStyles'), 6);
        add_action('wp_ajax_scanUsageAjaxMethod', array($this, 'scanUsageAjaxMethod'));
        add_action('wp_ajax_getMediaPostType', array($this, 'getMediaPostType'));

        new \MediaUsage\MediaLibrary\BulkScan();
        new \MediaUsage\MediaLibrary\Edit();
    }

    public function scanUsageAjaxMethod()
    {
        if (!defined('DOING_AJAX') || !DOING_AJAX) {
            return false;
        }

        if (!wp_verify_nonce($_POST['nonce'], 'mediaUsageNonce')) {
            die('Busted!');
        }

        if (!isset($_POST['attachments']) || !is_array($_POST['attachments']) || empty($_POST['attachments'])) {
            return;
        }

        $scanner = new \MediaUsage\Scanner($_POST['attachments']);
        $scanner->limit = 16;
        $scanner->scan();

        die;
    }

    public function getMediaPostType()
    {
        if (!defined('DOING_AJAX') || !DOING_AJAX) {
            return false;
        }

        if (!wp_verify_nonce($_POST['nonce'], 'hbgmedia')) {
            die('YO! No nonce');
        }
        $postTitle = get_the_title($_POST['id']);
        wp_send_json($postTitle);
    }

    public function enqueueScriptsAndStyles()
    {
        $screen = get_current_screen();

        if ($screen->id != 'upload') {
            if (!apply_filters('MediaUsage/App/enqueueScriptsAndStyles', false)) {
                return;
            }
        }

        wp_enqueue_style('hbg-media-usage-css', MEDIAUSAGE_URL . '/dist/' . \MediaUsage\Helper\CacheBust::name('css/media-usage.css'));
        wp_enqueue_script('hbg-media-usage-js');
    }

    public function registerScripts()
    {
        wp_register_script('hbg-media-usage-js', MEDIAUSAGE_URL . '/dist/' . \MediaUsage\Helper\CacheBust::name('js/media-usage.js'), array('jquery'));
        wp_localize_script(
            'hbg-media-usage-js',
            'hbgmedia',
                array(
                    'url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('hbgmedia'),
                    'response' => __( 'Your about too delete an attachment that is attached to following post/page', 'media-usage' )
                )
        );
    }

   /**
    * filterScanByPostType()
    *
    * Filter by posttypes when scanning for relations
    *
    * @param array $relations
    * @return void
    */
    public function filterScanByPostType($relations)
    {
        if (!is_array($relations) || empty($relations)) {
            return $relations;
        }

        $postTypesToIgnore = array('revision');
        $relations = array_filter($relations, function($relation) use ($postTypesToIgnore) {
            //Bail if option or termmeta
            if ($relation['relation_type'] == 'option' || $relation['relation_type'] == 'termmeta') {
                return $relation;
            }

            $postType = (isset($relation['post_id'])) ? get_post_type($relation['post_id']) : $relation['post_type'];
            if (!in_array($postType, $postTypesToIgnore)) {
                return $relation;
            }
        });

        return $relations;
    }

   /**
    * saveRelationsToDatabaseAfterScan()
    *
    * Saves relations to the database after scan has been run (action hook) & set last scan timestamp
    *
    * @param array $attachment
    * @return void
    */
    public function saveRelationsToDatabaseAfterScan($attachment)
    {
        \MediaUsage\Helper\Relations::updateRelations($attachment['id'], $attachment['relations']);
        update_post_meta($attachment['id'], 'media_scanner_last_scan', date('Y-m-d H:i:s', time()));
    }

    /**
     * Check if plugin is properly installed & create tables etc if not
     * @return void
     */
    public static function checkInstall()
    {
        global $wpdb;

        if (self::$installed == true) {
            return true;
        }

        $relationTable = $wpdb->prefix . self::$relationTableName;

        if ($wpdb->get_var("SHOW TABLES LIKE '$relationTable'") == $relationTable) {
            self::$installed == true;
            return true;
        }

        self::install();
    }

    /**
     * Creates plugin sql tables etc
     * @return void
     */
    public static function install()
    {
        global $wpdb;

        $relationTable = $wpdb->prefix . self::$relationTableName;
        $wpdb_collate = $wpdb->collate;

        $sql =
        "CREATE TABLE {$relationTable} (
            relation_id bigint(20) unsigned NOT NULL auto_increment PRIMARY KEY,
            attachment_id bigint(20) unsigned NOT NULL,
            object_id bigint(20) unsigned DEFAULT NULL,
            relation_type longtext COLLATE {$wpdb_collate}
        )
        COLLATE {$wpdb_collate}";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Removes sql tables etc
     * @return void
     */
    public static function uninstall()
    {}
}

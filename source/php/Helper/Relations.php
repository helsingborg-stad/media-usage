<?php

namespace MediaUsage\Helper;

class Relations
{
   /**
    * updateRelations()
    *
    * Updates an attachment relations, remove old relations and adds new (if any)
    *
    * @param string/int $attachmentId
    * @param array $relations
    * @return void
    */
    public static function updateRelations($attachmentId, $relations)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . \MediaUsage\App::$relationTableName;

        $relationCount = count($relations);

        if ($relationCount == 0) {
            return;
        }

        $relations = array_map(function($relation) {
            return array(
                'attachment_id' => $relation['attachment_id'],
                'object_id' =>  $relation['object_id'],
                'relation_type' => "'" . $relation['relation_type'] . "'"
            );
        }, $relations);

        $existingRelations = array_map(function($relation) {
            unset($relation['relation_id']);
            $relation['relation_type'] = "'" . $relation['relation_type'] . "'";
            return $relation;
        }, self::getRelationsByColumn($attachmentId));

        $relationsToInsert = array_filter($relations, function($relation) use ($existingRelations) {
            return (!in_array($relation, $existingRelations));
        });

        $relationsToDelete = array_filter($existingRelations, function($relation) use ($relations) {
            return (!in_array($relation, $relations));
        });

        //Insert rows
        if (is_array($relationsToInsert) && !empty($relationsToInsert)) {
            self::insertRelations($relationsToInsert);
        }

        //Delete rows
        if (is_array($relationsToDelete) && !empty($relationsToDelete)) {
            self::deleteRelations($relationsToDelete);
        }
    }

   /**
    * insertRelations()
    *
    * Insert attachment relations to the database
    *
    * @param array $relations
    * @return mixed/object/string
    */
    public static function insertRelations($relations)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . \MediaUsage\App::$relationTableName;

        $sql = array();
        $sql[] = "INSERT INTO {$tableName} (attachment_id, object_id, relation_type) VALUES ";
        $sql[] = self::arrayToSqlValues($relations);
        $sql[] = ";";

        $sql = implode('', $sql);

        return $wpdb->query($sql);
    }

   /**
    * insertRelations()
    *
    * Delete attachment relations from the database
    *
    * @param array $relations
    * @return mixed/object/string
    */
    public static function deleteRelations($relations)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . \MediaUsage\App::$relationTableName;

        $sql = array();
        $sql[] = "DELETE FROM {$tableName} WHERE (attachment_id, object_id, relation_type) IN (";
        $sql[] = self::arrayToSqlValues($relations);
        $sql[] = ");";

        $sql = implode('', $sql);

        return $wpdb->query($sql);
    }

   /**
    * arrayToSqlValues()
    *
    * Helper method to format array to string which is used in sql query when inserting multiple rows
    *
    * @param array $array
    * @return string
    */
    public static function arrayToSqlValues($array)
    {
        $i = 1;
        $sql = array();
        foreach ($array as $item) {
            $sql[] = '(';
            $sql[] = implode(',', $item);
            $sql[] = ')';

            if (count($array) > $i) {
                $sql[] = ', ';
            }

            $i++;
        }

        return implode('', $sql);
    }

   /**
    * getRelations()
    *
    * Get attachment relations. This sql query joins other tables to include meta data for each relation.
    *
    * @param string/int $attachmentId
    * @return array
    */
    public static function getRelations($attachmentId)
    {
        global $wpdb;
        $relationTable = $wpdb->prefix . \MediaUsage\App::$relationTableName;
        $postMetaTable = $wpdb->prefix . 'postmeta';
        $termMetaTable = $wpdb->prefix . 'termmeta';
        $optionsTable = $wpdb->prefix . 'options';

        $sql = "
            SELECT
                attachment_id,
                relation_type,
                CASE
                    WHEN relation_type = 'content' THEN object_id
                    WHEN relation_type IN ('postmeta', 'thumbnail') THEN {$postMetaTable}.post_id
                    ELSE NULL
                END AS post_id,
                CASE
                    WHEN relation_type IN ('postmeta', 'thumbnail') THEN {$postMetaTable}.meta_id
                    WHEN relation_type = 'termmeta' THEN {$termMetaTable}.meta_id
                    ELSE NULL
                END AS meta_id,
                CASE
                    WHEN relation_type IN ('postmeta', 'thumbnail') THEN {$postMetaTable}.meta_key
                    WHEN relation_type = 'termmeta' THEN {$termMetaTable}.meta_key
                    ELSE NULL
                END AS meta_key,
                CASE
                    WHEN relation_type IN ('option', 'options') THEN {$optionsTable}.option_id
                    ELSE NULL
                END AS option_id,
                CASE
                    WHEN relation_type IN ('option', 'options') THEN {$optionsTable}.option_name
                    ELSE NULL
                END AS option_name,
                CASE
                    WHEN relation_type = 'termmeta' THEN {$termMetaTable}.term_id
                    ELSE NULL
                END AS term_id
            FROM
                {$relationTable}
            LEFT JOIN {$postMetaTable} ON {$postMetaTable}.meta_id = {$relationTable}.object_id AND relation_type IN ('postmeta', 'thumbnail')
            LEFT JOIN {$optionsTable} ON {$optionsTable}.option_id = {$relationTable}.object_id AND relation_type IN ('option', 'options')
            LEFT JOIN {$termMetaTable} ON {$termMetaTable}.meta_id = {$relationTable}.object_id AND relation_type = 'termmeta'
            WHERE attachment_id = {$attachmentId};
        ";

        return $wpdb->get_results($sql, ARRAY_A);
    }


   /**
    * getAttachmentRelations()
    *
    * Get attachment relations by attachment ID from relations table, including full relations meta by joining other tables.
    *
    * @param string/int $attachmentId
    * @return array
    */
    public static function getRelationsGrouped($attachmentId)
    {
        $rawRelations = self::getRelations($attachmentId);
        $relations = array();

        $posts = array();
        $terms = array();
        $options = array();

        foreach ($rawRelations as $relation) {
            if (isset($relation['post_id']) && !isset($posts[$relation['post_id']])) {
                $posts[$relation['post_id']] = array(
                    'id' => $relation['post_id'],
                    'type' => 'post',
                    'content' => false,
                    'thumbnail' => false,
                    'meta' => array()
                );
            }

            if (isset($relation['term_id']) && !isset($terms[$relation['term_id']])) {
                $terms[$relation['term_id']] = array(
                    'id' => $relation['term_id'],
                    'type' => 'term',
                    'meta' => array()
                );
            }

            switch ($relation['relation_type']) {
                case 'option':
                    $options[] = array(
                        'option_id' => $relation['option_id'],
                        'option_name' => $relation['option_name'],
                        'type' => 'option',
                    );
                break;

                case 'termmeta':
                    $terms[$relation['term_id']]['meta'][] = $relation['meta_key'];
                break;

                case 'postmeta':
                    $posts[$relation['post_id']]['meta'][] = $relation['meta_key'];
                break;

                default:
                    $posts[$relation['post_id']][$relation['relation_type']] = true;
            }
        }

        $relations = array_merge($posts, $terms);
        $relations = array_merge($relations, $options);


        return $relations;
    }

   /**
    * getRelationsBy()
    *
    * Get attachment relations by column from relations table,
    *
    * @param string/int $attachmentId
    * @return array
    */
    public static function getRelationsByColumn($columnValue, $columnName = 'attachment_id')
    {
        $columnNames = array(
            'relation_id', 'attachment_id', 'relation_type', 'object_id'
        );

        if (!is_string($columnName) || !in_array($columnName, $columnNames)) {
            return false;
        }

        global $wpdb;
        $tableName = $wpdb->prefix . \MediaUsage\App::$relationTableName;

        $sql = "
            SELECT *
            FROM
                {$tableName}
            WHERE
                {$columnName} = {$columnValue};
        ";

        return $wpdb->get_results($sql, ARRAY_A);
    }
}

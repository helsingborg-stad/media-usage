<?php

namespace MediaUsage;

class App
{
    public static $installed = false;
    public static $relationTableName = 'attachment_relationships';

    public function __construct()
    {
        add_action('MediaTracker/Scan/AttachmentScannedAction', array($this, 'saveRelationsToDatabaseAfterScan'), 6, 1);
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

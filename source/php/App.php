<?php

namespace MediaUsage;

class App
{
    public static $installed = false;
    public static $relationTableName = 'attachment_relationships';

    public function __construct()
    {
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

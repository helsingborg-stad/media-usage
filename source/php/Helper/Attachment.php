<?php

namespace MediaUsage\Helper;

class Attachment
{
    public static function getAttachmentIds()
    {
        global $wpdb;

        $tableName = $wpdb->prefix . 'posts';

        $attachmentIds = $wpdb->get_results("
            SELECT
                ID
            FROM {$tableName}
            WHERE post_type = 'attachment'
        ");

        if (!is_array($attachmentIds) || empty($attachmentIds)) {
            return false;
        }

        return array_map(function($attachment) {
            return $attachment->ID;
        }, $attachmentIds);
    }
}

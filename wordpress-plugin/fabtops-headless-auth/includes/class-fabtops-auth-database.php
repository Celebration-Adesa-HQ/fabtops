<?php

defined('ABSPATH') || exit;

final class FabTops_Auth_Database {
    public static function table_name(): string {
        global $wpdb;
        return $wpdb->prefix . 'fabtops_auth_sessions';
    }

    public static function activate(): void {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $table = self::table_name();
        $charset = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE {$table} (
            session_id varchar(64) NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            access_hash char(64) NOT NULL,
            access_expires_at datetime NOT NULL,
            refresh_hash char(64) NOT NULL,
            refresh_expires_at datetime NOT NULL,
            session_version bigint(20) unsigned NOT NULL DEFAULT 1,
            created_at datetime NOT NULL,
            last_used_at datetime NOT NULL,
            revoked_at datetime NULL,
            PRIMARY KEY (session_id),
            KEY user_id (user_id),
            KEY access_hash (access_hash),
            KEY refresh_hash (refresh_hash)
        ) {$charset};";

        dbDelta($sql);
    }
}

<?php

defined('ABSPATH') || exit;

final class FabTops_Auth_Sessions {
    private const ACCESS_TTL = 15 * MINUTE_IN_SECONDS;
    private const REFRESH_TTL = 30 * DAY_IN_SECONDS;

    private function hash_token(string $token): string {
        return hash_hmac('sha256', $token, wp_salt('auth'));
    }

    private function opaque_token(): string {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    private function public_token(string $session_id, string $secret): string {
        return $session_id . '.' . $secret;
    }

    private function split_token(string $token): ?array {
        $parts = explode('.', $token, 2);
        return count($parts) === 2 && preg_match('/^[a-f0-9]{32}$/', $parts[0]) ? $parts : null;
    }

    public function create(int $user_id): array {
        global $wpdb;
        $session_id = bin2hex(random_bytes(16));
        $access = $this->opaque_token();
        $refresh = $this->opaque_token();
        $now = time();

        $wpdb->insert(FabTops_Auth_Database::table_name(), array(
            'session_id' => $session_id,
            'user_id' => $user_id,
            'access_hash' => $this->hash_token($access),
            'access_expires_at' => gmdate('Y-m-d H:i:s', $now + self::ACCESS_TTL),
            'refresh_hash' => $this->hash_token($refresh),
            'refresh_expires_at' => gmdate('Y-m-d H:i:s', $now + self::REFRESH_TTL),
            'session_version' => 1,
            'created_at' => gmdate('Y-m-d H:i:s', $now),
            'last_used_at' => gmdate('Y-m-d H:i:s', $now),
        ), array('%s', '%d', '%s', '%s', '%s', '%s', '%d', '%s', '%s'));

        if (!$wpdb->insert_id && $wpdb->last_error) {
            throw new RuntimeException('Unable to create session');
        }

        return $this->token_response($session_id, $access, $refresh, $now, 1);
    }

    private function token_response(string $session_id, string $access, string $refresh, int $now, int $version): array {
        return array(
            'accessToken' => $this->public_token($session_id, $access),
            'refreshToken' => $this->public_token($session_id, $refresh),
            'accessExpiresAt' => ($now + self::ACCESS_TTL) * 1000,
            'refreshExpiresAt' => ($now + self::REFRESH_TTL) * 1000,
            'sessionVersion' => $version,
        );
    }

    public function validate_access(string $token): ?int {
        global $wpdb;
        $parts = $this->split_token($token);
        if (!$parts) return null;
        [$session_id, $secret] = $parts;
        $table = FabTops_Auth_Database::table_name();
        $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE session_id = %s LIMIT 1", $session_id));
        if (!$row || $row->revoked_at || strtotime($row->access_expires_at . ' UTC') <= time()) return null;
        if (!hash_equals($row->access_hash, $this->hash_token($secret))) return null;
        $wpdb->update($table, array('last_used_at' => current_time('mysql', true)), array('session_id' => $session_id));
        return (int) $row->user_id;
    }

    public function rotate(string $token): ?array {
        global $wpdb;
        $parts = $this->split_token($token);
        if (!$parts) return null;
        [$session_id, $secret] = $parts;
        $table = FabTops_Auth_Database::table_name();
        $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE session_id = %s LIMIT 1", $session_id));
        if (!$row || $row->revoked_at || strtotime($row->refresh_expires_at . ' UTC') <= time()) return null;
        if (!hash_equals($row->refresh_hash, $this->hash_token($secret))) {
            $this->revoke_session($session_id);
            return null;
        }

        $access = $this->opaque_token();
        $refresh = $this->opaque_token();
        $now = time();
        $version = (int) $row->session_version + 1;
        $updated = $wpdb->update($table, array(
            'access_hash' => $this->hash_token($access),
            'access_expires_at' => gmdate('Y-m-d H:i:s', $now + self::ACCESS_TTL),
            'refresh_hash' => $this->hash_token($refresh),
            'refresh_expires_at' => gmdate('Y-m-d H:i:s', $now + self::REFRESH_TTL),
            'session_version' => $version,
            'last_used_at' => gmdate('Y-m-d H:i:s', $now),
        ), array('session_id' => $session_id, 'refresh_hash' => $row->refresh_hash));

        return $updated === 1 ? $this->token_response($session_id, $access, $refresh, $now, $version) : null;
    }

    public function revoke_token(string $token): void {
        $parts = $this->split_token($token);
        if ($parts) $this->revoke_session($parts[0]);
    }

    private function revoke_session(string $session_id): void {
        global $wpdb;
        $wpdb->update(
            FabTops_Auth_Database::table_name(),
            array('revoked_at' => current_time('mysql', true)),
            array('session_id' => $session_id),
        );
    }

    public function revoke_user(int $user_id): void {
        global $wpdb;
        $wpdb->update(
            FabTops_Auth_Database::table_name(),
            array('revoked_at' => current_time('mysql', true)),
            array('user_id' => $user_id, 'revoked_at' => null),
        );
    }
}

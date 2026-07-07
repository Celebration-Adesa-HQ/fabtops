<?php

defined('ABSPATH') || exit;

final class FabTops_Auth_Security {
    public function __construct(private FabTops_Auth_Sessions $sessions) {}

    public function register_hooks(): void {
        add_filter('determine_current_user', array($this, 'authenticate_bearer'), 20);
    }

    public function authenticate_bearer($user_id) {
        if ($user_id) return $user_id;
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) return $user_id;
        return $this->sessions->validate_access(trim($matches[1])) ?: $user_id;
    }

    public function require_signed_request(WP_REST_Request $request) {
        if (!defined('FABTOPS_AUTH_CLIENT_SECRET') || strlen(FABTOPS_AUTH_CLIENT_SECRET) < 32) {
            return new WP_Error('AUTH_SERVICE_UNAVAILABLE', 'Authentication unavailable', array('status' => 503));
        }
        $timestamp = $request->get_header('x-fabtops-timestamp');
        $nonce = $request->get_header('x-fabtops-nonce');
        $signature = $request->get_header('x-fabtops-signature');
        if (!$timestamp || !$nonce || !$signature || abs(time() - (int) $timestamp) > 300) {
            return new WP_Error('INVALID_SIGNATURE', 'Invalid request', array('status' => 401));
        }

        $nonce_key = 'fabtops_nonce_' . hash_hmac('sha256', $nonce, FABTOPS_AUTH_CLIENT_SECRET);
        if (get_transient($nonce_key)) {
            return new WP_Error('INVALID_SIGNATURE', 'Invalid request', array('status' => 401));
        }

        $canonical = implode("\n", array(
            $timestamp,
            strtoupper($request->get_method()),
            $request->get_route(),
            hash('sha256', $request->get_body()),
            $nonce,
        ));
        $expected = base64_encode(hash_hmac('sha256', $canonical, FABTOPS_AUTH_CLIENT_SECRET, true));
        if (!hash_equals($expected, $signature)) {
            return new WP_Error('INVALID_SIGNATURE', 'Invalid request', array('status' => 401));
        }
        set_transient($nonce_key, 1, 10 * MINUTE_IN_SECONDS);
        return true;
    }

    public function require_customer(WP_REST_Request $request) {
        $signed = $this->require_signed_request($request);
        if (is_wp_error($signed)) return $signed;
        return get_current_user_id() > 0
            ? true
            : new WP_Error('SESSION_EXPIRED', 'Session expired', array('status' => 401));
    }

    public function rate_limit(string $action, string $identifier, int $limit = 8, int $window = 900) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = 'fabtops_rate_' . hash_hmac('sha256', $action . '|' . $ip . '|' . strtolower($identifier), wp_salt('nonce'));
        $attempts = (int) get_transient($key);
        if ($attempts >= $limit) {
            return new WP_Error('RATE_LIMITED', 'Please try again later', array('status' => 429));
        }
        set_transient($key, $attempts + 1, $window);
        return true;
    }
}

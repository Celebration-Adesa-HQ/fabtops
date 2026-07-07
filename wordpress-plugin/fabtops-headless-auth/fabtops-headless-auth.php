<?php
/**
 * Plugin Name: FabTops Headless Customer Auth
 * Description: Secure customer authentication endpoints for the FabTops headless WooCommerce storefront.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * WC requires at least: 8.0
 */

defined('ABSPATH') || exit;

define('FABTOPS_AUTH_VERSION', '1.0.0');
define('FABTOPS_AUTH_FILE', __FILE__);
define('FABTOPS_AUTH_DIR', plugin_dir_path(__FILE__));

require_once FABTOPS_AUTH_DIR . 'includes/class-fabtops-auth-database.php';
require_once FABTOPS_AUTH_DIR . 'includes/class-fabtops-auth-sessions.php';
require_once FABTOPS_AUTH_DIR . 'includes/class-fabtops-auth-security.php';
require_once FABTOPS_AUTH_DIR . 'includes/class-fabtops-auth-rest.php';

register_activation_hook(__FILE__, array('FabTops_Auth_Database', 'activate'));

add_action('plugins_loaded', static function (): void {
    if (!class_exists('WooCommerce')) {
        return;
    }

    $sessions = new FabTops_Auth_Sessions();
    $security = new FabTops_Auth_Security($sessions);
    $rest = new FabTops_Auth_REST($sessions, $security);
    $security->register_hooks();
    $rest->register_hooks();
});

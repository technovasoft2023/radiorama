<?php

/**
 * Plugin Name:             TikTok Feed
 * Plugin URI:              https://quadlayers.com/products/tiktok-feed/
 * Description:             Display beautiful and responsive galleries on your website from your TikTok feed account.
 * Version:                 4.5.8
 * Text Domain:             wp-tiktok-feed
 * Author:                  QuadLayers
 * Author URI:              https://quadlayers.com
 * License:                 GPLv3
 * Domain Path:             /languages
 * Request at least:        4.7
 * Tested up to:            6.8
 * Requires PHP:            5.6
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'QLTTF_PLUGIN_NAME', 'TikTok Feed' );
define( 'QLTTF_PLUGIN_VERSION', '4.5.8' );
define( 'QLTTF_PLUGIN_FILE', __FILE__ );
define( 'QLTTF_PLUGIN_DIR', __DIR__ . DIRECTORY_SEPARATOR );
define( 'QLTTF_DOMAIN', 'qlttf' );
define( 'QLTTF_PREFIX', QLTTF_DOMAIN );
define( 'QLTTF_WORDPRESS_URL', 'https://wordpress.org/plugins/wp-tiktok-feed/' );
define( 'QLTTF_REVIEW_URL', 'https://wordpress.org/support/plugin/wp-tiktok-feed/reviews/?filter=5#new-post' );
define( 'QLTTF_GROUP_URL', 'https://www.facebook.com/groups/quadlayers' );
define( 'QLTTF_TIKTOK_URL', 'https://www.tiktok.com' );
define( 'QLTTF_ACCOUNT_URL', admin_url( 'admin.php?page=qlttf_backend&tab=accounts' ) );
define( 'QLTTF_DEVELOPER', false );

/**
 * Load composer autoload
 */
require_once __DIR__ . '/vendor/autoload.php';
/**
 * Load vendor_packages packages
 */
require_once __DIR__ . '/vendor_packages/wp-i18n-map.php';
require_once __DIR__ . '/vendor_packages/wp-dashboard-widget-news.php';
require_once __DIR__ . '/vendor_packages/wp-plugin-table-links.php';
require_once __DIR__ . '/vendor_packages/wp-notice-plugin-promote.php';
require_once __DIR__ . '/vendor_packages/wp-plugin-install-tab.php';
require_once __DIR__ . '/vendor_packages/wp-plugin-feedback.php';
/**
 * Load plugin classes
 */
require_once __DIR__ . '/lib/class-plugin.php';
/**
 * Load compatibility classes
 */
require_once __DIR__ . '/compatibility/old.php';
require_once __DIR__ . '/compatibility/class-load.php';

register_activation_hook(
	QLTTF_PLUGIN_FILE,
	function () {
		do_action( QLTTF_PREFIX . '_activation' );
	}
);

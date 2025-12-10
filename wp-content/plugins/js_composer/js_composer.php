<?php
/**
 * Plugin Name: Brooklyn WPBakery Page Builder
 * Plugin URI: https://wpbakery.com
 * Description: Drag-and-drop page builder, tailored for Brooklyn. Built on WPBakery for easy layout control.
 * Version: 7.9.5
 * Author: Michael M - WPBakery.com
 * Author URI: https://wpbakery.com
 * Text Domain: js_composer
 * Domain Path: /locale/
 * Requires at least: 4.9
 *
 * @package WPBakery Page Builder
 */

// don't load directly
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}
/**
 * Current WPBakery Page Builder version
 */
if ( ! defined( 'WPB_VC_VERSION' ) ) {
	define( 'WPB_VC_VERSION', '7.9.5' );
}

$dir = dirname( __FILE__ );
define( 'WPB_PLUGIN_DIR', $dir );
define( 'WPB_PLUGIN_FILE', __FILE__ );

require_once $dir . '/include/classes/core/class-vc-manager.php';
/**
 * Main WPBakery Page Builder manager.
 * @var Vc_Manager $vc_manager - instance of composer management.
 * @since 4.2
 */
global $vc_manager;
if ( ! $vc_manager ) {
	$vc_manager = Vc_Manager::getInstance();
	// Load components
	$vc_manager->loadComponents();
}

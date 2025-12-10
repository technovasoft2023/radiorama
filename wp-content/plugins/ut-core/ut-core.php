<?php
/**
 * Plugin Name:       Brooklyn Theme – Core
 * Plugin URI:        http://unitedthemes.com/
 * Description:       Provides essential core functionalities and system support for the Brooklyn WordPress theme.
 * Version:           1.0.3
 * Author:            UNITED THEMES™
 * Author URI:        http://unitedthemes.com/
 * Text Domain:       ut-core
 * Domain Path:       /languages
 */

namespace UTCore;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Currently plugin version.
 */
define( 'UT_CORE_VERSION', '1.0.3' );

/**
 * Path and URL
 */

define( 'UT_CORE_PATH', plugin_dir_path( dirname( __FILE__ ) ) . 'ut-core' );
define( 'UT_CORE_URL', plugin_dir_url( dirname( __FILE__ ) ) . 'ut-core' );

/**
 * Compose autoload file
 */
require UT_CORE_PATH . '/vendor/autoload.php';

require UT_CORE_PATH . '/inc/functions.php';
require UT_CORE_PATH . '/inc/ut-image-resize.php';
/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function ut_core_run() {
    $plugin = new Main();
    $plugin->run();
}
ut_core_run();
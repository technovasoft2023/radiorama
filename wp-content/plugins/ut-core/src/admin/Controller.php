<?php
/**
 * The admin-facing functionality of the plugin.
 *
 * @since      1.0.0
 *
 * @package    UTCore
 */

namespace UTCore\admin;

// If this file is called directly, abort.
if ( !defined( 'WPINC' ) ) {
    die;
}

/**
 * The admin-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 */

class Controller
{
    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     *
     * @var string the ID of this plugin
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     *
     * @var string the current version of this plugin
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     *
     * @param string $plugin_name the name of this plugin
     * @param string $version     the version of this plugin
     */
    public function __construct( $plugin_name, $version )
    {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        include UT_CORE_PATH . '/src/admin/ImageProcessingQueue.php';
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles()
    {
        if( ( isset($_GET['page'])  && $_GET['page'] == 'ut-x' )  ) {
            wp_enqueue_style('ut-x-manager-styles',  UT_CORE_URL . '/assets/css/ut.x.manager.css');
        }
    }

    /**
     * Adds New Contact field to user profiles
     *
     * @access    public
     * @since     1.0.0
     */
    public function user_contact_methods( $contactmethods ) {
        if( function_exists( '_ut_recognized_social_user_profiles' ) ) {
            foreach( _ut_recognized_social_user_profiles() as $profile => $name ) {
                $contactmethods[$profile] = $name;
            }

            return $contactmethods;
        }
    }

    /**
     * Filter 'upload_mimes' and add xml.
     *
     * @param     array     $mimes An array of valid upload mime types
     * @return    array
     *
     * @access    public
     * @since     1.0
     */
    public function upload_mimes( $mimes ) {

        $mimes['xml'] = 'text/xml';
        $mimes['svg'] = 'image/svg+xml';
        $mimes['webp'] = 'image/webp';

        return $mimes;

    }

    /**
     * Filter 'upload_mimes' and add font mimes.
     *
     * @param     array     $mimes An array of valid upload mime types
     * @return    array
     *
     * @access    public
     * @since     1.0
     */
    public function font_upload_mimes( $t ) {
        if ( current_user_can( 'edit_theme_options' ) ) {
            $t['svg']   = 'image/svg+xml';
            $t['woff']  = 'application/x-font-woff';
            $t['woff2'] = 'application/octet-stream';
            $t['eot']   = 'application/vnd.ms-fontobject';
            $t['ttf']   = 'application/x-font-ttf';
        }

        return $t;
    }

    public function ajax_upload_fonts() {
        if( ! wp_verify_nonce( $_POST['nonce'], 'ut-nonce' ) || !current_user_can( 'edit_theme_options' ) ) {
            wp_die();
        }
        define('ALLOW_UNFILTERED_UPLOADS', true);
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }
        $uploadedfile = $_FILES['file'];
        $upload_overrides = array('test_form' => false);
        $movefile = wp_handle_upload($uploadedfile, $upload_overrides);
        if( $movefile && ! isset($movefile['error']) ) {
            wp_send_json_success($movefile);
        }
        wp_send_json_error([], 400);
        wp_die();
    }

    public function x_admin_page() {
        add_options_page("UT X", "UT X", 'edit_pages', "ut-x", [$this, 'x_page']);
    }

    public function x_page() {
        include UT_CORE_PATH . '/src/admin/views/x-admin.php';
    }

    public function x_settings() {
        register_setting( 'ut_twitter_options_group', 'ut_twitter_options');
    }

}
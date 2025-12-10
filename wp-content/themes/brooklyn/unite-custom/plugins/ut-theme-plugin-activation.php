<?php if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Plugin Dashboard Notification
 *
 * @return    void
 *
 * @access    private
 * @since     1.0.0
 * @version   1.0.0
 */

function _ut_hide_dashboard_notification() {

    update_option( 'hide_unite_tgmpa_dashboard_notification', UT_THEME_VERSION );

}

add_action( 'wp_ajax_hide_tgmpa_notification', '_ut_hide_dashboard_notification' );


function _ut_plugin_bucket_url( $slug ) {
    global $ut_theme_license;

    $server = $ut_theme_license->get_licensing_server_url('update-server/');
    $purchase_code = $ut_theme_license->get_purchase_code();
    $domain = $ut_theme_license->get_site_url_plain();

    return $server.'?action=download&slug='.esc_attr($slug).'&purchase_code='.$purchase_code.'&domain='.$domain;

}

/**
 * Array of required plugins
 *
 * @return    array
 *
 * @access    private
 * @since     4.9.2
 * @version   1.0.0
 */

if ( ! function_exists( '_ut_recognized_plugins' ) ) :

    function _ut_recognized_plugins() {

        return array(

            array(
                'name'     				=> 'Brooklyn Theme – Core',
                'slug'     				=> 'ut-core',
                'source'   				=> _ut_plugin_bucket_url('ut-core'),
                'required' 				=> true,
                'version' 				=> '1.0.3',
                'united'                => 'ut-core/ut-core.php'
            ),
            array(
                'name'     				=> 'Brooklyn WPBakery Page Builder',
                'slug'     				=> 'js_composer',
                'source'   				=> _ut_plugin_bucket_url('js_composer'),
                'required' 				=> true,
                'version' 				=> '7.9.5',
                'united'                => 'js_composer/js_composer.php',
            ),
            array(
                'name'     				=> 'Brooklyn Theme – Shortcodes Pack',
                'slug'     				=> 'ut-shortcodes',
                'source'   				=> _ut_plugin_bucket_url('ut-shortcodes'),
                'required' 				=> true,
                'version' 				=> '5.1.9',
                'united'                => 'ut-shortcodes/ut-shortcodes.php'
            ),
            array(
                'name'     				=> 'Brooklyn Theme – Portfolio Manager',
                'slug'     				=> 'ut-portfolio',
                'source'   				=> _ut_plugin_bucket_url('ut-portfolio'),
                'required' 				=> true,
                'version' 				=> '5.0.2',
                'united'                => 'ut-portfolio/ut-portfolio.php'
            ),
            array(
                'name'     				=> 'Brooklyn Theme – Pricing Tables',
                'slug'     				=> 'ut-pricing',
                'source'   				=> _ut_plugin_bucket_url('ut-pricing'),
                'required' 				=> true,
                'version' 				=> '3.3.4',
                'united'                => 'ut-pricing/ut-pricing.php'
            ),
            array(
                'name'     				=> 'Revolution Slider',
                'slug'     				=> 'revslider',
                'source'   				=> _ut_plugin_bucket_url('revslider'),
                'version' 				=> '6.7.34',
                'united'                => 'revslider/revslider.php'
            ),
            array(
                'name'      			=> 'Contact Form 7',
                'slug'      			=> 'contact-form-7',
                'required'  			=> false,
                'version' 				=> '6.0.6',
            ),
            array(
                'name'      			=> 'MailChimp for WordPress',
                'slug'      			=> 'mailchimp-for-wp',
                'required'  			=> false,
                'version' 				=> '4.10.4',
            ),
            array(
                'name'      			=> 'Cryptocurrency Widgets',
                'slug'      			=> 'cryptocurrency-price-ticker-widget',
                'required'  			=> false,
                'version' 				=> '2.8.5',
            ),

        );


    }

endif;



/**
 * Plugin Requirements for this theme
 *
 * @return    void
 *
 * @access    private
 * @since     4.9.2
 * @version   1.0.0
 */

if ( ! function_exists( '_ut_register_required_plugins' ) ) :

    function _ut_register_required_plugins() {


        $config = array(

            'default_path' 		=> '',                         	/* Default absolute path to pre-packaged plugins */
            'menu'         		=> 'install-required-plugins', 	/* Menu slug */
            'is_automatic'    	=> true,						/* Automatically activate plugins after installation or not */
            'dismissable'  	    => true,						/* If false, a user cannot dismiss the nag message. */
        );

        // show notices by default
        $config['has_notices'] = true; /* Show admin notices or not */

        if( version_compare( UT_THEME_VERSION, get_option( 'hide_unite_tgmpa_dashboard_notification' ), '==' ) )  {

            $config['has_notices'] = false; /* Show admin notices or not */

        }

        tgmpa( _ut_recognized_plugins(), $config );

    }

    add_action( 'tgmpa_register', '_ut_register_required_plugins' );

endif;
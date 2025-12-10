<?php

/**
 * Fired during plugin activation
 *
 * @since      1.0.0
 *
 * @package    UTCore
 */

namespace UTCore\utils;

// If this file is called directly, abort.
if ( !defined( 'WPINC' ) ) {
    die;
}

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 */
class Activator
{
    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @since    1.0.0
     */
    public static function activate($network_wide = false)
    {
        global $wpdb;

        if ( is_multisite() && $network_wide ) {
            $blog_ids = $wpdb->get_col( "SELECT blog_id FROM $wpdb->blogs" );
            foreach ( $blog_ids as $blog_id ) {
                //self::addTables( $blog_id );
            }
        } else {
            //self::addTables();
        }
    }


    public static function addTables($blog_id = null)
    {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        if ( $blog_id && $blog_id != $wpdb->blogid ) {
            $old_blog_id = $wpdb->set_blog_id( $blog_id );
        }

        // Engage multisite if in the middle of turning it on from network.php.
        $is_multisite = is_multisite() || ( defined( 'WP_INSTALLING_NETWORK' ) && WP_INSTALLING_NETWORK );
        $max_index_length = 191;


        $sql = "";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }
}

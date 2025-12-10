<?php

function ut_core_get_file_content( $file, $offset, $length ) {
    return @file_get_contents($file, null, null, $offset, $length);
}

function ut_core_disable_emojis() {
    if( function_exists('ot_get_option') ) {
        if( ot_get_option( 'ut_deactivate_emojis', 'on' ) == 'on' ) {

            // remove actions
            remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
            remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
            remove_action( 'wp_print_styles', 'print_emoji_styles' );
            remove_action( 'admin_print_styles', 'print_emoji_styles' );

            // remove filters
            remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
            remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
            remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );

        }
    }
}
add_action( 'init', 'ut_core_disable_emojis' );
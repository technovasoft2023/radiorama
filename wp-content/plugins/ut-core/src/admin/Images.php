<?php

namespace UTCore\admin;

class Images {

    public function enqueue_assets( $hook ) {
        if ( ( isset( $_GET['page'] ) && $_GET['page'] === 'image_crontrol_admin_manage_page' ) || ( $hook === 'tools_page_image_crontrol_admin_manage_page' ) ) {
            wp_enqueue_script( 'ut-popup', UT_CORE_URL . '/assets/js/popup.min.js', [ 'jquery' ], true, UT_CORE_VERSION );
            wp_enqueue_script( 'ut-images', UT_CORE_URL . '/assets/js/image-processing.js', [ 'jquery' ], true, UT_CORE_VERSION );
            wp_localize_script( 'ut-images', 'UT_IMAGES', [
                'nonce'     =>  wp_create_nonce( 'ut-images-nonce' ),
                'url'       => admin_url( 'admin-ajax.php' )
            ] );
        }
    }

    public function count_attachments() {
        global $wpdb;

        $query = "SELECT COUNT(*) FROM {$wpdb->prefix}posts WHERE post_type = 'attachment'";

        echo (int)$wpdb->get_var( $query );
        wp_die();
    }

    public function clean_proccesed_images() {
        if( ! wp_verify_nonce( $_REQUEST['nonce'], 'ut-images-nonce' ) ) {
            die();
        }
        $posts_per_page = 10;
        $paged = (int)$_POST['paged'];
        $offset = ($paged - 1) * $posts_per_page;

        $args = array(
            'post_type' => 'attachment',
            'posts_per_page' => $posts_per_page,
            'offset'         => $offset,
            'post_status' => null,
            'post_parent' => null,
        );
        $attachments = get_posts($args);
        if ($attachments) {
            foreach ($attachments as $post) {
                $image_meta = wp_get_attachment_metadata($post->ID);
                if( !isset( $image_meta['sizes'] ) ) {
                    continue;
                }
                $sizes = $image_meta['sizes'];
                $uploads = wp_upload_dir();
                $upload_baseurl = $uploads['baseurl'];
                $upload_basedir = $uploads['basedir'];
                if( is_array( $sizes ) ) {
                    $size_keys = array_keys($image_meta['sizes']);
                    foreach ( $size_keys as $key ) {
                        if( strpos( $key, 'ipq-' ) !== false ) {
                            $image = wp_get_attachment_image_src($post->ID, $key);
                            if( $image ) {
                                $image_url = $image[0];
                                if (strpos($image_url, $upload_baseurl) !== false) {
                                    $image_path = str_replace($upload_baseurl, $upload_basedir, $image_url);
                                    if( file_exists( $image_path ) ) {
                                        unlink($image_path);
                                    }
                                }
                            }
                            unset($image_meta['sizes'][$key]);
                        }
                    }
                }
                unset( $image_meta['ipq_locked'] );
                wp_update_attachment_metadata( $post->ID, $image_meta );
            }
            echo '1';
        } else {
            echo '0';
        }

        wp_die();
    }
}
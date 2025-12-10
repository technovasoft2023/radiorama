<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class UT_Portfolio_Video_Thumb {

    private bool $is_video = false;

    private string $video_path = '';

    private string $thumb_meta = 'ut_video_auto_thumb';

    public function __construct() {
        add_action( 'save_post_portfolio', [$this, 'save_post'] );
    }

    public function get_meta( $id, $key ) {
        return get_post_meta( $id, $key, true );
    }

    public function get_video_path( $url, $ssl = true ) {
        $upload_dir = wp_upload_dir();
        if( is_ssl() && $ssl ) {
            $upload_dir['baseurl'] = str_replace( 'http://', 'https://', $upload_dir['baseurl'] );
        }
        if ( strpos( $url, $upload_dir['baseurl'] ) !== false ) {
            $file_path = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $url );

            return $file_path;
        }

        return false;
    }

    public function get_media_url( $path ) {
        $upload_dir = wp_upload_dir();

        if ( strpos( $path, $upload_dir['basedir'] ) !== false ) {
            $file_url = str_replace( $upload_dir['basedir'], $upload_dir['baseurl'], $path );

            return $file_url;
        }

        return false;
    }

    public function save_post( $id ): void {

        if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) {
            return;
        }

        if( $this->get_meta( $id, 'ut_onpage_portfolio_media_type' ) === 'video' ) {
            $video_url = $this->get_meta( $id, 'ut_onpage_portfolio_video_youtube' );
            $video_preview_url = $this->get_meta( $id, 'ut_portfolio_showcase_video_mp4' );
            if( ! empty( $video_url ) && $this->get_meta( $id, 'ut_onpage_portfolio_video_source' ) === 'custom' ) {
                $this->video_path = $this->get_video_path( $video_url );
            } elseif( !empty( $video_preview_url ) ) {
                $this->video_path = $this->get_video_path( $video_preview_url );
            }
            $this->is_video = true;
        }

        $this->generate_thumb( $id );
    }

    public function check_ffmpeg(): bool {
        if( function_exists( 'exec' ) ) {
             $command = exec( 'ffmpeg -version' );
             if( ! empty( $command ) ) {
                 return true;
             }
        }

        return false;
    }

    public function out_path(): string {
        $upload_dir = wp_upload_dir();
        $custom_dir = $upload_dir['basedir'] . '/ut-thumbs';

        if ( !file_exists($custom_dir) ) {
            wp_mkdir_p($custom_dir);
        }

        return $custom_dir;
    }

    public function remove_old_thumb( $post_id ): void {
        $meta = $this->get_meta( $post_id, $this->thumb_meta );
        if( ! empty( $meta ) ) {
            $old_thumb = $this->get_video_path( $meta, false );
            if( file_exists( $old_thumb ) ) {
                unlink( $old_thumb );
            }
        }
    }

    public function save_thumb( $post_id, $thumb_path ): void {
        $thumb_url = $this->get_media_url( $thumb_path );
        update_post_meta( $post_id, $this->thumb_meta, esc_url( $thumb_url ) );
    }
    public function generate_thumb( $post_id ): void {
        if( $this->is_video && ! empty( $this->video_path ) && $this->check_ffmpeg() ) {
            $this->remove_old_thumb( $post_id );
            $time_to_capture = '00:00:02';
            $out_path = $this->out_path().'/thumb-'.$post_id.'.png';
            exec("ffmpeg -i $this->video_path -ss $time_to_capture -vframes 1 -s 320x200 $out_path 2>&1", $output, $returnCode);
            if ($returnCode === 0) {
                $this->save_thumb( $post_id, $out_path );
            }
        }
    }
}
new UT_Portfolio_Video_Thumb();
<?php

function ut_get_twitch_video_type( $url ) {

    if( stristr( $url, 'clips.twitch.tv' ) ) {

        return array(
            'type'  => 'clip',
            'index' => 1,
            'regex' => '/http[s]?:\/\/(?:www\.|clips\.)twitch\.tv\/([0-9a-zA-Z\-\_]+)\/?(chat\/?$|[0-9a-z\-\_]*)?/'
        );

    }

    if( stristr($url, '/clip/') ) {

        return array(
            'type'  => 'clip',
            'index' => 3,
            'regex' => '/http[s]?:\/\/(?:www\.|clips\.)twitch\.tv\/([0-9a-zA-Z\-\_]+)\/([0-9a-zA-Z\-\_]+)\/([0-9a-zA-Z\-\_]+)?/'
        );

    }

    if( stristr($url, '/videos/') ) {

        return array(
            'type'  => 'video',
            'index' => 2,
            'regex' => '/http[s]?:\/\/(?:www\.|clips\.)twitch\.tv\/([0-9a-zA-Z\-\_]+)\/?(chat\/?$|[0-9a-z\-\_]*)?/'
        );

    }

    if( stristr($url, 'twitch.tv/') ) {

        if( stristr($url, 'player.twitch.tv/?channel') ) {

            return array(
                'type'  => 'channel',
                'index' => 2,
                'regex' => '~[\?&]([^&]+)=([^&]+)~'
            );

        } else {

            return array(
                'type'  => 'channel',
                'index' => 1,
                'regex' => '/http[s]?:\/\/(?:www\.|clips\.)twitch\.tv\/([0-9a-zA-Z\-\_]+)\/?(chat\/?$|[0-9a-z\-\_]*)?/'
            );

        }

    }

    return array();

}
function ut_kses_player( $content )
{
    $allowed_html = [
        'video' => [
            'width'  => true,
            'height' => true,
            'loop'   => true,
            'autoplay' => true,
            'muted' => true,
            'preload' => true,
            'keyboard' => true,
            'controls'  => true,
            'defaultMuted'     => true,
            'playsinline'   => true,
            'webkit-playsinline'    => true,
            'class' => [],
            'style' => [],
        ],
        'audio' => [
            'src'       => true,
            'controls'  => true,
            'autoplay'  => true,
            'loop'      => true,
            'muted'     => true,
        ],
        'source'    => [
          'srcset'  => true,
          'style'    => [],
          'src'      => true,
          'type'     => true,
        ],
        'img'   => [
            'alt' => true,
            'src' => true,
            'width' => true,
            'height' => true,
        ],
        'iframe' => [
            'src'             => true,
            'width'           => true,
            'height'          => true,
            'frameborder'     => true,
            'allow'           => true,
            'allowfullscreen' => true,
            'name'            => true,
            'scrolling'       => true,
        ],
        'track' => [
            'kind' => true,
            'src'  => true,
            'srclang' => true,
            'label' => true,
        ],
        'embed' => [
            'src'    => true,
            'type'   => true,
            'width'  => true,
            'height' => true,
        ],
        'object' => [
            'data'   => true,
            'type'   => true,
            'width'  => true,
            'height' => true,
        ],
        'param' => [
            'name'  => true,
            'value' => true,
        ],
        'div' => [
            'class' => true,
            'id'    => true,
            'style' => true,
        ],
        'span' => [
            'class' => true,
            'id'    => true,
            'style' => true,
        ],
        'a' => ['href' => true, 'target' => true, 'rel' => true],
        'p' => []
    ];

    return wp_kses( $content, $allowed_html );

}
if ( ! function_exists( 'ut_get_video_player' ) ) :

	function ut_get_video_player() {
        if( !wp_verify_nonce( $_POST['nonce'], 'ut-video-nonce' ) ) {
            die();
        }
        /* get video to check */
        $video = filter_input( INPUT_POST, 'video', FILTER_SANITIZE_URL );
		if( !filter_var( $video, FILTER_VALIDATE_URL ) ) {
            $video = '';
        } else {
            $video = str_replace('[', '', $video);
            $video = str_replace(']', '', $video);
        }

        /* needed variables */
        $embed_code = NULL;
        
        /* check if youtube has been used */
        preg_match('~(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})[a-z0-9;:@#?&%=+\/\$_.-]*~i', trim($video) , $matches);        
            
        if( !empty($matches[1]) ) {
            $embed_code = '<iframe height="315" width="560" src="//www.youtube.com/embed/'.trim($matches[1]).'?wmode=transparent&vq=hd720&rel=0&autoplay=1&enablejsapi=1" allow="autoplay; fullscreen" frameborder="0"></iframe>';
        }

        // check for twitch
        $twitch_type = ut_get_twitch_video_type( trim($video) );

        if( !empty( $twitch_type ) ) {

            preg_match( $twitch_type['regex'], trim($video), $matches );

            if( !empty( $matches[$twitch_type['index']] ) ) {

                $channelName = $matches[$twitch_type['index']];

                switch( $twitch_type['type'] ) {

                    case 'clip':
                        $src         = 'https://clips.twitch.tv/embed?clip=' . esc_attr( $channelName ). '&autoplay=true';
                        $attr        = 'scrolling="no" frameborder="0" allowfullscreen="true"';
                        break;

                    case 'video':
                        $src         = 'https://player.twitch.tv/?video=' . esc_attr( $channelName );
                        $attr        = 'scrolling="no" frameborder="0" allowfullscreen="true"';
                        break;

                    case 'channel':
                        $src         = 'https://player.twitch.tv/?channel=' . esc_attr( $channelName );
                        $attr        = 'scrolling="no" frameborder="0" allowfullscreen="true"';
                        break;

                }

                if( !empty( $src ) ) {

                    $embed_code = '<iframe height="315" width="560" src="' . $src . '" ' . $attr . '></iframe>';

                }

            }

        }

        /* try to load video player */
        if( empty( $embed_code )) {

            if( strpos( trim($video), '.mp4' ) !== false || strpos( trim($video), '.m4v' ) !== false ) {

                $embed_code = do_shortcode('[ut_simple_html5_video controls="true" mp4="' . stripslashes($video) . '"]');

            }

        }

        /* no video found so far , try to create a player  */
        if( empty($embed_code) ) {
            
            $video_embed = wp_oembed_get(trim($video));
            if( !empty($video_embed) ) {
                $embed_code = $video_embed;            
            }
            
        }
        
        /* still no video found , let's try to apply a shortcode */
        if( empty($embed_code) ) {
            $embed_code = do_shortcode(stripslashes($video));
        }



        echo ut_kses_player($embed_code);
        
        die(1);
        
    }
    
endif;

add_action( 'wp_ajax_nopriv_ut_get_video_player', 'ut_get_video_player' );
add_action( 'wp_ajax_ut_get_video_player', 'ut_get_video_player' );
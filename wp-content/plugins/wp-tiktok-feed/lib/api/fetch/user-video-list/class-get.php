<?php

namespace QuadLayers\TTF\Api\Fetch\User_Video_List;

use QuadLayers\TTF\Api\Fetch\Base;

/**
 * API_Fetch_User_Video_List Class extends Base
 */
class Get extends Base {

	/**
	 * Function to get response and parse to data
	 *
	 * @param array $args Args to get response with.
	 * @return array
	 */
	public function get_data( $args = null ) {
		$response = $this->get_response( $args );
		if ( isset( $response['code'], $response['message'] ) ) {
			return $response;
		}
		$data = $this->response_to_data( $response );
		return $data;
	}

	/**
	 * Function to query TikTok API v2 to get user video list.
	 *
	 * @param array $args Args to set query.
	 * @return array
	 */
	public function get_response( $args = null ) {
		$fields = 'id,create_time,cover_image_url,share_url,video_description,duration,height,width,title,embed_html,embed_link,like_count,comment_count,share_count,view_count';
		$url = 'https://open.tiktokapis.com/v2/video/list/?fields=' . urlencode( $fields );
		$access_token = $this->get_access_token( $args );
		
		$body_params = array();
		
		$cursor = $this->get_cursor( $args );
		if ( ! empty( $cursor ) ) {
			$body_params['cursor'] = intval( $cursor );
		}
		
		$max_count = $this->get_max_count( $args );
		if ( $max_count > 0 ) {
			$body_params['max_count'] = $max_count;
		}
		
		$body = wp_json_encode( $body_params );

		$response = wp_remote_post(
			$url,
			array(
				'body'    => $body,
				'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
					'Content-Type' => 'application/json',
				),
			)
		);

		$response = $this->handle_response( $response );

		return $response;
	}

	/**
	 * Function to build query url.
	 *
	 * @return string
	 */
	public function get_url() {
		// No longer used - direct API call
		return 'https://open.tiktokapis.com/v2/video/list/';
	}

	/**
	 * Function to parse response to usable data.
	 *
	 * @param array $response Raw response from tiktok.
	 * @return array
	 */
	public function response_to_data( $response = null ) {

		if ( ! isset( $response['data']['videos'] ) ) {
			throw new \Exception( esc_html__( 'The current feed has no videos.', 'wp-tiktok-feed' ), 404 );
		}

		$videos_data = $response['data']['videos'];

		$videos_array = array();

		foreach ( $videos_data as $video ) {

			if ( ! isset( $video['id'] ) ) {
				continue;
			}

			$share_url = isset( $video['share_url'] ) ? $video['share_url'] : '';
			$url_encode        = base64_encode( $share_url );
			$download_url_ajax = admin_url( "admin-ajax.php?action=qlttf-download&url={$url_encode}&video_id={$video['id']}&source=username" );

			$video_description = isset( $video['video_description'] ) ? $video['video_description'] : '';
			preg_match_all(
				'/(?=#)(.*?)(?=\s)+/',
				htmlspecialchars( $video_description ),
				$tags
			);
			$videos_array[] = array(
				'id'                => $video['id'],
				'create_time'       => isset( $video['create_time'] ) ? $video['create_time'] : 0,
				'cover_image_url'   => isset( $video['cover_image_url'] ) ? $video['cover_image_url'] : '',
				'share_url'         => $share_url,
				'title'             => isset( $video['title'] ) ? $video['title'] : '',
				'video_description' => preg_replace_callback(
					'/(?=#)(.*?)(?=\s)+/',
					function ( $tag ) {
						$tag = str_replace( '#', '', $tag[1] );
						return '<a target="_blank" href="' . QLTTF_TIKTOK_URL . '/tag/' . $tag . '">#' . $tag . '</a>';
					},
					htmlspecialchars( $video_description )
				),
				'tags'              => isset( $tags[0] ) ? $tags[0] : array(),
				'likes_count'       => isset( $video['like_count'] ) ? $video['like_count'] : 0,
				'comments_count'    => isset( $video['comment_count'] ) ? $video['comment_count'] : 0,
				'views_count'       => isset( $video['view_count'] ) ? $video['view_count'] : 0,
				'video_url'         => '',
				'download_url'      => $download_url_ajax,
				'height'            => isset( $video['height'] ) ? $video['height'] : 0,
				'width'             => isset( $video['width'] ) ? $video['width'] : 0,
				'date'              => isset( $video['create_time'] ) ? date_i18n( 'j F, Y', $video['create_time'] ) : '',
				'embed_html'        => isset( $video['embed_html'] ) ? $video['embed_html'] : '',
				'embed_link'        => isset( $video['embed_link'] ) ? $video['embed_link'] : '',
			);
		}

		return $videos_array;
	}

	/**
	 * Get access token from arguments or request parameters
	 *
	 * @param array $args Arguments passed to the method.
	 * @return string
	 */
	private function get_access_token( $args = null ) {
		if ( isset( $args['access_token'] ) ) {
			return sanitize_text_field( $args['access_token'] );
		}
		// Fallback to request parameters
		return isset( $_REQUEST['access_token'] ) ? sanitize_text_field( $_REQUEST['access_token'] ) : '';
	}

	/**
	 * Get cursor from arguments or request parameters
	 *
	 * @param array $args Arguments passed to the method.
	 * @return string
	 */
	private function get_cursor( $args = null ) {
		if ( isset( $args['cursor'] ) ) {
			return sanitize_text_field( $args['cursor'] );
		}
		// Fallback to request parameters
		return isset( $_REQUEST['cursor'] ) ? sanitize_text_field( $_REQUEST['cursor'] ) : '';
	}

	/**
	 * Get max_count from arguments or request parameters
	 *
	 * @param array $args Arguments passed to the method.
	 * @return int
	 */
	private function get_max_count( $args = null ) {
		if ( isset( $args['max_count'] ) ) {
			return intval( $args['max_count'] );
		}
		// Fallback to request parameters
		return isset( $_REQUEST['max_count'] ) ? intval( $_REQUEST['max_count'] ) : 20;
	}
}

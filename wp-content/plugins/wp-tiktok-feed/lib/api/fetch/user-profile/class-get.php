<?php

namespace QuadLayers\TTF\Api\Fetch\User_Profile;

use QuadLayers\TTF\Api\Fetch\Base;

/**
 * API_Fetch_User_Profile Class extends Base
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
	 * Function to query TikTok API v2.
	 *
	 * @param array $args Args to set query.
	 * @return array
	 */
	public function get_response( $args = null ) {
		$url = 'https://open.tiktokapis.com/v2/user/info/';
		$access_token = $this->get_access_token( $args );
		
		$query_params = array(
			'fields' => 'open_id,union_id,avatar_url,display_name,username,bio_description,profile_deep_link'
		);
		
		$url_with_params = add_query_arg( $query_params, $url );

		$response = wp_remote_get(
			$url_with_params,
			array(
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
	 * Function to parse response to usable data.
	 *
	 * @param array $response Raw response from tiktok.
	 * @return array
	 */
	public function response_to_data( $response = null ) {
		if ( isset( $response['data']['user'] ) ) {
			$user = $response['data']['user'];
			$response = array(
				'username'  => isset( $user['username'] ) ? $user['username'] : null,
				'nickname'  => isset( $user['display_name'] ) ? $user['display_name'] : null,
				'link'      => isset( $user['profile_deep_link'] ) ? $user['profile_deep_link'] : null,
				'biography' => isset( $user['bio_description'] ) ? $user['bio_description'] : null,
				'avatar'    => isset( $user['avatar_url'] ) ? $user['avatar_url'] : null,
			);
		}
		return $response;
	}

	/**
	 * Function to build query url.
	 *
	 * @return string
	 */
	public function get_url() {
		// No longer used - direct API call
		return 'https://open.tiktokapis.com/v2/user/info/';
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
}

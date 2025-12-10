<?php

namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Feeds;

use QuadLayers\TTF\Models\Feeds as Models_Feed;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;
use WP_REST_Server;

class Create extends Base {

	protected static $rest_route = 'feeds';

	public function callback( \WP_REST_Request $request ) {
		try {
			$body = json_decode( $request->get_body(), true );

			if ( empty( $body['feed'] ) ) {
				throw new \Exception( esc_html__( 'Feed notset.', 'wp-tiktok-feed' ), 412 );
			}

			$feed = ( new Models_Feed() )->create( $body['feed'] );

			if ( ! $feed ) {
				throw new \Exception( esc_html__( 'Unknown error', 'wp-tiktok-feed' ), 500 );
			}

			return $this->handle_response( $feed );

		} catch ( \Exception $e ) {
			$response = array(
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
			);
			return $this->handle_response( $response );
		}
	}

	public static function get_rest_args() {
		return array( 'feed' => array( 'required' => true ) );
	}

	public static function get_rest_method() {
		return WP_REST_Server::CREATABLE;
	}

	public function get_rest_permission() {
		return current_user_can( 'manage_options' );
	}
}

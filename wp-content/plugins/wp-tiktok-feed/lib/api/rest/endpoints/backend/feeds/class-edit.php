<?php
namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Feeds;

use QuadLayers\TTF\Models\Feeds as Models_Feed;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;

/**
 * API_Rest_Feeds_Edit Class
 */
class Edit extends Base {

	protected static $rest_route = 'feeds';

	public function callback( \WP_REST_Request $request ) {

		try {
			$body = json_decode( $request->get_body(), true );

			if ( empty( $body['feed'] ) ) {
				throw new \Exception( esc_html__( 'Feed notset.', 'wp-tiktok-feed' ), 412 );
			}

			$feed = $body['feed'];

			$models_feeds = new Models_Feed();

			$feeds = $models_feeds->update( $feed['id'], $feed );

			if ( ! $feeds ) {
				throw new \Exception( esc_html__( 'Feed cannot be updated', 'wp-tiktok-feed' ), 412 );
			}

			return $this->handle_response( $feeds );
		} catch ( \Exception $e ) {
			$response = array(
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
			);
			return $this->handle_response( $response );
		}
	}

	public static function get_rest_args() {
		return array();
	}

	public static function get_rest_method() {
		return \WP_REST_Server::EDITABLE;
	}

	public function get_rest_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}
		return true;
	}
}

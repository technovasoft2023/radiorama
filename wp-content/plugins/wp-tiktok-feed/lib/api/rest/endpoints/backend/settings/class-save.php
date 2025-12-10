<?php
namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Settings;

use QuadLayers\TTF\Models\Settings as Models_Settings;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;

/**
 * API_Rest_Setting_Save Class
 */
class Save extends Base {

	protected static $rest_route = 'settings';

	public function callback( \WP_REST_Request $request ) {

		try {
			$body = $request->get_body();

			$settings = json_decode( stripslashes( $body ), true );

			if ( ! is_array( $settings ) ) {
				throw new \Exception( esc_html__( 'Settings not saved.', 'wp-tiktok-feed' ), 412 );
			}

			$models_settings = new Models_Settings();

			$success = $models_settings->save( $settings );

			if ( ! $success ) {
				throw new \Exception( esc_html__( 'Unknown error.', 'wp-tiktok-feed' ), 412 );
			}

			return $this->handle_response( $success );
		} catch ( \Exception $e ) {
			$response = array(
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
			);
			return $this->handle_response( $response );
		}
	}

	public static function get_rest_method() {
		return \WP_REST_Server::CREATABLE;
	}

	public function get_rest_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}
		return true;
	}
}

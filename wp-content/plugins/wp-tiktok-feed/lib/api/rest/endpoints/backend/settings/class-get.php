<?php
namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Settings;

use QuadLayers\TTF\Models\Settings as Models_Settings;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;

/**
 * API_Rest_Setting_Get Class
 */

class Get extends Base {

	protected static $rest_route = 'settings';

	public function callback( \WP_REST_Request $request ) {

		try {

			$models_settings = new Models_Settings();

			$settings = $models_settings->get();

			if ( null === $settings ) {
				return $this->handle_response( array() );
			}

			return $this->handle_response( $settings );
		} catch ( \Exception $e ) {
			$response = array(
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
			);
			return $this->handle_response( $response );
		}
	}

	public static function get_rest_method() {
		return \WP_REST_Server::READABLE;
	}
	public function get_rest_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}
		return true;
	}
}

<?php
namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Accounts;

use QuadLayers\TTF\Models\Accounts as Models_Account;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;
use QuadLayers\TTF\Utils\Cache;

/**
 * API_Rest_Accounts_Delete Class
 */
class Delete extends Base {

	protected static $rest_route = 'accounts';

	protected $profile_cache_key = 'profile';

	public function callback( \WP_REST_Request $request ) {

		try {
			$open_id = $request->get_param( 'open_id' ) ? trim( $request->get_param( 'open_id' ) ) : null;

			$models_account = new Models_Account();

			$success = $models_account->delete( $open_id );

			if ( ! $success ) {
				throw new \Exception( esc_html__( 'Can\'t delete account; open_id not found.', 'wp-tiktok-feed' ), 404 );
			}

			$cache_key = "{$this->profile_cache_key}_{$open_id}";

			$cache_engine = new Cache( 6, true, $cache_key );

			$cache_engine->delete( $cache_engine );

			return $this->handle_response( $success );

		} catch ( \Exception $e ) {
			$response = array(
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
			);
			return $this->handle_response( $response );
		}
	}

	public static function get_rest_args() {
		return array(
			'open_id' => array(
				'required' => true,
				'type'     => 'string',
			),
		);
	}

	public static function get_rest_method() {
		return \WP_REST_Server::DELETABLE;
	}

	public function get_rest_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}
		return true;
	}
}

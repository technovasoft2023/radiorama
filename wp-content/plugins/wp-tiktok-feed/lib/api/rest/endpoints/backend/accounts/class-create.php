<?php
namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Accounts;

use QuadLayers\TTF\Models\Accounts as Models_Account;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;

/**
 * API_Rest_Accounts_Create Class
 */
class Create extends Base {

	protected static $rest_route = 'accounts';

	public function callback( \WP_REST_Request $request ) {

		try {
			$body = json_decode( $request->get_body() );

			if ( empty( $body->refresh_token ) ) {
				throw new \Exception( esc_html__( 'refresh_token not set.', 'wp-tiktok-feed' ), 412 );
			}

			$refresh_token = $body->refresh_token;

			$models_account = new Models_Account();

			$account_data = array(
				'refresh_token' => $refresh_token,
			);
			$account_data = Models_Account::renew_access_token( $refresh_token );

			$account = $models_account->create( (array) $account_data );

			if ( ! isset( $account['open_id'] ) ) {
				throw new \Exception( $account['message'], $account['code'] );
			}

			return $this->handle_response( $account );

		} catch ( \Exception $e ) {
			$response = array(
				'code'    => $e->getCode(),
				'message' => $e->getMessage(),
			);
			return $this->handle_response( $response );
		}
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

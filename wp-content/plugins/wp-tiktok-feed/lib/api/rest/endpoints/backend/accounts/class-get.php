<?php
namespace QuadLayers\TTF\Api\Rest\Endpoints\Backend\Accounts;

use QuadLayers\TTF\Models\Accounts as Models_Account;
use QuadLayers\TTF\Api\Rest\Endpoints\Base;

/**
 * API_Rest_Accounts_Get Class
 */
class Get extends Base {

	protected static $rest_route = 'accounts';

	public function callback( \WP_REST_Request $request ) {
		try {
			$models_account = new Models_Account();

			$open_id = $request->get_param( 'open_id' ) ? trim( $request->get_param( 'open_id' ) ) : null;

			if ( ! $open_id ) {

				$accounts = $models_account->get_all();

				if ( null !== $accounts && 0 !== count( $accounts ) ) {
					return $this->handle_response( $accounts );
				}

				return $this->handle_response( array() );
			}

			$account = $models_account->get( $open_id );

			if ( ! $account ) {
				throw new \Exception( sprintf( esc_html__( 'Account %s not found', 'wp-tiktok-feed' ), $open_id ), 404 );
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

	public static function get_rest_args() {
		return array(
			'open_id' => array(
				'required' => false,
			),
		);
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

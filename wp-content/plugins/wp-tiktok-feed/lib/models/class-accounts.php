<?php

namespace QuadLayers\TTF\Models;

use QuadLayers\TTF\Utils\Helpers;
use QuadLayers\WP_Orm\Builder\CollectionRepositoryBuilder;

/**
 * Models_Feed Class
 */
class Accounts {

	protected static $instance;
	protected $repository;
	/**
	 * Set the max attemps to renew access_token to prevents API abuse.
	 *
	 * @var integer
	 */
	protected static $access_token_max_renew_attemps = 3;

	public function __construct() {

		$builder = ( new CollectionRepositoryBuilder() )
		->setTable( 'tiktok_feed_accounts' )
		->setEntity( 'QuadLayers\TTF\Entity\Account' )
		->setAutoIncrement( false );

		$this->repository = $builder->getRepository();
	}

	public function get_table() {
		return $this->repository->getTable();
	}

	public function get_args() {
		$entity   = new \QuadLayers\TTF\Entity\Account();
		$defaults = $entity->getDefaults();
		return $defaults;
	}

	public function get( string $open_id ) {
		$entity = $this->repository->find( $open_id );

		if ( ! $entity ) {
			return;
		}

		$is_access_token_expired = self::is_access_token_expired( $entity->getProperties() );

		if ( ! $is_access_token_expired ) {
			return $entity->getProperties();
		}

		/**
		 * If access_token is renewed return updated account
		 */
		if ( $this->validate_access_token( $entity->getProperties() ) ) {
			$entity = $this->repository->find( $open_id );
		}

		return $entity->getProperties();
	}

	public function delete( string $open_id ) {
		return $this->repository->delete( $open_id );
	}

	public function update( string $open_id, array $account ) {

		$entity = $this->repository->update( $open_id, $account );

		if ( $entity ) {
			return $entity->getProperties();
		}
	}

	public function create( array $account ) {
		if ( isset( $account['hashtag'] ) ) {
			$account['hashtag'] = Helpers::get_sanitized_username( $account['hashtag'] );
		}
		if ( isset( $account['username'] ) ) {
			$account['username'] = Helpers::get_sanitized_username( $account['username'] );
		}
		$account['api_version'] = 'V2';
		// Set access_token_expiration_date
		$account['access_token_expiration_date'] = self::calculate_expiration_date( $account['access_token_expires_in'] );
		// Set refresh_token_expiration_date
		$account['refresh_token_expiration_date'] = self::calculate_expiration_date( $account['refresh_token_expires_in'] );

		$entity = $this->repository->create( $account );

		if ( ! $entity ) {
			throw new \Exception( 'Error creating account', 400 );
		}
		return $entity->getProperties();
	}

	public function get_all() {
		$entities = $this->repository->findAll();
		if ( ! $entities ) {
			return;
		}
		$accounts = array();
		foreach ( $entities as $entity ) {
			$accounts[] = $entity->getProperties();
		}
		return $accounts;
	}

	public function delete_all() {
		return $this->repository->deleteAll();
	}

	public static function calculate_expiration_date( $expires_in ) {
		$expires_in = is_numeric( $expires_in ) ? $expires_in : 0;
		return strtotime( current_time( 'mysql' ) ) + $expires_in - 1;
	}

	protected static function is_access_token_expired( $account ) {
		if ( $account['access_token_expiration_date'] - strtotime( current_time( 'mysql' ) ) < 0 ) {
			return true;
		}
		return false;
	}

	protected function validate_access_token( $account ) {

		/**
		 * Checks if $account has already reached maximum attempts possible.
		 */
		if ( self::access_token_renew_attemps_exceded( $account ) ) {
			return false;
		}

		$response = self::renew_access_token( $account['refresh_token'] );

		/**
		 *  Checks if $response has setted error, access_token_expires_in and access_token.
		 */

		if ( isset( $response->error ) || ! isset( $response->access_token_expires_in ) || ! isset( $response->access_token ) ) {
			$this->access_token_renew_attemps_increase( $account );
			return false;
		}

		// Checks if $account['access_token'] has expired.
		if ( $account['access_token_expiration_date'] >= self::calculate_expiration_date( $response->access_token_expires_in ) ) {
			return false;
		}

		$account['access_token_renew_atemps']     = 0;
		$account['access_token']                  = $response->access_token;
		$account['refresh_token']                 = $response->refresh_token;
		$account['access_token_expiration_date']  = self::calculate_expiration_date( $response->access_token_expires_in );
		$account['refresh_token_expiration_date'] = self::calculate_expiration_date( $response->refresh_token_expires_in );
		$account                                  = $this->update( $account['open_id'], $account );

		if ( $account ) {
			return $account;
		}

		return false;
	}

	/**
	 * Function: renew_access_token():
	 * renew all user data querying from tiktok
	 *
	 * @param string $refresh_token - user refresh_token.
	 * @return object
	 */
	public static function renew_access_token( $refresh_token ) {

		$args = array(
			'refresh_token' => $refresh_token,
		);

		$new_user_data = wp_remote_post(
			'https://tiktokfeedv2.quadlayers.com/refreshToken',
			array(
				'method'  => 'POST',
				'timeout' => 45,
				'body'    => json_encode( $args ),
			)
		);
		$new_user_data = json_decode( $new_user_data['body'] );

		return $new_user_data;
	}

	public static function access_token_renew_attemps_exceded( $account ) {
		if ( intval( $account['access_token_renew_atemps'] ) > self::$access_token_max_renew_attemps ) {
			return true;
		}
		return false;
	}

	protected function access_token_renew_attemps_increase( $account ) {
		$account['access_token_renew_atemps'] = intval( $account['access_token_renew_atemps'] ) + 1;
		$this->update( $account['open_id'], $account );
	}

	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}

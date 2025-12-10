<?php
namespace QuadLayers\TTF\Entity;

use QuadLayers\WP_Orm\Entity\CollectionEntity;

class Account extends CollectionEntity {
	/**
	 * Unique public user id.
	 *
	 * @var string
	 */
	public static $primaryKey      = 'open_id'; //phpcs:ignore
	public $open_id                       = '';
	public $access_token                  = ''; // Private user access_token.
	public $access_token_expiration_date  = 0;  // Date when access_token expires.
	public $access_token_renew_atemps     = 0;  // Count attemps to renew access_token.
	public $refresh_token                 = ''; // Private user refresh_token to update access_token.
	public $refresh_token_expiration_date = 0;  // Date when refresh_token expires.
	public $api_version                   = 'V1'; // API version.
}

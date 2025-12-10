<?php

namespace QuadLayers\TTF\Controllers;

use QuadLayers\TTF\Utils\Helpers;
use QuadLayers\TTF\Models\Feeds as Models_Feed;
use QuadLayers\TTF\Models\Accounts as Models_Account;
use QuadLayers\TTF\Controllers\Frontend;

class Gutenberg {

	protected static $instance;
	protected static $slug = QLTTF_DOMAIN . '_feeds';

	private function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'register_assets' ) );
		add_action( 'init', array( $this, 'register_block' ) );
	}

	public function register_assets() {
		Frontend::instance()->register_scripts();
		$gutenberg = include QLTTF_PLUGIN_DIR . 'build/gutenberg/js/index.asset.php';
		wp_register_style( 'qlttf-gutenberg-editor', plugins_url( '/build/gutenberg/css/editor.css', QLTTF_PLUGIN_FILE ), array(), QLTTF_PLUGIN_VERSION );
		wp_register_script( 'qlttf-gutenberg', plugins_url( '/build/gutenberg/js/index.js', QLTTF_PLUGIN_FILE ), $gutenberg['dependencies'], $gutenberg['version'], true );
		wp_localize_script(
			'qlttf-gutenberg',
			'qlttf_gutenberg',
			array(
				'image_url'         => plugins_url( '/assets/backend/img', QLTTF_PLUGIN_FILE ),
				'access_token_link' => Helpers::get_access_token_link(),
			)
		);
	}

	public function register_block() {
		register_block_type(
			'qlttf/box',
			array(
				'attributes'      => $this->get_attributes(),
				'render_callback' => array( $this, 'render_callback' ),
				'editor_style'    => array( 'qlttf-swiper', 'qlttf-frontend', 'qlttf-gutenberg-editor' ),
				'editor_script'   => array( 'qlttf-swiper', 'masonry', 'qlttf-frontend', 'qlttf-gutenberg' ),
			)
		);
	}

	public function render_callback( $feed, $content, $block = array() ) {
		$block = (object) $block;
		return Frontend::instance()->create_shortcode( $feed );
	}

	protected function get_attributes() {
		$models_feeds = new Models_Feed();
		$feed_arg     = $models_feeds->get_args();
		$attributes   = array();

		foreach ( $feed_arg as $id => $value ) {
			$attributes[ $id ] = array(
				'type'    => array( 'string', 'object', 'array', 'boolean', 'number', 'null' ),
				'default' => $value,
			);
		}

		return $attributes;
	}

	protected function get_name_accounts() {

		$profile = array();

		$models_account = new Models_Account();
		$accounts       = $models_account->get_all();

		if ( $accounts ) {
			foreach ( $accounts as $account_id => $account ) {
				$profile[ $account_id ] = array( 'open_id' => $account['open_id'] );
			}
		}
		return $profile;
	}

	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}

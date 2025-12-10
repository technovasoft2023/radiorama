<?php

namespace QuadLayers\TTF;

use QuadLayers\TTF\Models\Accounts as Models_Account;

final class Plugin {

	protected static $instance;

	private function __construct() {
		/**
		 * Load plugin textdomain.
		 */
		add_action( 'init', array( $this, 'load_textdomain' ) );
		/**
		 * Load plugin classes.
		 */
		Api\Rest\Routes_Library::instance();
		Controllers\Admin::instance();
		Controllers\Frontend::instance();
		Controllers\Gutenberg::instance();
		/**
		 * Load plugin functions.
		 */
		do_action( 'qlttf_init' );
		add_action( 'admin_notices', array( $this, 'add_new_api_notice' ) );
	}

	public function load_textdomain() {
		load_plugin_textdomain( 'wp-tiktok-feed', false, QLTTF_PLUGIN_DIR . '/languages/' );
	}

	public function add_new_api_notice() {
		$models_account = new Models_Account();

		$accounts = $models_account->get_all();

		if ( empty( $accounts ) ) {
			return;
		}

		$old_accounts = array_filter(
			$accounts,
			function ( $account ) {
				return ! isset( $account['api_version'] ) || 'V2' !== $account['api_version'];
			}
		);

		if ( ! count( $old_accounts ) ) {
			return;
		}

		$accounts_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'admin.php?page=qlttf_backend&tab=accounts' ) ),
			esc_html__( 'Accounts', 'wp-tiktok-feed' )
		);

		$feeds_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'admin.php?page=qlttf_backend&tab=feeds' ) ),
			esc_html__( 'Feeds', 'wp-tiktok-feed' )
		);
		?>

		<div class="notice notice-error is-dismissible">
			<p>
				<b>
					<?php echo esc_html__( 'TikTok Feed update: NEW TIKTOK API V2!', 'wp-tiktok-feed' ); ?>
				</b>
			</p>
			<p>
				<?php echo esc_html__( 'TikTok has changed it\'s API and now it requires a new login to get the new API token. This is a mandatory change and it will affect all TikTok Feed users.', 'wp-tiktok-feed' ); ?>
			</p>
			<p>
				<?php echo esc_html__( 'Please follow the following instructions to update your feeds correctly:', 'wp-tiktok-feed' ); ?>
			</p>
			<ol>
				<li>
					<?php printf( esc_html__( 'Go to TikTok Feed %s page and delete the previously mentioned accounts.', 'wp-tiktok-feed' ), $accounts_link ); ?>
				</li>
				<li>
					<?php printf( esc_html__( 'Go to TikTok Feed %s page and click on "Edit" to the corresponding feeds, then select in Account field the new correct account and save it.', 'wp-tiktok-feed' ), $feeds_link ); ?>
				</li>
			</ol>
		</div>
		<?php
	}

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}

Plugin::instance();

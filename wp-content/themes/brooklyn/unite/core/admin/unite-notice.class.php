<?php if (!defined('ABSPATH')) {
    exit; // exit if accessed directly
}

class UT_Notice {
    protected $notification_api_url = 'https://licensing.wp-brooklyn.com/notifications';

    public $user_notice_close_list = 'ut_notice_close_list';

    public function __construct() {
        add_action( 'admin_init', [
            $this,
            'init',
        ] );
        add_action( 'wp_ajax_ut_add_notice_to_close_list', [ $this, 'add_notice_to_close_list' ] );
    }

    public function init(): void {
        $notice_list = $this->get_notices();
        $this->show_notices( $notice_list );
    }

    public function show_notices( $list ): void {
        if( empty( $list ) || ! is_array( $list ) ) {
            return;
        }
        if( $this->is_no_notices( $list ) ) {
            return;
        }

        $enqueue_assets = false;
        foreach ( $list as $notice ) {
            if ( ! $this->is_notice_valid( $notice ) ) {
                continue;
            }
            if ( ! $this->is_show_notice( $notice['id'] ) ) {
                continue;
            }

            $this->output_notice( $notice );
            $enqueue_assets = true;
        }
        if( $enqueue_assets ) {
            add_action( 'admin_notices', function () {
                get_template_part( 'unite/core/admin/templates/notice', 'assets' );
            } );
        }
    }

    public function is_notice_valid( $notice ) {
        if ( empty( $notice ) || ! is_array( $notice ) ) {
            return false;
        }
        if( ! isset( $notice['id'] ) ) {
            return false;
        }
        if( ! isset( $notice['title'] ) || ! isset( $notice['text'] ) ) {
            return false;
        }

        return true;
    }

    public function is_show_notice( $notice_id ) {
        $notice_close_list = get_user_meta( get_current_user_id(), $this->user_notice_close_list, true );
        if ( empty( $notice_close_list ) ) {
            return true;
        }

        $notice_close_list = is_string( $notice_close_list ) ? json_decode( $notice_close_list ) : [];

        return ! ( is_array( $notice_close_list ) && in_array( $notice_id, $notice_close_list ) );
    }


    public function output_notice( $notice ) {
        add_action( 'admin_notices', function () use ( $notice ) {
            get_template_part( 'unite/core/admin/templates/notice', '', [
                'notice'        => $notice
            ] );
        } );
    }

    public function get_notices(): array {
        $notices = get_transient( 'ut_notice_list' );

        if( $this->is_no_notices( $notices ) ) {
            return [];
        }
        if( ! $this->is_list_valid( $notices ) ) {
            $notices = $this->get_notices_from_api();
            if( empty( $notices ) ) {
                return [];
            }
            $this->save_notices( $notices );
        }

        return json_decode( $notices, true );
    }

    public function is_no_notices( $list ): bool {
        return is_array( $list ) && isset( $list['empty_notices'] );
    }

    public function is_list_valid( $list ): bool {
        if( empty( $list ) ) {
            return false;
        }

        if( ! is_string( $list ) ) {
            return false;
        }

        json_decode( $list );
        return json_last_error() === JSON_ERROR_NONE;
    }

    public function get_notices_from_api() {
        global $ut_theme_license;
        $empty_list = '';

        $api = add_query_arg( [
            'theme_version'     => UT_THEME_VERSION,
            'core_version'      => defined( 'UT_CORE_VERSION' ) ? UT_CORE_VERSION : 0,
            'shortcode_version' => defined( 'UT_SHORTCODES_VERSION' ) ? UT_SHORTCODES_VERSION : 0,
            'purchase_code'     => get_option('envato_purchase_code_' . $ut_theme_license->item_id)
        ], $this->notification_api_url );

        $response = wp_remote_get(
            $api, [ 'timeout'   => 30,]
        );
        if( is_wp_error( $response ) ) {
            return $empty_list;
        }

        if ( wp_remote_retrieve_response_code( $response ) !== 200 ) {
            return $empty_list;
        }

        $response_body = wp_remote_retrieve_body( $response );

        if( $this->is_list_valid( $response_body ) ) {
            $list = $response_body;
        } else {
            $list = $empty_list;
        }

        return $list;

    }

    public function save_notices( $list ) {
        if( ! $this->is_list_valid( $list ) ) {
            $empty = [ 'empty_notices'  => true ];
            set_transient( 'ut_notice_list', $empty, 12 * HOUR_IN_SECONDS );
            return;
        }

        set_transient( 'ut_notice_list', $list, 12 * HOUR_IN_SECONDS );
    }

    public function add_notice_to_close_list() {
        if( ! wp_verify_nonce( $_POST['nonce'], 'ut-notice' ) ) {
            die();
        }
        $notice_id = filter_input( INPUT_POST, 'notice_id', FILTER_SANITIZE_SPECIAL_CHARS );
        if( empty( $notice_id ) ) {
            wp_send_json_error( false );
        };
        $is_set = $this->save_close_notice_to_user( $notice_id );
        if( $is_set ) {
            wp_send_json_success(true);
        } else {
            wp_send_json_error(false);
        }
    }

    public function save_close_notice_to_user( $notice_id ) {
        $user_id = get_current_user_id();
        $notice_list = json_decode( get_user_meta( $user_id, $this->user_notice_close_list, true ) );
        if ( ! is_array( $notice_list ) ) {
            $notice_list = [];
        }
        $notice_id = esc_attr( $notice_id );
        if ( ! in_array( $notice_id, $notice_list ) ) {
            $notice_list[] = $notice_id;
        }

        return update_user_meta( $user_id, $this->user_notice_close_list, wp_json_encode( $notice_list ) );
    }
}
new UT_Notice();
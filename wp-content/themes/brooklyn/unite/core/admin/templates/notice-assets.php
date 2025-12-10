<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( '-1' );
}
?>

<style>
    .ut-notice {
        position: relative;
        display:flex;
        gap: 20px;
        align-items: center;
        margin: 0;
        padding: 20px;
    }
    .ut-notice-image > img {
        width: 100px;
        height: 100px;
    }
    .ut-notice-text {
        color: #656565;
    }
    .ut-notice .ut-notice-text .title {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
        padding: 0;
    }
    .ut-notice .ut-notice-text .ut-notice-context {
        font-size: 16px;
        margin: 6px 0 14px 0;
    }
    .ut-notice-text button {
        border: none;
        margin: 0;
        padding: 10px 15px;
        text-align: inherit;
        font: inherit;
        appearance: none;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
<script>
    window.utAdminNoticeNonce = '<?php echo esc_js( wp_create_nonce( 'ut-notice' ) ); ?>';

    (function ( $ ) {
        var addNoticeToDisableList = function ( notice_id ) {
            var data = {
                notice_id: notice_id,
                action: 'ut_add_notice_to_close_list',
                nonce: window.utAdminNoticeNonce
            };
            $.ajax( {
                type: 'POST',
                url: window.ajaxurl,
                data: data,
            }).fail( function ( response ) {
                console.error( 'Failed to add notice to disable list', response)
            });
        };

        $( document ).off( 'click.ut-notice-dismiss' ).on( 'click.ut-notice-dismiss', '.ut-notice-dismiss', function ( e ) {
            e.preventDefault();
            var $el = jQuery( this ).closest(
                '.ut-notice' );
            $el.fadeTo( 100, 0, function () {
                $el.slideUp( 100, function () {
                    $el.remove();
                } );
            } );
            addNoticeToDisableList( $el.attr('id').replace('ut-notice-', '') );
        });
        $( document ).off( 'click.ut-notice-button' ).on( 'click.ut-notice-button', '.ut-notice-button', function ( e ) {
            e.preventDefault();
            var $el = jQuery( this )

            var link = $el.attr('data-notice-link')

            if ( link ) {
                window.open(link, '_blank')
            }
        });
        $( document ).off( 'click.ut-notice-image' ).on( 'click.ut-notice-image', '.ut-notice-image', function ( e ) {
            e.preventDefault();
            var $el = jQuery( this )

            var link = $el.attr('data-notice-link')

            if ( link ) {
                window.open(link, '_blank')
            }
        });
    })( window.jQuery );
</script>

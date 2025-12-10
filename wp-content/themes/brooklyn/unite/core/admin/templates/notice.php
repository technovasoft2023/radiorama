<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( '-1' );
}
/**
 * @var array $notice
 */
$notice = $args['notice'];
?>
<div id="ut-notice-<?php esc_attr( $notice['id'] ); ?>" class="notice ut-notice notice-<?php echo esc_attr( $notice['type'] ) ?>">
    <div class="ut-notice-text">
        <?php if ( ! empty( $notice['title'] ) ) :  ?>
            <p class="title">
                <?php esc_html( $notice['title'] ); ?>
            </p>
        <?php endif; ?>
        <?php if ( ! empty( $notice['text'] ) ) :  ?>
            <div class="ut-notice-context">
                <?php esc_html( $notice['text'] ); ?>
            </div>
        <?php endif; ?>
        <?php if( ! empty( $notice['link'] ) && ! empty( $notice['link_text'] ) ): ?>
            <a target="_blank" href="<?php echo esc_url( $notice['link'] ) ?>"><?php echo esc_html( $notice['link_text'] ) ?></a>
        <?php endif; ?>
    </div>

    <button type="button" class="notice-dismiss ut-notice-dismiss">
        <span class="screen-reader-text"><?php esc_html_e( 'Dismiss this notice', 'unitedthemes' ); ?></span>
    </button>
</div>

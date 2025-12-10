<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( '-1' );
}
require_once vc_path_dir( 'EDITORS_DIR', 'navbar/class-vc-navbar-frontend.php' );

?>
<div class="vc_ui-font-open-sans vc_ui-panel-window vc_media-xs vc_ui-panel-front"
     data-vc-panel=".vc_ui-panel-header-header" data-vc-ui-element="panel-add-element" id="vc_ui-panel-add-element">
    <div class="append-mode">
        <span><span><?php esc_html_e('Manual Mode: ','js_composer') ?></span><?php esc_html_e('Click any module to add it','js_composer') ?></span>
        <button title="<?php esc_html_e('Close manual mode', 'js_composer') ?>" id="close-append-mode" class=""><i class="fa-solid fa-close"></i></button>
    </div>
    <div class="ut-vc-brand">
        <div class="wrap">
            <span class="logo"></span>
            <span class="brand-text">Brooklyn Website Builder</span>
        </div>
    </div>
    <div class="ut-toolbar">
        <?php
        // [vc_navbar frontend]
        $nav_bar = new Vc_Navbar_Frontend( $editor->post );
        $nav_bar->ut_render_toolbar();
        ?>
    </div>
    <div class="vc_ui-panel-header-actions">
        <div class="vc_ui-search-box">
            <div class="vc_ui-search-box-input">
                <input type="search" id="vc_elements_name_filter" placeholder="Search element by name">
                <label for="vc_elements_name_filter">
                    <i class="vc-composer-icon vc-c-icon-search"></i>
                </label>
            </div>
        </div>
    </div>
    <div class="vc_ui-panel-window-inner">

        <div class="vc_ui-panel-content-container" data-simplebar>
            <div class="vc_add-element-container">
                <div class="wpb-elements-list vc_filter-all" data-vc-ui-filter="*"
                     data-vc-ui-element="panel-add-element-list">
                    <ul class="wpb-content-layouts-container">
                        <li class="vc_add-element-deprecated-warning">
                            <div class="wpb_element_wrapper">
                                <?php
                                // @codingStandardsIgnoreLine
                                print vc_message_warning( esc_html__( 'Elements within this list are deprecated and are no longer supported in newer versions of WPBakery Page Builder.', 'js_composer' ) );
                                ?>
                            </div>
                        </li>
                        <li>
                            <?php
                            // @codingStandardsIgnoreLine
                            print $box->getFrontControls();
                            ?>
                        </li>
                        <?php if ( $box->isShowEmptyMessage() && true !== $box->getPartState() ) : ?>
                            <li class="vc_add-element-access-warning">
                                <div class="wpb_element_wrapper">
                                    <?php
                                    // @codingStandardsIgnoreLine
                                    print vc_message_warning( esc_html__( 'Your user role have restricted access to content elements. If required, contact your site administrator to change WPBakery Page Builder Role Manager settings for your user role.', 'js_composer' ) );
                                    ?>
                                </div>
                            </li>
                        <?php endif; ?>
                    </ul>
                    <div class="vc_clearfix"></div>
                    <?php if ( vc_user_access()->part( 'presets' )->checkStateAny( true, null )->get() ) : ?>
                        <div class="vc_align_center">
                            <span class="vc_general vc_ui-button vc_ui-button-action vc_ui-button-shape-rounded vc_ui-button-fw" data-vc-manage-elements style="display:none;"><?php esc_html_e( 'Manage elements', 'js_composer' ); ?></span>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <div class="vc_ui-controls">
        <?php
        // [vc_navbar frontend]
        $nav_bar = new Vc_Navbar_Frontend( $editor->post );
        $nav_bar->ut_render();
        ?>
    </div>
</div>

<?php
$disable_responsive = vc_settings()->get( 'not_responsive_css' );
if ( '1' !== $disable_responsive ) {
    // phpcs:ignore
    $screen_sizes = apply_filters('wpb_navbar_getControlScreenSize', array(
        array(
            'title' => esc_html__('Desktop', 'js_composer'),
            'size' => '100%',
            'key' => 'default',
            'active' => true,
        ),
        array(
            'title' => esc_html__('Tablet landscape mode', 'js_composer'),
            'size' => '1024px',
            'key' => 'landscape-tablets',
        ),
        array(
            'title' => esc_html__('Tablet portrait mode', 'js_composer'),
            'size' => '768px',
            'key' => 'portrait-tablets',
        ),
        array(
            'title' => esc_html__('Smartphone landscape mode', 'js_composer'),
            'size' => '480px',
            'key' => 'landscape-smartphones',
        ),
        array(
            'title' => esc_html__('Smartphone portrait mode', 'js_composer'),
            'size' => '320px',
            'key' => 'portrait-smartphones',
        ),
    ));
    echo '<div class="ut-responsive-control" id="ut_screen-size-control">' . '' . '<ul class="vc_dropdown-list">';
    $screen = current($screen_sizes);
    while ($screen) {
        echo '<li><a href="#" title="' . esc_attr($screen['title']) . '"' . ' class="vc_screen-width vc_icon-btn vc-composer-icon vc-c-icon-layout_' . esc_attr($screen['key']) . (isset($screen['active']) && $screen['active'] ? ' active' : '') . '" data-size="' . esc_attr($screen['size']) . '"></a></li>';
        next($screen_sizes);
        $screen = current($screen_sizes);
    }
    echo '</ul></div>';
}
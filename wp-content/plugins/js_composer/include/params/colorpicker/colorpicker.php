<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( '-1' );
}

/**
 * Param 'colorpicker' field
 *
 * @param $settings
 * @param $value
 *
 * @return string
 * @since 4.4
 */
function vc_colorpicker_form_field( $settings, $value ) {
    //return sprintf( '<div class="color-group"><div class="wpb-color-picker"></div><input name="%s" class="wpb_vc_param_value wpb-textinput %s %s_field vc_color-control vc_ui-hidden" type="text" value="%s"/></div>', $settings['param_name'], $settings['param_name'], $settings['type'], $value );
    return '<div class="color-group clearfix"><input name="' . esc_attr( $settings['param_name'] ) . '" data-mode="complex" class="wpb_vc_param_value wpb-textinput ut-gradient-picker ' . esc_attr( $settings['param_name'] ) . ' ' . esc_attr( $settings['type'] ) . '_field" type="text" value="' . esc_attr( $value ) . '" /></div>';
//    return  '<div class="ut-minicolors-wrap">
//             <input data-position="bottom left" data-mode="rgb" type="text" name="' . esc_attr( $settings['param_name'] ) . '" id="' . esc_attr( $settings['param_name'] ) . '" value="' . esc_attr( $value ) . '" class="ut-ui-form-input ut-minicolors ut-color-mode-rgb " autocomplete="off" />
//             <span class="ut-minicolors-swatch" style="background-color:' . esc_attr( $value ) . ';"></span>
//    </div>';
}

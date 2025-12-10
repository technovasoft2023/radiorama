<?php
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

if ( ! class_exists( 'WPBakeryCssEditor' ) ) {
	/**
	 * Class WPBakeryCssEditor
	 */
	class WPBakeryCssEditor {
		/**
		 * @var array
		 */
		protected $settings = array();
		/**
		 * @var string
		 */
		protected $value = '';
		/**
		 * @var array
		 */
		protected $positions = array(
			'top',
			'right',
			'bottom',
			'left',
		);
		public $params = array();

		/**
		 * Setters/Getters {{
		 *
		 * @param null $settings
		 *
		 * @return array
		 */
		public function settings( $settings = null ) {
			if ( is_array( $settings ) ) {
				$this->settings = $settings;
			}

			return $this->settings;
		}

		/**
		 * @param $key
		 *
		 * @return string
		 */
		public function setting( $key ) {
			return isset( $this->settings[ $key ] ) ? $this->settings[ $key ] : '';
		}

		/**
		 * @param null $value
		 *
		 * @return string
		 */
		public function value( $value = null ) {
			if ( is_string( $value ) ) {
				$this->value = $value;
			}

			return $this->value;
		}

		/**
		 * @param null $values
		 *
		 * @return array
		 */
		public function params( $values = null ) {
			if ( is_array( $values ) ) {
				$this->params = $values;
			}

			return $this->params;
		}

		// }}

		/**
		 * vc_filter: vc_css_editor - hook to override output of this method
		 * @return mixed
		 */
        public function render() {
            $output = '<div class="vc_css-editor vc_row vc_ui-flex-row" data-css-editor="true">';
            $output .= $this->onionLayout();
            $output .= '<div class="vc_col-xs-5 vc_settings">'
                . '    <label>' . __( 'Border color', 'js_composer' ) . '</label> '
                . '    <div class="color-group clearfix">' // @United
                . '    <input type="text" name="border_color" value="' . $this->extract_css_property( $this->value() , 'border-color', true ) . '" data-mode="complex" class="ut-gradient-picker gradient_picker_field">'// @United
                . '    </div>' // @United
                . '    <label>' . __( 'Border style', 'js_composer' ) . '</label> '
                . '    <div class="vc_border-style"><select name="border_style" class="vc_border-style">' . $this->getBorderStyleOptions() . '</select></div>'
                . '    <label>' . __( 'Border radius', 'js_composer' ) . '</label> '
                . '    <div class="vc_border-radius"><select name="border_radius" class="vc_border-radius">' . $this->getBorderRadiusOptions() . '</select></div>'
                . '    <label>' . __( 'Background', 'js_composer' ) . '</label>'
                . '    <div class="color-group clearfix">' // @United
                . '    <input type="text" name="background_color" value="' . $this->extract_css_property( $this->value() , 'background-color', true ) . '" data-mode="gradient" class="ut-gradient-picker gradient_picker_field">'// @United
                . '    </div>' // @United
                . '    <div class="vc_background-image">' . $this->getBackgroundImageControl() . '<div class="vc_clearfix"></div></div>'
                . '    <div class="vc_background-style"><select name="background_style" class="vc_background-style">' . $this->getBackgroundStyleOptions() . '</select></div>'
                . '    <label>' . __( 'Box controls', 'js_composer' ) . '</label>'
                . '    <label class="vc_checkbox"><input type="checkbox" name="simply" class="vc_simplify" value=""> ' . __( 'Simplify controls', 'js_composer' ) . '</label>'
                . '</div>';
            $output .= sprintf( '<input name="%s" class="wpb_vc_param_value  %s %s_field" type="hidden" value="%s"/>', esc_attr( $this->setting( 'param_name' ) ), esc_attr( $this->setting( 'param_name' ) ), esc_attr( $this->setting( 'type' ) ), esc_attr( $this->value() ) );

            $output .= '</div><div class="vc_clearfix"></div>';
            $custom_tag = 'script';
            $output .= '<' . $custom_tag . ' type="text/html" id="vc_css-editor-image-block"><li class="added"><div class="inner" style="width: 80px; height: 80px; overflow: hidden;text-align: center;"><img src="{{ img.url }}?id={{ img.id }}" data-image-id="{{ img.id }}" class="vc_ce-image<# if (!_.isUndefined(img.css_class)) {#> {{ img.css_class }}<# }#>">  </div><a href="#" class="vc_icon-remove"><i class="vc-composer-icon vc-c-icon-close"></i></a></li></' . $custom_tag . '>';

            return apply_filters( 'vc_css_editor', $output );
        }

        // @United
        function extract_css_property( $subject, $property, $strict = false ){

            $styles = array();
            $pattern = '/\{([^\}]*?)\}/i';
            preg_match( $pattern, $subject, $styles );

            if ( array_key_exists( 1, $styles ) ) {
                $styles = explode( ';', $styles[1] );
            }

            $new_styles = array();

            foreach ( $styles as $val ) {

                $attr = explode( ':', $val, 2 );

                if( isset( $attr[0] ) && $attr[0] == $property ) {

                    if( $property == 'background-image' ) {

                        $url = wp_extract_urls( $val );

                        if( !empty( $url[0] )  ) {

                            return $url[0];

                        }

                    }

                    // only return color value, important for gradient colorpicker
                    // @United Themes
                    if( $property == 'background-color' ) {

                        $val = str_replace("!important", "", $val);
                        $val = str_replace("background-color:", "", $val);
                        $val = trim( $val );

                    }

                    return $val;

                }

                if( isset( $attr[0] ) && $attr[0] == 'background' ) {

                    if( $property == 'background-image' ) {

                        $url = wp_extract_urls( $val );

                        if( !empty( $url[0] )  ) {

                            return $url[0];

                        }

                    }

                    if( $property == 'background-color' ) {

                        // check for gradient color
                        // @United Themes
                        if( strpos( $val, 'linear-gradient') !== false ) {

                            // extract linear gradient from string
                            preg_match_all( '/linear-gradient\([^(]*(\([^)]*\)[^(]*)*[^)]*\)*url\(/', $val, $color );

                            if( !empty( $color[0][0] ) ) {

                                return trim( str_replace('url(' , '', $color[0][0] ));

                            }

                        } else {

                            // check for hex color first
                            preg_match_all( '/#([a-fA-F0-9]{3}){1,2}\b/', $val, $color );

                            if( !empty( $color[0][0] ) ) {

                                return trim( $color[0][0] );

                            }

                            // now check rgb and rgba color
                            preg_match_all( "/#[a-zA-Z0-9]{6}|rgb\((?:\s*\d+\s*,){2}\s*[\d]+\)|rgba\((\s*\d+\s*,){3}[\d\.]+\)|hsl\(\s*\d+\s*(\s*\,\s*\d+\%){2}\)|hsla\(\s*\d+(\s*,\s*\d+\s*\%){2}\s*\,\s*[\d\.]+\)/",  preg_replace('/\s+/', '', $val), $color );

                            if( !empty( $color[0][0] ) ) {

                                return trim( $color[0][0] );

                            }


                        }


                    }

                    return $val;

                }

            }

            return '';

        }

		/**
		 * @return string
		 */
		public function getBackgroundImageControl() {
			$value = sprintf( '<ul class="vc_image"></ul><a href="#" class="vc_add-image"><i class="vc-composer-icon vc-c-icon-add"></i>%s</a>', esc_html__( 'Add image', 'js_composer' ) );

			return apply_filters( 'vc_css_editor_background_image_control', $value );
		}

		/**
		 * @return string
		 */
		public function getBorderRadiusOptions() {
			$radiuses = apply_filters( 'vc_css_editor_border_radius_options_data', array(
				'' => esc_html__( 'None', 'js_composer' ),
				'1px' => '1px',
				'2px' => '2px',
				'3px' => '3px',
				'4px' => '4px',
				'5px' => '5px',
				'10px' => '10px',
				'15px' => '15px',
				'20px' => '20px',
				'25px' => '25px',
				'30px' => '30px',
				'35px' => '35px',
			) );

			$output = '';
			foreach ( $radiuses as $radius => $title ) {
				$output .= '<option value="' . $radius . '">' . $title . '</option>';
			}

			return $output;
		}

		/**
		 * @return string
		 */
		public function getBorderStyleOptions() {
			$output = '<option value="">' . esc_html__( 'Theme defaults', 'js_composer' ) . '</option>';
			$styles = apply_filters( 'vc_css_editor_border_style_options_data', array(
				esc_html__( 'solid', 'js_composer' ),
				esc_html__( 'dotted', 'js_composer' ),
				esc_html__( 'dashed', 'js_composer' ),
				esc_html__( 'none', 'js_composer' ),
				esc_html__( 'hidden', 'js_composer' ),
				esc_html__( 'double', 'js_composer' ),
				esc_html__( 'groove', 'js_composer' ),
				esc_html__( 'ridge', 'js_composer' ),
				esc_html__( 'inset', 'js_composer' ),
				esc_html__( 'outset', 'js_composer' ),
				esc_html__( 'initial', 'js_composer' ),
				esc_html__( 'inherit', 'js_composer' ),
			) );
			foreach ( $styles as $style ) {
				$output .= '<option value="' . $style . '">' . ucfirst( $style ) . '</option>';
			}

			return $output;
		}

		/**
		 * @return string
		 */
		public function getBackgroundStyleOptions() {
			$output = '<option value="">' . esc_html__( 'Theme defaults', 'js_composer' ) . '</option>';
			$styles = apply_filters( 'vc_css_editor_background_style_options_data', array(
				esc_html__( 'Cover', 'js_composer' ) => 'cover',
				esc_html__( 'Contain', 'js_composer' ) => 'contain',
				esc_html__( 'No Repeat', 'js_composer' ) => 'no-repeat',
				esc_html__( 'Repeat', 'js_composer' ) => 'repeat',
			) );
			foreach ( $styles as $name => $style ) {
				$output .= '<option value="' . $style . '">' . $name . '</option>';
			}

			return $output;
		}

		/**
		 * @return string
		 */
		public function onionLayout() {
			$output = sprintf( '<div class="vc_layout-onion vc_col-xs-7"><div class="vc_margin">%s<div class="vc_border">%s<div class="vc_padding">%s<div class="vc_content"><i></i></div></div></div></div></div>', $this->layerControls( 'margin' ), $this->layerControls( 'border', 'width' ), $this->layerControls( 'padding' ) );

			return apply_filters( 'vc_css_editor_onion_layout', $output );
		}

		/**
		 * @param $name
		 * @param string $prefix
		 *
		 * @return string
		 */
		protected function layerControls( $name, $prefix = '' ) {
			$output = '<label>' . esc_html( $name ) . '</label>';
			foreach ( $this->positions as $pos ) {
				$output .= sprintf( '<input type="text" name="%s_%s%s" data-name="%s%s-%s" class="vc_%s" placeholder="-" data-attribute="%s" value="">', esc_attr( $name ), esc_attr( $pos ), '' !== $prefix ? '_' . esc_attr( $prefix ) : '', esc_attr( $name ), '' !== $prefix ? '-' . esc_attr( $prefix ) : '', esc_attr( $pos ), esc_attr( $pos ), esc_attr( $name ) );
			}

			return apply_filters( 'vc_css_editor_layer_controls', $output );
		}
	}
}

/**
 * @param $settings
 * @param $value
 *
 * @return mixed
 */
function vc_css_editor_form_field( $settings, $value ) {
	$css_editor = new WPBakeryCssEditor();
	$css_editor->settings( $settings );
	$css_editor->value( $value );

	return $css_editor->render();

}

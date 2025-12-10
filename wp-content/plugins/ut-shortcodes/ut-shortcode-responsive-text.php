<?php

class UT_Responsive_Text {

    /**
     * @param  string $type
     * @param  mixed $font_settings
     *
     * @return string
     */

    public static function prepare_js_data_object( string $type, array $font_settings ) {

        if( !function_exists('ut_font_responsive_attributes') ) {
            return '';
        }

        $font_array = array();
        $font_responsive_settings = ut_font_responsive_settings();

        foreach( ut_font_responsive_attributes() as $attribute ) {

            if( !empty( $font_settings[$attribute] ) && is_string( $font_settings[$attribute] ) ) {

                parse_str(html_entity_decode( $font_settings[$attribute] ), $_font_settings );

                if( !empty( $_font_settings['desktop_large'] ) ) {

                    $font_array['base-' . $attribute] = ut_remove_px_value( $_font_settings['desktop_large'] );

                }

                if( !empty( $_font_settings[$attribute . '-unit'] ) ) {

                    $font_array[$attribute . '-unit'] = $_font_settings[$attribute . '-unit'];

                }

                $prev_value = '';

                foreach( ot_recognized_breakpoints() as $key => $breakpoint ) {

                    if( !empty( $_font_settings[$key] ) ) {

                        if( $_font_settings[$key] === 'global' ) {

                            if( isset( $font_responsive_settings[$type][$attribute][$key] ) && $font_responsive_settings[$type][$attribute][$key] == 'inherit' ) {

                                $unit = !empty( $_font_settings[$attribute. '-unit'] ) ? $_font_settings[$attribute . '-unit'] : self::get_global_font_settings( $attribute. '-unit', $type, 'px' );

                                if( $unit !== 'px' && $prev_value ) {

                                    $font_array[$attribute][$key] = $prev_value;

                                }

                            } elseif( isset( $font_responsive_settings[$type][$attribute][$key] ) ) {

                                $font_array[$attribute][$key] = $font_responsive_settings[$type][$attribute][$key];

                            }

                        } else {

                            if( $_font_settings[$key] == 'inherit' ) {

                                if( $prev_value )
                                $font_array[$attribute][$key] = $prev_value;

                            } else {

                                $prev_value = $_font_settings[$key];
                                $font_array[$attribute][$key] = $_font_settings[$key];

                            }

                        }

                    }

                }

            }

            if( !empty( $font_settings[$attribute] ) && is_numeric( $font_settings[$attribute] ) ) {

                $font_array['base-' . $attribute] = $font_settings[$attribute];

            }

        }

        $responsive_fonts = array();

        $responsive_fonts['data-responsive-font'] = $type;

        if( !empty( $font_array ) ) {

            $responsive_fonts['data-responsive-font-settings'] = htmlentities( json_encode( $font_array ), ENT_QUOTES, 'utf-8' );

        }

        return ut_implode_data_attributes( $responsive_fonts );

    }

    public static function get_prev_key( $key, $hash = array() ) {

        $keys = array_keys($hash);
        $found_index = array_search($key, $keys);

        if ($found_index === false || $found_index === 0) {
            return false;
        }

        return $keys[$found_index-1];

    }



    /**
     *
     * @param $attribute
     * @param $type
     * @param $unit
     *
     * @return string
     */
    public static function get_global_font_settings( $attribute, $type, $unit ) {

        return ut_font_responsive_settings()[$type][$attribute] ?? $unit;


    }

	public static function responsive_font_css( string $selector, $font_settings, $type = '' ) {

		if( !function_exists('ut_font_responsive_attributes') ) {
			return '';
		}

		$css                     = '';
        $font_array              = array();
        $font_responsive_settings = ut_font_responsive_settings();

        foreach( ut_font_responsive_attributes() as $attribute ) {

            if( !empty( $font_settings[$attribute] ) )  {

                if( is_string( $font_settings[$attribute] ) ) {

                    parse_str(html_entity_decode( $font_settings[$attribute] ), $_font_settings );

                }

                if( is_numeric( $font_settings[$attribute] ) ) {

                    if( $attribute == 'letter-spacing' ) {

                        $unit = 'em';

                    } elseif( $attribute == 'line-height' ) {

                        $unit = '%';

                    } else {

                        $unit = 'px';

                    }

                    // fallback - line height was only for desktop
                    if( $type == 'section_title' && $attribute == 'line-height' ) {

                        $css.= '@media (min-width: 768px) { ' . $selector .' { line-height: ' . $font_settings[$attribute] . 'px !important; } }';

                    } else {

                        $css .= $selector . '{ ' . $attribute . ': ' . ut_add_unit_value( $font_settings[$attribute], $unit ) . ' }';

                    }

                } else {

                    if( $attribute == 'letter-spacing' ) {

                        $unit = !empty( $_font_settings[$attribute. '-unit'] ) ? $_font_settings[$attribute . '-unit'] : 'em';

                    } elseif( $attribute == 'line-height' ) {

                        $unit = !empty( $_font_settings[$attribute. '-unit'] ) ? $_font_settings[$attribute . '-unit'] : self::get_global_font_settings( $attribute. '-unit', $type, '%' );

                    } else {

                        $unit = !empty( $_font_settings[$attribute. '-unit'] ) ? $_font_settings[$attribute . '-unit'] : self::get_global_font_settings( $attribute. '-unit', $type, 'px' );

                    }

                    $prev_value = '';

                    foreach( ot_recognized_breakpoints() as $key => $breakpoint ) {

                        if( !empty( $_font_settings[$key] ) ) {

                            if( $_font_settings[$key] === 'global' ) {

                                if( isset( $font_responsive_settings[$type][$attribute][$key] ) && $font_responsive_settings[$type][$attribute][$key] == 'inherit' ) {

                                    if( $unit != 'px' && $prev_value ) {

                                        $font_array[$key][$attribute] = ut_add_unit_value($prev_value, $unit );

                                    }

                                } elseif( isset( $font_responsive_settings[$type][$attribute][$key] ) ) {

                                    $font_array[$key][$attribute] = ut_add_unit_value( $font_responsive_settings[$type][$attribute][$key], $unit);

                                }

                            } else {

                                if( $_font_settings[$key] == 'inherit' ) {

                                    if( $prev_value )
                                    $font_array[$key][$attribute] = ut_add_unit_value($prev_value, $unit);

                                } else {

                                    $prev_value = $_font_settings[$key];
                                    $font_array[$key][$attribute] = ut_add_unit_value($_font_settings[$key], $unit);

                                }

                            }

                        }

                    }

                }

            }

        }

        ob_start();

        echo $css;

        if( !empty( $font_array ) ) :

            foreach( $font_array as $key => $value  ) : ?>

                <?php if( $key == 'desktop_large' ) : ?>

                    <?php echo $selector; ?> { <?php echo implode_with_key( $value, ':', ';', array('line-height', 'font-size') ); ?> }

                <?php else: ?>

                    @media <?php echo ot_recognized_breakpoints_values( $key ); ?> {

                        <?php echo $selector; ?> { <?php echo implode_with_key( $value, ':', ';', array('line-height', 'font-size') ); ?> }

                    }

                <?php endif; ?>

            <?php endforeach;

        endif;

        return ob_get_clean();

	}

}
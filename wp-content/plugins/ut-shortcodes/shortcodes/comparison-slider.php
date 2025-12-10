<?php

if ( ! defined( 'ABSPATH' ) ) exit;

if( !class_exists( 'UT_Comparison_Slider' ) ) {

	class UT_Comparison_Slider {

		private $shortcode;

		function __construct() {

			/* shortcode base */
			$this->shortcode = 'ut_comparison_slider';

			add_action( 'vc_before_init', array( $this, 'map_shortcode' ) );
			add_shortcode( $this->shortcode, array( $this, 'create_shortcode' ) );

		}

		function map_shortcode( $atts, $content = NULL ) {

			if( function_exists( 'vc_map' ) ) {

				vc_map(
					array(
						'name'            => esc_html__( 'Before and After Slider', 'ut_shortcodes' ),
						'description'     => esc_html__( 'Create a slider that compares two images.', 'ut_shortcodes' ),
						'base'            => $this->shortcode,
						'category'        => 'Media',
						'weight'          => 10,
						'class'           => 'ut-vc-icon-module ut-media-module',
						'icon'            => UT_SHORTCODES_URL . '/admin/img/vc_icons/compare.png',
						'content_element' => true,
						'params'          => array(

							array(
								'type'              => 'attach_image',
								'heading'           => esc_html__( 'Before Image', 'ut_shortcodes' ),
								'edit_field_class'  => 'vc_col-sm-6',
								'param_name'        => 'before_image',
								'group'             => 'General'
							),

							array(
								'type'              => 'textfield',
								'heading'           => esc_html__( 'Before Caption', 'ut_shortcodes' ),
								'edit_field_class'  => 'vc_col-sm-6',
								'param_name'        => 'before_label',
								'group'             => 'General'
							),

							array(
								'type'              => 'attach_image',
								'heading'           => esc_html__( 'After Image', 'ut_shortcodes' ),
								'edit_field_class'  => 'vc_col-sm-6',
								'param_name'        => 'after_image',
								'group'             => 'General'
							),

							array(
								'type'              => 'textfield',
								'heading'           => esc_html__( 'After Caption', 'ut_shortcodes' ),
								'edit_field_class'  => 'vc_col-sm-6',
								'param_name'        => 'after_label',
								'group'             => 'General'
							),

							array(
								'type' => 'dropdown',
								'heading' => esc_html__( 'Activate Image Cropping?', 'ut_shortcodes' ),
								'description'   => sprintf( esc_html__( 'Default Image Size (%spx) x (%spx) according to "Settings" > "Media" > "Large size". If compare direction is set to vertical, the default size will be (1080px) x (1350px). If crop is deactivated, both uploaded images must have the same size. Note that images are added to the image processing queue for cropping. Until the resize job is finished images are displaying with their original size.', 'ut_shortcodes' ), get_option('large_size_w'), get_option('large_size_h') ),
								'param_name' => 'auto_crop',
								'group' => 'General',
								'value' => array(
									esc_html__( 'yes, please!', 'ut_shortcodes' ) => 'on',
									esc_html__( 'no, thanks!', 'ut_shortcodes' ) => 'off'
								),
							),

							array(
								'type' => 'dropdown',
								'heading' => esc_html__( 'Compare Direction', 'ut_shortcodes' ),
								'param_name' => 'direction',
								'group' => 'General',
								'value' => array(
									esc_html__( 'Horizontal', 'ut_shortcodes' ) => 'horizontal',
									esc_html__( 'Vertical', 'ut_shortcodes' )   => 'vertical'
								),
							),

							array(
								'type' => 'range_slider',
								'heading' => esc_html__( 'Before Image Offset', 'ut_shortcodes' ),
								'description' => esc_html__( 'How much of the before image is visible when the page loads?', 'ut_shortcodes' ),
								'param_name' => 'default_offset_pct',
								'group' => 'General',
								'value' => array(
									'default' => '50',
									'min'     => '1',
									'max'     => '100',
									'step'    => '1',
									'unit'    => '%'
								),
							),

							array(
								'type' => 'dropdown',
								'heading' => esc_html__( 'Move Slider on Mouse Hover?', 'ut_shortcodes' ),
								'param_name' => 'move_slider_on_hover',
								'group' => 'General',
								'value' => array(
									esc_html__( 'yes, please!', 'ut_shortcodes' ) => 'on',
									esc_html__( 'no, thanks!', 'ut_shortcodes' ) => 'off'
								),
							),

							// Caption Design
							array(
								'type'       => 'ut_option_separator',
								'param_name' => 'caption_text_info',
								'info'       => esc_html__( 'Caption Font', 'ut_shortcodes' ),
								'group'      => 'Caption Settings',
							),
                            array(
								'type'              => 'dropdown',
								'heading'           => esc_html__( 'Font Weight', 'ut_shortcodes' ),
								'param_name'        => 'caption_font_weight',
								'group'             => 'Caption Settings',
								'value'             => array(
                                    esc_html__('Select Font Weight', 'ut_shortcodes') => '',
                                    esc_html__('normal', 'ut_shortcodes') => 'normal',
                                    esc_html__('bold', 'ut_shortcodes') => 'bold',
                                    esc_html__('100', 'ut_shortcodes') => '100',
                                    esc_html__('200', 'ut_shortcodes') => '200',
                                    esc_html__('300', 'ut_shortcodes') => '300',
                                    esc_html__('400', 'ut_shortcodes') => '400',
                                    esc_html__('500', 'ut_shortcodes') => '500',
                                    esc_html__('600', 'ut_shortcodes') => '600',
                                    esc_html__('700', 'ut_shortcodes') => '700',
                                    esc_html__('800', 'ut_shortcodes') => '800',
                                    esc_html__('900', 'ut_shortcodes') => '900'
                                ),
							),
							array(
								'type'       => 'ut_option_separator',
								'param_name' => 'caption_design_info',
								'info'       => esc_html__( 'Caption Design', 'ut_shortcodes' ),
								'group'      => 'Caption Settings',
							),
							array(
								'type'              => 'dropdown',
								'heading'           => esc_html__( 'Display Shadow?', 'ut_shortcodes' ),
								'param_name'        => 'caption_shadow',
								'group'             => 'Caption Settings',
								'value'             => array(
									esc_html__( 'yes, please!', 'ut_shortcodes' ) => 'on',
                                    esc_html__( 'no, thanks!', 'ut_shortcodes' ) => 'off'
								)
							),
							array(
								'type'              => 'range_slider',
								'heading'           => esc_html__( 'Border Radius', 'ut_shortcodes' ),
								'param_name'        => 'caption_border_radius',
								'group'             => 'Caption Settings',
								'value'             => array(
									'min'   => '0',
									'max'   => '15',
									'step'  => '1',
									'unit'  => 'px'
								),
							),
							array(
								'type'              => 'dropdown',
								'heading'           => esc_html__( 'Display Border?', 'ut_shortcodes' ),
								'param_name'        => 'caption_border',
								'group'             => 'Caption Settings',
								'value'             => array(
									esc_html__( 'no, thanks!', 'ut_shortcodes' ) => 'off',
									esc_html__( 'yes, please!', 'ut_shortcodes' ) => 'on'
								)
							),
							array(
								'type'              => 'colorpicker',
								'heading'           => esc_html__( 'Border Color', 'ut_shortcodes' ),
								'param_name'        => 'caption_border_color',
								'group'             => 'Caption Settings',
								'edit_field_class'  => 'vc_col-sm-6',
								'dependency'        => array(
									'element' => 'caption_border',
									'value'   => 'on',
								)
							),
							array(
								'type'              => 'range_slider',
								'heading'           => esc_html__( 'Border Size', 'ut_shortcodes' ),
								'param_name'        => 'caption_border_size',
								'group'             => 'Caption Settings',
								'edit_field_class'  => 'vc_col-sm-6',
								'value'             => array(
									'min'   => '1',
									'max'   => '3',
									'step'  => '1',
									'unit'  => 'px'
								),
								'dependency'        => array(
									'element' => 'caption_border',
									'value'   => 'on',
								)
							),

							// Colors
							array(
								'type'              => 'colorpicker',
								'heading'           => esc_html__( 'Overlay Color', 'ut_shortcodes' ),
								'param_name'        => 'overlay_color',
								'group'             => 'Colors',
								'dependency'        => array(
									'element' => 'move_slider_on_hover',
									'value'   => 'off',
								)
							),

							array(
								'type'              => 'colorpicker',
								'heading'           => esc_html__( 'Handle Color', 'ut_shortcodes' ),
								'param_name'        => 'handle_color',
								'group'             => 'Colors'
							),

							array(
								'type'              => 'colorpicker',
								'heading'           => esc_html__( 'Divider Color', 'ut_shortcodes' ),
								'param_name'        => 'divider_color',
								'group'             => 'Colors'
							),

							array(
								'type'              => 'colorpicker',
								'heading'           => esc_html__( 'Caption Text Color', 'ut_shortcodes' ),
								'param_name'        => 'caption_text_color',
								'group'             => 'Colors'
							),

							array(
								'type'              => 'colorpicker',
								'heading'           => esc_html__( 'Caption Background Color', 'ut_shortcodes' ),
								'param_name'        => 'caption_background_color',
								'group'             => 'Colors'
							),







							array(
								'type'              => 'textfield',
								'heading'           => esc_html__( 'CSS Class', 'ut_shortcodes' ),
								'description'       => esc_html__( 'Style particular content element differently - add a class name and refer to it in custom CSS.', 'ut_shortcodes' ),
								'param_name'        => 'class',
								'group'             => 'General'
							),

							/* css editor */
							array(
								'type'              => 'css_editor',
								'param_name'        => 'css',
								'group'             => esc_html__( 'Design Options', 'ut_shortcodes' ),
							)

						)

					)

				); /* end mapping */

			}

		}

		function ut_create_inline_css( $id, $atts ) {

		    /**
		     * @var string $move_slider_on_hover
             * @var integer $caption_border_size
             * @var string $caption_border_color
             * @var string $caption_border
		     */
			extract( shortcode_atts( array(
				'overlay_color'             => '',
				'handle_color'              => '',
				'divider_color'             => '',
				'caption_text_color'        => '',
				'caption_background_color'  => '',
				'caption_border_radius'     => '',
				'caption_border'            => '',
				'caption_border_color'      => '#FFF',
                'caption_border_size'       => 1,
                'caption_font_weight'       => '',
                'move_slider_on_hover'      => 'on',

			), $atts ) );

			ob_start();

			?>

			<style type="text/css">

				<?php if( !empty( $overlay_color ) && $move_slider_on_hover == 'off' ) :?>

				#<?php echo $id; ?>:not(.active):hover .ut-comparison-overlay {
					background: <?php echo $overlay_color; ?>;
				}

				<?php endif; ?>

				<?php if( !empty( $caption_text_color ) ) :?>

				#<?php echo $id; ?> .ut-comparison-before-label::before,
				#<?php echo $id; ?> .ut-comparison-after-label::before {
                    color: <?php echo $caption_text_color; ?>
                }

				<?php endif; ?>

				<?php if( !empty( $caption_background_color ) ) :?>

				#<?php echo $id; ?> .ut-comparison-before-label::before,
				#<?php echo $id; ?> .ut-comparison-after-label::before {
                    background: <?php echo $caption_background_color; ?>
                }

				<?php endif; ?>

                <?php if( $caption_border == 'on' ) : ?>

                #<?php echo $id; ?> .ut-comparison-before-label::before,
                #<?php echo $id; ?> .ut-comparison-after-label::before {
                    border: <?php echo $caption_border_size; ?>px solid <?php echo $caption_border_color; ?>
                }

                <?php endif; ?>

				<?php if( !empty( $handle_color ) ) :?>

				#<?php echo $id; ?> .ut-comparison-handle {
                    border-color: <?php echo $handle_color; ?>;
                }

				#<?php echo $id; ?> .ut-comparison-handle .ut-comparison-right-arrow {
                    border-left-color: <?php echo $handle_color; ?>;
                }

				#<?php echo $id; ?> .ut-comparison-handle .ut-comparison-left-arrow {
                    border-right-color: <?php echo $handle_color; ?>;
                }

				#<?php echo $id; ?> .ut-comparison-handle .ut-comparison-down-arrow {
                    border-top-color: <?php echo $handle_color; ?>;
                }

				#<?php echo $id; ?> .ut-comparison-handle .ut-comparison-up-arrow {
                    border-bottom-color: <?php echo $handle_color; ?>;
                }

				#<?php echo $id; ?> .ut-comparison-handle::after,
				#<?php echo $id; ?> .ut-comparison-handle::before {
                    -webkit-box-shadow: 0 -3px 0 <?php echo $handle_color; ?>, 0px 0px 12px rgba(51, 51, 51, 0.5);
                    -moz-box-shadow: 0 -3px 0 <?php echo $handle_color; ?>, 0px 0px 12px rgba(51, 51, 51, 0.5);
                    box-shadow: 0 -3px 0 <?php echo $handle_color; ?>, 0px 0px 12px rgba(51, 51, 51, 0.5);
                }

				<?php endif; ?>

                <?php if( !empty( $caption_font_weight ) ) : ?>

                #<?php echo $id; ?> .ut-comparison-before-label::before,
                #<?php echo $id; ?> .ut-comparison-after-label::before {
                    font-weight: <?php echo $caption_font_weight; ?>;
                }

                <?php endif; ?>

                <?php if( !empty( $caption_border_radius ) ) : ?>

                #<?php echo $id; ?> .ut-comparison-before-label::before,
                #<?php echo $id; ?> .ut-comparison-after-label::before {
                    border-radius: <?php echo $caption_border_radius; ?>px;
                }

                <?php endif; ?>

				<?php if( !empty( $divider_color ) ) :?>

				#<?php echo $id; ?> .ut-comparison-handle::after,
				#<?php echo $id; ?> .ut-comparison-handle::before {
                    background: <?php echo $divider_color; ?>;
                }

				<?php endif; ?>

			</style>

			<?php

			return ob_get_clean();

		}

		function create_shortcode( $atts, $content = NULL ) {

			/**
             * @var string $auto_crop
             * @var string $caption_shadow
			 * @var int $default_offset_pct
             * @var string $direction
             * @var string $move_slider_on_hover
             * @var string $class
			 */
			extract( shortcode_atts( array (
				'before_image'         => '',
				'after_image'          => '',
				'auto_crop'            => 'on',
				'class'                => '',
				'css'                  => '',
				'caption_shadow'       => 'on',
				'move_slider_on_hover' => 'on',
				'before_label'         => '',
				'after_label'          => '',
				'default_offset_pct'   => '50',
				'direction'            => 'horizontal'
			), $atts ) );

			// no output if one of the images is missing
			if( empty( $before_image ) && empty( $after_image ) ) {
				return '';
			}

			// class array
			$classes = array();

			// extra element class
			$classes[] = $class;

			if( $caption_shadow == 'on' ) {
				$classes[] = 'ut-comparison-caption-with-shadow';
            }

			// element ID
			$id = ut_get_unique_id( "ut_cs_" );

			// set labels
			$before_label = !empty( $before_label ) ? $before_label : '';
			$after_label = !empty( $after_label ) ? $after_label : '';

			// images
			$before_image_id = $before_image;
			$after_image_id = $after_image;

			// data-attributes
			$data_attributes = array();

			$data_attributes['data-default-offset-pct']   = $default_offset_pct / 100;
			$data_attributes['data-orientation']          = $direction;
			$data_attributes['data-move-slider-on-hover'] = $move_slider_on_hover == 'on' ? true : false;
            $data_attributes['data-before-label']         = esc_attr($before_label);
            $data_attributes['data-after-label']          = esc_attr($after_label);

			$data_attributes = implode(' ', array_map(
				function ($v, $k) { return sprintf("%s=\"%s\"", $k, $v); },
				$data_attributes,
				array_keys( $data_attributes )
			) );

			// start output
			$output = '';

			// attach CSS
			$output .= $this->ut_create_inline_css( $id, $atts );

			$output .= '<div id="' . esc_attr( $id ) . '" class="ut-comparison-container ' . implode( " ", $classes ) . '" ' . $data_attributes . '>';

			if( $auto_crop == 'on' ) {

				if( class_exists('UT_Adaptive_Image') ) {

					if( $direction == 'vertical' ) {

						$output .= UT_Adaptive_Image::create( $before_image_id, array( '1080', '1350' ), true, 'portrait' );
						$output .= UT_Adaptive_Image::create( $after_image_id, array( '1080', '1350' ), true, 'portrait' );

					} else {

						$output .= UT_Adaptive_Image::create( $before_image_id, array( get_option('large_size_w'), get_option('large_size_h') ) );
						$output .= UT_Adaptive_Image::create( $after_image_id, array( get_option('large_size_w'), get_option('large_size_h') ) );

					}

				}

            } else {

				$output .= UT_Adaptive_Image::create_lazy( $before_image_id );
				$output .= UT_Adaptive_Image::create_lazy( $after_image_id );

            }

			$output .= '</div>';

			return '<div class="wpb_content_element ' . apply_filters( VC_SHORTCODE_CUSTOM_CSS_FILTER_TAG, vc_shortcode_custom_css_class( $css, ' ' ), $this->shortcode, $atts ) . '">' . $output . '</div>';

		}

	}

	new UT_Comparison_Slider;

}
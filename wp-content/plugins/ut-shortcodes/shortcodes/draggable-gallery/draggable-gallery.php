<?php

if ( !defined( 'ABSPATH' ) )exit;

if ( !class_exists( 'UT_Draggable_Gallery_Slider' ) ) {

    class UT_Draggable_Gallery_Slider {

        private $shortcode;
        private $gallery_id;
        private $atts;

        function __construct() {

            /* shortcode base */
            $this->shortcode = 'ut_draggable_gallery_slider';

            add_action( 'vc_before_init', array( $this, 'ut_map_shortcode' ) );
            add_shortcode( $this->shortcode, array( $this, 'ut_create_shortcode' ) );
        }

        function ut_map_shortcode() {

            vc_map(
                array(
                    'name' => esc_html__( 'Draggable Gallery Slider', 'ut_shortcodes' ),
                    'description' => esc_html__( 'A touch enabled slider that lets you create a beautiful responsive carousels and single slides.', 'ut_shortcodes' ),
                    'base' => $this->shortcode,
                    'category' => 'Media',
                    // 'icon' => 'fa fa-sliders ut-vc-module-icon',
                    'icon' => UT_SHORTCODES_URL . '/admin/img/vc_icons/gallery-slider.png',
                    'class' => 'ut-vc-icon-module ut-media-module',
                    'content_element' => true,
                    'params' => array(

                        array(
                            'type' => 'attach_images',
                            'heading' => esc_html__( 'Slides', 'ut_shortcodes' ),
                            'group' => 'Slides',
                            'param_name' => 'slides',
                        ),
                        array(
                            'type'              => 'custom_markup',
                            'value'             => esc_html__( 'You can set the width for each image individually, by clicking on the image and add value inside the width field.', 'ut_shortcodes' ),
                            'param_name'        => 'helper_text',
                            'edit_field_class'  => 'vc_col-sm-12',
                            'group'             => 'Slides',
                        ),
                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Gap size', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 40', 'ut_shortcodes' ),
                            'param_name'        => 'gap_size',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',
                        ),
                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Gap size Tablet', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 40', 'ut_shortcodes' ),
                            'param_name'        => 'gap_size_tablet',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',
                        ),
                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Gap size Mobile', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 40', 'ut_shortcodes' ),
                            'param_name'        => 'gap_size_mobile',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',
                        ),
                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Height', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 450', 'ut_shortcodes' ),
                            'param_name'        => 'height',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',

                        ),

                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Height Tablet', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 450', 'ut_shortcodes' ),
                            'param_name'        => 'height_tablet',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',
                        ),

                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Height Mobile', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 450', 'ut_shortcodes' ),
                            'param_name'        => 'height_mobile',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',
                        ),
                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__( 'Image Style', 'ut_shortcodes' ),
                            'param_name' => 'image_style',
                            'group' => 'Slides',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'value' => array(
                                esc_html__( 'Square', 'ut_shortcodes' ) => 'square',
                                esc_html__( 'Rounded' , 'ut_shortcodes' ) => 'rounded',
                            )
                        ),
                        array(
                            'type'              => 'textfield',
                            'heading'           => esc_html__( 'Radius Value', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Value in px default is 20', 'ut_shortcodes' ),
                            'param_name'        => 'image_radius',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Slides',
                            'value'             => '20',
                            'dependency'        => array(
                                'element' => 'image_style',
                                'value'   => 'rounded',
                            )
                        ),
                        /* Animation  */
                        array(
                            'type' => 'range_slider',
                            'heading' => esc_html__( 'Scroll Speed', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'The amount of scroll the slider will move on scroll, to disable set to 0', 'ut_shortcodes' ),
                            'param_name' => 'scroll_speed',
                            'group' => 'Animations',
                            'value' => array(
                                'default' => '8',
                                'min' => '0',
                                'max' => '50',
                                'step' => '1',
                                'unit'=> ''
                            ),
                        ),

                        array(
                            'type'              => 'checkbox',
                            'heading'           => esc_html__( 'Enable marquee scroll', 'ut_shortcodes' ),
                            'description'       => esc_html__( 'Marquee scroll will auto play the gallery if the speed is higher than 1', 'ut_shortcodes' ),
                            'param_name'        => 'marquee',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Animations',
                        ),

                        array(
                            'type'              => 'checkbox',
                            'heading'           => esc_html__( 'Enable marquee scroll for mobile', 'ut_shortcodes' ),
                            'param_name'        => 'marquee_mobile',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'group'             => 'Animations',

                        ),
                        /* css editor */
                        array(
                            'type' => 'css_editor',
                            'param_name' => 'css',
                            'group' => esc_html__( 'Design Options', 'ut_shortcodes' ),
                        )

                    )

                )

            ); /* end mapping */

        }

        function ut_create_inline_css( $id, $atts, $extra_css ) {

            extract( shortcode_atts( array(
                'slides'    => '',
                'gap_size'  => '40',
                'gap_size_tablet' => '',
                'gap_size_mobile' => '',
                'height'    => '450',
                'height_tablet' => '',
                'height_mobile' => '',
                'image_radius'  => '20',
                'image_style'   => 'square'
            ), $atts ) );

            ob_start(); ?>

            <style type="text/css">
                #<?php echo esc_attr($id); ?> .gallery-image {
                    padding-right: <?php echo (int)$gap_size; ?>px;
                }
                <?php if( $image_style === 'rounded' ): ?>
                    #<?php echo esc_attr($id); ?>.ut-gallery-rounded img {
                        border-radius: <?php echo (int)$image_radius; ?>px;
                    }
                <?php endif; ?>
                <?php if( ! empty( $gap_size_tablet ) ): ?>
                    @media only screen and (max-width: 992px) and (min-width: 767px) {
                        #<?php echo esc_attr($id); ?> .gallery-image {
                            padding-right: <?php echo (int)$gap_size_tablet; ?>px;
                    }
                }
                <?php endif; ?>
                <?php if( ! empty( $gap_size_mobile ) ): ?>
                    @media only screen and (max-width: 766px) {
                        #<?php echo esc_attr($id); ?> .gallery-image {
                            padding-right: <?php echo (int)$gap_size_mobile; ?>px;
                    }
                }
                <?php endif; ?>

                #<?php echo esc_attr($id); ?> .img-wrap img {
                    height: <?php echo (int)$height; ?>px;
                }
                <?php if( ! empty( $height_tablet ) ): ?>
                    @media only screen and (max-width: 992px) and (min-width: 767px) {
                        #<?php echo esc_attr($id); ?> .img-wrap img {
                            height: <?php echo (int)$height_tablet; ?>px;
                        }
                    }
                <?php endif; ?>
                <?php if( ! empty( $height_mobile ) ): ?>
                    @media only screen and (max-width: 766px) {
                        #<?php echo esc_attr($id); ?> .img-wrap img {
                            height: <?php echo (int)$height_mobile; ?>px;
                        }
                    }
                <?php endif; ?>

                <?php echo strip_tags( $extra_css ); ?>

            </style>

            <?php

            return ob_get_clean();

        }

        function create_slide_style( $slide, $id, $atts )
        {
            extract( shortcode_atts( array(
                'slides'    => '',
                'gap_size'  => '40',
                'gap_size_tablet' => '',
                'gap_size_mobile' => '',
                'height'    => '450',
                'height_tablet' => '',
                'height_mobile' => '',
                'image_radius'  => '20',
                'image_style'   => 'square'
            ), $atts ) );

            $width = get_post_meta( $slide, 'ut_gallery_width', true );
            if( ! empty( $width ) ) {
                ob_start(); ?>
                #<?php echo esc_attr($id); ?> #ut-slide-<?php echo esc_attr($slide); ?> {
                    width: <?php echo ((int)$width + (int)$gap_size); ?>px;
                }
                <?php if( ! empty( $gap_size_tablet ) ): ?>
                    @media only screen and (max-width: 992px) and (min-width: 767px) {
                        #<?php echo esc_attr($id); ?> #ut-slide-<?php echo esc_attr($slide); ?> {
                            width: <?php echo ((int)$width + (int)$gap_size_tablet); ?>px;
                        }
                    }
                <?php endif; ?>
                <?php if( ! empty( $gap_size_mobile ) ): ?>
                    @media only screen and (max-width: 766px) {
                        #<?php echo esc_attr($id); ?> #ut-slide-<?php echo esc_attr($slide); ?> {
                            width: <?php echo ((int)$width + (int)$gap_size_mobile); ?>px;
                        }
                    }
                <?php endif; ?>
                <?php return ob_get_clean();
            }
        }


        function create_image_slide( $image, $lightbox, $type, $caption, $atts ) {

            if ( empty( $image ) ) {
                return;
            }

            extract( shortcode_atts( array(
                'height'        => '450',
                'height_tablet' => '',
                'height_mobile' => '',
            ), $atts ) );
            $height = [ (int)$height, (int)$height_tablet, (int)$height_mobile ];
            $width = get_post_meta( $image, 'ut_gallery_width', true );
            $width = empty( $width ) ? 750 : $width;
            $size = array( ((int)$width + 300), ((int)max( $height) + 200) );

            return UT_Adaptive_Image::create( $image, $size, false, 'auto', false );

        }

        function draggalbe_scripts()
        {
            $min = NULL;

            if( apply_filters( 'ut_minify_assets', true ) ){
                $min = '.min';
            }
            wp_enqueue_style( 'ut-draggable-gallery', UT_SHORTCODES_URL . '/shortcodes/draggable-gallery/css/draggable-gallery' . $min . '.css', UT_SHORTCODES_VERSION);
            wp_enqueue_script( 'ut-draggable-gallery', UT_SHORTCODES_URL . '/shortcodes/draggable-gallery/js/draggable-gallery' . $min . '.js', array('gsap-draggable', 'gsap-ScrollTrigger'), UT_SHORTCODES_VERSION, true );

        }

        public function preview_js()
        {
            if ( isset( $_POST['action'] ) && $_POST['action'] === 'vc_load_shortcode' ) {
                ob_start();
                $styles = [
                        UT_SHORTCODES_URL . '/shortcodes/draggable-gallery/css/draggable-gallery.min.css'
                ];
                $scripts = [
                    unite_script_path() . '/assets/vendor/gsap/gsap.min.js',
                    unite_script_path() . '/assets/vendor/gsap/ScrollTrigger.min.js',
                    unite_script_path() . '/assets/vendor/gsap/Draggable.min.js',
                    UT_SHORTCODES_URL . '/shortcodes/draggable-gallery/js/draggable-gallery.js',
                ];
                foreach ( $scripts as $script ) { ?>
                    <script type="text/javascript" src="<?php echo esc_url( $script ) ?>"></script>
                <?php }
                foreach ( $styles as $style ) { ?>
                      <link rel="stylesheet" type="text/css" href="<?php echo esc_url( $style ) ?>" media="all">
                <?php }
                ?>
                <script type="text/javascript">
                    window.UT_DraggableGallery.init();
                </script>

            <?php
                return ob_get_clean();
            }
        }
        function ut_create_shortcode( $atts, $content = NULL ) {

            $this->atts = $atts;

            extract( shortcode_atts( array(
                'slides'            => '',
                'image_style'       => 'square',
                'scroll_speed'      => '8',
                'marquee'           => false,
                'marquee_mobile'    => false
            ), $this->atts ) );

            /* class array */
            $classes = array();
            $el_classes= array();
            $control_classes = array();

            /* extra element class */
            $classes[] = $class;


            /* unique ID */
            $this->gallery_id = $id = uniqid( "ut_ms_" );
            $outer_id = uniqid( "ut_oms_" );
            $this->draggalbe_scripts();
            /* start output */
            $output = '';

            if( $image_style === 'rounded' ) {
                $classes[] = 'ut-gallery-rounded';
            }
            $slides = explode( ',', $slides );
            $slide_css = '';
            if ( !empty( $slides ) && is_array( $slides ) ) {

                $output .= '<div class="ut-draggable-gallery '.esc_attr( $id ).'" class="ut-draggable-gallery" data-scroll-speed="'.(int)$scroll_speed.'" data-marquee="'.esc_attr($marquee).'" data-marquee-mobile="'.esc_attr($marquee_mobile).'">';
                    $output .= '<div data-draggable>';
                    $output .= '<div id="' . esc_attr( $id ) . '" class="ut-draggable-gallery-wrap ' . implode( ' ', $classes ) . '" >';

                    foreach ( $slides as $slide ) {
                        $output .= '<div id="ut-slide-'.esc_attr($slide).'" class="gallery-image">';
                            $output .= '<div class="img-wrap">';
                            $output .= $this->create_image_slide( $slide, $lightbox, $type, $caption, $atts );
                            $output .= '</div>';
                        $output .= '</div>';
                        $slide_css .= $this->create_slide_style( $slide, $id, $atts );
                    }

                    $output .= '</div>';
                    $output .= '</div>';
                $output .= '</div>';

            }
            $output .= ut_minify_inline_css( $this->ut_create_inline_css( $outer_id, $atts, $slide_css ) );
            $output .= $this->preview_js();
            return '<div id="' . esc_attr( $outer_id ) . '" class="wpb_content_element ' . apply_filters( VC_SHORTCODE_CUSTOM_CSS_FILTER_TAG, vc_shortcode_custom_css_class( $css, ' ' ), $this->shortcode, $atts ) . '">' . $output . '</div>';

        }

    }

}

new UT_Draggable_Gallery_Slider;



if ( class_exists( 'WPBakeryShortCode' ) ) {

    class WPBakeryShortCode_ut_draggable_gallery_slider extends WPBakeryShortCode {

        /* add images to visual composer */
        public
        function singleParamHtmlHolder( $param, $value ) {

            $output = '';
            $param_name = isset( $param[ 'param_name' ] ) ? $param[ 'param_name' ] : '';

            if ( 'slides' === $param_name ) {

                $images_ids = empty( $value ) ? array() : explode( ',', trim( $value ) );
                $output .= '<ul class="attachment-thumbnails' . ( empty( $images_ids ) ? ' image-exists' : '' ) . '" data-name="' . $param_name . '">';
                foreach ( $images_ids as $image ) {
                    $img = wpb_getImageBySize( array( 'attach_id' => ( int )$image, 'thumb_size' => 'thumbnail' ) );
                    $output .= ( $img ? '<li>' . $img[ 'thumbnail' ] . '</li>' : '<li><img width="150" height="150" test="' . $image . '" src="' . vc_asset_url( 'vc/blank.gif' ) . '" class="attachment-thumbnail" alt="" title="" /></li>' );
                }
                $output .= '</ul>';
                $output .= '<a href="#" class="column_edit_trigger' . ( !empty( $images_ids ) ? ' image-exists' : '' ) . '">' . __( 'Add images', 'js_composer' ) . '</a>';

            }

            return $output;

        }

    }

}
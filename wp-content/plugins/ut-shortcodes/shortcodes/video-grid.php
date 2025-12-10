<?php

if ( ! defined( 'ABSPATH' ) ) exit;

if( !class_exists( 'UT_Video_Grid' ) ) {
	
    class UT_Video_Grid {
        
        private $shortcode;
            
        function __construct() {
			
            /* shortcode base */
            $this->shortcode = 'ut_video_grid';
            
            add_action( 'vc_before_init', array( $this, 'ut_map_shortcode' ) );
            add_shortcode( $this->shortcode, array( $this, 'ut_create_shortcode' ) );	
            
		}
        
        function ut_map_shortcode() {

            vc_map(
                array(
                    'name'            => esc_html__( 'Video Grid', 'ut_shortcodes' ),
                    'description' 	  => esc_html__( 'An ajax powered video grid player, to play a bunch of videos in the background.', 'ut_shortcodes' ),
                    'base'            => $this->shortcode,
                    'category'        => 'Media',
                    'class'           => 'ut-vc-icon-module ut-media-module',
                    'icon'            => UT_SHORTCODES_URL . '/admin/img/vc_icons/video-player.png',
                    'content_element' => true,
                    'params'          => array(

                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__('Video Play Location', 'ut_shortcodes'),
                            'param_name' => 'grid_videos_location',
                            'value' => array(
                                esc_html__('play as background behind grid', 'ut_shortcodes') => 'behind_grid',
                                esc_html__('play as background behind outer row', 'ut_shortcodes') => 'behind_row',
                                esc_html__('play as background behind outer section', 'ut_shortcodes') => 'behind_section'
                            ),
                            'group' => 'General'
                        ),

                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__('Event for playing videos', 'ut_shortcodes'),
                            'param_name' => 'grid_videos_event',
                            'value' => array(
                                esc_html__('play on mouse hover', 'ut_shortcodes') => 'hover',
                                esc_html__('play on mouse click', 'ut_shortcodes') => 'click',
                            ),
                            'group' => 'General'
                        ),

                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__('Columns on Desktop', 'ut_shortcodes'),
                            'param_name' => 'desktop_columns',
                            'edit_field_class'  => 'vc_col-sm-4',
                            'value' => array(
                                esc_html__('2 Columns (default)', 'ut_shortcodes') => '2',
                                esc_html__('1 Column', 'ut_shortcodes')  => '1',
                                esc_html__('3 Columns', 'ut_shortcodes') => '3',
                                esc_html__('4 Columns', 'ut_shortcodes') => '4',
                                esc_html__('5 Columns', 'ut_shortcodes') => '5',
                                esc_html__('6 Columns', 'ut_shortcodes') => '6',
                            ),
                            'group' => 'General'
                        ),

                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__('Columns on Tablets', 'ut_shortcodes'),
                            'param_name' => 'tablet_columns',
                            'edit_field_class'  => 'vc_col-sm-4',
                            'value' => array(
                                esc_html__('2 Columns (default)', 'ut_shortcodes') => '2',
                                esc_html__('1 Column', 'ut_shortcodes')  => '1',
                                esc_html__('3 Columns', 'ut_shortcodes') => '3',
                                esc_html__('4 Columns', 'ut_shortcodes') => '4',
                                esc_html__('5 Columns', 'ut_shortcodes') => '5',
                                esc_html__('6 Columns', 'ut_shortcodes') => '6',
                            ),
                            'group' => 'General'
                        ),

                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__('Columns on Mobile', 'ut_shortcodes'),
                            'param_name' => 'mobile_columns',
                            'edit_field_class'  => 'vc_col-sm-4',
                            'value' => array(
                                esc_html__('1 Column (default)', 'ut_shortcodes')  => '1',
                                esc_html__('2 Columns', 'ut_shortcodes') => '2',
                                esc_html__('3 Columns', 'ut_shortcodes') => '3',
                                esc_html__('4 Columns', 'ut_shortcodes') => '4',
                            ),
                            'group' => 'General'
                        ),

                        /* Videos */
                        array(
                            'type'          => 'param_group',
                            'heading'       => esc_html__( 'Grid Videos', 'ut_shortcodes' ),
                            'param_name'    => 'grid_videos',
                            'group'         => 'Videos',
                            'params' => array(

                                /*array(
                                    'type' => 'dropdown',
                                    'heading' => esc_html__('Choose Video Source', 'ut_shortcodes'),
                                    'param_name' => 'source',
                                    'value' => array(
                                        esc_html__('Youtube', 'ut_shortcodes') => 'youtube',
                                        esc_html__('Vimeo', 'ut_shortcodes') => 'Vimeo',
                                    ),
                                ),*/

                                array(
                                    'type'          => 'textfield',
                                    'heading'       => esc_html__( 'Youtube', 'ut_shortcodes' ),
                                    'param_name'    => 'youtube'
                                ),

                                /*array(
                                    'type'          => 'textfield',
                                    'heading'       => esc_html__( 'Vimeo', 'ut_shortcodes' ),
                                    'param_name'    => 'vimeo',
                                    'dependency' => array(
                                        'element' => 'source',
                                        'value' => array('vimeo'),
                                     )
                                ),*/

                                array(
                                    'type'          => 'textfield',
                                    'heading'       => esc_html__( 'Video Title', 'ut_shortcodes' ),
                                    'param_name'    => 'title',
                                    'admin_label'   => true,
                                ),

                                array(
                                    'type'          => 'textfield',
                                    'heading'       => esc_html__( 'Start Video Timer', 'ut_shortcodes' ),
                                    'description'   => esc_html__( 'Set the seconds the video should start at.', 'ut_shortcodes' ),
                                    'param_name'    => 'startAt'
                                ),

                                array(
                                    'type'          => 'textfield',
                                    'heading'       => esc_html__( 'Stop Video Timer', 'ut_shortcodes' ),
                                    'description'   => esc_html__( 'Set the seconds the video should stop at. If 0 is ignored.', 'ut_shortcodes' ),
                                    'param_name'    => 'stopAt'
                                ),

                                /*array(
                                    'type'              => 'attach_image',
                                    'heading'           => esc_html__( 'Poster Image', 'ut_shortcodes' ),
                                    'param_name'        => 'poster_background',
                                    'group'             => 'Poster',
                                ),*/

                                array(
                                    'type'              => 'attach_image',
                                    'heading'           => esc_html__( 'Caption Poster (Background)', 'ut_shortcodes' ),
                                    'param_name'        => 'poster_caption',
                                    'group'             => 'Poster',
                                ),




                            ),

                        ),


                        /* Filter Options */
                        array(
                            'type'        => 'checkbox',
                            'heading'     => esc_html__( 'Add Video Filters?', 'ut_shortcodes' ),
                            'description' => sprintf( __( 'Except for IE that will not render CSS filters. For filter inspirations, please visit <a href="%s" target="_blank">cssfilters.co</a>.', 'ut_shortcodes' ), 'https://www.cssfilters.co/' ),
                            'param_name'  => 'video_filter',
                            'value'       => array( esc_html__( 'Yes', 'ut_shortcodes' ) => 'yes' ),
                            'group'       => 'Video Filter',
                        ),
                        /*array(
                            'type'        => 'dropdown',
                            'heading'     => esc_html__( 'Filters Mouse Hover Actions', 'ut_shortcodes' ),
                            'description' => esc_html__( 'Apply the filter based on mouse action.', 'ut_shortcodes' ),
                            'param_name'  => 'video_filter_action',
                            'value'       => array(
                                esc_html__( 'No Mouse Hover Action (Permanent Filters)', 'ut_shortcodes' ) => 'none',
                                esc_html__( 'Remove Filters on Mouse Hover', 'ut_shortcodes' )             => 'remove',
                                esc_html__( 'Add Filters on Mouse Hover', 'ut_shortcodes' )                => 'add'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),*/
                        array(
                            'type'        => 'range_slider',
                            'heading'     => esc_html__( 'Contrast', 'ut_shortcodes' ),
                            'description' => esc_html__( '0% will make the video completely black. 100% is default and represents the original video. Values over 100% will provide results with less contrast.', 'ut_shortcodes' ),
                            'param_name'  => 'contrast',
                            'value'       => array(
                                'default' => '100',
                                'min'     => '0',
                                'max'     => '200',
                                'step'    => '1',
                                'unit'    => '%'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),
                        array(
                            'type'        => 'range_slider',
                            'heading'     => esc_html__( 'Brightness', 'ut_shortcodes' ),
                            'description' => esc_html__( '0% will make the video completely black. 100% (1) is default and represents the original video. Values over 100% will provide brighter results.', 'ut_shortcodes' ),
                            'param_name'  => 'brightness',
                            'value'       => array(
                                'default' => '100',
                                'min'     => '0',
                                'max'     => '200',
                                'step'    => '1',
                                'unit'    => '%'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),
                        array(
                            'type'        => 'range_slider',
                            'heading'     => esc_html__( 'Saturate', 'ut_shortcodes' ),
                            'description' => esc_html__( '0% (0) will make the video completely un-saturated. 100% is default and represents the original video. Values over 100% provides super-saturated results.', 'ut_shortcodes' ),
                            'param_name'  => 'saturate',
                            'value'       => array(
                                'default' => '100',
                                'min'     => '0',
                                'max'     => '200',
                                'step'    => '1',
                                'unit'    => '%'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),
                        array(
                            'type'        => 'range_slider',
                            'heading'     => esc_html__( 'Sepia', 'ut_shortcodes' ),
                            'description' => esc_html__( '0% (0) is default and represents the original video. 100% will make the video completely sepia.', 'ut_shortcodes' ),
                            'param_name'  => 'sepia',
                            'value'       => array(
                                'default' => '0',
                                'min'     => '0',
                                'max'     => '100',
                                'step'    => '1',
                                'unit'    => '%'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),
                        array(
                            'type'        => 'range_slider',
                            'heading'     => esc_html__( 'Grayscale', 'ut_shortcodes' ),
                            'description' => esc_html__( '0% (0) is default and represents the original video. 100% will make the video completely gray.', 'ut_shortcodes' ),
                            'param_name'  => 'grayscale',
                            'value'       => array(
                                'default' => '0',
                                'min'     => '0',
                                'max'     => '100',
                                'step'    => '1',
                                'unit'    => '%'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),
                        array(
                            'type'        => 'range_slider',
                            'heading'     => esc_html__( 'Blur', 'ut_shortcodes' ),
                            'description' => esc_html__( 'Applies a blur effect to the video. A larger value will create more blur.', 'ut_shortcodes' ),
                            'param_name'  => 'blur',
                            'value'       => array(
                                'default' => '0',
                                'min'     => '0',
                                'max'     => '100',
                                'step'    => '1',
                                'unit'    => 'px'
                            ),
                            'group'       => 'Video Filter',
                            'dependency'  => array(
                                'element'   => 'video_filter',
                                'not_empty' => true
                            )
                        ),

                        // Colors
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Border Color', 'ut_shortcodes' ),
                            'param_name'        => 'border_color',
                            'group'             => 'Appearance',
                        ),
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Caption Title Color', 'ut_shortcodes' ),
                            'edit_field_class'  => 'vc_col-sm-4',
                            'param_name'        => 'caption_title_color',
                            'group'             => 'Appearance',
                        ),
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Caption Title Hover Color', 'ut_shortcodes' ),
                            'edit_field_class'  => 'vc_col-sm-4',
                            'param_name'        => 'caption_title_hover_color',
                            'group'             => 'Appearance',
                        ),
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Caption Title Active Color', 'ut_shortcodes' ),
                            'edit_field_class'  => 'vc_col-sm-4',
                            'param_name'        => 'caption_title_active_color',
                            'group'             => 'Appearance',
                        ),
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Caption Background Color', 'ut_shortcodes' ),
                            'edit_field_class'  => 'vc_col-sm-4',
                            'param_name'        => 'caption_background_color',
                            'group'             => 'Appearance',
                        ),
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Caption Background Hover Color', 'ut_shortcodes' ),
                            'edit_field_class'  => 'vc_col-sm-4',
                            'param_name'        => 'caption_background_hover_color',
                            'group'             => 'Appearance',
                        ),
                        array(
                            'type'              => 'colorpicker',
                            'heading'           => esc_html__( 'Caption Background Active Color', 'ut_shortcodes' ),
                            'edit_field_class'  => 'vc_col-sm-4',
                            'param_name'        => 'caption_background_active_color',
                            'group'             => 'Appearance',
                        ),

                        array(
                            'type' => 'dropdown',
                            'heading' => esc_html__('Caption Poster Background Size', 'ut_shortcodes'),
                            'param_name' => 'caption_poster_background_size',
                            'edit_field_class'  => 'vc_col-sm-6',
                            'value' => array(
                                esc_html__('cover', 'ut_shortcodes') => 'cover',
                                esc_html__('contain', 'ut_shortcodes')  => 'contain',
                                esc_html__('custom', 'ut_shortcodes') => 'custom',

                            ),
                            'group' => 'Appearance'
                        ),

                         array(
		                    'type'              => 'textfield',
		                    'heading'           => esc_html__( 'Custom Poster Background Size', 'ut_shortcodes' ),
		                    'description'       => __("The <a href='https://www.w3schools.com/cssref/css3_pr_background-size.asp' target='_blank'>CSS background-size</a> for the caption poster background image", 'ut_shortcodes'),
		                    'param_name'        => 'caption_poster_custom_background_size',
		                    'group'             => 'Appearance',
		                    'edit_field_class'  => 'vc_col-sm-6',
		                    'dependency'        => array(
			                    'element' => 'caption_poster_background_size',
			                    'value'   => 'custom',
		                    )
	                    ),








                        /* CSS Editor */
                        array(
                            'type' => 'css_editor',
                            'param_name' => 'css',
                            'group' => esc_html__( 'Design Options', 'ut_shortcodes' ),
                        )

                    )

                )

            ); /* end mapping */
        
        }

        /**
         * CSS Filter
         *
         * @return string A JSON Object with set Filters
         */

        public function css_filter( $atts ) {

            /**
             * @var string $video_filter
             * @var string $video_filter_action
             * @var number $contrast
             * @var number $brightness
             * @var number $saturate
             * @var number $grayscale
             * @var number $blur
             * @var number $sepia
             * @var number $hue
             * @var number $invert
             */
            extract( shortcode_atts( array(

                'video_filter'          => '',
                'video_filter_action'   => 'none',
                'contrast'              => 100,
                'brightness'            => 100,
                'saturate'              => 100,
                'grayscale'             => 0,
                'blur'                  => 0,
                'sepia'                 => 0,
                'hue'                   => 0,
                'invert'                => 0,

            ), $atts ) );

            if( $video_filter != 'yes' ) {
                return false;
            }

            $filter = array();

            // contrast 0-200
            if( $contrast !== '' && $contrast != 100 ) {
                $filter['contrast'] = $contrast;
            }

            // brightness 0-200
            if( $brightness !== '' && $brightness != 100 ) {
                $filter['brightness'] = $brightness;
            }

            // saturate 0-200
            if( $saturate !== '' && $saturate != 100 ) {
                $filter['saturate'] = $saturate;
            }

            // grayscale 0-100
            if( $grayscale ) {
                $filter['grayscale'] = $grayscale;
            }

	        // sepia 0-100
	        if( $sepia ) {
		        $filter['sepia'] = $sepia;
	        }

	        // invert 0-100
	        if( $invert ) {
		        $filter['invert'] = $invert;
	        }

	        // hue 0-360
	        if( $hue ) {
		        $filter['hue_rotate'] = $hue;
	        }

            // blur 0-100
            if( $blur ) {
                $filter['blur'] = $blur;
            }

            // filter action
            if( $video_filter_action ) {
                // $filter['action'] = $video_filter_action;
            }

            return htmlspecialchars( json_encode( $filter ), ENT_QUOTES );

        }

        function custom_css( $id, $atts ) {

            /**
             * @var $border_color
             */
            extract( shortcode_atts( array (
                'border_color'                          =>  '',
                'caption_title_color'                   =>  '',
                'caption_title_hover_color'             =>  '',
                'caption_title_active_color'            =>  '',
                'caption_background_color'              =>  '',
                'caption_background_hover_color'        =>  '',
                'caption_background_active_color'       =>  '',
                'caption_poster_background_size'        =>  '',
                'caption_poster_custom_background_size' =>  '',
            ), $atts ) );

            ob_start();

            if( !empty( $border_color ) ) {

                echo "#$id .bklyn-video-grid a { border-color: $border_color ; }";

            }

            if( !empty( $caption_title_color ) ) {

                echo "#$id .bklyn-video-grid .bklyn-video-grid-content h3 { color: $caption_title_color ; }";

            }

            if( !empty( $caption_title_hover_color ) ) {

                echo "#$id .bklyn-video-grid > a:hover .bklyn-video-grid-content h3 { color: $caption_title_hover_color ; }";

            }

            if( !empty( $caption_title_active_color ) ) {

                echo "#$id .bklyn-video-grid > a.is-playing .bklyn-video-grid-content h3 { color: $caption_title_active_color ; }";

            }

            if( !empty( $caption_background_color ) ) {

                echo "#$id .bklyn-video-grid > a { background: $caption_background_color; }";

            }

            if( !empty( $caption_background_hover_color ) ) {

                echo "#$id .bklyn-video-grid > a:hover { background: $caption_background_hover_color; }";

            }

            if( !empty( $caption_background_active_color ) ) {

                echo "#$id .bklyn-video-grid > a.is-playing { background: $caption_background_active_color; }";

            }

            if( !empty( $caption_poster_background_size ) && in_array( $caption_poster_background_size, array( 'contain', 'cover') ) ) {

                echo "#$id .bklyn-video-grid .bklyn-video-grid-content { background-size: $caption_poster_background_size; }";

            }

            if( !empty( $caption_poster_background_size ) &&  $caption_poster_background_size == 'custom' && !empty( $caption_poster_custom_background_size ) ) {

                echo "#$id .bklyn-video-grid .bklyn-video-grid-content { background-size: $caption_poster_custom_background_size; }";

            }



            echo ut_minify_inline_css( '<style type="text/css">' . ob_get_clean() . '</style>' );

        }

        function ut_create_shortcode( $atts, $content = NULL ) {
            /**
             * @var $grid_videos_location
             * @var $grid_videos_event
             * @var $grid_videos
             * @var $desktop_columns
             * @var $tablet_columns
             * @var $mobile_columns
             */
            extract( shortcode_atts( array (
                'grid_videos_location'  =>  'behind_grid',
                'grid_videos_event'     =>  'hover',
                'grid_videos'           =>  '',
                'desktop_columns'       =>  '2',
                'tablet_columns'        =>  '2',
                'mobile_columns'        =>  '1',
                'css'                   =>  '',
            ), $atts ) );

            $id        = uniqid("ut_vg_");


            $grid_videos = vc_param_group_parse_atts( $grid_videos );


            /* video location */
            global $current_row_id, $current_section_id;

            if( $grid_videos_location == 'behind_grid' ) {

                $containment = $id;

            } elseif( $grid_videos_location == 'behind_row' ) {

                $containment = $current_row_id;

            } else {

                $containment = $current_section_id;

            }

            // @todo column layout desktop / tablet / mobile
            // @todo poster image as caption background
            // @todo color options border / overlay / text
            // @todo unmute button
            // @todo grid height



            $youtube_player_config = array(
                'videoURL'      => $grid_videos[0]['youtube'],
                "startAt"       => $grid_videos[0]['startAt'] ?? "0",
                "stopAt"        => $grid_videos[0]['stopAt'] ?? "0",
                'containment'   => '#' . $containment,
                'mute'          => true,
                'showControls'  => false,
                'ratio'         => 'auto',
                'autoPlay'      => true,
                'opacity'       => 1
            );

            ob_start(); ?>

            <?php $this->custom_css( $id, $atts ); ?>

            <div id="<?php esc_attr_e( $id ); ?>" class="bklyn-video-grid-wrap" data-play-event="<?php esc_attr_e( $grid_videos_event ); ?>">

                <div class="bklyn-video-grid-player" data-filters="<?php echo $this->css_filter( $atts ); ?>" data-property="<?php echo htmlspecialchars( json_encode( $youtube_player_config ), ENT_QUOTES ); ?>">

                </div>

                <div class="bklyn-video-grid bklyn-video-grid-<?php echo $desktop_columns; ?>-col bklyn-video-grid-tablet-<?php echo $tablet_columns; ?>-col bklyn-video-grid-mobile-<?php echo $mobile_columns; ?>-col">

                    <?php foreach( $grid_videos as $key => $video ) :

                    // skip empty video
                    if( empty( $video['youtube'] ) ) {
                        continue;
                    }

                    $properties = array(
                        "videoURL"  => $video['youtube'],
                        "startAt"   => $video['startAt'] ?? "0",
                        "stopAt"    => $video['stopAt'] ?? "0",
                        "mute"      => true,
                        "autoPlay"  => true,
                    );


                    //caption background image URL
                    $caption_poster_url = !empty( $video['poster_caption'] ) ? wp_get_attachment_url( $video['poster_caption'] ) : '';
                    $background_poster_url = !empty( $video['poster_background'] ) ? wp_get_attachment_url( $video['poster_background'] ) : '';






                    $video_url = $video['youtube']; ?>

                    <a class="ut-video-grid-video <?php echo $key == 0 ? 'is-playing' : ''; ?>" href="#" data-property="<?php echo htmlspecialchars( json_encode( $properties ), ENT_QUOTES ); ?>" data-video="<?php echo esc_url( $video_url ); ?>">

                        <div class="bklyn-video-grid-content ut-background-lozad" data-background-image="<?php echo esc_url($caption_poster_url ); ?>">

                            <?php if( !empty( $video['title'] ) ) : ?>

                            <h3><?php echo $video['title']; ?></h3>

                            <?php endif; ?>

                        </div>

                    </a>

                    <?php endforeach; ?>

                </div>

            </div>

            <?php

            /* return player */
            if( defined( 'WPB_VC_VERSION' ) ) {

                return '<div class="wpb_content_element ' . apply_filters( VC_SHORTCODE_CUSTOM_CSS_FILTER_TAG, vc_shortcode_custom_css_class( $css, ' ' ), $this->shortcode, $atts ) . '">' . ob_get_clean() . '</div>';

            }

            return ob_get_clean();


        }
            
    }

}

new UT_Video_Grid;
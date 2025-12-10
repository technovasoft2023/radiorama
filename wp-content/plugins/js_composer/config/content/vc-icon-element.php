<?php
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

function vc_icon_element_params() {
	return array(
		'name' => esc_html__( 'Icon', 'js_composer' ),
		'base' => 'vc_icon',
		'icon' => 'icon-wpb-vc_icon',
		'element_default_class' => 'vc_do_icon',
		'category' => esc_html__( 'Content', 'js_composer' ),
		'description' => esc_html__( 'Eye catching icons from libraries', 'js_composer' ),
		'params' => array(
			array(
				'type' => 'dropdown',
				'heading' => esc_html__( 'Icon library', 'js_composer' ),
				'value' => array(
                    esc_html__( 'Font Awesome 6', 'js_composer' ) => 'fontawesome', //@United
					esc_html__( 'Open Iconic', 'js_composer' ) => 'openiconic',
					esc_html__( 'Typicons', 'js_composer' ) => 'typicons',
					esc_html__( 'Entypo', 'js_composer' ) => 'entypo',
					esc_html__( 'Linecons', 'js_composer' ) => 'linecons',
					esc_html__( 'Mono Social', 'js_composer' ) => 'monosocial',
					esc_html__( 'Material', 'js_composer' ) => 'material',
                    esc_html__( 'Brooklyn Icons', 'ut_shortcodes' ) => 'bklyn', //@United
                    esc_html__( 'Linea Icons (with animated draw)', 'ut_shortcodes' ) => 'linea', //@United
                    esc_html__( 'Orion Icons (with animated draw)', 'ut_shortcodes' ) => 'orion', //@United
				),
				'admin_label' => true,
				'param_name' => 'type',
				'description' => esc_html__( 'Select icon library.', 'js_composer' ),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_fontawesome',
				'value' => 'fas fa-adjust',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'iconsPerPage' => 500,
					// default 100, how many icons per/page to display, we use (big number) to display all icons in single page
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'fontawesome',
				),
				'description' => esc_html__( 'Select icon from library.', 'js_composer' ),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_openiconic',
				'value' => 'vc-oi vc-oi-dial',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'type' => 'openiconic',
					'iconsPerPage' => 4000,
					// default 100, how many icons per/page to display
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'openiconic',
				),
				'description' => esc_html__( 'Select icon from library.', 'js_composer' ),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_typicons',
				'value' => 'typcn typcn-adjust-brightness',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'type' => 'typicons',
					'iconsPerPage' => 4000,
					// default 100, how many icons per/page to display
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'typicons',
				),
				'description' => esc_html__( 'Select icon from library.', 'js_composer' ),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_entypo',
				'value' => 'entypo-icon entypo-icon-note',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'type' => 'entypo',
					'iconsPerPage' => 4000,
					// default 100, how many icons per/page to display
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'entypo',
				),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_linecons',
				'value' => 'vc_li vc_li-heart',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'type' => 'linecons',
					'iconsPerPage' => 4000,
					// default 100, how many icons per/page to display
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'linecons',
				),
				'description' => esc_html__( 'Select icon from library.', 'js_composer' ),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_monosocial',
				'value' => 'vc-mono vc-mono-fivehundredpx',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'type' => 'monosocial',
					'iconsPerPage' => 4000,
					// default 100, how many icons per/page to display
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'monosocial',
				),
				'description' => esc_html__( 'Select icon from library.', 'js_composer' ),
			),
			array(
				'type' => 'iconpicker',
				'heading' => esc_html__( 'Icon', 'js_composer' ),
				'param_name' => 'icon_material',
				'value' => 'vc-material vc-material-cake',
				// default value to backend editor admin_label
				'settings' => array(
					'emptyIcon' => false,
					// default true, display an "EMPTY" icon?
					'type' => 'material',
					'iconsPerPage' => 4000,
					// default 100, how many icons per/page to display
				),
				'dependency' => array(
					'element' => 'type',
					'value' => 'material',
				),
				'description' => esc_html__( 'Select icon from library.', 'js_composer' ),
			),
            /* @United - Icons - Colors etc */
            array(
                'type'              => 'iconpicker',
                'heading'           => esc_html__( 'Icon', 'js_composer' ),
                'param_name'        => 'icon_bklyn',
                'settings' => array(
                    'emptyIcon'     => true,
                    'type'          => 'bklynicons',
                ),
                'dependency' => array(
                    'element'   => 'type',
                    'value'     => 'bklyn',
                ),
                'description' => __( 'Select icon from library.', 'js_composer' ),
            ),
            array(
                'type'              => 'iconpicker',
                'heading'           => esc_html__( 'Icon', 'js_composer' ),
                'param_name'        => 'icon_linea',
                'settings' => array(
                    'emptyIcon'     => true,
                    'type'          => 'lineaicons',
                ),
                'dependency' => array(
                    'element'   => 'type',
                    'value'     => 'linea',
                ),
                'description' => __( 'Select icon from library.', 'js_composer' ),
            ),
            array(
                'type'              => 'iconpicker',
                'heading'           => esc_html__( 'Icon', 'js_composer' ),
                'param_name'        => 'icon_orion',
                'settings' => array(
                    'emptyIcon'     => true,
                    'type'          => 'orionicons',
                ),
                'dependency' => array(
                    'element'   => 'type',
                    'value'     => 'orion',
                ),
                'description' => __( 'Select icon from library.', 'js_composer' ),
            ),
            /* SVG Animation @United -Icons - Colors etc */
            array(
                'type'              => 'dropdown',
                'heading'           => esc_html__( 'Draw SVG Icons?', 'unitedthemes' ),
                'param_name'        => 'draw_svg_icons',
                'group'             => 'Draw Settings',
                'value'             => array(
                    esc_html__( 'yes', 'ut_shortcodes' ) => 'yes',
                    esc_html__( 'no', 'ut_shortcodes' ) => 'no',
                ),
                'dependency' => array(
                    'element'   => 'type',
                    'value'     => array('linea','orion'),
                ),
            ),
            array(
                'type'              => 'dropdown',
                'heading'           => esc_html__( 'Draw Type', 'unitedthemes' ),
                'description'		=> esc_html__( 'Defines what kind of animation will be used.', 'unitedthemes' ),
                'param_name'        => 'draw_svg_type',
                'group'             => 'Draw Settings',
                'value'             => array(
                    esc_html__( 'oneByOne', 'ut_shortcodes' ) 		=> 'oneByOne',
                    esc_html__( 'delayed', 'ut_shortcodes' ) 		=> 'delayed',
                    esc_html__( 'sync', 'ut_shortcodes' ) 			=> 'sync',
                    esc_html__( 'scenario', 'ut_shortcodes' ) 		=> 'scenario',
                    esc_html__( 'scenario-sync', 'ut_shortcodes' ) 	=> 'scenario-sync'
                ),
                'dependency' => array(
                    'element'   => 'draw_svg_icons',
                    'value'     => array('yes'),
                ),
            ),
            array(
                'type'              => 'range_slider',
                'heading'           => esc_html__( 'Animation duration, in frames.', 'ut_shortcodes' ),
                'param_name'        => 'draw_svg_duration',
                'group'             => 'Draw Settings',
                'value'             => array(
                    'default' => '200',
                    'min'     => '10',
                    'max'     => '600',
                    'step'    => '10',
                    'unit'    => ''
                ),
                'dependency' => array(
                    'element'   => 'draw_svg_icons',
                    'value'     => array('yes'),
                ),
            ),
            array(
                'type'              => 'range_slider',
                'heading'           => esc_html__( 'Delay Draw Animation.', 'ut_shortcodes' ),
                'param_name'        => 'draw_svg_delay',
                'group'             => 'Draw Settings',
                'value'             => array(
                    'default' => '0',
                    'min'     => '0',
                    'max'     => '2000',
                    'step'    => '10',
                    'unit'    => ''
                ),
                'dependency' => array(
                    'element'   => 'draw_svg_icons',
                    'value'     => array('yes'),
                ),
            ),

            // end @United
			array(
				'type' => 'dropdown',
				'heading' => esc_html__( 'Icon color', 'js_composer' ),
				'param_name' => 'color',
				'value' => array_merge( vc_get_shared( 'colors' ), array( esc_html__( 'Custom color', 'js_composer' ) => 'custom' ) ),
				'description' => esc_html__( 'Select icon color.', 'js_composer' ),
				'param_holder_class' => 'vc_colored-dropdown',
			),
			array(
				'type' => 'colorpicker',
				'heading' => esc_html__( 'Custom color', 'js_composer' ),
				'param_name' => 'custom_color',
				'description' => esc_html__( 'Select custom icon color.', 'js_composer' ),
				'dependency' => array(
					'element' => 'color',
					'value' => 'custom',
				),
			),
			array(
				'type' => 'dropdown',
				'heading' => esc_html__( 'Background shape', 'js_composer' ),
				'param_name' => 'background_style',
				'value' => array(
					esc_html__( 'None', 'js_composer' ) => '',
					esc_html__( 'Circle', 'js_composer' ) => 'rounded',
					esc_html__( 'Square', 'js_composer' ) => 'boxed',
					esc_html__( 'Rounded', 'js_composer' ) => 'rounded-less',
					esc_html__( 'Outline Circle', 'js_composer' ) => 'rounded-outline',
					esc_html__( 'Outline Square', 'js_composer' ) => 'boxed-outline',
					esc_html__( 'Outline Rounded', 'js_composer' ) => 'rounded-less-outline',
				),
				'description' => esc_html__( 'Select background shape and style for icon.', 'js_composer' ),
			),
			array(
				'type' => 'dropdown',
				'heading' => esc_html__( 'Background color', 'js_composer' ),
				'param_name' => 'background_color',
				'value' => array_merge( vc_get_shared( 'colors' ), array( esc_html__( 'Custom color', 'js_composer' ) => 'custom' ) ),
				'std' => 'grey',
				'description' => esc_html__( 'Select background color for icon.', 'js_composer' ),
				'param_holder_class' => 'vc_colored-dropdown',
				'dependency' => array(
					'element' => 'background_style',
					'not_empty' => true,
				),
			),
			array(
				'type' => 'colorpicker',
				'heading' => esc_html__( 'Custom background color', 'js_composer' ),
				'param_name' => 'custom_background_color',
				'description' => esc_html__( 'Select custom icon background color.', 'js_composer' ),
				'dependency' => array(
					'element' => 'background_color',
					'value' => 'custom',
				),
			),
			array(
				'type' => 'dropdown',
				'heading' => esc_html__( 'Size', 'js_composer' ),
				'param_name' => 'size',
				'value' => array_merge( vc_get_shared( 'sizes' ), array( 'Extra Large' => 'xl' ) ),
				'std' => 'md',
				'description' => esc_html__( 'Icon size.', 'js_composer' ),
			),
			array(
				'type' => 'dropdown',
				'heading' => esc_html__( 'Icon alignment', 'js_composer' ),
				'param_name' => 'align',
				'value' => array(
					esc_html__( 'Left', 'js_composer' ) => 'left',
					esc_html__( 'Right', 'js_composer' ) => 'right',
					esc_html__( 'Center', 'js_composer' ) => 'center',
				),
				'description' => esc_html__( 'Select icon alignment.', 'js_composer' ),
			),
			array(
				'type' => 'vc_link',
				'heading' => esc_html__( 'URL (Link)', 'js_composer' ),
				'param_name' => 'link',
				'description' => esc_html__( 'Add link to icon.', 'js_composer' ),
			),
			vc_map_add_css_animation(),
			array(
				'type' => 'el_id',
				'heading' => esc_html__( 'Element ID', 'js_composer' ),
				'param_name' => 'el_id',
				'description' => sprintf( esc_html__( 'Enter element ID (Note: make sure it is unique and valid according to %1$sw3c specification%2$s).', 'js_composer' ), '<a href="https://www.w3schools.com/tags/att_global_id.asp" target="_blank">', '</a>' ),
			),
			array(
				'type' => 'textfield',
				'heading' => esc_html__( 'Extra class name', 'js_composer' ),
				'param_name' => 'el_class',
				'description' => esc_html__( 'Style particular content element differently - add a class name and refer to it in custom CSS.', 'js_composer' ),
			),
			array(
				'type' => 'css_editor',
				'heading' => esc_html__( 'CSS box', 'js_composer' ),
				'param_name' => 'css',
				'group' => esc_html__( 'Design Options', 'js_composer' )
			),
		),
		'js_view' => 'VcIconElementView_Backend',
	);
}

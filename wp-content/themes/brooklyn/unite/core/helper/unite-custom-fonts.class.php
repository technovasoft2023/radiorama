<?php if (!defined('UT_VERSION')) {
    exit; // exit if accessed directly
}

class UT_Custom_Font_Manager {
	
	protected $_menu_parent = 'unite-welcome-page';
	protected $_capability  = 'edit_theme_options';
	
	public function __construct() {
		
		$this->register_font_taxonomy();
		
		// add to unite welcome page
		add_action( 'admin_menu', array( &$this, 'register_menu' ), 100 );
		add_action( 'admin_head', array( &$this, 'menu_highlight' ) );
		
		add_filter( 'manage_edit-unite_custom_fonts_columns', array( &$this, 'manage_columns' ) );
		add_filter( 'manage_unite_custom_fonts_custom_column', array( &$this, 'manage_custom_columns' ), 10, 3 );
		add_filter( 'manage_edit-unite_custom_fonts_sortable_columns', array( &$this, 'sortable_columns' ) );		

		add_action( 'unite_custom_fonts_add_form_fields', array( &$this, 'extra_new_metadata' ) );
		add_action( 'unite_custom_fonts_edit_form_fields', array( &$this, 'extra_edit_metadata' ) );
		
		// save meta data
		add_action( 'edited_unite_custom_fonts', array( &$this, 'save_metadata' ) );
		add_action( 'create_unite_custom_fonts', array( &$this, 'save_metadata' ) );

		// delete meta data
        add_action( 'delete_unite_custom_fonts', array( &$this, 'delete_metadata' ), 10 , 3 );
		
	}
	
	public function register_menu() {

        $func = 'add_' . 'submenu_page';

        $func(
			$this->_menu_parent,
			esc_html__( 'Theme Custom Fonts', 'unite-admin' ),
			esc_html__( 'Theme Custom Fonts', 'unite-admin' ),
			$this->_capability,
			'edit-tags.php?taxonomy=unite_custom_fonts'
		);
		
	}
	
	public function menu_highlight() {
		
		global $parent_file, $submenu_file;

		if ( 'edit-tags.php?taxonomy=unite_custom_fonts' === $submenu_file ) {
			$parent_file = $this->_menu_parent;
		}

		if ( !isset( get_current_screen()->id ) || 'edit-unite_custom_fonts' !== get_current_screen()->id ) {
			return;
		}
			
		?>

		<style>
			
			#addtag div.form-field.term-slug-wrap,
            #edittag tr.form-field.term-slug-wrap {
                display: none;
            }

			#addtag div.form-field.term-description-wrap,
            #edittag tr.form-field.term-description-wrap {
                display: none;
            }
			
			.ut-ui-media-wrap,
			.ut-ui-remove-media {
				display: none;
			}
			
			.ut-form-field {
				margin-top: 30px !important;
			}
			
			.ut-form-field + p.submit {
				margin-top: 30px !important;
			}
			
			.ut-form-field .ut-ui-upload-input {
				height: 40px;
				width: 95%;
				max-width: 100%;
				font-size: 13px;
				line-height: 20px;
				font-weight: 400;
				margin: 0;
				padding: 0 10px;
			}
			.ut-upload-font {
                display: none;
            }
            .ut-custom-font-upload {
                display: inline-block;
                padding: 8px 12px !important;
                color: #fff !important;
                background: rgba(0, 119, 255, 1);
                cursor: pointer;
                border-radius: 5px;
                max-width: 90px;
                text-align: center;
                margin-top: 15px;
            }
			.ut-form-field .ut-ui-button {
				margin-top: 10px;
			}
			
			.ut-form-field h2 {
				margin-bottom: 0;
			}
			
		</style>

		<script>
			jQuery(document).ready( function( $ ) {
				
				let $wrapper = $( '#addtag, #edittag' );

				$wrapper.find( 'tr.form-field.term-name-wrap p, div.form-field.term-name-wrap > p' ).text( '<?php esc_html_e( 'The name of the font used in the attached CSS file. If you attach an Adobe font stylesheet, this name is only for internal use!', 'unitedthemes' ); ?>' );

				let $font_source = $('#edit-font_source');

				function switch_font_source( value ) {

                    if( value === 'custom' ) {

                        $('.ut-custom-font').show();
                        $('.ut-adobe-font').hide();

                    } else {

                        $('.ut-custom-font').hide();
                        $('.ut-adobe-font').show();
                    }

                }

                switch_font_source( $font_source.val() );

				$font_source.on('change', function () {

                    switch_font_source( $(this).val() );

                });
                $('.ut-upload-font').each(function() {
                    let that = $(this);
                    that.on( 'change', function () {
                        let form_data = new FormData();
                        form_data.append('file', that.prop('files')[0]);
                        form_data.append('action', 'ut_upload_font');
                        form_data.append('nonce', '<?php echo wp_create_nonce("ut-nonce") ?>');
                        $.ajax({
                            url: '<?php echo admin_url('admin-ajax.php'); ?>',
                            type: 'post',
                            contentType: false,
                            processData: false,
                            data: form_data,
                            success: function (response) {
                                let val = response?.data?.url;
                                $(`#edit-${that.data('id')}`).val(val);
                                $(`#edit-${that.data('id')}`).attr('value', val);
                            },
                        })
                    } )
                })
			} );
		</script>

		<?php
		
	}
	
	public function manage_columns( $columns ) {
		
		$old_columns = $columns;

		return array(
			'cb'    => $old_columns['cb'],
			'name'  => $old_columns['name'],
			'ID'    => esc_html__( 'ID', 'unite-admin' ),
		);
		
	}

	public function sortable_columns( $sortable_columns ) {
		
		$sortable_columns['ID'] = 'ID';
		return $sortable_columns;
		
	}

	public function manage_custom_columns( $value, $column_name, $term_id ) {
		
		switch ( $column_name ) {
			case 'ID' :
				$value = '#' . $term_id;
				break;
		}

		return $value;
		
	}
	
	protected function default_args( $fonts ) {
		
		return wp_parse_args(
			$fonts,
			array(
				'font_woff'         => '',
				'font_woff2'        => '',
				'font_ttf'          => '',
				'font_svg'          => '',
				'font_eot'          => '',
				'font_source'       => 'custom',
				'ascent_override'   => '',
				'stylesheet_url'    => '',
			)
		);
		
	}
	
	protected function register_font_taxonomy() {
		
        $register_font_taxonomy = 'register' . '_' . 'taxonomy';

        $labels = array(
            'name'              => __('Custom Fonts', 'unite-admin'),
            'singular_name'     => __('Font', 'unite-admin'),
            'menu_name'         => _x('Custom Fonts', 'Admin menu name', 'unite-admin'),
            'search_items'      => __('Search Fonts', 'unite-admin'),
            'all_items'         => __('All Fonts', 'unite-admin'),
            'parent_item'       => __('Parent Font', 'unite-admin'),
            'parent_item_colon' => __('Parent Font:', 'unite-admin'),
            'edit_item'         => __('Edit Font', 'unite-admin'),
            'update_item'       => __('Update Font', 'unite-admin'),
            'add_new_item'      => __('Add New Font', 'unite-admin'),
            'new_item_name'     => __('New Font Name', 'unite-admin'),
        );
		
		$args = array(
			'hierarchical' => false,
			'labels' => $labels,
			'public' => false,
			'show_in_nav_menus' => false,
			'show_ui' => true,
			'capabilities' => array( 'edit_theme_options' ),
			'query_var' => false,
			'rewrite' => false,
		);
		
		$register_font_taxonomy(
			'unite_custom_fonts',
			apply_filters( 'unite_taxonomy_objects_custom_fonts', array() ),
			apply_filters( 'unite_taxonomy_args_custom_fonts', $args )
		);		
		
	}

	public function extra_new_metadata() {

		$this->print_font_new_select_field(
			'font_source',
			esc_html__( 'Font Source', 'unite-admin' ),
			esc_html__( 'Choose desired font source.', 'unite-admin' )
		);

		$this->print_font_new_input_field(
			'stylesheet_url',
			esc_html__( 'Stylesheet URL', 'unite-admin' ),
			esc_html__( 'Enter stylesheet URL e.g. https://use.typekit.net/XXX.css', 'unite-admin' ),
            true
		);

		$this->print_font_new_field(
			'font_woff',
			esc_html__( 'Font .woff', 'unite-admin' ),
			esc_html__( 'Upload the font\'s woff file.', 'unite-admin' ),
            'application/x-font-woff'
		);
		
		$this->print_font_new_field( 
			'font_woff2', 
			esc_html__( 'Font .woff2', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s woff2 file.', 'unite-admin' ),
            'application/x-font-woff'
		);
		
		$this->print_font_new_field( 
			'font_ttf', 
			esc_html__( 'Font .ttf', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s ttf file.', 'unite-admin' ),
            'application/x-font-ttf'
		);
		
		$this->print_font_new_field( 
			'font_eot', 
			esc_html__( 'Font .eot', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s eot file.', 'unite-admin' ),
            'application/vnd.ms-fontobject'
		);
		
		$this->print_font_new_field( 
			'font_svg', 
			esc_html__( 'Font .svg', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s svg file.', 'unite-admin' ),
            'image/svg+xml'
		);

		$this->print_font_new_input_field(
			'ascent_override',
			esc_html__( 'Ascent Override', 'unite-admin' ),
			esc_html__( 'The ascent-override CSS descriptor defines the ascent metric for the font. The ascent metric is the height above the baseline that CSS uses to lay out line boxes in an inline formatting context.', 'unite-admin' )
		);

		
	}
	
	
	public function extra_edit_metadata( $term ) {
		
		$data = $this->get_font_links( $term->term_id );

		$this->print_font_new_select_edit_field(
			'font_source',
			esc_html__( 'Font Source', 'unite-admin' ),
			esc_html__( 'Choose desired font source.', 'unite-admin' ),
            $data['font_source'] ?? ''
		);

		$this->print_font_new_input_edit_field(
			'stylesheet_url',
			esc_html__( 'Stylesheet URL', 'unite-admin' ),
			esc_html__( 'Enter stylesheet URL e.g. https://use.typekit.net/XXX.css', 'unite-admin' ),
            $data['stylesheet_url'] ?? '',
            true
		);

		$this->print_font_new_edit_field( 
			'font_woff', 
			esc_html__( 'Font .woff', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s woff file', 'unite-admin' ), 
			$data['font_woff'] 
		);
		
		$this->print_font_new_edit_field( 
			'font_woff2', 
			esc_html__( 'Font .woff2', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s woff2 file', 'unite-admin' ), 
			$data['font_woff2'] 
		);
		
		$this->print_font_new_edit_field( 
			'font_ttf', 
			esc_html__( 'Font .ttf', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s ttf file', 'unite-admin' ), $data['font_ttf'] 
		);
		
		$this->print_font_new_edit_field( 
			'font_eot', 
			esc_html__( 'Font .eot', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s eot file', 'unite-admin' ), 
			$data['font_eot'] 
		);
		
		$this->print_font_new_edit_field( 
			'font_svg', 
			esc_html__( 'Font .svg', 'unite-admin' ), 
			esc_html__( 'Upload the font\'s svg file', 'unite-admin' ), 
			$data['font_svg'] 
		);

		$this->print_font_new_input_edit_field(
			'ascent_override',
			esc_html__( 'Ascent Override', 'unite-admin' ),
			esc_html__( 'The ascent-override CSS descriptor defines the ascent metric for the font. The ascent metric is the height above the baseline that CSS uses to lay out line boxes in an inline formatting context.', 'unite-admin' ),
            $data['ascent_override'] ?? ''
		);
		
	}
	
	protected function print_font_new_select_field( $id, $title, $description ) {
		
		echo '<div class="form-field ut-form-field">';
		
			echo '<h2>' . $title . '</h2>';
			echo '<p>' . $description . '</p>';
		
			$field_settings = array(
				'field_id'    => 'edit-' . $id,
				'field_name'  => 'unite_custom_fonts[' . $id . ']',
				'field_label' => $title,
				'field_desc'  => $description,
				'type'        => 'select',
				'field_value' => '',
				'field_class' => '',
                'field_choices'=> array(
                    array(
                        'value' => 'custom',
                        'label' => 'Selfhosted Custom Font'
                    ),
                    array(
                        'value' => 'adobe',
                        'label' => 'Adobe Font'
                    ),

                ),
			);

			call_user_func( 'ot_type_' . $field_settings['type'], $field_settings );
		
		echo '</div>';
		
	}

	protected function print_font_new_input_field( $id, $title, $description, $adobe = false ) {

		echo '<div class="form-field ut-form-field ' . ( $adobe ? 'ut-adobe-font' : '' ) . '">';

			echo '<h2>' . $title . '</h2>';
			echo '<p>' . $description . '</p>';

			$field_settings = array(
				'field_id'    => 'edit-' . $id,
				'field_name'  => 'unite_custom_fonts[' . $id . ']',
				'field_label' => $title,
				'field_desc'  => $description,
				'type'        => 'text',
				'field_value' => '',
				'field_class' => ''
			);

			call_user_func( 'ot_type_' . $field_settings['type'], $field_settings );

		echo '</div>';

	}

	protected function print_font_new_field( $id, $title, $description, $accept = '' ) {

		echo '<div class="form-field ut-form-field ut-custom-font">';

			echo '<h2>' . $title . '</h2>';
			echo '<p>' . $description . '</p>';

            printf('<input id="edit-%s" type="text" name="unite_custom_fonts[%s]"  class="ut-ui-form-input ut-ui-upload-input">',
                esc_attr( $id ),
                esc_attr( $id ),
            );
            printf( '<label for="upload-%s" class="ut-custom-font-upload">%s</label><input type="file" id="upload-%s" class="ut-upload-font" data-id="%s" accept="%s" title="Add File" >',
                esc_attr( $id ),
                esc_html__( 'Select File', 'unitedthemes' ),
                esc_attr( $id ),
                esc_attr( $id ),
                esc_attr( $accept ),
            );

		echo '</div>';

	}
	
	protected function print_font_new_edit_field( $id, $title, $description, $value = '', $accept = '' ) {
		
		echo '<div class="form-field ut-form-field ut-custom-font">';
		
			echo '<h2>' . $title . '</h2>';
			echo '<p>' . $description . '</p>';

            printf('<input id="edit-%s" type="text" name="unite_custom_fonts[%s]" value="%s"  class="ut-ui-form-input ut-ui-upload-input">',
                esc_attr( $id ),
                esc_attr( $id ),
                esc_attr( $value )
            );
            printf( '<label for="upload-%s" class="ut-custom-font-upload">%s</label><input type="file" id="upload-%s" class="ut-upload-font" data-id="%s" accept="%s" title="Add File" >',
                esc_attr( $id ),
                esc_html__( 'Select File', 'unitedthemes' ),
                esc_attr( $id ),
                esc_attr( $id ),
                esc_attr( $accept ),
            );

		echo '</div>';
		
	}

	protected function print_font_new_input_edit_field( $id, $title, $description, $value = '', $adobe = false ) {

		echo '<div class="form-field ut-form-field ' . ( $adobe ? 'ut-adobe-font' : '' ) . '">';

		    echo '<h2>' . $title . '</h2>';
			echo '<p>' . $description . '</p>';

			$field_settings = array(
				'field_id'    => 'edit-' . $id,
				'field_name'  => 'unite_custom_fonts[' . $id . ']',
				'field_label' => $title,
				'field_desc'  => $description,
				'type'        => 'text',
				'field_value' => esc_attr( $value ),
				'field_class' => ''
			);

			call_user_func( 'ot_type_' . $field_settings['type'], $field_settings );

		echo '</div>';

	}

	protected function print_font_new_select_edit_field( $id, $title, $description, $value = '' ) {

		echo '<div class="form-field ut-form-field">';

			echo '<h2>' . $title . '</h2>';
			echo '<p>' . $description . '</p>';

			$field_settings = array(
				'field_id'    => 'edit-' . $id,
				'field_name'  => 'unite_custom_fonts[' . $id . ']',
				'field_label' => $title,
				'field_desc'  => $description,
				'type'        => 'select',
				'field_value' => esc_attr( $value ),
				'field_class' => '',
                'field_choices'=> array(
                    array(
                        'value' => 'custom',
                        'label' => 'Selfhosted Custom Font'
                    ),
                    array(
                        'value' => 'adobe',
                        'label' => 'Adobe Font'
                    ),

                ),
			);

			call_user_func( 'ot_type_' . $field_settings['type'], $field_settings );

		echo '</div>';

	}

	
	public function get_font_links( $term_id ) {
		
		$links = get_option( "taxonomy_unite_custom_fonts_{$term_id}", array() );
		return $this->default_args( $links );
		
	}
	
	public function update_font_links( $posted, $term_id ) {
		
		$links       = $this->get_font_links( $term_id );
		$adobe_links = get_option('unite_adobe_custom_fonts' , array() );

		foreach ( array_keys( $links ) as $key ) {
			
			$links[$key] = $posted[$key] ?? '';

			if( isset( $posted[$key] ) && $posted[$key] == 'adobe' && !empty( $posted['stylesheet_url'] ) ) {

			    if( !in_array( $posted['stylesheet_url'], $adobe_links ) ) {

			        $adobe_links[] = $posted['stylesheet_url'];

                }

            }
			
		}
		
		update_option( "unite_adobe_custom_fonts", $adobe_links );
		update_option( "taxonomy_unite_custom_fonts_{$term_id}", $links );

	}

	public function delete_metadata( $term_id, $term_taxonomy_id, $deleted_term ) {

	    $links       = $this->get_font_links( $term_id );
		$adobe_links = get_option('unite_adobe_custom_fonts' , array() );

		if( isset( $links['font_source'] ) && $links['font_source'] == 'adobe' && !empty( $links['stylesheet_url'] ) ) {

		    if( ( $key = array_search($links['stylesheet_url'], $adobe_links)) !== false ) {

		        unset( $adobe_links[$key] );

            }

		    update_option( "unite_adobe_custom_fonts", $adobe_links );

        }

	    delete_option( "taxonomy_unite_custom_fonts_{$term_id}" );

    }

	public function save_metadata( $term_id ) {
		
		if ( isset( $_POST['unite_custom_fonts'] ) ) {

		    $this->update_font_links( $_POST['unite_custom_fonts'], $term_id );

		}
		
	}
	
}

new UT_Custom_Font_Manager();
<?php defined( 'ABSPATH' ) or die( 'You cannot access this script directly' );

class UT_CF7_Designer {

     /**
     * Header option key, and header manager admin page slug
     * @var string
     */

    private $key = 'unite-cf7-designer';

    /**
     *  Options Title
     * @var string
     */
    private $title;


    public function __construct() {

        /* Title */
        $this->title = esc_html__( 'Contact Form Designer', 'unite-admin' );

        /* run hooks */
        $this->hooks();

    }

    /**
     * Initiate our hooks
     *
     * @since     1.0.0
     * @version   1.0.0
     */

    public function hooks() {

        /* register settings */
        add_action( 'admin_init' , array( $this , 'register_settings' ) );

        /* register section */
        add_action( 'admin_init' , array( $this , 'register_sections' ) );

        /* register settings fields */
        add_action( 'admin_init' , array( $this , 'register_settings_fields' ) );

        /* add menu item */
        add_action( 'admin_menu' , array( $this , 'add_menu_item' ) );

        /* necessary scripts */
        if ( isset($_GET['page']) && $this->key == $_GET['page'] ) {

            add_action( 'admin_enqueue_scripts', array( $this , 'register_cf7_designer_css' ) );
            add_action( 'admin_enqueue_scripts', array( $this , 'register_cf7_designer_js' ) );

        }

    }


    /**
     * Register Settings
     *
     * @since     1.0.0
     * @version   1.0.0
     *
     */

    public function register_settings() {

        register_setting(
            $this->key,
            'unite_cf7_settings',
            array( $this, 'validate_settings' )
        );

    }

    /**
     * Register Sections
     *
     * @since     1.0.0
     * @version   1.0.0
     *
     */

    public function register_sections() {

        add_settings_section(
            'unite_cf7_settings_section',
            esc_html__( 'Settings', 'unite-admin' ),
            array( $this, 'display_section' ),
            $this->key
        );

    }

    /**
     * Callback for add_settings_section()
     *
     * @return    void
     *
     * @access    public
     * @since     1.0.0
     * @version   1.0.0
     *
     */
    public function display_section() { /* nothing to do here */ }


    /**
     * Add Settings Fields
     *
     * @since     1.0.0
     * @version   1.0.0
     *
     */

    public function register_settings_fields() {

        add_settings_field(
            'unite_cf7_settings',
            esc_html__( 'Contact Form 7 Designer', 'unite-admin' ),
            array( $this , 'header_cf7_input' ),
            $this->key,
            'unite_cf7_settings_section',
            array( 'name' => 'unite_cf7_settings')
        );

    }

    /**
     * Add to menu
     *
     * @since     1.0.0
     * @version   1.0.0
     *
     */
    public function add_menu_item() {

        add_submenu_page(
                'unite-welcome-page',
                $this->title,
                $this->title,
                'manage_options',
                $this->key,
                array( $this , 'admin_page_display' )
        );

    }

    /**
     * Header Manager Admin CSS
     *
     * @since     1.0.0
     * @version   1.0.0
     *
     */
    public function register_cf7_designer_css() {

        $min = NULL;

        if( !WP_DEBUG ){
            $min = '.min';
        }

         wp_enqueue_style(
            'unite-cf7-designer',
            FW_WEB_ROOT . '/core/admin/assets/css/unite-cf7-designer-admin' . $min . '.css',
            array('unite-modal'),
            UT_THEME_VERSION
        );

    }

    /**
     * Header Manager Admin JS
     *
     * @since     1.0.0
     * @version   1.0.0
     */
    public function register_cf7_designer_js() {

        $min = NULL;

        if( !WP_DEBUG ){
            $min = '.min';
        }

        wp_enqueue_script(
            'unite-cf7designer',
            FW_WEB_ROOT . '/core/admin/assets/js/unite-cf7-designer-admin' . $min . '.js',
            array(
                'jquery',
                'jquery-ui-droppable',
                'jquery-ui-draggable',
                'jquery-ui-sortable',
                'jquery-effects-highlight',
            ),
            UT_THEME_VERSION
        );

        wp_localize_script('unite-cf7designer' , 'submit_default_colors' , array(
            'submit_button_color'               => '#151515',
            'submit_button_hover_color'         => get_option('ut_accentcolor' , '#F1C40F'),
            'submit_button_text_color'          => '#FFF',
            'submit_button_text_hover_color'    => '#FFF',
            'submit_button-padding-top'         => '8',
            'submit_button-padding-right'       => '12',
            'submit_button-padding-bottom'      => '8',
            'submit_button-padding-left'        => '12'
        ) );

        wp_localize_script('unite-cf7designer' , 'unite_cf7_notifications' , array(
            'success_title'           =>  esc_html__('Saved','unitedthemes'),
            'success_message'         =>  esc_html__('Successfully saved contact form 7 design.','unitedthemes'),
            'delete_title'            =>  esc_html__('Deleted','unitedthemes'),
            'delete_message'          =>  esc_html__('Successfully deleted contact form 7 design.','unitedthemes'),
            'delete_question_title'   =>  esc_html__('Delete current design?','unitedthemes'),
            'delete_question_message' =>  esc_html__('Are you sure, you want to delete the current design?','unitedthemes'),
        ) );

    }

    /**
     * Admin Page Markup
     *
     * @since     1.0.0
     * @version   1.0.0
     *
     */
    public function admin_page_display() {

        $_skin_settings = get_option('unite-cf7-designs');
        $skin_switch    = array();
        $unique_id      = '';

        if( is_array( $_skin_settings ) && !empty( $_skin_settings ) ) {

            $skin_settings = $_skin_settings[key($_skin_settings )];

            if( isset( $_GET['new_skin']) ) {

                $unique_id = uniqid("ut_id_");

                $skin_switch[] = array(
                    'label' => esc_html__( 'New Design', 'unite-admin' ),
                    'value' => $unique_id
                );

            }

            foreach( $_skin_settings as $skin ) {

                $skin_switch[] = array(
                    'label' => !empty( $skin['title'] ) ? $skin['title'] : '',
                    'value' => !empty( $skin['unique_id'] ) ? $skin['unique_id'] : ''
                );

            }

        }

        // create new skin
        if( isset( $_GET['new_skin']) ) {

            $skin_settings = array();

        }

        // edit existing skin
        if( isset( $_GET['edit_skin'] ) && isset( $_skin_settings[$_GET['edit_skin']] ) ) {

            $skin_settings = $_skin_settings[$_GET['edit_skin']];

        } ?>

        <!-- Start UT-Backend-Wrap -->
        <div id="ut-admin-wrap" class="clearfix">

            <div id="ut-ui-admin-header">

                <div class="grid-10 medium-grid-15 tablet-grid-20 hide-on-mobile grid-parent">

                    <div class="ut-admin-branding">
                        <a href="https://www.unitedthemes.com" target="_blank"><img src="<?php echo THEME_WEB_ROOT; ?>/unite-custom/admin/assets/img/icons/ut-logo.svg" alt="UnitedThemes"><span class="version-number">Version <?php echo UT_THEME_VERSION; ?></span></a>
                    </div>

                </div>

                <div class="grid-90 medium-grid-85 tablet-grid-80 mobile-grid-100 grid-parent">

                <div class="ut-admin-header-title">

                    <h1><?php esc_html_e( 'Contact Form 7 Designer.', 'unite-admin' ); ?></h1>

                </div>

                </div>

            </div>

            <div class="ut-option-holder">

                <div class="">

                    <div class="ut-dashboard-widget">

                        <div class="ut-widget-hero">

                            <h3>
                                <?php esc_html_e( 'Form Styling', 'unite-admin' ); ?>

                                <div class="unite-form-designer-controls">

                                    <?php if( !empty( $skin_switch ) ) {

                                        ut_call_option_by_type(array(
                                            'type' => 'select',
                                            'field_id' => 'switch-skin',
                                            'field_value' => !empty($skin_settings['unique_id']) ? $skin_settings['unique_id'] : '',
                                            'field_mode' => '',
                                            'field_name' => 'skin',
                                            'field_class' => 'unite-switch-skin',
                                            'field_choices' => $skin_switch
                                        ));

                                    } ?>

                                    <a id="unite-delete-cf7-design" href="<?php echo esc_url( admin_url( '/admin.php?page=unite-cf7-designer' ) ); ?>" class="ut-ui-button ut-ui-button-health"><?php esc_html_e( 'Delete Current Design','unitedthemes' ); ?></a>
                                    <a href="<?php echo esc_url( admin_url( '/admin.php?page=unite-cf7-designer&new_skin' ) ); ?>" class="ut-ui-button"><?php esc_html_e( 'Add New Design','unitedthemes' ); ?></a>

                                </div>

                            </h3>

                        </div>

                        <div id="unite-form-designer">

                            <input id="unite-cf7-designer-nonce" type="hidden" name="unite_cf7_designer_nonce" value="<?php echo wp_create_nonce( 'unite-cf7-designer-nonce' ); ?>" />

                            <form id="unite-form-settings">

                                <div class="ut-panel-section">

                                    <label for="title"><?php esc_html_e('Title' , 'unitedthemes'); ?></label>

                                    <?php ut_call_option_by_type (array(
                                        'type'                  => 'text',
                                        'field_id'              => 'title',
                                        'field_value'           => !empty( $skin_settings['title'] ) ? $skin_settings['title'] : '',
                                        'field_name'            => 'title',
                                        'field_class'           => 'unite-change-form-title',
                                    ) ); ?>

                                </div>

                                <div class="ut-panel-section">

                                    <label for="form-background"><?php esc_html_e('Form Background Color' , 'unitedthemes'); ?> <sup><?php esc_html_e('(only for internal use)' , 'unitedthemes'); ?></sup></label>

                                    <?php ot_type_colorpicker(array(
                                        'field_id'              => 'form-background',
                                        'field_value'           => !empty( $skin_settings['form_background'] ) ? $skin_settings['form_background'] : '#FFF',
                                        'field_mode'            => 'rgb',
                                        'field_std'             => '#FFF',
                                        'field_name'            => 'form_background',
                                        'field_class'           => 'unite-change-form-background',
                                    )); ?>


                                    <?php ut_call_option_by_type (array(
                                        'type'                  => 'unique_id',
                                        'field_id'              => 'unique_id',
                                        'field_value'           => !empty( $skin_settings['unique_id'] ) ? $skin_settings['unique_id'] : $unique_id,
                                        'field_name'            => 'unique_id',
                                    ) ); ?>

                                </div>

                                <div class="ut-panel-section">

                                    <div class="ut-button-builder">

                                        <ul class="ut-button-builder-tabs clearfix" data-tabgroup="contact_form_7_group">

                                            <li><a href="#contact_form_7_tab_label_color" class="active"><?php esc_html_e('Font Settings' , 'unitedthemes'); ?></a></li>
                                            <li><a href="#contact_form_7_tab_color" class=""><?php esc_html_e('Form Colors' , 'unitedthemes'); ?></a></li>
                                            <li><a href="#contact_form_7_tab_messages" class=""><?php esc_html_e('Message Colors' , 'unitedthemes'); ?></a></li>
                                            <li><a href="#contact_form_7_tab_submit" class=""><?php esc_html_e('Submit Button' , 'unitedthemes'); ?></a></li>
                                            <li><a href="#contact_form_7_tab_design" class=""><?php esc_html_e('Spacings' , 'unitedthemes'); ?></a></li>

                                        </ul>

                                        <section id="contact_form_7_group" class="ut-button-builder-tabgroup">

                                            <div id="contact_form_7_tab_label_color">

                                                <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                    <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Label' , 'unitedthemes'); ?></h2></div>
                                                </div>

                                                <div class="ut-single-options-group clearfix">

                                                    <div class="ut-single-options-wrap ut-single-options-wrap-half ut-numeric-slider-outer-wrap">

                                                        <label for="label-font-size"><?php esc_html_e('Font Size' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'label-font-size',
                                                            'field_value'           => !empty( $skin_settings['label_font_size'] ) ? $skin_settings['label_font_size'] : '14',
                                                            'field_name'            => 'label_font_size',
                                                            'field_class'           => '',
                                                            'field_min_max_step'    => '8,48,1'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="label-letter-spacing"><?php esc_html_e('Letter Spacing' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'label-letter-spacing',
                                                            'field_value'           => !empty( $skin_settings['label_letter_spacing'] ) ? $skin_settings['label_letter_spacing'] : '0',
                                                            'field_name'            => 'label_letter_spacing',
                                                            'field_class'           => '',
                                                            'field_min_max_step'    => '-0.2,0.201,0.01'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="label-line-height"><?php esc_html_e('Line Height' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'label-line-height',
                                                            'field_value'           => !empty( $skin_settings['label_line_height'] ) ? $skin_settings['label_line_height'] : '1.2',
                                                            'field_name'            => 'label_line_height',
                                                            'field_class'           => 'unite-change-input-height',
                                                            'field_min_max_step'    => '1,4,0.1'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="label-font-weight"><?php esc_html_e('Font Weight' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'select',
                                                            'field_id'              => 'label-font-weight',
                                                            'field_value'           => !empty( $skin_settings['label_font_weight'] ) ? $skin_settings['label_font_weight'] : 'normal',
                                                            'field_name'            => 'label_font_weight',
                                                            'field_std'             => 'normal',
                                                            'field_class'           => 'unite-change-label-font-weight',
                                                            'field_choices' => array(
                                                                array(
                                                                    'value' => 'normal',
                                                                    'label' => 'normal'
                                                                ),
                                                                array(
                                                                    'value' => 'bold',
                                                                    'label' => 'bold'
                                                                ),
                                                                array(
                                                                    'value' => '100',
                                                                    'label' => '100'
                                                                ),
                                                                array(
                                                                    'value' => '200',
                                                                    'label' => '200'
                                                                ),
                                                                array(
                                                                    'value' => '300',
                                                                    'label' => '300'
                                                                ),
                                                                array(
                                                                    'value' => '400',
                                                                    'label' => '400'
                                                                ),
                                                                array(
                                                                    'value' => '500',
                                                                    'label' => '500'
                                                                ),
                                                                array(
                                                                    'value' => '600',
                                                                    'label' => '600'
                                                                ),
                                                                array(
                                                                    'value' => '700',
                                                                    'label' => '700'
                                                                ),
                                                                array(
                                                                    'value' => '800',
                                                                    'label' => '800'
                                                                ),
                                                                array(
                                                                    'value' => '900',
                                                                    'label' => '900'
                                                                )

                                                            )
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="label-text-transform"><?php esc_html_e('Text Transform' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'select',
                                                            'field_id'              => 'label-text-transform',
                                                            'field_value'           => !empty( $skin_settings['label_text_transform'] ) ? $skin_settings['label_text_transform'] : 'normal',
                                                            'field_name'            => 'label_text_transform',
                                                            'field_std'             => 'none',
                                                            'field_choices' => array(
                                                                array(
                                                                    'value' => 'none',
                                                                    'label' => 'none'
                                                                ),
                                                                array(
                                                                    'value' => 'capitalize',
                                                                    'label' => 'capitalize'
                                                                ),
                                                                array(
                                                                    'value' => 'lowercase',
                                                                    'label' => 'lowercase'
                                                                ),
                                                                array(
                                                                    'value' => 'none',
                                                                    'label' => 'none'
                                                                ),
                                                                array(
                                                                    'value' => 'uppercase',
                                                                    'label' => 'uppercase'
                                                                ),
                                                            )
                                                        ) ); ?>

                                                    </div>

                                                </div>

                                                <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                    <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Form Fields' , 'unitedthemes'); ?></h2></div>
                                                </div>

                                                <div class="ut-single-options-group clearfix">

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="font-size"><?php esc_html_e('Font Size' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'font-size',
                                                            'field_value'           => !empty( $skin_settings['font_size'] ) ? $skin_settings['font_size'] : '14',
                                                            'field_name'            => 'font_size',
                                                            'field_class'           => 'unite-change-font-size',
                                                            'field_min_max_step'    => '8,48,1'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="letter-spacing"><?php esc_html_e('Letter Spacing' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'letter-spacing',
                                                            'field_value'           => !empty( $skin_settings['letter_spacing'] ) ? $skin_settings['letter_spacing'] : '0',
                                                            'field_name'            => 'letter_spacing',
                                                            'field_class'           => '',
                                                            'field_min_max_step'    => '-0.2,0.201,0.01'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="line-height"><?php esc_html_e('Line Height' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'line-height',
                                                            'field_value'           => !empty( $skin_settings['line_height'] ) ? $skin_settings['line_height'] : '1.2',
                                                            'field_name'            => 'line_height',
                                                            'field_class'           => 'unite-change-input-height',
                                                            'field_min_max_step'    => '1,4,0.1'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="font-weight"><?php esc_html_e('Font Weight' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'select',
                                                            'field_id'              => 'font-weight',
                                                            'field_value'           => !empty( $skin_settings['font_weight'] ) ? $skin_settings['font_weight'] : 'normal',
                                                            'field_name'            => 'font_weight',
                                                            'field_std'             => 'normal',
                                                            'field_choices' => array(
                                                                array(
                                                                    'value' => 'normal',
                                                                    'label' => 'normal'
                                                                ),
                                                                array(
                                                                    'value' => 'bold',
                                                                    'label' => 'bold'
                                                                ),
                                                                array(
                                                                    'value' => '100',
                                                                    'label' => '100'
                                                                ),
                                                                array(
                                                                    'value' => '200',
                                                                    'label' => '200'
                                                                ),
                                                                array(
                                                                    'value' => '300',
                                                                    'label' => '300'
                                                                ),
                                                                array(
                                                                    'value' => '400',
                                                                    'label' => '400'
                                                                ),
                                                                array(
                                                                    'value' => '500',
                                                                    'label' => '500'
                                                                ),
                                                                array(
                                                                    'value' => '600',
                                                                    'label' => '600'
                                                                ),
                                                                array(
                                                                    'value' => '700',
                                                                    'label' => '700'
                                                                ),
                                                                array(
                                                                    'value' => '800',
                                                                    'label' => '800'
                                                                ),
                                                                array(
                                                                    'value' => '900',
                                                                    'label' => '900'
                                                                )

                                                            )
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="text-transform"><?php esc_html_e('Text Transform' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'select',
                                                            'field_id'              => 'text-transform',
                                                            'field_value'           => !empty( $skin_settings['text_transform'] ) ? $skin_settings['text_transform'] : 'normal',
                                                            'field_name'            => 'text_transform',
                                                            'field_std'             => 'none',
                                                            'field_choices' => array(
                                                                array(
                                                                    'value' => 'none',
                                                                    'label' => 'none'
                                                                ),
                                                                array(
                                                                    'value' => 'capitalize',
                                                                    'label' => 'capitalize'
                                                                ),
                                                                array(
                                                                    'value' => 'lowercase',
                                                                    'label' => 'lowercase'
                                                                ),
                                                                array(
                                                                    'value' => 'none',
                                                                    'label' => 'none'
                                                                ),
                                                                array(
                                                                    'value' => 'uppercase',
                                                                    'label' => 'uppercase'
                                                                ),
                                                            )
                                                        ) ); ?>

                                                    </div>

                                                </div>

                                                <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                    <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Messages' , 'unitedthemes'); ?></h2></div>
                                                </div>

                                                <div class="ut-single-options-group clearfix">

                                                    <div class="ut-single-options-wrap ut-single-options-wrap-half ut-numeric-slider-outer-wrap">

                                                        <label for="message-font-size"><?php esc_html_e('Font Size' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'message-font-size',
                                                            'field_value'           => !empty( $skin_settings['message_font_size'] ) ? $skin_settings['message_font_size'] : '14',
                                                            'field_name'            => 'message_font_size',
                                                            'field_class'           => '',
                                                            'field_min_max_step'    => '8,48,1'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="message-letter-spacing"><?php esc_html_e('Letter Spacing' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'message-letter-spacing',
                                                            'field_value'           => !empty( $skin_settings['message_letter_spacing'] ) ? $skin_settings['message_letter_spacing'] : '0',
                                                            'field_name'            => 'message_letter_spacing',
                                                            'field_class'           => '',
                                                            'field_min_max_step'    => '-0.2,0.201,0.01'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap ut-numeric-slider-outer-wrap">

                                                        <label for="message-line-height"><?php esc_html_e('Line Height' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'numeric_slider',
                                                            'field_id'              => 'message-line-height',
                                                            'field_value'           => !empty( $skin_settings['message_line_height'] ) ? $skin_settings['message_line_height'] : '2',
                                                            'field_name'            => 'message_line_height',
                                                            'field_min_max_step'    => '1,4,0.1'
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="message-font-weight"><?php esc_html_e('Font Weight' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'select',
                                                            'field_id'              => 'message-font-weight',
                                                            'field_value'           => !empty( $skin_settings['message_font_weight'] ) ? $skin_settings['message_font_weight'] : 'normal',
                                                            'field_name'            => 'message_font_weight',
                                                            'field_std'             => 'normal',
                                                            'field_choices' => array(
                                                                array(
                                                                    'value' => 'normal',
                                                                    'label' => 'normal'
                                                                ),
                                                                array(
                                                                    'value' => 'bold',
                                                                    'label' => 'bold'
                                                                ),
                                                                array(
                                                                    'value' => '100',
                                                                    'label' => '100'
                                                                ),
                                                                array(
                                                                    'value' => '200',
                                                                    'label' => '200'
                                                                ),
                                                                array(
                                                                    'value' => '300',
                                                                    'label' => '300'
                                                                ),
                                                                array(
                                                                    'value' => '400',
                                                                    'label' => '400'
                                                                ),
                                                                array(
                                                                    'value' => '500',
                                                                    'label' => '500'
                                                                ),
                                                                array(
                                                                    'value' => '600',
                                                                    'label' => '600'
                                                                ),
                                                                array(
                                                                    'value' => '700',
                                                                    'label' => '700'
                                                                ),
                                                                array(
                                                                    'value' => '800',
                                                                    'label' => '800'
                                                                ),
                                                                array(
                                                                    'value' => '900',
                                                                    'label' => '900'
                                                                )

                                                            )
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="message-text-transform"><?php esc_html_e('Text Transform' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'select',
                                                            'field_id'              => 'message-text-transform',
                                                            'field_value'           => !empty( $skin_settings['message_text_transform'] ) ? $skin_settings['message_text_transform'] : 'normal',
                                                            'field_name'            => 'message_text_transform',
                                                            'field_std'             => 'none',
                                                            'field_choices' => array(
                                                                array(
                                                                    'value' => 'none',
                                                                    'label' => 'none'
                                                                ),
                                                                array(
                                                                    'value' => 'capitalize',
                                                                    'label' => 'capitalize'
                                                                ),
                                                                array(
                                                                    'value' => 'lowercase',
                                                                    'label' => 'lowercase'
                                                                ),
                                                                array(
                                                                    'value' => 'none',
                                                                    'label' => 'none'
                                                                ),
                                                                array(
                                                                    'value' => 'uppercase',
                                                                    'label' => 'uppercase'
                                                                ),
                                                            )
                                                        ) ); ?>

                                                    </div>

                                                </div>

                                            </div>

                                            <div id="contact_form_7_tab_color">

                                                <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                    <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Label' , 'unitedthemes'); ?></h2></div>
                                                </div>

                                                <div class="ut-single-options-group clearfix">

                                                    <div class="ut-single-options-wrap">

                                                        <label for="label-color"><?php esc_html_e('Label Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'label-color',
                                                            'field_value'           => !empty( $skin_settings['label_color'] ) ? $skin_settings['label_color'] : '#333333',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'label_color',
                                                            'field_class'           => 'unite-change-label-color',
                                                        ) ); ?>

                                                    </div>

                                                </div>

                                                <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                    <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Form Fields' , 'unitedthemes'); ?></h2></div>
                                                </div>

                                                <div class="ut-single-options-group clearfix">

                                                    <div class="ut-single-options-wrap">

                                                        <label for="color"><?php esc_html_e('Input Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'color',
                                                            'field_value'           => !empty( $skin_settings['color'] ) ? $skin_settings['color'] : '#b2b2b6',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'color',
                                                            'field_class'           => 'unite-change-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="focus-color"><?php esc_html_e('Input Focus Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'focus-color',
                                                            'field_value'           => !empty( $skin_settings['focus_color'] ) ? $skin_settings['focus_color'] : '#151515',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'focus_color',
                                                            'field_class'           => 'unite-change-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="color"><?php esc_html_e('Input Placeholder Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'placeholder-color',
                                                            'field_value'           => !empty( $skin_settings['placeholder_color'] ) ? $skin_settings['placeholder_color'] : '#b2b2b6',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'placeholder_color',
                                                            'field_class'           => 'unite-change-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="focus-color"><?php esc_html_e('Input Placeholder Focus Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'placeholder-focus-color',
                                                            'field_value'           => !empty( $skin_settings['placeholder_focus_color'] ) ? $skin_settings['placeholder_focus_color'] : '#151515',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'placeholder_focus_color',
                                                            'field_class'           => 'unite-change-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="border-color"><?php esc_html_e('Border Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'border-color',
                                                            'field_value'           => !empty( $skin_settings['border_color'] ) ? $skin_settings['border_color'] : '#DDDDDD',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'border_color',
                                                            'field_class'           => 'unite-change-border-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="border-focus-color"><?php esc_html_e('Border Focus Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'focus-border-color',
                                                            'field_value'           => !empty( $skin_settings['focus_border_color'] ) ? $skin_settings['focus_border_color'] : '#DDDDDD',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'focus_border_color',
                                                            'field_class'           => 'unite-change-border-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="background"><?php esc_html_e('Background Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'background',
                                                            'field_value'           => !empty( $skin_settings['background'] ) ? $skin_settings['background'] : 'transparent',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'background',
                                                            'field_class'           => 'unite-change-background-color',
                                                        ) ); ?>

                                                    </div>

                                                    <div class="ut-single-options-wrap">

                                                        <label for="background-focus"><?php esc_html_e('Background Focus Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'focus-background',
                                                            'field_value'           => !empty( $skin_settings['focus_background'] ) ? $skin_settings['focus_background'] : 'transparent',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'focus_background',
                                                            'field_class'           => 'unite-change-background-color',
                                                        ) ); ?>

                                                    </div>

                                                </div>

                                                <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                    <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Validation Info' , 'unitedthemes'); ?></h2></div>
                                                </div>

                                                <div class="ut-single-options-group clearfix">

                                                    <div class="ut-single-options-wrap">

                                                        <label for="label-color"><?php esc_html_e('Validation Color' , 'unitedthemes'); ?></label>

                                                        <?php ut_call_option_by_type (array(
                                                            'type'                  => 'colorpicker',
                                                            'field_id'              => 'validation-color',
                                                            'field_value'           => !empty( $skin_settings['validation_color'] ) ? $skin_settings['validation_color'] : '#333333',
                                                            'field_mode'            => 'rgb',
                                                            'field_name'            => 'validation_color',
                                                            'field_class'           => 'unite-change-label-color',
                                                        ) ); ?>

                                                    </div>

                                                </div>


                                        </div>

                                        <div id="contact_form_7_tab_design">

                                            <div class="ut-single-options-wrap">

                                                <label for="color"><?php esc_html_e('Spacing Between Form Elements' , 'unitedthemes'); ?></label>

                                                <?php ut_call_option_by_type (array(
                                                    'type'                  => 'numeric_slider',
                                                    'field_id'              => 'margin_bottom',
                                                    'field_value'           => !empty( $skin_settings['margin_bottom'] ) ? $skin_settings['margin_bottom'] : '20',
                                                    'field_name'            => 'margin_bottom',
                                                    'field_min_max_step'    => '0,120,1'
                                                ) ); ?>

                                            </div>

                                            <div class="ut-single-options-wrap">

                                                <label for="color"><?php esc_html_e('Label Spacing Bottom' , 'unitedthemes'); ?></label>

                                                <?php ut_call_option_by_type (array(
                                                    'type'                  => 'numeric_slider',
                                                    'field_id'              => 'label-margin-bottom',
                                                    'field_value'           => !empty( $skin_settings['label_margin_bottom'] ) ? $skin_settings['label_margin_bottom'] : '0',
                                                    'field_name'            => 'label_margin_bottom',
                                                    'field_min_max_step'    => '0,20,1'
                                                ) ); ?>

                                            </div>

                                            <div class="ut-single-options-wrap">

                                                <label for="color"><?php esc_html_e('Input Padding' , 'unitedthemes'); ?></label>

                                                <?php ut_call_option_by_type (array(
                                                    'type'                  => 'numeric_slider',
                                                    'field_id'              => 'padding',
                                                    'field_value'           => !empty( $skin_settings['padding'] ) ? $skin_settings['padding'] : '10',
                                                    'field_name'            => 'padding',
                                                    'field_class'           => '',
                                                    'field_min_max_step'    => '0,30,1'
                                                ) ); ?>

                                            </div>

                                            <div class="ut-single-options-wrap">

                                                <label for="color"><?php esc_html_e('Textarea Rows' , 'unitedthemes'); ?></label>

                                                <?php ut_call_option_by_type (array(
                                                    'type'                  => 'numeric_slider',
                                                    'field_id'              => 'textarea-rows',
                                                    'field_value'           => !empty( $skin_settings['textarea_rows'] ) ? $skin_settings['textarea_rows'] : '5',
                                                    'field_name'            => 'textarea_rows',
                                                    'field_class'           => '',
                                                    'field_min_max_step'    => '2,30,1'
                                                ) ); ?>

                                            </div>

                                            <div class="clear"></div>

                                        </div>

                                        <div id="contact_form_7_tab_submit">

                                            <?php ut_call_option_by_type (array(
                                                'type'                  => 'button-builder',
                                                'field_id'              => 'submit_button',
                                                'field_value'           => !empty( $skin_settings['submit_button'] ) ? $skin_settings['submit_button'] : '',
                                                'field_name'            => 'submit_button'
                                            ) ); ?>

                                            <div class="clear"></div>

                                        </div>

                                        <div id="contact_form_7_tab_messages">

                                            <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Default Message' , 'unitedthemes'); ?></h2></div>
                                            </div>

                                            <div class="ut-single-options-group clearfix">

                                                <div class="ut-single-options-wrap">

                                                    <label for="default-message-background"><?php esc_html_e('Background Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'default-message-background',
                                                        'field_value'           => !empty( $skin_settings['default_message_background'] ) ? $skin_settings['default_message_background'] : 'transparent',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'default_message_background'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="default-message-color"><?php esc_html_e('Message Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'default-message-color',
                                                        'field_value'           => !empty( $skin_settings['default_message_color'] ) ? $skin_settings['default_message_color'] : '#00a0d2',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'default_message_color'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="default-message-border-color"><?php esc_html_e('Border Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'default-message-border-color',
                                                        'field_value'           => !empty( $skin_settings['default_message_border_color'] ) ? $skin_settings['default_message_border_color'] : '#00a0d2',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'default_message_border_color'
                                                    ) ); ?>

                                                </div>

                                            </div>

                                            <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Sent Message' , 'unitedthemes'); ?></h2></div>
                                            </div>

                                            <div class="ut-single-options-group clearfix">

                                                <div class="ut-single-options-wrap">

                                                    <label for="sent-message-background"><?php esc_html_e('Background Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'sent-message-background',
                                                        'field_value'           => !empty( $skin_settings['sent_message_background'] ) ? $skin_settings['sent_message_background'] : 'transparent',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'sent_message_background'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="sent-message-color"><?php esc_html_e('Message Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'sent-message-color',
                                                        'field_value'           => !empty( $skin_settings['sent_message_color'] ) ? $skin_settings['sent_message_color'] : '#46b450',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'sent_message_color'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="sent-message-border-color"><?php esc_html_e('Border Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'sent-message-border-color',
                                                        'field_value'           => !empty( $skin_settings['sent_message_border_color'] ) ? $skin_settings['sent_message_border_color'] : '#46b450',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'sent_message_border_color'
                                                    ) ); ?>

                                                </div>

                                            </div>

                                            <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Invalid Message' , 'unitedthemes'); ?></h2></div>
                                            </div>

                                            <div class="ut-single-options-group clearfix">

                                                <div class="ut-single-options-wrap">

                                                    <label for="invalid-message-background"><?php esc_html_e('Background Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'invalid-message-background',
                                                        'field_value'           => !empty( $skin_settings['invalid_message_background'] ) ? $skin_settings['invalid_message_background'] : 'transparent',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'invalid_message_background'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="invalid-message-color"><?php esc_html_e('Message Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'invalid-message-color',
                                                        'field_value'           => !empty( $skin_settings['invalid_message_color'] ) ? $skin_settings['invalid_message_color'] : '#ffb900',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'invalid_message_color'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="invalid-message-border-color"><?php esc_html_e('Border Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'invalid-message-border-color',
                                                        'field_value'           => !empty( $skin_settings['invalid_message_border_color'] ) ? $skin_settings['invalid_message_border_color'] : '#ffb900',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'invalid_message_border_color'
                                                    ) ); ?>

                                                </div>

                                            </div>

                                            <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Failed Message' , 'unitedthemes'); ?></h2></div>
                                            </div>

                                            <div class="ut-single-options-group clearfix">

                                                <div class="ut-single-options-wrap">

                                                    <label for="failed-message-background"><?php esc_html_e('Background Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'failed-message-background',
                                                        'field_value'           => !empty( $skin_settings['failed_message_background'] ) ? $skin_settings['failed_message_background'] : 'transparent',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'failed_message_background'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="failed-message-color"><?php esc_html_e('Message Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'failed-message-color',
                                                        'field_value'           => !empty( $skin_settings['failed_message_color'] ) ? $skin_settings['failed_message_color'] : '#dc3232',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'failed_message_color'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="failed-message-border-color"><?php esc_html_e('Border Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'failed-message-border-color',
                                                        'field_value'           => !empty( $skin_settings['failed_message_border_color'] ) ? $skin_settings['failed_message_border_color'] : '#dc3232',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'failed_message_border_color'
                                                    ) ); ?>

                                                </div>

                                            </div>

                                            <div class="ut-single-options-wrap ut-single-options-wrap-full">
                                                <div class="ut-section-headline-content"><h2 class="ut-section-title"><?php esc_html_e('Spam Message' , 'unitedthemes'); ?></h2></div>
                                            </div>

                                            <div class="ut-single-options-group clearfix">

                                                <div class="ut-single-options-wrap">

                                                    <label for="spam-message-background"><?php esc_html_e('Background Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'spam-message-background',
                                                        'field_value'           => !empty( $skin_settings['spam_message_background'] ) ? $skin_settings['spam_message_background'] : 'transparent',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'spam_message_background'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="spam-message-color"><?php esc_html_e('Message Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'spam-message-color',
                                                        'field_value'           => !empty( $skin_settings['spam_message_color'] ) ? $skin_settings['spam_message_color'] : '#f56e28',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'spam_message_color'
                                                    ) ); ?>

                                                </div>

                                                <div class="ut-single-options-wrap">

                                                    <label for="spam-message-border-color"><?php esc_html_e('Border Color' , 'unitedthemes'); ?></label>

                                                    <?php ut_call_option_by_type (array(
                                                        'type'                  => 'colorpicker',
                                                        'field_id'              => 'spam-message-border-color',
                                                        'field_value'           => !empty( $skin_settings['spam_message_border_color'] ) ? $skin_settings['spam_message_border_color'] : '#f56e28',
                                                        'field_mode'            => 'rgb',
                                                        'field_name'            => 'spam_message_border_color'
                                                    ) ); ?>

                                                </div>

                                            </div>

                                        </div>

                                    </section>

                                    </div>

                                </div>

                                <div class="ut-panel-section">

                                     <button id="unite-save-cf7-design" class="ut-ui-button"><?php esc_html_e( 'Save Design','unitedthemes' ); ?></button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

                <div class="">

                    <div class="ut-dashboard-widget">

                        <div class="ut-widget-hero">

                            <h3><?php esc_html_e( 'Form Preview', 'unite-admin' ); ?></h3>

                        </div>

                        <div role="form" dir="ltr">

                            <style id="unite-demo-form-root-css" type="text/css">

                                <?php echo ut_cf7_root_css( array(), '#unite-demo-form', true ); ?>

                            </style>

                            <style id="unite-demo-form-css" type="text/css">

                                <?php echo ut_cf7_skin_css(); ?>

                            </style>

                            <form id="unite-demo-form" action="" method="post" class="wpcf7-form" novalidate style="<?php echo !empty( $skin_settings['form_background'] ) ? 'background:' . $skin_settings['form_background'] : ''; ?>">

                                <div class="wpcf7-form">

                                <p>
                                    <label> Your Name (required)<br>
                                        <span class="wpcf7-form-control-wrap">
                                        <input name="your-name" value="United Themes" size="40" class="wpcf7-form-control wpcf7-text" aria-required="true" aria-invalid="false" type="text"></span>
                                        <span class="wpcf7-not-valid-tip">Please fill out this field.</span>
                                    </label>
                                </p>

                                <p>
                                    <label> Your Mail<br>
                                        <span class="wpcf7-form-control-wrap">
                                        <input name="your-email" placeholder="Placeholder" value="" size="40" class="wpcf7-form-control wpcf7-text wpcf7-email" aria-required="true" aria-invalid="false" type="email"></span>
                                    </label>
                                </p>

                                <p>
                                    <label> Your inquiry<br>
                                        <span class="wpcf7-form-control-wrap">
                                            <select name="menu-365" class="wpcf7-form-control wpcf7-select" aria-invalid="false">
                                                <option value="">Test Option #1</option>
                                                <option value="">Test Option #2</option>
                                                <option value="">Test Option #3</option>
                                                <option value="">Test Option #4</option>
                                            </select>
                                        </span>
                                    </label>
                                </p>

                                <p>
                                    <label> Checkbox Test </label><br>
                                    <span class="wpcf7-form-control-wrap">

                                        <span class="wpcf7-form-control wpcf7-checkbox">

                                            <span class="wpcf7-list-item first">
                                                <label>
                                                    <input type="checkbox" name="checkbox-1[]" value="Checkbox 1">
                                                    <span class="wpcf7-list-item-label">Checkbox 1</span>
                                                </label>
                                            </span>

                                            <span class="wpcf7-list-item">
                                                <label>
                                                    <input type="checkbox" name="checkbox-2[]" value="Checkbox 2">
                                                    <span class="wpcf7-list-item-label">Checkbox 2</span>
                                                </label>
                                            </span>

                                            <span class="wpcf7-list-item">
                                                <label>
                                                    <input type="checkbox" name="checkbox-3[]" value="Checkbox 3">
                                                    <span class="wpcf7-list-item-label">Checkbox 3</span>
                                                </label>
                                            </span>

                                            <span class="wpcf7-list-item">
                                                <label>
                                                    <input type="checkbox" name="checkbox-4[]" value="Checkbox 4">
                                                    <span class="wpcf7-list-item-label">Checkbox 4</span>
                                                </label>
                                            </span>

                                        </span>

                                    </span>

                                </p>

                                <p>
                                    <label> Radio Test </label><br>
                                    <span class="wpcf7-form-control-wrap radio-237">

                                        <span class="wpcf7-form-control wpcf7-radio">

                                            <span class="wpcf7-list-item first">
                                                <label>
                                                    <input type="radio" name="radio-237" value="Radio 1" checked="checked">
                                                    <span class="wpcf7-list-item-label">Radio 1</span>
                                                </label>
                                            </span>

                                            <span class="wpcf7-list-item">
                                                <label>
                                                    <input type="radio" name="radio-237" value="Radio 2">
                                                    <span class="wpcf7-list-item-label">Radio 2</span>
                                                </label>
                                            </span>

                                            <span class="wpcf7-list-item">
                                                <label>
                                                    <input type="radio" name="radio-237" value="Radio 3">
                                                    <span class="wpcf7-list-item-label">Radio 3</span>
                                                </label>
                                            </span>

                                        </span>

                                    </span>

                                </p>

                                <p><label> Subject<br>
                                        <span class="wpcf7-form-control-wrap">
                                        <input name="your-subject" value="" size="40" class="wpcf7-form-control wpcf7-text" aria-invalid="false" type="text"></span>
                                        <span class="wpcf7-not-valid-tip" aria-hidden="true">The field is required.</span>
                                    </label>
                                </p>
                                <p><label> Your Message<br>
                                    <span class="wpcf7-form-control-wrap your-message">
                                    <textarea name="your-message" cols="40" rows="10" class="wpcf7-form-control wpcf7-textarea" aria-invalid="false"><?php bloginfo('description'); ?></textarea>
                                    </span> </label>
                                </p>

                                <p>
                                    <input value="Send" class="wpcf7-form-control wpcf7-submit" type="submit">
                                </p>

                                </div>

                                <div class="wpcf7-form">
                                    <div class="wpcf7-response-output" aria-hidden="true"><?php esc_html_e('Default Message' , 'unitedthemes'); ?></div>
                                </div>

                                <div class="wpcf7-form sent">
                                    <div class="wpcf7-response-output" aria-hidden="true"><?php esc_html_e('Sent Message' , 'unitedthemes'); ?></div>
                                </div>

                                <div class="wpcf7-form invalid">
                                    <div class="wpcf7-response-output" aria-hidden="true"><?php esc_html_e('Invalid Message' , 'unitedthemes'); ?></div>
                                </div>

                                <div class="wpcf7-form failed">
                                    <div class="wpcf7-response-output" aria-hidden="true"><?php esc_html_e('Failed Message' , 'unitedthemes'); ?></div>
                                </div>

                                <div class="wpcf7-form spam">
                                    <div class="wpcf7-response-output" aria-hidden="true"><?php esc_html_e('Spam Message' , 'unitedthemes'); ?></div>
                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    <?php }

    /**
     * Validate Header Settings
     *
     * @since     1.0.0
     * @version   1.0.0
     */
    public function validate_settings( $key ) {

        return $key;

    }


    public function ajax_save_design() {

        /* get nonce */
        $nonce = $_REQUEST['nonce'];

        /* check if nonce is set and correct */
        if ( ! wp_verify_nonce( $nonce, 'unite-cf7-designer-nonce' ) ) {
            wp_die( 'Busted!');
        }

        // existing designs
        if( !$designs = get_option('unite-cf7-designs') ) {

            $designs = array();

        }

        // parse design values
        parse_str($_REQUEST['design'], $values);

        // add to options
        $designs[$values['unique_id']] = $values;

        // update option
        update_option('unite-cf7-designs', $designs );

        // return
        wp_send_json( array( 'success' => true ) );

    }

    public function ajax_delete_design() {

        /* get nonce */
        $nonce = $_REQUEST['nonce'];

        /* check if nonce is set and correct */
        if ( ! wp_verify_nonce( $nonce, 'unite-cf7-designer-nonce' ) ) {
            wp_die( 'Busted!');
        }

        // existing designs
        if( !$designs = get_option('unite-cf7-designs') ) {

            $designs = array();

        }

        // add to options
        if( isset( $designs[$_REQUEST['unique_id']] ) ) {

            unset( $designs[$_REQUEST['unique_id']] );

        }

        // update option
        update_option('unite-cf7-designs', $designs );

        // return
        wp_send_json( array( 'success' => true ) );

    }

}
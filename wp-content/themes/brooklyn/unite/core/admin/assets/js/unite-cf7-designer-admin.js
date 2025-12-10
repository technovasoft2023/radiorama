/* <![CDATA[ */
(function($){
	
	"use strict";

    $(document).ready(function(){

        let $form_root_css        = $('#unite-demo-form-root-css'),
            form_root_template    = $form_root_css.text(),
            attributes_with_px    = ['font-size', 'textarea-height', 'padding', 'margin_bottom', 'label-margin-bottom', 'label-font-size', 'message-font-size',
                                     'submit_button_border_radius', 'submit_button-padding-top', 'submit_button-padding-right', 'submit_button-padding-bottom', 'submit_button-padding-left', 'submit_button_border_width'],
            attributes_with_em    = ['letter-spacing', 'label-letter-spacing', 'message-letter-spacing'],
            attributes_with_def   = ['submit_button-padding-top', 'submit_button-padding-right', 'submit_button-padding-bottom', 'submit_button-padding-left'],
            real_attributes       = ['textarea-rows'],
            $form_designer        = $('#unite-form-designer input, #unite-form-designer select');

        function change_root_css() {

            let template = form_root_template;

            $form_designer.each(function() {

                if( $(this).attr("id") !== undefined && $(this).val() !== '' ) {

                    if( $.inArray( $(this).attr("id"), attributes_with_px ) !== -1 ) {

                        if( $.inArray( $(this).attr("id"), attributes_with_def ) !== -1 && $(this).val() === '0' ) {

                            template = template.replace('#' + $(this).attr("id"), submit_default_colors[$(this).attr("id")] + 'px');

                        } else {

                            template = template.replace('#' + $(this).attr("id"), $(this).val() + 'px');

                        }

                    } else if( $.inArray( $(this).attr("id"), attributes_with_em ) !== -1 ) {

                        template = template.replace('#' + $(this).attr("id"), $(this).val() + 'em');

                    } else if( $.inArray( $(this).attr("id"), real_attributes ) !== -1 ) {

                        $('textarea', '#unite-demo-form').attr("rows", $(this).val() );

                    } else {

                        template = template.replace( '#' + $(this).attr("id"), $(this).val() );

                    }

                }

                if( $(this).attr("id") !== undefined && $(this).val() === '' && submit_default_colors[$(this).attr("id")] !== undefined ) {

                    if( $.inArray( $(this).attr("id"), attributes_with_px ) !== -1 ) {

                        template = template.replace('#' + $(this).attr("id"), submit_default_colors[$(this).attr("id")] + 'px');

                    } else if( $.inArray( $(this).attr("id"), attributes_with_em ) !== -1 ) {

                        template = template.replace('#' + $(this).attr("id"), submit_default_colors[$(this).attr("id")] + 'em');

                    } else if( $.inArray( $(this).attr("id"), real_attributes ) !== -1 ) {

                        $('textarea', '#unite-demo-form').attr("rows", $(this).val() );

                    } else {

                        template = template.replace( '#' + $(this).attr("id"), submit_default_colors[$(this).attr("id")] );

                    }

                }

            });

            $form_root_css.text( template );

        }

        change_root_css();

        $( ".ut-numeric-slider" ).on( "slidechange", function( event ) {

            $(event.currentTarget).siblings('input:not(.ut-numeric-slider-helper-input)').trigger('propertychange');

        });

        // change design title in select
        $(document).on("keyup change input", ".unite-change-form-title", function() {

            $('.select-option-' + $('#unique_id').val() ).text( $(this).val() );

        });

        let deltaBufferTimer;

        $(document).on('change propertychange', '#unite-form-designer input', function() {

            clearTimeout(deltaBufferTimer);

            deltaBufferTimer = setTimeout(function () {

                change_root_css();

            }, 500 );
        
        });

        $(document).on('change', '#unite-form-designer select', function() {

             change_root_css();

        });

        $(document).on('change propertychange', '.unite-change-form-background', function() {

            $('#unite-demo-form').css('background-color', $(this).val() )

        });

        $(document).on('change', '.unite-switch-skin', function() {

            let url = new URL(window.location.href );

            url.searchParams.set('edit_skin', $(this).val() );
            window.location.href = url.href;

        });

        $(document).on('click', '.wpcf7-submit', function( event ) {

            event.preventDefault();
            return false;

        });

        $(document).on('click', '#unite-save-cf7-design', function( event ) {

            event.preventDefault();

            $.ajax({

                type: 'POST',
                url: ajaxurl,
                data: {
                    "action"    : "save_cf7_design",
                    "nonce"     : $('#unite-cf7-designer-nonce').val(),
                    "design"    : $('#unite-form-settings').serialize()
                },
                success: function() {

                    modal({
                        type: 'info',
                        title: unite_cf7_notifications.success_title,
                        text: unite_cf7_notifications.success_message,
                        autoclose: true,
                    });

                }

            });

        });

        $(document).on('click', '#unite-delete-cf7-design', function( event ) {

            let url = $(this).attr('href');

            event.preventDefault();

            modal({
                type: 'confirm',
                title: unite_cf7_notifications.delete_question_title,
                text: unite_cf7_notifications.delete_question_message,
                buttons: [
                    {
                        addClass: 'ut-ui-button-health'
                    },
                    {
                        addClass: 'ut-ui-button-blue'
                    }
                ],
                callback: function(result) {

                    if( result === true ) {

                        $.ajax({

                            type: 'POST',
                            url: ajaxurl,
                            data: {
                                "action"        : "delete_cf7_design",
                                "nonce"         : $('#unite-cf7-designer-nonce').val(),
                                "unique_id"     : $('#unique_id').val(),
                            },
                            success: function() {

                                 modal({
                                    type: 'info',
                                    title: unite_cf7_notifications.delete_title,
                                    text: unite_cf7_notifications.delete_message,
                                    autoclose: true,
                                });

                                window.location = url;

                            }

                        });

                    }

                }

            });


        });
    
    });

})(jQuery);
 /* ]]> */
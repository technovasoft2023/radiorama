/* <![CDATA[ */
(function($){

    "use strict";

    $(document).ready(function(){

        $('.ut-responsive-slider-tabgroup > div').hide();
        $('.ut-responsive-slider-tabgroup > div:first-of-type').show();

        $(document).on( 'click', '.ut-responsive-slider-tabs > li > a', function (e) {

            e.preventDefault();

            let $this       = $(this),
                $form       = $this.closest('#vc_edit-form-tabs'),
                $others     = $this.closest('li').siblings().children('a'),
                $tabs       = $this.closest('ul').next('.ut-responsive-slider-tabgroup').children('div'),
                target      = $this.attr('href');

            // menu
            $others.removeClass('active');
            $this.addClass('active');

            // tabs
            $tabs.hide();
            $(target).show();

            // activate same breakpoint on other settings of this group
            $('[data-breakpoint="' + $this.data('breakpoint') + '"]:not(.active)', $form ).trigger('click');

        });

        $('.ut-responsive-slider-tabs > li > a').each( function () {

            $(this).tooltipster({trigger:"hover"}).tooltipster('content', $(this).data('tooltip') );

        });

        function update_slider_group_value( $element ) {

            let $tab_group = $element.closest('.ut-responsive-slider-tabgroup');

            let $fields = $('input, select', $element.closest('.ut-responsive-slider-tabgroup') ).filter(function( index, element ) {

                 return $(element).val() !== '';

            });

            $.each( $fields, function ( index, element ) {

                if( !$tab_group.hasClass('global') && $(element).val() === 'global' ) {

                    $(element).val('inherit');

                }

            });

            $( $element.data('group-value') ).val( $fields.serialize() );

        }

        function hasNumber(value) {

            return /\d/.test(value);

        }

        function isNumeric(n) {

            return !isNaN(parseFloat(n)) && isFinite(n);

        }

        function update_slider_siblings( $this, value, callback ) {

            value = hasNumber( value ) ? parseFloat( value ) : value;

            let $tab = $this.closest('.ut-responsive-slider-tab');

            if( $this.data('breakpoint') === 'desktop_large' &&
                $this.data('attribute') === 'letter-spacing' &&
                $this.attr('data-min') && value === $this.data('min') ) {

                $this.siblings('input').val('inherit');
                $('.ut-range-value', $tab ).val('default').addClass('global');
                $('.ut-range-value', $tab ).next().text('default');

                $( '.ut-set-inherit', $tab ).prop('disabled', true);
                $( '.ut-restore-global', $tab ).prop('disabled', false);

            } else if( $this.data('breakpoint') !== 'desktop_large' &&
                $this.attr('data-min') && value === $this.data('min') &&
                $this.attr('data-global') && value !== $this.data('global') ) {

                $this.siblings('input').val('inherit');
                $('.ut-range-value', $tab ).val('inherit').removeClass('global');
                $('.ut-range-value', $tab ).next().text('custom');

                $( '.ut-set-inherit', $tab ).prop('disabled', true);
                $( '.ut-restore-global', $tab ).prop('disabled', false);

            } else if( $this.attr('data-min') && value !== $this.data('min') &&
                       $this.attr('data-global') && value === $this.data('global') ) {

                $this.siblings('input').val('global');
                $('.ut-range-value', $tab ).addClass('global').val(value);
                $('.ut-range-value', $tab ).next().text('global');

                // change unit select
                $('.ut-range-slider-unit', $tab ).val($this.data('global-unit')).trigger('change');

                if( value === 'inherit') {

                     $('.ut-range-value', $tab ).addClass('global');
                     $('.ut-range-value', $tab ).next().text('global');

                }

                $( '.ut-set-inherit', $tab ).prop('disabled', false);
                $( '.ut-restore-global', $tab ).prop('disabled', true);

            } else {

                if( value === '' ) {

                    $this.siblings('input').val('global');

                    if( $this.attr('data-global') && 'inherit' !== $this.data('global') ) {

                        $('.ut-range-value', $tab ).val( $this.data('global') );

                    }  else {

                        $('.ut-range-value', $tab ).addClass('global').val( 'inherit' );

                    }

                    $('.ut-range-value', $tab ).next().text('global');

                    // change unit select
                    $('.ut-range-slider-unit', $tab ).val($this.data('global-unit')).trigger('change');

                    $( '.ut-set-inherit', $tab ).prop('disabled', true);
                    $( '.ut-restore-global', $tab ).prop('disabled', true);

                } else {

                    $this.siblings('input').val( value );
                    $('.ut-range-value', $tab ).removeClass('global').val(  value );
                    $('.ut-range-value', $tab ).next().text('custom');

                    $( '.ut-restore-global', $tab ).prop('disabled', false );
                    $( '.ut-set-inherit', $tab ).prop('disabled', false);

                }

            }

            if( callback && typeof(callback) === "function" ) {

                callback();

            }

        }

        function update_unit_select( attribute, connect_value, $form ) {

            // slider unit update
            $('.ut-range-slider-unit[name="' + attribute + '-unit"]', $form ).each( function ( index , element ) {

                $('option', element ).each(function ( i, option ) {

                    let option_value = $(option).data('value'),
                        min_max = unite.ResponsiveFontSettings[connect_value][attribute + '-min-max'][option_value] !== undefined ? unite.ResponsiveFontSettings[connect_value][attribute + '-min-max'][option_value] : '';

                    if( min_max ) {

                        min_max = min_max.join();

                        $(option).attr('data-relation-value', min_max ).data('relation-value', min_max );

                    }

                });

            });

        }

        $('.ut-breakpoint-range-slider-dynamic').on('ut.rangeSlider.dynamic', function (){

            let $this           = $(this),
                current_value   = $this.siblings('input[type="hidden"]').val(),
                $form           = $this.closest('#vc_edit-form-tabs'),
                $restore        = $( '.ut-restore-global', $this.closest('.ut-responsive-slider-tab') ),
                $unit           = $( '.ut-range-slider-unit', $this.closest('.ut-responsive-slider-tab') ),
                values          = $this.data('dynamic-values' ),
                attribute       = $this.data('attribute'),
                breakpoint      = $this.data('breakpoint');

            let connect_value = $('[name="'+values.connect+'"]', $form).val();

            // unit select field
            if( unite.ResponsiveFontSettings[connect_value] !== undefined ) {

                update_unit_select( attribute, connect_value, $form );

                // update restore button
                let global_unit = '';

                if( unite.ResponsiveFontSettings[connect_value][attribute + '-unit'] !== undefined ) {

                    global_unit = unite.ResponsiveFontSettings[connect_value][attribute + '-unit'];
                    $restore.attr('data-global-unit', global_unit ).data('global-unit', global_unit );
                    $unit.attr('data-global-unit', global_unit ).data('global-unit', global_unit );

                }

                // check for global values
                let value = ( unite.ResponsiveFontSettings[connect_value][attribute][breakpoint] !== undefined ) ? unite.ResponsiveFontSettings[connect_value][attribute][breakpoint] : '';

                if( value ) {

                    value = hasNumber( value ) ? parseFloat( value ) : value;

                    // update slider attributes
                    $this.attr('data-global', value ).data('global', value ).data( 'glob-native', value )

                    // update restore field
                    $restore.removeClass('ut-hide').attr('data-global', value ).data('global', value );

                    // re enable global reset
                    if( $this.hasClass('ui-slider') ) {

                        $restore.prop('disabled', false);

                    }

                    if( current_value === 'global' ) {

                        $restore.trigger("click");

                    }

                    if( breakpoint === 'desktop_large' && current_value === 'inherit' ) {

                        $restore.trigger("click");

                    }

                    // add new information to tooltip
                    if( $restore.hasClass("tooltipstered") ) {

                        if( $restore.data('global') === 'global' || $restore.data('global') === 'inherit' ) {

                            $restore.tooltipster('content', $restore.data('tooltip') + $restore.data('global') );

                        } else {

                            $restore.tooltipster('content', $restore.data('tooltip') + $restore.data('global') + global_unit );

                        }

                    }

                }

            }

            if( $this.data('global') === 'inherit' ) {

                $this.slider( "value", $this.data('min') );

            }

            // update tag information
            $('.ut-dynamic-tag', $form ).text( connect_value );

        }).each(function() {

            let $this     = $(this),
                $form     = $this.closest('#vc_edit-form-tabs'),
                values    = $this.data('dynamic-values' ),
                $connect  = $('[name="'+values.connect+'"]', $form);

            if( $connect.data('event-ready') ) {
                return false;
            }

            $connect.data('event-ready', true );

            // add event listener to connect element
            $connect.on('change', function (){

                $('.ut-breakpoint-range-slider-dynamic').trigger('ut.rangeSlider.dynamic');

            });

        });

        $.when( $('.ut-breakpoint-range-slider').each(function() {

            let $this = $(this);

            $.when( $this.slider({
                range: "max",
                min: $(this).data('min'),
                max: $(this).data('max'),
                step: $(this).data('step'),
                value: $(this).data('value'),
                slide: function( event, ui ) {

                    update_slider_siblings( $this, ui.value,  function () {

                        update_slider_group_value( $this );

                    });

                }

            }) ).then( function () {

                $('.ut-range-slider-unit').each(function() {

                    $(this).trigger('change');

                });

                if( $this.data('value') === '' && $this.data('global') === 'inherit' ) {

                    $this.slider( "value", $this.data('min') );

                }

                update_slider_siblings( $this, $this.siblings('input').val(),  function () {

                    update_slider_group_value( $this );

                });

            });

        }) ).then( function () {

            $('.ut-breakpoint-range-slider-dynamic').trigger('ut.rangeSlider.dynamic');

        });

        $('.ut-range-slider').each(function (){

            let $that = $(this);

            if( !$that.data( 'glob-native') ) {

                $that.data( 'glob-native', $that.data('global') );

            }

        });

        $(document).on( 'change', '.ut-range-slider-unit', function (){

            let $this  = $(this),
                $tab_group = $this.closest('.ut-responsive-slider-tabgroup');

            if( $this.val() !== $this.data('global-unit') ) {

                $this.closest('.ut-range-slider-block').siblings('.ut-range-slider-actions').find('.ut-restore-global').prop('disabled', false);

            }

            if( $this.data('relation-field') ) {

                let $relation_field = $('#' + $this.data('relation-field') ),
                    min_max_step    = $this.find(':selected').data('relation-value');

                if( min_max_step ) {

                    min_max_step = min_max_step.split(",");

                    $('.ut-range-slider', $relation_field ).each(function (){

                        let $that = $(this);

                        // update min slider values
                        let min = $that.data('breakpoint') !== 'desktop_large' ? parseInt( min_max_step[0] ) - parseFloat( min_max_step[2] ) : parseInt( min_max_step[0] );

                        if( $that.data('breakpoint') !== 'desktop_large' && $that.data('attribute') === 'letter-spacing' ) {

                            min = parseInt( min_max_step[0] ) - parseFloat( min_max_step[2] );

                        }

                        $this.attr('data-min' , min );
                        $this.data('min', min );

                        $that.attr('data-min' , min );
                        $that.data('min', min );
                        $that.slider('option', 'min',min );

                        // update max slider values
                        let max = parseInt( min_max_step[1] );
                        $this.attr('data-max' , max );
                        $this.data('max', max );

                        $that.attr('data-max' , max );
                        $that.data('max', max );
                        $that.slider('option', 'max', max );

                        // update max slider step
                        let step = parseFloat( min_max_step[2] );
                        $this.attr('data-step' , step );
                        $this.data('step', step );

                        $that.attr('data-step' , step );
                        $that.data('step', step );
                        $that.slider('option', 'step', step );

                        if( !$that.data( 'glob-native') ) {

                            $that.data( 'glob-native', $that.data('global') );

                        }

                        if( $this.find(':selected').data('value') !== $this.data('global-unit') ) {

                            $that.attr('data-global' , 'inherit' );
                            $that.data('global', 'inherit' );

                        } else {

                            $that.attr('data-global' , $that.data( 'glob-native') );
                            $that.data('global', $that.data( 'glob-native') );

                        }

                        // on unit change
                        if( $this.find(':selected').data('value') !== $this.data('global-unit') ) {

                            if( isNumeric( $that.siblings('input[type="hidden"]').val() ) &&
                                parseFloat( $that.siblings('input[type="hidden"]').val() ) > max) {

                                if( $that.data('breakpoint') !== 'desktop_large' ) {

                                    $that.slider("value", min);
                                    $that.siblings('input[type="hidden"]').val('inherit');
                                    $that.siblings('.ut-range-value-wrap').find('.ut-range-value', $relation_field).val('inherit');

                                } else {

                                    $that.slider("value", max);
                                    $that.siblings('input[type="hidden"]').val(max);
                                    $that.siblings('.ut-range-value-wrap').find('.ut-range-value', $relation_field).val(max);

                                }

                            } else if( typeof $that.siblings('input[type="hidden"]').val() === 'string' &&
                                ( $that.siblings('input[type="hidden"]').val() === 'global' || $that.siblings('input[type="hidden"]').val() === 'inherit') ) {

                                if( $that.data('breakpoint') !== 'desktop_large' ) {

                                    $that.slider("value", min);
                                    $that.siblings('input[type="hidden"]').val('inherit');
                                    $that.siblings('.ut-range-value-wrap').find('.ut-range-value', $relation_field).val('inherit');

                                } else {

                                    $that.slider("value", max);
                                    $that.siblings('input[type="hidden"]').val(max);
                                    $that.siblings('.ut-range-value-wrap').find('.ut-range-value', $relation_field).val(max);

                                }

                            }

                        }

                    });

                }

                $('.ut-range-value', $relation_field).attr('data-unit', $this.find(':selected').data('value') );
                $('.ut-unit-info-field', $relation_field).text( $this.find(':selected').data('value') );

                if( $this.find(':selected').data('value') === $this.data('global-unit') ) {

                    $tab_group.addClass('global');

                    $this.addClass('global');
                    $this.next().text('global');

                    $('.ut-range-value-info', $tab_group ).addClass('global').text( $this.find(':selected').data('value') ).next().text('global');

                } else {

                    $tab_group.removeClass('global');
                    $this.removeClass('global');
                    $this.next().text('custom');

                    $('.ut-range-value-info', $tab_group ).removeClass('global').text( $this.find(':selected').data('value') ).next().text('custom');


                }

            }

            update_slider_group_value( $this );

        });

        $(document).on('input propertychange', '.ut-range-value', function() {

            let $this = $(this),
                $context = $this.closest('.ut-responsive-slider-tab');

            $('.ut-breakpoint-range-slider', $context ).slider("value", $this.val() );

            update_slider_siblings( $('.ut-breakpoint-range-slider', $context ), $this.val(),  function (){

                update_slider_group_value( $('.ut-breakpoint-range-slider', $context ) );

            });

        });

        $(document).on( 'click', '.ut-restore-global', function (){

            let $this    = $(this),
                $context = $this.closest('.ut-responsive-slider-tab'),
                $slider  = $('.ut-range-slider', $context ),
                $unit    = $('.ut-range-slider-unit', $context );

            let values          = $('.ut-breakpoint-range-slider', $context).data('dynamic-values' ),
                attribute       = $('.ut-breakpoint-range-slider', $context).data('attribute');

            if( $slider.data('glob-native') === 'inherit' ) {

                $slider.slider( "value", $slider.data('min') );

            } else {

                // temp fix for initial load value
                setTimeout( function () {

                    $slider.slider( "value", $slider.data('glob-native') );

                }, 10 );

            }



            // update select
            $unit.data('global-unit', $this.data('global-unit') ).attr('data-global-unit', $this.data('global-unit') );

            // update select inner option default field
            $unit.prop('selectedIndex', 0);
            $unit.find(':selected').data('value', $this.data('global-unit') ).attr('data-value', $this.data('global-unit') ).html( 'global (' + $this.data('global-unit') + ')' );

            // indicator below
            $unit.addClass('global');

            if( values ) {

                let $form           = $this.closest('#vc_edit-form-tabs'),
                    connect_value = $('[name="'+values.connect+'"]', $form).val();

                // unit select field
                if( unite.ResponsiveFontSettings[connect_value] !== undefined ) {

                    update_unit_select(attribute, connect_value, $form );

                }

            }

            $unit.trigger('change');

            update_slider_siblings( $slider, $slider.data('glob-native'),  function (){

                update_slider_group_value( $slider );

            });

        });

        $(document).on( 'click', '.ut-set-inherit', function (){

            let $this = $(this),
                $slider = $this.parent().siblings('.ut-range-slider');

            $slider.slider( "value", $slider.data('min') );

            update_slider_siblings( $slider, $slider.data('min'),  function (){

                update_slider_group_value( $slider );

            });

        });

        $('.ut-restore-global').each( function () {

            $(this).tooltipster({trigger:"hover"}).tooltipster('content', $(this).data('tooltip') + $(this).data('global') );

        });

        $('.ut-set-inherit').each( function () {

            $(this).tooltipster({trigger:"hover"}).tooltipster('content', $(this).data('tooltip') );

        });


    });

})(window.jQuery);
/* ]]> */
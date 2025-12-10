/* global ajaxurl */
jQuery( document ).ready( function ( $ ) {
	'use strict';
	function vc_setCookie( c_name, value, exdays ) {
		var exdate = new Date();
		exdate.setDate( exdate.getDate() + exdays );
		var c_value = encodeURIComponent( value ) + ((null === exdays) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	}

	function vc_getCookie( c_name ) {
		var i, x, y, ARRcookies = document.cookie.split( ";" );
		for ( i = 0; i < ARRcookies.length; i ++ ) {
			x = ARRcookies[ i ].substr( 0, ARRcookies[ i ].indexOf( "=" ) );
			y = ARRcookies[ i ].substr( ARRcookies[ i ].indexOf( "=" ) + 1 );
			x = x.replace( /^\s+|\s+$/g, "" );
			if ( x == c_name ) {
				return decodeURIComponent( y );
			}
		}
	}

	$( '.wpb_settings_accordion' ).accordion( {
		active: (vc_getCookie( 'wpb_js_composer_settings_group_tab' ) ? vc_getCookie( 'wpb_js_composer_settings_group_tab' ) : false),
		collapsible: true,
		change: function ( event, ui ) {
			if ( 'undefined' !== typeof (ui.newHeader.attr( 'id' )) ) {
				vc_setCookie( 'wpb_js_composer_settings_group_tab', '#' + ui.newHeader.attr( 'id' ), 365 * 24 * 60 * 60 );
			} else {
				vc_setCookie( 'wpb_js_composer_settings_group_tab', '', 365 * 24 * 60 * 60 );
			}
		},
		heightStyle: 'content'
	} );
	$( '.wpb-settings-select-all-shortcodes' ).on('click', function ( e ) {
		e.preventDefault();
		$( this ).parent().parent().find( '[type=checkbox]' ).attr( 'checked', true );
	} );
	$( '.wpb-settings-select-none-shortcodes' ).on('click', function ( e ) {
		e.preventDefault();
		$( this ).parent().parent().find( '[type=checkbox]' ).removeAttr( 'checked' );
	} );
	$( '.vc_settings-tab-control' ).on('click', function ( e ) {
		e.preventDefault();
		if ( $( this ).hasClass( 'nav-tab-active' ) ) {
			return false;
		}
		var tab_id = $( this ).attr( 'href' );
		$( '.vc_settings-tabs > .nav-tab-active' ).removeClass( 'nav-tab-active' );
		$( this ).addClass( 'nav-tab-active' );
	} );
	$( '.vc_settings-tab-content' ).on( 'submit', function () {
		return true;
	} );

	$( '.vc_show_example' ).on('click', function ( e ) {
		e.preventDefault();
		var $helper = $( '.vc_helper' );
		if ( $helper.is( ':animated' ) ) {
			return false;
		}
		$helper.toggle( 100 );
	} );

	$( '.color-control' ).wpColorPicker();
	$( '#vc_settings-color-restore-default' ).on('click', function ( e ) {
		e.preventDefault();
		if ( confirm( window.i18nLocaleSettings.are_you_sure_reset_color ) ) {
			$( '#vc_settings-color-action' ).val( 'restore_color' );
			$( '#vc_settings-color' ).attr( 'action', window.location.href ).find( '[type=submit]' ).click();
		}
	} );
	$( '#wpb_js_use_custom' ).on( 'change', function () {
		if ( this.checked ) {
			$( '#vc_settings-color' ).addClass( 'color_enabled' );
		} else {
			$( '#vc_settings-color' ).removeClass( 'color_enabled' );

		}
	} );

	/**
	 * When clicking 'Activate WPBakery Page Builder' (and Deactivate),
	 * get redirect url and redirect user.
	 */
	$( '#vc_settings-updater-button' ).on('click', function ( e ) {
		var $this = $( this ),
			action = $this.data( 'vcAction' ),
			$parent = $this.parent();

		$parent.addClass( 'loading' );
		$this.attr( 'disabled', true );

		$.getJSON( window.ajaxurl, {
			action: 'vc_get_' + action + '_url',
			_vcnonce: window.vcAdminNonce
		}, function ( response ) {
			if ( response && response.status ) {
				window.location = response.url;
			} else {
				alert( 'Failed to get response from server. Please try again' );
				$parent.removeClass( 'loading' );
				$this.removeAttr( 'disabled' );
			}
		} ).fail( function () {
			alert( 'Failed to get response from server. Please refresh page and try again' );
			$parent.removeClass( 'loading' );
			$this.removeAttr( 'disabled' );
		} );

		e.preventDefault();
		return false;
	} );

	var editor_css = new Vc_postSettingsEditor();
	editor_css.sel = 'wpb_css_editor';
	editor_css.mode = 'css';
	editor_css.is_focused = true;
	var editor_js_header = new Vc_postSettingsEditor();
	editor_js_header.sel = 'wpb_js_header_editor';
	editor_js_header.mode = 'javascript';
	var editor_js_footer = new Vc_postSettingsEditor();
	editor_js_footer.sel = 'wpb_js_footer_editor';
	editor_js_footer.mode = 'javascript';

	var editor_list = {
		css : editor_css,
		js_header : editor_js_header,
		js_footer : editor_js_footer
	};

	for (var editor_name in editor_list) {
		var $editor = $( '#wpb_' + editor_name + '_editor' );
		if ( $editor.length ) {
			var $editor_input = $editor.prev();
			var editor_slug = 'editor' + editor_name;
			window[editor_slug] = editor_list[editor_name];
			window[editor_slug].setEditor( $editor_input.val() );

			window[editor_slug].getEditor().on( "change", setEditorNewValue.bind(null, $editor_input, editor_slug));
		}
	}

	$( '#vc_settings-vc-pointers-reset' ).on('click', function ( e ) {
		e.preventDefault();
		$.post( window.ajaxurl, {
			action: 'vc_pointer_reset',
			_vcnonce: window.vcAdminNonce
		} );
		$( this ).text( $( this ).data( 'vcDoneTxt' ) );
	} );

	function setEditorNewValue($editor_input, editor_slug) {
		// set new value to textarea
		$editor_input.val( window[editor_slug].getValue() );
	}

	function showMessageMore( text, typeClass, timeout, remove ) {
		if ( remove ) {
			$( '.vc_atm-message' ).remove();
		}
		var $message = $( '<div class="vc_atm-message ' + (typeClass ? typeClass : '') + '" style="display: none;"><p></p></div>' );
		$message.find( 'p' ).text( text );
		if ( !_.isUndefined( timeout ) ) {
			window.setTimeout( function () {
				$message.fadeOut( 500, function () {
					$( this ).remove();
				} );
			}, timeout );
		}
		return $message;
	}

	var lessBuilding = false;
	$( '#vc_settings-color' ).on( 'submit', function ( e ) {
		e.preventDefault();
		if ( lessBuilding ) {
			return;
		}
		var form, $submitButton, $designCheckBox;

		form = this;
		$submitButton = $( '#submit_btn' );
		$designCheckBox = $( '#wpb_js_use_custom' );
		if ( $designCheckBox.prop( 'checked' ) && 'restore_color' !== $( '#vc_settings-color-action' ).val() ) {
			var modifyVars, variablesDataLinker, $spinner;

			lessBuilding = true;
			modifyVars = $( form ).serializeArray();
			variablesDataLinker = $submitButton.data( 'vc-less-variables' );
			$spinner = $( '<span class="vc_settings-spinner vc_ui-wp-spinner"></span>' );
			$submitButton.val( window.i18nLocaleSettings.saving );
			$spinner.insertBefore( $submitButton ).show();

			_.delay( function () {
				vc.less.build( {
					modifyVars: modifyVars,
					variablesDataLinker: variablesDataLinker,
					lessPath: $submitButton.data( 'vc-less-path' ),
					rootpath: $submitButton.data( 'vc-less-root' )
				}, function ( output, error ) {
					if ( !_.isUndefined( output ) && !_.isUndefined( output.css ) ) {
						$( '[name="wpb_js_compiled_js_composer_less"]' ).val( output.css );
						var $form = $( '#vc_settings-color' );
						$.ajax( {
							type: 'POST',
							url: $form.attr( 'action' ),
							data: $form.eq( 0 ).serializeArray(),
							success: function () {
								showMessageMore( window.i18nLocaleSettings.saved,
									'updated',
									5000,
									true ).insertBefore( $submitButton.parent() ).fadeIn( 500 );
								$submitButton.val( window.i18nLocaleSettings.save );
								lessBuilding = false;
								$spinner.remove();
							},
							error: function () {
								showMessageMore( window.i18nLocaleSettings.form_save_error,
									'error',
									undefined,
									true ).insertBefore( $submitButton.parent() ).fadeIn( 500 );
								$submitButton.val( window.i18nLocaleSettings.save );
								lessBuilding = false;
								$spinner.remove();
							}
						} );

					} else if ( !_.isUndefined( error ) ) {
						if ( window.console && window.console.warn ) {
							window.console.warn( 'build error', error );
						}
						showMessageMore( window.i18nLocaleSettings.save_error + ". " + error,
							'error',
							undefined,
							true ).insertBefore( $submitButton.parent() ).fadeIn( 500 );
						$submitButton.val( window.i18nLocaleSettings.save );
						lessBuilding = false;
						$spinner.remove();
					}
				} );
			}, 100 );
		} else {
			form.submit();
		}
	} );

} );

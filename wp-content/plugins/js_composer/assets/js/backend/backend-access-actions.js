(function ( $ ) {
	'use strict';
	vc.events.on( 'vc:access:initialize', function ( access ) {
		access.add( 'be_editor', vc_user_access().editor( 'backend_editor' ) );
		access.add( 'fe_editor', window.vc_frontend_enabled && vc_user_access().editor( 'frontend_editor' ) );
		access.add( 'classic_editor', !vc_user_access().check( 'backend_editor', 'disabled_ce_editor', undefined, true ) );

		if ( !window.vc.gridItemEditor ) {
			vc.events.trigger( 'vc:access:backend:ready', access );
		}
	} );

	vc.events.on( 'vc:access:backend:ready', function ( access ) {
		var $switchButton = null,
			$buttonsContainer = null,
			front = '',
			back = '',
			gutenberg = '',
			$titleDiv = $( 'div#titlediv' ),
			$tinyMceWrapper = $( '#postdivrich' ),
			gutenbergEditor = document.getElementById( 'editor' );

		if ( $titleDiv.length ) {
			if ( access.can( 'fe_editor' ) ) {
				front = '<a class="wpb_switch-to-front-composer" href="' + $( '#wpb-edit-inline' ).attr( 'href' ) + '">' + window.i18nLocale.main_button_title_frontend_editor + '</a>';
			}
			if ( access.can( 'classic_editor' ) ) {
				if ( access.can( 'be_editor' ) ) {
					back = '<a class="wpb_switch-to-composer" href="javascript:;">' + window.i18nLocale.main_button_title_backend_editor + '</a>';
				}
			} else {
				$tinyMceWrapper.addClass( 'vc-disable-editor' );
				if ( access.can( 'be_editor' ) && !vc_user_access().isBlockEditorIsEnabled() ) {
					_.defer( function () {
						vc.events.trigger( 'vc:backend_editor:show' );
					} );
				}
			}
			if ( window.wpbIsGutenberg ) {
				gutenberg = '<a class="wpb_switch-to-gutenberg" href="' + window.wpbGutenbergEditorSWitchUrl + '">' + window.i18nLocale.main_button_title_gutenberg + '</a>';
			}
			if ( front || back || gutenberg ) {
				if ( $titleDiv.length ) {
					$buttonsContainer = $( '<div class="composer-switch"><div class="composer-inner-switch"><span class="logo-icon"></span>' + back + front + '</div>' + gutenberg + '</div>' ).insertAfter(
						$titleDiv );
				} else {
					$buttonsContainer = $( '<div class="composer-switch"><div class="composer-inner-switch"><span class="logo-icon"></span>' + back + front + '</div>' + gutenberg + '</div>' ).prependTo(
						'#post-body-content' );
				}
				if ( access.can( 'classic_editor' ) ) {
					// if the vc-ai property on the vc_modules is not defined at all (for fresh plugin activation, the vc_modules is empty)
					// or vc-ai property should be true
					var isAiModuleEnabled = !window.vc_modules.hasOwnProperty('vc-ai') || window.vc_modules['vc-ai'];
					if (isAiModuleEnabled) {
						var aiIcon = '<div class="vc_ui-icon-ai" data-wpb-ai-element-type="textarea_html" data-field-id="content" title="WPBakery AI Assistant">\n' +
							'\t<svg xmlns="http://www.w3.org/2000/svg" height="19px" width="19px" viewBox="0 0 20 20" fill="currentColor">\n' +
							'\t\t<path d="M13 7H7v6h6V7z"></path>\n' +
							'\t\t<path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clip-rule="evenodd"></path>\n' +
							'\t</svg>\n' +
							'\t<span>AI</span>\n' +
							'</div>';
						$tinyMceWrapper.prepend(aiIcon);
					}
					$switchButton = $buttonsContainer.find( '.wpb_switch-to-composer' );
					$switchButton.on( 'click', function () {
						vc.events.trigger( 'vc:backend_editor:switch' );
						window.dispatchEvent(new Event('resize'));
					} );
				}
			}
		} else if ( gutenbergEditor ) {
			window.wp.data.subscribe( function () {
				setTimeout( function () {
					back = '<a data-toolbar-item="true" class="wpb_switch-to-composer" href="' + window.wpbGutenbergEditorClassicSWitchUrl + '">' + window.i18nLocale.main_button_title + '</a>';
					var gutenbergEditorHeader = gutenbergEditor ? gutenbergEditor.querySelector( '.edit-post-header-toolbar' ) : null;
					if ( gutenbergEditorHeader && !gutenbergEditorHeader.querySelector( '.composer-switch' ) ) {
						var $switcherContainer = $( '<div class="composer-switch"><div class="composer-inner-switch"><span class="logo-icon"></span>' + back + '</div></div>' );
						if ( gutenbergEditorHeader.querySelector( '.edit-post-header-toolbar__left' ) ) {
							gutenbergEditorHeader.querySelector( '.edit-post-header-toolbar__left' ).after( $switcherContainer.get( 0 ) );
						} else {
							gutenbergEditorHeader.append( $switcherContainer.get( 0 ) );
						}
					}
				}, 100 );
			});
		}
	} );
})( window.jQuery );

/* =========================================================
 * build.js v1.0.1
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WPBakery Page Builder builder backbone/underscore version
 * ========================================================= */

if ( _.isUndefined( vc ) ) {
	window.vc = {};
}
(function ( $ ) {
	'use strict';

	vc.createPreLoader = function () {
		vc.$preloader = $( '#ut_preloader' ).show();
	};
	vc.removePreLoader = function () {
		if ( vc.$preloader ) {
			vc.$preloader.hide();
		}
	};
	vc.createOverlaySpinner = function () {
		vc.$overlaySpinner = $( '#vc_overlay_spinner' ).show();
	};
	vc.removeOverlaySpinner = function () {
		if ( vc.$overlaySpinner ) {
			vc.$overlaySpinner.hide();
		}
	};
	vc.createPreLoader();
	vc.$frame_wrapper = $( '#vc_inline-frame-wrapper' );
	vc.$frame = $( '<iframe src="' + window.vc_iframe_src + '" scrolling="auto" style="width: 100%;" id="vc_inline-frame"></iframe>' );
	vc.$frame.appendTo( vc.$frame_wrapper );
	vc.build = function () {
		if ( vc.loaded ) {
			return;
		}
		vc.loaded = true;

		vc.map = window.vc_mapper; // vc_user_mapper // TODO: check why user mapper

		$( '#wpadminbar' ).remove();
		$( '#screen-meta-links, #screen-meta' ).hide();
		var $body = $( 'body' );
		$body.attr( 'data-vc', true );
		// vc.post_id = vc_post_id; // $( '#vc_post-id' ).val();
		vc.is_mobile = 0 < $( 'body.mobile' ).length;
		vc.title = $( '#vc_title-saved' ).val();
		// Create Modals & panels
		vc.add_element_block_view = new vc.AddElementUIPanelFrontendEditor( { el: '#vc_ui-panel-add-element' } );
		vc.edit_element_block_view = new vc.EditElementUIPanel( { el: '#vc_ui-panel-edit-element' } );
		vc.post_settings_view = new vc.PostSettingsUIPanelFrontendEditor( { el: '#vc_ui-panel-post-settings' } );
		vc.post_seo_view = new vc.PostSettingsSeoUIPanel( { el: '#vc_ui-panel-post-seo' } );
		/**
		 * @deprecated 4.4
		 * @type {vc.TemplatesEditorPanelView}
		 */
		vc.templates_editor_view = new vc.TemplatesEditorPanelView( { el: '#vc_templates-editor' } );
		vc.templates_panel_view = new vc.TemplateWindowUIPanelFrontendEditor( { el: '#vc_ui-panel-templates' } );
		vc.preset_panel_view = new vc.PresetSettingsUIPanelFrontendEditor( { el: '#vc_ui-panel-preset', frontEnd: true } );

		vc.app = new vc.View();
		vc.buildRelevance();
		if ( $body.hasClass( 'vc_responsive_disabled' ) ) {
			vc.responsive_disabled = true;
		}
		// Build Frame {{
		vc.setFrameSize( '100%' );
		vc.frame = new vc.FrameView( { el: $( vc.$frame.get( 0 ).contentWindow.document ).find( 'body' ).get( 0 ) } );
		vc.app.render();
		// }}
		// Build content of the page
		// Get current content data
		vc.post_shortcodes = vc.frame_window.vc_post_shortcodes;
		vc.builder.buildFromContent();
		if ( 'undefined' !== typeof window.vc.undoRedoApi ) {
			_.defer( function () {
				vc.undoRedoApi.setZeroState( vc.builder.getContent() );
			} );
		}
		vc.removePreLoader();
		if ( vc.$frame.get( 0 ).contentWindow.vc_js ) {
			vc.$frame.get( 0 ).contentWindow.vc_js();
		}
		$( window ).trigger( 'vc_build' );
	};
	vc.$frame.on( 'load', function () {
		function check() {
			if ( !vc.$frame.get( 0 ).contentWindow.vc_iframe ) {
				window.setTimeout( check, 100 );
				return;
			}
			if ( !vc.loaded ) {
				window.setTimeout( function () {
					vc.build();
				}, 50 );
			}
		}

		check();
	} );
})( window.jQuery );

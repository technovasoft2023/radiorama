/* global vc, i18nLocale */
(function ( $ ) {
	'use strict';
	vc.PostSettingsUIPanelFrontendEditor = vc.PostSettingsPanelView
		.vcExtendUI( vc.HelperPanelViewHeaderFooter )
		.vcExtendUI( vc.HelperPanelViewResizable )
		.vcExtendUI( vc.HelperPanelViewDraggable )
		.vcExtendUI( {
			panelName: 'post_settings',
			uiEvents: {
				'setSize': 'setEditorSize',
				'show': 'setEditorSize'
			},
			// Fix old editor call for resize.
			setSize: function () {
				this.trigger( 'setSize' );
			},
			setDefaultHeightSettings: function () {
				this.$el.css( 'height', '75vh' );
			},
			setEditorSize: function () {
				this.editor_css.setSizeResizable();
				this.editor_js_header.setSizeResizable();
				this.editor_js_footer.setSizeResizable();
			}
		} );
	vc.PostSettingsUIPanelBackendEditor = vc.PostSettingsPanelViewBackendEditor
		.vcExtendUI( vc.HelperPanelViewHeaderFooter )
		.vcExtendUI( vc.HelperPanelViewResizable )
		.vcExtendUI( vc.HelperPanelViewDraggable )
		.vcExtendUI( vc.HelperPanelSettingsPostCustomLayout )
		.vcExtendUI( {
			uiEvents: {
				'setSize': 'setEditorSize',
				'show': 'setEditorSize',
				'render': 'removeChangeTitleField'
			},
			setSize: function () {
				this.trigger( 'setSize' );
			},
			setEditorSize: function () {
				this.editor_css.setSizeResizable();
				this.editor_js_header.setSizeResizable();
				this.editor_js_footer.setSizeResizable();
			},
			setDefaultHeightSettings: function () {
				this.$el.css( 'height', '75vh' );
			},
			removeChangeTitleField: function () {
				$( '#vc_settings-title-container' ).remove();
			}
		} );
})( window.jQuery );

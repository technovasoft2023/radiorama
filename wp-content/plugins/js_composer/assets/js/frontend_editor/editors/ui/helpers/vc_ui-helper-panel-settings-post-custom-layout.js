(function ( $ ) {
	'use strict';

	window.vc.HelperPanelSettingsPostCustomLayout = {
		events: {
			'click [data-vc-ui-element="button-save"]': 'save',
			'click [data-vc-ui-element="button-close"]': 'hide',
			'click [data-vc-ui-element="button-minimize"]': 'toggleOpacity',
			'click .vc_post-custom-layout': 'changePostCustomLayout'
		},
		changePostCustomLayout: function ( e ) {
			if ( !e || !e.preventDefault ) {
				return;
			}

			e.preventDefault();

			var selected_layout = $(e.currentTarget);
			var layout_name = selected_layout.attr('data-post-custom-layout');

			selected_layout.addClass('vc-active-post-custom-layout');
			selected_layout.siblings().removeClass('vc-active-post-custom-layout');

			// set input that help us save layout values to post meta
			$('input[name=vc_post_custom_layout]').val(layout_name);
		}
	};
})( window.jQuery );

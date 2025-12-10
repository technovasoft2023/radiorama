/* =========================================================
 * custom_views.js v2.0
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WPBakery Page Builder ViewModel objects for shortcodes with custom
 * functionality.
 * ========================================================= */

(function ( $ ) {
	'use strict';

	if ( _.isUndefined( window.vc ) ) {
		window.vc = {};
	}
	vc.addTemplateFilter( function ( str ) {
		var random_id = VCS4() + '-' + VCS4();

		return str.replace( /tab\_id\=\"([^\"]+)\"/g, 'tab_id="$1' + random_id + '"' );
	} );
})( window.jQuery );

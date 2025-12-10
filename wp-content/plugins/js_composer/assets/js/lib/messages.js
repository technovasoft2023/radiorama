(function ( $ ) {
	vc.showMessage = function ( message, type, timeout, target ) {
		if ( vc.message_timeout ) {
			$( '.vc_message' ).remove();
			window.clearTimeout( vc.message_timeout );
		}
		if ( !type ) {
			type = 'success';
		}
		if ( !timeout ) {
			timeout = 10000;
		}
		var defaultSelector = window.vc_mode && 'admin_page' === window.vc_mode ? '.metabox-composer-content' : 'body';
		var selector = target ? target : defaultSelector;
		var $message = $( '<div class="vc_message ' + type + '" style="z-index: 999;">' + message + '</div>' ).prependTo( $(
			selector ) );
		$message.fadeIn( 500 );
		vc.message_timeout = window.setTimeout( function () {
			$message.slideUp( 500, function () {
				$( this ).remove();
			} );
			vc.message_timeout = false;
		}, timeout );
	};

	if ( window.vc_user_access && !window.vc_user_access().partAccess( 'unfiltered_html' ) ) {
		vc.showMessage( window.i18nLocale.unfiltered_html_access, 'type-error', 15000 );
	}
})( window.jQuery );

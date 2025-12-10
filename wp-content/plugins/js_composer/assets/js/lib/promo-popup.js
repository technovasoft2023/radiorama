(function ( $ ) {
	'use strict';

	var $promoModal = $( '#vc_ui-helper-promo-popup' );

	$promoModal.on( 'click', closeModal );

	function closeModal ( e ) {
		var $target = $( e.target );
		var isCloseButton = $target.closest( '[data-vc-ui-element="button-close"]' ).length;

		if ( isCloseButton ) {
			$promoModal.removeClass( 'vc_active' );
		}
	}
})( window.jQuery );

(function () {
	'use strict';

	vc.events.on( 'vc:access:initialize', function ( access ) {
		access.add( 'be_editor', vc_user_access().editor( 'grid_builder' ) );
		access.add( 'classic_editor', false );

		vc.events.trigger( 'vc:access:grid_builder:ready', access );
	} );
})();

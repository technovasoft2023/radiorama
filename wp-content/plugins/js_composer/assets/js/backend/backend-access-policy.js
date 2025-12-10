(function ( $ ) {
	'use strict';
	vc.AccessPolicyConstructor = function () {
		this.accessPolicy = {};
		vc.events.trigger( 'vc:access:initialize', this );
	};

	vc.AccessPolicyConstructor.prototype = {
		accessPolicy: {},
		add: function ( part, grant ) {
			grant = _.isUndefined( grant ) ? true : !!grant;
			this.accessPolicy[ part ] = grant;
		},
		can: function ( part ) {
			return !!this.accessPolicy[ part ];
		}
	};

	$( function () {
		vc.accessPolicy = new vc.AccessPolicyConstructor();
	} );
})( window.jQuery );

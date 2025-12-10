if ( _.isUndefined( window.vc ) ) {
	window.vc = {};
}
jQuery( document ).ready( function ( $ ) {
	'use strict';
	if ( !_.isUndefined( window.less ) ) {
		window.vc.less = {};
		window.vc.less.options = {
			relativeUrls: false,
			rootpath: false
		};
		window.less.options.env = vcData.debug ? 'development' : 'production';
		window.less.options.logLevel = vcData.debug ? 4 : 0;
		window.vc.less.generateLessFormData = function ( formData, variablesData ) {
			var lessData = {};
			if ( !_.isEmpty( variablesData ) ) {
				_.each( variablesData, function ( value, key ) {
					var object, objectValue;
					if ( _.isString( value ) ) {
						object = _.first( _.where( formData, { 'name': value } ) );
						if ( _.isObject( object ) ) {
							objectValue = object.value;
							if ( 0 < objectValue.length ) {
								lessData[ key ] = objectValue;
							}
						}
					} else if ( _.isObject( value ) && !_.isUndefined( value.key ) ) {
						object = _.first( _.where( formData, { 'name': value.key } ) );
						if ( !_.isObject( object ) && !_.isUndefined( value.default_key ) ) {
							if ( !_.isUndefined( lessData[ value.default_key ] ) ) {
								object = { value: lessData[ value.default_key ] }; // take the data from already parsed variable
							} else {
								object = _.first( _.where( formData, { 'name': value.default_key } ) ); // take data from form
							}
						} else if ( !_.isObject( object ) && !_.isUndefined( value.default ) ) {
							object = { value: value.default }; // pass default value to data
						}

						if ( _.isObject( object ) ) {
							objectValue = object.value;

							if ( !_.isUndefined( value.modify_output ) && _.isObject( value.modify_output ) && !_.isEmpty(
								value.modify_output ) ) {
								_.each( value.modify_output, function ( modifier ) {
									// In case if value must be wrapped in some mixin
									if ( !_.isUndefined( modifier.plain ) && _.isObject( modifier.plain ) && !_.isEmpty(
										modifier.plain ) ) {
										_.each( modifier.plain, function ( data ) {
											var localValue;

											localValue = data.replace( '{{ value }}', objectValue );
											objectValue = localValue;
										} );
									}
								} );
							}

							if ( objectValue && 0 < objectValue.length ) {
								lessData[ key ] = objectValue;
							}
						}
					}
				} );
			}

			return lessData;
		};
		window.vc.less.fileManager = less.FileManager.prototype.extractUrlParts;

		window.less.FileManager.prototype.extractUrlParts = function ( url, baseUrl ) {
			var output;

			url += '?v=' + (window.vcData && window.vcData.version ? window.vcData.version : '4.5');
			output = vc.less.fileManager( url, baseUrl );

			return output;
		};

		window.vc.less.build = function ( options, callback ) {
			var self;

			this.options = _.extend( {}, {
				modifyVars: {},
				variablesDataLinker: {},
				lessPath: ''
			}, this.options, options );

			this.options.modifyVars = this.generateLessFormData( this.options.modifyVars, this.options.variablesDataLinker );
			self = this;
			_.defer( function () {
				less.render(
					'@import "' + self.options.lessPath + '";',
					self.options
				).then(
					function ( output ) {
						if ( callback ) {
							callback.call( self, output );
						}
					},
					function ( error ) {
						if ( callback ) {
							callback.call( self, undefined, error );
						}
					}
				);
			} );
		};
	}
} );

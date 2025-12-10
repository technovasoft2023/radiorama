/* =========================================================
 * custom_views.js v1.1
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WPBakery Page Builder Frontend modals & collections
 * ========================================================= */

(function ( $ ) {
	'use strict';

	if ( _.isUndefined( window.vc ) ) {
		window.vc = {};
	}
	/**
	 * Shortcode model
	 * @type {*}
	 */
	var Shortcode = Backbone.Model.extend( {
		defaults: function () {
			var id = vc_guid();
			return {
				id: id,
				shortcode: 'vc_text_block',
				order: vc.shortcodes.nextOrder(),
				params: {},
				parent_id: false
			};
		},
		settings: false,
		getParam: function ( key ) {
			return _.isObject( this.get( 'params' ) ) && !_.isUndefined( this.get( 'params' )[ key ] ) ? this.get(
				'params' )[ key ] : '';
		},
		sync: function () {
			return false;
		},
		setting: function ( name ) {
			if ( false === this.settings ) {
				this.settings = vc.getMapped( this.get( 'shortcode' ) ) || {};
			}
			return this.settings[ name ];
		},
		view: false
	} );
	/**
	 * Collection of all shortcodes.
	 * @type {*}
	 */
	var Shortcodes = Backbone.Collection.extend( {
		model: Shortcode,
		sync: function () {
			return false;
		},
		nextOrder: function () {
			if ( !this.length ) {
				return 1;
			}
			return this.last().get( 'order' ) + 1;
		},
		initialize: function () {
			this.bind( 'remove', this.removeChildren, this );
			this.bind( 'remove', vc.builder.checkNoContent );
			this.bind( 'remove', this.removeEvents, this );
		},
		comparator: function ( model ) {
			return model.get( 'order' );
		},
		removeEvents: function ( model ) {
			//Triggering shortcodes destroy in frontend
			window.vc.events.triggerShortcodeEvents( 'destroy', model );
		},
		/**
		 * Remove all children of the model from storage.
		 * Will remove children of children models too.
		 * @param parent - model which is parent
		 */
		removeChildren: function ( parent ) {
			var models = vc.shortcodes.where( { parent_id: parent.id } );
			_.each( models, function ( model ) {
				model.destroy(); // calls itself recursively removeChildren
			}, this );
		},
		stringify: function ( state ) {
			var models = _.sortBy( vc.shortcodes.where( { parent_id: false } ), function ( model ) {
				return model.get( 'order' );
			} );

			return this.modelsToString( models, state );
		},
		singleStringify: function ( id, state ) {
			return this.modelsToString( [ vc.shortcodes.get( id ) ], state );
		},
		createShortcodeString: function ( model, state ) {
			var mapped, data, tag, params, content, paramsForString, mergedParams, isContainer;

			tag = model.get( 'shortcode' );
			params = _.extend( {}, model.get( 'params' ) );
			paramsForString = {};
			mergedParams = vc.getMergedParams( tag, params );
			_.each( mergedParams, function ( value, key ) {
				paramsForString[ key ] = vc.builder.escapeParam( value );
			}, this );
			mapped = vc.getMapped( tag );
			isContainer = _.isObject( mapped ) && ((_.isBoolean( mapped.is_container ) && true === mapped.is_container) || !_.isEmpty(
				mapped.as_parent ));
			content = this._getShortcodeContent( model, state );
			data = {
				tag: tag,
				attrs: paramsForString,
				content: content,
				type: _.isUndefined( vc.getParamSettings( tag, 'content' ) ) && !isContainer ? 'single' : ''
			};
			if ( _.isUndefined( state ) ) {
				model.trigger( 'stringify', model, data );
			} else {
				model.trigger( 'stringify:' + state, model, data );
			}

			return wp.shortcode.string( data );
		},
		modelsToString: function ( models, state ) {
			var string = _.reduce( models, function ( memo, model ) {
				return memo + this.createShortcodeString( model, state );
			}, '', this );

			return string;
		},
		/**
		 * If shortcode is container like, gets content of is shortcode in shortcodes style.
		 * @param parent - shortcode inside which content is.
		 * @return {*}
		 * @private
		 */
		_getShortcodeContent: function ( parent, state ) {
			var models, params;
			models = _.sortBy(
				window.vc.shortcodes.where( { parent_id: parent.get( 'id' ) } ),
				function ( model ) {
					return model.get( 'order' );
				}
			);
			if ( !models.length ) {
				params = _.extend( {}, parent.get( 'params' ) );
				return _.isUndefined( params.content ) ? '' : params.content;
			}

			return _.reduce( models, function ( memo, model ) {
				return memo + this.createShortcodeString( model, state );
			}, '', this );
		},
		create: function ( model, options ) {
			model = Shortcodes.__super__.create.call( this, model, options );
			if ( model.get( 'cloned' ) ) {
				window.vc.events.triggerShortcodeEvents( 'clone', model );
			}
			window.vc.events.triggerShortcodeEvents( 'add', model );

			return model;
		}
	} );
	window.vc.shortcodes = new Shortcodes();
})( window.jQuery );

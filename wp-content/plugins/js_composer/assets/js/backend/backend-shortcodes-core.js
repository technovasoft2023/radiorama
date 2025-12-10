(function ( $ ) {
	'use strict';
	vc.clone_index = 1;
	/**
	 * Default view for shortcode as block inside WPBakery Page Builder design mode.
	 * @type {*}
	 */
	vc.shortcode_view = Backbone.View.extend( {
		tagName: 'div',
		$content: '',
		use_default_content: false,
		params: {},
		events: {
			'click .column_delete,.vc_control-btn-delete': 'deleteShortcode',
			'click .column_add,.vc_control-btn-prepend': 'addElement',
			'click .column_edit,.vc_control-btn-edit, .column_edit_trigger': 'editElement',
			'click .column_clone,.vc_control-btn-clone': 'clone',
			'click .column_copy,.vc_control-btn-copy': 'copy',
			'click .column_paste,.vc_control-btn-paste': 'paste',
			'mousemove': 'checkControlsPosition'
		},
		removeView: function () {
			vc.closeActivePanel( this.model );
			this.remove();
		},
		checkControlsPosition: function () {
			if ( !this.$controls_buttons ) {
				return;
			}
			var window_top, element_position_top, new_position,
				element_height = this.$el.height(),
				window_height = $( window ).height();
			if ( element_height > window_height ) {
				window_top = $( window ).scrollTop();
				element_position_top = this.$el.offset().top;
				new_position = (window_top - element_position_top) + $( window ).height() / 2;
				if ( 40 < new_position && new_position < element_height ) {
					this.$controls_buttons.css( 'top', new_position );
				} else if ( new_position > element_height ) {
					this.$controls_buttons.css( 'top', element_height - 40 );
				} else {
					this.$controls_buttons.css( 'top', 40 );
				}
			}
		},
		initialize: function () {
			this.model.bind( 'destroy', this.removeView, this );
			this.model.bind( 'change:params', this.changeShortcodeParams, this );
			this.model.bind( 'change_parent_id', this.changeShortcodeParent, this );
			this.createParams();
		},
		/**
		 * @deprecated since 4.8 vc_user_access should be used
		 * @returns {boolean}
		 */
		hasUserAccess: function () {
			var shortcodeTag;

			shortcodeTag = this.model.get( 'shortcode' );
			if ( - 1 < _.indexOf( [
				"vc_row",
				"vc_column",
				"vc_row_inner",
				"vc_column_inner"
			], shortcodeTag ) ) {
				return true; // we cannot block controls for these shortcodes;
			}

			if ( !_.every( vc.roles.current_user, function ( role ) {
				return !(!_.isUndefined( vc.roles[ role ] ) && !_.isUndefined( vc.roles[ role ].shortcodes ) && _.isUndefined( vc.roles[ role ].shortcodes[ shortcodeTag ] ));
			} ) ) {
				return false;
			}
			return true;
		},
		/**
		 * Check does current user have a access to shortcode via vc_roles.
		 *
		 * @since 4.8
		 * @param action,
		 */
		canCurrentUser: function ( action ) {
			var tag, result = false;
			tag = this.model.get( 'shortcode' );
			if ( undefined === action || 'all' === action ) {
				result = vc_user_access().shortcodeAll( tag );
			} else {
				result = vc_user_access().shortcodeEdit( tag );
			}
			return result;
		},
		createParams: function () {
			var tag, settings, params;

			tag = this.model.get( 'shortcode' );
			settings = _.isObject( vc.map[ tag ] ) && _.isArray( vc.map[ tag ].params ) ? vc.map[ tag ].params : [];
			params = this.model.get( 'params' );
			this.params = {};
			_.each( settings, function ( param ) {
				this.params[ param.param_name ] = param;
			}, this );
		},
		setContent: function () {
			this.$content = this.$el.find( '> .wpb_element_wrapper > .vc_container_for_children,' + ' > .vc_element-wrapper > .vc_container_for_children' );
		},
		setEmpty: function () {
		},
		unsetEmpty: function () {

		},
		checkIsEmpty: function () {
			if ( this.model.get( 'parent_id' ) ) {
				vc.app.views[ this.model.get( 'parent_id' ) ].checkIsEmpty();
			}
		},

		/**
		 * Convert html into correct element
		 * @param html
		 */
		html2element: function ( html ) {
			var attributes = {},
				$template;
			var template = vc.template( html );
			$template = $( template( this.model.toJSON() ).trim() );
			_.each( $template.get( 0 ).attributes, function ( attr ) {
				attributes[ attr.name ] = attr.value;
			} );
			this.$el.attr( attributes ).html( $template.html() );
			this.setContent();
			this.renderContent();

		},
		render: function () {
			var $shortcode_template_el = $( '#vc_shortcode-template-' + this.model.get( 'shortcode' ) );
			if ( $shortcode_template_el.is( 'script' ) ) {
				this.html2element( $shortcode_template_el.html() );
			}
			this.model.view = this;
			this.$controls_buttons = this.$el.find( '.vc_controls > :first' );
			return this;
		},
		renderContent: function () {
			this.$el.attr( 'data-model-id', this.model.get( 'id' ) );
			this.$el.data( 'model', this.model );
			return this;
		},
		changedContent: function ( view ) {
		},
		_loadDefaults: function () {
			var tag,
				hasChilds;

			tag = this.model.get( 'shortcode' );
			hasChilds = !!vc.shortcodes.where( { parent_id: this.model.get( 'id' ) } ).length;
			if ( !hasChilds && true === this.use_default_content && _.isObject( vc.map[ tag ] ) && _.isString( vc.map[ tag ].default_content ) && vc.map[ tag ].default_content.length ) {
				this.use_default_content = false;
				vc.shortcodes.createFromString( vc.map[ tag ].default_content, this.model );
			}
		},
		_callJsCallback: function () {
			//Fire INIT callback if it is defined
			var tag = this.model.get( 'shortcode' );
			if ( _.isObject( vc.map[ tag ] ) && _.isObject( vc.map[ tag ].js_callback ) && !_.isUndefined( vc.map[ tag ].js_callback.init ) ) {
				var fn = vc.map[ tag ].js_callback.init;
				window[ fn ]( this.$el );
			}
		},
		ready: function ( e ) {
			this._loadDefaults();
			this._callJsCallback();
			if ( this.model.get( 'parent_id' ) && _.isObject( vc.app.views[ this.model.get( 'parent_id' ) ] ) ) {
				vc.app.views[ this.model.get( 'parent_id' ) ].changedContent( this );
			}
			_.defer( _.bind( function () {
				vc.events.trigger( 'shortcodeView:ready', this );
				vc.events.trigger( 'shortcodeView:ready:' + this.model.get( 'shortcode' ), this );
			}, this ) );
			return this;
		},
		// View utils {{
		addShortcode: function ( view, method ) {
			var before_shortcode;
			before_shortcode = _.last( vc.shortcodes.filter( function ( shortcode ) {
				return shortcode.get( 'parent_id' ) === this.get( 'parent_id' ) && parseFloat( shortcode.get( 'order' ) ) < parseFloat( this.get( 'order' ) );
			}, view.model ) );
			if ( before_shortcode ) {
				view.render().$el.insertAfter( '[data-model-id=' + before_shortcode.id + ']' );
			} else if ( 'append' === method ) {
				this.$content.append( view.render().el );
			} else {
				this.$content.prepend( view.render().el );
			}
		},
		changeShortcodeParams: function ( model ) {
			var tag,
				params,
				settings,
				view;
			// Triggered when shortcode being updated
			tag = model.get( 'shortcode' );
			params = model.get( 'params' );
			settings = vc.map[ tag ];
			_.defer( function () {
				vc.events.trigger( 'backend.shortcodeViewChangeParams:' + tag );
			} );

			if ( _.isArray( settings.params ) || _.isObject( settings.params ) ) {
				_.each( settings.params, function ( param_settings ) {
					var name,
						value,
						$wrapper,
						label_value,
						$admin_label;

					name = param_settings.param_name;
					value = params[ name ];
					$wrapper = this.$el.find( '> .wpb_element_wrapper, > .vc_element-wrapper' );
					label_value = value;
					$admin_label = $wrapper.children( '.admin_label_' + name );

					if ( _.isObject( vc.atts[ param_settings.type ] ) && _.isFunction( vc.atts[ param_settings.type ].render ) ) {
						value = vc.atts[ param_settings.type ].render.call( this, param_settings, value );
					}
					if ( $wrapper.children( '.' + param_settings.param_name ).is( 'input,textarea,select' ) ) {
						$wrapper.children( '[name=' + param_settings.param_name + ']' ).val( value );
					} else if ( $wrapper.children( '.' + param_settings.param_name ).is( 'iframe' ) ) {
						$wrapper.children( '[name=' + param_settings.param_name + ']' ).attr( 'src', value );
					} else if ( $wrapper.children( '.' + param_settings.param_name ).is( 'img' ) ) {
						var $img;

						$img = $wrapper.children( '[name=' + param_settings.param_name + ']' );
						if ( value && value.match( /^\d+$/ ) ) {
							$.ajax( {
								type: 'POST',
								url: window.ajaxurl,
								data: {
									action: 'wpb_single_image_src',
									content: value,
									size: 'thumbnail',
									_vcnonce: window.vcAdminNonce
								},
								dataType: 'html',
								context: this
							} ).done( function ( url ) {
								$img.attr( 'src', url );
							} );
						} else if ( value ) {
							$img.attr( 'src', value );
						}
					} else {
						$wrapper.children( '[name=' + param_settings.param_name + ']' ).html( value ? vc_wpautop( value ) : '' );
					}
					if ( $admin_label.length ) {
						var inverted_value;

						if ( '' === value || _.isUndefined( value ) ) {
							$admin_label.hide().addClass( 'hidden-label' );
						} else {
							if ( _.isObject( param_settings.value ) && !_.isArray( param_settings.value ) && 'checkbox' === param_settings.type ) {
								inverted_value = _.invert( param_settings.value );
								label_value = _.map( value.split( /[\s]*\,[\s]*/ ), function ( val ) {
									return _.isString( inverted_value[ val ] ) ? inverted_value[ val ] : val;
								} ).join( ', ' );
							} else if ( _.isObject( param_settings.value ) && !_.isArray( param_settings.value ) ) {
								inverted_value = _.invert( param_settings.value );
								label_value = _.isString( inverted_value[ value ] ) ? inverted_value[ value ] : value;
							}
							$admin_label.html( '<label>' + $admin_label.find( 'label' ).text() + '</label>: ' + _.escape( label_value ) );
							$admin_label.show().removeClass( 'hidden-label' );
						}
					}
				}, this );
			}
			view = vc.app.views[ model.get( 'parent_id' ) ];
			if ( false !== model.get( 'parent_id' ) && _.isObject( view ) ) {
				view.checkIsEmpty();
			}
		},
		changeShortcodeParent: function ( model ) {
			var $parent_view, view;
			if ( false === this.model.get( 'parent_id' ) ) {
				return model;
			}
			$parent_view = $( '[data-model-id=' + this.model.get( 'parent_id' ) + ']' );
			view = vc.app.views[ this.model.get( 'parent_id' ) ];
			this.$el.appendTo( $parent_view.find( '> .wpb_element_wrapper > .wpb_column_container,' + ' > .vc_element-wrapper > .wpb_column_container' ) );
			view.checkIsEmpty();
		},
		// }}
		// Event Actions {{
		deleteShortcode: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
			}
			this.model.destroy();
		},
		addElement: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
			}
			$('#ut-vc-overlay').addClass('show');
			vc.add_element_block_view.render( this.model, !_.isObject( e ) || !$( e.currentTarget ).closest( '.bottom-controls' ).hasClass( 'bottom-controls' ) );
		},
		editElement: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
			}
			if ( !vc.active_panel || !vc.active_panel.model || !this.model || (vc.active_panel.model && this.model && vc.active_panel.model.get( 'id' ) !== this.model.get( 'id' )) ) {
				vc.closeActivePanel();
				vc.edit_element_block_view.render( this.model );
			}
		},
		clone: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
			}
			vc.clone_index /= 10;
			return this.cloneModel( this.model, this.model.get( 'parent_id' ) );
		},
		copy: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
				// prevent post title input from focusing
				e.currentTarget.focus();
			}
			return vc.copyShortcode(this.model);
		},
		paste: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
			}
			vc.clone_index /= 10;
			return vc.pasteShortcode(this.model);
		},
		cloneModel: function ( model, parent_id, save_order ) {
			var new_order,
				model_clone,
				params,
				tag;

			new_order = _.isBoolean( save_order ) && true === save_order ? model.get( 'order' ) : parseFloat( model.get( 'order' ) ) + vc.clone_index;
			params = this.ut_check_unique_id( _.extend({}, model.get("params")) ), // @United
			tag = model.get( 'shortcode' );

			model_clone = vc.shortcodes.create( {
				shortcode: tag,
				id: window.vc_guid(),
				parent_id: parent_id,
				order: new_order,
				cloned: true,
				cloned_from: model.toJSON(),
				params: params
			} );

			_.each( vc.shortcodes.where( { parent_id: model.id } ), function ( shortcode ) {
				this.cloneModel( shortcode, model_clone.get( 'id' ), true );
			}, this );
			return model_clone;
		},
		//@united
		ut_check_unique_id: function ( params ) {
			if( params["unique_id"] !== undefined ) {

				$.ajax({
					type: 'POST',
					url: ajaxurl,
					dataType: 'json',
					async: false,
					data: {
						action: 'gallery_manager_copy',
						params: params
					},
					success: function( res ) {

						// check against id param
						if( typeof res.unique_id !== undefined ) {

							// assign new unique ID
							params["unique_id"] = res.unique_id;

						}

						// check against settings param
						if( res["portfolio_gallery"] !== undefined ) {

							// assign new unique ID
							params["portfolio_gallery"] = res["portfolio_gallery"];

						}
					},
					error: function(){

						// reset ID to avoid conflicts
						params["unique_id"] = '';

					}

				});

			}

			return params;
		},
		remove: function () {
			if ( this.$content && this.$content.data( 'uiSortable' ) ) {
				this.$content.sortable( 'destroy' );
			}
			if ( this.$content && this.$content.data( 'uiDroppable' ) ) {
				this.$content.droppable( 'destroy' );
			}

			delete vc.app.views[ this.model.id ];
			window.vc.shortcode_view.__super__.remove.call( this );
		}
	} );

	/**
	 * Called when initial content rendered or when content changed in tinymce
	 */
	vc.shortcodes.on( 'sync', function ( collection ) {
		if ( _.isObject( collection ) && !_.isEmpty( collection.models ) ) {
			_.each( collection.models, function ( model ) {
				vc.events.triggerShortcodeEvents( 'sync', model );
			} );
		}
	} );
	/**
	 * Called when shortcode created
	 */
	vc.shortcodes.on( 'add', function ( model ) {
		if ( _.isObject( model ) ) {
			vc.events.triggerShortcodeEvents( 'add', model );
		}
	} );
})( window.jQuery );

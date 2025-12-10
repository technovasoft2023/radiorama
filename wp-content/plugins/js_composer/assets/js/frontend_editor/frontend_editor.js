/* =========================================================
 * vc.js v1.0.1
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WPBakery Page Builder Frontend backbone/underscore version
 * ========================================================= */
/**
 * Create Unique id for records in storage.
 * Generate a pseudo-GUID by concatenating random hexadecimal.
 * @return {String}
 */
function vc_guid() {
	return (VCS4() + VCS4() + "-" + VCS4());
}

// Generate four random hex digits.
function VCS4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString( 16 ).substring( 1 );
}

if ( _.isUndefined( window.vc ) ) {
	window.vc = {};
}
window.vcFramePost = false;
_.extend( vc, {
	no_title_placeholder: window.i18nLocale.no_title_parenthesis,
	responsive_disabled: false,
	// post_id: window.vc_post_id,
	activity: false,
	clone_index: 1,
	loaded: false,
	path: '',
	admin_ajax: window.ajaxurl,
	filters: { templates: [] },
	title: '',
	$title: false,
	update_title: false,
	$hold_active: false,
	data_changed: false,
	setDataChanged: function () {
		if ( vc.undoRedoApi ) {
			var that = this;
			_.defer( function () {
				that.addUndo( vc.builder.getContent() );
			} );
		}
		window.jQuery( window ).on( 'beforeunload.vcSave', function ( e ) {
			return window.i18nLocale.confirm_to_leave;
		} );
		this.data_changed = true;
	},
	addUndo: _.debounce( function ( content ) {
		vc.undoRedoApi.add( content );
	}, 100 ),
	unsetDataChanged: function () {
		window.jQuery( window ).off( 'beforeunload.vcSave' );
		this.data_changed = false;
	},
	addTemplateFilter: function ( callback ) {
		if ( _.isFunction( callback ) ) {
			this.filters.templates.push( callback );
		}
	},
	unsetHoldActive: function () {
		if ( this.$hold_active ) {
			this.$hold_active.removeClass( 'vc_hold-active' );
			this.$hold_active = false;
		}
	}
} );
(function ( $ ) {
	'use strict';

	vc.map = {};
	vc.setFrameSize = function ( size ) {
		var $vc_navbar = $( '#vc_navbar' );
		var height = $( window ).height() - $vc_navbar.height();
		vc.$frame.width( size );
		vc.$frame_wrapper.css( { top: $vc_navbar.height() } );
		vc.$frame.height( height );
	};
	vc.getDefaults = vc.memoizeWrapper( function ( tag ) {
		var defaults, params;

		defaults = {};
		params = _.isArray( vc.getMapped( tag ).params ) ? vc.getMapped( tag ).params : [];
		_.each( params, function ( param ) {
			if ( _.isObject( param ) ) {
				if ( !_.isUndefined( param.std ) ) {
					defaults[ param.param_name ] = param.std;
				} else {
					if ( vc.atts[ param.type ] && vc.atts[ param.type ].defaults ) {
						defaults[ param.param_name ] = vc.atts[ param.type ].defaults( param );
					} else if ( !_.isUndefined( param.value ) ) {
						if ( _.isObject( param.value ) && !_.isArray( param.value ) && !_.isString( param.value ) ) {
							defaults[ param.param_name ] = _.values( param.value )[ 0 ];
						} else if ( _.isArray( param.value ) ) {
							defaults[ param.param_name ] = param.value[ 0 ];
						} else {
							defaults[ param.param_name ] = param.value;
						}
					}
				}
			}
		} );

		return defaults;
	} );

	vc.getDefaultsAndDependencyMap = vc.memoizeWrapper( function ( tag ) {
		var defaults, dependencyMap, params;
		dependencyMap = {};
		defaults = {};
		params = _.isArray( vc.getMapped( tag ).params ) ? vc.getMapped( tag ).params : [];

		_.each( params, function ( param ) {
			if ( _.isObject( param ) && 'content' !== param.param_name ) {
				// Building defaults
				if ( !_.isUndefined( param.std ) ) {
					defaults[ param.param_name ] = param.std;
				} else if ( !_.isUndefined( param.value ) ) {
					if ( vc.atts[ param.type ] && vc.atts[ param.type ].defaults ) {
						defaults[ param.param_name ] = vc.atts[ param.type ].defaults( param );
					} else if ( _.isObject( param.value ) ) {
						defaults[ param.param_name ] = _.values( param.value )[ 0 ];
					} else if ( _.isArray( param.value ) ) {
						defaults[ param.param_name ] = param.value[ 0 ];
					} else {
						defaults[ param.param_name ] = param.value;
					}
				}
				// Building dependency map
				if ( !_.isUndefined( param.dependency ) && !_.isUndefined( param.dependency.element ) ) {
					// We can only hook dependency to exact element value
					dependencyMap[ param.param_name ] = param.dependency;
				}
			}
		} );

		return { defaults: defaults, dependencyMap: dependencyMap };
	} );

	vc.getMergedParams = function ( tag, values ) {
		var paramsMap, outputParams, paramsDependencies;
		paramsMap = vc.getDefaultsAndDependencyMap( tag );
		outputParams = {};

		// Make all values extended from default
		values = _.extend( {}, paramsMap.defaults, values );
		paramsDependencies = _.extend( {}, paramsMap.dependencyMap );
		_.each( values, function ( value, key ) {
			if ( 'content' !== key ) {
				var paramSettings;

				// checking dependency
				if ( !_.isUndefined( paramsDependencies[ key ] ) ) {
					// now we know that param has dependency, so we must check is it satisfy a statement
					if ( !_.isUndefined( paramsDependencies[ paramsDependencies[ key ].element ] ) && _.isBoolean(
						paramsDependencies[ paramsDependencies[ key ].element ].failed ) && true === paramsDependencies[ paramsDependencies[ key ].element ].failed ) {
						paramsDependencies[ key ].failed = true;
						return; // in case if we already failed a dependency (a-b-c)
					}
					var rules, isDependedEmpty, dependedElement, dependedValue;
					dependedElement = paramsDependencies[ key ].element;
					dependedValue = values[ dependedElement ];
					var dependedValueSplit = false;
					if ( 'string' === typeof dependedValue ) {
						dependedValueSplit = values[ dependedElement ].split( ',' ).map( function ( i ) {
							return i.trim();
						} ).filter( function ( i ) {
							return i;
						} );
					}
					isDependedEmpty = _.isEmpty( dependedValue );

					rules = _.omit( paramsDependencies[ key ], 'element' );
					if (
						(
							// check rule 'not_empty'
							_.isBoolean( rules.not_empty ) && true === rules.not_empty && isDependedEmpty
						) || (
							// check rule 'is_empty'
							_.isBoolean( rules.is_empty ) && true === rules.is_empty && !isDependedEmpty
						) || (
							(
								// check rule 'value'
								rules.value && !_.intersection( (
										_.isArray( rules.value ) ? rules.value : [ rules.value ]),
									(_.isArray( dependedValue ) ? dependedValue : [ dependedValue ])
								).length
							) && (
								// check rule 'value'
								dependedValueSplit && rules.value && !_.intersection( (
										_.isArray( rules.value ) ? rules.value : [ rules.value ]),
									(_.isArray( dependedValueSplit ) ? dependedValueSplit : [ dependedValueSplit ])
								).length
							)
						) || (
							(
								// check rule 'value_not_equal_to'
								rules.value_not_equal_to && _.intersection( (
										_.isArray( rules.value_not_equal_to ) ? rules.value_not_equal_to : [ rules.value_not_equal_to ]),
									(_.isArray( dependedValue ) ? dependedValue : [ dependedValue ])
								).length
							) && (
								// check rule 'value_not_equal_to'
								dependedValueSplit && rules.value_not_equal_to && _.intersection( (
										_.isArray( rules.value_not_equal_to ) ? rules.value_not_equal_to : [ rules.value_not_equal_to ]),
									(_.isArray( dependedValueSplit ) ? dependedValueSplit : [ dependedValueSplit ])
								).length
							)
						)
					) {
						paramsDependencies[ key ].failed = true;
						return; // some of these rules doesn't satisfy so just exit
					}
				}
				// now check for defaults if not deleted already
				paramSettings = vc.getParamSettings( tag, key );

				if ( _.isUndefined( paramSettings ) ) {
					outputParams[ key ] = value;
					// this means that param is not mapped
					// so maybe it is can be used somewhere in other place.
					// We need to save it anyway. #93627986
				} else if (
					( // add value if it is not same as default
						!_.isUndefined( paramsMap.defaults[ key ] ) && paramsMap.defaults[ key ] !== value
					) || (
						// or if no defaults exists -> add value if it is not empty
						_.isUndefined( paramsMap.defaults[ key ] ) && '' !== value
					) || (
						// Or it is required to save always
					!_.isUndefined( paramSettings.save_always ) && true === paramSettings.save_always)
				) {
					outputParams[ key ] = value;
				}
			}
		} );

		return outputParams;
	};

	vc.getParamSettings = vc.memoizeWrapper( function ( tag, paramName ) {
		var params, paramSettings;

		params = _.isArray( vc.getMapped( tag ).params ) ? vc.getMapped( tag ).params : [];
		paramSettings = _.find( params, function ( settings ) {
			return _.isObject( settings ) && settings.param_name === paramName;
		}, this );
		return paramSettings;
	}, function () {
		return arguments[ 0 ] + ',' + arguments[ 1 ];
	} );

	vc.getParamSettingsByType = vc.memoizeWrapper( function ( tag, paramType ) {
		var params, paramSettings;

		params = _.isArray( vc.getMapped( tag ).params ) ? vc.getMapped( tag ).params : [];
		paramSettings = _.find( params, function ( settings ) {
			return _.isObject( settings ) && settings.type === paramType;
		}, this );

		return paramSettings;
	}, function () {
		return arguments[ 0 ] + ',' + arguments[ 1 ];
	} );

	/**
	 * Checks if given shortcode has el_id param
	 */
	vc.shortcodeHasIdParam = vc.memoizeWrapper( function ( tag ) {
		return vc.getParamSettingsByType( tag, 'el_id' );
	} );

	vc.buildRelevance = function () {
		vc.shortcode_relevance = {};
		_.each( vc.map, function ( object ) {

			if ( _.isObject( object.as_parent ) && _.isString( object.as_parent.only ) ) {
				vc.shortcode_relevance[ 'parent_only_' + object.base ] = object.as_parent.only.replace( /\s/,
					'' ).split( ',' );
			}
			if ( _.isObject( object.as_parent ) && _.isString( object.as_parent.except ) ) {
				vc.shortcode_relevance[ 'parent_except_' + object.base ] = object.as_parent.except.replace( /\s/,
					'' ).split( ',' );
			}
			if ( _.isObject( object.as_child ) && _.isString( object.as_child.only ) ) {
				vc.shortcode_relevance[ 'child_only_' + object.base ] = object.as_child.only.replace( /\s/,
					'' ).split( ',' );
			}
			if ( _.isObject( object.as_child ) && _.isString( object.as_child.except ) ) {
				vc.shortcode_relevance[ 'child_except_' + object.base ] = object.as_child.except.replace( /\s/,
					'' ).split( ',' );
			}
		} );
		/**
		 * Check parent/children relationship between two tags
		 * @param tag
		 * @param related_tag
		 * @return boolean - Returns true if relevance is positive
		 */
		vc.checkRelevance = function ( tag, related_tag ) {
			if ( _.isArray( vc.shortcode_relevance[ 'parent_only_' + tag ] ) && !_.contains( vc.shortcode_relevance[ 'parent_only_' + tag ],
				related_tag ) ) {
				return false;
			}
			if ( _.isArray( vc.shortcode_relevance[ 'parent_except_' + tag ] ) && _.contains( vc.shortcode_relevance[ 'parent_except_' + tag ],
				related_tag ) ) {
				return false;
			}
			if ( _.isArray( vc.shortcode_relevance[ 'child_only_' + related_tag ] ) && !_.contains( vc.shortcode_relevance[ 'child_only_' + related_tag ],
				tag ) ) {
				return false;
			}
			if ( _.isArray( vc.shortcode_relevance[ 'child_except_' + related_tag ] ) && _.contains( vc.shortcode_relevance[ 'child_except' + related_tag ],
				tag ) ) {
				return false;
			}
			return true;
		};
	};

	vc.CloneModel = function ( builder, model, parent_id, child_of_clone ) {
		vc.clone_index /= 10;
		var newOrder,
			params,
			tag,
			data,
			newModel;

		newOrder = _.isBoolean( child_of_clone ) && true === child_of_clone ? model.get( 'order' ) : parseFloat( model.get(
			'order' ) ) + vc.clone_index;
		params = _.extend( {}, model.get( 'params' ) );
		tag = model.get( 'shortcode' );

		data = {
			shortcode: tag,
			parent_id: parent_id,
			order: newOrder,
			cloned: true,
			cloned_from: model.toJSON(),
			params: params
		};

		if ( vc[ 'cloneMethod_' + tag ] ) {
			data = vc[ 'cloneMethod_' + tag ]( data, model );
		}
		if ( !_.isBoolean( child_of_clone ) || true !== child_of_clone ) {
			data.place_after_id = model.get( 'id' );
		}
		builder.create( data );

		newModel = builder.last();

		_.each( vc.shortcodes.where( { parent_id: model.get( 'id' ) } ), function ( shortcode ) {
			vc.CloneModel( builder, shortcode, newModel.get( 'id' ), true );
		}, this );
		return newModel;
	};
	vc.getColumnSize = function ( column ) {
		var mod = 12 % column,
			is_odd = function ( n ) {
				return _.isNumber( n ) && (1 === n % 2);
			};
		if ( 0 < mod && is_odd( column ) && column % 3 ) {
			return column + '/' + 12;
		}
		if ( 0 === mod ) {
			mod = column;
		}
		return column / mod + '/' + (12 / mod);
	};
	window.InlineShortcodeView = vc.shortcode_view = Backbone.View.extend( {
		hold_hover_on: false,
		events: {
			'click > .vc_controls .vc_control-btn-delete': 'destroy',
			'click > .vc_controls .vc_control-btn-edit': 'edit',
			'click > .vc_controls .vc_control-btn-clone': 'clone',
			'click > .vc_controls .vc_control-btn-copy': 'copy',
			'click > .vc_controls .vc_control-btn-paste': 'paste',
			'mousemove': 'checkControlsPosition'
		},
		controls_set: false,
		$content: false,
		move_timeout: false,
		out_timeout: false,
		hold_active: true,
		frame_message: false,
		builder: false,
		default_controls_template: false,
		initialize: function () {
			this.listenTo( this.model, 'destroy', this.removeView );
			this.listenTo( this.model, 'change:params', this.update );
			this.listenTo( this.model, 'change:parent_id', this.changeParentId );
		},
		render: function () {
			this.$el.attr( 'data-model-id', this.model.get( 'id' ) );
			var tag = this.model.get( 'shortcode' );
			this.$el.attr( 'data-tag', tag );
			this.$el.addClass( 'vc_' + tag );
			this.addControls();
			var is_container = _.isObject( vc.getMapped( tag ) ) && ((_.isBoolean( vc.getMapped( tag ).is_container ) && true === vc.getMapped(
				tag ).is_container) || !_.isEmpty( vc.getMapped( tag ).as_parent ));
			if ( is_container ) {
				this.$el.addClass( 'vc_container-block' );
			}
			this.changed();

			return this;
		},
		checkControlsPosition: function () {
			if ( !this.$controls_buttons ) {
				return;
			}
			var window_top, control_top, element_position_top, new_position,
				element_height = this.$el.height(),
				frame_height = vc.$frame.height();
			if ( element_height > frame_height ) {
				window_top = $( vc.frame_window ).scrollTop();
				control_top = this.$controls_buttons.offset().top;
				element_position_top = this.$el.offset().top;
				new_position = (window_top - element_position_top) + vc.$frame.height() / 2;
				if ( 40 < new_position && new_position < element_height ) {
					this.$controls_buttons.css( 'top', new_position );
				} else if ( new_position > element_height ) {
					this.$controls_buttons.css( 'top', element_height - 40 );

				} else {
					this.$controls_buttons.css( 'top', 40 );
				}
			}
		},
		beforeUpdate: function () {
		},
		updated: function () {
			_.each( vc.shortcodes.where( { parent_id: this.model.get( 'id' ) } ), function ( model ) {
				model.view.parent_view = this;
				model.view.parentChanged();
			}, this );
			_.defer( _.bind( function () {
				vc.events.trigger( 'shortcodeView:updated', this.model );
				vc.events.trigger( 'shortcodeView:updated:' + this.model.get( 'shortcode' ), this.model );
				vc.events.trigger( 'shortcodeView:updated:' + this.model.get( 'id' ), this.model );

			}, this ) );
		},
		parentChanged: function () {
			this.checkControlsPosition();
		},
		rendered: function () {
			const _this = this;
			_.defer( _.bind( function () {
				vc.events.trigger( 'shortcodeView:ready', this.model );
				vc.events.trigger( 'shortcodeView:ready:' + this.model.get( 'shortcode' ), this.model );
				vc.events.trigger( 'shortcodeView:ready:' + this.model.get( 'id' ), this.model );
				const iframe = document.getElementById("vc_inline-frame");
				if( Date.now() !== window.vcFramePost ) {
					iframe.contentWindow.postMessage({
						eventType: 'UTRefresh',
						data: {
							shortcode: _this.model.get( 'shortcode' ),
							id: _this.model.get( 'id' ),
							messageID: Date.now()
						}
					}, '*');
					window.vcFramePost = Date.now();
				}
			}, this ) );


			if( !$("#vc_inline-frame").contents().find('body').hasClass('ut-updated')) {
				$("#vc_inline-frame").contents().find('body').addClass('ut-updated');
			}
		},
		/**
		 * @deprecated since 4.8 should be used vc_user_access
		 * @returns {boolean}
		 */
		hasUserAccess: function () {
			return true; // vc_user_access should be used.
		},
		addControls: function () {
			var shortcodeTag, $controls_el, allAccess, editAccess, moveAccess, template, parent, data;
			shortcodeTag = this.model.get( 'shortcode' );
			$controls_el = $( '#vc_controls-template-' + shortcodeTag );

			// check user role to add controls
			allAccess = vc_user_access().shortcodeAll( shortcodeTag );
			editAccess = vc_user_access().shortcodeEdit( shortcodeTag );
			moveAccess = vc_user_access().partAccess( 'dragndrop' );

			template = $controls_el.length ? $controls_el.html() : this._getDefaultTemplate();
			parent = vc.shortcodes.get( this.model.get( 'parent_id' ) );
			data = {
				name: vc.getMapped( shortcodeTag ).name,
				tag: shortcodeTag,
				parent_name: parent ? vc.getMapped( parent.get( 'shortcode' ) ).name : '',
				parent_tag: parent ? parent.get( 'shortcode' ) : '',
				can_edit: editAccess,
				can_all: allAccess,
				moveAccess: moveAccess,
				state: vc_user_access().getState( 'shortcodes' ),
				allowAdd: null
			};
			var compiledTemplate = vc.template( _.unescape( template ), _.extend( {}, vc.templateOptions.custom, { evaluate: /\{#([\s\S]+?)#}/g } ) );
			this.$controls = $( compiledTemplate( data ).trim() ).addClass( 'vc_controls' );

			this.$controls.appendTo( this.$el );
			this.$controls_buttons = this.$controls.find( '> :first' );
		},
		content: function () {
			if ( false === this.$content ) {
				this.$content = this.$el.find( '> :first' );
			}
			return this.$content;
		},
		changeParentId: function () {
			var parent_id = this.model.get( 'parent_id' ), parent;
			vc.builder.notifyParent( this.model.get( 'parent_id' ) );
			if ( false === parent_id ) {
				this.placeElement( this.$el );
			} else {
				parent = vc.shortcodes.get( parent_id );
				if ( parent && parent.view ) {
					parent.view.placeElement( this.$el );
				}
			}
			this.parentChanged();
		},
		_getDefaultTemplate: function () {
			if ( _.isUndefined( this.default_controls_template ) || !this.default_controls_template ) {
				this.default_controls_template = $( '<div><div>' ).html( $( '#vc_controls-template-default' ).html() );
				//Filter controls due to '$control_list' data
				var controls = this.$el.data( 'shortcode-controls' );
				if ( !_.isUndefined( controls ) ) {
					$( '.vc_control-btn[data-control]', this.default_controls_template ).each( function () {
						if ( $.inArray( $( this ).data( 'control' ), controls ) == - 1 ) {
							$( this ).remove();
						}
					} );
				}
			}

			return this.default_controls_template.html();
		},
		changed: function () {
			this.$el.removeClass( 'vc_empty-shortcode-element' );
			if ( this.$el.height() < 5 ) {
				this.$el.addClass( 'vc_empty-shortcode-element' );
			}
		},
		edit: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			if ( 'edit_element' !== vc.activePanelName() || !vc.active_panel.model || vc.active_panel.model.get( 'id' ) !== this.model.get(
				'id' ) ) {
				vc.closeActivePanel();
				$('body').addClass( 'is-fullscreen' );

				setTimeout( function () {
					$("#vc_inline-frame")[0].contentWindow.dispatchEvent(new Event('resize'));
				}, 200 )
				vc.edit_element_block_view.render( this.model );
				window.vc.events.trigger( "vc:editPanelOpen", this.model );
			}
		},
		destroy: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			vc.showMessage( window.sprintf( window.i18nLocale.inline_element_deleted, this.model.setting( 'name' ) ) );
			this.model.destroy();
		},
		removeView: function ( model ) {
			this.remove();
			vc.setDataChanged();
			vc.builder.notifyParent( this.model.get( 'parent_id' ) );
			vc.closeActivePanel( model );
			vc.setFrameSize();
		},
		update: function ( model ) {
			this.beforeUpdate();
			vc.builder.update( model || this.model );
		},
		clone: function ( e ) {
			var new_model, builder = new vc.ShortcodesBuilder();
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			if ( this.builder && !this.builder.is_build_complete ) {
				return false;
			}
			this.builder = builder;
			new_model = vc.CloneModel( builder, this.model, this.model.get( 'parent_id' ) );
			builder.setResultMessage( window.sprintf( window.i18nLocale.inline_element_cloned,
				new_model.setting( 'name' ),
				new_model.get( 'id' ) ) );
			builder.render();
		},
		copy: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			if ( this.builder && !this.builder.is_build_complete ) {
				return false;
			}
			return vc.copyShortcode(this.model);
		},
		paste: function ( e ) {
			var builder = new vc.ShortcodesBuilder();
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			if ( this.builder && !this.builder.is_build_complete ) {
				return false;
			}
			this.builder = builder;
			vc.clone_index /= 10;
			vc.pasteShortcode(this.model, builder);
		},
		getParam: function ( param_name ) {
			return _.isObject( this.model.get( 'params' ) ) && !_.isUndefined( this.model.get( 'params' )[ param_name ] ) ? this.model.get(
				'params' )[ param_name ] : null;
		},
		placeElement: function ( $el, activity ) {
			var model = vc.shortcodes.get( $el.data( 'modelId' ) );
			if ( model && model.get( 'place_after_id' ) ) {
				$el.insertAfter( vc.$page.find( '[data-model-id=' + model.get( 'place_after_id' ) + ']' ) );
				model.unset( 'place_after_id' );
			} else if ( _.isString( activity ) && 'prepend' === activity ) {
				$el.prependTo( this.content() );
			} else {
				$el.appendTo( this.content() );
			}
			this.changed();
		}
	} );
	vc.FrameView = Backbone.View.extend( {
		events: {
			'click [data-vc-element="add-element-action"]': 'addElement',
			'click #vc_no-content-add-element': 'addNewElement',
			'click #vc_no-content-add-text-block': 'addTextBlock',
			'click #vc_templates-more-layouts': 'openTemplatesWindow',
			'click .vc_template[data-template_id] > .wpb_wrapper': 'loadDefaultTemplate',
			'click .vc_post-custom-layout': 'changePostCustomLayout'
		},
		iframe: $("#vc_inline-frame", parent.document ),
		add_element_modal: $('#vc_ui-panel-add-element', parent.document ),
		current_shortcode_type:   false,
		current_shortcode_event:  false,
		current_drag_drop_helper: false,
		prev_drag: false,
		preappend_append: 'append',
		prev_mouse_location: false,
		current_section: false,
		frameY: 0,
		scrolled_containers: [],
		frameX: 0,
		current_placeholder: false,
		sortable_elements:  $( '#vc_ui-panel-add-element .wpb-content-layouts > li:not([data-element="vc_section"]):not([data-element="ut_content_block"]):not([data-element="ut_content_carousel"]):not([data-element="ut_toggle_item"]):not([data-element="ut_qt"]):not([data-element="ut_client"]):not(.ut-layout-element-separator):not([data-element="ut_icon_tab"]):not([data-element="ut_accordion_item"])' ),
		sortable_rows:  $( '#vc_ui-panel-add-element .wpb-content-layouts > li[data-element="vc_section"], #vc_ui-panel-add-element .wpb-content-layouts > li[data-element="ut_content_block"]' ),

		$add_element_button : $('#ut-open-add-content-element'),
		$add_element_menu : $('#ut-add-content-element-menu'),

		openTemplatesWindow: function ( e ) {
			vc.templates_panel_view.once( 'show', function () {
				$( '[data-vc-ui-element-target="[data-tab=default_templates]"]' ).click();
			} );
			$('div[data-vc-ui-element="panel-post-settings"]').find('button[data-vc-ui-element="button-close"]').click();
			$('div[data-vc-ui-element="panel-post-seo"]').find('button[data-vc-ui-element="button-close"]').click();
			vc.app.openTemplatesWindow.call( this, e );
		},
		updateKeyPress: function ( e ) {
			if ( 13 === e.which ) {
				if ( e && e.preventDefault ) {
					e.preventDefault();
				}
				vc.$title.attr( 'contenteditable', false );
				$( '.entry-content' ).trigger( 'click' );
				return false;
			}
		},
		loadDefaultTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.templates_panel_view.loadTemplate( e );
			$( "#vc_no-content-helper" ).remove();
		},
		setTitle: function ( title ) {
			if ( vc.$title.length ) {
				vc.$title.text( title || vc.no_title_placeholder );
			}
			vc.title = title;
			vc.update_title = true;
		},
		initialize: function () {
			const that = this;
			const iframe = document.getElementById("vc_inline-frame");

			vc.events.on('app.render', function () {
				setTimeout( function () {
					if( $("#vc_inline-frame").contents().find(".vc_element-container:not(.vc_section)").length ) {
						that.show_side_elements();
					} else {
						$('li.wpb-layout-element-button[data-element="vc_section"],li.wpb-layout-element-button[data-element="ut_content_block"]').addClass('vc_visible');
					}
					$.force_appear();
				}, 400 );
				setTimeout(function () {
					that.set_droppable_columns();
				}, 400 );
				setTimeout(function () {
					that.fade_element_button();
				}, 600)
				const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
				document.addEventListener('mousemove', e => {
					that.frameX = e.clientX - 400;
					that.frameY = e.clientY;
				}, {passive: true});
				Array.prototype.forEach.call(
					document.querySelectorAll('.vc_ui-panel-content-container'),
					(el) => {
						let bar = new SimpleBar(el);
						that.scrolled_containers.push(bar);
					}
				);
				$('#close-append-mode').on('click', function (){
					that.show_side_elements();
					$('.append-mode').removeClass('is-open');
				})
			})
			that.run_draggables();
			that.init_tooltipster();
			that.init_panel_edit();
			vc.frame_window = vc.$frame.get( 0 ).contentWindow;
			iframe.onload = function (){
				$("#vc_inline-frame").contents().find('a[data-vc-element="add-element-action"]').click();
			};
			$(vc.frame_window.document.body).on('paste', this.handleEditorPaste);

		},
		fade_element_button: function () {
			$('li[data-vc-ui-element="add-element-button"]').each( function (i) {
				let that = this;
				setTimeout( function () {
					$(that).removeClass('fadeOut');
				}, i * 40 )
			} )
		},
		init_panel_edit: function () {
			const that = this;
			vc.events.on( 'vc:panel:ready', function (content) {
				let $parent = content.parents('.vc_ui-panel-window-inner');
				$('[data-vc-shortcode-param-name]').on('change', function (e) {
					$parent.find('.vc_ui-button[data-vc-ui-element="button-save"]').click();
				});
			} );
			vc.events.on( "vc:editPanelOpen", function (model) {
				$('li[data-vc-ui-element="add-element-button"]').addClass('fadeOut');
				$('body').addClass( 'is-fullscreen' );
				that.scrolled_containers.map( function (item) {
					item.getScrollElement().scrollTo(0, 0);
				} )
				setTimeout( function () {
					$("#vc_inline-frame")[0].contentWindow.dispatchEvent(new Event('resize'));
				}, 200 )
			}  );
			vc.events.on( "vc:editPanelClose", function (model) {
				that.fade_element_button();
				$('body').removeClass( 'is-fullscreen' );

				setTimeout( function () {
					$("#vc_inline-frame")[0].contentWindow.dispatchEvent(new Event('resize'));
				}, 200 )
			}  );
		},
		init_tooltipster: function () {
			$('.wpb-content-layouts').find( 'li:not([data-element="ut-category-header"])' ).each( function () {
				let _that = $(this);
				$(this).tooltipster({
					contentAsHTML: true,
					content: `<span>${_that.find('span[data-vc-shortcode-name]').html()}</span>${_that.find('span.vc_element-description').html() || ''}`,
				});
			} )
		},

		show_side_elements: function () {
			return $('li[data-vc-ui-element]:not([data-element="ut_hover_box_back"]):not([data-element="ut_hover_box_front"]):not([data-element="ut_qt_3"]):not([data-element="ut_qt_2"]):not([data-element="ut_qt"]):not([data-element="ut_client"]):not([data-element="ut_icon_tab"]):not([data-element="ut_accordion_item"])').removeClass('vc_inappropriate').addClass('vc_visible');
		},
		drag_drop_helper: function ( event ) {

			const $_helper = $('<div/>', {
				"class": "vc_element ut-vc-drag-and-drop-helper clearfix"
			});

			let css_class = $(event.target).data('classes'),
				shortcode = $(event.target).data('tag'),
				$icon = $('.vc_element-icon', event.target).clone();

			// additional attributes
			$_helper.addClass(css_class);
			$_helper.attr('data-tag', shortcode).data('tag', shortcode);

			// append elements
			$_helper.append($icon);

			return $_helper;
		},
		startDragging: function ( event ) {

			// store event
			this.current_shortcode_event = event;
			const that = this;
			// module extra class
			$(event.target).addClass('dragging');

			// activate helper on admin
			$("body", parent.document ).addClass("vc_dragging");

			// activate helper mode in iframe
			$("#vc_inline-frame").contents().find('body').addClass("vc_dragging");

		},
		stopDragging: function () {
			const that = this;
			// module extra class
			$(that.current_shortcode_event.target).removeClass('dragging');

			// deactivate helper on admin
			$("body", parent.document ).removeClass("vc_dragging vc_sorting");

			// deactivate helper mode in iframe
			$("#vc_inline-frame").contents().find('body').removeClass("vc_dragging vc_sorting");

		},
		unsetHelper: function () {

			this.current_drag_drop_helper.remove();
			this.current_drag_drop_helper = false;
		},
		clearEvents: function () {

			this.current_shortcode_event  = false;
			this.current_shortcode_type = false;
		},
		run_draggables: function () {
			const _this = this;
			this.set_draggable_elements();
			this.set_draggable_rows();
			vc.events.on('afterLoadShortcode', function (shortcode, model) {

				if( (shortcode?.length && shortcode[0].tag === 'vc_row') || (shortcode?.length && shortcode[0].tag === 'vc_column') ) {
					_this.on_add_row(shortcode);
					$('#ut_preloader').hide();
				}
				if( shortcode?.length && shortcode[0].tag === 'vc_section' ) {
					_this.on_add_section(shortcode);
				}
				if( model && model?.settings && model?.settings?.is_container ) {
				}
				$.force_appear();
				$(model.view.el).trigger('inview', [true]);
			});
		},

		on_add_row: function (shortcode) {
			const _this = this;
			setTimeout( function () {
				if( $("#vc_inline-frame").contents().find('.vc_column_container.ui-droppable').length ) {
					_this.destroy_droppable_conatiners();
				}
				_this.set_droppable_columns()
			}, 200 )
		},

		on_add_section: function (shortcode) {
			const _this = this;
			let section = $("#vc_inline-frame").contents().find(`.vc_vc_section[data-model-id=${shortcode[0]?.id}]`);
			section.find('.vc_control-btn-append').click();
			$('.append-mode').removeClass('is-open');
			setTimeout( function () {
				_this.show_side_elements();
				$('.wpb-content-layouts li[data-element=vc_row] a').click();
			}, 200 )
		},

		receive: function ( event, ui ) {

		},

		remove_draggable_elements: function() {
			if( this.sortable_elements.data('ui-draggable') ) {
				this.sortable_elements.draggable("destroy");
			}
		},
		set_droppable_columns: function () {
			const _this = this;
			$("#vc_inline-frame").contents().find(".vc_element-container:not(.vc_section)").droppable({
				drop: function(event, ui) {},
				create: function (event, ui) {
					$(this).data('drop-id', _this.generateRandomId());
					$(this).attr('data-drop-id', _this.generateRandomId());
				},
				over: function (event, ui) {
					$(this).parent().addClass("ut-droppable-active");
				},
				out: function (even, ui) {
					$(this).parent().removeClass("ut-droppable-active");
				}
			});
		},
		generateRandomId(length = 8) {
			const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcde';
			let randomId = '';
			for (let i = 0; i < length; i++) {
				randomId += characters.charAt(Math.floor(Math.random() * characters.length));
			}
			return randomId;
		},
		set_drappable_section: function () {
			const _this = this;
			$("#vc_inline-frame").contents().find("#primary .wpb-content-wrapper").droppable({
				create: function (event, ui) {
					$(this).data('drop-id', _this.generateRandomId());
				},
				drop: function(event, ui) {},
				over: function (event, ui) {}
			});
		},
		destroy_drappable_section: function () {
			$("#vc_inline-frame").contents().find("#primary .wpb-content-wrapper").droppable('destroy');
		},
		destroy_droppable_conatiners: function () {
			$("#vc_inline-frame").contents().find(".vc_element-container:not(.vc_section)").droppable('destroy');
		},
		set_draggable_elements: function() {

			let _this = this;
			/* content elements */
			this.sortable_elements.draggable({

				helper: "clone",
				cursorAt: { top: 40, left: 40 },
				distance: 10,
				iframeFix: true,
				appendTo: $('body.wp-admin', parent.document),

				start: function( event ) {
					_this.startDragging( event );
				},
				stop: function( event, ui ) {
					_this.stopDragging();

					if( _this.current_section ) {
						let parent = $(_this.current_section).parents('.vc_container-block.vc_vc_column');
						if( _this.preappend_append === 'preappend' ) {
							parent.find('.vc_control-btn-prepend').get(1).click();
						} else {
							parent.find('.vc_control-btn-append').click();
						}

						setTimeout(function () {
							$(_this.current_shortcode_event.target).find('.vc_shortcode-link').click();
							$('.append-mode').removeClass('is-open');
						}, 200);
						$('.append-mode').removeClass('is-open');
						$("#vc_inline-frame").contents().find('.drop-placeholder').remove();
						$("#vc_inline-frame").contents().find('.ut-droppable-active').removeClass('ut-droppable-active');
						_this.current_section = false;
						_this.current_placeholder = false;
						setTimeout(function () {
							//$(_this.current_shortcode_event.target).find('.vc_shortcode-link').click();
						}, 400);
					}

				},
				drag: function( event, ui ) {

					if (!ui.helper.parent().is('body')) {

						ui.helper.appendTo( $('body.wp-admin', parent.document) );

					}
					const iframe = document.getElementById("vc_inline-frame");
					const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

					const elementUnderCursor = iframeDoc.elementFromPoint(_this.frameX, _this.frameY);

					if ( ($(elementUnderCursor).hasClass("vc_element-container") && $(elementUnderCursor).hasClass("ui-droppable") && !$(elementUnderCursor).hasClass("vc_section")) || ($(elementUnderCursor).hasClass("ut-droppable-active")) ) {
						const rect = elementUnderCursor.getBoundingClientRect();
						const mouseAtTop = _this.frameY < rect.top + (rect.height / 2);

						if( $(elementUnderCursor).hasClass("ut-droppable-active") ) {
							_this.current_section = $(elementUnderCursor).find('.vc_element-container').get(0);
						} else {
							_this.current_section = elementUnderCursor;
						}

						if( _this.prev_drag !== $(_this.current_section).data('drop-id') || _this.prev_mouse_location !== mouseAtTop ) {
							$(_this.current_placeholder).find('.drop-placeholder').remove();
							_this.current_placeholder = false;
						}
						if( !_this.current_placeholder ) {
							_this.current_placeholder = _this.current_section;
							if (mouseAtTop) {
								_this.preappend_append = 'preappend';
								$(_this.current_section).prepend('<div class="drop-placeholder"></div>');
							} else {
								_this.preappend_append = 'append';
								$(_this.current_section).append('<div class="drop-placeholder"></div>');
							}
						}
						_this.prev_drag = $(_this.current_placeholder).data('drop-id');
						_this.prev_mouse_location = mouseAtTop;

					} else {
						$(_this.current_placeholder).find('.drop-placeholder').remove();
						_this.current_section = false;
						_this.current_placeholder = false;
					}

					ui.position.top = event.pageY - 40;
					ui.position.left = event.pageX - 40;

				},
			});
			document.getElementById('vc_inline-frame').onload = function () {

			}
		},
		set_draggable_rows: function() {

			let _this = this;
			this.sortable_rows.draggable({

				helper: "clone",
				cursorAt: { top: 40, left: 40 },
				distance: 10,
				iframeFix: true,
				appendTo: $('body.wp-admin', parent.document),

				start: function( event ) {
					_this.startDragging( event );

				},
				stop: function( event, ui ) {
					_this.stopDragging();

					if( _this.current_section ) {
						$("#vc_inline-frame").contents().find('#vc_not-empty-add-element').click();
						$('.append-mode').removeClass('is-open');
						setTimeout(function () {
							$(_this.current_shortcode_event.target).find('.vc_shortcode-link').click();
							$('.append-mode').removeClass('is-open');
						}, 200);
						if( $(_this.current_shortcode_event.target).data('element') === 'vc_section' ) {
							$('#ut_preloader').addClass('side').addClass('small');
							$('#ut_preloader').show();
						}
						$("#vc_inline-frame").contents().find('.drop-placeholder').remove();
						_this.current_section = false;
						_this.current_placeholder = false;
					}
				},
				drag: function( event, ui ) {

					if (!ui.helper.parent().is('body')) {

						ui.helper.appendTo( $('body.wp-admin', parent.document) );

					}
					const iframe = document.getElementById("vc_inline-frame");
					const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

					const elementUnderCursor = iframeDoc.elementFromPoint(event.pageX, event.pageY);
					if ( $(elementUnderCursor).hasClass("wpb-content-wrapper") || $(elementUnderCursor).hasClass("vc_welcome") || $(elementUnderCursor).hasClass("vc_welcome-visible-e") ) {
						_this.current_section = elementUnderCursor;
						if( !_this.current_placeholder ) {
							_this.current_placeholder = elementUnderCursor;
							$("#vc_inline-frame").contents().find(".wpb-content-wrapper").append( '<div class="drop-placeholder"></div>' );
						}
					} else {
						$("#vc_inline-frame").contents().find('.drop-placeholder').remove();
						_this.current_section = false;
						_this.current_placeholder = false;
					}

					ui.position.top = event.pageY - 40;
					ui.position.left = event.pageX - 40;

				},
			});
			$(window).on('load', function () {
				setTimeout(function () {
					_this.set_drappable_section();
				}, 400)
			})
		},
		handleEditorPaste: function (evt) {
			var content = evt.originalEvent.clipboardData.getData('text/plain') || '';
			var builder = new vc.ShortcodesBuilder();
			vc.pasteShortcode(false, builder, content);
		},
		setActiveHover: function ( e ) {
			if ( this.$hover_element ) {
				this.$hover_element.removeClass( 'vc_hover' );
			}
			this.$hover_element = $( e.currentTarget ).addClass( 'vc_hover' );
			e.stopPropagation();
		},
		unsetActiveHover: function ( e ) {
			if ( this.$hover_element ) {
				this.$hover_element.removeClass( 'vc_hover' );
			}
		},
		setSortable: function () {
			vc.frame_window.vc_iframe.setSortable( vc.app );
		},
		render: function () {
			if ( false !== vc_user_access().getState( 'post_settings' ) ) {
				vc.$title = $( vc.$frame.get( 0 ).contentWindow.document ).find( 'h1:contains("' + (vc.title || vc.no_title_placeholder).replace(
					/"/g,
					'\\"' ) + '")' );
				vc.$title.on('click', function ( e ) {
					e.preventDefault();
					vc.post_settings_view.render().show();
				} );
			}
			var content_wrapper = $( vc.$frame.get( 0 ).contentWindow.document ).find( '.wpb-content-wrapper' );
			if (!content_wrapper.length) {
				window.vc.showMessage(
					window.i18nLocale.not_editable_post || 'This post can not be edited with WPBakery since it is missing a WordPress default content area.',
					'error',
					'30000'
				);
			}

			// there because need to be initialized when content already created.
			// TODO: create callbacks render on shortcode add with checking on load if shortcode has tab_id, on  creation call sddShortcode atts.
			return this;
		},
		noContent: function ( no ) {
			vc.frame_window.vc_iframe.showNoContent( no );
		},
		addElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			$('div[data-vc-ui-element="panel-templates"]').find('button[data-vc-ui-element="button-close"]').click();
			$('div[data-vc-ui-element="panel-post-settings"]').find('button[data-vc-ui-element="button-close"]').click();
			$('div[data-vc-ui-element="panel-post-seo"]').find('button[data-vc-ui-element="button-close"]').click();
			vc.add_element_block_view.render( false );
			$('body').removeClass('is-fullscreen');
		},
		addNewElement: function ( e ) {
			var $modal = $('#vc_ui-panel-add-element');

			$modal.find('ul.vc_ui-tabs-line').children('.vc_edit-form-tab-control').not('.ut-structual, .ut-all').each(function() {

				$(this).hide();

			});

			$modal.find('.wpb-layout-element-button').each(function() {

				if( $(this).data('element') !== 'vc_section' && $(this).data('element') !== 'ut_split_section' && $(this).data('element') !== 'ut_custom_section' ) {

					$(this).addClass('vc_inappropriate');

				}

				if( !$("body").hasClass('post-type-ut-content-block') && $(this).data('element') === 'ut_content_block'  ) {

					$(this).removeClass('vc_inappropriate');

				}

			});
		},
		addTextBlock: function ( e ) {
			var builder, row_params, column_params, column_text_params;

			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			row_params = {};
			column_params = { width: '1/1' };
			column_text_params = vc.getDefaults( 'vc_column_text' );

			builder = new vc.ShortcodesBuilder();
			builder
				.create( {
					shortcode: 'vc_section',
					params: {}
				} )
				.create( {
					shortcode: 'vc_row',
					params: row_params
				} )
				.create( {
					shortcode: 'vc_column',
					parent_id: builder.lastID(),
					params: column_params
				} )
				.create( {
					shortcode: 'vc_column_text',
					parent_id: builder.lastID(),
					params: column_text_params
				} )
				.render();

			vc.edit_element_block_view.render( builder.last() );
		},
		scrollTo: function ( model ) {
			vc.frame_window.vc_iframe.scrollTo( model.get( 'id' ) );
		},
		addInlineScript: function ( script ) {
			return vc.frame_window.vc_iframe.addInlineScript( script );
		},
		addInlineScriptBody: function ( script ) {
			return vc.frame_window.vc_iframe.addInlineScriptBody( script );
		},
		changePostCustomLayout: function ( e ) {
			if ( !e || !e.preventDefault ) {
				return;
			}

			e.preventDefault();

			var selected_layout = $(e.currentTarget);
			var is_active = selected_layout.hasClass('vc-active-post-custom-layout');
			var href = selected_layout.attr('href');

			if (!is_active) {
				window.location.href = href;
			}
		}
	} );
	vc.View = Backbone.View.extend( {
		el: $( 'body' ),
		mode: 'view',
		current_size: '100%',
		events: {
			'click #vc_add-new-row': 'createRow',
			'click #vc_add-new-element': 'addElement',
			'click #vc_post-settings-button': 'editSettings',
			'click #vc_seo-button': 'openSeo',
			'click #vc_templates-editor-button': 'openTemplatesWindow',
			'click a[data-element="toggle-sidebar"]': 'fullScreenMode',
			'click a[data-element="safe-mode"]': 'safeMode',
			'click #vc_guides-toggle-button': 'toggleMode',
			'click #vc_button-cancel': 'cancel',
			'click #vc_button-edit-admin': 'cancel',
			'click #vc_button-update': 'save',
			'click #vc_button-save-draft, #vc_button-save-as-pending': 'save',
			'click .vc_screen-width': 'resizeFrame',
			'click .vc_edit-cloned': 'editCloned',
			'click [data-vc-manage-elements]': 'openPresetWindow'
		},
		initialize: function () {
			_.bindAll( this, 'saveRowOrder', 'saveElementOrder', 'saveColumnOrder', 'resizeWindow' );
			vc.shortcodes.on( 'change:params', this.changeParamsEvents, this );
			vc.events.on( 'shortcodes:add shortcodes:vc_section', vcAddShortcodeDefaultParams, this );
			vc.events.on( 'shortcodes:add', vc.atts.addShortcodeIdParam, this );
		},
		changeParamsEvents: function ( model ) {
			vc.events.triggerShortcodeEvents( 'update', model );
		},
		render: function () {
			vc.updateSettingsBadge();
			vc.$page = $( vc.$frame.get( 0 ).contentWindow.document ).find( '#vc_inline-anchor' ).parent();
			vc.$frame_body = $( vc.$frame.get( 0 ).contentWindow.document ).find( 'body' ).addClass( 'vc_editor' );
			this.setMode( 'compose' );
			this.$size_control = $( '#ut_screen-size-control' );
			$('.vc_navbar-nav').find('.screens').hover( function () {
				$('.ut-responsive-control').addClass('active');
			}, function () {
				if(  $('.ut-responsive-control:hover').length <= 0 ) {
					$('.ut-responsive-control').removeClass('active');
				}
			} )
			$('.ut-responsive-control').hover( function () {}, function () {
				$('.ut-responsive-control').removeClass('active');
			} )
			$( ".vc_element-container", vc.frame_window.document ).droppable( { accept: ".vc_element_button" } );
			$(window).on( 'resize', this.resizeWindow );

			/**
			 * @since 4.5
			 */
			_.defer( function () {
				vc.events.trigger( 'app.render' );
			} );
			return this;
		},
		cancel: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			window.location.href = $( e.currentTarget ).data( 'url' );
		},
		save: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.builder.save( $( e.currentTarget ).data( 'changeStatus' ) );
		},
		resizeFrame: function ( e ) {
			var $control = $( e.currentTarget ), current;
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( $control.hasClass( 'active' ) ) {
				return false;
			}
			this.$size_control.find( '.active' ).removeClass( 'active' );
			$( '#vc_screen-size-current' ).attr( 'class', 'vc_current-layout-icon ' + $control.attr( 'class' ) );
			this.current_size = $control.data( 'size' );
			$control.addClass( 'active' );
			vc.setFrameSize( this.current_size );
		},
		editCloned: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $control, model_id, model;

			$control = $( e.currentTarget );
			model_id = $control.data( 'modelId' );
			model = vc.shortcodes.get( model_id );
			vc.edit_element_block_view.render( model );
		},
		resizeWindow: function () {
			vc.setFrameSize( this.current_size );
		},
		switchMode: function ( e ) {
			var $control = $( e.currentTarget );
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			this.setMode( $control.data( 'mode' ) );
			$control.siblings( '.vc_active' ).removeClass( 'vc_active' );
			$control.addClass( 'vc_active' );
		},
		toggleMode: function ( e ) {
			var $control = $( e.currentTarget );
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( 'compose' === this.mode ) {
				$control.addClass( 'vc_off' ).text( window.i18nLocale.guides_off );
				this.setMode( 'view' );
			} else {
				$control.removeClass( 'vc_off' ).text( window.i18nLocale.guides_on );
				this.setMode( 'compose' );
			}
		},
		setMode: function ( mode ) {
			var $body = $( 'body' ).removeClass( this.mode + '-mode' );
			vc.$frame_body.removeClass( this.mode + '-mode' );
			this.mode = mode;
			$body.addClass( this.mode + '-mode' );
			vc.$frame_body.addClass( this.mode + '-mode' );
		},
		placeElement: function ( $view, activity ) {
			var model = vc.shortcodes.get( $view.data( 'modelId' ) );
			if ( model && model.get( 'place_after_id' ) ) {
				$view.insertAfter( vc.$page.find( '[data-model-id=' + model.get( 'place_after_id' ) + ']' ) );
				model.unset( 'place_after_id' );
			} else if ( _.isString( activity ) && 'prepend' === activity ) {
				$view.prependTo( vc.$page );
			} else {
				$view.insertBefore( vc.$page.find( '#vc_no-content-helper' ) );
			}
		},
		addShortcodes: function ( models ) {
			_.each( models, function ( model ) {
				this.addShortcode( model );
				this.addShortcodes( vc.shortcodes.where( { parent_id: model.get( 'id' ) } ) );
			}, this );
		},
		createShortcodeHtml: function ( model ) {
			var $template = $( '#vc_template-' + model.get( 'shortcode' ) ),
				template = $template.length ? $template.html() : '<div class="vc_block"></div>';
			var compiledTemplate = vc.template( template, vc.templateOptions.custom );

			return $( compiledTemplate( model.toJSON() ).trim() );
		},
		addAll: function ( models ) {
			this.addShortcodes( models.where( { parent_id: false } ) );
		},
		createRow: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			var row_params, column_params,
				builder = new vc.ShortcodesBuilder();

			row_params = {};
			column_params = { width: '1/1' };

			builder
				.create( {
					shortcode: 'vc_row',
					params: row_params
				} )
				.create( {
					shortcode: 'vc_column',
					parent_id: builder.lastID(),
					params: column_params
				} )
				.render();
		},
		addElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			$('div[data-vc-ui-element="panel-templates"]').find('button[data-vc-ui-element="button-close"]').click();
			$('div[data-vc-ui-element="panel-post-settings"]').find('button[data-vc-ui-element="button-close"]').click();
			$('div[data-vc-ui-element="panel-post-seo"]').find('button[data-vc-ui-element="button-close"]').click();
			vc.add_element_block_view.render( false );
			$('body').removeClass('is-fullscreen');
		},
		editSettings: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.post_settings_view.render().show();
		},
		/**
		 * @deprecated 4.4 use openTemplatesWindow
		 * @param e
		 */
		openTemplatesEditor: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.templates_editor_view.render().show();
		},
		openTemplatesWindow: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			$('div[data-vc-ui-element="panel-post-settings"]').find('button[data-vc-ui-element="button-close"]').click();
			$('div[data-vc-ui-element="panel-post-seo"]').find('button[data-vc-ui-element="button-close"]').click();
			vc.templates_panel_view.render().show();
		},
		fullScreenMode: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			$('body').toggleClass( 'is-fullscreen' );

			setTimeout( function () {
				$("#vc_inline-frame")[0].contentWindow.dispatchEvent(new Event('resize'));
			}, 200 )
			if( $('#vc_ui-panel-templates').hasClass('vc_active') ) {
				vc.templates_panel_view.render().show();
			}
		},

		safeMode: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			$("#vc_inline-frame").contents().find('body').toggleClass( 'ut-safemode' );
			setTimeout( function () {
				$("#vc_inline-frame")[0].contentWindow.dispatchEvent(new Event('resize'));
			}, 500 )
		},
		setFrameSize: function () {
			vc.setFrameSize();
		},
		dropButton: function () {
			if ( ui.draggable.is( '#wpb-add-new-element' ) ) {
				this.addElement();
			} else if ( ui.draggable.is( '#wpb-add-new-row' ) ) {
				this.createRow();
			}
		},
		saveRowOrder: function ( event, ui ) {
			_.defer( function ( app ) {
				var $current_parent, row_params, column_params, $rows, builder;
				$current_parent = $( ui.item.parent() );
				$rows = $current_parent.find( '> [data-tag=vc_row],> [data-tag=vc_section]' );
				builder = new vc.ShortcodesBuilder();
				$rows.each( function ( key, value ) {
					var $el;
					$el = $( this );
					if ( $el.is( '.droppable' ) ) {

						row_params = {};

						column_params = { width: '1/1' };

						$el.remove();
						var row_data = {
							shortcode: 'vc_row',
							params: row_params,
							order: key
						};
						if ( 0 === key ) {
							vc.activity = 'prepend';
						} else if ( key + 1 !== $rows.length ) {
							row_data.place_after_id = vc.$page.find( '> [data-tag=vc_row]:eq(' + (key - 1) + ')' ).data(
								'modelId' );
						}
						builder
							.create( row_data )
							.create( {
								shortcode: 'vc_column',
								parent_id: builder.lastID(),
								params: column_params
							} )
							.render();
					} else {
						var model = vc.shortcodes.get( $el.data( 'modelId' ) );
						var prev_parent = model.get( 'parent_id' );
						var current_parent = $current_parent.closest( '.vc_element' ).data( 'modelId' ) || false;
						model.save( { order: key, parent_id: current_parent }, { silent: true } );

						if ( prev_parent !== current_parent ) {
							vc.builder.notifyParent( current_parent );
							vc.builder.notifyParent( prev_parent );
						}
					}
				} );
				vc.setDataChanged();
			}, this );
		},
		saveElementOrder: function ( event, ui ) {
			_.defer( function ( app, e, ui ) {
				var $column, $elements;
				if ( _.isNull( ui.sender ) ) {
					$column = ui.item.parent();
					$elements = $column.find( '> [data-model-id]' );
					$column.find( '> [data-model-id]' ).each( function ( key, value ) {
						var $element, model, prev_parent, current_parent, prepend;
						$element = $( this );
						prepend = false;
						if ( $element.is( '.droppable' ) ) {
							current_parent = vc.shortcodes.get( $column.parents( '.vc_element[data-tag]:first' ).data(
								'modelId' ) );
							$element.remove();
							if ( 0 === key ) {
								prepend = true;
							} else if ( key + 1 !== $elements.length ) {
								prepend = $column.find( '> [data-tag]:eq(' + (key - 1) + ')' ).data( 'modelId' );
							}
							if ( current_parent ) {
								vc.add_element_block_view.render( current_parent, prepend );
							}
						} else {
							model = vc.shortcodes.get( $element.data( 'modelId' ) );
							prev_parent = model.get( 'parent_id' );
							current_parent = $column.parents( '.vc_element[data-tag]:first' ).data( 'modelId' );
							model.save( { order: key, parent_id: current_parent }, { silent: true } );

							if ( prev_parent !== current_parent ) {
								vc.builder.notifyParent( current_parent );
								vc.builder.notifyParent( prev_parent );
							}
						}

					} );
				}
				vc.setDataChanged();
			}, this, event, ui );
		},
		saveColumnOrder: function ( event, ui ) {
			_.defer( function ( app, e, ui ) {
				var row;
				row = ui.item.parent();
				row.find( '> [data-model-id]' ).each( function () {
					var $element, index;
					$element = $( this );
					index = $element.index();
					vc.shortcodes.get( $element.data( 'modelId' ) ).save( { order: index } );
				} );
			}, this, event, ui );
			vc.setDataChanged();
		},
		openPresetWindow: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.preset_panel_view.render().show();
		},
		openSeo: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.post_seo_view.render();
		}
	} );
})( window.jQuery );

/* =========================================================
 * lib/panels.js v0.5.0
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * WPBakery Page Builder panels & modals for frontend editor
 *
 * ========================================================= */
/* global Backbone, vc */
(function ( $ ) {
	'use strict';
	if ( _.isUndefined( window.vc ) ) {
		window.vc = {};
	}
	$.ajaxSetup( {
		beforeSend: function ( xhr, settings ) {
			if ( 'script' === settings.dataType && true === settings.cache ) {
				settings.cache = false;
			}
			if ( 'script' === settings.dataType && false === settings.async ) {
				settings.async = true;
			}
		}
	} );
	vc.showSpinner = function () {
		$( '#vc_logo' ).addClass( 'vc_ui-wp-spinner' );
	};
	vc.hideSpinner = function () {
		$( '#vc_logo' ).removeClass( 'vc_ui-wp-spinner' );
	};
	$( document ).ajaxSend( function ( e, xhr, req ) {
		if ( req && req.data && 'string' === typeof (req.data) && req.data.match( /vc_inline=true/ ) ) {
			vc.showSpinner();
		}
	} ).ajaxStop( function () {
		vc.hideSpinner();
	} );
	vc.active_panel = false;
	vc.closeActivePanel = function ( model ) {
		if ( !this.active_panel ) {
			return false;
		}
		if ( model && vc.active_panel.model && vc.active_panel.model.get( 'id' ) === model.get( 'id' ) ) {
			vc.active_panel.model = null;
			this.active_panel.hide();
		} else if ( !model ) {
			vc.active_panel.model = null;
			this.active_panel.hide();
		}
	};
	vc.activePanelName = function () {
		return this.active_panel && this.active_panel.panelName ? this.active_panel.panelName : null;
	};
	vc.updateSettingsBadge = function () {
		var badge = $( '#vc_post-settings-badge' );
		if (vc.isShowBadge()) {
			badge.show();
		} else {
			badge.hide();
		}
	};
	vc.isShowBadge = function () {
		var settings_list = ['css', 'js_header', 'js_footer'];

		var isShowBadge = false;
		settings_list.forEach( function ( setting_name ) {
			var setting_selector = '$custom_' + setting_name;
			var value = vc[setting_selector].val();

			if (value && '' !== value.trim()) {
				isShowBadge = true;
			}
		});

		return isShowBadge;
	};
	/**
	 * Modal prototype
	 *
	 * @type {*}
	 */
	vc.ModalView = Backbone.View.extend( {
		message_box_timeout: false,
		events: {
			'hidden.bs.modal': 'hide',
			'shown.bs.modal': 'shown'
		},
		initialize: function () {
			_.bindAll( this, 'setSize', 'hide' );
		},
		setSize: function () {
			var height = $( window ).height() - 150;
			this.$content.css( 'maxHeight', height );
			this.trigger( 'setSize' );
		},
		render: function () {
			$( window ).on( 'resize.ModalView', this.setSize );
			this.setSize();
			vc.closeActivePanel();
			this.$el.modal( 'show' );
			return this;
		},
		showMessage: function ( text, type ) {
			if ( this.message_box_timeout && this.$el.find( '.vc_message' ).remove() ) {
				window.clearTimeout( this.message_box_timeout );
			}
			this.message_box_timeout = false;
			var $message_box = $( '<div class="vc_message type-' + type + '"></div>' );
			this.$el.find( '.vc_modal-body' ).prepend( $message_box );
			$message_box.text( text ).fadeIn();
			this.message_box_timeout = window.setTimeout( function () {
				$message_box.remove();
			}, 6000 );
		},
		hide: function () {
			$( window ).off( 'resize.ModalView' );
		},
		shown: function () {
		}
	} );
	vc.element_start_index = 0;
	/**
	 * Add element block to page or shortcodes container.
	 *
	 * @deprecated 4.7
	 *
	 * @type {*}
	 */
	vc.AddElementBlockView = vc.ModalView.extend( {
		el: $( '#vc_add-element-dialog' ),
		prepend: false,
		builder: '',
		events: {
			'click .vc_shortcode-link': 'createElement',
			'keyup #vc_elements_name_filter': 'filterElements',
			'hidden.bs.modal': 'hide',
			'show.bs.modal': 'buildFiltering',
			'click .wpb-content-layouts-container [data-filter]': 'filterElements',
			'shown.bs.modal': 'shown'
		},
		buildFiltering: function () {
			this.do_render = false;
			var item_selector, tag, not_in;

			item_selector = '[data-vc-ui-element="add-element-button"]';
			tag = this.model ? this.model.get( 'shortcode' ) : 'vc_column';
			not_in = this._getNotIn( tag );
			$( '#vc_elements_name_filter' ).val( '' );
			this.$content.addClass( 'vc_filter-all' );
			this.$content.attr( 'data-vc-ui-filter', '*' );
			// New vision
			var mapped = vc.getMapped( tag );
			var as_parent = tag && !_.isUndefined( mapped.as_parent ) ? mapped.as_parent : false;
			if ( _.isObject( as_parent ) ) {
				var parent_selector = [];
				if ( _.isString( as_parent.only ) ) {
					parent_selector.push( _.reduce( as_parent.only.replace( /\s/, '' ).split( ',' ),
						function ( memo, val ) {
							return memo + (_.isEmpty( memo ) ? '' : ',') + '[data-element="' + val.trim() + '"]';
						},
						'' ) );
				}
				if ( _.isString( as_parent.except ) ) {
					parent_selector.push( _.reduce( as_parent.except.replace( /\s/, '' ).split( ',' ),
						function ( memo, val ) {
							return memo + ':not([data-element="' + val.trim() + '"])';
						},
						'' ) );
				}
				item_selector += parent_selector.join( ',' );
			} else {
				if ( not_in ) {
					item_selector = not_in;
				}
			}
			// OLD fashion
			if ( tag && !_.isUndefined( mapped.allowed_container_element ) ) {
				if ( !mapped.allowed_container_element ) {
					item_selector += ':not([data-is-container=true])';
				} else if ( _.isString( mapped.allowed_container_element ) ) {
					item_selector += ':not([data-is-container=true]), [data-element=' + mapped.allowed_container_element + ']';
				}
			}
			this.$buttons.removeClass( 'vc_visible' ).addClass( 'vc_inappropriate' );
			$( item_selector, this.$content ).removeClass( 'vc_inappropriate' ).addClass( 'vc_visible' );
			this.hideEmptyFilters();
		},
		hideEmptyFilters: function () {
			this.$el.find( '.vc_filter-content-elements .active' ).removeClass( 'active' );
			this.$el.find( '.vc_filter-content-elements > :first' ).addClass( 'active' );
			var self = this;
			this.$el.find( '[data-filter]' ).each( function () {
				if ( $( $( this ).data( 'filter' ) + '.vc_visible:not(.vc_inappropriate)', self.$content ).length ) {
					$( this ).parent().show();
				} else {
					$( this ).parent().hide();
				}
			} );
		},
		render: function ( model, prepend ) {
			this.builder = new vc.ShortcodesBuilder();
			this.prepend = _.isBoolean( prepend ) ? prepend : false;
			this.place_after_id = _.isString( prepend ) ? prepend : false;
			this.model = _.isObject( model ) ? model : false;
			this.$content = this.$el.find( '[data-vc-ui-element="panel-add-element-list"]' );
			this.$buttons = $( '[data-vc-ui-element="add-element-button"]', this.$content );
			this.preventDoubleExecution = false;
			return vc.AddElementBlockView.__super__.render.call( this );
		},
		hide: function () {
			if ( this.do_render ) {
				if ( this.show_settings ) {
					this.showEditForm();
				}
				this.exit();
			}
		},
		showEditForm: function () {
			vc.edit_element_block_view.render( this.builder.last() );
			window.vc.events.trigger( "vc:editPanelOpen", this.model );
		},
		exit: function () {
			this.builder.render();
		},
		createElement: function ( e ) {
			var $control, tag, row_params, column_params, row_inner_params;
			var _this, shortcode, i;
			if ( this.preventDoubleExecution ) {
				return;
			}
			this.preventDoubleExecution = true;
			this.do_render = true;
			e.preventDefault();
			$control = $( e.currentTarget );
			tag = $control.data( 'tag' );

			row_params = {};

			row_inner_params = {};

			column_params = { width: '1/1' };

			if ( false === this.model && 'vc_row' !== tag ) {
				this.builder
					.create( {
						shortcode: 'vc_row',
						params: row_params
					} )
					.create( {
						shortcode: 'vc_column',
						parent_id: this.builder.lastID(),
						params: column_params
					} );
				this.model = this.builder.last();
			} else if ( false !== this.model && 'vc_row' === tag ) {
				tag += '_inner';
			}
			var params = {
				shortcode: tag,
				parent_id: (this.model ? this.model.get( 'id' ) : false),
				params: 'vc_row_inner' === tag ? row_inner_params : {}
			};
			if ( this.prepend ) {
				params.order = 0;
				var shortcodeFirst = vc.shortcodes.findWhere( { parent_id: this.model.get( 'id' ) } );
				if ( shortcodeFirst ) {
					params.order = shortcodeFirst.get( 'order' ) - 1;
				}
				vc.activity = 'prepend';
			} else if ( this.place_after_id ) {
				params.place_after_id = this.place_after_id;
			}

			this.builder.create( params );

			// extend default params with settings presets if there are any
			for ( i = this.builder.models.length - 1;
				i >= 0;
				i -- ) {
				shortcode = this.builder.models[ i ].get( 'shortcode' );
			}

			if ( 'vc_row' === tag ) {
				this.builder.create( {
					shortcode: 'vc_column',
					parent_id: this.builder.lastID(),
					params: column_params
				} );
			} else if ( 'vc_row_inner' === tag ) {
				column_params = { width: '1/1' };

				this.builder.create( {
					shortcode: 'vc_column_inner',
					parent_id: this.builder.lastID(),
					params: column_params
				} );
			}
			var mapped = vc.getMapped( tag );
			if ( _.isString( mapped.default_content ) && mapped.default_content.length ) {
				var newData = this.builder.parse( {},
					mapped.default_content,
					this.builder.last().toJSON() );
				_.each( newData, function ( object ) {
					object.default_content = true;
					this.builder.create( object );
				}, this );
			}
			this.show_settings = !(_.isBoolean( mapped.show_settings_on_create ) && false === mapped.show_settings_on_create);
			_this = this;
			this.$el.one( 'hidden.bs.modal', function () {
				_this.preventDoubleExecution = false;
			} ).modal( 'hide' );
		},
		_getNotIn: _.memoize( function ( tag ) {
			var selector = _.reduce( vc.map, function ( memo, shortcode ) {
				var separator = _.isEmpty( memo ) ? '' : ',';
				if ( _.isObject( shortcode.as_child ) ) {
					if ( _.isString( shortcode.as_child.only ) ) {
						if ( !_.contains( shortcode.as_child.only.replace( /\s/, '' ).split( ',' ), tag ) ) {
							memo += separator + '[data-element=' + shortcode.base + ']';
						}
					}
					if ( _.isString( shortcode.as_child.except ) ) {
						if ( _.contains( shortcode.as_child.except.replace( /\s/, '' ).split( ',' ), tag ) ) {
							memo += separator + '[data-element=' + shortcode.base + ']';
						}
					}
				} else if ( false === shortcode.as_child ) {
					memo += separator + '[data-element=' + shortcode.base + ']';
				}
				return memo;
			}, '' );
			return '[data-vc-ui-element="add-element-button"]:not(' + selector + ')';
		} ),
		filterElements: function ( e ) {
			e.stopPropagation();
			e.preventDefault();
			var $control = $( e.currentTarget ),
				filter = '[data-vc-ui-element="add-element-button"]',
				name_filter = $( '#vc_elements_name_filter' ).val();
			this.$content.removeClass( 'vc_filter-all' );
			if ( $control.is( '[data-filter]' ) ) {
				$( '.wpb-content-layouts-container .isotope-filter .active', this.$content ).removeClass( 'active' );
				$control.parent().addClass( 'active' );
				var filter_value = $control.data( 'filter' );
				filter += filter_value;
				if ( '*' === filter_value ) {
					this.$content.addClass( 'vc_filter-all' );
				} else {
					this.$content.removeClass( 'vc_filter-all' );
				}
				this.$content.attr( 'data-vc-ui-filter', filter_value.replace( '.js-category-', '' ) );
				$( '#vc_elements_name_filter' ).val( '' );
			} else if ( 0 < name_filter.length ) {
				filter += ":containsi('" + name_filter + "'):not('.vc_element-deprecated')";
				$( '.wpb-content-layouts-container .isotope-filter .active', this.$content ).removeClass( 'active' );
				this.$content.attr( 'data-vc-ui-filter', 'name:' + name_filter );
			} else if ( !name_filter.length ) {
				$( '.wpb-content-layouts-container .isotope-filter [data-filter="*"]' ).parent().addClass( 'active' );
				this.$content.attr( 'data-vc-ui-filter', '*' );
				this.$content.addClass( 'vc_filter-all' );
			}
			$( '.vc_visible', this.$content ).removeClass( 'vc_visible' );
			$( filter, this.$content ).addClass( 'vc_visible' );
		},
		shown: function () {
			if ( !vc.is_mobile ) {
				$( '#vc_elements_name_filter' ).trigger('focus');
			}
		}
	} );
	/**
	 * Add element to admin
	 *
	 * @deprecated 4.7
	 *
	 * @type {*}
	 */
	vc.AddElementBlockViewBackendEditor = vc.AddElementBlockView.extend( {
		render: function ( model, prepend ) {
			this.prepend = _.isBoolean( prepend ) ? prepend : false;
			this.place_after_id = _.isString( prepend ) ? prepend : false;
			this.model = _.isObject( model ) ? model : false;
			this.$content = this.$el.find( '[data-vc-ui-element="panel-add-element-list"]' );
			this.$buttons = $( '[data-vc-ui-element="add-element-button"]', this.$content );
			return vc.AddElementBlockView.__super__.render.call( this );
		},
		createElement: function ( e ) {
			var that, shortcode, row_params, column_params, row_inner_params, column_inner_params;
			if ( this.preventDoubleExecution ) {
				return;
			}
			this.preventDoubleExecution = true;
			var model, column, row;
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			this.do_render = true;
			var tag = $( e.currentTarget ).data( 'tag' );

			row_params = {};

			column_params = { width: '1/1' };

			if ( false === this.model ) {
				row = vc.shortcodes.create( {
					shortcode: 'vc_row',
					params: row_params
				} );

				column = vc.shortcodes.create( {
					shortcode: 'vc_column',
					params: column_params,
					parent_id: row.id,
					root_id: row.id
				} );
				if ( 'vc_row' !== tag ) {
					model = vc.shortcodes.create( {
						shortcode: tag,
						parent_id: column.id,
						root_id: row.id
					} );
				} else {
					model = row;
				}
			} else {
				if ( 'vc_row' === tag ) {
					row_inner_params = {};

					column_inner_params = { width: '1/1' };

					row = vc.shortcodes.create( {
						shortcode: 'vc_row_inner',
						params: row_inner_params,
						parent_id: this.model.id,
						order: (this.prepend ? this.getFirstPositionIndex() : vc.shortcodes.getNextOrder())
					} );
					model = vc.shortcodes.create( {
						shortcode: 'vc_column_inner',
						params: column_inner_params,
						parent_id: row.id,
						root_id: row.id
					} );
				} else {
					model = vc.shortcodes.create( {
						shortcode: tag,
						parent_id: this.model.id,
						order: (this.prepend ? this.getFirstPositionIndex() : vc.shortcodes.getNextOrder()),
						root_id: this.model.get( 'root_id' )
					} );
				}
			}
			this.show_settings = !(_.isBoolean( vc.getMapped( tag ).show_settings_on_create ) && false === vc.getMapped(
				tag ).show_settings_on_create);
			this.model = model;

			// extend default params with settings presets if there are any
			shortcode = this.model.get( 'shortcode' );

			that = this;
			this.$el.one( 'hidden.bs.modal', function () {
				that.preventDoubleExecution = false;
			} ).modal( 'hide' );
		},
		showEditForm: function () {
			vc.edit_element_block_view.render( this.model );
			window.vc.events.trigger( "vc:editPanelOpen", this.model );
		},
		exit: function () {
		},
		getFirstPositionIndex: function () {
			vc.element_start_index -= 1;
			return vc.element_start_index;
		}
	} );
	/**
	 * Panel prototype
	 */
	vc.PanelView = vc.View.extend( {
		mediaSizeClassPrefix: 'vc_media-',
		customMediaQuery: true,
		panelName: 'panel',
		draggable: false,
		$body: false,
		$tabs: false,
		$content: false,
		events: {
			'click [data-dismiss=panel]': 'hide',
			'mouseover [data-transparent=panel]': 'addOpacity',
			'click [data-transparent=panel]': 'toggleOpacity',
			'mouseout [data-transparent=panel]': 'removeOpacity',
			'click .vc_panel-tabs-link': 'changeTab'
		},
		_vcUIEventsHooks: [
			{ 'resize': 'setResize' }
		],
		options: {
			startTab: 0
		},
		clicked: false,
		showMessageDisabled: true, // disabled in 4.7 due to button and new ui.
		initialize: function () {
			this.clicked = false;
			this.$el.removeClass( 'vc_panel-opacity' );
			this.$body = $( 'body' );
			this.$content = this.$el.find( '.vc_panel-body' );
			_.bindAll( this, 'setSize', 'fixElContainment', 'changeTab', 'setTabsSize' );
			this.on( 'show', this.setSize, this );
			this.on( 'setSize', this.setResize, this );
			this.on( 'render', this.resetMinimize, this );
		},
		toggleOpacity: function () {
			this.clicked = !this.clicked;
		},
		addOpacity: function () {
			if ( !this.clicked ) {
				this.$el.addClass( 'vc_panel-opacity' );
			}
		},
		removeOpacity: function () {
			if ( !this.clicked ) {
				this.$el.removeClass( 'vc_panel-opacity' );
			}
		},
		message_box_timeout: false,
		init: function () {
		},
		render: function () {
			this.trigger( 'render' );
			this.trigger( 'afterRender' );
			return this;
		},
		show: function () {
			if ( this.$el.hasClass( 'vc_active' ) ) {
				return;
			}

			vc.closeActivePanel();
			this.init();
			vc.active_panel = this;
			this.clicked = false;
			this.$el.removeClass( 'vc_panel-opacity' );
			var $tabs = this.$el.find( '.vc_panel-tabs' );
			if ( $tabs.length ) {
				this.$tabs = $tabs;
				this.setTabs();
			}
			this.$el.addClass( 'vc_active' );
			if ( !this.draggable ) {
				$( window ).trigger( 'resize' );
			} else {
				this.initDraggable();
			}
			this.fixElContainment();
			this.trigger( 'show' );
		},
		hide: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( this.model ) {
				this.model = null;
			}
			vc.active_panel = false;
			this.$el.removeClass( 'vc_active' );
			vc.events.trigger( "vc:editPanelClose" );
		},
		content: function () {
			return this.$el.find( '.panel-body' );
		},
		setResize: function () {
			if ( this.customMediaQuery ) {
				this.setMediaSizeClass();
			}
		},
		setMediaSizeClass: function () {
			var modalWidth, classes;
			modalWidth = this.$el.width();
			classes = {
				xs: true,
				sm: false,
				md: false,
				lg: false
			};
			if ( 525 <= modalWidth ) {
				classes.sm = true;
			}
			if ( 745 <= modalWidth ) {
				classes.md = true;
			}
			if ( 945 <= modalWidth ) {
				classes.lg = true;
			}
			_.each( classes, function ( value, key ) {
				if ( value ) {
					this.$el.addClass( this.mediaSizeClassPrefix + key );
				} else {
					this.$el.removeClass( this.mediaSizeClassPrefix + key );
				}
			}, this );
		},
		fixElContainment: function () {
			if ( !this.$body ) {
				this.$body = $( 'body' );
			}
			var el_w = this.$el.width(),
				container_w = this.$body.width(),
				container_h = this.$body.height();

			// To be sure that containment always correct, even after resize
			var containment = [
				- el_w + 20,
				0,
				container_w - 20,
				container_h - 30
			];
			var positions = this.$el.position();
			var new_positions = {};
			if ( positions.left < containment[ 0 ] ) {
				new_positions.left = containment[ 0 ];
			}
			if ( 0 > positions.top ) {
				new_positions.top = 0;
			}
			if ( positions.left > containment[ 2 ] ) {
				new_positions.left = containment[ 2 ];
			}
			if ( positions.top > containment[ 3 ] ) {
				new_positions.top = containment[ 3 ];
			}
			this.$el.css( new_positions );
			this.trigger( 'fixElContainment' );
			this.setSize();
		},
		/**
		 * Init draggable feature for panels to allow it Moving, also allow moving only in proper containment
		 */
		initDraggable: function () {
			this.$el.draggable( {
				iframeFix: true,
				handle: '.vc_panel-heading',
				start: this.fixElContainment,
				stop: this.fixElContainment
			} );
			this.draggable = true;
		},
		setSize: function () {
			this.trigger( 'setSize' );
		},
		setTabs: function () {
			if ( this.$tabs.length ) {
				this.$tabs.find( '.vc_panel-tabs-control' ).removeClass( 'vc_active' ).eq( this.options.startTab ).addClass(
					'vc_active' );
				this.$tabs.find( '.vc_panel-tab' ).removeClass( 'vc_active' ).eq( this.options.startTab ).addClass(
					'vc_active' );
				window.setTimeout( this.setTabsSize, 100 );
			}
		},
		setTabsSize: function () {
			if ( this.$tabs ) {
				this.$tabs.parents( '.vc_with-tabs.vc_panel-body' ).css( 'margin-top', this.$tabs.find( '.vc_panel-tabs-menu' ).outerHeight() );
			}
		},
		changeTab: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e.target && this.$tabs ) {
				var $tab = $( e.target );
				this.$tabs.find( '.vc_active' ).removeClass( 'vc_active' );
				$tab.parent().addClass( 'vc_active' );
				this.$el.find( $tab.data( 'target' ) ).addClass( 'vc_active' );
				window.setTimeout( this.setTabsSize, 100 );
			}
		},
		showMessage: function ( text, type ) {
			if ( this.showMessageDisabled ) {
				return false;
			}
			if ( this.message_box_timeout ) {
				this.$el.find( '.vc_panel-message' ).remove();
				window.clearTimeout( this.message_box_timeout );
			}

			this.message_box_timeout = false;
			var $message_box = $( '<div class="vc_panel-message type-' + type + '"></div>' ).appendTo( this.$el.find( '.vc_ui-panel-content-container' ) );
			$message_box.text( text ).fadeIn();
			this.message_box_timeout = window.setTimeout( function () {
				$message_box.remove();
			}, 6000 );
		},
		isVisible: function () {
			return this.$el.is( ':visible' );
		},
		resetMinimize: function () {
			this.$el.removeClass( 'vc_panel-opacity' );
		}
	} );
	/**
	 * Post settings panel
	 *
	 * @type {Number}
	 */
	vc.PostSettingsPanelView = vc.PanelView.extend( {
		events: {
			'click [data-save=true]': 'save',
			'click [data-dismiss=panel]': 'hide',
			'click [data-transparent=panel]': 'toggleOpacity',
			'mouseover [data-transparent=panel]': 'addOpacity',
			'mouseout [data-transparent=panel]': 'removeOpacity'
		},
		saved_css_data: '',
		saved_js_header_data: '',
		saved_js_footer_data: '',
		saved_title: '',
		$title: false,
		editor_css: false,
		editor_js_header: false,
		editor_js_footer: false,
		post_settings_editor: false,
		initialize: function () {
			vc.$custom_css = $( '#vc_post-custom-css' );
			vc.$custom_js_header = $( '#vc_post-custom-js-header' );
			vc.$custom_js_footer = $( '#vc_post-custom-js-footer' );
			this.saved_css_data = vc.$custom_css.val();
			this.saved_js_header_data = vc.$custom_js_header.val();
			this.saved_js_footer_data = vc.$custom_js_footer.val();
			this.saved_title = vc.title;
			this.initEditor();
			this.$body = $( 'body' );
			_.bindAll( this, 'setSize', 'fixElContainment' );
			this.on( 'show', this.setSize, this );
			this.on( 'setSize', this.setResize, this );
			this.on( 'render', this.resetMinimize, this );
		},
		initEditor: function () {
			this.editor_css = new Vc_postSettingsEditor();
			this.editor_css.sel = 'wpb_css_editor';
			this.editor_css.mode = 'css';
			this.editor_css.is_focused = true;
			this.editor_js_header = new Vc_postSettingsEditor();
			this.editor_js_header.sel = 'wpb_js_header_editor';
			this.editor_js_header.mode = 'javascript';
			this.editor_js_footer = new Vc_postSettingsEditor();
			this.editor_js_footer.sel = 'wpb_js_footer_editor';
			this.editor_js_footer.mode = 'javascript';
		},
		render: function () {
			this.trigger( 'render' );
			this.$title = this.$el.find( '#vc_page-title-field' );
			this.$title.val( vc.title );
			this.setEditor();
			this.trigger( 'afterRender' );
			return this;
		},
		setEditor: function () {
			this.editor_css.setEditor( vc.$custom_css.val() );
			this.editor_js_header.setEditor( vc.$custom_js_header.val() );
			this.editor_js_footer.setEditor( vc.$custom_js_footer.val() );
		},
		setSize: function () {
			this.editor_css.setSize();
			this.editor_js_header.setSize();
			this.editor_js_footer.setSize();
			this.trigger( 'setSize' );
		},
		save: function () {
			if ( this.$title ) {
				var title = this.$title.val();
				if ( title !== vc.title ) {
					vc.frame.setTitle( title );
				}
			}
			this.setAlertOnDataChange();
			vc.$custom_css.val( this.editor_css.getValue() );
			vc.$custom_js_header.val( this.editor_js_header.getValue() );
			vc.$custom_js_footer.val( this.editor_js_footer.getValue() );
			if ( vc.frame_window ) {
				vc.frame_window.vc_iframe.loadCustomCss( vc.$custom_css.val() );
				vc.frame_window.vc_iframe.loadCustomJsHeader( vc.$custom_js_header.val() );
				vc.frame_window.vc_iframe.loadCustomJsFooter( vc.$custom_js_footer.val() );
			}
			vc.updateSettingsBadge();
			this.showMessage( window.i18nLocale.page_settings_updated, 'success' );
			this.trigger( 'save' );
		},
		/**
		 * Set alert if custom data differs from saved data.
		 */
		setAlertOnDataChange: function () {
			var dataList = [
				this.saved_css_data !== this.editor_css.getValue(),
				this.saved_js_header_data !== this.editor_js_header.getValue(),
				this.saved_js_footer_data !== this.editor_js_footer.getValue(),
				this.$title && this.saved_title !== this.$title.val()
			];

			if (dataList.indexOf(true) >= 0) {
				vc.setDataChanged();
			}
		},
	} );
	/**
	 * Post settings seo panel
	 */
	vc.PostSettingsSeoUIPanelView = vc.PanelView.extend( {
		save: function () {
			var form = $('#vc_setting-seo-form');

			var seo_data = form.serializeArray();
			var customFormat = {};
			for (var i = 0; i < seo_data.length; i++) {
				customFormat[seo_data[i].name] = seo_data[i].value;
			}

			var seo_settings_hidden_input = $( '#vc_post-custom-seo-settings' );

			seo_settings_hidden_input.val( JSON.stringify( customFormat ) );

			this.trigger( 'save' );
			this.hide();
		},
	} );
	vc.PostSettingsPanelViewBackendEditor = vc.PostSettingsPanelView.extend( {
		render: function () {
			this.trigger( 'render' );
			this.setEditor();
			this.trigger( 'afterRender' );
			return this;
		},
		/**
		 * Set alert if custom css data differs from saved data.
		 *
		 * @deprecated
		 */
		setAlertOnDataChange: function () {
			if ( vc.saved_custom_css !== this.editor_css.getValue() && window.tinymce ) {
				window.switchEditors.go( 'content', 'tmce' );
				window.setTimeout( function () {
					window.tinymce.get( 'content' ).isNotDirty = false;
				}, 1000 );
			}
		},
		save: function () {
			vc.PostSettingsPanelViewBackendEditor.__super__.save.call( this );
			vc.storage.isChanged = true;
			this.hide();
		}
	} );

	/**
	 * Templates editor
	 *
	 * @deprecated 4.4 use vc.TemplatesModalViewBackend/Frontend
	 * @type {*}
	 */
	vc.TemplatesEditorPanelView = vc.PanelView.extend( {
		events: {
			'click [data-dismiss=panel]': 'hide',
			'click [data-transparent=panel]': 'toggleOpacity',
			'mouseover [data-transparent=panel]': 'addOpacity',
			'mouseout [data-transparent=panel]': 'removeOpacity',
			'click .wpb_remove_template': 'removeTemplate',
			'click [data-template_id]': 'loadTemplate',
			'click [data-template_name]': 'loadDefaultTemplate',
			'click #vc_template-save': 'saveTemplate'
		},
		render: function () {
			this.trigger( 'render' );
			this.$name = $( '#vc_template-name' );
			this.$list = $( '#vc_template-list' );
			var $tabs = $( '#vc_tabs-templates' );
			$tabs.find( '.vc_edit-form-tab-control' ).removeClass( 'vc_active' ).eq( 0 ).addClass( 'vc_active' );
			$tabs.find( '[data-vc-ui-element="panel-edit-element-tab"]' ).removeClass( 'vc_active' ).eq( 0 ).addClass(
				'vc_active' );
			$tabs.find( '.vc_edit-form-link' ).on('click', function ( e ) {
				e.preventDefault();
				var $this = $( this );
				$tabs.find( '.vc_active' ).removeClass( 'vc_active' );
				$this.parent().addClass( 'vc_active' );
				$( $this.attr( 'href' ) ).addClass( 'vc_active' );
			} );
			this.trigger( 'afterRender' );
			return this;
		},
		/**
		 * Remove template from server database.
		 *
		 * @param e - Event object
		 */
		removeTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $button = $( e.currentTarget );
			var template_name = $button.closest( '[data-vc-ui-element="template-title"]' ).text();
			var answer = confirm( window.i18nLocale.confirm_deleting_template.replace( '{template_name}',
				template_name ) );
			if ( answer ) {
				$button.closest( '[data-vc-ui-element="template"]' ).remove();
				this.$list.html( window.i18nLocale.loading );
				$.ajax( {
					type: 'POST',
					url: window.ajaxurl,
					data: {
						action: 'wpb_delete_template',
						template_id: $button.attr( 'rel' ),
						vc_inline: true,
						_vcnonce: window.vcAdminNonce
					},
					context: this
				} ).done( function ( html ) {
					this.$list.html( html );
				} );
			}
		},
		/**
		 * Load saved template from server.
		 *
		 * @param e - Event object
		 */
		loadTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $button = $( e.currentTarget );
			$.ajax( {
				type: 'POST',
				url: vc.frame_window.location.href,
				data: {
					action: 'vc_frontend_template',
					template_id: $button.data( 'template_id' ),
					vc_inline: true,
					_vcnonce: window.vcAdminNonce
				},
				context: this
			} ).done( function ( html ) {
				var template, data;
				_.each( $( html ), function ( element ) {
					if ( "vc_template-data" === element.id ) {
						try {
							data = JSON.parse( element.innerHTML );
						} catch ( err ) {
							if ( window.console && window.console.warn ) {
								window.console.warn( 'loadTemplate json error', err );
							}
						}
					}
					if ( "vc_template-html" === element.id ) {
						template = element.innerHTML;
					}
				} );
				if ( template && data ) {
					vc.builder.buildFromTemplate( template, data );
				}
				this.showMessage( window.i18nLocale.template_added, 'success' );
				vc.closeActivePanel();
			} );
		},
		ajaxData: function ( $button ) {
			return {
				action: 'vc_frontend_default_template',
				template_name: $button.data( 'template_name' ),
				vc_inline: true,
				_vcnonce: window.vcAdminNonce
			};
		},
		/**
		 * Load saved template from server.
		 *
		 * @param e - Event object
		 */
		loadDefaultTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $button = $( e.currentTarget );
			$.ajax( {
				type: 'POST',
				url: vc.frame_window.location.href,
				data: this.ajaxData( $button ),
				context: this
			} ).done( function ( html ) {
				var template, data;
				_.each( $( html ), function ( element ) {
					if ( "vc_template-data" === element.id ) {
						try {
							data = JSON.parse( element.innerHTML );
						} catch ( err ) {
							if ( window.console && window.console.warn ) {
								window.console.warn( 'loadDefaultTemplate json error', err );
							}
						}
					}
					if ( "vc_template-html" === element.id ) {
						template = element.innerHTML;
					}
				} );
				if ( template && data ) {
					vc.builder.buildFromTemplate( template, data );
				}
				this.showMessage( window.i18nLocale.template_added, 'success' );
			} );
		},
		/**
		 * Save current shortcode design as template with title.
		 *
		 * @param e - Event object
		 */
		saveTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var name = this.$name.val(),
				data, shortcodes;
			if ( _.isString( name ) && name.length ) {
				shortcodes = this.getPostContent();
				if ( !shortcodes.trim().length ) {
					this.showMessage( window.i18nLocale.template_is_empty, 'error' );
					return false;
				}
				data = {
					action: 'wpb_save_template',
					template: shortcodes,
					template_name: name,
					frontend: true,
					vc_inline: true,
					_vcnonce: window.vcAdminNonce
				};
				this.$name.val( '' );
				this.showMessage( window.i18nLocale.template_save, 'success' );
				this.reloadTemplateList( data );
			} else {
				this.showMessage( window.i18nLocale.please_enter_templates_name, 'error' );
			}
		},
		reloadTemplateList: function ( data ) {
			this.$list.html( window.i18nLocale.loading ).load( window.ajaxurl, data );
		},
		getPostContent: function () {
			return vc.builder.getContent();
		}
	} );
	/**
	 * @deprecated 4.7
	 */
	vc.TemplatesEditorPanelViewBackendEditor = vc.TemplatesEditorPanelView.extend( {
		ajaxData: function ( $button ) {
			return {
				action: 'vc_backend_template',
				template_id: $button.attr( 'data-template_id' ),
				vc_inline: true,
				_vcnonce: window.vcAdminNonce
			};
		},
		/**
		 * Load saved template from server.
		 *
		 * @param e - Event object
		 */
		loadTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $button = $( e.currentTarget );
			$.ajax( {
				type: 'POST',
				url: window.ajaxurl,
				data: this.ajaxData( $button ),
				context: this
			} ).done( function ( shortcodes ) {
				_.each( vc.filters.templates, function ( callback ) {
					shortcodes = callback( shortcodes );
				} );
				vc.storage.append( shortcodes );
				vc.shortcodes.fetch( { reset: true } );
				//this.showMessage( window.i18nLocale.template_added, 'success' );
				vc.closeActivePanel();
			} );
		},
		/**
		 * Load default template from server.
		 *
		 * @param e - Event object
		 */
		loadDefaultTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $button = $( e.currentTarget );
			$.ajax( {
				type: 'POST',
				url: window.ajaxurl,
				data: {
					action: 'vc_backend_default_template',
					template_name: $button.attr( 'data-template_name' ),
					vc_inline: true,
					_vcnonce: window.vcAdminNonce
				},
				context: this
			} ).done( function ( shortcodes ) {
				_.each( vc.filters.templates, function ( callback ) {
					shortcodes = callback( shortcodes );
				} );
				vc.storage.append( shortcodes );
				vc.shortcodes.fetch( { reset: true } );
				//this.showMessage( window.i18nLocale.template_added, 'success' );
			} );
		},
		getPostContent: function () {
			return vc.storage.getContent();
		}
	} );

	/**
	 * @since 4.4
	 */
	vc.TemplatesPanelViewBackend = vc.PanelView.extend( {
		// new feature -> elements filtering
		$name: false,
		$list: false,
		template_load_action: 'vc_backend_load_template',
		templateLoadPreviewAction: 'vc_load_template_preview',
		save_template_action: 'vc_save_template',
		delete_template_action: 'vc_delete_template',
		appendedTemplateType: 'my_templates',
		appendedTemplateCategory: 'my_templates',
		appendedCategory: 'my_templates',
		appendedClass: 'my_templates',
		loadUrl: window.ajaxurl,
		events: $.extend( vc.PanelView.prototype.events, {
			'click .vc_template-save-btn': 'saveTemplate',
			'click [data-template_id] [data-template-handler]': 'loadTemplate',
			'click .vc_template-delete-icon': 'removeTemplate'
		} ),
		initialize: function () {
			_.bindAll( this, 'checkInput', 'saveTemplate' );
			vc.TemplatesPanelViewBackend.__super__.initialize.call( this );
		},
		render: function () {
			this.$el.css( 'left', ($( window ).width() - this.$el.width()) / 2 );
			this.$name = this.$el.find( '[data-js-element="vc-templates-input"]' );
			this.$name.off( 'keypress' ).on( 'keypress', this.checkInput );
			this.$list = this.$el.find( '.vc_templates-list-my_templates' );
			return vc.TemplatesPanelViewBackend.__super__.render.call( this );
		},
		/**
		 * Save My Template
		 *
		 * @param e
		 * @return {boolean}
		 */
		saveTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var name, data, shortcodes, _this;
			name = this.$name.val();
			_this = this;
			if ( _.isString( name ) && name.length ) {
				shortcodes = this.getPostContent();
				if ( !shortcodes.trim().length ) {
					this.showMessage( window.i18nLocale.template_is_empty, 'error' );
					return false;
				}
				data = {
					action: this.save_template_action,
					template: shortcodes,
					template_name: name,
					vc_inline: true,
					_vcnonce: window.vcAdminNonce
				};
				this
					.setButtonMessage( undefined, undefined, true )
					.reloadTemplateList( data, function () {
						// success
						_this.$name.val( '' ).trigger('change');
					}, function () {
						// error
						_this.showMessage( window.i18nLocale.template_save_error, 'error' );
						_this.clearButtonMessage();
					} );
			} else {
				this.showMessage( window.i18nLocale.please_enter_templates_name, 'error' );
				return false;
			}
		},
		checkInput: function ( e ) {
			if ( 13 === e.which ) {
				this.saveTemplate();
				return false;
			}
		},
		/**
		 * Remove template from server database.
		 *
		 * @param e - Event object
		 */
		removeTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			var $button = $( e.target );
			var $template = $button.closest( '[data-template_id]' );
			var template_name = $template.find( '[data-vc-ui-element="template-title"]' ).text();
			var answer = confirm( window.i18nLocale.confirm_deleting_template.replace( '{template_name}',
				template_name ) );
			if ( answer ) {
				var template_id = $template.data( 'template_id' );
				var template_type = $template.data( 'template_type' );
				var template_action = $template.data( 'template_action' );
				$template.remove();
				$.ajax( {
					type: 'POST',
					url: window.ajaxurl,
					data: {
						action: template_action ? template_action : this.delete_template_action,
						template_id: template_id,
						template_type: template_type,
						vc_inline: true,
						_vcnonce: window.vcAdminNonce
					},
					context: this
				} ).done( function () {
					this.showMessage( window.i18nLocale.template_removed, 'success' );
					vc.events.trigger( 'templates:delete', {
						id: template_id,
						type: template_type
					} );
				} );
			}
		},
		reloadTemplateList: function ( data, successCallback, errorCallback ) {
			var _this = this;
			$.ajax( {
				type: 'POST',
				url: window.ajaxurl,
				data: data,
				context: this
			} ).done( function ( html ) {
				_this.filter = false; // reset current filter
				if ( !_this.$list ) {
					_this.$list = _this.$el.find( '.vc_templates-list-my_templates' );
				}
				_this.$list.prepend( $( html ) );
				if ( 'function' === typeof successCallback ) {
					successCallback( html );
				}
			} ).fail( 'function' === typeof errorCallback ? errorCallback : function () {
			} );
		},
		getPostContent: function () {
			return vc.shortcodes.stringify( 'template' );
		},
		loadTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( e && e.stopPropagation ) {
				e.stopPropagation();
			}
			var $template = $( e.target ).closest( '[data-template_id][data-template_type]' );
			$.ajax( {
				type: 'POST',
				url: this.loadUrl,
				data: {
					action: this.template_load_action,
					template_unique_id: $template.data( 'template_id' ),
					template_type: $template.data( 'template_type' ),
					vc_inline: true,
					_vcnonce: window.vcAdminNonce
				},
				context: this
			} ).done( this.renderTemplate );
		},
		renderTemplate: function ( html ) {
			var models;

			_.each( vc.filters.templates, function ( callback ) {
				html = callback( html );
			} );
			models = vc.storage.parseContent( {}, html );
			_.each( models, function ( model ) {
				vc.shortcodes.create( model );
			} );
			vc.closeActivePanel();
		},
		buildTemplatePreview: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			try {
				var url, $el = $( e.currentTarget );
				var $wrapper = $el.closest( '[data-template_id]' );
				if ( !$wrapper.hasClass( 'vc_active' ) && !$wrapper.hasClass( 'vc_loading' ) ) {
					var $localContent = $wrapper.find( '[data-js-content]' );
					var localContentChilds = $localContent.children().length > 0;
					this.$content = $localContent;
					if ( this.$content.find( 'iframe' ).length ) {
						$el.vcAccordion( 'collapseTemplate' );
						return true;
					}
					var _this = this;
					$el.vcAccordion( 'collapseTemplate', function () {
						var templateId = $wrapper.data( 'template_id' );
						var templateType = $wrapper.data( 'template_type' );
						if ( templateId && !localContentChilds ) {
							var question = '?';
							if ( window.ajaxurl.indexOf( '?' ) > - 1 ) {
								question = '&';
							}
							url = window.ajaxurl + question + $.param( {
								action: _this.templateLoadPreviewAction,
								template_unique_id: templateId,
								template_type: templateType,
								vc_inline: true,
								post_id: vc_post_id,
								_vcnonce: window.vcAdminNonce
							} );
							$el.find( 'i' ).addClass( 'vc_ui-wp-spinner' );

							_this.$content.html( '<iframe style="width: 100%;" data-vc-template-preview-frame="' + templateId + '"></iframe>' );
							var $frame = _this.$content.find( '[data-vc-template-preview-frame]' );
							$frame.attr( 'src', url );
							$wrapper.addClass( 'vc_loading' );
							$frame.on( 'load', function () {
								$wrapper.removeClass( 'vc_loading' );
								$el.find( 'i' ).removeClass( 'vc_ui-wp-spinner' );
							} );
						}
					} );
				} else {
					$el.vcAccordion( 'collapseTemplate' );
				}
			} catch ( err ) {
				if ( window.console && window.console.warn ) {
					window.console.warn( 'buildTemplatePreview error', err );
				}
				this.showMessage( 'Failed to build preview', 'error' );
			}
		},
		/**
		 * Set template iframe height
		 * @param height (int) optional
		 */
		setTemplatePreviewSize: function ( height ) {
			var iframe = this.$content.find( 'iframe' );
			if ( iframe.length > 0 ) {
				iframe = iframe[ 0 ];
				if ( undefined === height ) {
					iframe.height = iframe.contentWindow.document.body.offsetHeight;
					height = iframe.contentWindow.document.body.scrollHeight;
				}
				iframe.height = height + 'px';
			}
		}
	} );

	/**
	 * @since 4.4
	 */
	vc.TemplatesPanelViewFrontend = vc.TemplatesPanelViewBackend.extend( {
		template_load_action: 'vc_frontend_load_template',
		loadUrl: false,
		initialize: function () {
			this.loadUrl = vc.$frame.attr( 'src' );
			vc.TemplatesPanelViewFrontend.__super__.initialize.call( this );
		},
		render: function () {
			return vc.TemplatesPanelViewFrontend.__super__.render.call( this );
		},
		renderTemplate: function ( html ) {
			// Render template for frontend
			var template, data;
			_.each( $( html ), function ( element ) {
				if ( "vc_template-data" === element.id ) {
					try {
						data = JSON.parse( element.innerHTML );
					} catch ( err ) {
						if ( window.console && window.console.warn ) {
							window.console.warn( 'renderTemplate error', err );
						}
					}
				}
				if ( "vc_template-html" === element.id ) {
					template = element.innerHTML;
				}
			} );
			// todo check this message appearing: #48591595835639
			if ( template && data && vc.builder.buildFromTemplate( template, data ) ) {
				this.showMessage( window.i18nLocale.template_added_with_id, 'error' );
			} else {
				this.showMessage( window.i18nLocale.template_added, 'success' );
			}
			vc.closeActivePanel();
		}
	} );

	vc.RowLayoutEditorPanelView = vc.PanelView.extend( {
		events: {
			'click [data-dismiss=panel]': 'hide',
			'click [data-transparent=panel]': 'toggleOpacity',
			'mouseover [data-transparent=panel]': 'addOpacity',
			'mouseout [data-transparent=panel]': 'removeOpacity',
			'click .vc_layout-btn': 'setLayout',
			'click #vc_row-layout-update': 'updateFromInput'
		},
		_builder: false,
		render: function ( model ) {
			this.$input = $( '#vc_row-layout' );
			if ( model ) {
				this.model = model;
			}
			this.addCurrentLayout();
			this.resetMinimize();
			vc.column_trig_changes = true;
			$('.edit-form-info').initializeTooltips('.vc_ui-panel-content');
			return this;
		},
		builder: function () {
			if ( !this._builder ) {
				this._builder = new vc.ShortcodesBuilder();
			}
			return this._builder;
		},
		addCurrentLayout: function () {
			vc.shortcodes.sort();
			var string = _.map( vc.shortcodes.where( { parent_id: this.model.get( 'id' ) } ), function ( model ) {
				var width = model.getParam( 'width' );
				return width ? width : '1/1';
			}, '', this ).join( ' + ' );
			this.$input.val( string );
		},
		isBuildComplete: function () {
			return this.builder().isBuildComplete();
		},
		setLayout: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( !this.isBuildComplete() ) {
				return false;
			}
			var $control = $( e.currentTarget ),
				layout = $control.attr( 'data-cells' ),
				columns = this.model.view.convertRowColumns( layout, this.builder() );
			this.$input.val( columns.join( ' + ' ) );
		},
		updateFromInput: function ( e ) {
			// TODO: Check for deprecated #vc_row-layout-update
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			$('#ut_preloader').addClass('side').addClass('small');
			$('#ut_preloader').show();
			if ( !this.isBuildComplete() ) {
				return false;
			}
			var layout,
				cells = this.$input.val();
			if ( false !== (layout = this.validateCellsList( cells )) ) {
				this.model.view.convertRowColumns( layout, this.builder() );
			} else {
				$('#ut_preloader').hide();
				window.alert( window.i18nLocale.wrong_cells_layout );
			}
		},
		validateCellsList: function ( cells ) {
			var return_cells, split, b, num, denom;
			return_cells = [];
			split = cells.replace( /\s/g, '' ).split( '+' );
			var sum = _.reduce( _.map( split, function ( c ) {
				if ( c.match( /^[vc\_]{0,1}span\d{1,2}$/ ) ) {
					var converted_c = vc_convert_column_span_size( c );
					if ( false === converted_c ) {
						return 1000;
					}
					b = converted_c.split( /\// );
					return_cells.push( b[ 0 ] + '' + b[ 1 ] );
					return 12 * parseInt( b[ 0 ], 10 ) / parseInt( b[ 1 ], 10 );
				} else if ( c.match( /^[1-9]|1[0-2]\/[1-9]|1[0-2]$/ ) ) {
					b = c.split( /\// );
					num = parseInt( b[ 0 ], 10 );
					denom = parseInt( b[ 1 ], 10 );
					if ( (5 !== denom && 0 !== 12 % denom) || num > denom ) {
						return 1000;
					}
					return_cells.push( num + '' + denom );
					if ( 5 === denom ) {
						return num;
					} else {
						return 12 * num / denom;
					}
				}
				return 1000;

			} ), function ( num, memo ) {
				memo += num;
				return memo;
			}, 0 );
			if ( 1000 <= sum ) {
				return false;
			}
			return return_cells.join( '_' );
		}
	} );
	vc.RowLayoutEditorPanelViewBackend = vc.RowLayoutEditorPanelView.extend( {
		builder: function () {
			if ( !this.builder ) {
				this.builder = vc.storage;
			}
			return this.builder;
		},
		isBuildComplete: function () {
			return true;
		},
		setLayout: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var $control = $( e.currentTarget ),
				layout = $control.attr( 'data-cells' ),
				columns = this.model.view.convertRowColumns( layout );
			this.$input.val( columns.join( ' + ' ) );
		}
	} );

	$( window ).on( 'orientationchange', function () {
		if ( vc.active_panel ) {
			vc.active_panel.$el.css( {
				top: '',
				left: 'auto',
				height: 'auto',
				width: 'auto'
			} );
		}
	} );
	$( window ).on( 'resize.fixElContainment', function () {
		if ( vc.active_panel && vc.active_panel.fixElContainment ) {
			vc.active_panel.fixElContainment();
		}
	} );

	/**
	 * If element has vc-disable-empty data attribute (usually text input), bind it to another element
	 * (usually button). If first is empty on change event, disable target element. And vice versa
	 */
	$( 'body' ).on( 'keyup change input', '[data-vc-disable-empty]', function () {
		var _this = $( this ),
			$target = $( _this.data( 'vcDisableEmpty' ) );

		if ( _this.val().length ) {
			$target.prop( 'disabled', false );
		} else {
			$target.prop( 'disabled', true );
		}
	} );

})( window.jQuery );

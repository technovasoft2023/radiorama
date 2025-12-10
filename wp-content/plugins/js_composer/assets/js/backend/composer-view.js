/* =========================================================
 * composer-view.js v0.2.1
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WPBakery Page Builder backbone/underscore version
 * ========================================================= */
(function ( $ ) {
	'use strict';
	// @deprecated
	vc.saved_custom_css = false;
	vc.createPreLoader = function () {
		$( '#ut_preloader' ).show();
	};
	vc.removePreLoader = function () {
		$( '#ut_preloader' ).hide();
	};
	vc.createOverlaySpinner = function () {
		vc.$overlaySpinner = $( '#vc_overlay_spinner' ).show();
	};
	vc.removeOverlaySpinner = function () {
		if ( vc.$overlaySpinner ) {
			vc.$overlaySpinner.hide();
		}
	};
	vc.visualComposerView = Backbone.View.extend( {
		el: $( '#wpb_wpbakery' ),
		views: {},
		isEditorInFocus: false,
		isKeydownEventAssigned: false,
		disableFixedNav: false,
		events: {
			"click #wpb-add-new-row": 'createRow',
			'click #vc_post-settings-button': 'editSettings',
			'click #vc_add-new-element, [data-vc-element="add-element-action"]': 'addElement',
			'click #vc_fullscreen-button': 'enterFullscreen',
			'click #vc_theme-switch-button': 'switchDarkMode',
			'click #vc_windowed-button': 'leaveFullscreen',
			'click #vc_seo-button': 'openSeo',
			'click [data-vc-element="add-text-block-action"]': 'addTextBlock',
			'click .wpb_switch-to-composer': 'switchComposer',
			'click #vc_templates-editor-button': 'openTemplatesWindow',
			'click #vc_templates-more-layouts': 'openTemplatesWindow',
			'click .vc_template[data-template_id] > .wpb_wrapper': 'loadDefaultTemplate',
			'click #wpb-save-post': 'save',
			'click .vc_control-preview': 'preview',
			'click .vc_post-custom-layout': 'changePostCustomLayout'
		},
		/**
		 * @deprecated since 4.9
		 */
		initializeAccessPolicy: function () {
			this.accessPolicy = {
				be_editor: vc_user_access().editor( 'backend_editor' ),
				fe_editor: vc_frontend_enabled && vc_user_access().editor( 'frontend_editor' ),
				classic_editor: !vc_user_access().check( 'backend_editor', 'disabled_ce_editor', undefined, true )
			};
		},
		/**
		 * @deprecated since 4.9
		 */
		accessPolicyActions: function () {
			var front = '', back = '';

			if ( this.accessPolicy.fe_editor ) {
				front = '<a class="wpb_switch-to-front-composer" href="' + $(
					'#wpb-edit-inline' ).attr( 'href' ) + '">' + window.i18nLocale.main_button_title_frontend_editor + '</a>';
			}

			if ( this.accessPolicy.classic_editor ) {
				if ( this.accessPolicy.be_editor ) {
					back = '<a class="wpb_switch-to-composer" href="#">' + window.i18nLocale.main_button_title_backend_editor + '</a>';
				}
			} else {
				$( '#postdivrich' ).addClass( 'vc-disable-editor' );
				if ( this.accessPolicy.be_editor ) {
					var _this = this;

					_.defer( function () {
						_this.show();
						_this.status = 'shown';
					} );
				}
			}
			if ( front || back || gutenberg ) {
				this.$buttonsContainer = $( '<div class="composer-switch"><div class="composer-inner-switch"><span class="logo-icon"></span>' + back + front + '</div></div>'
				).insertAfter(
					'div#titlediv' );
				if ( this.accessPolicy.classic_editor ) {
					this.$switchButton = this.$buttonsContainer.find( '.wpb_switch-to-composer' );
					this.$switchButton.on('click', this.switchComposer );
				}
			}
		},
		initialize: function () {
			var _this = this;

			_.bindAll( this,
				'switchComposer',
				'dropButton',
				'processScroll',
				'updateRowsSorting',
				'updateElementsSorting' );
			this.accessPolicy = vc.accessPolicy;
			this.buildRelevance();
			vc.events.on( 'shortcodes:add', vcAddShortcodeDefaultParams, this );
			vc.events.on( 'shortcodes:add', vc.atts.addShortcodeIdParam, this ); // update vc_grid_id on shortcode adding
			vc.events.on( 'shortcodes:sync', vc.atts.addShortcodeIdParam, this ); // update vc_grid_id on shortcode adding
			vc.events.on( 'shortcodes:add', this.addShortcode, this );
			vc.events.on( 'shortcodes:destroy', this.checkEmpty, this );
			vc.shortcodes.on( 'change:params', this.changeParamsEvents, this );
			vc.shortcodes.on( 'reset', this.addAll, this );

			$( document ).on( 'wp-collapse-menu', function ( e, params ) {
				if ( 'open' === params.state ) {
					_this.leaveFullscreen();
				}
			} );

			this.render();
		},
		changeParamsEvents: function ( model ) {
			vc.events.triggerShortcodeEvents( 'update', model );
		},
		render: function () {
			// Find required elemnts of the view.
			this.$buttonsContainer = $( '.composer-switch' );
			this.$switchButton = this.$buttonsContainer.find( '.wpb_switch-to-composer' );
			this.$vcStatus = $( '#wpb_vc_js_status' );
			this.$metablock_content = $( '.metabox-composer-content' );
			this.$content = $( "#wpbakery_content" );
			this.$post = $( '#postdivrich' );
			this.$loading_block = $( '#vc_logo' );

			vc.add_element_block_view = new vc.AddElementUIPanelBackendEditor( { el: '#vc_ui-panel-add-element' } );
			vc.edit_element_block_view = new vc.EditElementUIPanel( { el: '#vc_ui-panel-edit-element' } );

			vc.templates_panel_view = new vc.TemplateWindowUIPanelBackendEditor( { el: '#vc_ui-panel-templates' } );
			vc.post_settings_view = new vc.PostSettingsUIPanelBackendEditor( { el: '#vc_ui-panel-post-settings' } );
			vc.preset_panel_view = new vc.PresetSettingsUIPanelFrontendEditor( { el: '#vc_ui-panel-preset' } );
			vc.post_seo_view = new vc.PostSettingsSeoUIPanel( { el: '#vc_ui-panel-post-seo' } );
			this.setSortable();
			this.additionalSort();
			// this.setDraggable();
			vc.is_mobile = 0 < $( 'body.mobile' ).length;
			// @deprecated
			vc.saved_custom_css = $( '#wpb_custom_post_css_field' ).val();
			vc.updateSettingsBadge();
			/**
			 * @since 4.5
			 */
			_.defer( function () {
				vc.events.trigger( 'app.render' );
			} );
			$('body').on('click', $.proxy(this.handleBodyClick, this));

			return this;
		},
		addAll: function () {
			this.views = {};
			this.$content.removeClass( 'loading' ).empty();
			this.addChild( false );
			this.checkEmpty();
			this.$loading_block.removeClass( 'vc_ui-wp-spinner' );
			this.$metablock_content.removeClass( 'vc_loading-shortcodes' );
			_.defer( function () {
				vc.events.trigger( 'app.addAll' );
				// @UnitedThemes
				$("#ut-metabox-tabs").addClass('ut-visual-composer-ready');
			} );
		},
		addChild: function ( parent_id ) {
			_.each( vc.shortcodes.where( { parent_id: parent_id } ), function ( shortcode ) {
				this.appendShortcode( shortcode );
				this.addChild( shortcode.get( 'id' ) );
			}, this );
			this.setSortable();
		},
		getView: function ( model ) {
			var view;
			if ( _.isObject( vc.map[ model.get( 'shortcode' ) ] ) && _.isString( vc.map[ model.get( 'shortcode' ) ].js_view ) && vc.map[ model.get(
				'shortcode' ) ].js_view.length && !_.isUndefined( window[ window.vc.map[ model.get( 'shortcode' ) ].js_view ] ) ) {
				view = new window[ window.vc.map[ model.get( 'shortcode' ) ].js_view ]( { model: model } );
			} else {
				view = new vc.shortcode_view( { model: model } );
			}
			model.set( { view: view } );
			return view;
		},
		/**
		 * @deprecated 4.12+
		 */
		setDraggable: function () {
			$( '#wpb-add-new-element, #wpb-add-new-row' ).draggable( {
				helper: function () {
					return $( '<div id="drag_placeholder"></div>' ).appendTo( 'body' );
				},
				zIndex: 99999,
				// cursorAt: { left: 10, top : 20 },
				cursor: "move",
				// appendTo: "body",
				revert: "invalid",
				start: function ( event, ui ) {
					$( "#drag_placeholder" ).addClass( "column_placeholder" ).html( window.i18nLocale.drag_drop_me_in_column );
				}
			} );
			// this.setDropable();
		},
		/**
		 * @deprecated 4.12+
		 */
		setDropable: function () {
			this.$content.droppable( {
				greedy: true,
				accept: ".dropable_el,.dropable_row",
				hoverClass: "wpb_ui-state-active",
				drop: this.dropButton
			} );
		},
		/**
		 * @deprecated 4.12+
		 * @param event
		 * @param ui
		 */
		dropButton: function ( event, ui ) {
			if ( ui.draggable.is( '#wpb-add-new-element' ) ) {
				this.addElement();
			} else if ( ui.draggable.is( '#wpb-add-new-row' ) ) {
				this.createRow();
			}
		},
		appendShortcode: function ( model ) {
			var view, parentModelView, params;
			view = this.getView( model );
			params = _.extend( vc.getDefaults( model.get( 'shortcode' ) ), model.get( 'params' ) );
			model.set( 'params', params, { silent: true } );
			parentModelView = false !== model.get( 'parent_id' ) ?
				this.views[ model.get( 'parent_id' ) ] : false;
			this.views[ model.id ] = view;
			if ( model.get( 'parent_id' ) ) {
				var parentView;
				parentView = this.views[ model.get( 'parent_id' ) ];
				parentView.unsetEmpty();
			}
			if ( parentModelView ) {
				parentModelView.addShortcode( view, 'append' );
			} else {
				this.$content.append( view.render().el );
			}
			view.ready();
			view.changeShortcodeParams( model ); // Refactor
			view.checkIsEmpty();
			this.setNotEmpty();
		},
		addShortcode: function ( model ) {
			var view, parentModelView, params;
			params = _.extend( vc.getDefaults( model.get( 'shortcode' ) ), model.get( 'params' ) );
			model.set( 'params', params, { silent: true } );
			view = this.getView( model );
			parentModelView = false !== model.get( 'parent_id' ) ?
				this.views[ model.get( 'parent_id' ) ] : false;
			view.use_default_content = true !== model.get( 'cloned' );
			this.views[ model.id ] = view;
			if( model.get('shortcode') === 'vc_section' ) {
				this.setNotEmpty();
			}

			if ( parentModelView ) {
				parentModelView.addShortcode( view );
				parentModelView.checkIsEmpty();
				var _this;
				_this = this;
				_.defer( function () {
					if ( view.changeShortcodeParams ) {
						view.changeShortcodeParams( model );
					}
					view.ready();
					view.checkIsEmpty();
					_this.setSortable();
					_this.setNotEmpty();
				} );

			} else {
				this.addRow( view );
				_.defer( function () {
					if ( view.changeShortcodeParams ) {
						view.changeShortcodeParams( model );
					}
					view.ready();
					view.checkIsEmpty();
				} );
			}
		},
		addRow: function ( view ) {
			var before_shortcode;
			before_shortcode = _.last( vc.shortcodes.filter( function ( shortcode ) {
				return false === shortcode.get( 'parent_id' ) && parseFloat( shortcode.get( 'order' ) ) < parseFloat(
					this.get( 'order' ) );
			}, view.model ) );
			if ( before_shortcode ) {
				view.render().$el.insertAfter( '[data-model-id=' + before_shortcode.id + ']' );
			} else {
				this.$content.append( view.render().el );
			}
		},
		addTextBlock: function ( e ) {
			var row, column, params, row_params, column_params;

			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			row_params = {};

			row = vc.shortcodes.create( {
				shortcode: 'vc_row',
				params: row_params
			} );

			column_params = { width: '1/1' };

			column = vc.shortcodes.create( {
				shortcode: 'vc_column',
				params: column_params,
				parent_id: row.id,
				root_id: row.id
			} );

			params = vc.getDefaults( 'vc_column_text' );

			return vc.shortcodes.create( {
				shortcode: 'vc_column_text',
				parent_id: column.id,
				root_id: row.id,
				params: params
			} );
		},
		/**
		 * Create row
		 */
		createRow: function () {
			var row, row_params, column_params;

			row_params = {};

			row = vc.shortcodes.create( {
				shortcode: 'vc_row',
				params: row_params
			} );

			column_params = { width: '1/1' };

			vc.shortcodes.create( {
				shortcode: 'vc_column',
				params: column_params,
				parent_id: row.id,
				root_id: row.id
			} );

			return row;
		},
		/**
		 * Add Element with a help of modal view.
		 */
		addElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.add_element_block_view.render( false );
			$('body').removeClass('is-fullscreen');
		},
		openTemplatesWindow: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( $( e.currentTarget ).is( '#vc_templates-more-layouts' ) ) {
				vc.templates_panel_view.once( 'show', function () {
					$( '[data-vc-ui-element-target="[data-tab=default_templates]"]' ).click();
				} );
			}
			vc.templates_panel_view.render().show();
		},
		loadDefaultTemplate: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.templates_panel_view.loadTemplate( e );
		},
		editSettings: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.post_settings_view.render().show();
		},
		enterFullscreen: function () {
			var $body = $( 'body' );

			if ( $body.hasClass( 'folded' ) ) {
				$body.data( 'vcKeepMenuFolded', true );
				$body.addClass( 'vc_fullscreen' );
			} else {
				$body.addClass( 'vc_fullscreen folded' );
			}

			$( '#vc_windowed-button' ).css('display', 'block');
			$( '#vc_fullscreen-button' ).hide();
		},
		switchDarkMode: function () {
			if( $('body').hasClass('unite-admin-dark') ) {
				$('body').removeClass('unite-admin-dark');
				$('#vc_theme-switch-button').attr('title', 'Dark Mode');
			} else {
				$('body').addClass('unite-admin-dark');
				$('#vc_theme-switch-button').attr('title', 'Light Mode');
			}
		},
		leaveFullscreen: function () {
			var $body = $( 'body' );

			if ( !$body.hasClass( 'vc_fullscreen' ) ) {
				return;
			}

			if ( $body.data( 'vcKeepMenuFolded' ) ) {
				$body.removeClass( 'vc_fullscreen' );
				$body.removeData( 'vcKeepMenuFolded' );
			} else {
				$body.removeClass( 'vc_fullscreen folded' );
			}

			$( '#vc_windowed-button' ).hide();
			$( '#vc_fullscreen-button' ).show();
		},
		sortingStarted: function ( event, ui ) {
			$( '#wpbakery_content' ).addClass( 'vc_sorting-started' );
		},
		sortingStopped: function ( event, ui ) {
			var tag = ui.item.data( 'element_type' ),
				parent_tag = ui.placeholder.closest( '[data-element_type]' ).data( 'element_type' ) || '';
			if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
				ui.placeholder.addClass( 'vc_hidden-placeholder' );
				$( event.target ).sortable( 'cancel' );
			}
			$( '#wpbakery_content' ).removeClass( 'vc_sorting-started' );
		},
		updateElementsSorting: function ( event, ui ) {
			_.defer( function ( app ) {
				var $current_container = ui.item.parent().closest( '[data-model-id]' ),
					parent = $current_container.data( 'model' ),
					model = ui.item.data( 'model' ),
					models = app.views[ parent.id ].$content.find( '> [data-model-id]' ),
					i = 0;
				// Change parent if block moved to another container.
				if ( !_.isNull( ui.sender ) ) {
					var old_parent_id = model.get( 'parent_id' );
					vc.storage.lock();
					model.save( { parent_id: parent.id } );
					if ( old_parent_id ) {
						app.views[ old_parent_id ].checkIsEmpty();
					}
					app.views[ parent.id ].checkIsEmpty();
				}
				models.each( function () {
					var shortcode = $( this ).data( 'model' );
					vc.storage.lock();
					shortcode.save( { 'order': i ++ } );
				} );
				model.save();
			}, this );

		},
		updateRowsSorting: function ( e, ui ) {
			_.defer( function ( app ) {
				var parentNode = ui.item.parent();
				var $currentContainer = parentNode.closest( '[data-model-id]' ),
					newParentId = $currentContainer.length ? $currentContainer.data( 'model' ).get( 'id' ) : false,
					model = ui.item.data( 'model' );

				var tag = ui.item.data( 'element_type' ),
					parent_tag = ui.item.parent().closest( '[data-element_type]' ).data( 'element_type' ) || '';
				if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
					$( e.target ).sortable( 'cancel' );
					return;
				}

				// Change parent if block moved to another container.
				var oldParentId = model.get( 'parent_id' );
				var $rows = parentNode.find( app.rowSortableSelector );
				$rows.each( function () {
					var index = $( this ).index();
					vc.storage.lock();
					$( this ).data( 'model' ).save( { 'order': index } );
				} );
				model.save( { parent_id: newParentId } );

				if ( oldParentId ) {
					app.views[ oldParentId ].checkIsEmpty();
				}
				if ( newParentId ) {
					app.views[ newParentId ].checkIsEmpty();
				}
			}, this );
		},
		renderPlaceholder: function ( event, element ) {
			var tag = $( element ).data( 'element_type' );
			var is_container = _.isObject( vc.map[ tag ] ) && ((_.isBoolean( vc.map[ tag ].is_container ) && true === vc.map[ tag ].is_container) || !_.isEmpty(
				vc.map[ tag ].as_parent ));
			var $helper = $( '<div class="vc_helper vc_helper-' + tag + '"><i class="vc_general vc_element-icon' +
				(vc.map[ tag ].icon ? ' ' + vc.map[ tag ].icon : '') + '"' + (is_container ? ' data-is-container="true"' : '') + '></i> ' + vc.map[ tag ].name + '</div>' ).prependTo( 'body' );

			return $helper;
		},
		rowSortableSelector: "> .wpb_vc_row, > .vc_main-sortable-element",
		//@united
		moveSectionToTop: function (item, callback){

			let first = item.siblings(":first");

			if( first.length === 0 ) {
				return;
			}

			item.css('z-index', 1000).css('position', 'relative').slideUp( 400, function () {

				item.insertBefore(first);

				$("html, body").animate({ scrollTop: $('#wpbakery_content').offset().top -200 }, 600, function(){

					item.delay(200).slideDown();

					if (callback && typeof(callback) === "function") {

						callback();

					}

				});

			});

		},
		moveSectionUp: function (item, callback) {

			let prev = item.prev();

			if( prev.length === 0 ) {
				return;
			}

			prev.css('z-index', 999).css('position','relative').animate({ top: item.outerHeight() }, 300 );
			item.css('z-index', 1000).css('position', 'relative').animate({ top: '-' + prev.outerHeight() }, 300, function () {

				prev.css('z-index', '').css('top', '').css('position', '');
				item.css('z-index', '').css('top', '').css('position', '');
				item.insertBefore(prev);

				if (callback && typeof(callback) === "function") {

					callback();

				}

			});

		},
		moveSectionToBottom: function(item, callback) {

			let last = item.siblings(":last");

			if( last.length === 0 ) {
				return;
			}

			item.css('z-index', 1000).css('position', 'relative').slideUp( 400, function () {

				item.insertAfter(last);

				$("html, body").animate({ scrollTop: $('#wpbakery_content')[0].scrollHeight }, 600, function(){

					item.delay(200).slideDown();

					if (callback && typeof(callback) === "function") {

						callback();

					}

				});

			});

		},
		moveSectionDown: function (item, callback) {

			let next = item.next();

			if( next.length === 0 ) {
				return;
			}

			next.css('z-index', 999).css('position', 'relative').animate({ top: '-' + item.outerHeight() }, 300 );
			item.css('z-index', 1000).css('position', 'relative').animate({ top: next.outerHeight() }, 300, function () {

				next.css('z-index', '').css('top', '').css('position', '');
				item.css('z-index', '').css('top', '').css('position', '');
				item.insertAfter(next);

				if (callback && typeof(callback) === "function") {

					callback();

				}

			});

		},
		additionalSort: function () {
			const that = this;
			$(document).on('click', '.vc_column-move-down', function(event) {

				var $section = $(this).closest(".wpb_vc_section, .wpb_ut_content_block"),
					$target = $("wpbakery_content");

				that.moveSectionDown( $section, function(){

					$("#wpbakery_content").sortable('option','update')(
						{
							type: "sortupdate",
							target: $target
						},
						{
							item: $section
						}
					);

				});

				event.preventDefault();

			});
			$(document).on('click', '.vc_column-move-bottom', function(event) {

				var $section = $(this).closest(".wpb_vc_section, .wpb_ut_content_block"),
					$target = $("wpbakery_content");

				that.moveSectionToBottom( $section, function(){

					$("#wpbakery_content").sortable('option','update')(
						{
							type: "sortupdate",
							target: $target
						},
						{
							item: $section
						}
					);

				});

				event.preventDefault();

			});
			$(document).on('click', '.vc_column-move-up', function(event) {

				let $section = $(this).closest(".wpb_vc_section, .wpb_ut_content_block"),
					$target = $("wpbakery_content");

				that.moveSectionUp( $section, function(){

					$("#wpbakery_content").sortable('option','update')(
						{
							type: "sortupdate",
							target: $target
						},
						{
							item: $section
						}
					);

				});

				event.preventDefault();

			});

			$(document).on('click', '.vc_column-move-top', function(event) {

				let $section = $(this).closest(".wpb_vc_section, .wpb_ut_content_block"),
					$target = $("wpbakery_content");

				that.moveSectionToTop( $section, function(){

					$("#wpbakery_content").sortable('option','update')(
						{
							type: "sortupdate",
							target: $target
						},
						{
							item: $section
						}
					);

				});

				event.preventDefault();

			});
		},

		//end @united
		setSortable: function () {
			if ( !vc_user_access().partAccess( 'dragndrop' ) ) {
				return;
			}
			// 1st level sorting (rows). work also in wp41.
			$( '.wpb_main_sortable' ).sortable( {
				forcePlaceholderSize: true,
				placeholder: "widgets-placeholder",
				cursor: "move",
				connectWith: ".vc_section_container",
				items: this.rowSortableSelector, // wpb_sortablee
				handle: '.vc_column-move',
				cancel: '.vc-non-draggable-row',
				distance: 0.5,
				start: this.sortingStarted,
				stop: this.sortingStopped,
				update: this.updateRowsSorting,
				tolerance: 'intersect',
				over: function ( event, ui ) {
					var tag = ui.item.data( 'element_type' ),
						parent_tag = ui.placeholder.closest( '[data-element_type]' ).data( 'element_type' ) || '';
					if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
						ui.placeholder.addClass( 'vc_hidden-placeholder' );
						return false;
					}
					// ui.placeholder.removeClass( 'vc_hidden-placeholder' );
					ui.placeholder.css( { maxWidth: ui.placeholder.parent().width() } );
				},
				out: function ( event, ui ) {
					ui.placeholder.removeClass( 'vc_hidden-placeholder' );
					ui.placeholder.css( { maxWidth: ui.placeholder.parent().width() } );
				}
			} );
			// 2nd level sorting (elements).
			// This sortable enabled sorting inside containers between elements.
			$( '.wpb_column_container' ).sortable( {
				forcePlaceholderSize: true,
				forceHelperSize: false,
				connectWith: ".wpb_column_container",
				placeholder: "vc_placeholder",
				items: "> div.wpb_sortable,> div.vc-non-draggable", //wpb_sortablee
				helper: this.renderPlaceholder,
				distance: 3,
				cancel: '.vc-non-draggable',
				scroll: true,
				scrollSensitivity: 70,
				cursor: 'move',
				cursorAt: { top: 20, left: 16 },
				tolerance: 'intersect', // this helps with dragging textblock into tabs
				start: function () {
					$( '#wpbakery_content' ).addClass( 'vc_sorting-started' );
					$( '.vc_not_inner_content' ).addClass( 'dragging_in' );
				},
				stop: function ( event, ui ) {
					$( '#wpbakery_content' ).removeClass( 'vc_sorting-started' );
					$( '.dragging_in' ).removeClass( 'dragging_in' );
					var tag = ui.item.data( 'element_type' ),
						parent_tag = ui.item.parent().closest( '[data-element_type]' ).data( 'element_type' ) || '',
						allowed_container_element = !_.isUndefined( vc.map[ parent_tag ].allowed_container_element ) ? vc.map[ parent_tag ].allowed_container_element : true;
					if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
						$( this ).sortable( 'cancel' );
					}
					var is_container = _.isObject( vc.map[ tag ] ) && ((_.isBoolean( vc.map[ tag ].is_container ) && true === vc.map[ tag ].is_container) || !_.isEmpty(
						vc.map[ tag ].as_parent ));
					if ( is_container && !(true === allowed_container_element || allowed_container_element === ui.item.data(
						'element_type' ).replace( /_inner$/,
						'' )) ) {
						$( this ).sortable( 'cancel' );
					}
					$( '.vc_sorting-empty-container' ).removeClass( 'vc_sorting-empty-container' );
				},
				update: this.updateElementsSorting,
				over: function ( event, ui ) {
					var tag = ui.item.data( 'element_type' ),
						parent_tag = ui.placeholder.closest( '[data-element_type]' ).data( 'element_type' ),
						allowed_container_element = !_.isUndefined( vc.map[ parent_tag ].allowed_container_element ) ? vc.map[ parent_tag ].allowed_container_element : true;
					if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
						ui.placeholder.addClass( 'vc_hidden-placeholder' );
					}
					var is_container = _.isObject( vc.map[ tag ] ) && ((_.isBoolean( vc.map[ tag ].is_container ) && true === vc.map[ tag ].is_container) || !_.isEmpty(
						vc.map[ tag ].as_parent ));
					if ( is_container && !(true === allowed_container_element || allowed_container_element === ui.item.data(
						'element_type' ).replace( /_inner$/,
						'' )) ) {
						ui.placeholder.addClass( 'vc_hidden-placeholder' );
					}
					if ( !_.isNull( ui.sender ) && ui.sender.length && !ui.sender.find( '> [data-element_type]:not(.ui-sortable-helper):visible' ).length ) {
						ui.sender.addClass( 'vc_sorting-empty-container' );
					}
					// ui.placeholder.removeClass( 'vc_hidden-placeholder' );
					ui.placeholder.css( { maxWidth: ui.placeholder.parent().width() } );
				},
				out: function ( event, ui ) {
					ui.placeholder.removeClass( 'vc_hidden-placeholder' );
					ui.placeholder.css( { maxWidth: ui.placeholder.parent().width() } );
				}
			} ).disableSelection();

			return this;
		},
		setNotEmpty: function () {
			$( '#vc_no-content-helper' ).addClass( 'vc_not-empty' );
			$( '#vc_navbar' ).addClass( 'vc_not-empty' );
		},
		setIsEmpty: function () {
			vc.views = {};
			$( '#vc_no-content-helper' ).removeClass( 'vc_not-empty' );
			$( '#vc_navbar' ).removeClass( 'vc_not-empty' );
		},
		checkEmpty: function ( model ) {
			if ( _.isObject( model ) && false !== model.get( 'parent_id' ) && model.get( 'parent_id' ) != model.id ) {
				var parent_view = this.views[ model.get( 'parent_id' ) ];
				if ( !parent_view ) {
					return;
				}
				parent_view.checkIsEmpty();
			}
			if ( 0 === vc.shortcodes.length ) {
				this.setIsEmpty();
			} else {
				this.setNotEmpty();
			}
		},
		switchComposer: function ( e ) {
			// @todo need to remove it separate js view and all logic should be removed from be editor.
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( 'shown' === this.status ) {
				if ( this.accessPolicy.can( 'classic_editor' ) ) {
					if ( !_.isUndefined( this.$switchButton ) ) {
						this.$switchButton.text( window.i18nLocale.main_button_title_backend_editor );
					}
					if ( !_.isUndefined( this.$buttonsContainer ) ) {
						this.$buttonsContainer.removeClass( 'vc_backend-status' );
					}
				}
				this.close();
				this.status = 'closed';
			} else {
				if ( this.accessPolicy.can( 'classic_editor' ) ) {
					if ( !_.isUndefined( this.$switchButton ) ) {
						this.$switchButton.text( window.i18nLocale.main_button_title_revert );
					}
					if ( !_.isUndefined( this.$buttonsContainer ) ) {
						this.$buttonsContainer.addClass( 'vc_backend-status' );
					}
				}
				this.show();
				this.status = 'shown';
			}
		},
		show: function () {
			this.$el.show();
			this.$post.addClass( 'vc-disable-editor' );
			this.$vcStatus.val( "true" );
			this.navOnScroll();
			this.hideOtherEditors();
			$('body').addClass('ut-vc-enabled');
			if ( vc.storage.isContentChanged() ) {
				if ( vc.undoRedoApi ) {
					vc.undoRedoApi.add( vc.storage.getContent() );
				}
				vc.app.setLoading();
				vc.app.views = {};
				_.defer( function () {
					vc.shortcodes.fetch( { reset: true } );
					vc.events.trigger( 'backendEditor.show' );
				} );
			}
		},
		hideOtherEditors: function () {
			$('#elementor-editor').insertAfter('#wpb_wpbakery');
			$('#elementor-switch-mode').insertAfter('#wpb_wpbakery');
		},
		setLoading: function () {
			this.setNotEmpty();
			this.$loading_block.addClass( 'vc_ui-wp-spinner' );
			this.$metablock_content.addClass( 'vc_loading-shortcodes' );
		},
		close: function () {
			this.$vcStatus.val( "false" );
			this.$el.hide();
			$('body').removeClass('ut-vc-enabled').addClass('ut-vc-disabled');
			if ( _.isObject( window.editorExpand ) ) {
				_.delay( function () {
					window.scrollBy( 0, - 1 );
				}, 17 );
				_.delay( function () {
					window.scrollBy( 0, 1 );
				}, 17 );
			}
			this.$post.removeClass( 'vc-disable-editor' );
			_.defer( function () {
				vc.events.trigger( 'backendEditor.close' );
			} );
		},
		checkVcStatus: function () {

			var currentURL = new URL(window.location.href);
			var isBackedEditor = currentURL.searchParams.has('wpb-backend-editor');
			if ( vc.accessPolicy.can( 'be_editor' ) && (!vc.accessPolicy.can( 'classic_editor' ) || 'true' === this.$vcStatus.val() || isBackedEditor) ) {
				this.switchComposer();
			}
		},
		setNavTop: function () {
			this.navTop = this.$nav.length && this.$nav.offset().top - 28;
		},
		save: function () {
			$( '#wpb-save-post' ).text( window.i18nLocale.loading );
			$( '#publish' ).click();
		},
		preview: function () {
			$( '#post-preview' ).click();
		},
		navOnScroll: function () {
			this.$nav = $( '#vc_navbar' );
			this.setNavTop();
			this.processScroll();
			$( window ).off( 'scroll.composer' ).on( 'scroll.composer', this.processScroll );
		},
		processScroll: function ( e ) {
			if ( true === this.disableFixedNav ) {
				this.$nav.removeClass( 'vc_subnav-fixed' );
				return;
			}
			if ( !this.navTop || 0 > this.navTop ) {
				this.setNavTop();
			}
			this.scrollTop = $( window ).scrollTop() + 80;
			if ( 0 < this.navTop && this.scrollTop >= this.navTop && !this.isFixed ) {
				this.isFixed = 1;
				this.$nav.addClass( 'vc_subnav-fixed' );
			} else if ( this.scrollTop <= this.navTop && this.isFixed ) {
				this.isFixed = 0;
				this.$nav.removeClass( 'vc_subnav-fixed' );
			}
		},
		buildRelevance: function () {
			vc.shortcode_relevance = {};
			_.map( vc.map, function ( object ) {
				if ( _.isObject( object.as_parent ) && _.isString( object.as_parent.only ) ) {
					vc.shortcode_relevance[ 'parent_only_' + object.base ] = object.as_parent.only.replace( /\s/g,
						'' ).split( ',' );
				}
				if ( _.isObject( object.as_parent ) && _.isString( object.as_parent.except ) ) {
					vc.shortcode_relevance[ 'parent_except_' + object.base ] = object.as_parent.except.replace( /\s/g,
						'' ).split( ',' );
				}
				if ( _.isObject( object.as_child ) && _.isString( object.as_child.only ) ) {
					vc.shortcode_relevance[ 'child_only_' + object.base ] = object.as_child.only.replace( /\s/g,
						'' ).split( ',' );
				}
				if ( _.isObject( object.as_child ) && _.isString( object.as_child.except ) ) {
					vc.shortcode_relevance[ 'child_except_' + object.base ] = object.as_child.except.replace( /\s/g,
						'' ).split( ',' );
				}
			} );
			/**
			 * Check parent/children relationship between two tags
			 * @param tag
			 * @param related_tag
			 * @return boolean - Returns true if relevance is positive
			 */
			vc.check_relevance = function ( tag, related_tag ) {
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
		},
		changePostCustomLayout: function ( e ) {
			if ( !e || !e.preventDefault ) {
				return;
			}

			e.preventDefault();

			var selected_layout = $(e.currentTarget);
			var layout_name = selected_layout.attr('data-post-custom-layout');
			var editor_wrapper = $('#wpb_wpbakery');
			var settings_layout = $('#vc_ui-panel-post-settings .vc_post-custom-layout[data-post-custom-layout=' + layout_name + ']');

			settings_layout.addClass('vc-active-post-custom-layout');
			settings_layout.siblings().removeClass('vc-active-post-custom-layout');

			// set input that help us save layout values to post meta
			$('input[name=vc_post_custom_layout]').val(layout_name);
			// add class that help us to hide some elements on a page that should not
			// be visible when layout is selected
			editor_wrapper.find('.vc_navbar').addClass('vc_post-custom-layout-selected');
			editor_wrapper.find('.metabox-composer-content').addClass('vc_post-custom-layout-selected');
		},
		handleEditorPaste: function (evt) {
			var content = evt.originalEvent.clipboardData.getData('text/plain') || '';
			vc.pasteShortcode(false, false, content);
		},
		handleBodyClick: function (e) {
			this.isEditorInFocus = !!$(e.target).closest('#wpb_wpbakery, .vc_ui-panel-window').length;
			if (this.isEditorInFocus && !this.isKeydownEventAssigned) {
				$('body').on('paste', this.handleEditorPaste);
				this.isKeydownEventAssigned = true;
			} else if (!this.isEditorInFocus && this.isKeydownEventAssigned) {
				$('body').off('paste', this.handleEditorPaste);
				this.isKeydownEventAssigned = false;
			}
		},
		openSeo: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			vc.post_seo_view.render();
		}
	} );

	$( function () {
		var $wpbVisualComposer;
		$wpbVisualComposer = $( '#wpb_wpbakery' );
		if ( $wpbVisualComposer.is( 'div' ) ) {
			vc.app = new vc.visualComposerView( { el: $wpbVisualComposer } );
			if ( vc.accessPolicy.can( 'be_editor' ) && !vc_user_access().isBlockEditorIsEnabled() ) {
				vc.app.checkVcStatus();
			}
			$('#post').on('submit', function () {
				if (vc.storage.isChanged) {
					vc.storage.isChanged = false;
					window.jQuery( window ).off( 'beforeunload.vcSave' );
				}
			});

			vc.events.on( 'vc:backend_editor:show', function () {
				vc.app.show();
				vc.app.status = 'shown';
			} );
			vc.events.on( 'vc:backend_editor:switch', function () {
				vc.app.switchComposer();
			} );
		}
	} );
})( window.jQuery );

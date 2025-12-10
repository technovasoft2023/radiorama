/* =========================================================
 * composer-custom-views.js v1.1
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WPBakery Page Builder ViewModel objects for shortcodes with custom
 * functionality.
 * ========================================================= */

(function ( $ ) {
	'use strict';
	var Shortcodes = vc.shortcodes;

	window.VcRowView = vc.shortcode_view.extend( {
		change_columns_layout: false,
		events: {
			'click > .vc_controls [data-vc-control="delete"]': 'deleteShortcode',
			'click > .vc_controls .set_columns': 'setColumns',
			'click > .vc_controls [data-vc-control="add"]': 'addElement',
			'click > .vc_controls [data-vc-control="edit"]': 'editElement',
			'click > .vc_controls [data-vc-control="clone"]': 'clone',
			'click > .vc_controls [data-vc-control="copy"]': 'copy',
			'click > .vc_controls [data-vc-control="paste"]': 'paste',
			'click > .vc_controls [data-vc-control="move"]': 'moveElement',
			'click > .vc_controls [data-vc-control="toggle"]': 'toggleElement',
			'click > .wpb_element_wrapper .vc_controls': 'openClosedRow'
		},
		convertRowColumns: function ( layout ) {
			var layout_split = layout.toString().split( /_/ ),
				columns = Shortcodes.where( { parent_id: this.model.id } ),
				new_columns = [],
				new_layout = [],
				new_width = '';
			_.each( layout_split, function ( value, i ) {
				var column_data = _.map( value.toString().split( '' ), function ( v, i ) {
						return parseInt( v, 10 );
					} ),
					new_column_params, new_column;
				if ( 3 < column_data.length ) {
					new_width = column_data[ 0 ] + '' + column_data[ 1 ] + '/' + column_data[ 2 ] + '' + column_data[ 3 ];
				} else if ( 2 < column_data.length ) {
					new_width = column_data[ 0 ] + '/' + column_data[ 1 ] + '' + column_data[ 2 ];
				} else {
					new_width = column_data[ 0 ] + '/' + column_data[ 1 ];
				}

				// brainfuck fallbacks @United
				new_width = new_width === '2/12' ? '1/6' : new_width;
				new_width = new_width === '3/12' ? '1/4' : new_width;
				new_width = new_width === '4/12' ? '1/3' : new_width;
				new_width = new_width === '6/12' ? '1/2' : new_width;
				new_width = new_width === '8/12' ? '2/3' : new_width;
				new_width = new_width === '9/12' ? '3/4' : new_width;
				new_width = new_width === '10/12' ? '5/6' : new_width;
				new_width = new_width === '12/12' ? '1/1' : new_width;

				new_layout.push( new_width );
				new_column_params = _.extend( !_.isUndefined( columns[ i ] ) ? columns[ i ].get( 'params' ) : {},
					{ width: new_width } );

				vc.storage.lock();
				new_column = Shortcodes.create( {
					shortcode: this.getChildTag(),
					params: new_column_params,
					parent_id: this.model.id
				} );
				if ( _.isObject( columns[ i ] ) ) {
					_.each( Shortcodes.where( { parent_id: columns[ i ].id } ), function ( shortcode ) {
						vc.storage.lock();
						shortcode.save( { parent_id: new_column.id } );
						vc.storage.lock();
						shortcode.trigger( 'change_parent_id' );
					} );
				}
				new_columns.push( new_column );
			}, this );
			if ( layout_split.length < columns.length ) {
				_.each( columns.slice( layout_split.length ), function ( column ) {
					_.each( Shortcodes.where( { parent_id: column.id } ), function ( shortcode ) {
						vc.storage.lock();
						shortcode.save( { 'parent_id': _.last( new_columns ).id } );
						vc.storage.lock();
						shortcode.trigger( 'change_parent_id' );
					} );
				} );
			}
			_.each( columns, function ( shortcode ) {
				vc.storage.lock();
				shortcode.destroy();
			}, this );
			this.model.save();
			this.setActiveLayoutButton( '' + layout );
			return new_layout;
		},
		changeShortcodeParams: function ( model ) {
			window.VcRowView.__super__.changeShortcodeParams.call( this, model );
			this.buildDesignHelpers();
			this.setRowClasses();
		},
		setRowClasses: function () {
			var disable = this.model.getParam( 'disable_element' );
			var disableClass = 'vc_hidden-xs vc_hidden-sm  vc_hidden-md vc_hidden-lg';
			if ( this.disable_element_class ) {
				this.$el.removeClass( this.disable_element_class );
			}
			if ( !_.isEmpty( disable ) ) {
				this.$el.addClass( disableClass );
				this.disable_element_class = disableClass;
			}
		},
		designHelpersSelector: '> .vc_controls .column_toggle',
		// try to load small preview images first ( makes editor faster )
		loadTinySource: function( original, $column ) {

			var http = new XMLHttpRequest();

			// tiny image url
			var extension = original.split('.').pop();
			var image_url = original.replace('.' + extension, '-200x200.'+ extension);

			http.open('HEAD', image_url, true);
			http.onreadystatechange = function() {

				var preview_url = '';

				if( http.readyState === 4 ) {

					if( http.status === 200 ) {

						preview_url = image_url;

					} else {

						preview_url = original;

					}

				}
				if(preview_url !== '') {
					$column.append('<span class="vc_row_image control-style" style="background-image: url(' + preview_url + ');" title="' + i18nLocale.column_background_image + '"></span>');
				}

			};

			http.send();


		},
		buildDesignHelpers: function () {
			var css, distortion, distortion_effect, $elementToPrepend, image, color, rowId, rowName, matches;

			css = this.model.getParam( 'css' );
			$elementToPrepend = this.$el.find( this.designHelpersSelector );

			this.$el.find( '> .vc_controls .vc_row_color' ).remove();
			this.$el.find( '> .vc_controls .vc_row_image' ).remove();

			matches = css.match( /background\-image:\s*url\(([^\)]+)\)/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				image = matches[ 1 ];
			}
			matches = css.match( /background\-color:\s*([^\s\;]+)\b/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				color = matches[ 1 ];
			}
			matches = css.match( /background:\s*([^\s]+)\b\s*url\(([^\)]+)\)/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				color = matches[ 1 ];
				image = matches[ 2 ];
			}
			// additional RGBA Queries @United Themes
			matches = css.match(/(#([\da-f]{3}){1,2}|(rgb|hsl)a\((\d{1,3}%?,\s?){3}(1|0?\.\d+)\)|(rgb|hsl)\(\d{1,3}%?(,\s?\d{1,3}%?){2}\))/),
			matches && !_.isUndefined(matches[1]) && (color = matches[1]),

				// additional URL Query @United Themes
				matches = css.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/),
			matches && !_.isUndefined(matches[0]) && (image = matches[0]),

			// additional Background Distortion label
			distortion = this.model.getParam( "distortion" );
			distortion === 'on' && ( distortion_effect = '#a55eea' );
			// TODO: refactor this to separate methods and maybe vc.events
			rowId = this.model.getParam( 'el_id' );
			this.$el.find( '> .vc_controls .vc_row-hash-id' ).remove();
			if ( !_.isEmpty( rowId ) ) {
				$( '<span class="vc_row-hash-id"></span>' )
					.text( '#' + rowId )
					.insertAfter( this.$el.find( '.control-main .column_add' ) );
			}

			//@united
			rowName = this.model.getParam("el_name"),
				this.$el.find("> .vc_controls .vc_row-name-id").remove(), _.isEmpty(rowName) || $('<span class="vc_row-name-id row"></span>').text(rowName).insertAfter(this.$el.find( '.controls-move' )),
			image && this.loadTinySource(image, this.$el.find( '.controls-move' )),
			color && this.$el.find( '.controls-move' ).append('<span class="vc_row_color control-style" style="background-color: ' + color + '" title="' + window.i18nLocale.row_background_color + '"></span>'),
			distortion_effect && this.$el.find( '.controls-move' ).append('<span class="vc_row_distortion control-style" title="' + unite_js_translation.distortion_effect + '"><i class="fa fa-diamond"></i></span>');
		},
		addElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			Shortcodes.create( { shortcode: this.getChildTag(), params: {}, parent_id: this.model.id } );
			this.setActiveLayoutButton();
			this.$el.removeClass( 'vc_collapsed-row' );
			$('body').removeClass('is-fullscreen');
		},
		getChildTag: function () {
			return 'vc_row_inner' === this.model.get( 'shortcode' ) ? 'vc_column_inner' : 'vc_column';
		},
		sortingSelector: "> [data-element_type=vc_column], > [data-element_type=vc_column_inner]",
		sortingSelectorCancel: ".vc-non-draggable-column",
		setSorting: function () {
			if ( !vc_user_access().partAccess( 'dragndrop' ) ) {
				return;
			}
			var _this = this;
			if ( 1 < this.$content.find( this.sortingSelector ).length ) {
				// This sortable enabled sorting between columns
				this.$content.removeClass( 'wpb-not-sortable' ).sortable( {
					forcePlaceholderSize: true,
					placeholder: "widgets-placeholder-column",
					tolerance: "pointer",
					// cursorAt: { left: 10, top : 20 },
					cursor: "move",
					//handle: '.controls',
					items: this.sortingSelector, //wpb_sortablee
					cancel: this.sortingSelectorCancel,
					distance: 0.5,
					start: function ( event, ui ) {
						$( '#wpbakery_content' ).addClass( 'vc_sorting-started' );
						ui.placeholder.width( ui.item.width() );
					},
					stop: function ( event, ui ) {
						$( '#wpbakery_content' ).removeClass( 'vc_sorting-started' );
					},
					update: function () {
						var $columns = $( _this.sortingSelector, _this.$content );
						$columns.each( function () {
							var model = $( this ).data( 'model' ),
								index = $( this ).index();
							model.set( 'order', index );
							if ( $columns.length - 1 > index ) {
								vc.storage.lock();
							}
							model.save();
						} );
					},
					over: function ( event, ui ) {
						console.log(ui)
						ui.placeholder.css( { maxWidth: ui.placeholder.parent().width() } );
						ui.placeholder.removeClass( 'vc_hidden-placeholder' );
					},
					beforeStop: function ( event, ui ) {
					}
				} );
			} else {
				if ( this.$content.hasClass( 'ui-sortable' ) ) {
					this.$content.sortable( 'destroy' );
				}
				this.$content.addClass( 'wpb-not-sortable' );
			}
		},
		validateCellsList: function ( cells ) {
			var return_cells = [],
				split = cells.replace( /\s/g, '' ).split( '+' ),
				b;
			var sum = _.reduce( _.map( split, function ( c ) {
				if ( c.match( /^(vc_)?span\d?$/ ) ) {
					var converted_c = vc_convert_column_span_size( c );
					if ( false === converted_c ) {
						return 1000;
					}
					b = converted_c.split( /\// );
					return_cells.push( b[ 0 ] + '' + b[ 1 ] );
					return 12 * parseInt( b[ 0 ], 10 ) / parseInt( b[ 1 ], 10 );
				} else if ( c.match( /^[1-9]|1[0-2]\/[1-9]|1[0-2]$/ ) ) {
					b = c.split( /\// );
					return_cells.push( b[ 0 ] + '' + b[ 1 ] );
					return 12 * parseInt( b[ 0 ], 10 ) / parseInt( b[ 1 ], 10 );
				}
				return 10000;

			} ), function ( num, memo ) {
				memo += num;
				return memo;
			}, 0 );
			if ( 12 !== sum ) {
				return false;
			}
			return return_cells.join( '_' );
		},
		setActiveLayoutButton: function ( column_layout ) {
			if ( !column_layout ) {
				column_layout = _.map( vc.shortcodes.where( { parent_id: this.model.get( 'id' ) } ),
					function ( model ) {
						var width = model.getParam( 'width' );
						return !width ? '11' : width.replace( /\//, '' );
					} ).join( '_' );
			}
			this.$el.find( '> .vc_controls .vc_active' ).removeClass( 'vc_active' );
			var $button = this.$el.find( '> .vc_ [data-cells-mask="' + vc_get_column_mask( column_layout ) + '"] [data-cells="' + column_layout + '"]' + ', > .vc_controls [data-cells-mask="' + vc_get_column_mask(
				column_layout ) + '"][data-cells="' + column_layout + '"]' );
			if ( $button.length ) {
				$button.addClass( 'vc_active' );
			} else {
				this.$el.find( '> .vc_controls [data-cells-mask=custom]' ).addClass( 'vc_active' );
			}
		},
		layoutEditor: function () {
			if ( _.isUndefined( vc.row_layout_editor ) ) {
				vc.row_layout_editor = new vc.RowLayoutUIPanelBackendEditor( { el: $( '#vc_ui-panel-row-layout' ) } );
			}
			return vc.row_layout_editor;
		},
		setColumns: function ( e ) {
			if ( _.isObject( e ) ) {
				e.preventDefault();
			}
			var $button = $( e.currentTarget );
			if ( 'custom' === $button.data( 'cells' ) ) {
				this.layoutEditor().render( this.model ).show();
			} else {
				if ( vc.is_mobile ) {
					var $parent = $button.parent();
					if ( !$parent.hasClass( 'vc_visible' ) ) {
						$parent.addClass( 'vc_visible' );
						$( document ).off( 'click.vcRowColumnsControl' ).on( 'click.vcRowColumnsControl',
							function ( e ) {
								$parent.removeClass( 'vc_visible' );
							} );
					}
				}
				if ( !$button.is( '.vc_active' ) ) {
					this.change_columns_layout = true;
					_.defer( function ( view, cells ) {
						view.convertRowColumns( cells );
					}, this, $button.data( 'cells' ) );
				}
			}
			this.$el.removeClass( 'vc_collapsed-row' );
		},
		sizeRows: function () {
			var max_height = 45;
			$( '> .wpb_vc_column, > .wpb_vc_column_inner', this.$content ).each( function () {
				var content_height = $( this ).find( '> .wpb_element_wrapper > .wpb_column_container' ).css( { minHeight: 0 } ).height();
				if ( content_height > max_height ) {
					max_height = content_height;
				}
			} ).each( function () {
				$( this ).find( '> .wpb_element_wrapper > .wpb_column_container' ).css( { minHeight: max_height } );
			} );
		},
		ready: function ( e ) {
			window.VcRowView.__super__.ready.call( this, e );
			return this;
		},
		checkIsEmpty: function () {
			window.VcRowView.__super__.checkIsEmpty.call( this );
			this.setSorting();
		},
		changedContent: function ( view ) {
			if ( this.change_columns_layout ) {
				return this;
			}
			this.setActiveLayoutButton();
		},
		moveElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
		},
		toggleElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			this.$el.toggleClass( 'vc_collapsed-row' );
		},
		openClosedRow: function ( e ) {
			this.$el.removeClass( 'vc_collapsed-row' );
		},
		remove: function () {
			if ( this.$content ) {
				if ( this.$content.data( 'uiSortable' ) ) {
					this.$content.sortable( 'destroy' );
				}
				if ( this.$content.data( 'uiDroppable' ) ) {
					this.$content.droppable( 'destroy' );
				}
			}
			delete vc.app.views[ this.model.id ];
			window.VcRowView.__super__.remove.call( this );
		}
	} );
	window.VcColumnView = vc.shortcode_view.extend( {
		events: {
			'click > .vc_controls [data-vc-control="delete"]': 'deleteShortcode',
			'click > .vc_controls [data-vc-control="add"]': 'addElement',
			'click > .vc_controls [data-vc-control="edit"]': 'editElement',
			'click > .vc_controls [data-vc-control="clone"]': 'clone',
			'click > .vc_controls [data-vc-control="copy"]': 'copy',
			'click > .vc_controls [data-vc-control="paste"]': 'paste',
			'click > .vc_controls [data-vc-control="toggle"]': 'toggleElement',
			'click > .wpb_element_wrapper > .vc_empty-container': 'addToEmpty'
		},
		current_column_width: false,
		initialize: function ( options ) {
			window.VcColumnView.__super__.initialize.call( this, options );
			_.bindAll( this, 'setDropable', 'dropButton' );
		},
		render: function () {
			window.VcColumnView.__super__.render.call( this );
			this.current_column_width = this.model.get( 'params' ).width || '1/1';
			this.$el.attr( 'data-width', this.current_column_width );
			this.setEmpty();
			return this;
		},
		toggleElement: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			this.$el.toggleClass( 'vc_collapsed-row' );
		},
		changeShortcodeParams: function ( model ) {
			window.VcColumnView.__super__.changeShortcodeParams.call( this, model );
			this.setColumnClasses();
			this.buildDesignHelpers();
		},
		designHelpersSelector: '> .vc_controls .column_add',
		buildDesignHelpers: function () {
			let distortion_effect, distortion;
			var matches, image, color,
				css = this.model.getParam( 'css' ),
				$column_toggle = this.$el.find( this.designHelpersSelector ).get( 0 );

			this.$el.find( '> .vc_controls .vc_column_color' ).remove();
			this.$el.find( '> .vc_controls .vc_column_image' ).remove();
			matches = css.match( /background\-image:\s*url\(([^\)]+)\)/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				image = matches[ 1 ];
			}
			matches = css.match( /background\-color:\s*([^\s\;]+)\b/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				color = matches[ 1 ];
			}
			matches = css.match( /background:\s*([^\s]+)\b\s*url\(([^\)]+)\)/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				color = matches[ 1 ];
				image = matches[ 2 ];
			}
			if ( image ) {
				$( '<span class="vc_column_image" style="background-image: url(' + image + ');" title="' + i18nLocale.column_background_image + '"></span>' )
					.insertBefore( $column_toggle );
			}
			if ( color ) {
				$( '<span class="vc_column_color" style="background-color: ' + color + '" title="' + i18nLocale.column_background_color + '"></span>' )
					.insertBefore( $column_toggle );
			}


		},
		setColumnClasses: function () {
			var offset = this.model.getParam( 'offset' ) || '',
				width = this.model.getParam( 'width' ) || '1/1',
				css_class_width = this.convertSize( width ), current_css_class_width;
			if ( this.current_offset_class ) {
				this.$el.removeClass( this.current_offset_class );
			}
			if ( this.current_column_width !== width ) {
				current_css_class_width = this.convertSize( this.current_column_width );
				this.$el
					.attr( 'data-width', width )
					.removeClass( current_css_class_width )
					.addClass( css_class_width );
				this.current_column_width = width;
			}
			if ( offset.match( /vc_col\-sm\-\d+/ ) ) {
				this.$el.removeClass( css_class_width );
			}
			if ( !_.isEmpty( offset ) ) {
				this.$el.addClass( offset );
			}
			this.current_offset_class = offset;
		},
		addToEmpty: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			if ( $( e.target ).hasClass( 'vc_empty-container' ) ) {
				this.addElement( e );
			}
		},
		/**
		 * @deprecated 4.12+
		 * @returns {VcColumnView}
		 */
		setDropable: function () {
			this.$content.droppable( {
				greedy: true,
				accept: ('vc_column_inner' === this.model.get( 'shortcode' ) ? '.dropable_el' : ".dropable_el,.dropable_row"),
				hoverClass: "wpb_ui-state-active",
				drop: this.dropButton
			} );
			return this;
		},
		/**
		 * @deprecated 4.12+
		 * @param event
		 * @param ui
		 */
		dropButton: function ( event, ui ) {
			if ( ui.draggable.is( '#wpb-add-new-element' ) ) {
				vc.add_element_block_view( { model: { position_to_add: 'end' } } ).show( this );
			} else if ( ui.draggable.is( '#wpb-add-new-row' ) ) {
				this.createRow();
			}
		},
		setEmpty: function () {
			this.$el.addClass( 'vc_empty-column' );
			if ( 'edit' !== vc_user_access().getState( 'shortcodes' ) ) {
				this.$content.addClass( 'vc_empty-container' );
			}
		},
		unsetEmpty: function () {
			this.$el.removeClass( 'vc_empty-column' );
			this.$content.removeClass( 'vc_empty-container' );
		},
		checkIsEmpty: function () {
			if ( Shortcodes.where( { parent_id: this.model.id } ).length ) {
				this.unsetEmpty();
			} else {
				this.setEmpty();
			}
			window.VcColumnView.__super__.checkIsEmpty.call( this );
		},
		/**
		 * Create row
		 */
		createRow: function () {
			var row_params, column_params, row;

			row_params = {};
			column_params = { width: '1/1' };

			row = Shortcodes.create( {
				shortcode: 'vc_row_inner',
				params: row_params,
				parent_id: this.model.id
			} );

			Shortcodes.create( {
				shortcode: 'vc_column_inner',
				params: column_params,
				parent_id: row.id
			} );

			return row;
		},
		convertSize: function ( width ) {
			var prefix = 'vc_col-sm-',
				numbers = width ? width.split( '/' ) : [
					1,
					1
				],
				range = _.range( 1, 13 ),
				num = !_.isUndefined( numbers[ 0 ] ) && 0 <= _.indexOf( range,
					parseInt( numbers[ 0 ], 10 ) ) ? parseInt( numbers[ 0 ], 10 ) : false,
				dev = !_.isUndefined( numbers[ 1 ] ) && 0 <= _.indexOf( range,
					parseInt( numbers[ 1 ], 10 ) ) ? parseInt( numbers[ 1 ], 10 ) : false;
			if ( false !== num && false !== dev ) {
				return prefix + (12 * num / dev);
			}
			return prefix + '12';
		},
		deleteShortcode: function ( e ) {
			var parent_id = this.model.get( 'parent_id' ),
				parent;
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var answer = confirm( window.i18nLocale.press_ok_to_delete_section );
			if ( true !== answer ) {
				return false;
			}
			this.model.destroy();
			if ( parent_id && !vc.shortcodes.where( { parent_id: parent_id } ).length ) {
				parent = vc.shortcodes.get( parent_id );
				if ( !_.contains( [
					'vc_column',
					'vc_column_inner'
				], parent.get( 'shortcode' ) ) ) {
					parent.destroy();
				}
			} else if ( parent_id ) {
				parent = vc.shortcodes.get( parent_id );
				if ( parent && parent.view && parent.view.setActiveLayoutButton ) {
					parent.view.setActiveLayoutButton();
				}
			}
		},
		remove: function () {
			if ( this.$content && this.$content.data( 'uiSortable' ) ) {
				this.$content.sortable( 'destroy' );
			}
			if ( this.$content && this.$content.data( 'uiDroppable' ) ) {
				this.$content.droppable( 'destroy' );
			}
			delete vc.app.views[ this.model.id ];
			window.VcColumnView.__super__.remove.call( this );
		}
	} );

	window.VcSectionView = VcColumnView.extend( {
		designHelpersSelector: '> .vc_controls-row .vc_column-edit',
		setColumnClasses: function () {
			var disable = this.model.getParam( 'disable_element' );
			var disableClass = 'vc_hidden-xs vc_hidden-sm  vc_hidden-md vc_hidden-lg';
			if ( this.disable_element_class ) {
				this.$el.removeClass( this.disable_element_class );
			}
			if ( !_.isEmpty( disable ) ) {
				this.$el.addClass( disableClass );
				this.disable_element_class = disableClass;
			}
		},
		buildDesignHelpers: function () {
			var css, $elementToPrepend, image, color, elId, rowName, matches, distortion, distortion_effect;

			css = this.model.getParam( 'css' );
			$elementToPrepend = this.$el.find( this.designHelpersSelector );

			this.$el.find( '> .vc_controls-row .vc_row_color' ).remove();
			this.$el.find( '> .vc_controls-row .vc_row_image' ).remove();

			matches = css.match( /background\-image:\s*url\(([^\)]+)\)/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				image = matches[ 1 ];
			}
			matches = css.match( /background\-color:\s*([^\s\;]+)\b/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				color = matches[ 1 ];
			}
			matches = css.match( /background:\s*([^\s]+)\b\s*url\(([^\)]+)\)/ );
			if ( matches && !_.isUndefined( matches[ 1 ] ) ) {
				color = matches[ 1 ];
				image = matches[ 2 ];
			}

			// TODO: refactor this to separate methods and maybe vc.events
			elId = this.model.getParam( 'el_id' );
			this.$el.find( '> .vc_controls-row .vc_row-hash-id' ).remove();
			if ( !_.isEmpty( elId ) ) {
				$( '<span class="vc_row-hash-id"></span>' )
					.text( '#' + elId )
					.insertAfter( this.$el.find( '.control-main .column_add' ) );
			}

			if ( image ) {
				this.$el.find( '.controls-move.section' ).append( '<span class="vc_row_image control-style" style="background-image: url(' + image + ');" title="' + window.i18nLocale.row_background_image + '"></span>' );
			}
			if ( color ) {
				this.$el.find( '.controls-move.section' ).append( '<span class="vc_row_color control-style" style="background-color: ' + color + '" title="' + window.i18nLocale.row_background_color + '"></span>' );
			}
			distortion = this.model.getParam( "distortion" );
			distortion === 'on' && ( distortion_effect = '#a55eea' );
			distortion_effect && this.$el.find( '.controls-move.section' ).append('<span class="vc_row_distortion control-style" title="' + unite_js_translation.distortion_effect + '"><i class="fa fa-diamond"></i></span>');
			rowName = this.model.getParam("el_name"),
				this.$el.find("> .vc_controls .vc_row-name-id").remove(), _.isEmpty(rowName) || $('<span class="vc_row-name-id"></span>').text(rowName).insertAfter(this.$el.find( '.control-main .column_add' ));
		},
		checkIsEmpty: function () {
			window.VcSectionView.__super__.checkIsEmpty.call( this );
			this.setSorting();
		},
		setSorting: function () {
			if ( !vc_user_access().partAccess( 'dragndrop' ) ) {
				return;
			}
			var _this = this;

			this.$content.sortable( {
					forcePlaceholderSize: true,
					placeholder: "widgets-placeholder",
					connectWith: ".wpb_main_sortable,.wpb_vc_section .vc_section_container",
					// cursorAt: { left: 10, top : 20 },
					cursor: "move",
					//handle: '.controls',
					items: "> .wpb_vc_row", //wpb_sortablee
					handle: '.vc_column-move',
					cancel: '.vc-non-draggable-row',
					distance: 0.5,
					scroll: true,
					scrollSensitivity: 70,
					tolerance: 'intersect',
					update: function ( event, ui ) {
						var tag = ui.item.data( 'element_type' ),
							parent_tag = ui.item.parent().closest( '[data-element_type]' ).data( 'element_type' );

						if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
							return;
						}

						var $elements = $( "> div.wpb_sortable,> div.vc-non-draggable", _this.$content );
						$elements.each( function () {
							var model = $( this ).data( 'model' ),
								index = $( this ).index();
							model.set( 'order', index );
							if ( $elements.length - 1 > index ) {
								vc.storage.lock();
							}
							if ( !_.isNull( ui.sender ) ) {
								var $current_container = ui.item.parent().closest( '[data-model-id]' ),
									parent = $current_container.data( 'model' );
								var old_parent_id = model.get( 'parent_id' );
								vc.storage.lock();
								model.save( { parent_id: parent.id } );
								if ( old_parent_id ) {
									vc.app.views[ old_parent_id ].checkIsEmpty();
								}
								vc.app.views[ parent.id ].checkIsEmpty();
							}
							model.save();
						} );

					},
					stop: function ( event, ui ) {
						$( '#wpbakery_content' ).removeClass( 'vc_sorting-started' );
						$( '.dragging_in' ).removeClass( 'dragging_in' );
						var tag = ui.item.data( 'element_type' ),
							parent_tag = ui.item.parent().closest( '[data-element_type]' ).data( 'element_type' );

						if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
							$( this ).sortable( 'cancel' );
						}
						if( tag === 'vc_row' && parent_tag !== 'vc_section' ) {
							$( this ).sortable( 'cancel' );
						}
						$( '.vc_sorting-empty-container' ).removeClass( 'vc_sorting-empty-container' );
					},
					change: function (event, ui) {
						var tag = ui.item.data( 'element_type' );
						if( tag === 'vc_row' ) {
							if( !ui.placeholder.parent('.vc_section_container').length ) {
								ui.placeholder.addClass( 'vc_hidden-placeholder' );
							} else {
								ui.placeholder.removeClass( 'vc_hidden-placeholder' );
							}
						}
					},
					over: function ( event, ui ) {
						var tag = ui.item.data( 'element_type' ),
							parent_tag = ui.placeholder.closest( '[data-element_type]' ).data( 'element_type' ) || '',
							allowed_container_element = !_.isUndefined( vc.map[ parent_tag ].allowed_container_element ) ? vc.map[ parent_tag ].allowed_container_element : true;

						if ( !vc.check_relevance( parent_tag, tag ) || parent_tag == tag ) {
							ui.placeholder.addClass( 'vc_hidden-placeholder' );
							return false;
						}
						var is_container = _.isObject( vc.map[ tag ] ) && ((_.isBoolean( vc.map[ tag ].is_container ) && true === vc.map[ tag ].is_container) || !_.isEmpty(
							vc.map[ tag ].as_parent ));
						if ( is_container && !(true === allowed_container_element || allowed_container_element === ui.item.data(
							'element_type' ).replace( /_inner$/,
							'' )) ) {
							ui.placeholder.addClass( 'vc_hidden-placeholder' );
							return false;
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
						if ( !_.isNull( ui.sender ) && ui.sender.length && !ui.sender.find( '> [data-element_type]:not(.ui-sortable-helper):visible' ).length ) {
							ui.sender.addClass( 'vc_sorting-empty-container' );
						}
					}
				}
			);
		}
	} );
	/**
	 * @deprecated This is Old Accordion under deprecated tab
	 */
	window.VcAccordionView = vc.shortcode_view.extend( {
		adding_new_tab: false,
		events: {
			'click .add_tab': 'addTab',
			'click > .vc_controls .column_delete, > .vc_controls .vc_control-btn-delete': 'deleteShortcode',
			'click > .vc_controls .column_edit, > .vc_controls .vc_control-btn-edit': 'editElement',
			'click > .vc_controls .column_clone,> .vc_controls .vc_control-btn-clone': 'clone'
		},
		render: function () {
			window.VcAccordionView.__super__.render.call( this );
			// check user role to add controls
			if ( !vc_user_access().shortcodeAll( 'vc_accordion_tab' ) ) {
				this.$el.find( '.tab_controls' ).hide();
				return this;
			}
			if ( vc_user_access().partAccess( 'dragndrop' ) ) {
				this.$content.sortable( {
					axis: "y",
					handle: "h3",
					stop: function ( event, ui ) {
						// IE doesn't register the blur when sorting
						// so trigger focusout handlers to remove .ui-state-focus
						ui.item.prev().triggerHandler( "focusout" );
						$( this ).find( '> .wpb_sortable' ).each( function () {
							var shortcode = $( this ).data( 'model' );
							shortcode.save( { 'order': $( this ).index() } ); // Optimize
						} );
					}
				} );
			}
			return this;
		},
		changeShortcodeParams: function ( model ) {
			var params, collapsible;

			window.VcAccordionView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			collapsible = _.isString( params.collapsible ) && 'yes' === params.collapsible ? true : false;
			if ( this.$content.hasClass( 'ui-accordion' ) ) {
				this.$content.accordion( "option", "collapsible", collapsible );
			}
		},
		changedContent: function ( view ) {
			if ( this.$content.hasClass( 'ui-accordion' ) ) {
				this.$content.accordion( 'destroy' );
			}
			var collapsible = _.isString( this.model.get( 'params' ).collapsible ) && 'yes' === this.model.get( 'params' ).collapsible ? true : false;
			this.$content.accordion( {
				header: "h3",
				navigation: false,
				autoHeight: true,
				heightStyle: "content",
				collapsible: collapsible,
				active: false === this.adding_new_tab && true !== view.model.get( 'cloned' ) ? 0 : view.$el.index()
			} );
			this.adding_new_tab = false;
		},
		addTab: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			// check user role to add controls
			if ( !vc_user_access().shortcodeAll( 'vc_accordion_tab' ) ) {
				return false;
			}
			this.adding_new_tab = true;
			vc.shortcodes.create( {
				shortcode: 'vc_accordion_tab',
				params: { title: window.i18nLocale.section },
				parent_id: this.model.id
			} );
		},
		_loadDefaults: function () {
			window.VcAccordionView.__super__._loadDefaults.call( this );
		}
	} );

	window.VcAccordionTabView = window.VcColumnView.extend( {
		events: {
			'click > [data-element_type] > .vc_controls .vc_control-btn-delete': 'deleteShortcode',
			'click > [data-element_type] >  .vc_controls .vc_control-btn-prepend': 'addElement',
			'click > [data-element_type] >  .vc_controls .vc_control-btn-edit': 'editElement',
			'click > [data-element_type] > .vc_controls .vc_control-btn-clone': 'clone',
			'click > [data-element_type] > .wpb_element_wrapper > .vc_empty-container': 'addToEmpty'
		},
		setContent: function () {
			this.$content = this.$el.find( '> [data-element_type] > .wpb_element_wrapper > .vc_container_for_children' );
		},
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcAccordionTabView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			if ( _.isObject( params ) && _.isString( params.title ) ) {
				this.$el.find( '> h3 .tab-label' ).text( params.title );
			}
		},
		setEmpty: function () {
			$( '> [data-element_type]', this.$el ).addClass( 'vc_empty-column' );
			if ( 'edit' !== vc_user_access().getState( 'shortcodes' ) ) {
				this.$content.addClass( 'vc_empty-container' );
			}
		},
		unsetEmpty: function () {
			$( '> [data-element_type]', this.$el ).removeClass( 'vc_empty-column' );
			this.$content.removeClass( 'vc_empty-container' );
		}
	} );
	/**
	 * @deprecated use VcMessageView_Backend for it
	 */
	window.VcMessageView = vc.shortcode_view.extend( {
		changeShortcodeParams: function ( model ) {
			var params, $wrapper;

			window.VcMessageView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			$wrapper = this.$el.find( '> .wpb_element_wrapper' ).removeClass( _.values( this.params.color.value ).join(
				' ' ) );
			if ( _.isObject( params ) && _.isString( params.color ) ) {
				$wrapper.addClass( params.color );
			}
		}
	} );
	window.VcMessageView_Backend = vc.shortcode_view.extend( {
		changeShortcodeParams: function ( model ) {
			var params,
				$wrapper,
				classes,
				iconClass,
				color;

			window.VcMessageView_Backend.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			$wrapper = this.$el.find( '> .wpb_element_wrapper' );
			classes = [ "vc_message_box" ];
			// set defaults
			if ( _.isUndefined( params.message_box_style ) ) {
				params.message_box_style = 'classic';
			}
			if ( _.isUndefined( params.message_box_color ) ) {
				params.message_box_color = 'alert-info';
			}

			if ( params.style ) {
				if ( '3d' === params.style ) {
					params.message_box_style = '3d';
					params.style = 'rounded';
				} else if ( 'outlined' === params.style ) {
					params.message_box_style = 'outline';
					params.style = 'rounded';
				} else if ( 'square_outlined' === params.style ) {
					params.message_box_style = 'outline';
					params.style = 'square';
				}
			} else {
				params.style = 'rounded'; // default
			}

			classes.push( "vc_message_box-" + params.style );

			if ( params.message_box_style ) {
				classes.push( "vc_message_box-" + params.message_box_style );
			}

			$wrapper.attr( 'class', 'wpb_element_wrapper' );
			$wrapper.find( '.vc_message_box-icon' ).remove();
			iconClass = !_.isUndefined( params[ 'icon_' + params.icon_type ] ) ? params[ 'icon_' + params.icon_type ] : 'fa fa-info-circle';
			color = params.color;
			switch ( params.color ) {
				case 'info':
					iconClass = 'fa fa-info-circle';
					break;
				case 'alert-info':
					iconClass = 'vc_pixel_icon vc_pixel_icon-info';
					break;
				case 'success':
					iconClass = 'fa fa-check';
					break;
				case 'alert-success':
					iconClass = 'vc_pixel_icon vc_pixel_icon-tick';
					break;
				case 'warning':
					iconClass = 'fa fa-exclamation-triangle';
					break;
				case 'alert-warning':
					iconClass = 'vc_pixel_icon vc_pixel_icon-alert';
					break;
				case 'danger':
					iconClass = 'fa fa-times';
					break;
				case 'alert-danger':
					iconClass = 'vc_pixel_icon vc_pixel_icon-explanation';
					break;
				case 'alert-custom':
				default:
					color = params.message_box_color;
					break;
			}
			classes.push( "vc_color-" + color );

			$wrapper.addClass( classes.join( ' ' ) );

			$wrapper.prepend( $( '<div class="vc_message_box-icon"><i class="' + iconClass + '"></i></div>' ) );
		}
	} );
	window.VcTextSeparatorView = vc.shortcode_view.extend( {
		changeShortcodeParams: function ( model ) {
			var params;
			var icon;

			window.VcTextSeparatorView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			var $find = this.$el.find( '> .wpb_element_wrapper' );
			if ( _.isObject( params ) && _.isString( params.title_align ) ) {
				$find.removeClass( _.values( this.params.title_align.value ).join( ' ' ) ).addClass( params.title_align );
			}
			if ( _.isObject( params ) && _.isString( params.add_icon ) && 'true' === params.add_icon ) {
				icon = $( '<i class="' + params[ 'i_icon_' + params.i_type ] + '" ></i>' );
				icon.prependTo( $find.find( '[name=title]' ) );
				icon.after( ' ' );
			}
		}
	} );
	/**
	 * @deprecated 4.5
	 */
	window.VcCallToActionView = vc.shortcode_view.extend( {
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcCallToActionView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			if ( _.isObject( params ) && _.isString( params.position ) ) {
				this.$el.find( '> .wpb_element_wrapper' ).removeClass( _.values( this.params.position.value ).join( ' ' ) ).addClass(
					params.position );
			}
		}
	} );

	/**
	 * @since 4.5 For new Call to Action shortcode (new to avoid BC problems).
	 */
	window.VcCallToActionView3 = vc.shortcode_view.extend( {
		changeShortcodeParams: function ( model ) {
			var params, value, $adminLabel;

			window.VcCallToActionView3.__super__.changeShortcodeParams.call( this, model );
			params = _.extend( { add_icon: '', i_type: '' }, model.get( 'params' ) );
			$adminLabel = this.$el.find( '.vc_admin_label.admin_label_i_type' );
			if ( _.isEmpty( params.add_icon ) ) {
				$adminLabel.addClass( 'hidden-label' ).hide();
			} else if ( !_.isEmpty( params.i_type ) && !_.isEmpty( params[ 'i_icon_' + params.i_type ] ) ) {
				value = vc_toTitleCase( params.i_type ) + ' - ' + '<i class="' + params[ 'i_icon_' + params.i_type ] + '"></i>';
				$adminLabel.html( '<label>' + $adminLabel.find( 'label' ).text() + '</label>: ' + value );
				$adminLabel.show().removeClass( 'hidden-label' );
			}
		}
	} );

	window.VcToggleView = vc.shortcode_view.extend( {
		events: function () {
			return _.extend( {
				'click .vc_toggle_title': 'toggle',
				'click .toggle_title': 'toggle' // @deprecated 4.4
			}, window.VcToggleView.__super__.events );
		},
		toggle: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			$( e.currentTarget ).toggleClass( 'vc_toggle_title_active' );
			$( '.vc_toggle_content', this.$el ).slideToggle( 500 );
		},
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcToggleView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			if ( _.isObject( params ) && _.isString( params.open ) && 'true' === params.open ) {
				$( '.vc_toggle_title', this.$el ).addClass( 'vc_toggle_title_active' ).next().show();
			}
		}
	} );

	window.VcButtonView = vc.shortcode_view.extend( {
		events: function () {
			return _.extend( {
				'click button': 'buttonClick'
			}, window.VcToggleView.__super__.events );
		},
		buttonClick: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
		},
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcButtonView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			if ( _.isObject( params ) ) {
				var el_class;

				el_class = params.color + ' ' + params.size + ' ' + params.icon;
				this.$el.find( '.wpb_element_wrapper' ).removeClass( el_class );
				this.$el.find( 'button.title' ).attr( { "class": "title textfield wpb_button " + el_class } );
				if ( 'none' !== params.icon && 0 === this.$el.find( 'button i.icon' ).length ) {
					this.$el.find( 'button.title' ).append( '<i class="icon"></i>' );
				} else {
					this.$el.find( 'button.title i.icon' ).remove();
				}
			}
		}
	} );
	window.VcButton2View = vc.shortcode_view.extend( {
		events: function () {
			return _.extend( {
				'click button': 'buttonClick'
			}, window.VcToggleView.__super__.events );
		},
		buttonClick: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
		},
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcButton2View.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			if ( _.isObject( params ) ) {
				var el_class;

				el_class = (params.color ? 'vc_btn_' + params.color : '') + ' ' + (params.color ? 'vc_btn-' + params.color : '') + ' ' + (params.size ? 'vc_btn-' + params.size : '') + ' ' + (params.size ? 'vc_btn_' + params.size : '') + ' ' + (params.style ? 'vc_btn_' + params.style : '');
				this.$el.find( '.wpb_element_wrapper' ).removeClass( el_class );
				this.$el.find( 'button.title' ).attr( { "class": "title textfield vc_btn  " + el_class } );
			}
		}
	} );

	window.VcButton3View = vc.shortcode_view.extend( {
		buttonTemplate: false,
		buttonTemplateCompiled: false,
		$wrapper: false,
		events: function () {
			return _.extend( {
				'click .vc_btn3': 'buttonClick'
			}, window.VcToggleView.__super__.events );
		},
		buttonClick: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
		},
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcButton3View.__super__.changeShortcodeParams.call( this, model );
			params = _.extend( {}, model.get( 'params' ) );
			if ( !this.buttonTemplate ) {
				this.buttonTemplate = this.$el.find( '.vc_btn3-container' ).html();
				this.buttonTemplateCompiled = vc.template( this.buttonTemplate, vc.templateOptions.custom );
			}
			if ( !this.$wrapper ) {
				this.$wrapper = this.$el.find( '.wpb_element_wrapper' );
			}
			if ( _.isObject( params ) ) {
				if ( params.title && _.isEmpty( params.title.trim() ) ) {
					params.title = '<span class="vc_btn3-placeholder">&nbsp;</span>';
				}
				if ( 'custom' === params.style ) {
					params.color = undefined;
					if ( _.isEmpty( params.custom_background ) && _.isEmpty( params.custom_text ) ) {
						params.color = 'grey';
					}
				} else if ( 'outline-custom' === params.style ) {
					params.color = undefined;
					if ( _.isEmpty( params.outline_custom_color ) && _.isEmpty( params.outline_custom_hover_background ) && _.isEmpty(
						params.outline_custom_hover_text ) ) {
						params.style = 'outline';
						params.color = 'grey';
					}
				}

				var $element = $( this.buttonTemplateCompiled( { params: params } ) );
				if ( 'custom' === params.style ) {
					if ( 'undefined' !== params.custom_background ) {
						$element.css( 'background-color', params.custom_background );
					}
					if ( 'undefined' !== params.custom_text ) {
						$element.css( 'color', params.custom_text );
					}
				} else if ( 'outline-custom' === params.style ) {
					$element
						.css( {
							'background-color': 'transparent',
							'border-color': params.outline_custom_color,
							'color': params.outline_custom_color
						} )
						.hover(
							function () {
								$( this ).css( {
									'background-color': params.outline_custom_hover_background,
									'border-color': params.outline_custom_hover_background,
									'color': params.outline_custom_hover_text
								} );
							}, function () {
								$( this ).css( {
									'background-color': 'transparent',
									'border-color': params.outline_custom_color,
									'color': params.outline_custom_color
								} );
							}
						);
				}

				this.$wrapper.find( '.vc_btn3-container' ).html( $element );
			}
		}
	} );

	window.VcTabsView = vc.shortcode_view.extend( {
		new_tab_adding: false,
		events: {
			'click .add_tab': 'addTab',
			'click > .vc_controls .vc_control-btn-delete': 'deleteShortcode',
			'click > .vc_controls .vc_control-btn-edit': 'editElement',
			'click > .vc_controls .vc_control-btn-clone': 'clone'
		},
		initialize: function ( params ) {
			window.VcTabsView.__super__.initialize.call( this, params );
			_.bindAll( this, 'stopSorting' );
		},
		render: function () {
			window.VcTabsView.__super__.render.call( this );
			this.$tabs = this.$el.find( '.wpb_tabs_holder' );
			this.createAddTabButton();
			return this;
		},
		ready: function ( e ) {
			window.VcTabsView.__super__.ready.call( this, e );
		},
		createAddTabButton: function () {
			var new_tab_button_id = (Date.now() + '-' + Math.floor( Math.random() * 11 ));
			this.$tabs.append( '<div id="new-tab-' + new_tab_button_id + '" class="new_element_button"></div>' );
			this.$add_button = $( '<li class="add_tab_block"><a href="#new-tab-' + new_tab_button_id + '" class="add_tab" title="' + window.i18nLocale.add_tab + '"></a></li>' ).appendTo(
				this.$tabs.find( ".tabs_controls" ) );
			if ( !vc_user_access().shortcodeAll( 'vc_tab' ) ) {
				this.$add_button.hide();
			}
		},
		addTab: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			// check user role to add controls
			if ( !vc_user_access().shortcodeAll( 'vc_tab' ) ) {
				return false;
			}
			this.new_tab_adding = true;
			var tab_title = window.i18nLocale.tab,
				tabs_count = this.$tabs.find( '[data-element_type=vc_tab]' ).length,
				tab_id = (Date.now() + '-' + tabs_count + '-' + Math.floor( Math.random() * 11 ));
			vc.shortcodes.create( {
				shortcode: 'vc_tab',
				params: { title: tab_title, tab_id: tab_id },
				parent_id: this.model.id
			} );
			return false;
		},
		stopSorting: function ( event, ui ) {
			var shortcode;
			this.$tabs.find( 'ul.tabs_controls li:not(.add_tab_block)' ).each( function ( index ) {
				var href = $( this ).find( 'a' ).attr( 'href' ).replace( "#", "" );
				shortcode = vc.shortcodes.get( $( '[id=' + $( this ).attr( 'aria-controls' ) + ']' ).data( 'model-id' ) );
				vc.storage.lock();
				shortcode.save( { 'order': $( this ).index() } ); // Optimize
			} );
			if ( shortcode ) {
				shortcode.save();
			}
		},
		changedContent: function ( view ) {
			var params = view.model.get( 'params' );
			if ( !this.$tabs.hasClass( 'ui-tabs' ) ) {
				this.$tabs.tabs( {
					select: function ( event, ui ) {
						return !$( ui.tab ).hasClass( 'add_tab' );
					}
				} );
				this.$tabs.find( ".ui-tabs-nav" ).prependTo( this.$tabs );
				// check user role to add controls
				if ( vc_user_access().shortcodeAll( 'vc_tab' ) ) {
					this.$tabs.find( ".ui-tabs-nav" ).sortable( {
						axis: ('vc_tour' === this.$tabs.closest( '[data-element_type]' ).data( 'element_type' ) ? 'y' : 'x'),
						update: this.stopSorting,
						items: "> li:not(.add_tab_block)"
					} );
				}
			}
			if ( true === view.model.get( 'cloned' ) ) {
				var cloned_from = view.model.get( 'cloned_from' ),
					$tab_controls = $( '.tabs_controls > .add_tab_block', this.$content ),
					$new_tab = $( "<li><a href='#tab-" + params.tab_id + "'>" + params.title + "</a></li>" ).insertBefore(
						$tab_controls );
				this.$tabs.tabs( 'refresh' );
				this.$tabs.tabs( "option", 'active', $new_tab.index() );
			} else {
				$( "<li><a href='#tab-" + params.tab_id + "'>" + params.title + "</a></li>" )
					.insertBefore( this.$add_button );
				this.$tabs.tabs( 'refresh' );
				this.$tabs.tabs( "option",
					"active",
					this.new_tab_adding ? $( '.ui-tabs-nav li', this.$content ).length - 2 : 0 );

			}
			this.new_tab_adding = false;
		},
		cloneModel: function ( model, parent_id, save_order ) {
			var new_order, model_clone, params, tag;

			new_order = _.isBoolean( save_order ) && true === save_order ? model.get( 'order' ) : parseFloat( model.get(
				'order' ) ) + vc.clone_index;
			params = _.extend( {}, model.get( 'params' ) );
			tag = model.get( 'shortcode' );

			if ( 'vc_tab' === tag ) {
				_.extend( params,
					{
						tab_id: Date.now() + '-' + this.$tabs.find( '[data-element-type=vc_tab]' ).length + '-' + Math.floor(
							Math.random() * 11 )
					} );
			}

			model_clone = Shortcodes.create( {
				shortcode: tag,
				id: vc_guid(),
				parent_id: parent_id,
				order: new_order,
				cloned: ('vc_tab' !== tag), // TODO: review this by @say2me
				cloned_from: model.toJSON(),
				params: params
			} );

			_.each( Shortcodes.where( { parent_id: model.id } ), function ( shortcode ) {
				this.cloneModel( shortcode, model_clone.get( 'id' ), true );
			}, this );
			return model_clone;
		}
	} );
	// TODO: window.VcColumnView
	window.VcTabView = window.VcColumnView.extend( {
		events: {
			'click > .vc_controls .vc_control-btn-delete': 'deleteShortcode',
			'click > .vc_controls .vc_control-btn-prepend': 'addElement',
			'click > .vc_controls .vc_control-btn-edit': 'editElement',
			'click > .vc_controls .vc_control-btn-clone': 'clone',
			'click > .wpb_element_wrapper > .vc_empty-container': 'addToEmpty'
		},
		render: function () {
			var params = this.model.get( 'params' );
			window.VcTabView.__super__.render.call( this );
			/**
			 * @deprecated 4.4.3
			 * @see composer-atts.js vc.atts.tab_id.addShortcode
			 */
			if ( !params.tab_id/* || params.tab_id.indexOf('def') != -1*/ ) {
				params.tab_id = (Date.now() + '-' + Math.floor( Math.random() * 11 ));
				this.model.save( 'params', params );
			}
			this.id = 'tab-' + params.tab_id;
			this.$el.attr( 'id', this.id );
			return this;
		},
		ready: function ( e ) {
			window.VcTabView.__super__.ready.call( this, e );
			this.$tabs = this.$el.closest( '.wpb_tabs_holder' );
			var params = this.model.get( 'params' );
			return this;
		},
		changeShortcodeParams: function ( model ) {
			var params;

			window.VcTabView.__super__.changeShortcodeParams.call( this, model );
			params = model.get( 'params' );
			if ( _.isObject( params ) && _.isString( params.title ) && _.isString( params.tab_id ) ) {
				$( '.ui-tabs-nav [href="#tab-' + params.tab_id + '"]' ).text( params.title );
			}
		},
		deleteShortcode: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			var answer = confirm( window.i18nLocale.press_ok_to_delete_section ),
				parent_id = this.model.get( 'parent_id' );
			if ( true !== answer ) {
				return false;
			}
			this.model.destroy();
			if ( !vc.shortcodes.where( { parent_id: parent_id } ).length ) {
				var parent = vc.shortcodes.get( parent_id );
				parent.destroy();
				return false;
			}
			var params = this.model.get( 'params' ),
				current_tab_index = $( '[href="#tab-' + params.tab_id + '"]', this.$tabs ).parent().index();
			$( '[href="#tab-' + params.tab_id + '"]' ).parent().remove();
			var tab_length = this.$tabs.find( '.ui-tabs-nav li:not(.add_tab_block)' ).length;
			if ( 0 < tab_length ) {
				this.$tabs.tabs( 'refresh' );
			}
			if ( current_tab_index < tab_length ) {
				this.$tabs.tabs( "option", "active", current_tab_index );
			} else if ( 0 < tab_length ) {
				this.$tabs.tabs( "option", "active", tab_length - 1 );
			}

		},
		cloneModel: function ( model, parent_id, save_order ) {
			var new_order,
				model_clone,
				params,
				tag;

			new_order = _.isBoolean( save_order ) && true === save_order ? model.get( 'order' ) : parseFloat( model.get(
				'order' ) ) + vc.clone_index;
			params = _.extend( {}, model.get( 'params' ) );
			tag = model.get( 'shortcode' );

			if ( 'vc_tab' === tag ) {
				_.extend( params,
					{
						tab_id: Date.now() + '-' + this.$tabs.find( '[data-element_type=vc_tab]' ).length + '-' + Math.floor(
							Math.random() * 11 )
					} );
			}

			model_clone = Shortcodes.create( {
				shortcode: tag,
				parent_id: parent_id,
				order: new_order,
				cloned: true,
				cloned_from: model.toJSON(),
				params: params
			} );

			_.each( Shortcodes.where( { parent_id: model.id } ), function ( shortcode ) {
				this.cloneModel( shortcode, model_clone.get( 'id' ), true );
			}, this );
			return model_clone;
		}
	} );

	/**
	 * Shortcode vc_icon
	 * Need to make admin label for to show icon "preview"
	 * @since 4.4
	 */
	window.VcIconElementView_Backend = vc.shortcode_view.extend( {
		changeShortcodeParams: function ( model ) {
			var tag,
				params,
				settings,
				view;

			tag = model.get( 'shortcode' );

			params = model.get( 'params' );
			settings = vc.map[ tag ];

			if ( _.isArray( settings.params ) ) {
				_.each( settings.params, function ( param_settings ) {
					if ( !_.isUndefined( param_settings.admin_label ) && param_settings.admin_label ) {
						var name,
							value,
							$wrapper,
							$admin_label;

						name = param_settings.param_name;
						value = params[ name ];
						$wrapper = this.$el.find( '> .wpb_element_wrapper' );
						$admin_label = $wrapper.children( '.admin_label_' + name );

						if ( $admin_label.length ) {
							if ( '' === value || _.isUndefined( value ) ) {
								$admin_label.hide().addClass( 'hidden-label' );
							} else {
								if ( 'type' === name ) {
									// Get icon class to display
									if ( !_.isUndefined( params[ "icon_" + value ] ) ) {
										value = vc_toTitleCase( value ) + ' - ' + "<i class='" + params[ "icon_" + value ] + "'></i>";
									}
								}
								$admin_label.html( '<label>' + $admin_label.find( 'label' ).text() + '</label>: ' + value );
								$admin_label.show().removeClass( 'hidden-label' );
							}
						}
					}
				}, this );
			}
			view = vc.app.views[ this.model.get( 'parent_id' ) ];
			if ( false !== model.get( 'parent_id' ) && _.isObject( view ) ) {
				view.checkIsEmpty();
			}
		}
	} );

	/**
	 * Note!! It is interface and must not be used as is
	 * Must be extended
	 * @since 4.5
	 */
	window.VcBackendTtaViewInterface = vc.shortcode_view.extend( {
		sortableSelector: false,
		$sortable: false,
		$navigation: false,
		defaultSectionTitle: window.i18nLocale.tab,
		// sortablePlaceholderClass: 'vc_placeholder-tta',
		sortableUpdateModelIdSelector: 'data-vc-target-model-id',
		activeClass: 'vc_active',
		sortingPlaceholder: "vc_placeholder",
		events: {
			'click > .vc_controls .vc_control-btn-delete': 'deleteShortcode',
			'click > .vc_controls .vc_control-btn-edit': 'editElement',
			'click > .vc_controls .vc_control-btn-clone': 'clone',
			'click > .vc_controls .vc_control-btn-copy': 'copy',
			'click > .vc_controls .vc_control-btn-paste': 'paste',
			'click > .vc_controls .vc_control-btn-prepend': 'clickPrependSection',
			'click .vc_tta-section-append': 'clickAppendSection'
		},
		initialize: function ( params ) {
			window.VcBackendTtaViewInterface.__super__.initialize.call( this, params );
			_.bindAll( this, 'updateSorting' );
		},
		render: function () {
			window.VcBackendTtaViewInterface.__super__.render.call( this );
			this.$el.addClass( 'vc_tta-container vc_tta-o-non-responsive' );
			return this;
		},
		setContent: function () {
			this.$content = this.$el.find( '> .wpb_element_wrapper .vc_tta-panels' );
		},
		clickAppendSection: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			this.addSection();
		},
		clickPrependSection: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			this.addSection( true );
		},
		/**
		 * Function to hook event when addTab is clicked, actually adds vc_tta_section to container
		 *
		 * @returns vc.shortcode - window.VcBackendTtaSectionView - vc_tta_section
		 */
		addSection: function ( prepend ) {
			var newTabTitle, params, shortcode;

			newTabTitle = this.defaultSectionTitle;
			params = {
				shortcode: 'vc_tta_section',
				params: { title: newTabTitle },
				parent_id: this.model.get( 'id' ),
				order: (_.isBoolean( prepend ) && prepend ? vc.add_element_block_view.getFirstPositionIndex() : vc.shortcodes.getNextOrder()),
				prepend: prepend // used in notifySectionRendered to create in correct place tab
			};
			shortcode = vc.shortcodes.create( params );

			return shortcode;
		},
		findSection: function ( modelId ) {
			return this.$content.children( '[data-model-id="' + modelId + '"]' );
		},
		getIndex: function ( $element ) {
			return $element.index();
		},
		buildSortable: function ( $element ) {
			if ( 'edit' === vc_user_access().getState( 'shortcodes' ) || !vc_user_access().shortcodeAll(
				'vc_tta_section' ) ) {
				return false;
			}
			return $element.sortable( {
				forcePlaceholderSize: true,
				placeholder: this.sortingPlaceholder,
				helper: this.renderSortingPlaceholder,
				scroll: true,
				cursor: 'move',
				cursorAt: { top: 20, left: 16 },
				start: function ( event, ui ) {
				},
				over: function ( event, ui ) {
				},
				stop: function ( event, ui ) {
					ui.item.attr( 'style', '' );
				},
				update: this.updateSorting,
				items: this.sortableSelector
			} );
		},
		updateSorting: function ( event, ui ) {
			var self;
			if ( !vc_user_access().shortcodeAll( 'vc_tta_section' ) ) {
				return false;
			}
			self = this;
			this.$sortable.find( this.sortableSelector ).each( function () {
				var shortcode, modelId, $this;

				$this = $( this );
				modelId = $this.attr( self.sortableUpdateModelIdSelector );
				shortcode = vc.shortcodes.get( modelId );
				vc.storage.lock();
				shortcode.save( { 'order': self.getIndex( $this ) } );
			} );
			vc.storage.unlock();
			vc.storage.save();
		},
		makeFirstSectionActive: function () {
			this.$content.children( ':first-child' ).addClass( this.activeClass );
		},
		checkForActiveSection: function () {
			var $currentActive;

			$currentActive = this.$content.children( '.' + this.activeClass );
			if ( !$currentActive.length ) {
				this.makeFirstSectionActive();
			}
		},
		changeActiveSection: function ( modelId ) {
			this.$content.children( '.vc_tta-panel.' + this.activeClass ).removeClass( this.activeClass );
			this.findSection( modelId ).addClass( this.activeClass );
		},
		/**
		 * Called when sorting or initial rendering is finished
		 *
		 * @param view
		 * @returns {*}
		 */
		changedContent: function ( view ) {
			var changedContent;

			changedContent = window.VcBackendTtaViewInterface.__super__.changedContent.call( this, view );
			this.checkForActiveSection();
			this.buildSortable( this.$sortable );
			return changedContent;
		},
		notifySectionChanged: function ( model ) {
			var view, title;

			view = model.get( 'view' );
			if ( _.isObject( view ) ) {
				title = model.getParam( 'title' );
				if ( !_.isString( title ) || !title.length ) {
					title = this.defaultSectionTitle;
				}
				view.$el.find( '.vc_tta-panel-title a .vc_tta-title-text' ).text( title );
			}
		},
		notifySectionRendered: function ( model ) {
			//Nothing here
		},
		getNextTab: function ( $viewTab ) {
			var lastIndex, viewTabIndex, $nextTab, $navigationSections;

			$navigationSections = this.$navigation.children();
			lastIndex = $navigationSections.length - 2; // -2 because latest one is "ADD button" and length starts from 1
			viewTabIndex = $viewTab.index();

			if ( viewTabIndex !== lastIndex ) {
				$nextTab = $navigationSections.eq( viewTabIndex + 1 );
			} else {
				// If we are the last tab in in navigation lets make active previous
				$nextTab = $navigationSections.eq( viewTabIndex - 1 );
			}
			return $nextTab;
		},
		renderSortingPlaceholder: function ( event, element ) {
			return vc.app.renderPlaceholder( event, element );
		}
	} );

	window.VcBackendTtaTabsView = window.VcBackendTtaViewInterface.extend( {
		sortableSelector: '> [data-vc-tab]',
		sortableSelectorCancel: '.vc-non-draggable-container',
		sortablePlaceholderClass: 'vc_placeholder-tta-tab',
		navigationSectionTemplate: null,
		navigationSectionTemplateParsed: null,
		$navigationSectionAdd: null,
		sortingPlaceholder: 'vc_placeholder-tab vc_tta-tab',
		render: function () {
			window.VcBackendTtaTabsView.__super__.render.call( this );

			this.$navigation = this.$el.find( '> .wpb_element_wrapper .vc_tta-tabs-list' );
			this.$sortable = this.$navigation;
			// Build navigation
			this.$navigationSectionAdd = this.$navigation.children( '.vc_tta-tab:first-child' );
			this.setNavigationSectionTemplate( this.$navigationSectionAdd.prop( 'outerHTML' ) );
			// test in the go
			if ( vc_user_access().shortcodeAll( 'vc_tta_section' ) ) {
				this.$navigationSectionAdd.addClass( 'vc_tta-section-append' )
					.removeAttr( 'data-vc-target-model-id' )
					.removeAttr( 'data-vc-tab' )
					.find( '[data-vc-target]' )
					.html( '<i class="vc_tta-controls-icon vc_tta-controls-icon-plus"></i>' )
					.removeAttr( 'data-vc-tabs' )
					.removeAttr( 'data-vc-target' )
					.removeAttr( 'data-vc-target-model-id' )
					.removeAttr( 'data-vc-toggle' );

				var isHideAddControl = this.$navigationSectionAdd.attr('data-hide-add-control');
				if ( 'true' === isHideAddControl ) {
					this.$navigationSectionAdd.css('display', 'none');
				}
			} else {
				this.$navigationSectionAdd.hide();
			}

			return this;
		},
		setNavigationSectionTemplate: function ( html ) {
			this.navigationSectionTemplate = html;
			this.navigationSectionTemplateParsed = vc.template( this.navigationSectionTemplate, vc.templateOptions.custom );
		},
		getNavigationSectionTemplate: function () {
			return this.navigationSectionTemplate;
		},
		getParsedNavigationSectionTemplate: function ( data ) {
			return this.navigationSectionTemplateParsed( data );
		},
		changeNavigationSectionTitle: function ( modelId, title ) {
			this.findNavigationTab( modelId ).find( '[data-vc-target]' ).text( title );
		},
		changeActiveSection: function ( modelId ) {
			window.VcBackendTtaTabsView.__super__.changeActiveSection.call( this, modelId );

			this.$navigation.children( '.' + this.activeClass ).removeClass( this.activeClass );
			// Set to new active
			this.findNavigationTab( modelId ).addClass( this.activeClass );
		},
		notifySectionRendered: function ( model ) {
			// We need to make "tab" for newly created shortcode.
			// Also we need to insert this tab by following index logic
			var $element, title, $insertAfter, clonedFrom;
			window.VcBackendTtaTabsView.__super__.notifySectionRendered.call( this, model );

			title = model.getParam( 'title' );
			$element = $( this.getParsedNavigationSectionTemplate( {
				model_id: model.get( 'id' ),
				section_title: _.isString( title ) && 0 < title.length ? title : this.defaultSectionTitle
			} ) );

			if ( model.get( 'cloned' ) ) {
				// just add after cloned id

				clonedFrom = model.get( 'cloned_from' );
				if ( _.isObject( clonedFrom ) ) {
					$insertAfter = this.$navigation.children( '[data-vc-target-model-id="' + clonedFrom.id + '"]' );
					if ( $insertAfter.length ) {
						$element.insertAfter( $insertAfter );
					} else {
						$element.insertBefore( this.$navigation.children( '.vc_tta-section-append' ) );
					}
				}
			} else {
				if ( model.get( 'prepend' ) ) {
					// just prepend to the start
					$element.insertBefore( this.$navigation.children( ':first-child' ) );
				} else {
					// just append to the end
					$element.insertBefore( this.$navigation.children( ':last-child' ) ); // last child is "add-button"
				}
			}
		},
		notifySectionChanged: function ( model ) {
			var title;

			window.VcBackendTtaTabsView.__super__.notifySectionChanged.call( this, model );

			title = model.getParam( 'title' );
			if ( !_.isString( title ) || !title.length ) {
				title = this.defaultSectionTitle;
			}
			this.changeNavigationSectionTitle( model.get( 'id' ), title );
			model.view.$el.find( '> .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_element-name' ).removeClass(
				'vc_element-move' );
			model.view.$el.find( '> .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_element-name .vc-c-icon-dragndrop' ).hide();
		},
		makeFirstSectionActive: function () {
			var $tab;

			$tab = this.$navigation.children( ':first-child:not(.vc_tta-section-append)' ).addClass( this.activeClass );
			if ( $tab.length ) {
				this.findSection( $tab.data( 'vc-target-model-id' ) ).addClass( this.activeClass );
			}
		},
		findNavigationTab: function ( modelId ) {
			return this.$navigation.children( '[data-vc-target-model-id="' + modelId + '"]' );
		},
		removeSection: function ( model ) {
			var $viewTab, $nextTab, tabIsActive;

			$viewTab = this.findNavigationTab( model.get( 'id' ) );
			tabIsActive = $viewTab.hasClass( this.activeClass );

			// Make next tab active if needed
			if ( tabIsActive ) {
				$nextTab = this.getNextTab( $viewTab );
				$nextTab.addClass( this.activeClass );
				// and make next section active as well
				this.changeActiveSection( $nextTab.data( 'vc-target-model-id' ) );
			}
			// Remove tab from navigation
			$viewTab.remove();
		},
		renderSortingPlaceholder: function ( event, currentItem ) {
			var helper, currentItemWidth, currentItemHeight;
			helper = currentItem;
			currentItemWidth = currentItem.width() + 1;
			currentItemHeight = currentItem.height();
			helper.width( currentItemWidth );
			helper.height( currentItemHeight );
			return helper;
		}
	} );
	window.VcBackendTtaAccordionView = VcBackendTtaViewInterface.extend( {
		sortableSelector: '> .vc_tta-panel:not(.vc_tta-section-append)',
		sortableSelectorCancel: '.vc-non-draggable',
		sortableUpdateModelIdSelector: 'data-model-id',
		defaultSectionTitle: window.i18nLocale.section,
		render: function () {
			window.VcBackendTtaTabsView.__super__.render.call( this );
			this.$navigation = this.$content;
			this.$sortable = this.$content;
			if ( !vc_user_access().shortcodeAll( 'vc_tta_section' ) ) {
				this.$content.find( '.vc_tta-section-append' ).hide();
			}
			return this;
		},
		removeSection: function ( model ) {
			var $viewTab, $nextTab, tabIsActive;

			$viewTab = this.findSection( model.get( 'id' ) );
			tabIsActive = $viewTab.hasClass( this.activeClass );

			// Make next tab active if needed
			if ( tabIsActive ) {
				$nextTab = this.getNextTab( $viewTab );
				$nextTab.addClass( this.activeClass );
			}
		},
		addShortcode: function ( view ) {
			var beforeShortcode;

			beforeShortcode = _.last( vc.shortcodes.filter( function ( shortcode ) {
				return shortcode.get( 'parent_id' ) === this.get( 'parent_id' ) && parseFloat( shortcode.get( 'order' ) ) < parseFloat(
					this.get( 'order' ) );
			}, view.model ) );
			if ( beforeShortcode ) {
				view.render().$el.insertAfter( '[data-model-id=' + beforeShortcode.id + ']' );
			} else {
				this.$content.prepend( view.render().el );
			}
		}
	} );
	window.VcBackendTtaTourView = window.VcBackendTtaTabsView.extend( {
		defaultSectionTitle: window.i18nLocale.section
	} );
	window.VcBackendTtaPageableView = window.VcBackendTtaTabsView.extend( {
		defaultSectionTitle: window.i18nLocale.section
	} );
	window.VcBackendTtaSectionView = window.VcColumnView.extend( {
		parentObj: null,
		events: {
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_control-btn-delete': 'deleteShortcode',
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_control-btn-prepend': 'addElement',
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_control-btn-edit': 'editElement',
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_control-btn-clone': 'clone',
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_control-btn-copy': 'copy',
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_controls .vc_control-btn-paste': 'paste',
			'click > .wpb_element_wrapper > .vc_tta-panel-body > .vc_empty-container': 'addToEmpty'
		},
		setContent: function () {
			this.$content = this.$el.find( '> .wpb_element_wrapper > .vc_tta-panel-body > .vc_container_for_children' );
		},
		/**
		 * Funtion to change tabs count for parent view
		 *
		 * @returns {VcBackendTtaSectionView}
		 */
		render: function () {
			var parentObj;
			window.VcBackendTtaSectionView.__super__.render.call( this );
			parentObj = vc.shortcodes.get( this.model.get( 'parent_id' ) );
			if ( _.isObject( parentObj ) && !_.isUndefined( parentObj.view ) ) {
				this.parentObj = parentObj;
			}

			this.$el.addClass( 'vc_tta-panel' );
			this.$el.attr( 'style', '' ); // TODO: check this (after adding new tab display: block is in attribute style (because jquery sortable!)
			this.$el.attr( 'data-vc-toggle', "tab" );

			this.replaceTemplateVars();
			return this;
		},
		replaceTemplateVars: function () {
			var title, $panelHeading;
			title = this.model.getParam( 'title' );
			if ( _.isEmpty( title ) ) {
				title = this.parentObj && this.parentObj.defaultSectionTitle && this.parentObj.defaultSectionTitle.length ? this.parentObj.defaultSectionTitle : window.i18nLocale.section;
			}
			$panelHeading = this.$el.find( '.vc_tta-panel-heading' );
			var template = vc.template( $panelHeading.html(), vc.templateOptions.custom );

			$panelHeading.html( template( {
				model_id: this.model.get( 'id' ),
				section_title: title
			} ) );
		},
		getIndex: function () {
			return this.$el.index();
		},
		ready: function () {
			this.updateParentNavigation();
			window.VcBackendTtaSectionView.__super__.ready.call( this );
		},
		updateParentNavigation: function () {
			/** @var parentObj - window.VcBackendTtaView **/
			if ( _.isObject( this.parentObj ) && this.parentObj.view && this.parentObj.view.notifySectionRendered ) {
				this.parentObj.view.notifySectionRendered( this.model );
			}
		},

		/**
		 * Event hook for deleting shortcode, to remove parent if no tabs exist
		 * Also this hook changes tabs_count for parent view
		 *
		 * @param e
		 * @returns {boolean}
		 */
		deleteShortcode: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			var answer;
			answer = confirm( window.i18nLocale.press_ok_to_delete_section );
			if ( true !== answer ) {
				return false;
			}

			// Because this function called before model get deleted length must be 1 to delete parent as well
			if ( 1 === vc.shortcodes.where( { parent_id: this.model.get( 'parent_id' ) } ).length ) {
				// so we deleting last one element, so we need to remove also parent element
				this.model.destroy();
				if ( this.parentObj ) {
					this.parentObj.destroy();
				}
			} else {
				// remove this and update active tab if needed (should be always needed, because now we cannot remove inactive tab).
				if ( this.parentObj && this.parentObj.view && this.parentObj.view.removeSection ) {
					this.parentObj.view.removeSection( this.model );
				}

				this.model.destroy();
			}

			return true;
		},
		changeShortcodeParams: function ( model ) {
			window.VcBackendTtaSectionView.__super__.changeShortcodeParams.call( this, model );
			if ( _.isObject( this.parentObj ) && this.parentObj.view && this.parentObj.view.notifySectionChanged ) {
				this.parentObj.view.notifySectionChanged( model );
			}
		}
	} );

	/**
	 * Append tab_id tempalate filters
	 */
	vc.addTemplateFilter( function ( string ) {
		var random_id = VCS4() + '-' + VCS4();
		return string.replace( /tab\_id\=\"([^\"]+)\"/g, 'tab_id="$1' + random_id + '"' );
	} );
})( window.jQuery );

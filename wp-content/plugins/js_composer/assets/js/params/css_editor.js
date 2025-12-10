/* =========================================================
 * css_editor.js v1.0.1
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * Shortcodes css editor for edit form backbone/underscore version
 * ========================================================= */
// Safety first
/** global window.i18nLocale */
if ( _.isUndefined( window.vc ) ) {
	window.vc = { atts: {} };
}
(function ( $ ) {
	'use strict';

	var media, preloader_url;
	media = wp.media;
	preloader_url = ajaxurl.replace( /admin\-ajax\.php/, 'images/wpspin_light.gif' );

	media.controller.VcCssSingleImage = media.controller.VcSingleImage.extend( {
		setCssEditor: function ( view ) {
			if ( view ) {
				this._css_editor = view;
			}
			return this;
		},
		updateSelection: function () {
			var selection = this.get( 'selection' ),
				ids = this._css_editor.getBackgroundImage(),
				attachments;

			if ( 'undefined' !== typeof (ids) && '' !== ids && - 1 !== ids ) {
				attachments = _.map( ids.toString().split( /,/ ), function ( id ) {
					var attachment = wp.media.model.Attachment.get( id );
					attachment.fetch();
					return attachment;
				} );
			}
			selection.reset( attachments );
		}
	} );

	/**
	 * Css editor view.
	 * @type {*}
	 */
	var VcCssEditor;
	VcCssEditor = vc.CssEditor = Backbone.View.extend( {
		attrs: {},
		layouts: [
			'margin',
			'border-width',
			'padding'
		],
		positions: [
			'top',
			'right',
			'bottom',
			'left'
		],
		$field: false,
		simplify: false,
		$simplify: false,
		events: {
			'click .vc_icon-remove': 'removeImage',
			'click .vc_add-image': 'addBackgroundImage',
			'change .vc_simplify': 'changeSimplify'
		},
		initialize: function () {
			_.bindAll( this, 'setSimplify' );
		},
		render: function ( value ) {
			this.attrs = {};
			this.$simplify = this.$el.find( '.vc_simplify' );
			this.setPlaceholders();
			if ( _.isString( value ) ) {
				this.parse( value );
			}
			return this;
		},
		parse: function ( value ) {
			var data_split = value.split( /\s*(\.[^\{]+)\s*\{\s*([^\}]+)\s*\}\s*/g );

			if ( data_split && data_split[ 2 ] ) {
				this.parseAtts( data_split[ 2 ].replace( /\s+!important/g, '' ) );
			}
		},
		addBackgroundImage: function ( e ) {
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}

			window.vc_selectedFilters = {};

			if ( this.image_media ) {
				return this.image_media.open( 'vc_editor' );
			}
			this.image_media = media( {
				state: 'vc_single-image',
				states: [ new media.controller.VcCssSingleImage().setCssEditor( this ) ]
			} );
			this.image_media.on( 'toolbar:create:vc_single-image', function ( toolbar ) {
				this.createSelectToolbar( toolbar, {
					text: window.i18nLocale.set_image
				} );
			}, this.image_media );
			this.image_media.state( 'vc_single-image' ).on( 'select', this.setBgImage );
			this.image_media.open( 'vc_editor' );
		},
		setBgImage: function () {
			var selection = this.get( 'selection' );
			filterSelection( selection, this );
		},
		setCurrentBgImage: function ( value ) {
			var image_regexp = /([^\?]+)(\?id=\d+){0,1}/, url = '', id = '', image_split;
			var template;
			if ( value.match( /^\d+$/ ) ) {
				template = vc.template( $( '#vc_css-editor-image-block' ).html(), _.defaults( {}, { variable: 'img' }, vc.templateOptions.custom ) );
				this.$el.find( '.vc_background-image .vc_image' ).html( template( {
					url: preloader_url,
					id: value,
					css_class: 'vc_preview'
				} ) );
				$.ajax( {
					type: 'POST',
					url: window.ajaxurl,
					data: {
						action: 'wpb_single_image_src',
						content: value,
						size: 'full',
						_vcnonce: window.vcAdminNonce
					},
					dataType: 'html',
					context: this
				} ).done( function ( url ) {
					this.$el.find( '.vc_ce-image' ).attr( 'src', url + '?id=' + value ).removeClass( 'vc_preview' );
				} );
			} else if ( value.match( image_regexp ) ) {
				image_split = value.split( image_regexp );
				url = image_split[ 1 ];
				if ( image_split[ 2 ] ) {
					id = image_split[ 2 ].replace( /[^\d]+/, '' );
				}
				template = vc.template( $( '#vc_css-editor-image-block' ).html(), _.defaults( {}, { variable: 'img' }, vc.templateOptions.custom ) );
				this.$el.find( '.vc_background-image .vc_image' ).html( template( {
					url: url,
					id: id
				} ) );
			}
		},
		changeSimplify: function () {
			var debouncedFunc = _.debounce( this.setSimplify, 100 );
			debouncedFunc();
		},
		setSimplify: function () {
			this.simplifiedMode( this.$simplify[ 0 ].checked );
		},
		simplifiedMode: function ( enable ) {
			if ( enable ) {
				this.simplify = true;
				this.$el.addClass( 'vc_simplified' );
			} else {
				this.simplify = false;
				this.$el.removeClass( 'vc_simplified' );
				_.each( this.layouts, function ( attr ) {
					if ( 'border-width' === attr ) {
						attr = 'border';
					}
					var $control = $( '[data-attribute=' + attr + '].vc_top' );
					this.$el.find( '[data-attribute=' + attr + ']:not(.vc_top)' ).val( $control.val() );
				}, this );
			}
		},
		removeImage: function ( e ) {
			var $control = $( e.currentTarget );
			if ( e && e.preventDefault ) {
				e.preventDefault();
			}
			$control.parent().remove();
			// Trigger edit form change event, when image is removed
			this.$el.closest('.vc_edit-form-tab').trigger('change');
		},
		getBackgroundImage: function () {
			return this.$el.find( '.vc_ce-image' ).data( 'imageId' );
		},
		setPlaceholders: function () {
			try {
				var shortcode = this.$el.closest('#vc_ui-panel-edit-element').attr('data-vc-shortcode');
				var cssEditorParam = window.vc.map[shortcode].params.find(function (param) {
					return 'css_editor' === param.type;
				});
				var valuesObject = cssEditorParam.value;
				for (var key in valuesObject) {
					var name = key.replace( /\-+/g, '_' );
					var $element = this.$el.find( '[name=' + name + ']' );
					if ($element.length) {
						var tagName = $element[0].tagName;
						$element.attr('placeholder', valuesObject[ key ]);
						var isColorPicker = $element.hasClass('vc_color-control');
						if ('SELECT' === tagName || isColorPicker) {
							$element.val(valuesObject[key]);
							if (isColorPicker) {
								$element.trigger('change');
							}
						}
					}
				}
			} catch (e) {
				console.error('Cannot set fields placeholders in css_editor.js.', e);
			}
		},
		parseAtts: function ( string ) {
			var border_regex, background_regex, background_size;

			border_regex = /(\d+\S*)\s+(\w+)\s+([\d\w#\(,]+)/;
			background_regex = /^([^\s]+)\s+url\(([^\)]+)\)([\d\w]+\s+[\d\w]+)?$/;
			background_size = false;
			_.map( string.split( ';' ), function ( val ) {
				var val_s = val.split( /:\s/ ), val_pos, border_split, background_split,
					value = val_s[ 1 ] || '',
					name = val_s[ 0 ] || '';
				if ( value ) {
					value = value.trim();
				}
				if ( name.match( new RegExp( '^(' + this.layouts.join( '|' ).replace( '-',
					'\\-' ) + ')$' ) ) && value ) {
					val_pos = value.split( /\s+/g );
					if ( 1 === val_pos.length ) {
						val_pos = [
							val_pos[ 0 ],
							val_pos[ 0 ],
							val_pos[ 0 ],
							val_pos[ 0 ]
						];
					} else if ( 2 === val_pos.length ) {
						val_pos[ 2 ] = val_pos[ 0 ];
						val_pos[ 3 ] = val_pos[ 1 ];
					} else if ( 3 === val_pos.length ) {
						val_pos[ 3 ] = val_pos[ 1 ];
					}
					_.each( this.positions, function ( pos, key ) {
						this.$el.find( '[data-name=' + name + '-' + pos + ']' ).val( val_pos[ key ] );
					}, this );
				} else if ( 'background-size' === name ) {
					background_size = value;
					this.$el.find( '[name=background_style]' ).val( value );
				} else if ( 'background-repeat' === name && !background_size ) {
					this.$el.find( '[name=background_style]' ).val( value );
				} else if ( 'background-image' === name ) {
					this.setCurrentBgImage( value.replace( /url\(([^\)]+)\)/, '$1' ) );
				} else if ( 'background' === name && value ) {
					background_split = value.split( background_regex );
					if ( background_split && background_split[ 1 ] ) {
						this.$el.find( '[name=' + name + '_color]' ).val( background_split[ 1 ] );
					}
					if ( background_split && background_split[ 2 ] ) {
						this.setCurrentBgImage( background_split[ 2 ] );
					}
				} else if ( 'border' === name && value && value.match( border_regex ) ) {
					border_split = value.split( border_regex );
					val_pos = [
						border_split[ 1 ],
						border_split[ 1 ],
						border_split[ 1 ],
						border_split[ 1 ]
					];
					_.each( this.positions, function ( pos, key ) {
						this.$el.find( '[name=' + name + '_' + pos + '_width]' ).val( val_pos[ key ] );
					}, this );
					this.$el.find( '[name=border_style]' ).val( border_split[ 2 ] );
					this.$el.find( '[name=border_color]' ).val( border_split[ 3 ] ).trigger( 'change' );
				} else if ( name.indexOf( 'border' ) != - 1 && value ) {
					if ( name.indexOf( 'style' ) != - 1 ) {
						this.$el.find( '[name=border_style]' ).val( value );
					} else if ( name.indexOf( 'color' ) != - 1 ) {
						this.$el.find( '[name=border_color]' ).val( value ).trigger( 'change' );
					} else if ( name.indexOf( 'radius' ) != - 1 ) {
						this.$el.find( '[name=border_radius]' ).val( value );
					} else if ( name.match( /^[\w\-\d]+$/ ) ) {
						this.$el.find( '[name=' + name.replace( /\-+/g, '_' ) + ']' ).val( value );
					}
				} else if ( name.match( /^[\w\-\d]+$/ ) && value ) {
					this.$el.find( '[name=' + name.replace( /\-+/g, '_' ) + ']' ).val( value );
				}
			}, this );
		},
		save: function () {
			var string = '';
			this.attrs = {};
			_.each( this.layouts, function ( type ) {
				this.getFields( type );
			}, this );
			this.getBackground();
			this.getBorder();
			if ( !_.isEmpty( this.attrs ) ) {
				string = '.vc_custom_' + Date.now() + '{' + _.reduce( this.attrs, function ( memo, value, key ) {
					return value ? memo + key + ': ' + value + ' !important;' : memo;
				}, '', this ) + '}';
			}
			if ( string && vc.frame_window ) {
				vc.frame_window.vc_iframe.setCustomShortcodeCss( string );
			}

			return string;
		},
		getBackgroundImageSrc: function () {
			return this.$el.find( '.vc_background-image img' ).attr( 'src' );
		},
		getBackgroundColor: function () {
			return this.$el.find( '[name=background_color]' ).val();
		},
		getBackgroundStyle: function () {
			return this.$el.find( '[name=background_style]' ).val();
		},
		getBackground: function () {
			var color = this.getBackgroundColor();
			var image = this.getBackgroundImageSrc();
			var style = this.getBackgroundStyle();
			var colorPlaceholder = this.$el.find( '[name=background_color]' ).attr('placeholder');
			var useColor = color;
			if (colorPlaceholder && color.toLowerCase() !== colorPlaceholder.toLowerCase()) {
				useColor = color;
			}

			if ( color && image ) {
				this.attrs.background = color + ' ' + 'url(' + image + ')';
			} else if ( useColor ) {
				this.attrs[ 'background-color' ] = useColor;
			} else if ( image ) {
				this.attrs[ 'background-image' ] = 'url(' + image + ')';
			}
			if ( style.match( /repeat/ ) ) {
				this.attrs[ 'background-position' ] = '0 0';
				this.attrs[ 'background-repeat' ] = style;
			} else if ( style.match( /cover|contain/ ) ) {
				this.attrs[ 'background-position' ] = 'center';
				this.attrs[ 'background-repeat' ] = 'no-repeat';
				this.attrs[ 'background-size' ] = style;
			}
			if ( color.match( /^rgba/ ) ) {
				// TODO: Check potential typo in *
				this.attrs[ '*background-color' ] = color.replace( /\s+/,
					'' ).replace( /(rgb)a\((\d+)\,(\d+),(\d+),[^\)]+\)/, '$1($2,$3,$4)' );
			}
		},
		getBorder: function () {
			var style = this.$el.find( '[name=border_style]' ).val();
			var stylePlaceholder = this.$el.find( '[name=border_style]' ).attr('placeholder');
			var radius = this.$el.find( '[name=border_radius]' ).val();
			var radiusPlaceholder = this.$el.find( '[name=border_radius]' ).attr('placeholder');
			var color = this.$el.find( '[name=border_color]' ).val();
			var colorPlaceholder = this.$el.find( '[name=border_color]' ).attr('placeholder');
			// TODO fix sides
			var sides = [
				'left',
				'right',
				'top',
				'bottom'
			];
			if ( this.attrs[ 'border-width' ] && this.attrs[ 'border-width' ].match( /^\d+\S+$/ ) ) {
				this.attrs.border = this.attrs[ 'border-width' ] + ' ' + (style || 'initial') + ' ' + color;
				this.attrs[ 'border-width' ] = undefined;
				if ( radius && (radiusPlaceholder && radius !== radiusPlaceholder) ) {
					this.attrs[ 'border-radius' ] = radius;
				}
			} else {
				_.each( sides, function ( side ) {
					if ( this.attrs[ 'border-' + side + '-width' ] ) {
						if ( style && ((stylePlaceholder && style !== stylePlaceholder) || !stylePlaceholder) ) {
							this.attrs[ 'border-' + side + '-style' ] = style;
						}
					}
				}, this );

				if (radius && ((radiusPlaceholder && radius !== radiusPlaceholder) || !radiusPlaceholder)) {
					this.attrs[ 'border-radius' ] = radius;
				}
				if ( color && ((colorPlaceholder && color.toLowerCase() !== colorPlaceholder.toLowerCase()) || !colorPlaceholder) ) {
					this.attrs[ 'border-color' ] = color;
				}
			}
		},
		getFields: function ( type ) {
			var data = [];
			if ( this.simplify ) {
				return this.getSimplifiedField( type );
			}
			_.each( this.positions, function ( pos ) {
				var $inputEl = this.$el.find( '[data-name=' + type + '-' + pos + ']' );
				var val = $inputEl.val();
				val = val.replace( /\s+/, '' );
				if ( !val.match( /^-?\d*(\.\d+){0,1}(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)$/ ) ) {
					val = (isNaN( parseFloat( val ) ) ? '' : '' + parseFloat( val ) + 'px');
				}
				if ( val && val.length ) {
					data.push( { name: pos, val: val } );
				}
			}, this );
			_.each( data, function ( attr ) {
				var attr_name = 'border-width' === type ? 'border-' + attr.name + '-width' : type + '-' + attr.name;
				this.attrs[ attr_name ] = attr.val;
			}, this );
		},
		getSimplifiedField: function ( type ) {
			var pos, val;

			pos = 'top';
			val = this.$el.find( '[data-name=' + type + '-' + pos + ']' ).val().replace( /\s+/, '' );
			if ( !val.match( /^-?\d*(\.\d+){0,1}(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)$/ ) ) {
				val = (isNaN( parseFloat( val ) ) ? '' : '' + parseFloat( val ) + 'px');
			}
			if ( val.length ) {
				this.attrs[ type ] = val;
			}
		}
	} );
	/**
	 * Add new param to atts types list for vc
	 * @type {Object}
	 */
	vc.atts.css_editor = {
		parse: function ( param ) {
			var $field, css_editor, result;

			$field = this.content().find( 'input.wpb_vc_param_value[name="' + param.param_name + '"]' );
			css_editor = $field.data( 'vcFieldManager' );
			result = css_editor.save();

			return result;
		},
		init: function ( param, $field ) {
			/**
			 * Find all fields with css_editor type and initialize.
			 */
			$( '[data-css-editor=true]', this.content() ).each( function () {
				var $editor = $( this ),
					$param = $editor.find( 'input.wpb_vc_param_value[name="' + param.param_name + '"]' ),
					value = $param.val();
				if ( !value ) {
					value = parseOldDesignOptions();
				}
				$param.data( 'vcFieldManager', new VcCssEditor( { el: $editor } ).render( value ) );
			} );
			//vc.atts.colorpicker.init.call( this, param, $field );
		}
	};

	/**
	 * Backward capability for old css attributes
	 * @return {String} - Css settings with class name and css attributes settings.
	 */
	function parseOldDesignOptions() {
		var keys, params, cssString;

		keys = {
			'bg_color': 'background-color',
			'padding': 'padding',
			'margin_bottom': 'margin-bottom',
			'bg_image': 'background-image'
		};
		params = vc.edit_element_block_view.model.get( 'params' );
		cssString = _.reduce( keys, function ( memo, css_name, attr_name ) {
			var value = params[ attr_name ];
			if ( _.isUndefined( value ) || !value.length ) {
				return memo;
			}
			if ( 'bg_image' === attr_name ) {
				value = 'url(' + value + ')';
			}
			return memo + css_name + ': ' + value + ';';
		}, '' );

		return cssString ? '.tmp_class{' + cssString + '}' : '';
	}

	function filterSelection( selection, obj ) {
		var ids;

		ids = [];

		$( '.media-modal' ).addClass( 'processing-media' );

		selection.each( function ( model ) {
			ids.push( model.get( 'id' ) );
		} );

		processImages( ids, finishImageProcessing );

		function finishImageProcessing( newAttachments ) {
			if ( !window.vc || !window.vc.active_panel ) {
				return false; // in case if user cloused the editor panel.
			}
			var attachments,
				objects;

			attachments = _.map( newAttachments, function ( newAttachment ) {
				return newAttachment.attributes;
			} );

			selection.reset( attachments );

			objects = _.map( selection.models, function ( model ) {
				return model.attributes;
			} );

			var template = vc.template( $( '#vc_css-editor-image-block' ).html(), _.defaults( {}, { variable: 'img' }, vc.templateOptions.custom ) );
			obj._css_editor.$el.find( '.vc_background-image .vc_image' ).html( template( objects[ 0 ] ) );

			$( '.media-modal' ).removeClass( 'processing-media' );
			// Trigger edit form change event, when images finished loading
			obj._css_editor.$el.closest('.vc_edit-form-tab').trigger('change');
		}
	}

	/**
	 * Process specified images and call callback
	 *
	 * @param ids array of int ids
	 * @param callback Processed attachments are passed as first and only argument
	 * @return void
	 */
	function processImages( ids, callback ) {
		$.ajax( {
			dataType: "json",
			type: 'POST',
			url: window.ajaxurl,
			data: {
				action: 'vc_media_editor_add_image',
				filters: window.vc_selectedFilters,
				ids: ids,
				vc_inline: true,
				_vcnonce: window.vcAdminNonce
			}
		} ).done( function ( response ) {
			var attachments, attachment, promises, i;

			if ( 'function' !== typeof (callback) ) {
				return;
			}

			attachments = [];
			promises = [];

			for ( i = 0; i < response.data.ids.length; i ++ ) {
				attachment = wp.media.model.Attachment.get( response.data.ids[ i ] );
				promises.push( attachment.fetch() );
				attachments.push( attachment );
			}

			$.when.apply( $, promises ).done( function () {
				callback( attachments );
			} );
		} ).fail( function ( response ) {
			$( '.media-modal-close' ).click();

			if ( window.vc && window.vc.active_panel && window.i18nLocale && window.i18nLocale.error_while_saving_image_filtered ) {
				vc.active_panel.showMessage( window.i18nLocale.error_while_saving_image_filtered,
					'error' );
			}
			if ( window.console && window.console.warn ) {
				window.console.warn( 'css_editor processImages error', response );
			}
		} ).always( function () {
			$( '.media-modal' ).removeClass( 'processing-media' );
		} );
	}

})( window.jQuery );

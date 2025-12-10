/* =========================================================
 * lib/shortcodes_builder.js v0.5.0
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * WPBakery Page Builder shortcode logic backend.
 *
 * ========================================================= */
(function ( $ ) {
	'use strict';
	if ( 'undefined' === typeof window.vc ) {
		window.vc = {};
	}
	window.vc.ShortcodesBuilder = function ( models ) {
		this.models = models || [];
		this.is_build_complete = true;
		return this;
	};
	window.vc.ShortcodesBuilder.prototype = {
		_ajax: false,
		message: false,
		isBuildComplete: function () {
			return this.is_build_complete;
		},
		create: function ( attributes ) {
			this.is_build_complete = false;
			this.models.push( window.vc.shortcodes.create( attributes ) );
			return this;
		},
		render: function ( callback, model ) {
			var shortcodes;
			shortcodes = _.map( this.models, function ( model ) {
				var string = this.toString( model );
				return { id: model.get( 'id' ), string: string, tag: model.get( 'shortcode' ) };
			}, this );
			window.vc.setDataChanged();
			this.build( shortcodes, callback, model );
		},
		build: function ( shortcodes, callback, model ) {
			this.ajax( {
					action: 'vc_load_shortcode',
					shortcodes: shortcodes,
					_vcnonce: window.vcAdminNonce
				},
				window.vc.frame_window.location.href ).done(
				function ( html ) {
					_.each( $( html ), function ( block ) {
						this._renderBlockCallback( block );
					}, this );
					if ( _.isFunction( callback ) ) {
						callback( html );
					}
					window.vc.frame.setSortable();
					window.vc.activity = false;
					this.checkNoContent();
					window.vc.frame_window.vc_iframe.loadScripts();
					if ( this.last() ) {
						vc.frame.scrollTo( this.first() );
					}
					this.models = [];
					this.showResultMessage();
					this.is_build_complete = true;
					vc.events.trigger('afterLoadShortcode', shortcodes, model);
					if ( model ) {
						this.buildDefaultCss(model);
					}
				}
			);
		},
		lastID: function () {
			return this.models.length ? _.last( this.models ).get( 'id' ) : '';
		},
		last: function () {
			return this.models.length ? _.last( this.models ) : false;
		},
		firstID: function () {
			return this.models.length ? _.first( this.models ).get( 'id' ) : '';
		},
		first: function () {
			return this.models.length ? _.first( this.models ) : false;
		},
		buildFromContent: function () {
			var content;

			content = decodeURIComponent( window.vc.frame_window.jQuery( '#vc_template-post-content' ).html() + '' )
				.replace( /<style([^>]*)>\/\*\* vc_js-placeholder \*\*\//g, '<script$1>' )
				.replace( /<\/style([^>]*)><!-- vc_js-placeholder -->/g, '</script$1>' );

			try {
				window.vc.$page.html( content ).prepend( $( '<div class="vc_empty-placeholder"></div>' ) );
			} catch ( err ) {
				if ( window.console && window.console.warn ) {
					window.console.warn( 'BuildFromContent error', err );
				}
			}
			_.each( window.vc.post_shortcodes, function ( data ) {
				var shortcode;
				var $block, $parent, params;
				shortcode = JSON.parse( decodeURIComponent( data + '' ) );
				$block = window.vc.$page.find( '[data-model-id=' + shortcode.id + ']' );
				$parent = $block.parents( '[data-model-id]' );
				params = _.isObject( shortcode.attrs ) ? shortcode.attrs : {};

				var model = window.vc.shortcodes.create( {
					id: shortcode.id,
					shortcode: shortcode.tag,
					params: this.unescapeParams( params ),
					parent_id: shortcode.parent_id,
					from_content: true
				}, { silent: true } );
				$block.attr( 'data-model-id', model.get( 'id' ) );
				this._renderBlockCallback( $block.get( 0 ) );
			}, this );
			window.vc.frame.setSortable();
			this.checkNoContent();
			window.vc.frame.render();
			try {
				window.vc.frame_window.vc_iframe.reload();
			} catch ( err ) {
				if ( window.console && window.console.warn ) {
					window.console.warn( 'BuildFromContent render error', err );
				}
			}
		},
		buildFromTemplate: function ( html, data ) {
			var templateShortcodesHasId;
			templateShortcodesHasId = false;
			_.each( $( html ), function ( block ) {
				var $block = $( block );
				if ( $block.is( '[data-type=files]' ) ) {
					this._renderBlockCallback( block );
				} else {
					window.vc.app.placeElement( $block );
				}
			}, this );
			_.each( data, function ( encoded_shortcode ) {
				var shortcode, $block, params, model, id_param;
				shortcode = JSON.parse( decodeURIComponent( encoded_shortcode + '' ) );
				$block = window.vc.$page.find( '[data-model-id=' + shortcode.id + ']' );
				params = _.isObject( shortcode.attrs ) ? shortcode.attrs : {};

				if ( !templateShortcodesHasId ) {
					id_param = window.vc.shortcodeHasIdParam( shortcode.tag );
					if ( id_param && !_.isUndefined( params ) && !_.isUndefined( params[ id_param.param_name ] ) && 0 < params[ id_param.param_name ].length ) {
						templateShortcodesHasId = true;
					}
				}

				model = window.vc.shortcodes.create( {
					id: shortcode.id,
					shortcode: shortcode.tag,
					params: this.unescapeParams( params ),
					parent_id: shortcode.parent_id,
					from_template: true
				} );
				$block.attr( 'data-model-id', model.get( 'id' ) );
				this._renderBlockCallback( $block.get( 0 ) );

			}, this );
			window.vc.frame.setSortable();
			window.vc.activity = false;
			this.checkNoContent();
			window.vc.frame_window.vc_iframe.loadScripts();
			if ( this.last() ) {
				window.vc.frame.scrollTo( this.first() );
			}
			this.models = [];
			this.showResultMessage();
			window.vc.frame.render();
			this.is_build_complete = true;

			return templateShortcodesHasId;
		},
		_renderBlockCallback: function ( block ) {
			var $this = $( block ), $html, model;
			if ( 'files' === $this.data( 'type' ) ) {
				window.vc.frame_window.vc_iframe.addScripts( $this.find( 'script,link' ) ); // src remove to fix loading inernal scripts.
				window.vc.frame_window.vc_iframe.addStyles( $this.find( 'style' ) ); // add internal css styles.
			} else {
				model = window.vc.shortcodes.get( $this.data( 'modelId' ) );
				$html = $this.is( '[data-type=element]' ) ? $( $this.html() ) : $this;
				if ( model && model.get( 'shortcode' ) ) {
					this.renderShortcode( $html, model );
				}
			}
			window.vc.setFrameSize();
		},
		renderShortcode: function ( $html, model ) {
			var view_name, inner_html, update_inner;
			view_name = this.getView( model );
			inner_html = $html;

			window.vc.last_inner = inner_html.html();
			$( 'script', inner_html ).each( function () {
				if ( $( this ).attr( 'src' ) ) {
					var key = window.vc.frame.addInlineScript( $( this ) );
					$( '<span class="js_placeholder_' + key + '"></span>' ).insertAfter( $( this ) );
					update_inner = true;
				} else {
					var key_inline = window.vc.frame.addInlineScriptBody( $( this ) );
					$( '<span class="js_placeholder_inline_' + key_inline + '"></span>' ).insertAfter( $( this ) );
					update_inner = true;
				}
				$( this ).remove();
			} );

			if ( update_inner ) {
				$html.html( inner_html.html() );
			}
			if ( !model.get( 'from_content' ) && !model.get( 'from_template' ) ) {
				this.placeContainer( $html, model );
			}
			model.view = new view_name( { model: model, el: $html } ).render();
			this.notifyParent( model.get( 'parent_id' ) );
			model.view.rendered();
		},
		getView: function ( model ) {
			var view = model.setting( 'is_container' ) || model.setting( 'as_parent' ) ? InlineShortcodeViewContainer : InlineShortcodeView;
			if ( _.isObject( window[ 'InlineShortcodeView' + '_' + model.get( 'shortcode' ) ] ) ) {
				view = window[ 'InlineShortcodeView' + '_' + model.get( 'shortcode' ) ];
			}

			return view;
		},
		update: function ( model ) {
			var tag, shortcode;

			tag = model.get( 'shortcode' );
			shortcode = this.toString( model );

			window.vc.setDataChanged();
			this.ajax( {
				action: 'vc_load_shortcode',
				shortcodes: [
					{
						id: model.get( 'id' ),
						string: shortcode,
						tag: tag
					}
				],
				_vcnonce: window.vcAdminNonce
			}, window.vc.frame_window.location.href ).done( function ( html ) {
				var old_view;
				old_view = model.view;
				_.each( $( html ), function ( block ) {
					this._renderBlockCallback( block );
				}, this );
				if ( model.view ) {
					model.view.$el.insertAfter( old_view.$el );
					if ( window.vc.shortcodes.where( { parent_id: model.get( 'id' ) } ).length ) {
						old_view.content().find( '> *' ).appendTo( model.view.content() );
					}
					old_view.remove();
					window.vc.frame_window.vc_iframe.loadScripts();
					model.view.changed();
					window.vc.frame.setSortable();
					model.view.updated();
				}
			} );
		},
		ajax: function ( data, url ) {
			var postData = {
				post_id: vc_post_id,
				vc_inline: true,
				_vcnonce: window.vcAdminNonce,
				wpb_js_google_fonts_save_nonce: window.wpb_js_google_fonts_save_nonce,
				wpb_vc_js_status: window.wpb_vc_js_status
			};
			this._ajax = $.ajax( {
				url: url || window.vc.admin_ajax,
				type: 'POST',
				dataType: 'html',
				data: _.extend( postData, data ),
				context: this
			} );

			return this._ajax;
		},
		notifyParent: function ( parent_id ) {
			var parent = window.vc.shortcodes.get( parent_id );
			if ( parent && parent.view ) {
				parent.view.changed();
			}
		},
		remove: function () {
		},
		_getContainer: function ( model ) {
			var container, parent_model, parent_id;

			parent_id = model.get( 'parent_id' );
			if ( false !== parent_id ) {
				parent_model = window.vc.shortcodes.get( parent_id );
				if ( _.isUndefined( parent_model ) ) {
					return window.vc.app;
				}
				container = parent_model.view;
			} else {
				container = window.vc.app;
			}

			return container;
		},
		placeContainer: function ( $html, model ) {
			var container = this._getContainer( model );
			if ( container ) {
				container.placeElement( $html, window.vc.activity );
			}

			return container;
		},
		toString: function ( model, type ) {
			var paramsForString, params, content, mergedParams, tag;

			paramsForString = {};
			tag = model.get( 'shortcode' );
			params = _.extend( {}, model.get( 'params' ) );
			mergedParams = window.vc.getMergedParams( tag, params );
			content = _.isString( params.content ) ? params.content : '';
			_.each( mergedParams, function ( value, key ) {
				paramsForString[ key ] = this.escapeParam( value );
			}, this );

			return wp.shortcode.string( {
				tag: tag,
				attrs: paramsForString,
				content: content,
				type: _.isString( type ) ? type : ''
			} );
		},
		getContent: function () {
			var models;
			models = _.sortBy(
				window.vc.shortcodes.where( { parent_id: false } ),
				function ( model ) {
					return model.get( 'order' );
				}
			);

			return window.vc.shortcodes.modelsToString( models );
		},
		getTitle: function () {
			return window.vc.title;
		},
		checkNoContent: function () {
			window.vc.frame.noContent( !vc.shortcodes.length );
		},
		save: function ( status ) {
			var string, data;
			string = this.getContent();

			data = {};
			data.action = 'vc_save';
			data.vc_post_custom_css = window.vc.$custom_css.val();
			data.vc_post_custom_js_header = window.vc.$custom_js_header.val();
			data.vc_post_custom_js_footer = window.vc.$custom_js_footer.val();
			data.vc_post_custom_layout = $( '#vc_post-custom-layout' ).val();
			data.vc_post_custom_seo_settings = $( '#vc_post-custom-seo-settings' ).val();

			data.content = this.wpautop( string );
			if ( status ) {
				data.post_status = status;
				$( '.vc_button_save_draft' ).hide( 100 );
				$( '#vc_button-update' ).text( window.i18nLocale.update_all );
			}
			if ( window.vc.update_title ) {
				data.post_title = this.getTitle();
			}
			this.ajax( data )
				.done( function () {
					window.vc.unsetDataChanged();
					window.vc.showMessage( window.i18nLocale.vc_successfully_updated || 'Successfully updated!' );
				} );
		},
		/**
		 * Parse shortcode string into objects.
		 * @param data
		 * @param content
		 * @param parent
		 * @return {*}
		 */
		parse: function ( data, content, parent ) {
			var tags, reg, matches;

			tags = _.keys( window.vc.map ).join( '|' );
			reg = window.wp.shortcode.regexp( tags );
			matches = content.trim().match( reg );
			if ( _.isNull( matches ) ) {
				return data;
			}
			_.each( matches, function ( raw ) {
				var sub_matches, sub_content, sub_regexp, atts_raw, atts, shortcode, id, map_settings;

				sub_matches = raw.match( this.regexp( tags ) );
				sub_content = sub_matches[ 5 ];
				sub_regexp = new RegExp( '^[\\s]*\\[\\[?(' + _.keys( window.vc.map ).join( '|' ) + ')(?![\\w-])' );
				atts_raw = window.wp.shortcode.attrs( sub_matches[ 3 ] );
				atts = {};
				id = vc_guid();
				_.each( atts_raw.named, function ( value, key ) {
					atts[ key ] = this.unescapeParam( value );
				}, this );
				shortcode = {
					id: id,
					shortcode: sub_matches[ 2 ],
					params: _.extend( {}, atts ),
					parent_id: (_.isObject( parent ) ? parent.id : false)
				};
				map_settings = window.vc.getMapped( shortcode.shortcode );
				if ( _.isArray( data ) ) {
					data.push( shortcode );
					id = data.length - 1;
				} else {
					data[ id ] = shortcode;
				}
				if ( id == shortcode.root_id ) {
					data[ id ].html = raw;
				}
				if ( _.isString( sub_content ) && sub_content.match( sub_regexp ) &&
					(
						(map_settings.is_container && _.isBoolean( map_settings.is_container ) && true === map_settings.is_container) || (!_.isEmpty( map_settings.as_parent ) && false !== map_settings.as_parent)
					) ) {
					data = this.parse( data, sub_content, data[ id ] );
				} else if ( _.isString( sub_content ) && sub_content.length && 'vc_row' === sub_matches[ 2 ] ) {
					data = this.parse( data,
						'[vc_column width="1/1"][vc_column_text]' + sub_content + '[/vc_column_text][/vc_column]',
						data[ id ] );
				} else if ( _.isString( sub_content ) && sub_content.length && 'vc_column' === sub_matches[ 2 ] ) {
					data = this.parse( data,
						'[vc_column_text]' + sub_content + '[/vc_column_text]',
						data[ id ] );
				} else if ( _.isString( sub_content ) ) {
					data[ id ].params.content = sub_content;
				}
			}, this );
			return data;
		},
		regexp: _.memoize( function ( tags ) {
			return new RegExp( '\\[(\\[?)(' + tags + ')(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)' );

		} ),
		wpautop: function ( str ) {
			str = vc_wpautop( str );

			return str;
		},
		/***
		 * Escape double quotes and square brackets in params value.
		 * @param value
		 * @return string
		 */
		escapeParam: function ( value ) {
			if ( _.isUndefined( value ) || _.isNull( value ) || !value.toString ) {
				return '';
			}
			return value.toString().replace( /"/g, '``' ).replace( /\[/g, '`{`' ).replace( /\]/g, '`}`' );
		},
		/**
		 * Unescape double quotes and square brackets in params value.
		 * @param value
		 * @return {*}
		 */
		unescapeParam: function ( value ) {
			value = value.replace( /(\`{\`)/g, '[' ).replace( /(\`}\`)/g, ']' ).replace( /(\`{2})/g, '"' );
			value = vc_wpnop( value );
			return value;
		},
		unescapeParams: function ( params ) {
			return _.object( _.map( params, function ( value, key ) {
				return [
					key,
					this.unescapeParam( value )
				];
			}, this ) );
		},
		setResultMessage: function ( str ) {
			this.message = str;
		},
		showResultMessage: function () {
			if ( false !== this.message ) {
				window.vc.showMessage( this.message );
			}
			this.message = false;
		},
		buildDefaultCss: function ( model ) {
			var hasContentClass = 'wpb_content_element' === model.settings.element_default_class;
			if( !model.settings || hasContentClass ) {
				return;
			}

			var cssString = '';
			var modelParams = model.settings.params;
			var defaultCssValue = null;
			var elementClass = model.settings.element_default_class;

			// Get element default css value
			if ( modelParams && modelParams.length ) {
				for ( var i = 0; i < modelParams.length; i++ ) {
					if ( 'css_editor' === modelParams[i].type ) {
						defaultCssValue = modelParams[i].value;
						break;
					}
				}
			}

			// Prepare css string
			if ( defaultCssValue ) {
				cssString = '.' + elementClass + '{' + _.reduce( defaultCssValue, function ( memo, value, key ) {
					return value ? memo + key + ': ' + value + ';' : memo;
				}, '', this ) + '}';
			}

			// Add css
			if ( cssString && vc.frame_window && elementClass ) {
				vc.frame_window.vc_iframe.setDefaultShortcodeCss( cssString, elementClass );
			}
		}
	};
	window.vc.builder = new window.vc.ShortcodesBuilder();
})( window.jQuery );

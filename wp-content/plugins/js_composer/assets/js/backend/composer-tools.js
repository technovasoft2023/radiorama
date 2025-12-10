if ( window._.isUndefined( window.vc ) ) {
	window.vc = {};
}

(function ( vc, _, $ ) {
	'use strict';

	/**
	 * Helper function to transform to Title Case
	 * @since 4.4
	 */
	window.vc_toTitleCase = function ( str ) {
		return str.replace( /\w\S*/g, function ( txt ) {
			return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
		} );
	};

	window.vc_convert_column_size = function ( width ) {
		var prefix, numbers, range, num, dev;
		prefix = 'vc_col-sm-';
		numbers = width ? width.split( '/' ) : [
			1,
			1
		];
		range = _.range( 1, 13 );
		num = !_.isUndefined( numbers[ 0 ] ) && 0 <= _.indexOf( range, parseInt( numbers[ 0 ], 10 ) ) ? parseInt( numbers[ 0 ], 10 ) : false;
		dev = !_.isUndefined( numbers[ 1 ] ) && 0 <= _.indexOf( range, parseInt( numbers[ 1 ], 10 ) ) ? parseInt( numbers[ 1 ], 10 ) : false;

		if ( false !== num && false !== dev ) {
			return prefix + (12 * num / dev);
		}

		return prefix + '12';
	};

	window.vc_convert_column_span_size = function ( width ) {
		width = width.replace( /^vc_/, '' );
		if ( "span12" === width ) {
			return '1/1';
		} else if ( "span11" === width ) {
			return '11/12';
		} else if ( "span10" === width ) {
			return '5/6';
		} else if ( "span9" === width ) {
			return '3/4';
		} else if ( "span8" === width ) {
			return '2/3';
		} else if ( "span7" === width ) {
			return '7/12';
		} else if ( "span6" === width ) {
			return '1/2';
		} else if ( "span5" === width ) {
			return '5/12';
		} else if ( "span4" === width ) {
			return '1/3';
		} else if ( "span3" === width ) {
			return '1/4';
		} else if ( "span2" === width ) {
			return '1/6';
		} else if ( "span1" === width ) {
			return '1/12';
		}

		return false;
	};

	window.vc_get_column_mask = function ( cells ) {
		var columns, columns_count, numbers_sum, i;
		columns = cells.split( '_' );
		columns_count = columns.length;
		numbers_sum = 0;

		for ( i in columns ) {
			if ( !isNaN( parseFloat( columns[ i ] ) ) && isFinite( columns[ i ] ) ) {
				var sp = columns[ i ].match( /(\d{1,2})(\d{1,2})/ );
				numbers_sum = _.reduce( sp.slice( 1 ), function ( memo, num ) {
					return memo + parseInt( num, 10 );
				}, numbers_sum ); // TODO: jshint
			}
		}
		return columns_count + '' + numbers_sum;
	};

	/**
	 *    Generate four random hex digits.
	 */
	window.VCS4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString( 16 ).substring( 1 );
	};

	/**
	 * Create Unique id for records in storage.
	 * Generate a pseudo-GUID by concatenating random hexadecimal.
	 * @return {String}
	 */
	window.vc_guid = function () {
		return (window.VCS4() + window.VCS4() + "-" + window.VCS4());
	};

	window.vc_button_param_target_callback = function () {
		var $link_target, $link_field;
		$link_target = this.$content.find( '[name=target]' ).parents( '[data-vc-ui-element="panel-shortcode-param"]:first' );
		$link_field = $( '.wpb-edit-form [name=href]' );
		var key_up_callback = _.debounce( function () {
			var val = $( this ).val();
			if ( 0 < val.length && 'http://' !== val && 'https://' !== val ) {
				$link_target.show();
			} else {
				$link_target.hide();
			}
		}, 300 );
		$link_field.on( 'keyup', key_up_callback ).trigger( 'keyup' );
	};

	window.vc_cta_button_param_target_callback = function () {
		var $link_target, $link_field;

		$link_target = this.$content.find( '[name=target]' ).parents( '[data-vc-ui-element="panel-shortcode-param"]:first' );
		$link_field = $( '.wpb-edit-form [name=href]' );
		var key_up_callback = _.debounce( function () {
			var val = $( this ).val();
			if ( 0 < val.length && 'http://' !== val && 'https://' !== val ) {
				$link_target.show();
			} else {
				$link_target.hide();
			}
		}, 300 );
		$link_field.on('keyup', key_up_callback ).trigger( 'keyup' );
	};

	window.vc_grid_exclude_dependency_callback = function () {
		var exclude_el = $( '.wpb_vc_param_value[name=exclude]', this.$content );
		var exclude_obj = exclude_el.data( 'vc-param-object' );
		if ( !exclude_obj ) {
			return false;
		}
		var post_type_object = $( 'select.wpb_vc_param_value[name="post_type"]', this.$content );
		var val = post_type_object.val();
		exclude_obj.source_data = function ( request, response ) {
			return { query: { query: val, term: request.term } };
		};
		exclude_obj.source_data_val = val;
		post_type_object.on( 'change', function () {
			val = $( this ).val();
			if ( exclude_obj.source_data_val != val ) {
				exclude_obj.source_data = function ( request, response ) {
					return { query: { query: val, term: request.term } };
				};
				exclude_obj.$el.data( 'uiAutocomplete' ).destroy();
				exclude_obj.$sortable_wrapper.find( '.vc_data' ).remove(); // remove all appended items
				exclude_obj.render(); // re-render data
				exclude_obj.source_data_val = val;
			}
		} );
	};

	window.vcGridFilterExcludeCallBack = function () {
		var $filterBy, $exclude, autocomplete, defaultValue;
		$filterBy = $( '.wpb_vc_param_value[name=filter_source]', this.$content );
		defaultValue = $filterBy.val();
		$exclude = $( '.wpb_vc_param_value[name=exclude_filter]', this.$content );
		autocomplete = $exclude.data( 'vc-param-object' );
		if ( undefined === autocomplete ) {
			return false;
		}
		$filterBy.on( 'change', function () {
			var $this = $( this );
			if ( defaultValue !== $this.val() ) {
				autocomplete.clearValue();
			}
			autocomplete.source_data = function () {
				return {
					vc_filter_by: $this.val()
				};
			};
		} ).trigger( 'change' );
	};

	window.vcGridTaxonomiesCallBack = function () {
		var $filterByPostType, $taxonomies, autocomplete, defaultValue;
		$filterByPostType = $( '.wpb_vc_param_value[name=post_type]', this.$content );
		defaultValue = $filterByPostType.val();
		$taxonomies = $( '.wpb_vc_param_value[name=taxonomies]', this.$content );
		autocomplete = $taxonomies.data( 'vc-param-object' );
		if ( undefined === autocomplete ) {
			return false;
		}
		$filterByPostType.on( 'change', function () {
			var $this = $( this );
			if ( defaultValue !== $this.val() ) {
				autocomplete.clearValue();
			}
			autocomplete.source_data = function () {
				return { vc_filter_post_type: $filterByPostType.val() };
			};
		} ).trigger( 'change' );
	};

	window.vcChartCustomColorDependency = function () {
		var $masterEl, $content;
		$masterEl = $( '.wpb_vc_param_value[name=style]', this.$content );
		$content = this.$content;
		$masterEl.on( 'change', function () {
			var masterValue;
			masterValue = $( this ).val();
			$content.toggleClass( 'vc_chart-edit-form-custom-color', 'custom' === masterValue );
		} );
		$masterEl.trigger( 'change' );
	};

	window.vc_wpnop = function ( html ) {
		html = 'undefined' !== typeof html ? (html + '') : '';
		if ( window.switchEditors && 'undefined' !== typeof window.switchEditors.pre_wpautop ) {
			html = window.switchEditors.pre_wpautop( html );

			// Fix wrapping for HTML Comments.
			html = html.replace( /<p>(<!--(?:.*)-->)<\/p>/g, '$1' );

			return html;
		}
		if ( !html ) {
			return '';
		}
		var blocklist = 'blockquote|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|th|td|h[1-6]|fieldset|figure',
			blocklist1 = blocklist + '|div|p',
			blocklist2 = blocklist + '|pre',
			preserve_linebreaks = false,
			preserve_br = false,
			preserve = [];

		// Protect script and style tags.
		if ( html.indexOf( '<script' ) !== - 1 || html.indexOf( '<style' ) !== - 1 ) {
			html = html.replace( /<(script|style)[^>]*>[\s\S]*?<\/\1>/g, function ( match ) {
				preserve.push( match );
				return '<wp-preserve>';
			} );
		}

		// Protect pre tags.
		if ( html.indexOf( '<pre' ) !== - 1 ) {
			preserve_linebreaks = true;
			html = html.replace( /<pre[^>]*>[\s\S]+?<\/pre>/g, function ( a ) {
				a = a.replace( /<br ?\/?>(\r\n|\n)?/g, '<wp-line-break>' );
				a = a.replace( /<\/?p( [^>]*)?>(\r\n|\n)?/g, '<wp-line-break>' );
				return a.replace( /\r?\n/g, '<wp-line-break>' );
			} );
		}

		// Remove line breaks but keep <br> tags inside image captions.
		if ( html.indexOf( '[caption' ) !== - 1 ) {
			preserve_br = true;
			html = html.replace( /\[caption[\s\S]+?\[\/caption\]/g, function ( a ) {
				return a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' ).replace( /[\r\n\t]+/, '' );
			} );
		}

		// Normalize white space characters before and after block tags.
		html = html.replace( new RegExp( '\\s*</(' + blocklist1 + ')>\\s*', 'g' ), '</$1>\n' );
		html = html.replace( new RegExp( '\\s*<((?:' + blocklist1 + ')(?: [^>]*)?)>', 'g' ), '\n<$1>' );

		// Mark </p> if it has any attributes.
		html = html.replace( /(<p [^>]+>.*?)<\/p>/g, '$1</p#>' );

		// Preserve the first <p> inside a <div>.
		html = html.replace( /<div( [^>]*)?>\s*<p>/gi, '<div$1>\n\n' );

		// Remove paragraph tags.
		html = html.replace( /\s*<p>/gi, '' );
		html = html.replace( /\s*<\/p>\s*/gi, '\n\n' );

		// Normalize white space chars and remove multiple line breaks.
		html = html.replace( /\n[\s\u00a0]+\n/g, '\n\n' );

		// Replace <br> tags with line breaks.
		html = html.replace( /(\s*)<br ?\/?>\s*/gi, function ( match, space ) {
			if ( space && space.indexOf( '\n' ) !== - 1 ) {
				return '\n\n';
			}

			return '\n';
		} );

		// Fix line breaks around <div>.
		html = html.replace( /\s*<div/g, '\n<div' );
		html = html.replace( /<\/div>\s*/g, '</div>\n' );

		// Fix line breaks around caption shortcodes.
		html = html.replace( /\s*\[caption([^\[]+)\[\/caption\]\s*/gi, '\n\n[caption$1[/caption]\n\n' );
		html = html.replace( /caption\]\n\n+\[caption/g, 'caption]\n\n[caption' );

		// Pad block elements tags with a line break.
		html = html.replace( new RegExp( '\\s*<((?:' + blocklist2 + ')(?: [^>]*)?)\\s*>', 'g' ), '\n<$1>' );
		html = html.replace( new RegExp( '\\s*</(' + blocklist2 + ')>\\s*', 'g' ), '</$1>\n' );

		// Indent <li>, <dt> and <dd> tags.
		html = html.replace( /<((li|dt|dd)[^>]*)>/g, ' \t<$1>' );

		// Fix line breaks around <select> and <option>.
		if ( html.indexOf( '<option' ) !== - 1 ) {
			html = html.replace( /\s*<option/g, '\n<option' );
			html = html.replace( /\s*<\/select>/g, '\n</select>' );
		}

		// Pad <hr> with two line breaks.
		if ( html.indexOf( '<hr' ) !== - 1 ) {
			html = html.replace( /\s*<hr( [^>]*)?>\s*/g, '\n\n<hr$1>\n\n' );
		}

		// Remove line breaks in <object> tags.
		if ( html.indexOf( '<object' ) !== - 1 ) {
			html = html.replace( /<object[\s\S]+?<\/object>/g, function ( a ) {
				return a.replace( /[\r\n]+/g, '' );
			} );
		}

		// Unmark special paragraph closing tags.
		html = html.replace( /<\/p#>/g, '</p>\n' );

		// Pad remaining <p> tags whit a line break.
		html = html.replace( /\s*(<p [^>]+>[\s\S]*?<\/p>)/g, '\n$1' );

		// Trim.
		html = html.replace( /^\s+/, '' );
		html = html.replace( /[\s\u00a0]+$/, '' );

		if ( preserve_linebreaks ) {
			html = html.replace( /<wp-line-break>/g, '\n' );
		}

		if ( preserve_br ) {
			html = html.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
		}

		// Restore preserved tags.
		if ( preserve.length ) {
			html = html.replace( /<wp-preserve>/g, function () {
				return preserve.shift();
			} );
		}

		return html;
	};

	window.vc_wpautop = function ( text ) {
		text = 'undefined' !== typeof text ? (text + '') : ''; // Forcerly cast to string everything
		/** @see switchEditors.autop, wp-admin/js/editor.js:1005 */
		if ( window.switchEditors && 'undefined' !== typeof window.switchEditors.wpautop ) {
			text = window.switchEditors.wpautop( text );

			// Fix wrapping for HTML Comments.
			text = text.replace( /<p>(<!--(?:.*)-->)<\/p>/g, '$1' );

			return text;
		}
		var preserve_linebreaks = false,
			preserve_br = false,
			blocklist = 'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
				'|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section' +
				'|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary';

		// Normalize line breaks.
		text = text.replace( /\r\n|\r/g, '\n' );

		// Remove line breaks from <object>.
		if ( text.indexOf( '<object' ) !== - 1 ) {
			text = text.replace( /<object[\s\S]+?<\/object>/g, function ( a ) {
				return a.replace( /\n+/g, '' );
			} );
		}

		// Remove line breaks from tags.
		text = text.replace( /<[^<>]+>/g, function ( a ) {
			return a.replace( /[\n\t ]+/g, ' ' );
		} );

		// Preserve line breaks in <pre> and <script> tags.
		if ( text.indexOf( '<pre' ) !== - 1 || text.indexOf( '<script' ) !== - 1 ) {
			preserve_linebreaks = true;
			text = text.replace( /<(pre|script)[^>]*>[\s\S]*?<\/\1>/g, function ( a ) {
				return a.replace( /\n/g, '<wp-line-break>' );
			} );
		}

		if ( text.indexOf( '<figcaption' ) !== - 1 ) {
			text = text.replace( /\s*(<figcaption[^>]*>)/g, '$1' );
			text = text.replace( /<\/figcaption>\s*/g, '</figcaption>' );
		}

		// Keep <br> tags inside captions.
		if ( text.indexOf( '[caption' ) !== - 1 ) {
			preserve_br = true;

			text = text.replace( /\[caption[\s\S]+?\[\/caption\]/g, function ( a ) {
				a = a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' );

				a = a.replace( /<[^<>]+>/g, function ( b ) {
					return b.replace( /[\n\t ]+/, ' ' );
				} );

				return a.replace( /\s*\n\s*/g, '<wp-temp-br />' );
			} );
		}

		text = text + '\n\n';
		text = text.replace( /<br \/>\s*<br \/>/gi, '\n\n' );

		// Pad block tags with two line breaks.
		text = text.replace( new RegExp( '(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '\n\n$1' );
		text = text.replace( new RegExp( '(</(?:' + blocklist + ')>)', 'gi' ), '$1\n\n' );
		text = text.replace( /<hr( [^>]*)?>/gi, '<hr$1>\n\n' );

		// Remove white space chars around <option>.
		text = text.replace( /\s*<option/gi, '<option' );
		text = text.replace( /<\/option>\s*/gi, '</option>' );

		// Normalize multiple line breaks and white space chars.
		text = text.replace( /\n\s*\n+/g, '\n\n' );

		// Convert two line breaks to a paragraph.
		text = text.replace( /([\s\S]+?)\n\n/g, '<p>$1</p>\n' );

		// Remove empty paragraphs.
		text = text.replace( /<p>\s*?<\/p>/gi, '' );

		// Remove <p> tags that are around block tags.
		text = text.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );
		text = text.replace( /<p>(<li.+?)<\/p>/gi, '$1' );

		// Fix <p> in blockquotes.
		text = text.replace( /<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>' );
		text = text.replace( /<\/blockquote>\s*<\/p>/gi, '</p></blockquote>' );

		// Remove <p> tags that are wrapped around block tags.
		text = text.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '$1' );
		text = text.replace( new RegExp( '(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );

		text = text.replace( /(<br[^>]*>)\s*\n/gi, '$1' );

		// Add <br> tags.
		text = text.replace( /\s*\n/g, '<br />\n' );

		// Remove <br> tags that are around block tags.
		text = text.replace( new RegExp( '(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi' ), '$1' );
		text = text.replace( /<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1' );

		// Remove <p> and <br> around captions.
		text = text.replace( /(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]' );

		// Make sure there is <p> when there is </p> inside block tags that can contain other blocks.
		text = text.replace( /(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function ( a, b, c ) {
			if ( c.match( /<p( [^>]*)?>/ ) ) {
				return a;
			}

			return b + '<p>' + c + '</p>';
		} );

		// Restore the line breaks in <pre> and <script> tags.
		if ( preserve_linebreaks ) {
			text = text.replace( /<wp-line-break>/g, '\n' );
		}

		// Restore the <br> tags in captions.
		if ( preserve_br ) {
			text = text.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
		}

		// Fix wrapping for HTML Comments
		text = text.replace( /<p>(<!--(?:.*)-->)<\/p>/g, '$1' );

		return text;
	};

	window.vc_regexp_shortcode = _.memoize( function () {
		return RegExp( '\\[(\\[?)([\\w|-]+\\b)(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)' );
	} );

	/**
	 * Add default values for params on shortcode creation.
	 *
	 * @since 4.5
	 * @param model
	 */
	window.vcAddShortcodeDefaultParams = function ( model ) {
		var params = model.get( 'params' );
		var preset = model.get( 'preset' );

		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

		if ( preset && window.vc_all_presets[ preset ] ) {
			params = window.vc_all_presets[ preset ];
			if ( 'undefined' !== typeof (vc.frame_window) && window.vc_all_presets[ preset ].css ) {
				vc.frame_window.vc_iframe.setCustomShortcodeCss( window.vc_all_presets[ preset ].css );
			}
		}

		model.set( { params: params }, { silent: true } );
	};

	/**
	 * Simple (non-secure) hash function
	 *
	 * @since 4.5
	 *
	 * @param {object|string} obj Thing to hash
	 * @return {number} Can be negative
	 */
	window.vc_globalHashCode = function ( obj ) {
		if ( 'string' !== typeof (obj) ) {
			obj = JSON.stringify( obj );
		}

		if ( !obj.length ) {
			return 0;
		}

		return obj.split( '' ).reduce( function ( a, b ) {
			a = ((a << 5) - a) + b.charCodeAt( 0 );
			return a & a;
		}, 0 );
	};

	/**
	 * underscore object memoize can cause overriding problems
	 */
	vc.memoizeWrapper = function ( func, resolver ) {
		var cache = {};
		return function () {
			var key = resolver ? resolver.apply( this, arguments ) : arguments[ 0 ];
			if ( !_.hasOwnProperty.call( cache, key ) ) {
				cache[ key ] = func.apply( this, arguments );
			}
			return _.isObject( cache[ key ] ) ? window.jQuery.fn.extend( true, {}, cache[ key ] ) : cache[ key ]; // perform DEEP extend
		};
	};

	/**
	 * Select random color when new param is added.
	 *
	 * @param $elem
	 * @param action
	 */
	window.vcChartParamAfterAddCallback = function ( $elem, action ) {
		if ( 'new' === action || 'clone' === action ) {
			$elem.find( '.vc_control.column_toggle' ).click();
		}

		if ( 'new' !== action ) {
			return;
		}

		var i, $select, $options, random, exclude, colors;

		exclude = [
			'white',
			'black'
		];

		$select = $elem.find( '[name=values_color]' );
		$options = $select.find( 'option' );

		i = 0;
		while ( true ) {
			if ( 100 < i ++ ) {
				break;
			}

			random = Math.floor( (Math.random() * $options.length) );

			if ( window.jQuery.inArray( $options.eq( random ).val(), exclude ) === - 1 ) {
				$options.eq( random ).prop( 'selected', true );
				$select.trigger('change');
				break;
			}
		}

		colors = [
			'#5472d2',
			'#00c1cf',
			'#fe6c61',
			'#8d6dc4',
			'#4cadc9',
			'#cec2ab',
			'#50485b',
			'#75d69c',
			'#f7be68',
			'#5aa1e3',
			'#6dab3c',
			'#f4524d',
			'#f79468',
			'#b97ebb',
			'#ebebeb',
			'#f7f7f7',
			'#0088cc',
			'#58b9da',
			'#6ab165',
			'#ff9900',
			'#ff675b',
			'#555555'
		];

		random = Math.floor( (Math.random() * colors.length) );

		$elem.find( '[name=values_custom_color]' )
			.val( colors[ random ] )
			.trigger('change');
	};

	/**
	 * @since 4.5
	 */
	vc.events.on( 'shortcodes:vc_row:add:param:name:parallax shortcodes:vc_row:update:param:name:parallax',
		function ( model, value ) {
			if ( value ) {
				var params = model.get( 'params' );
				if ( params && params.css ) {
					params.css = params.css.replace( /(background(\-position)?\s*\:\s*[\S]+(\s*[^\!\s]+)?)[\s*\!important]*/g,
						'$1' );
					model.set( 'params', params, { silent: true } );
				}
			}
		}
	);

	/**
	 * BC for single image
	 *
	 * If we have 'link' attribute, but 'onclick' is empty, set 'onclick' to 'custom_link'
	 *
	 * @since 4.8
	 */
	vc.events.on( 'shortcodes:vc_single_image:sync shortcodes:vc_single_image:add', function ( model ) {
		var params = model.get( 'params' );

		if ( params.link && !params.onclick ) {
			params.onclick = 'custom_link';
			model.save( { params: params } );
		}
	} );

	/**
	 * Escape html string
	 *
	 * @param {string} text
	 * @return {string}
	 */
	window.vcEscapeHtml = function ( text ) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		if ( null === text || 'undefined' === typeof (text) ) {
			return '';
		}

		return text.replace( /[&<>"']/g, function ( m ) {
			return map[ m ];
		} );
	};

	window.vc_slugify = function ( text ) {
		return text
			.toLowerCase()
			.replace( /[^\w ]+/g, '' )
			.replace( / +/g, '-' );
	};
})( window.vc, window._, window.jQuery );

(function ( $ ) {
	$.expr.pseudos.containsi = function ( a, i, m ) {
		return 0 <= window.jQuery( a ).text().toUpperCase().indexOf( m[ 3 ].toUpperCase() );
	};
})( window.jQuery );

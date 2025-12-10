(function ( $ ) {
	'use strict';
	if ( _.isUndefined( window.vc ) ) {
		window.vc = {};
	}
	window.Vc_postSettingsEditor = Backbone.View.extend( {
		$editor: false,
		sel: '',
		mode: '',
		is_focused: false,
		ace_enabled: false,
		initialize: function ( sel ) {
			if ( sel && 0 < sel.length ) {
				this.sel = sel;
			}
			this.ace_enabled = true;
		},
		aceEnabled: function () {
			return this.ace_enabled && window.ace && window.ace.edit;
		},
		setEditor: function ( value ) {
			if (this.missingUnfilteredHtml()) {
				return;
			}

			if ( this.aceEnabled() ) {
				this.setEditorAce( value );
			} else {
				this.setEditorTextarea( value );
			}
			return this.$editor;
		},
		missingUnfilteredHtml: function () {
			return $( '#' + this.sel ).hasClass( 'wpb_missing_unfiltered_html' );
		},
		focus: function () {
			if ( ! this.is_focused ) {
				return;
			}
			if ( this.aceEnabled() ) {
				this.$editor.focus();
				var count = this.$editor.session.getLength();
				this.$editor.gotoLine( count, this.$editor.session.getLine( count - 1 ).length );
			} else {
				this.$editor.focus();
			}
		},
		setEditorAce: function ( value ) {
			if ( !this.$editor ) {
				this.$editor = ace.edit( this.sel );
				this.$editor.getSession().setMode( "ace/mode/" + this.mode );
				this.$editor.setTheme( "ace/theme/chrome" );
			}
			this.$editor.setValue( value );
			this.$editor.clearSelection();
			if (this.is_focused) {
				this.$editor.focus();
			}
			var count = this.$editor.getSession().getLength();
			this.$editor.gotoLine( count, this.$editor.getSession().getLine( count - 1 ).length );
			return this.$editor;
		},
		setEditorTextarea: function ( value ) {
			if ( !this.$editor ) {
				this.$editor = $( '<textarea></textarea>' ).css( {
					'width': '100%',
					'height': '100%',
					'minHeight': '300px'
				} );
				$( '#' + this.sel ).empty().append( this.$editor ).css( {
					'overflowLeft': 'hidden',
					'width': '100%',
					'height': '100%'
				} );
			}
			this.$editor.val( value );
			if (this.is_focused) {
				this.$editor.focus();
			}
			this.$editor.parent().css( { 'overflow': 'auto' } );
			return this.$editor;
		},
		setSize: function () {
			var height = $( window ).height() - 380; // @fix ACE editor
			if ( this.aceEnabled() ) {
				$( '#' + this.sel ).css( { 'height': height, 'minHeight': height } );
			} else {
				this.$editor.parent().css( { 'height': height, 'minHeight': height } );
				this.$editor.css( { 'height': '98%', 'width': '98%' } );
			}
		},
		setSizeResizable: function () {
			var $editor = $( '#' + this.sel );
			if ( this.aceEnabled() ) {
				$editor.css( { 'height': '30vh', 'minHeight': '30vh' } );
			} else {
				this.$editor.parent().css( { 'height': '30vh', 'minHeight': '30vh' } );
				this.$editor.css( { 'height': '98%', 'width': '98%' } );
			}
		},
		getEditor: function () {
			return this.$editor;
		},
		getValue: function () {
			if ( this.aceEnabled() ) {
				return this.$editor.getValue();
			} else {
				return this.$editor.val();
			}
		}
	} );
})( window.jQuery );

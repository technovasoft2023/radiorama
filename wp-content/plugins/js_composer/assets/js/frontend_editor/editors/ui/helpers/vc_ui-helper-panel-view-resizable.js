/* global vc, i18nLocale, getUserSetting, setUserSetting */
(function ( $ ) {
	'use strict';
	window.vc.HelperPanelViewResizable = {
		sizeInitialized: false,
		alreadySet: false,
		uiEvents: {
			'show': 'setSavedSize initResize',
			'tabChange': 'setDefaultHeightSettings',
			'afterMinimize': 'setupOnMinimize',
			'afterUnminimize': 'initResize',
			'fixElContainment': 'saveUIPanelSizes'
		},
		setDefaultHeightSettings: function () {
			this.$el.css( 'height', 'auto' );
			this.$el.css( 'maxHeight', '65vh' );
		},
		initResize: function () {
			var _this = this;

			if ( this.$el.data( 'uiResizable' ) ) {
				this.$el.resizable( 'destroy' );
			}
			this.$el.resizable( {
				minHeight: 240,
				minWidth: 380,
				resize: function () {
					_this.trigger( 'resize' );
				},
				handles: "n, e, s, w, ne, se, sw, nw",
				start: function ( e, ui ) {
					_this.trigger( 'beforeResizeStart' );
					_this.$el.css( 'maxHeight', 'none' );
					_this.$el.css( 'height', ui.size.height );
					$( 'iframe' ).css( 'pointerEvents', 'none' ); // TODO: rewrite with css
					_this.trigger( 'afterResizeStart' );
				},
				stop: function () {
					_this.trigger( 'beforeResizeStop' );
					$( 'iframe' ).css( 'pointerEvents', '' );
					_this.saveUIPanelSizes();
					_this.trigger( 'afterResizeStop' );
				}
			} );
			this.content().addClass( 'vc_properties-list-init' );
			this.trigger( 'resize' );
		},
		setSavedSize: function () {
			this.setDefaultHeightSettings();
			if ( vc.is_mobile ) {
				return false;
			}
			let width = 700,
				windoWidth = $(window).width(),
				winHeight = $(window).height(),
				height = this.$el.width();

			var sizes = {
				width: width,
				left: ( windoWidth / 2) - (width / 2),
				top: ( winHeight / 2) - (height /2)
			};

			this.$el.width( sizes.width );
			this.$el.css( 'left', sizes.left );
			this.$el.css( 'top', sizes.top + 40 );
			this.$el.css( 'maxHeight', '60vh' );

			this.sizeInitialized = true;
		},
		saveUIPanelSizes: function () {
			return false;
			if ( false === this.sizeInitialized ) {
				return false;
			}

			setUserSetting( this.panelName + '_vcUIPanelWidth', sizes.width );
			setUserSetting( this.panelName + '_vcUIPanelLeft', sizes.left );
			setUserSetting( this.panelName + '_vcUIPanelTop', sizes.top ); // WordPress doesnt save `-` symbol
		},
		setupOnMinimize: function () {
			if ( this.$el.data( 'uiResizable' ) ) {
				this.$el.resizable( 'destroy' );
			}
			this.$el.resizable( {
				minWidth: 380,
				handles: 'w, e',
				start: function ( e ) {
					$( 'iframe' ).css( 'pointerEvents', 'none' );
				},
				stop: function () {
					$( 'iframe' ).css( 'pointerEvents', '' );
				}
			} );
		}
	};
})( window.jQuery );

/* =========================================================
 * vc_grid_style_lazy_masonry.js v1.0
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * Basic Grid Style show all
 * ========================================================= */
(function ( $ ) {
	'use strict';

	var vcGridStyleLazyMasonry;

	vcGridStyleLazyMasonry = function ( grid ) {
		this.grid = grid;
		this.settings = grid.settings;
		this.$el = false;
		this.filterValue = null;
		this.filtered = false;
		this.$content = false;
		this.isLoading = false;
		this.$loader = $( '<div class="vc_grid-loading"></div>' );
		this.masonryEnabled = false;
		_.bindAll( this, 'setMasonry' );
		this.init();
	};
	vcGridStyleLazyMasonry.prototype = _.extend( {}, window.vcGridStyleLazy.prototype, {
		render: function () {
			this.$el = this.grid.$el;
			this.$content = this.$el;
			this.setIsLoading();
			this.grid.ajax( {}, this.addItems );
		},
		showItems: function () {
			if ( true === this.isLoading ) {
				return false;
			}
			this.setIsLoading();
			var $els = this.$content.find( '.vc_grid_filter-item:not(.vc_visible-item):lt(' + this.settings.items_per_page + ')' );
			var self = this;
			$els.imagesLoaded( function () {
				$els.addClass( 'vc_visible-item' );
				self.setItems( $els );
				if ( self.filtered ) {
					self.filtered = false;
					self.setMasonry();
					self.initScroll();
					window.vc_prettyPhoto();
				}
				self.unsetIsLoading();
				$( window ).trigger( 'grid:items:added', self.$el );
			} );
		},
		setIsLoading: function () {
			this.$el.append( this.$loader );
			this.isLoading = true;
		},
		filter: function ( filter ) {
			filter = _.isUndefined( filter ) || '*' === filter ? '' : filter;
			if ( this.filterValue == filter ) {
				return false; // already filtered
			}
			if ( this.$content.data( 'masonry' ) ) {
				this.$content.masonry( 'destroy' );
			}
			this.masonryEnabled = false;
			this.$content.find( '.vc_visible-item, .vc_grid_filter-item' ).removeClass( 'vc_visible-item vc_grid_filter-item' );
			this.filterValue = filter;
			this.$content
				.find( '.vc_grid-item' + this.filterValue )
				.addClass( 'vc_grid_filter-item' );
			this.filtered = true;
			$(window).on( 'resize', this.setMasonry );
			this.setMasonry();
			_.defer( this.showItems ); // for animation

		},
		setItems: function ( els ) {
			if ( this.masonryEnabled ) {
				this.$content.masonry( 'appended', els );
			} else {
				this.setMasonry();
			}
		},
		setMasonry: function (e) {
			var animation, settings;
			var windowWidth = window.innerWidth;

			if ( windowWidth < window.vcGridSettings.mobileWindowWidth ) {
				if ( this.$content.data( 'masonry' ) ) {
					this.$content.masonry( 'destroy' );
				}
				this.masonryEnabled = false;
			} else if ( this.masonryEnabled ) {
				this.$content.masonry( 'reloadItems' );
				this.$content.masonry( 'layout' );
			} else {
				animation = this.$content.closest( ".vc_grid-container" ).data( 'initial-loading-animation' );
				settings = { itemSelector: ".vc_visible-item", isResizeBound: false };

				if ( "none" === animation ) {
					settings.hiddenStyle = { visibility: "hidden" };
					settings.visibleStyle = { visibility: "visible" };
				} else if ( "fadeIn" === animation ) {
					settings.hiddenStyle = { opacity: 0 };
					settings.visibleStyle = { opacity: 1 };
				} else {
					settings.hiddenStyle = { opacity: 0, transform: "scale(0.001)" };
					settings.visibleStyle = { opacity: 1, transform: "scale(1)" };
				}
				this.$content.masonry( settings );
				// For initial render, call masonry once again
				// because HTML needs to be on the page in order to make calculations
				// event argument will be undefined, for resizing a window it will be an Event object
				if (!e) {
					var _this = this;
					setTimeout(function () {
						_this.$content.masonry( settings );
					}, 100);
				}
				this.masonryEnabled = true;
			}
		}
	} );

	window.vcGridStyleLazyMasonry = vcGridStyleLazyMasonry;
})( window.jQuery );

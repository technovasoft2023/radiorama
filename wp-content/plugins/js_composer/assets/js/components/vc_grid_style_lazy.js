/* =========================================================
 * vc_grid_style_lazy.js v1.0
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * Basic Grid Style lazy loading
 * ========================================================= */

(function ( $ ) {
	'use strict';

	var vcGridStyleLazy;

	(function ( $ ) {
		var VcWaypoint = window.VcWaypoint;

		function VcGridInfinite( $el, options ) {
			var opts;
			opts = $.extend(
				{},
				window.VcWaypoint.defaults,
				{
					container: 'auto',
					items: '.infinite-item',
					offset: 'bottom-in-view'
				},
				options );
			opts.element = $el;
			opts.handler = function ( direction ) {
				if ( 'down' === direction || 'right' === direction ) {
					if ( $el.data( 'vcWaypoint' ) ) {
						$el.data( 'vcWaypoint' ).destroy();
					}
					opts.handle.load.call( this, opts );
				}
			};
			$el.data( 'vcWaypoint', new VcWaypoint( opts ) );
		}

		window.VcGridInfinite = VcGridInfinite;
	})( window.jQuery );
	/**
	 * "Lazy loading" grid style.
	 * ==============================
	 *
	 * @param grid
	 * @constructor
	 */
	vcGridStyleLazy = function ( grid ) {
		this.grid = grid;
		this.settings = grid.settings;
		this.$el = false;
		this.filterValue = null;
		this.$content = false;
		this.isLoading = false;
		this.$loader = $( '<div class="vc_grid-loading"></div>' );
		this.init();
	};

	/**
	 * Initialize
	 */
	vcGridStyleLazy.prototype.setIsLoading = function () {
		this.$content.append( this.$loader );
		this.isLoading = true;
	};

	vcGridStyleLazy.prototype.unsetIsLoading = function () {
		this.isLoading = false;
		if ( this.$loader ) {
			this.$loader.remove();
		}
	};
	vcGridStyleLazy.prototype.init = function () {
		_.bindAll( this, 'addItems', 'showItems', 'setIsLoading' );
	};

	/**
	 * Build required content and data.
	 */
	vcGridStyleLazy.prototype.render = function () {
		this.$el = this.grid.$el;
		this.$content = this.$el;
		this.grid.initFilter();
		this.filter();
		this.showItems();
		this.filterValue = - 1; // Reset for ajax
		window.vc_prettyPhoto();
		_.defer( this.setIsLoading );
		this.grid.ajax( {}, this.addItems );
	};

	vcGridStyleLazy.prototype.showItems = function () {
		var $els = this.$content.find( '.vc_grid_filter-item:not(.vc_visible-item):lt(' + this.settings.items_per_page + ')' );
		this.setIsLoading();
		var animation = this.$content.closest( ".vc_grid-container" ).data( 'initial-loading-animation' );
		vcGridSettings.addItemsAnimation = animation;
		$els.addClass( 'vc_visible-item ' + vcGridSettings.addItemsAnimation + ' animated' );
		this.unsetIsLoading();
		$( window ).trigger( 'grid:items:added', this.$el );
	};

	/**
	 * Filter function called by grid object ot filter content.
	 *
	 * @param filter - string parameter with filter settings.
	 */
	vcGridStyleLazy.prototype.filter = function ( filter ) {
		filter = _.isUndefined( filter ) || '*' === filter ? '' : filter;
		if ( this.filterValue == filter ) {
			return false; // already filtered
		}
		var animation = this.$content.closest( ".vc_grid-container" ).data( 'initial-loading-animation' );
		vcGridSettings.addItemsAnimation = animation;
		this.$content.find( '.vc_visible-item, .vc_grid_filter-item' ).removeClass( 'vc_visible-item vc_grid_filter-item ' + ('none' !== vcGridSettings.addItemsAnimation ? vcGridSettings.addItemsAnimation + ' animated' : '') );
		this.filterValue = filter;
		this.$content
			.find( '.vc_grid-item' + this.filterValue )
			.addClass( 'vc_grid_filter-item' );
		_.defer( this.showItems ); // for animation
		this.initScroll();
	};

	/**
	 * Add new grid elements to content block. This request is sent after load more btn click.
	 * @param html
	 */
	vcGridStyleLazy.prototype.addItems = function ( html ) {
		if ( !html || !html.length ) {
			return;
		}
		var $els = $( html );
		this.$el.html( $els );
		this.unsetIsLoading();
		this.$content = $els.find( '[data-vc-grid-content="true"]' );
		this.grid.initFilter();
		this.filter();
		window.vc_prettyPhoto();
	};

	vcGridStyleLazy.prototype.initScroll = function () {
		var self = this;
		this.$content.unbind( '.vcwaypoint' );
		new window.VcGridInfinite(
			this.$content,
			{
				container: 'auto',
				items: '.vc_grid-item',
				handle: {
					load: function ( opts ) {
						self.showItems();
						self.checkNext( opts );
					}
				}
			}
		);
	};
	vcGridStyleLazy.prototype.checkNext = function ( opts ) {
		if ( this.$content.find( '.vc_grid_filter-item:not(".vc_visible-item")' ).length ) {
			var fn, self = this;
			fn = function () {
				return self.$content.vcwaypoint( opts );
			};
			_.defer( fn );
		}
	};

	window.vcGridStyleLazy = vcGridStyleLazy;
})( window.jQuery );

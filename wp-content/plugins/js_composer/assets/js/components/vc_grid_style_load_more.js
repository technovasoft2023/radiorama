/* =========================================================
 * vc_grid_style_load_more.js v1.0
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * Basic Grid Style load more button
 * ========================================================= */
(function ( $ ) {
	'use strict';
	var vcGridStyleLoadMore;

	/**
	 * "Load more btn" grid style.
	 * ==============================
	 *
	 * @param grid
	 * @constructor
	 */
	vcGridStyleLoadMore = function ( grid ) {
		this.grid = grid;
		this.settings = grid.settings;
		this.$loadMoreBtn = false;
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
	vcGridStyleLoadMore.prototype.setIsLoading = function () {
		if ( this.$loadMoreBtn ) {
			this.$loadMoreBtn.hide();
		}
		this.isLoading = true;
	};

	vcGridStyleLoadMore.prototype.unsetIsLoading = function () {
		this.isLoading = false;
		this.setLoadMoreBtn();
	};
	vcGridStyleLoadMore.prototype.init = function () {
		_.bindAll( this, 'addItems' );
	};

	/**
	 * Build required content and data.
	 */
	vcGridStyleLoadMore.prototype.render = function () {
		this.$el = this.grid.$el;
		this.$content = this.$el;
		this.grid.initFilter();
		this.filter( undefined, true );
		this.showItems( true );
		this.filterValue = - 1;
		window.vc_prettyPhoto();
		this.$content.append( this.$loader );
		this.grid.ajax( {}, this.addItems );
	};

	vcGridStyleLoadMore.prototype.showItems = function ( animate ) {
		var $els = this.$content.find( '.vc_grid_filter-item:not(.vc_visible-item):lt(' + this.settings.items_per_page + ')' );
		this.setIsLoading();
		var animation = this.$content.closest( ".vc_grid-container" ).data( 'initial-loading-animation' );
		window.vcGridSettings.addItemsAnimation = animation;
		$els.addClass( 'vc_visible-item' );
		if ( animate ) {
			$els.addClass( window.vcGridSettings.addItemsAnimation + ' animated' );
		}
		this.unsetIsLoading();
		$( window ).trigger( 'grid:items:added', this.$el );
	};
	/**
	 * Filter function called by grid object or filter content.
	 *
	 * @param filter - string parameter with filter settings.
	 */
	vcGridStyleLoadMore.prototype.filter = function ( filter, animate ) {
		filter = _.isUndefined( filter ) || '*' === filter ? '' : filter;
		if ( this.filterValue == filter ) {
			return false; // already filtered
		}
		this.$content.find( '.vc_visible-item, .vc_grid_filter-item' ).removeClass( 'vc_visible-item vc_grid_filter-item ' );
		this.filterValue = filter;
		this.$content
			.find( '.vc_grid-item' + this.filterValue )
			.addClass( 'vc_grid_filter-item' );
		this.showItems( animate );
	};

	/**
	 * Add new grid elements to content block. This request is sent after load more btn click.
	 * @param html
	 */
	vcGridStyleLoadMore.prototype.addItems = function ( html ) {
		if ( !html || !html.length ) {
			return;
		}
		var $els = $( html );
		this.$el.html( $els );
		this.unsetIsLoading();
		this.$content = $els.find( '[data-vc-grid-content="true"]' );
		this.$loadMoreBtn = $els.find( '[data-vc-grid-load-more-btn="true"] .vc_btn3' );
		if ( !this.$loadMoreBtn.length ) {
			this.$loadMoreBtn = $els.find( '[data-vc-grid-load-more-btn="true"] .vc_btn' );
		}
		var self = this;
		this.$loadMoreBtn.on( 'click', function ( e ) {
			e.preventDefault();
			self.showItems( true );
		} );
		this.$loadMoreBtn.hide();

		this.grid.initFilter();
		this.filter();
		this.$loader.remove();
		window.vc_prettyPhoto();

	};

	/**
	 * Show/hide load more btn.
	 *
	 * If vc_grid-last-item object is appended to grid, btn is hidden.
	 */
	vcGridStyleLoadMore.prototype.setLoadMoreBtn = function () {
		if ( !$( '.vc_grid_filter-item:not(".vc_visible-item")', this.$content ).length || !$( '.vc_grid_filter-item',
			this.$content ).length ) {
			if ( this.$loadMoreBtn ) {
				this.$loadMoreBtn.hide();
			}
		} else {
			if ( this.$loadMoreBtn ) {
				this.$loadMoreBtn.show();
			}
		}
	};

	window.vcGridStyleLoadMore = vcGridStyleLoadMore;
})( window.jQuery );

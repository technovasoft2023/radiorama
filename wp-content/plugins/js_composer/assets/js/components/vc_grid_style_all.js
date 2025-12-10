/* =========================================================
 * vc_grid_style_all.js v1.0
 * =========================================================
 * Copyright 2014 Wpbakery
 *
 * Basic Grid Style show all
 * ========================================================= */
(function ( $ ) {
	'use strict';
	var vcGridStyleAll;

	/**
	 * "Show all items" grid style.
	 * ==============================
	 *
	 * @param grid
	 * @constructor
	 */
	vcGridStyleAll = function ( grid ) {
		this.grid = grid;
		this.settings = grid.settings;
		this.filterValue = null;
		this.$el = false;
		this.$content = false;
		this.isLoading = false;
		this.$loader = $( '<div class="vc_grid-loading"></div>' );
		this.init();
	};
	/**
	 * Initialize
	 */
	vcGridStyleAll.prototype.init = function () {
		_.bindAll( this, 'addItems', 'showItems', 'setIsLoading' );
	};
	/**
	 * Build required content and data.
	 */
	vcGridStyleAll.prototype.render = function () {
		this.$el = this.grid.$el;
		this.$content = this.$el;
		if ( this.$content.find( '.vc_grid-item' ).length ) {
			this.grid.initFilter();
			this.filter();
			this.showItems();
			this.filterValue = - 1; // Reset for ajax
			window.vc_prettyPhoto();
		} else {
			_.defer( this.setIsLoading );
			this.grid.ajax( {}, this.addItems );
		}
	};
	vcGridStyleAll.prototype.setIsLoading = function () {
		this.$content.append( this.$loader );
		this.isLoading = true;
	};

	vcGridStyleAll.prototype.unsetIsLoading = function () {
		this.isLoading = false;
		if ( this.$loader ) {
			this.$loader.remove();
		}
	};
	/**
	 * Filter function called by grid object ot filter content.
	 *
	 * @param filter - string parameter with filter settings.
	 */
	vcGridStyleAll.prototype.filter = function ( filter ) {
		filter = _.isUndefined( filter ) || '*' === filter ? '' : filter;
		if ( this.filterValue == filter ) {
			return false; // already filtered
		}
		var animation = this.$content.closest( ".vc_grid-container" ).data( 'initial-loading-animation' );
		window.vcGridSettings.addItemsAnimation = animation;
		this.$content
			.find( '.vc_visible-item' )
			.removeClass( 'vc_visible-item ' + window.vcGridSettings.addItemsAnimation + ' animated' );
		this.filterValue = filter;
		_.defer( this.showItems ); // just only for animation
	};
	vcGridStyleAll.prototype.showItems = function () {
		var $els = this.$content.find( '.vc_grid-item' + this.filterValue );
		this.setIsLoading();
		var animation = this.$content.closest( ".vc_grid-container" ).data( 'initial-loading-animation' );
		window.vcGridSettings.addItemsAnimation = animation;
		$els.addClass( 'vc_visible-item ' + (
			'none' !== window.vcGridSettings.addItemsAnimation ? window.vcGridSettings.addItemsAnimation + ' animated' : '') );
		this.unsetIsLoading();
		$( window ).trigger( 'grid:items:added', this.$el );
	};
	/**
	 * Add new grid elements to content block. Called by ajax in render method.
	 * @param html
	 */
	vcGridStyleAll.prototype.addItems = function ( html ) {
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

	window.vcGridStyleAll = vcGridStyleAll;
})( window.jQuery );

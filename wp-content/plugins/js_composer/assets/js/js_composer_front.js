document.documentElement.className += ' js_active ';
document.documentElement.className += 'ontouchstart' in document.documentElement ? ' vc_mobile ' : ' vc_desktop ';
(function () {
	var prefix = [
		'-webkit-',
		'-moz-',
		'-ms-',
		'-o-',
		''
	];
	for ( var i = 0; i < prefix.length; i ++ ) {
		if ( prefix[ i ] + 'transform' in document.documentElement.style ) {
			document.documentElement.className += " vc_transform ";
		}
	}
})();
window.VChandledMessages = new Set();
window.VCReloaderTimer = false;

(function ( $ ) {
	if ( 'function' !== typeof (window.vc_js) ) {
		/*
		 On document ready jQuery will fire set of functions.
		 If you want to override function behavior then copy it to your theme js file
		 with the same name.
		 */
		window.vc_js = function () {
			'use strict';
			vc_toggleBehaviour();
			vc_tabsBehaviour();
			vc_accordionBehaviour();
			vc_teaserGrid();
			vc_carouselBehaviour();
			vc_slidersBehaviour();
			vc_prettyPhoto();
			vc_pinterest();
			vc_progress_bar();
			vc_plugin_flexslider();
			vc_gridBehaviour();
			vc_rowBehaviour();
			vc_prepareHoverBox();
			vc_googleMapsPointer();
			vc_ttaActivation(); // @since 4.5
			vc_ttaToggleBehaviour(); // @since 7.0
			init_ut_elements();
			ut_section_design();
			jQuery( document ).trigger( 'vc_js' );
			window.setTimeout( vc_waypoints, 500 );
		};
	}
	$(window).on('resize', function () {
		ut_section_design();
	})
	function trackMessage(messageId) {
		const maxSetSize = 1000;

		if (window.VChandledMessages.size >= maxSetSize) {
			window.VChandledMessages.delete(window.VChandledMessages.values().next().value);
		}
		window.VChandledMessages.add(messageId);
	}

	function safeParse( value ) {
		try {
			value = parseInt(value)
		} catch (e) {}

		return value
	}
	window.ut_section_design = function () {
		$('.vc_section').each( function () {
			let _this = this;
			let desgin_wrap = $(this).find('.section-design');
			let $top_margin = $(this).css('margin-top'), $bottom_margin = $(this).css('margin-bottom'), $left_margin = $(this).css('margin-left'), $right_margin = $(this).css('margin-right');
			let $top_padding = $(this).css('padding-top'), $bottom_padding = $(this).css('padding-bottom'), $left_padding = $(this).css('padding-left'), $right_padding = $(this).css('padding-right');
			desgin_wrap.find('.padding-top').css('height', $top_padding ).html('<span>Padding '+$top_padding+'</span>');
			desgin_wrap.find('.padding-bottom').css('height', $bottom_padding ).html('<span>Padding '+$bottom_padding+'</span>');
			if( safeParse( $top_margin ) > 0 ) {
				desgin_wrap.find('.margin-top').css('height', $top_margin ).css('top', $top_padding ).html('<span>Margin '+$top_margin+'</span>');
			}
			if( safeParse( $bottom_margin ) > 0 ) {
				desgin_wrap.find('.margin-bottom').css('height', $bottom_margin).css('bottom', $bottom_padding ).html('<span>Margin '+$bottom_margin+'</span>');
			}
			if( false ) {
				desgin_wrap.find('.padding-left').css('width', $left_padding ).html('<span>Padding '+$left_padding+'</span>');
			}
			if( false ) {
				desgin_wrap.find('.padding-right').css('width', $right_padding ).html('<span>Padding '+$right_padding+'</span>');
			}
			if( false ) {
				desgin_wrap.find('.margin-left').css('width', $left_margin ).css('left', $left_padding ).html('<span>Margin '+$left_margin+'</span>');
			}
			if( false ) {
				desgin_wrap.find('.margin-right').css('width', $right_margin ).css('right', $right_padding).html('<span>Margin '+$right_margin+'</span>');
			}
		} )
	}
	window.init_ut_elements = function () {

		const handleRender = function (event) {
			if (event.data.eventType === 'UTRefresh' && !window.VChandledMessages.has(event.data.data.messageID)) {

				clearTimeout(window.VCReloaderTimer);
				window.VCReloaderTimer = setTimeout( function () {
					$('.ut-animate-element').trigger('inview', [true]);
					$('.ut-animate-element').trigger('appear', [true]);
					$('.ut-animate-brand-logos').trigger('inview', [true]);
					$('.ut-animate-brand-logos').trigger('appear', [true]);
					$('.ut-glitch-on-appear').trigger('inview', [true]);
					$('.ut-glitch-on-appear').trigger('appear', [true]);
					$('.bklyn-fancy-divider-animated').trigger('inview', [true]);
					$('.bklyn-fancy-divider-animated').trigger('appear', [true]);
					window.UTImageObserver.observe();
					window.UTSimpleImageObserver.observe();
					window.UTBackgroundImageObserver.observe();
					UT_Shortcodes.init();
					if( typeof window.UT_DraggableGallery !== 'undefined') {
						window.UT_DraggableGallery.init();
					}
				}, 600 )
				trackMessage(event.data.data.messageID);
			}
		}
		window.addEventListener('message', handleRender);
	}
	if ( 'function' !== typeof (window.vc_plugin_flexslider) ) {
		window.vc_plugin_flexslider = function ( $parent ) {
			var $slider = $parent ? $parent.find( '.wpb_flexslider' ) : jQuery( '.wpb_flexslider' );
			$slider.each( function () {
				var this_element = jQuery( this );
				var sliderSpeed = 800,
					sliderTimeout = parseInt( this_element.attr( 'data-interval' ), 10 ) * 1000,
					sliderFx = this_element.attr( 'data-flex_fx' ),
					slideshow = true;
				if ( 0 === sliderTimeout ) {
					slideshow = false;
				}

				if ( this_element.is( ':visible' ) ) {
					setTimeout( function () {
						this_element.flexslider( {
							animation: sliderFx,
							slideshow: slideshow,
							slideshowSpeed: sliderTimeout,
							sliderSpeed: sliderSpeed,
							smoothHeight: true
						} );
					}, 1);
				}
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_googleplus) ) {
		/**
		 * Google plus
		 */
		window.vc_googleplus = function () {
			if ( 0 < jQuery( '.wpb_googleplus' ).length ) {
				(function () {
					var po = document.createElement( 'script' );
					po.type = 'text/javascript';
					po.async = true;
					po.src = 'https://apis.google.com/js/plusone.js';
					var s = document.getElementsByTagName( 'script' )[ 0 ];
					s.parentNode.insertBefore( po, s );
				})();
			}
		};
	}

	if ( 'function' !== typeof (window.vc_pinterest) ) {
		/**
		 * Pinterest
		 */
		window.vc_pinterest = function () {
			if ( 0 < jQuery( '.wpb_pinterest' ).length ) {
				(function () {
					var po = document.createElement( 'script' );
					po.type = 'text/javascript';
					po.async = true;
					po.src = 'https://assets.pinterest.com/js/pinit.js';
					var s = document.getElementsByTagName( 'script' )[ 0 ];
					s.parentNode.insertBefore( po, s );
				})();
			}
		};
	}

	if ( 'function' !== typeof (window.vc_progress_bar) ) {
		/**
		 * Progress bar
		 */
		window.vc_progress_bar = function () {
			if ( 'undefined' !== typeof (jQuery.fn.vcwaypoint) ) {
				jQuery( '.vc_progress_bar' ).each( function () {
					var $el = jQuery( this );
					$el.vcwaypoint( function () {
						$el.find( '.vc_single_bar' ).each( function ( index ) {
							var $this = jQuery( this ),
								bar = $this.find( '.vc_bar' ),
								val = bar.data( 'percentage-value' );

							setTimeout( function () {
								bar.css( { "width": val + '%' } );
							}, index * 200 );
						} );
					}, { offset: '85%' } );
				} );
			}
		};
	}

	if ( 'function' !== typeof (window.vc_waypoints) ) {
		/**
		 * Waypoints magic
		 */
		window.vc_waypoints = function () {
			if ( 'undefined' !== typeof (jQuery.fn.vcwaypoint) ) {
				jQuery( '.wpb_animate_when_almost_visible:not(.wpb_start_animation)' ).each( function () {
					var $el = jQuery( this );
					$el.vcwaypoint( function () {
						$el.addClass( 'wpb_start_animation animated' );
					}, { offset: '85%' } );
				} );
			}
		};
	}

	if ( 'function' !== typeof (window.vc_toggleBehaviour) ) {
		/**
		 * Toggle/FAQ
		 * @param $el
		 */
		window.vc_toggleBehaviour = function ( $el ) {
			function event( e ) {
				if ( e && e.preventDefault ) {
					e.preventDefault();
				}
				var title = jQuery( this );
				var element = title.closest( '.vc_toggle' );
				var content = element.find( '.vc_toggle_content' );
				if ( element.hasClass( 'vc_toggle_active' ) ) {
					content.slideUp( {
						duration: 300,
						complete: function () {
							element.removeClass( 'vc_toggle_active' );
						}
					} );
				} else {
					content.slideDown( {
						duration: 300,
						complete: function () {
							element.addClass( 'vc_toggle_active' );
						}
					} );
				}
			}

			if ( $el ) {
				if ( $el.hasClass( 'vc_toggle_title' ) ) {
					$el.unbind( 'click' ).on( 'click', event );
				} else {
					$el.find( ".vc_toggle_title" ).off( 'click' ).on( 'click', event );
				}
			} else {
				jQuery( ".vc_toggle_title" ).off( 'click' ).on( 'click', event );
			}
		};
	}

	if ( 'function' !== typeof (window.vc_ttaToggleBehaviour) ) {
		/**
		 * Toggle content element.
		 * @param $el
		 */
		window.vc_ttaToggleBehaviour = function ( $el ) {
			if ( $el ) {
				$el.find( '.wpb-tta-toggle' ).off( 'click' ).on( 'click', event );
			} else {
				jQuery( '.wpb-tta-toggle' ).off( 'click' ).on( 'click', event );
			}

			// if first pagination element already active than we should activate toggle true
			setTimeout( function () {
				jQuery( '.wpb-tta-toggle' ).each( function () {
					var toggle = jQuery( this );

					var wrapper = toggle.parent().parent().parent();

					var firstPaginationElement = wrapper.find('.vc_tta-panels-container .vc_pagination li:first');
					if (!firstPaginationElement.hasClass('vc_active')) {
						toggle.addClass('wpb-tta-toggle-active');
					}
				});
			}, 1000);

			// if clicking on toggle that click on pagination
			function event() {
				var toggle = jQuery( this );

				toggle.toggleClass('wpb-tta-toggle-active');

				var wrapper = toggle.parent().parent().parent();

				var pagination = wrapper.find('.vc_pagination-item');

				pagination.each( function () {
					if ( ! $(this).hasClass('vc_active')) {
						$(this).find('a').click();
						return false;
					}
				});
			}
		};
	}

	if ( 'function' !== typeof (window.vc_tabsBehaviour) ) {
		/**
		 * Tabs + Tours
		 * @param $tab
		 */
		window.vc_tabsBehaviour = function ( $tab ) {
			if ( jQuery.ui ) {
				var $call = $tab || jQuery( '.wpb_tabs, .wpb_tour' ),
					ver = jQuery.ui && jQuery.ui.version ? jQuery.ui.version.split( '.' ) : '1.10',
					old_version = 1 === parseInt( ver[ 0 ], 10 ) && 9 > parseInt( ver[ 1 ], 10 );
				$call.each( function ( index ) {
					var $tabs,
						interval = jQuery( this ).attr( "data-interval" ),
						tabs_array = [];
					//
					$tabs = jQuery( this ).find( '.wpb_tour_tabs_wrapper' ).tabs( {
						show: function ( event, ui ) {
							wpb_prepare_tab_content( event, ui );
						},
						activate: function ( event, ui ) {
							wpb_prepare_tab_content( event, ui );
						}
					} );
					if ( interval && 0 < interval ) {
						try {
							$tabs.tabs( 'rotate', interval * 1000 );
						} catch ( err ) {
							if ( window.console && window.console.warn ) {
								console.warn( 'tabs behaviours error', err );
							}
						}
					}

					jQuery( this ).find( '.wpb_tab' ).each( function () {
						tabs_array.push( this.id );
					} );

					jQuery( this ).find( '.wpb_tabs_nav li' ).on('click', function ( e ) {
						if ( e && e.preventDefault ) {
							e.preventDefault();
						}
						if ( old_version ) {
							$tabs.tabs( "select", jQuery( 'a', this ).attr( 'href' ) );
						} else {
							$tabs.tabs( "option", "active", jQuery( this ).index() );
						}
						return false;
					} );

					jQuery( this ).find( '.wpb_prev_slide a, .wpb_next_slide a' ).on('click', function ( e ) {
						var index, length;
						if ( e && e.preventDefault ) {
							e.preventDefault();
						}
						if ( old_version ) {
							index = $tabs.tabs( 'option', 'selected' );
							if ( jQuery( this ).parent().hasClass( 'wpb_next_slide' ) ) {
								index ++;
							} else {
								index --;
							}
							if ( 0 > index ) {
								index = $tabs.tabs( "length" ) - 1;
							} else if ( index >= $tabs.tabs( "length" ) ) {
								index = 0;
							}
							$tabs.tabs( "select", index );
						} else {
							index = $tabs.tabs( "option", "active" );
							length = $tabs.find( '.wpb_tab' ).length;

							if ( jQuery( this ).parent().hasClass( 'wpb_next_slide' ) ) {
								index = (index + 1) >= length ? 0 : index + 1;
							} else {
								index = 0 > index - 1 ? length - 1 : index - 1;
							}

							$tabs.tabs( "option", "active", index );
						}

					} );

				} );
			}
		};
	}

	if ( 'function' !== typeof (window.vc_accordionBehaviour) ) {
		/**
		 * Accordions old
		 */
		window.vc_accordionBehaviour = function () {
			jQuery( '.wpb_accordion' ).each( function ( index ) {
				var $this = jQuery( this );
				var $tabs, interval, active_tab, collapsible;

				interval = $this.attr( "data-interval" );
				active_tab = !isNaN( jQuery( this ).data( 'active-tab' ) ) && 0 < parseInt( $this.data( 'active-tab' ), 10 ) ? parseInt( $this.data( 'active-tab' ), 10 ) - 1 : false;
				collapsible = false === active_tab || 'yes' === $this.data( 'collapsible' );
				$tabs = $this.find( '.wpb_accordion_wrapper' ).accordion( {
					header: "> div > h3",
					autoHeight: false,
					heightStyle: "content",
					active: active_tab,
					collapsible: collapsible,
					navigation: true,

					activate: vc_accordionActivate,
					change: function ( event, ui ) {
						if ( 'undefined' !== typeof (jQuery.fn.isotope) ) {
							ui.newContent.find( '.isotope' ).isotope( "layout" );
						}
						vc_carouselBehaviour( ui.newPanel );
					}
				} );
				if ( true === $this.data( 'vcDisableKeydown' ) ) {
					$tabs.data( 'uiAccordion' )._keydown = function () {
					};
				}
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_teaserGrid) ) {
		/**
		 * vc_teaserGrid Teaser grid: isotope
		 */
		window.vc_teaserGrid = function () {
			var layout_modes = {
				fitrows: 'fitRows',
				masonry: 'masonry'
			};
			jQuery( '.wpb_grid .teaser_grid_container:not(.wpb_carousel), .wpb_filtered_grid .teaser_grid_container:not(.wpb_carousel)' ).each( function () {
				var $container = jQuery( this );
				var $thumbs = $container.find( '.wpb_thumbnails' );
				var layout_mode = $thumbs.attr( 'data-layout-mode' );
				$thumbs.isotope( {
					// options
					itemSelector: '.isotope-item',
					layoutMode: ('undefined' === typeof (layout_modes[ layout_mode ]) ? 'fitRows' : layout_modes[ layout_mode ])
				} );
				$container.find( '.categories_filter a' ).data( 'isotope', $thumbs ).on('click', function ( e ) {
					if ( e && e.preventDefault ) {
						e.preventDefault();
					}
					var $thumbs = jQuery( this ).data( 'isotope' );
					jQuery( this ).parent().parent().find( '.active' ).removeClass( 'active' );
					jQuery( this ).parent().addClass( 'active' );
					$thumbs.isotope( { filter: jQuery( this ).attr( 'data-filter' ) } );
				} );
				jQuery( window ).on( 'load resize', function () {
					$thumbs.isotope( "layout" );
				} );
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_carouselBehaviour) ) {
		window.vc_carouselBehaviour = function ( $parent ) {
			var $carousel = $parent ? $parent.find( ".wpb_carousel" ) : jQuery( ".wpb_carousel" );
			$carousel.each( function () {
				var $this = jQuery( this );
				if ( true !== $this.data( 'carousel_enabled' ) && $this.is( ':visible' ) ) {
					$this.data( 'carousel_enabled', true );
					var visible_count = getColumnsCount( jQuery( this ) ),
						carousel_speed = 500;
					if ( jQuery( this ).hasClass( 'columns_count_1' ) ) {
						carousel_speed = 900;
					}
					/* Get margin-left value from the css grid and apply it to the carousele li items (margin-right), before carousele initialization */
					var carousel_li = jQuery( this ).find( '.wpb_thumbnails-fluid li' );
					carousel_li.css( { "margin-right": carousel_li.css( "margin-left" ), "margin-left": 0 } );

					var fluid_ul = jQuery( this ).find( 'ul.wpb_thumbnails-fluid' );
					fluid_ul.width( fluid_ul.width() + 300 );
				}

			} );
		};
	}

	if ( 'function' !== typeof (window.vc_slidersBehaviour) ) {
		window.vc_slidersBehaviour = function () {
			jQuery( '.wpb_gallery_slides' ).each( function ( index ) {
				var this_element = jQuery( this );
				var $imagesGrid;

				if ( this_element.hasClass( 'wpb_slider_nivo' ) ) {
					var sliderSpeed = 800,
						sliderTimeout = this_element.attr( 'data-interval' ) * 1000;

					if ( 0 === sliderTimeout ) {
						sliderTimeout = 9999999999;
					}

					this_element.find( '.nivoSlider' ).nivoSlider( {
						effect: 'boxRainGrow,boxRain,boxRainReverse,boxRainGrowReverse', // Specify sets like: 'fold,fade,sliceDown'
						slices: 15, // For slice animations
						boxCols: 8, // For box animations
						boxRows: 4, // For box animations
						animSpeed: sliderSpeed, // Slide transition speed
						pauseTime: sliderTimeout, // How long each slide will show
						startSlide: 0, // Set starting Slide (0 index)
						directionNav: true, // Next & Prev navigation
						directionNavHide: true, // Only show on hover
						controlNav: true, // 1,2,3... navigation
						keyboardNav: false, // Use left & right arrows
						pauseOnHover: true, // Stop animation while hovering
						manualAdvance: false, // Force manual transitions
						prevText: 'Prev', // Prev directionNav text
						nextText: 'Next' // Next directionNav text
					} );
				} else if ( this_element.hasClass( 'wpb_image_grid' ) ) {
					if ( jQuery.fn.imagesLoaded ) {
						$imagesGrid = this_element.find( '.wpb_image_grid_ul' ).imagesLoaded( function () {
							$imagesGrid.isotope( {
								// options
								itemSelector: '.isotope-item',
								layoutMode: 'fitRows'
							} );
						} );
					} else {
						this_element.find( '.wpb_image_grid_ul' ).isotope( {
							// options
							itemSelector: '.isotope-item',
							layoutMode: 'fitRows'
						} );
					}
				}
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_prettyPhoto) ) {
		window.vc_prettyPhoto = function () {
			try {
				// just in case. maybe prettyphoto isn't loaded on this site
				if ( jQuery && jQuery.fn && jQuery.fn.prettyPhoto ) {
					jQuery( 'a.prettyphoto, .gallery-icon a[href*=".jpg"]' ).prettyPhoto( {
						animationSpeed: "normal",
						hook: "data-rel",
						padding: 15,
						opacity: 0.7,
						showTitle: true,
						allowresize: true,
						counter_separator_label: "/",
						hideflash: false,
						deeplinking: false,
						modal: false,
						callback: function () {
							var url = location.href;
							if ( url.indexOf( "#!prettyPhoto" ) > - 1 ) {
								location.hash = "";
							}
						},
						social_tools: ""
					} );
				}
			} catch ( err ) {
				if ( window.console && window.console.warn ) {
					window.console.warn( 'vc_prettyPhoto initialize error', err );
				}
			}
		};
	}

	if ( 'function' !== typeof (window.vc_google_fonts) ) {
		/**
		 * @deprecated
		 * @returns {boolean}
		 */
		window.vc_google_fonts = function () {
			if ( window.console && window.console.warn ) {
				window.console.warn( 'function vc_google_fonts is deprecated, no need to use it' );
			}
			return false;
		};
	}

	window.vcParallaxSkroll = false;

	if ( 'function' !== typeof (window.vc_rowBehaviour) ) {
		window.vc_rowBehaviour = function () {
			var $ = window.jQuery;

			function fullWidthRow() {
				if ( 'undefined' !== typeof window.wpb_disable_full_width_row_js && window.wpb_disable_full_width_row_js ) {
					return;
				}
				var $elements = $( '[data-vc-full-width="true"]' );
				$.each( $elements, function ( key, item ) {
					var $el = $( this );
					$el.addClass( 'vc_hidden' );

					var $el_full = $el.next( '.vc_row-full-width' );
					if ( !$el_full.length ) {
						$el_full = $el.parent().next( '.vc_row-full-width' ); // need for vc_ie-flexbox-fixer
					}
					if ( !$el_full.length ) {
						return;
					}
					var el_margin_left = parseInt( $el.css( 'margin-left' ), 10 );
					var el_margin_right = parseInt( $el.css( 'margin-right' ), 10 );
					var offset = 0 - $el_full.offset().left - el_margin_left;
					var width = $( window ).width();
					if ( 'rtl' === $el.css( 'direction' ) ) {
						offset -= $el_full.width();
						offset += width;
						offset += el_margin_left;
						offset += el_margin_right;
					}

					var cssProps = {
						'position': 'relative',
						'left': offset,
						'box-sizing': 'border-box',
						'width': width,
						'max-width': width
					};

					$el.css( cssProps );

					if ( !$el.data( 'vcStretchContent' ) ) {
						var padding, paddingRight;
						if ( 'rtl' === $el.css( 'direction' ) ) {
							padding = offset;
							if ( 0 > padding ) {
								padding = 0;
							}
							paddingRight = offset;
							if ( 0 > paddingRight ) {
								paddingRight = 0;
							}
						} else {
							padding = (- 1 * offset);
							if ( 0 > padding ) {
								padding = 0;
							}
							paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
							if ( 0 > paddingRight ) {
								paddingRight = 0;
							}
						}
						$el.css( { 'padding-left': padding + 'px', 'padding-right': paddingRight + 'px' } );

					}
					$el.attr( "data-vc-full-width-init", "true" );
					$el.removeClass( 'vc_hidden' );
					$( document ).trigger( 'vc-full-width-row-single', {
						el: $el,
						offset: offset,
						marginLeft: el_margin_left,
						marginRight: el_margin_right,
						elFull: $el_full,
						width: width,
						maxWidth: width
					} );

				} );
				$( document ).trigger( 'vc-full-width-row', $elements );
			}

			/**
			 * @todo refactor as plugin.
			 * @returns {*}
			 */
			function parallaxRow() {
				var vcSkrollrOptions, vcParallaxSkroll,
					callSkrollInit = false;
				if ( window.vcParallaxSkroll ) {
					window.vcParallaxSkroll.destroy();
				}
				$( '.vc_parallax-inner' ).remove();
				$( '[data-5p-top-bottom]' ).removeAttr( 'data-5p-top-bottom data-30p-top-bottom' );
				$( '[data-vc-parallax]' ).each( function () {
					var skrollrSpeed,
						skrollrSize,
						skrollrStart,
						skrollrEnd,
						$parallaxElement,
						parallaxImage,
						youtubeId;
					callSkrollInit = true; // Enable skrollinit;
					if ( 'on' === $( this ).data( 'vcParallaxOFade' ) ) {
						$( this ).children().attr( 'data-5p-top-bottom', 'opacity:0;' ).attr( 'data-30p-top-bottom',
							'opacity:1;' );
					}

					skrollrSize = $( this ).data( 'vcParallax' ) * 100;
					$parallaxElement = $( '<div />' ).addClass( 'vc_parallax-inner' ).appendTo( $( this ) );
					$parallaxElement.height( skrollrSize + '%' );

					parallaxImage = $( this ).data( 'vcParallaxImage' );

					youtubeId = vcExtractYoutubeId( parallaxImage );

					if ( youtubeId ) {
						insertYoutubeVideoAsBackground( $parallaxElement, youtubeId );
					} else if ( 'undefined' !== typeof (parallaxImage) ) {
						$parallaxElement.css( 'background-image', 'url(' + parallaxImage + ')' );
					}

					skrollrSpeed = skrollrSize - 100;
					skrollrStart = - skrollrSpeed;
					skrollrEnd = 0;

					$parallaxElement.attr( 'data-bottom-top', 'top: ' + skrollrStart + '%;' ).attr( 'data-top-bottom',
						'top: ' + skrollrEnd + '%;' );
				} );

				if ( callSkrollInit && window.skrollr ) {
					vcSkrollrOptions = {
						forceHeight: false,
						smoothScrolling: false,
						mobileCheck: function () {
							return false;
						}
					};
					window.vcParallaxSkroll = skrollr.init( vcSkrollrOptions );
					return window.vcParallaxSkroll;
				}
				return false;
			}

			/**
			 * @todo refactor as plugin.
			 * @returns {*}
			 */
			function fullHeightRow() {
				var $element = $( '.vc_row-o-full-height:first' );
				if ( $element.length ) {
					var $window,
						windowHeight,
						offsetTop,
						fullHeight;
					$window = $( window );
					windowHeight = $window.height();
					offsetTop = $element.offset().top;
					if ( offsetTop < windowHeight ) {
						fullHeight = 100 - offsetTop / (windowHeight / 100);
						$element.css( 'min-height', fullHeight + 'vh' );
					}
				}
				$( document ).trigger( 'vc-full-height-row', $element );
			}

			function fixIeFlexbox() {
				var ua = window.navigator.userAgent;
				var msie = ua.indexOf( "MSIE " );

				if ( msie > 0 || !!navigator.userAgent.match( /Trident.*rv\:11\./ ) ) {
					$( '.vc_row-o-full-height' ).each( function () {
						if ( 'flex' === $( this ).css( 'display' ) ) {
							$( this ).wrap( '<div class="vc_ie-flexbox-fixer"></div>' );
						}
					} );
				}
			}

			$( window ).off( 'resize.vcRowBehaviour' )
				.on( 'resize.vcRowBehaviour', fullWidthRow )
				.on( 'resize.vcRowBehaviour', fullHeightRow );
			fullWidthRow();
			fullHeightRow();
			fixIeFlexbox();
			vc_initVideoBackgrounds(); // must be called before parallax
			parallaxRow();
		};
	}

	if ( 'function' !== typeof (window.vc_gridBehaviour) ) {
		window.vc_gridBehaviour = function () {
			if ( jQuery.fn.vcGrid ) {
				jQuery( '[data-vc-grid]' ).vcGrid();
			}
		};
	}
	/* Helper
	 ---------------------------------------------------------- */
	if ( 'function' !== typeof (window.getColumnsCount) ) {
		window.getColumnsCount = function ( el ) {
			var find = false,
				i = 1;

			while ( false === find ) {
				if ( el.hasClass( 'columns_count_' + i ) ) {
					find = true;
					return i;
				}
				i ++;
			}
		};
	}

	/**
	 * @deprecated
	 * @todo Check if is used somewhere
	 * @param url
	 * @param $obj
	 * @param callback
	 */
	function loadScript( url, $obj, callback ) {
		//
		// var script = document.createElement( "script" );
		// script.type = "text/javascript";
		//
		// if ( script.readyState ) {  //IE
		// 	script.onreadystatechange = function () {
		// 		if ( "loaded" === script.readyState ||
		// 			"complete" === script.readyState ) {
		// 			script.onreadystatechange = null;
		// 			callback();
		// 		}
		// 	};
		// } else {
		// 	//Others
		// }
		//
		// script.src = url;
		// $obj.get( 0 ).appendChild( script );
	}

	if ( 'function' !== typeof (window.wpb_prepare_tab_content) ) {
		/**
		 * Prepare html to correctly display inside tab container
		 *
		 * @param event - ui tab event 'show'
		 * @param ui - jquery ui tabs object
		 */
		window.wpb_prepare_tab_content = function ( event, ui ) {
			var panel = ui.panel || ui.newPanel,
				$pie_charts = panel.find( '.vc_pie_chart:not(.vc_ready)' ),
				$round_charts = panel.find( '.vc_round-chart' ),
				$line_charts = panel.find( '.vc_line-chart' ),
				$carousel = panel.find( '[data-ride="vc_carousel"]' ),
				$ui_panel, $google_maps;
			vc_carouselBehaviour();
			vc_plugin_flexslider( panel );
			if ( ui.newPanel.find( '.vc_masonry_media_grid, .vc_masonry_grid' ).length ) {
				ui.newPanel.find( '.vc_masonry_media_grid, .vc_masonry_grid' ).each( function () {
					var grid = jQuery( this ).data( 'vcGrid' );
					if ( grid && grid.gridBuilder && grid.gridBuilder.setMasonry ) {
						grid.gridBuilder.setMasonry();
					}
				} );
			}
			if ( panel.find( '.vc_masonry_media_grid, .vc_masonry_grid' ).length ) {
				panel.find( '.vc_masonry_media_grid, .vc_masonry_grid' ).each( function () {
					var grid = jQuery( this ).data( 'vcGrid' );
					if ( grid && grid.gridBuilder && grid.gridBuilder.setMasonry ) {
						grid.gridBuilder.setMasonry();
					}
				} );
			}
			if ( $pie_charts.length && jQuery.fn.vcChat ) {
				$pie_charts.vcChat();
			}
			if ( $round_charts.length && jQuery.fn.vcRoundChart ) {
				$round_charts.vcRoundChart( { reload: false } );
			}
			if ( $line_charts.length && jQuery.fn.vcLineChart ) {
				$line_charts.vcLineChart( { reload: false } );
			}
			if ( $carousel.length && jQuery.fn.carousel ) {
				$carousel.carousel( 'resizeAction' );
			}
			$ui_panel = panel.find( '.isotope, .wpb_image_grid_ul' ); // why var name '$ui_panel'?
			$google_maps = panel.find( '.wpb_gmaps_widget' );
			if ( 0 < $ui_panel.length ) {
				$ui_panel.isotope( "layout" );
			}
			if ( $google_maps.length && !$google_maps.is( '.map_ready' ) ) {
				var $frame = $google_maps.find( 'iframe' );
				$frame.attr( 'src', $frame.attr( 'src' ) );
				$google_maps.addClass( 'map_ready' );
			}
			if ( panel.parents( '.isotope' ).length ) {
				panel.parents( '.isotope' ).each( function () {
					jQuery( this ).isotope( "layout" );
				} );
			}
			$( document ).trigger( 'wpb_prepare_tab_content', panel);
		};
	}

	if ( 'function' !== typeof (window.vc_ttaActivation) ) {
		window.vc_ttaActivation = function () {
			jQuery( '[data-vc-accordion]' ).on( 'show.vc.accordion', function ( e ) {
				var $ = window.jQuery, ui = {};
				ui.newPanel = $( this ).data( 'vc.accordion' ).getTarget();
				window.wpb_prepare_tab_content( e, ui );
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_accordionActivate) ) {
		window.vc_accordionActivate = function ( event, ui ) {
			if ( ui.newPanel.length && ui.newHeader.length ) {
				var $pie_charts = ui.newPanel.find( '.vc_pie_chart:not(.vc_ready)' ),
					$round_charts = ui.newPanel.find( '.vc_round-chart' ),
					$line_charts = ui.newPanel.find( '.vc_line-chart' ),
					$carousel = ui.newPanel.find( '[data-ride="vc_carousel"]' );
				if ( 'undefined' !== typeof (jQuery.fn.isotope) ) {
					ui.newPanel.find( '.isotope, .wpb_image_grid_ul' ).isotope( "layout" );
				}
				if ( ui.newPanel.find( '.vc_masonry_media_grid, .vc_masonry_grid' ).length ) {
					ui.newPanel.find( '.vc_masonry_media_grid, .vc_masonry_grid' ).each( function () {
						var grid = jQuery( this ).data( 'vcGrid' );
						if ( grid && grid.gridBuilder && grid.gridBuilder.setMasonry ) {
							grid.gridBuilder.setMasonry();
						}
					} );
				}
				vc_carouselBehaviour( ui.newPanel );
				vc_plugin_flexslider( ui.newPanel );
				if ( $pie_charts.length && jQuery.fn.vcChat ) {
					$pie_charts.vcChat();
				}
				if ( $round_charts.length && jQuery.fn.vcRoundChart ) {
					$round_charts.vcRoundChart( { reload: false } );
				}
				if ( $line_charts.length && jQuery.fn.vcLineChart ) {
					$line_charts.vcLineChart( { reload: false } );
				}
				if ( $carousel.length && jQuery.fn.carousel ) {
					$carousel.carousel( 'resizeAction' );
				}
				if ( ui.newPanel.parents( '.isotope' ).length ) {
					ui.newPanel.parents( '.isotope' ).each( function () {
						jQuery( this ).isotope( "layout" );
					} );
				}
			}
		};
	}

	if ( 'function' !== typeof (window.initVideoBackgrounds) ) {
		/**
		 * @deprecated 6.0
		 */
		window.initVideoBackgrounds = function () {
			if ( window.console && window.console.warn ) {
				window.console.warn( 'this function is deprecated use vc_initVideoBackgrounds' );
			}
			return vc_initVideoBackgrounds();
		};
	}

	if ( 'function' !== typeof (window.vc_initVideoBackgrounds) ) {
		/**
		 * Reinitialize all video backgrounds
		 */
		window.vc_initVideoBackgrounds = function () {
			jQuery( '[data-vc-video-bg]' ).each( function () {
				var $element = jQuery( this ),
					youtubeUrl,
					youtubeId;

				if ( $element.data( 'vcVideoBg' ) ) {
					youtubeUrl = $element.data( 'vcVideoBg' );
					youtubeId = vcExtractYoutubeId( youtubeUrl );

					if ( youtubeId ) {
						$element.find( '.vc_video-bg' ).remove();
						insertYoutubeVideoAsBackground( $element, youtubeId );
					}

					jQuery( window ).on( 'grid:items:added', function ( event, $grid ) {
						if ( !$element.has( $grid ).length ) {
							return;
						}

						vcResizeVideoBackground( $element );
					} );
				} else {
					$element.find( '.vc_video-bg' ).remove();
				}
			} );
		};
	}

	if ( 'function' !== typeof (window.insertYoutubeVideoAsBackground) ) {
		/**
		 * Insert youtube video into element.
		 *
		 * Video will be w/o controls, muted, autoplaying and looping.
		 */
		window.insertYoutubeVideoAsBackground = function ( $element, youtubeId, counter ) {
			if ( 'undefined' == typeof YT || 'undefined' === typeof (YT.Player) ) {
				// wait for youtube iframe api to load. try for 10sec, then abort
				counter = 'undefined' === typeof (counter) ? 0 : counter;
				if ( 100 < counter ) {
					console.warn( 'Too many attempts to load YouTube api' );
					return;
				}

				setTimeout( function () {
					insertYoutubeVideoAsBackground( $element, youtubeId, counter ++ );
				}, 100 );

				return;
			}

			var $container = $element.prepend( '<div class="vc_video-bg"><div class="inner"></div></div>' ).find( '.inner' );

			new YT.Player( $container[ 0 ], {
				width: '100%',
				height: '100%',
				videoId: youtubeId,
				playerVars: {
					playlist: youtubeId,
					iv_load_policy: 3, // hide annotations
					enablejsapi: 1,
					disablekb: 1,
					autoplay: 1,
					controls: 0,
					showinfo: 0,
					rel: 0,
					loop: 1,
					mute: 1,
					wmode: 'transparent'
				},
				events: {
					onReady: function ( event ) {
						event.target.mute().setLoop( true );
					}
				}
			} );

			vcResizeVideoBackground( $element );

			jQuery( window ).on( 'resize', function () {
				vcResizeVideoBackground( $element );
			} );
		};
	}

	if ( 'function' !== typeof (window.vcResizeVideoBackground) ) {
		/**
		 * Resize background video iframe so that video content covers whole area
		 */
		window.vcResizeVideoBackground = function ( $element ) {
			var iframeW,
				iframeH,
				marginLeft,
				marginTop,
				containerW = $element.innerWidth(),
				containerH = $element.innerHeight(),
				ratio1 = 16,
				ratio2 = 9;

			if ( (containerW / containerH) < (ratio1 / ratio2) ) {
				iframeW = containerH * (ratio1 / ratio2);
				iframeH = containerH;

				marginLeft = - Math.round( (iframeW - containerW) / 2 ) + 'px';
				marginTop = - Math.round( (iframeH - containerH) / 2 ) + 'px';

				iframeW += 'px';
				iframeH += 'px';
			} else {
				iframeW = containerW;
				iframeH = containerW * (ratio2 / ratio1);

				marginTop = - Math.round( (iframeH - containerH) / 2 ) + 'px';
				marginLeft = - Math.round( (iframeW - containerW) / 2 ) + 'px';

				iframeW += 'px';
				iframeH += 'px';
			}

			$element.find( '.vc_video-bg iframe' ).css( {
				maxWidth: '1000%',
				marginLeft: marginLeft,
				marginTop: marginTop,
				width: iframeW,
				height: iframeH
			} );
		};
	}

	if ( 'function' !== typeof (window.vcExtractYoutubeId) ) {
		/**
		 * Extract video ID from youtube url
		 */
		window.vcExtractYoutubeId = function ( url ) {
			if ( 'undefined' === typeof (url) ) {
				return false;
			}

			var id = url.match( /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/ );

			if ( null !== id ) {
				return id[ 1 ];
			}

			return false;
		};
	}

	if ( 'function' !== typeof (window.vc_googleMapsPointer) ) {
		window.vc_googleMapsPointer = function () {
			var $ = window.jQuery;
			var $wpbGmapsWidget = $( '.wpb_gmaps_widget' );
			$wpbGmapsWidget.on('click', function () {
				$( 'iframe', this ).css( "pointer-events", "auto" );
			} );

			$wpbGmapsWidget.on( 'mouseleave', function () {
				$( 'iframe', this ).css( "pointer-events", "none" );
			} );

			$( '.wpb_gmaps_widget iframe' ).css( "pointer-events", "none" );
		};
	}
	if ( 'function' !== typeof (window.vc_setHoverBoxPerspective) ) {
		window.vc_setHoverBoxPerspective = function ( hoverBox ) {
			hoverBox.each( function () {
				var $this = jQuery( this );
				var width = $this.width();
				var perspective = width * 4 + 'px';

				$this.css( 'perspective', perspective );
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_setHoverBoxHeight) ) {
		window.vc_setHoverBoxHeight = function ( hoverBox ) {
			hoverBox.each( function () {
				var $this = jQuery( this );
				var hoverBoxInner = $this.find( '.vc-hoverbox-inner' );

				hoverBoxInner.css( 'min-height', 0 );

				var frontHeight = $this.find( '.vc-hoverbox-front-inner' ).outerHeight();
				var backHeight = $this.find( '.vc-hoverbox-back-inner' ).outerHeight();
				var hoverBoxHeight = (frontHeight > backHeight) ? frontHeight : backHeight;
				var maxMin = 250;
				if ( hoverBoxHeight < maxMin ) {
					hoverBoxHeight = maxMin;
				}
				hoverBoxInner.css( 'min-height', hoverBoxHeight + 'px' );
			} );
		};
	}

	if ( 'function' !== typeof (window.vc_prepareHoverBox) ) {
		window.vc_prepareHoverBox = function () {
			var hoverBox = jQuery( '.vc-hoverbox' );

			vc_setHoverBoxHeight( hoverBox );
			vc_setHoverBoxPerspective( hoverBox );
		};
	}

	jQuery( document ).ready( window.vc_prepareHoverBox );
	jQuery(window).on( 'resize', window.vc_prepareHoverBox );

	jQuery( document ).ready( function ( $ ) {
		window.vc_js();
	} );
})( window.jQuery );

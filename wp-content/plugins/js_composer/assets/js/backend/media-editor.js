/* =========================================================
 * media-editor.js v1.0.0
 * =========================================================
 * Copyright 2013 Wpbakery
 *
 * WP 3.5 Media manager integration into WPBakery Page Builder.
 * ========================================================= */
/* global wp, _ */
(function ( $, _ ) {
	'use strict';
	var attachCb = [];
	var media = wp.media,
		origFeaturedImageSet = media.featuredImage.set,
		origEditorSendAttachment = media.editor.send.attachment,
		l10n = i18nLocale,
		workflows = {},
		attachmentCompatRender;

	attachmentCompatRender = _.extend( media.view.AttachmentCompat.prototype.render );
	media.view.AttachmentCompat.prototype.render = function () {
		var attachmentId, that = this;
		attachmentId = this.model.get( 'id' );
		attachmentCompatRender.call( this );
		_.defer( function () {
			var $container, html, $filter, label, $input;

			$container = that.controller.$el.find( '.attachment-info' );
			$input = that.controller.$el.find( '[data-vc-preview-image-filter]' );

			if ( $container.length && $input.length ) {
				label = $input.parent().find( '.vc-filter-label' ).text();
				html = '<div class="vc-filter-wrapper"><label class="setting vc-image-filter-setting">';
				html += '<span class="name">' + label + '</span>';
				html += $input[ 0 ].outerHTML;
				html += '</label></div>';

				if(!$('.vc-filter-wrapper').length) {
					$container.before( html );
				}

				$input.parents( 'tr' ).remove();
			}

			if ( 'undefined' !== typeof (window.vc_selectedFilters) && 'undefined' !== typeof (window.vc_selectedFilters[ attachmentId ]) ) {
				$filter = $( '.media-frame:visible [data-vc-preview-image-filter=' + attachmentId + ']' );

				if ( $filter.length ) {
					$filter.val( window.vc_selectedFilters[ attachmentId ] ).trigger( 'change' );
				}
			}

			previewFilter( attachmentId );
		} );
		return this;
	};

	/**
	 * Intercept default gallery setting function and replace with our filtering functionality
	 */
	media.editor.send.attachment = function ( props, attachment ) {
		attachCb.push( attachment.id );
		processImages( [attachment.id], finishImageProcessing );

		function finishImageProcessing( newAttachment ) {
			var attachment = newAttachment.slice( 0 ).pop().attributes;
			origEditorSendAttachment( props, attachment ).done( function ( html ) {
				origEditorSendAttachmentCallback( html, attachment.id );
			} );
		}

		function origEditorSendAttachmentCallback( html, id ) {
			if ( attachCb && attachCb[ 0 ] !== id ) {
				setTimeout( function () {
					origEditorSendAttachmentCallback( html, id );
				}, 50 );
			} else {
				attachCb.shift();
				media.editor.insert( html );
			}
		}
	};

	/**
	 * Intercept default featured image 'set' function and replace with our filtering functionality
	 */
	media.featuredImage.set = function ( id ) {
		var ids = [id];

		if ( - 1 !== id ) {
			$.ajax( {
				type: 'POST',
				url: window.ajaxurl,
				data: {
					action: 'vc_media_editor_add_image',
					filters: window.vc_selectedFilters,
					ids: ids,
					_vcnonce: window.vcAdminNonce
				}
			} ).done( function ( response ) {
				var newId;
				if ( true === response.success && response.data.ids.length ) {
					newId = response.data.ids.pop();
					origFeaturedImageSet( newId );
				} else {
					origFeaturedImageSet( id );

				}
			} ).fail( function () {
				origFeaturedImageSet( id );
			} );
		} else {
			origFeaturedImageSet( id );
		}
	};

	media.controller.VcSingleImage = media.controller.FeaturedImage.extend( {
		defaults: _.defaults( {
			id: 'vc_single-image',
			filterable: 'uploaded',
			multiple: false,
			toolbar: 'vc_single-image',
			title: l10n.set_image,
			priority: 60,
			syncSelection: false
		}, media.controller.Library.prototype.defaults ),
		updateSelection: function () {
			var selection = this.get( 'selection' ),
				ids = media.vc_editor.getData(),
				attachments;

			if ( 'undefined' !== typeof (ids) && '' !== ids && - 1 !== ids ) {
				attachments = _.map( ids.toString().split( /,/ ), function ( id ) {
					var attachment = media.model.Attachment.get( id );
					if ( !attachment.get( 'url' ) || !attachment.get( 'url' ).length ) {
						attachment.fetch();
					}
					return attachment;
				} );
			}

			selection.reset( attachments );
		}
	} );

	media.controller.VcGallery = media.controller.VcSingleImage.extend( {
		defaults: _.defaults( {
			id: 'vc_gallery',
			title: l10n.add_images,
			toolbar: 'main-insert',
			filterable: 'uploaded',
			library: media.query( { type: 'image' } ),
			multiple: 'add',
			editable: true,
			priority: 60,
			syncSelection: false
		}, media.controller.Library.prototype.defaults )
	} );

	media.VcSingleImage = {
		getData: function () {
			return this.$hidden_ids.val();
		},
		set: function ( selection ) {
			var template = vc.template( $( '#vc_settings-image-block' ).html(), vc.templateOptions.custom );
			this.$img_ul.html( template( selection ) );

			this.$clear_button.show();

			this.$hidden_ids.val( selection.id ).trigger( 'change' );

			return false;
		},
		frame: function ( element ) {
			window.vc_selectedFilters = {};

			this.element = element;

			this.$button = $( this.element );
			this.$block = this.$button.closest( '.edit_form_line' );
			this.$hidden_ids = this.$block.find( '.gallery_widget_attached_images_ids' );
			this.$img_ul = this.$block.find( '.gallery_widget_attached_images_list' );
			this.$clear_button = this.$img_ul.next();

			// TODO: Refactor this all params as template

			if ( this._frame ) {
				return this._frame;
			}
			this._frame = media( {
				state: 'vc_single-image',
				states: [new media.controller.VcSingleImage()]
			} );
			this._frame.on( 'toolbar:create:vc_single-image', function ( toolbar ) {
				this.createSelectToolbar( toolbar, {
					text: l10n.set_image,
					close: false
				} );
			}, this._frame );

			this._frame.state( 'vc_single-image' ).on( 'select', this.select );
			return this._frame;
		},
		select: function () {
			var selection = this.get( 'selection' );
			vc.events.trigger( 'click:media_editor:add_image', selection, 'single' );
		}
	};

	media.view.MediaFrame.VcGallery = media.view.MediaFrame.Post.extend( {
		// Define insert-vc state.
		createStates: function () {
			// Add the default states.
			this.states.add( [
				// Main states.
				new media.controller.VcGallery()
			] );
		},
		// Removing left menu from manager
		bindHandlers: function () {
			media.view.MediaFrame.Select.prototype.bindHandlers.apply( this, arguments );
			this.on( 'toolbar:create:main-insert', this.createToolbar, this );

			var handlers = {
				content: {
					'embed': 'embedContent',
					'edit-selection': 'editSelectionContent'
				},
				toolbar: {
					'main-insert': 'mainInsertToolbar'
				}
			};

			_.each( handlers, function ( regionHandlers, region ) {
				_.each( regionHandlers, function ( callback, handler ) {
					this.on( region + ':render:' + handler, this[ callback ], this );
				}, this );
			}, this );
		},
		// Changing main button title
		mainInsertToolbar: function ( view ) {
			var controller = this;

			this.selectionStatusToolbar( view );

			view.set( 'insert', {
				style: 'primary',
				priority: 80,
				text: l10n.add_images,
				requires: { selection: true },

				click: function () {
					var state = controller.state(),
						selection = state.get( 'selection' );

					vc.events.trigger( 'click:media_editor:add_image', selection, 'gallery' );
					state.trigger( 'insert', selection );
				}
			} );
		}
	} );
	media.vc_editor = _.clone( media.editor );
	_.extend( media.vc_editor, {
		$vc_editor_element: null,
		getData: function () {
			var $button = media.vc_editor.$vc_editor_element,
				$block = $button.closest( '.edit_form_line' ),
				$hidden_ids = $block.find( '.gallery_widget_attached_images_ids' );
			return $hidden_ids.val();
		},
		insert: function ( images ) {
			var $button = media.vc_editor.$vc_editor_element,
				$block = $button.closest( '.edit_form_line' ),
				$hidden_ids = $block.find( '.gallery_widget_attached_images_ids' ),
				$img_ul = $block.find( '.gallery_widget_attached_images_list' ),
				$thumbnails_string = '';

			var template = vc.template( $( '#vc_settings-image-block' ).html(), vc.templateOptions.custom );
			_.each( images, function ( image ) {
				$thumbnails_string += template( image );
			} );

			$hidden_ids.val( _.map( images, function ( image ) {
				return image.id;
			} ).join( ',' ) ).trigger( 'change' );
			$img_ul.html( $thumbnails_string );
		},
		open: function ( id ) {
			var workflow;

			id = this.id( id );

			workflow = this.get( id );

			// Initialize the editor's workflow if we haven't yet.
			if ( !workflow ) {
				workflow = this.add( id );
			}

			window.vc_selectedFilters = {};
			window.setTimeout( function () {
				workflow.state().get( 'library' ).more();
			}, 50 );
			return workflow.open();
		},
		add: function ( id, options ) {
			var workflow = this.get( id );

			if ( workflow ) {
				return workflow;
			}

			if ( workflows[ id ] ) {
				return workflows[ id ];
			}

			workflow = workflows[ id ] = new media.view.MediaFrame.VcGallery( _.defaults( options || {}, {
				state: 'vc_gallery',
				title: l10n.add_images,
				library: { type: 'image' },
				multiple: true
			} ) );

			return workflow;
		},
		init: function () {
			$( 'body' ).off( 'click.vcGalleryWidget' ).on( 'click.vcGalleryWidget',
				'.gallery_widget_add_images',
				function ( event ) {
					event.preventDefault();
					var $this = $( this ),
						editor = 'wpbakery';
					media.vc_editor.$vc_editor_element = $( this );
					if ( 'true' === $this.attr( 'use-single' ) ) {
						media.VcSingleImage.frame( this ).open( 'vc_editor' );
						return;
					}
					$this.blur();
					media.vc_editor.open( editor );
				} );
		}
	} );
	_.bindAll( media.vc_editor, 'open' );

	$( document ).ready( function () {
		media.vc_editor.init();
	} );

	/**
	 * Process specified images and call callback
	 *
	 * @param ids array of int ids
	 * @param callback Processed attachments are passed as first and only argument
	 * @return void
	 */
	function processImages( attachments, callback ) {
		var ids = attachments.models ? attachments.pluck( 'id' ) : attachments;
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
			var models, attachment, i;

			if ( 'function' !== typeof (callback) ) {
				return;
			}

			models = [];

			for ( i = 0; i < response.data.ids.length; i ++ ) {
				if ( "function" === typeof attachment ) {
					attachment = attachments.get( response.data.ids[ i ] );
				} else {
					attachment = attachments[ response.data.ids[ i ] ];
				}
				if ( !attachment ) {
					attachment = media.model.Attachment.get( response.data.ids[ i ] );
				}
				models.push( attachment );
			}

			var checkAttachments = function ( models, callback ) {
				var promises = [];
				for ( var i = 0; i < models.length; i ++ ) {
					if ( !models[ i ].get( 'url' ) ) {
						promises.push( models[ i ].fetch() );
					}
				}
				return promises;
			};
			var promises = checkAttachments( models );
			$.when.apply( $, promises ).done( function () {
				callback( models );
			} );
		} ).fail( function ( response ) {
			$( '.media-modal-close' ).click();
			attachCb = [];
			if ( window.vc && window.vc.active_panel && window.i18nLocale && window.i18nLocale.error_while_saving_image_filtered ) {
				window.vc.active_panel.showMessage( window.i18nLocale.error_while_saving_image_filtered, 'error' );
			}
			if ( window.console && window.console.warn ) {
				window.console.warn( 'processImages failed', response );
			}
		} ).always( function () {
			$( '.media-modal' ).removeClass( 'processing-media' );
		} );
	}

	vc.events.on( 'click:media_editor:add_image', function ( selection, type ) {
		$( '.media-modal' ).addClass( 'processing-media' );

		function finishImageProcessing( newAttachments ) {
			var attachments,
				objects;

			attachments = _.map( newAttachments, function ( newAttachment ) {
				return newAttachment.attributes;
			} );

			selection.reset( attachments );

			objects = _.map( selection.models, function ( model ) {
				return model.attributes;
			} );

			if ( 'undefined' === typeof (type) ) {
				type = '';
			}

			switch ( type ) {
				case 'gallery':
					media.vc_editor.insert( objects );
					break;

				case 'single':
					media.VcSingleImage.set( objects[ 0 ] );
					break;
			}

			$( '.media-modal' ).removeClass( 'processing-media' );
			$( '.media-modal-close' ).click();
		}

		processImages( selection, finishImageProcessing );
	} );

	/**
	 * Trigger preview when filter dropdown is changed
	 */
	$( 'body' ).on( 'change', '[data-vc-preview-image-filter]', function () {
		var id;
		id = $( this ).data( 'vcPreviewImageFilter' );
		if ( 'undefined' === typeof (window.vc_selectedFilters) ) {
			window.vc_selectedFilters = {};
		}
		window.vc_selectedFilters[ id ] = $( this ).val();
		previewFilter( id );
	} );

	/**
	 * Fetch and display filter preview
	 *
	 * Original image src is backuped so preview can be removed
	 *
	 * @param  attachmentId
	 */
	function previewFilter( attachmentId ) {
		var $previewContainer, $preview, $filter;

		$filter = $( '.media-frame:visible [data-vc-preview-image-filter=' + attachmentId + ']' );

		if ( !$filter.length ) {
			return;
		}

		$previewContainer = $( '.media-frame:visible .attachment-info .thumbnail-image' ).eq( - 1 );
		$preview = $previewContainer.find( 'img' );

		$previewContainer.addClass( 'loading' );

		if ( !$preview.data( 'original-src' ) ) {
			$preview.data( 'original-src', $preview.attr( 'src' ) );
		}

		if ( !$filter.val().length ) {
			$preview.attr( 'src', $preview.data( 'original-src' ) );
			$previewContainer.removeClass( 'loading' );
			return;
		}

		$.ajax( {
			type: 'POST',
			dataType: 'json',
			url: window.ajaxurl,
			data: {
				action: 'vc_media_editor_preview_image',
				filter: $filter.val(),
				attachment_id: attachmentId,
				preferred_size: window.getUserSetting( 'imgsize', 'medium' ),
				_vcnonce: window.vcAdminNonce
			}
		} ).done( function ( response ) {
			if ( !response.success || !response.data.src.length ) {
				return;
			}

			$preview.attr( 'src', response.data.src );
		} ).fail( function ( jqXHR, textStatus, errorThrown ) {
			window.console.warn( 'Filter preview failed:', textStatus, errorThrown );
		} ).always( function () {
			$previewContainer.removeClass( 'loading' );
		} );
	}

}( window.jQuery, window._ ));

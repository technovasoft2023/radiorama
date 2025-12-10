(function ( $ ) {
	'use strict';

	$( function () {
		if ( window.vc && window.vc.events ) {
			var $undoControl, $redoControl, renderNewContent, checkControls;
			$undoControl = $( '#vc_navbar-undo' );
			$redoControl = $( '#vc_navbar-redo' );

			checkControls = function () {
				$undoControl.attr( 'disabled', !window.vc.undoRedoApi.canUndo() );
				$redoControl.attr( 'disabled', !window.vc.undoRedoApi.canRedo() );
			};

			renderNewContent = function ( content ) {
				vc.createOverlaySpinner();
				// Firstly destroy all the current models
				while ( vc.shortcodes.models.length ) {
					vc.shortcodes.models[ 0 ].destroy();
				}
				vc.shortcodes.reset( [], { silent: true } );
				_.delay( function () {
					var models;
					if ( content.length ) {
						models = vc.builder.parse( [], content );
					} else {
						models = [];
					}
					if ( models.length ) {
						_.each( models, function ( model ) {
							vc.builder.create( model );
						} );
					}
					vc.builder.render(
						function () {
							_.delay( function () {
								window.vc.undoRedoApi.unlock();
								vc.removeOverlaySpinner();
							}, 100 );
						}
					);
				}, 50 );
			};

			window.vc.events.on( 'undoredo:add undoredo:undo undoredo:redo undoredo:lock undoredo:unlock', checkControls );

			$undoControl.on( 'click.vc-undo', function ( e ) {
				if ( $( this ).is( '[disabled]' ) || window.vc.undoRedoApi.isLocked() ) {
					if ( e && e.preventDefault ) {
						e.preventDefault();
					}
					return;
				}
				window.vc.undoRedoApi.lock();
				var newContent = window.vc.undoRedoApi.undo();

				renderNewContent( newContent );
			} );
			$redoControl.on( 'click.vc-redo', function ( e ) {
				if ( $( this ).is( '[disabled]' ) || window.vc.undoRedoApi.isLocked() ) {
					if ( e && e.preventDefault ) {
						e.preventDefault();
					}
					return;
				}
				window.vc.undoRedoApi.lock();
				var newContent = window.vc.undoRedoApi.redo();

				renderNewContent( newContent );
			} );
		}
	} );
})( window.jQuery );

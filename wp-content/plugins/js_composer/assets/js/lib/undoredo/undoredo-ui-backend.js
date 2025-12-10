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
				vc.storage.setContent( content );
				vc.shortcodes.fetch( { reset: true } );

				_.delay( function () {
					window.vc.undoRedoApi.unlock();
				}, 50 );
			};

			window.vc.events.on( 'undoredo:add undoredo:undo undoredo:redo undoredo:lock undoredo:unlock', _.debounce( checkControls, 150 ) );

			$undoControl.on( 'click.vc-undo', function ( e ) {
				if ( $( this ).is( '[disabled]' ) || window.vc.undoRedoApi.isLocked() ) {
					if ( e && e.preventDefault ) {
						e.preventDefault();
					}
					return;
				}
				vc.closeActivePanel();
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
				vc.closeActivePanel();
				window.vc.undoRedoApi.lock();
				var newContent = window.vc.undoRedoApi.redo();

				renderNewContent( newContent );
			} );
		}
	} );
})( window.jQuery );

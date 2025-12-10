(function () {
	'use strict';

	var undo_redo_core, undo_redo_api;

	undo_redo_core = {
		stack: [],
		stackPosition: 0,
		stackHash: JSON.stringify( '' ),
		zeroState: null,
		locked: false,
		add: function ( data ) {
			// Do not store same data again
			if ( null === this.zeroState ) {
				this.setZeroState( data );
			}
			if ( this.stackHash === JSON.stringify( data ) ) {
				return;
			}
			if ( this.can( 'redo' ) ) {
				this.stack = this.stack.slice( 0, this.stackPosition );
			}
			this.stack.push( data );
			this.stackPosition = this.stack.length;
			this.stackHash = JSON.stringify( this.get() );
		},
		can: function ( what ) {
			var result = false;
			if ( 'undo' === what ) {
				result = this.stack.length > 0 && this.stackPosition > 0;
			} else if ( 'redo' === what ) {
				result = this.stack.length > 0 && this.stackPosition < this.stack.length;
			}

			return result;
		},
		undo: function () {
			if ( this.can( 'undo' ) ) {
				this.stackPosition -= 1;
				this.stackHash = JSON.stringify( this.get() );
			}
		},
		redo: function () {
			if ( this.can( 'redo' ) ) {
				this.stackPosition += 1;
				this.stackHash = JSON.stringify( this.get() );
			}
		},
		set: function ( index ) {
			if ( this.stackPosition < index ) {
				this.stack = this.stack.slice( index - this.stackPosition );
				this.stackHash = JSON.stringify( this.get() );
				return true;
			}
			return false;
		},
		get: function () {
			if ( this.stackPosition < 1 ) {
				return this.zeroState;
			} else {
				return this.stack[ this.stackPosition - 1 ];
			}
		},
		setZeroState: function ( data ) {
			this.zeroState = data;
			this.stackHash = JSON.stringify( this.get() );
		}
	};

	undo_redo_api = {
		add: function ( document ) {
			if ( true !== undo_redo_core.locked ) {
				undo_redo_core.add( document );
				window.vc.events.trigger( 'undoredo:add', document );
			}
		},
		getCurrentPosition: function () {
			return undo_redo_core.stackPosition;
		},
		undo: function () {
			undo_redo_core.undo();
			window.vc.events.trigger( 'undoredo:undo' );
			return undo_redo_api.get();
		},
		redo: function () {
			undo_redo_core.redo();
			window.vc.events.trigger( 'undoredo:redo' );
			return undo_redo_api.get();
		},
		get: function () {
			return undo_redo_core.get();
		},
		canUndo: function () {
			return !this.isLocked() && undo_redo_core.can( 'undo' );
		},
		canRedo: function () {
			return !this.isLocked() && undo_redo_core.can( 'redo' );
		},
		setZeroState: function ( data ) {
			if ( null === undo_redo_core.zeroState ) {
				this.add( data );
			} else {
				undo_redo_core.setZeroState( data );
			}
		},
		lock: function () {
			undo_redo_core.locked = true;
			window.vc.events.trigger( 'undoredo:lock' );
		},
		unlock: function () {
			undo_redo_core.locked = false;
			window.vc.events.trigger( 'undoredo:unlock' );
		},
		isLocked: function () {
			return true === undo_redo_core.locked;
		}
	};

	if ( 'undefined' === typeof window.vc ) {
		window.vc = {};
	}
	window.vc.undoRedoApi = undo_redo_api;
})();

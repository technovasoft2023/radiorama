if (!window.vc) {
	window.vc = {};
}
(function () {
	'use strict';

	vc.pasteShortcode = function (model, builder, content) {
		if (content) {
			pasteIntoEditor(model, builder, content);
		} else if (!navigator.clipboard) { // If clipboard api is not available paste data from local storage
			pasteIntoEditor(model, builder, 'fromLocalStorage');
		} else {
			// If clipboard available check clipboard permissions, if granted paste from clipboard, else paste from local storage
			navigator.permissions.query({ name: 'clipboard-read' }).then(
				function (permission) {
					if ('granted' === permission.state) {
						navigator.clipboard.readText().then(function ( cliptext) {
							pasteIntoEditor(model, builder, cliptext);
						});
					} else {
						pasteIntoEditor(model, builder, 'fromLocalStorage');
					}
				}
			).catch(function () {
				pasteIntoEditor(model, builder, 'fromLocalStorage');
			});
		}
	};
	vc.copyShortcode = function (model) {
		var shortcodeString = vc.shortcodes.createShortcodeString(model);
		localStorage.setItem('copiedShortcode', JSON.stringify(shortcodeString));
		copyTextToClipboard(shortcodeString);
	};

	function pasteIntoEditor (model, builder, text) {
		if ('fromLocalStorage' === text) {
			text = JSON.parse(localStorage.getItem('copiedShortcode'));
		}
		var parent = false;
		if (model) {
			parent = model.get('id');
		}

		var shortcodes = Object.values(builder ?
			vc.ShortcodesBuilder.prototype.parse({}, text, parent) :
			vc.storage.parseContent({}, text, parent));

		for (var i = 0; i < shortcodes.length; i++) {
			var shortcode = shortcodes[i];
			if (isPasteDisabled(model, shortcode, shortcodes)) {
				break;
			}
			var elementModel = 0 === i ? model : false;
			shortcodeToPaste(elementModel, shortcode, shortcodes, builder);
		}
		if (builder) {
			builder.render();
		}
	}

	/**
	 * Check if copied element can be pasted into the target element
	 * Allowed interactions
	 * Note: Took these element props into consideration: as_parent, as_child, allowed_container_element, is_container
	 * (PA: Paste after, TTA: Tab, Tour, Accordion)
	 *
	 * Section -> Row(PA), Section(PA)
	 * Row -> Section, Row(PA)
	 * Inner Row -> Column, TTA Section, Inner Row(PA)
	 * Element -> Column, Inner Column, TTA Section
	 * TTA -> Column
	 * TTA Section -> TTA
	 *
	 * @since 7.1
	 * @param model:Object (Target Element),
	 * @param shortcode: Object (Iterating element in copied shortcode),
	 * @param shortcodes: Object (All elements in copied shortcode),
	 */
	var isPasteDisabled = function (model, shortcode, shortcodes) {
		var isDisabled = true;
		if (model) {
			var variables = getPasteConditionVariables(model, shortcode, shortcodes);
			var isModelRow = variables.isModelRow;
			var isModelSection = variables.isModelSection;
			var isModelColumn = variables.isModelColumn;
			var isModelColumnInner = variables.isModelColumnInner;
			var isModelRowInner = variables.isModelRowInner;
			var isModelTtaSection = variables.isModelTtaSection;
			var isTopShortcodeRow = variables.isTopShortcodeRow;
			var isTopShortcodeRowInner = variables.isTopShortcodeRowInner;
			var isTopShortcodeSection = variables.isTopShortcodeSection;
			var containerPreventsShortcode = variables.containerPreventsShortcode;
			var isShortcodeContainer = variables.isShortcodeContainer;
			var shortcodeRejectsAsChild = variables.shortcodeRejectsAsChild;
			var containerRejectsAsParent = variables.containerRejectsAsParent;

			isDisabled = ( // Prevent pasting if...
				(isShortcodeContainer && (
				(containerPreventsShortcode && !(isModelTtaSection && isTopShortcodeRowInner)) || // Prevent not allowed_container_elements to paste (Exception: Inner Row -> TTA Section)
				(!containerPreventsShortcode && (isModelTtaSection && isTopShortcodeRow)) || // Exception: Prevent Row -> TTA Section, even it is allowed_container_elements to paste
				(isModelRow && !(isTopShortcodeRow || isTopShortcodeSection)) || // Prevent pasting anything into row (Exception elements to allow paste after logic: Row & Section)
				(isModelRowInner && !isTopShortcodeRowInner) || // Prevent pasting anything into inner row (Exception element to allow paste after logic: Inner Row)
				(isModelColumn && isTopShortcodeRow) || // Prevent pasting Row into Column (Inner Row is allowed)
				(isModelColumnInner && (isTopShortcodeRowInner || isTopShortcodeRow)) // Prevent pasting Row & Inner Row into Column Inner
			)) ||
			(!isShortcodeContainer && (isModelRow || isModelRowInner)) || // Prevent pasting elements (which are not containers) into rows
			((shortcodeRejectsAsChild || containerRejectsAsParent) && !((isTopShortcodeSection && (isModelSection || isModelRow)))) // Prevent pasting for elements which rejected by props section element (Except section, to be able to paste after it)
		);

		} else {
			if('vc_row' === shortcodes[0].shortcode) {
				isDisabled = false;
			}
		}
		return isDisabled;
	};
	var shortcodeToPaste = function (model, shortcode, shortcodes, builder) {
		var newModel;
		var model_paste = Object.assign({}, shortcode);
		if (model) {
			var variables = getPasteConditionVariables(model, shortcode, shortcodes);
			var isModelRow = variables.isModelRow;
			var isModelRowInner = variables.isModelRowInner;
			var isModelSection = variables.isModelSection;
			var isTopShortcodeRow = variables.isTopShortcodeRow;
			var isTopShortcodeRowInner = variables.isTopShortcodeRowInner;
			var isTopShortcodeSection = variables.isTopShortcodeSection;
			var isModelContainer = variables.isModelContainer;

			// On paste assign new id to tta_sections to prevent duplicate ids
			if (model_paste.params.tab_id) {
				model_paste.params.tab_id = (Date.now() + '-' + vc_guid());
			}

			// Set parent id as the parent of pasted element to apply paste after logic
			if ((isModelRowInner && isTopShortcodeRowInner) ||
				(isModelRow && isTopShortcodeRow) ||
				(!model.get('parent_id') &&
					!(isModelSection && isTopShortcodeRow)
				)) {
				if (builder) {
					model_paste.place_after_id = model.get('id');
				}
				model_paste.parent_id = model.get('parent_id');
			} else if (isModelContainer && !isModelRow) {
				model_paste.parent_id = model.get('id');
			}

			// Set new order
			if ((isModelRow || isModelRowInner) &&
				(isTopShortcodeRow || isTopShortcodeRowInner) ||
				((isModelRow || isModelSection) && isTopShortcodeSection)
			) {
				model_paste.order = parseFloat(model.get('order')) + vc.clone_index;
			}
		}

		if (builder) {
			builder.create(model_paste);
			newModel = builder.last();
		} else {
			newModel = vc.shortcodes.create(model_paste);
		}

		return newModel;
	};
	var getPasteConditionVariables = function (model, shortcode, shortcodes) {
		var modelShortcode = model.get('shortcode');
		var allowedContainerElement = vc.map[modelShortcode].allowed_container_element;
		var asParent = vc.map[modelShortcode].as_parent && vc.map[modelShortcode].as_parent.only;
		var asChild = vc.map[shortcodes[0].shortcode].as_child && vc.map[shortcodes[0].shortcode].as_child.only;
		var variables = {
			isModelRow: 'vc_row' === modelShortcode,
			isModelSection: 'vc_section' === modelShortcode,
			isModelColumn: 'vc_column' === modelShortcode,
			isModelColumnInner: 'vc_column_inner' === modelShortcode,
			isModelRowInner: 'vc_row_inner' === modelShortcode,
			isModelTtaSection: 'vc_tta_section' === modelShortcode,
			isModelContainer: vc.map[modelShortcode].is_container,
			isTopShortcodeRow: 'vc_row' === shortcodes[0].shortcode,
			isTopShortcodeRowInner: 'vc_row_inner' === shortcodes[0].shortcode,
			isTopShortcodeSection: 'vc_section' === shortcodes[0].shortcode,
			containerPreventsShortcode: ('string' === typeof allowedContainerElement && (!allowedContainerElement.includes(shortcodes[0].shortcode))) || false === allowedContainerElement,
			isShortcodeContainer: vc.map[shortcodes[0].shortcode].is_container,
			shortcodeRejectsAsChild: 'string' === typeof asChild && (!asChild.includes(modelShortcode)),
			containerRejectsAsParent: 'string' === typeof asParent && (!asParent.includes(shortcodes[0].shortcode)),
		};
		return variables;
	};

	function fallbackCopyTextToClipboard (text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Unable to copy', err);
		}
		document.body.removeChild(textArea);
	}

	function copyTextToClipboard (text) {
		if (!navigator.clipboard) {
			fallbackCopyTextToClipboard(text);
			return;
		}
		navigator.clipboard.writeText(text);
	}
})();

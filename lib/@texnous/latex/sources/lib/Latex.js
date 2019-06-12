/**
 * @fileoverview General LaTeX definitions.
 * This file is a part of TeXnous project.
 *
 * @copyright TeXnous project team (http://texnous.org) 2016-2017
 * @license LGPL-3.0
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the
 * GNU Lesser General Public License as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this library;
 * if not, write to the Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA
 * 02111-1307, USA.
 */

"use strict";

/**
 * General LaTeX definitions
 * @namespace
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
const Latex = {};



/**
 * LaTeX lexeme
 * @enum {string}
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Latex.Lexeme = {
	BINARY_OPERATOR:     "BINARY_OPERATOR", // mathematical binary operator
	BRACKETS:            "BRACKETS",  // logical brackets
	CAPTION:             "CAPTION",  // caption for any object
	CELL_SEPARATOR:      "CELL_SEPARATOR", // table cell separator
	CHAR:                "CHAR",  // character
	DIGIT:               "DIGIT",  // digit
	DIRECTIVE:           "DIRECTIVE",  // LaTeX directive
	DISPLAY_EQUATION:    "DISPLAY_EQUATION", // mathematical equation for display mode
	FLOATING_BOX:        "FLOATING_BOX", // floating box
	GRAPHICS:            "GRAPHICS",  // picture or other graphics
	HEADING:             "HEADING",  // section heading
	HORIZONTAL_SKIP:     "HORIZONTAL_SKIP", // any type of horizontal skip but not space
	INLINE_EQUATION:     "INLINE_EQUATION", // mathematical equation for inline mode
	LABEL:               "LABEL",  // label identifier
	LENGTH:              "LENGTH",  // linear dimension
	LETTER:              "LETTER",  // word letter
	LINE_BREAK:          "LINE_BREAK",  // text line break
	LIST_ITEM:           "LIST_ITEM",  // list item
	LIST:                "LIST",  // list of items
	NUMBER:              "NUMBER",  // sequence of digits
	PARAGRAPH_SEPARATOR: "PARAGRAPH_SEPARATOR", // paragraph separator
	POST_OPERATOR:       "POST_OPERATOR", // mathematical post-operator
	PRE_OPERATOR:        "PRE_OPERATOR", // mathematical pre-operator
	PUNCTUATION:         "PUNCTUATION",  // punctuation mark
	RAW:                 "RAW",   // unprocessable or raw sources
	SPACE:               "SPACE",  // any type of space equivalent
	SUBSCRIPT:           "SUBSCRIPT",  // subscript text
	SUPERSCRIPT:         "SUPERSCRIPT",  // subscript text
	TABLE:               "TABLE",  // table
	TABULAR_PARAMETERS:  "TABULAR_PARAMETERS", // LaTeX tabular parameters
	TAG:                 "TAG",   // formatting tag
	UNKNOWN:             "UNKNOWN",  // unrecognized element
	URL:                 "URL",   // web url or file system path
	VERTICAL_SKIP:       "VERTICAL_SKIP", // any type of vertical skip
	WORD:                "WORD",  // sequence of letters
	WRAPPER:             "WRAPPER"  // wrapper for something
};



/**
 * LaTeX modes
 * @enum {string}
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Latex.Mode = {
	LIST:     "LIST", // list of items
	MATH:     "MATH", // mathematical expressionLatex
	PICTURE:  "PICTURE", // picture
	TABLE:    "TABLE", // LaTeX tabular
	TEXT:     "TEXT", // general text
	VERTICAL: "VERTICAL" // vertical spacing
};



/**
 * LaTeX state encapsulation
 * @class Latex.State
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Latex.State = class {
	/**
	 * Constructor
	 * @param {!Object.<Latex.Mode,boolean>=} initialModeStates the initial mode states
	 * @constructor
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor(initialModeStates) {
		Object.defineProperty(this, "_modeStates", { value: {}, enumerable: false });
		this._modeStates[Latex.Mode.LIST]     = false;
		this._modeStates[Latex.Mode.MATH]     = false;
		this._modeStates[Latex.Mode.PICTURE]  = false;
		this._modeStates[Latex.Mode.TABLE]    = false;
		this._modeStates[Latex.Mode.TEXT]     = true;
		this._modeStates[Latex.Mode.VERTICAL] = false;
		// update the mode states
		if (initialModeStates !== undefined) this.update(initialModeStates);
	}


	/**
	 * Create a copy of this state.
	 * @return {!Latex.State} the created copy
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	copy() {
		return new Latex.State(this._modeStates);
	}


	/**
	 * Update the state with states for modes
	 * @param {!Object.<Latex.Mode,boolean>} modeStates the states for modes
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	update(modeStates) {
		if (modeStates instanceof Object) { // test type
			Object.keys(modeStates).forEach(mode => { // for all the modes
				if (Latex.Mode[mode] === undefined) // if the mode is unknown
					throw new TypeError("\"modeStates[\"" + mode + "\"]\" isn't a Latex.Mode option");
				this._modeStates[mode] = modeStates[mode]; // store the mode state
			});
		} else {
			throw new TypeError("\"modeStates\" isn't an Object instance");
		}
	}


	/**
	 * Test the state with mode states
	 * @param {!Object.<Latex.Mode,boolean>} modeStates the states for modes
	 * @return {boolean} true if the state fits the modes, false otherwise
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	test(modeStates) {
		if (modeStates instanceof Object) { // type test
			return Object.keys(modeStates).every(mode => { // test all the modes
				if (Latex.Mode[mode] === undefined) // if the mode is unknown
					throw new TypeError("\"modeStates[\"" + mode + "\"]\" isn't a Latex.Mode option");
				return this._modeStates[mode] === modeStates[mode]; // test the mode
			});
		} else {
			throw new TypeError("\"modeStates\" isn't an Object instance");
		}
	}


	/**
	 * Get the string representation of this state
	 * @return {string} the string
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	toString() {
		return "{ " + Object.keys(this._modeStates).sort().map(mode => mode + ": " + this._modeStates[mode]).join(", ") + " }";
	}
};
Object.defineProperty(Latex.State.prototype.constructor, "name", { value: "Latex.State", enumerable: true });



/**
 * LaTeX directive
 * @enum {string}
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Latex.Directive = {
	BEGIN: "BEGIN", // begin something
	END:   "END" // end something
};



/**
 * Group operand for directives
 * @const {string}
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Latex.GROUP = "GROUP";



/**
 * LaTeX operation properties
 * @typedef {Object} Latex.OperationProperties
 * @property {Latex.Directive} directive - The directive or null if there is no a directive
 * @property {Latex.Mode|Latex.GROUP} operand - The operand or null if there is no an operand
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX operation encapsulation
 * @class Latex.Operation
 * @property {Latex.Directive} directive - The directive or null if there is no a directive
 * @property {Latex.Mode|Latex.GROUP} operand - The operand or null if there is no an operand
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Latex.Operation = class {
	/**
	 * Constructor
	 * @param {!Latex.OperationProperties=} initialProperties the initial property values
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor(initialProperties) {
		if (initialProperties === undefined) return; // do nothing if the initial properties aren't defined
		if (initialProperties instanceof Object) { // type test
			let directive = Latex.Directive[initialProperties.directive]; // validate the directive
			if (!directive)
				throw new TypeError("\"initialProperties.directive\" isn't an Latex.Directive option");
			// store the directive
			Object.defineProperty(this, "directive", { value: directive, enumerable: true });
			if (initialProperties.operand === Latex.GROUP) { // if the operand is a group
				// store the operand
				Object.defineProperty(this, "operand", { value: Latex.GROUP, enumerable: true });
			} else { // if the operand is a mode
				let mode = Latex.Mode[initialProperties.operand]; // validate the operand as a mode
				if (!mode) throw new TypeError("\"initialProperties.operand\" isn't an Latex.Mode option");
				// store the operand
				Object.defineProperty(this, "operand", {value: mode, enumerable: true});
			}
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}

	/**
	 * Compare this operation with the other
	 * @param {!Latex.Operation} other the operation to compare with
	 * @return {boolean} True if the operations are equal false otherwise
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	equals(other) {
		if (other instanceof Latex.Operation) // type test
			return this.directive === other.directive && this.operand === other.operand;
		return false;
	}
};
Object.defineProperty(Latex.Operation.prototype.constructor, "name", { value: "Latex.Operation", enumerable: true });



module.exports = Latex;

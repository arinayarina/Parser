/**
 * @fileoverview Syntax tree structure elements
 * This file is a part of TeXnous project.
 *
 * @copyright TeXnous project team (http://texnous.org) 2017
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

const Tree = require("@texnous/tree"); // tree structure elements



/**
 * @classdesc Syntax tree structure
 * @class SyntaxTree
 * @extends Tree
 * @property {string} sourceText - The source text
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
class SyntaxTree extends Tree {
	/**
	 * Constructor
	 * @param {string} sourceText the source text
	 * @param {!SyntaxTree.Token} rootToken the root token (must have no parent and no tree)
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor(sourceText, rootToken) {
		super (rootToken); // the superclass constructor
		if (typeof sourceText !== "string") throw new TypeError("\"sourceText\" isn't a string");
		Object.defineProperty(this, "sourceText", {value: sourceText, enumerable: true}); // store the source
	}


	/**
	 * Get the suitable class for the root node
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @methodOf SyntaxTree
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _rootNodeClass() {
		return SyntaxTree.Token;
	}
}
Object.defineProperties(SyntaxTree.prototype, { // methods aliases
	rootToken: { value: SyntaxTree.prototype.rootNode, enumerable: true },
	enumerateTokens: { value: SyntaxTree.prototype.enumerateNodes, enumerable: false },
});



/**
 * Syntax tree token base properties
 * @typedef {Object} SyntaxTree.TokenProperties
 * @property {(?SyntaxTree.Token|undefined)} parentToken - The parent token or null if there is no parent
 * @property {(!Array.<SyntaxTree.Token>|undefined)} childTokens - The list of the child tokens
 * @property {number|undefined} sourceLength - The length of the source text fragment covered by the token
 * @property {number|undefined} sourceShift - The offset of the source text fragment covered by the token
 *           relative to the previous token
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * @classdesc Syntax tree token base structure
 * @class SyntaxTree.Token
 * @extends Tree.Node
 * @property {(?SyntaxTree.Token|undefined)} parentToken - The parent token or null if there is no parent
 * @property {(!Array.<SyntaxTree.Token>|undefined)} childTokens - The list of the child tokens
 * @property {number|null} sourceLength - The length of the source text fragment covered by this token
 *           or null if the length isn't defined
 * @property {number|null} sourceShift - The offset of the source text fragment covered by this token
 *           relative to the previous token or null if the offset isn't defined
 * @property {number|null} sourceOffset - The offset of the source text fragment covered by this token
 *           or null if cannot calculate the offset
 * @property {string|null} sourceText - The source text covered by this token
 *           or null if the syntax tree or the source fragment position are not set
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
SyntaxTree.Token = class extends Tree.Node {
  /**
   * Constructor
   * @param {!SyntaxTree.TokenProperties=} initialProperties the initial property values
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	constructor(initialProperties) {
		if (initialProperties === undefined) { // if the initial properties are not set
			super(); // superclass constructor
		} else if (initialProperties instanceof Object) { // if the initial properties are set
			let superInitialProperties = Object.create(initialProperties); // superclass initial properties
			superInitialProperties.parentNode = initialProperties.parentToken;
			superInitialProperties.childNodes = initialProperties.childTokens;
			super(superInitialProperties); // superclass constructor
			if (initialProperties.sourceLength !== undefined) // if the length of the source fragment is defined
				this.sourceLength = initialProperties.sourceLength; // store the source length
			if (initialProperties.sourceShift !== undefined) // if the shift of the source is defined
				this.sourceShift = initialProperties.sourceShift; // store the source shift
		} else { // if the initial properties are in unsupported type
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


	/**
	 * Get the parent token
	 * @return {?SyntaxTree.Token} the parent token or null if there is no parent
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get parentToken() {
		return this.parentNode;
	}


	/**
	 * Get the child tokens
	 * @return {!Array.<SyntaxTree.Token>} the child token list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get childTokens() {
		return this.childNodes;
	}


	/*
	 * Get the length of the source text, covered by this token
	 * @return {number|null} The length of the source text fragment covered by this token
	 *         or null if the length isn't defined
	 */
	get sourceLength() {
		return this._sourceLength;
	}


	/*
	 * Set the length of the source text covered by this token iа is undefined
	 * @param {number} sourceLength The length of the source text fragment covered by this token
	 */
	set sourceLength(sourceLength) {
		if (sourceLength !== parseInt(sourceLength, 10)	|| sourceLength < 0)
			throw new TypeError("\"sourceLength\" is not a non-negative integer");
		Object.defineProperty(this, "_sourceLength", {value: sourceLength, enumerable: true}); // store the length
	}


	/*
	 * Get the relative offset of the source text covered by this token
	 * @return {number|null} The offset of the source text fragment covered by this token
	 *         relative to the previous token or null if the offset isn't defined
	 */
	get sourceShift() {
		return this._sourceShift;
	}


	/*
	 * Set the relative offset of the source text covered by this token
	 * @param {number} sourceShift The offset of the source text fragment covered by the token
	 *        relative to the previous token
	 */
	set sourceShift(sourceShift) {
		if (sourceShift === this._sourceShift) return; // do nothing is the same value
		if (sourceShift !== parseInt(sourceShift, 10)	|| sourceShift < 0)
			throw new TypeError("\"sourceShift\" is not a non-negative integer");
		Object.defineProperty(this, "_sourceShift", {value: sourceShift, enumerable: true}); // store the shift
	}


	/*
	 * Get the offset of the source text, covered by this token, or null if the source fragment position isn't defined
	 * @return {number|null} The offset of the source text in the general source
	 */
	get sourceOffset() {
		let parentToken = this.parentToken; // the parent token
		if (parentToken) { // if there is a parent token
			let sourceOffset = parentToken.sourceOffset;
			if (sourceOffset === null) return null; // return null if the source offset is undefined
			let neighborTokens = parentToken._childNodes; // the tokens at the same level
			for (let iNeighborToken = 0, neighborToken = neighborTokens[0];
				neighborToken !== this;
				neighborToken = neighborTokens[++iNeighborToken]) { // for all the previous neighbor tokens
				if (neighborToken._sourceLength === null) return null;
				sourceOffset += neighborToken._sourceShift + neighborToken._sourceLength; // shift the source offset
			}
			return sourceOffset + this._sourceShift;
		} else { // if there is no parent token
			return this._sourceShift; // return the shift from the previous token
		}
	}


	/*
	 * Get the source text, covered by this token, or null if the syntax tree or the source fragment position are not
	 * defined
	 * @return {string|null} The source text
	 */
	get sourceText() {
		let tree = this.tree; // the tree object
		let sourceOffset = this.sourceOffset; // the offset of the source text
		let sourceLength = this.sourceLength; // the length of the souece text
		// cannot get the text if something isn't defined
		if (tree === null || sourceOffset === null || sourceLength === null) return null;
		return tree.sourceText.substr(sourceOffset, sourceLength);
	}


	/**
	 * Get the string representation of this node
	 * @param {(undefined|boolean|string)} formatting
	 *        undefined to print a single line with all the node types
	 *        true to print a single line with the root node type
	 *        false to print a single line without node types
	 *        string to print an intended structure, formatting means one indent
	 * @param {number} maxDepth maximum depth of nested nodes to render, 0 to render all the subtree
	 * @param {number} depth amount of indents
	 * @return {string} the string representation
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_toString(formatting, maxDepth, depth) {
		if (formatting === true) {
			return this.constructor.name + (maxDepth === depth + 1
						? " { ... }"
						: ` { "${ this._toString(false, maxDepth, depth) }" }`
				);
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}


	/**
	 * Get the suitable class for the tree
	 * @return {!Function} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _treeClass() {
		return SyntaxTree;
	}


	/**
	 * Get the suitable class for the parent node
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _parentNodeClass() {
		return SyntaxTree.Token;
	}


	/**
	 * Get the suitable class for the child nodes
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _childNodeClass() {
		return SyntaxTree.Token;
	}
};
Object.defineProperties(SyntaxTree.Token.prototype.constructor, { // define the class name
	name: { value: "SyntaxTree.Token", enumerable: true }
});
Object.defineProperties(SyntaxTree.Token.prototype, { // make getters and setters enumerable
	parentToken: { enumerable: true },
	childTokens: { enumerable: true },
	sourceLength: { enumerable: true },
	sourceShift: { enumerable: true },
	sourceOffset: { enumerable: true },
	sourceText: { enumerable: true },
});
Object.defineProperties(SyntaxTree.Token.prototype, { // default property values
	_sourceLength: { value: null, enumerable: true }, // unknown length of the source by default
	_sourceShift: { value: 0, enumerable: false } // no shift from the previous token by default
});
Object.defineProperties(SyntaxTree.Token.prototype, { // methods aliases
	childToken: { value: SyntaxTree.Token.prototype.childNode, enumerable: false },
	insertChildToken: { value: SyntaxTree.Token.prototype.insertChildNode, enumerable: false }
});


module.exports = SyntaxTree;

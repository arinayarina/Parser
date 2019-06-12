/**
 * @fileoverview Formatted text parser base class
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

const SyntaxTree = require("@texnous/syntax-tree"); // tree structure elements



/**
 * Formatted text parser base class
 * @class Parser
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
class Parser {
	/**
	 * Constructor
	 */
	constructor() {
		Object.defineProperties(this, {
			_tokenParsers: { value: {} } // registered token parsers by token type
		});
	}


	/**
	 * Parse source for a list of tokens
	 * @param {string|!Parser.Context} source the source text to parse or the the parsing context
	 * @return {!Array.<!SyntaxTree.Token>} the list of the parsed tokens, the last one will be null if there was an error
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	parse(source) {
		let context = source instanceof this._contextClass ? source : this.createContext(source);
		let tokens = []; // the list of the parsed tokens
		if (context.stopLabel === null) { // if there is no a stop label
			while (!context.isAtSourceEnd()) { // until the end of the source
				let token = this._parseToken(context); // try to parse the token
				if (token === null) break; // stop if cannot parse the token
				tokens.push(token); // store the parsed token
			}
		}	else { // if there is a stop label
			let stopLabel = context.stopLabel; // store the stop label
			context.clearStopLabel(); // don't store the stop label in the context any more
			while (!context.sourceProbe(stopLabel)) { // until the label
				let token = this._parseToken(context); // try to parse the token
				if (token === null) break; // stop if cannot parse the token
				tokens.push(token); // store the parsed token
			}
		}
		return tokens;
	}


	/**
	 * Create a parsing context
	 * @param {string=} source the source text to parse (empty string by default)
	 * @return {!Parser.Context} the created context
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	createContext(source) {
		return new Parser.Context(source);
	}


	/**
	 * Token parser callback
	 * @callback Parser.TokenParserCallback
	 * @param {!Parser.Context} context the parsing context
	 * @return {!SyntaxTree.Token} the parsed token
	 */


	/**
	 * Get the callback to parse the next token
	 * @param {!Parser.Context} context the parsing context, it can be changed
	 * @return {?Parser.TokenParserCallback} the callback to parse the token or null if the next token cannot be parsed
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_tokenParserCallback(context) {
		if (context.isAtSourceEnd()) return null; // cannot get the token if the source is ended
		return null; // return null in any case
	}


	/**
	 * Parse a single token
	 * @param {!Parser.Context} context the parsing context
	 * @return {?SyntaxTree.Token} the parsed token or null if the token cannot be parsed
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseToken(context) {
		let tokenParserCallback = this._tokenParserCallback(context); // get the callback to parse the next token
		if (tokenParserCallback === null) return null; // return if the next token cannot be parsed
		let contextToken = context.token; // the currently processing token
		let tokenSourceOffset = context.sourceOffset; // begin of token source
		let tokenSourceShift = tokenSourceOffset - context.sourceCuttingOffset; // relative token source offset
		context.markSourceCuttingOffset(); // mark the current offset as a token bound
		/** @type ?SyntaxTree.Token */
		let token = tokenParserCallback.call(this, context); // try to parse a token
		context.token = contextToken; // restore the currently processing token
		if (token instanceof context._tokenClass) { // if the token was successfully parsed
			context.markSourceCuttingOffset(); // mark the current offset as a token bound
			token.sourceLength = context.sourceOffset - tokenSourceOffset; // calculate the length
			token.sourceShift = tokenSourceShift; // store the source shift
			if (contextToken) contextToken.insertChildSubtree(token); // store the token as a child for the context token
		} else if (token !== null) { // if unexpected token class
			throw new ReferenceError(`Parsed token isn't a "${ context._tokenClass.constructor.name }" instance.`);
		}
		return token;
	}


	/**
	 * Get the appropriate class for the parsing context
	 * @return {!Parser.Context.constructor} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _contextClass() {
		return Parser.Context;
	}
}



/**
 * The parsing context base class
 * @class Parser.Context
 * @property {string} source - The source text to parse
 * @property {number} sourceOffset - The current position in the source text
 * @property {number} sourceCuttingOffset - The last token bound position in the source text
 * @property {{line:number,char:number}} sourcePosition - The position in the source text
 * @property {!Parser.State} state - The current state of the parser
 * @property {?SyntaxTree.Token} token - The currently processed token or null if there is no such
 * @property {string|RegExp|null} stopLabel - The source label to stop parsing, null to parse until the end
 * @property {string} _source - The private storage for source
 * @property {!Parser.State} _state - The private storage for state
 * @property {Array.<!Parser.State>} _stateStack - The private storage for state stack
 * @author Kirill Chuvilin <kirill.chuvilin@gmail.com>
 */
Parser.Context = class {
	/**
	 * Constructor
	 * @param {(string|!Parser.Context)=} source the source text to parse, another context to copy
	 *        or undefined to initiate with an empty source text
	 */
	constructor(source) {
		if (source === undefined) source = ""; // by default source is an empty string
		if (typeof source === "string") { // if the source string is set
			Object.defineProperties(this, {
				_source: { value: source, writable: true }, // store the source
				_sourceOffset: { value: 0, writable: true }, // start from the beginning
				_sourceCuttingOffset: { value: 0, writable: true }, // the last token bound offset
				_state: { value: this.createInitialState(), writable: true }, // the current state
				_stateStack: { value: [], writable: true }, // stored states stack
				_token: { value: null, writable: true }, // the currently processed token
				_stopLabel: { value: null, writable: true } // parse until the end of the source
			});
		} else if (source instanceof Parser.Context) { // if the instance to copy values from is defined
			Object.defineProperties(this, {
				_source: { value: source._source, writable: true }, // copy the source
				_sourceOffset: { value: source._sourceOffset, writable: true }, // copy the offset
				_sourceCuttingOffset: { value: source._sourceCuttingOffset, writable: true }, // copy the last token bound offset
				_state: { value: source._state.copy(), writable: true }, // copy the current state
				_stateStack: { value: source._stateStack.slice(), writable: true }, // copy stored states stack
				_token: { value: source._token, writable: true }, // copy the currently processed token
				_stopLabel: { value: source._stopLabel, writable: true } // copy the stop source label
			});
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"other\" isn't a string or a Parser.Context instance");
		}
	}


	/**
	 * Copy this context
	 * @param {!Parser.Context=} target the context to copy to or undefined to create a new one
	 * @return {!Parser.Context} the context copy
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	copy(target) {
		if (target === undefined) { // if no instance to copy values to is defined
			return new Parser.Context(this); // return the new one initiated by this
		} else if (target instanceof Parser.Context) { // if the instance to copy values to is defined
			target._source = this._source;
			target._sourceOffset = this._sourceOffset;
			target._sourceCuttingOffset = this._sourceCuttingOffset;
			target._state = this._state.copy();
			target._stateStack = this._stateStack.slice();
			target._token = this._token;
			target._stopLabel = this._stopLabel;
			return target; // return the target instance
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"target\" isn't a Parser.Context instance");
		}
	}


	/**
	 * Get the source
	 * @return {string} the source text
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get source() {
		return this._source;
	}


	/**
	 * Get the current position in the source text
	 * @return {number} the position
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get sourceOffset() {
		return this._sourceOffset;
	}


	/**
	 * Set the current position in the source text
	 * @param {number} offset the new position in the source, must be not less than the current one
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set sourceOffset(offset) {
		if (!parseInt(offset, 10)) throw new TypeError("\"offset\" isn't an integer");
		if (offset < this._sourceOffset) throw new TypeError("\"offset\" is less than the current one");
		if (offset > this._source.length) throw new TypeError("\"offset\" is greater than the source length");
		this._sourceOffset = offset; // update the offset
	}


	/**
	 * Get the last cutting position in the source text
	 * @return {number} the last token bound position in the source text
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get sourceCuttingOffset() {
		return this._sourceCuttingOffset;
	}


	/**
	 * Mark the current source offset as a token bound
	 * @return {number} the current offset is the source
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	markSourceCuttingOffset() {
		return this._sourceCuttingOffset = this._sourceOffset;
	}


	/**
	 * Get the current source character
	 * @return {string} char of the source at the current offset
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get sourceCharacter() {
		return this._source[this._sourceOffset];
	}


	/**
	 * Detect if the offset is at the end of the source
	 * @return {boolean} true is the offset is at the end, false otherwise
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	isAtSourceEnd() {
		return this._sourceOffset >= this._source.length;
	}


	/**
	 * Detect if the pattern is at the current source offset
	 * @param {string|RegExp} pattern the source pattern
	 * @param {boolean=false} skipPattern true to shift the offset after the pattern if there is the pattern in the source
	 * @return {boolean} true is the pattern is in the source at the offset, false otherwise
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	sourceProbe(pattern, skipPattern) {
		if (pattern instanceof RegExp) { // id the pattern is a regular expression
			if (skipPattern) { // if there is need to skip the pattern
				let patternMatch = this.sourceMatch(pattern); // try to find a match
				if (patternMatch === null) return false; // return if there is no match
				this._sourceOffset += patternMatch.index + patternMatch[0].length; // move to the end of the matched frament
				return true;
			} else { // if there is no need to skip the pattern
				return this._source.slice(this._sourceOffset).search(pattern) === 0;
			}
		} else { // if pattern is a string
			if (this._source.startsWith(pattern, this._sourceOffset)) { // if there is the pattern in the source
				if (skipPattern) this._sourceOffset += pattern.length; // shift the offset
				return true;
			} else { // if there is no pattern in the source
				return false;
			}
		}
	}


	/**
	 * Find a match of the source from the offset with a regular expression
	 * @param {!RegExp} regexp the regular expression to search a match with
	 * @return {Array.<string>|null} results of match or null if there is no match
	 */
	sourceMatch(regexp) {
		if (regexp instanceof RegExp) {
			return this._source.slice(this._sourceOffset).match(regexp);
		} else {
			throw new TypeError("\"regexp\" isn't a RegExp instance.");
		}
	}


	/**
	 * Get the current position in the source text as line number and char number in the current line
	 * @return {{line:number,char:number}} the position
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get sourcePosition() {
		if (this._sourceOffset <= 0) return {line: 1, char: 1};
		// position of the last line break
		let lineBreakOffset = this._source.lastIndexOf("\n", this._sourceOffset - 1);
		if (lineBreakOffset < 0) {
			return {line: 1, char: this._sourceOffset + 1};
		} else {
			let charPosition = this._sourceOffset - lineBreakOffset;
			let nLines = 2;
			while ((lineBreakOffset = this._source.lastIndexOf("\n", lineBreakOffset - 1)) >= 0) {
				++nLines;
			}
			return {line: nLines, char: charPosition};
		}
	}


	/**
	 * Get the current parser state
	 * @return {Parser.State} the current state
	 */
	get state() {
		return this._state;
	}


	/**
	 * Create an initial parser state
	 * @return {!Parser.State} the created state
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	createInitialState() {
		return new Parser.State();
	}


	/**
	 * Backup the current state
	 */
	backupState() {
		this._stateStack.push(this._state.copy()); // push the copy of the current state to the stack
	}


	/**
	 * Restore the last backed up state
	 * @return {boolean} true if there was a backuped state, false otherwise
	 */
	restoreState() {
		if (this._stateStack.length < 1) return false; // return if there are no stored states
		// note: need to copy the backed up states to protect the copies of the context
		this._stateStack.pop().copy(this._state); // take the last pushed state and copy to this state
		return true;
	}


	/**
	 * Get the currently processed token
	 * @return {?SyntaxTree.Token} the token or null id there is no such
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get token() {
		return this._token;
	}


	/**
	 * Set the currently processed token
	 * @param {?SyntaxTree.Token} token the token or null id there is no such
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set token(token) {
		if (token === null || token instanceof this._tokenClass) {
			this._token = token;
		} else { // if unexpected token type
			throw new TypeError(`"token" isn't a ${ this._tokenClass.constructor.name } instance`);
		}
	}


	/**
	 * Get the source label to stop parsing
	 * @return {string|RegExp|null} the label, null to parse until the end
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get stopLabel() {
		return this._stopLabel;
	}


	/**
	 * Set the source label to stop parsing
	 * @param {string|RegExp|null} stopLabel the label, empty to parse until the end
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set stopLabel(stopLabel) {
		if (typeof stopLabel === "string" || stopLabel instanceof RegExp) {
			if (this._stopLabel === null) {
				this._stopLabel = stopLabel;
			} else {
				throw new ReferenceError("\"stopLabel\" is already defined");
			}
		} else {
			throw new TypeError("\"stopLabel\" isn't a string or a RegExp instance");
		}
	}


	/**
	 * Clear the source label to parse until
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	clearStopLabel() {
		this._stopLabel = null;
	}


	/**
	 * Get the appropriate class for the parser state
	 * @return {!Parser.State.constructor} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _stateClass() {
		return Parser.State;
	}


	/**
	 * Get the appropriate class for the syntax tree tokens
	 * @return {!SyntaxTree.Token.constructor} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _tokenClass() {
		return SyntaxTree.Token;
	}
};
Object.defineProperties(Parser.Context.prototype.constructor, { // define the class name
	name: { value: "Parser.Context", enumerable: true }
});
Object.defineProperties(Parser.Context.prototype, { // make getters and setters enumerable
	source: { enumerable: true },
	sourceOffset: { enumerable: true },
	sourceCuttingOffset: { enumerable: true },
	sourceCharacter: { enumerable: true },
	sourcePosition: { enumerable: true },
	state: { enumerable: true },
	token: { enumerable: true },
	stopLabel: { enumerable: true }
});



/**
 * The parser state base class
 * @class Parser.State
 * @author Kirill Chuvilin <kirill.chuvilin@gmail.com>
 */
Parser.State = class {
	/**
	 * Constructor
	 * @param {!Parser.State=} other the other state to copy or undefined to use default values
	 */
	constructor(other) {
		if (other === undefined) { // if no instance to copy values from is defined
			// no values to initiate
		} else if (other instanceof Parser.State) { // if the instance to copy values from is defined
			// no values to initiate
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"other\" isn't a Parser.State instance");
		}
	}


	/**
	 * Copy this state
	 * @param {!Parser.State=} target the state to copy to or undefined to create a new one
	 * @return {!Parser.State} this state copy
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	copy(target) {
		if (target === undefined) { // if no instance to copy values to is defined
			return new Parser.State(this); // return the new one initiated by this
		} else if (target instanceof Parser.State) { // if the instance to copy values to is defined
			// no values to copy
			return target; // return the target instance
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"target\" isn't a Parser.State instance");
		}
	}
};
Object.defineProperties(Parser.State.prototype.constructor, { // define the class name
	name: { value: "Parser.State", enumerable: true }
});



module.exports = Parser;

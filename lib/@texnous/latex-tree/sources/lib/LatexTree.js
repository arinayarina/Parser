/**
 * @fileoverview LaTeX syntax tree structure elements
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
const Latex = require("@texnous/latex"); // general LaTeX definitions
const LatexSyntax = require("@texnous/latex-syntax"); // LaTeX syntax structures



/**
 * @classdesc LaTeX syntax tree structure
 * @class LatexTree
 * @extends SyntaxTree
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
class LatexTree extends SyntaxTree {
	/**
	 * Get the suitable class for the root node
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @methodOf SyntaxTree
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _rootNodeClass() {
		return LatexTree.Token;
	}
}



/**
 * @classdesc Syntax tree token base structure
 * @class LatexTree.Token
 * @extends SyntaxTree.Token
 * @property {(Latex.Lexeme|null)} lexeme - The logical lexeme of the token
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.Token = class extends SyntaxTree.Token {
	/**
	 * Get the suitable class for the tree
	 * @return {!Function} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _treeClass() {
		return LatexTree;
	}


	/**
	 * Get the suitable class for the parent node
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _parentNodeClass() {
		return LatexTree.Token;
	}


	/**
	 * Get the suitable class for the child nodes
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _childNodeClass() {
		return LatexTree.Token;
	}
};
Object.defineProperties(LatexTree.Token.prototype.constructor, { // define the class name
	name: { value: "LatexTree.Token", enumerable: true }
});
Object.defineProperties(LatexTree.Token.prototype, { // default properties
	lexeme: { value: null, enumerable: true } // no lexeme
});



/**
 * LaTeX symbol token properties
 * @typedef {Object} LatexTree.SymbolTokenProperties
 * @extends LatexTree.TokenProperties
 * @property {!LatexSyntax.Symbol|undefined} symbol -
 *           The LaTeX symbol or undefined if the symbol is unrecognized
 * @property {string|undefined} pattern - The pattern that corresponds to the unrecognized symbol
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX symbol token structure
 * @class LatexTree.SymbolToken
 * @extends LatexTree.Token
 * @property {?LatexSyntax.Symbol} symbol -
 *           The corresponding LaTeX symbol or null if the symbol is unrecognized
 * @property {string} pattern - The symbol LaTeX pattern
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.SymbolToken = class extends LatexTree.Token {
  /**
   * Constructor
   * @param {!LatexTree.SymbolTokenProperties} initialProperties the initial property values
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	constructor(initialProperties) {
		if (initialProperties instanceof Object) { // type test
			super(initialProperties); // the superclass constructor
			if (initialProperties.symbol) { // if the symbol is defined
				if (initialProperties.symbol instanceof LatexSyntax.Symbol) { // type test
					// store the symbol
					Object.defineProperty(this, "symbol", { value: initialProperties.symbol, enumerable: true });
				} else {
					throw new TypeError("\"initialProperties.symbol\" isn't a LatexSyntax.Symbol instance");
				}
			} else { // if the symbol isn't defined
				if (typeof initialProperties.pattern === "string") {
					// store the unrecognized pattern
					Object.defineProperty(this, "pattern", { value: initialProperties.pattern });
				} else {
					throw new TypeError("\"initialProperties.pattern\" isn't a string");
				}
			}
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


  /**
   * Get the logical lexeme
   * @return {(Latex.Lexeme|null)} the lexeme or null if the lexeme isn't defined
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get lexeme () {
		return this.symbol ? this.symbol.lexeme : null;
	}


  /**
   * Get the symbol LaTeX pattern
   * @return {string} the symbol pattern
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get pattern () {
		return this.symbol.pattern;
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
		if (formatting === false) {
			let pattern = this.pattern; // LaTeX input pattern
			let nPatternChars = pattern.length; // the number of chars in the pattern
			let sourceFragments = new Array(nPatternChars); // the token source fragments
			for (let iPatternChar = 0; iPatternChar < nPatternChars; ++iPatternChar) { // for all the pattern chars
				let patternChar = pattern[iPatternChar]; // the pattern char
				if (patternChar === "#") { // if a parameter position
					let parameterIndex = parseInt(pattern[++iPatternChar], 10); // index of the parameter
					let parameterToken = this.childNode(parameterIndex - 1); // try to get the parameter token
					sourceFragments[iPatternChar] = parameterToken ? parameterToken._toString(false, maxDepth, depth + 1) : "??";
				} else { // if the ordinary pattern char
					sourceFragments[iPatternChar] = patternChar;
				}
			}
			return sourceFragments.join("");
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}
};
Object.defineProperties(LatexTree.SymbolToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.SymbolToken", enumerable: true }
});
Object.defineProperties(LatexTree.SymbolToken.prototype, { // make getters and setters enumerable
	pattern: { enumerable: true }
});
Object.defineProperties(LatexTree.SymbolToken.prototype, { // default properties
	symbol: { value: null, enumerable: true } // no symbol token
});



/**
 * LaTeX parameter token properties
 * @typedef {Object} LatexTree.ParameterTokenProperties
 * @extends LatexTree.TokenProperties
 * @property {boolean} hasBrackets -
 *           True if the parameter is bounded by the logical brackets, false otherwise
 * @property {boolean} hasSpacePrefix -
 *           True if the parameter is prefixed by a space, false otherwise
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX parameter token structure
 * @class LatexTree.ParameterToken
 * @extends LatexTree.Token
 * @property {boolean} hasBrackets -
 *           True if the parameter is bounded by the logical brackets, false otherwise
 * @property {boolean} hasSpacePrefix -
 *           True if the parameter is prefixed by a space, false otherwise
 * @property {?LatexSyntax.Parameter} parameter - The corresponding LaTeX parameter
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.ParameterToken = class extends LatexTree.Token {
  /**
   * Constructor
   * @param {!LatexTree.ParameterTokenProperties} initialProperties the initial property values
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	constructor(initialProperties) {
		if (initialProperties instanceof Object) { // type test
			super(initialProperties); // the superclass constructor
			if (!initialProperties.hasBrackets) // if there are no bounding brackets
				Object.defineProperty(this, "hasBrackets", { value: false, enumerable: true }); // store this fact
			if (initialProperties.hasSpacePrefix) // if there is a space before
				Object.defineProperty(this, "hasSpacePrefix", { value: true, enumerable: true }); // store this fact
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


  /**
   * Get the logical lexeme
   * @return {(Latex.Lexeme|null)} the lexeme or null if the lexeme isn't defined
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get lexeme () {
		return this.parameter ? this.parameter.lexeme : null;
	}


  /**
   * Get the corresponding LaTeX parameter description
   * @return {?LatexSyntax.Parameter}
   *         the LaTeX parameter or null of there is parent symbol or such a parameter
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get parameter () {
		let symbolToken = this.parentNode; // get the symbol token
		if (symbolToken instanceof LatexTree.SymbolToken) {
			return symbolToken.symbol.parameter(symbolToken.childIndex(this));
		}
		return null;
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
		if (formatting === false) {
			let innerString = super._toString(false, maxDepth, depth); // the string formed by child nodes
			return `${ this.hasSpacePrefix ? " " : "" }${ this.hasBrackets ? `{${ innerString }}` : innerString }`;
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}


	/**
	 * Get the appropriate class for the parent node
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _parentNodeClass() {
		return LatexTree.SymbolToken; // parent node must be a LatexTree.SymbolToken instance
	}
};
Object.defineProperties(LatexTree.ParameterToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.ParameterToken", enumerable: true }
});
Object.defineProperties(LatexTree.ParameterToken.prototype, { // make getters and setters enumerable
	parameter: { enumerable: true }
});
Object.defineProperties(LatexTree.ParameterToken.prototype, { // default properties
	hasBrackets: { value: true, enumerable: true }, // there are bounding brackets
	hasSpacePrefix: { value: false, enumerable: true } // there is no space before
});



/**
 * LaTeX command token properties
 * @typedef {Object} LatexTree.CommandTokenProperties
 * @extends LatexTree.TokenProperties
 * @property {!LatexSyntax.Command|undefined} command -
 *           The LaTeX command or undefined if the command is unrecognized
 * @property {string|undefined} name - The name that corresponds to the unrecognized command
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX command token structure
 * @class LatexTree.CommandToken
 * @extends LatexTree.SymbolToken
 * @property {!LatexSyntax.Command} command -
 *           The corresponding LaTeX command or null if the command is unrecognized
 * @property {string|undefined} name - The LaTeX command name
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.CommandToken = class extends LatexTree.SymbolToken {
  /**
   * Constructor
   * @param {!LatexTree.CommandTokenProperties} initialProperties the initial property values
   */
	constructor(initialProperties) {
		if (initialProperties instanceof Object) { // type test
			// copy the initial properties for the superclass
			let superInitialProperties = Object.create(initialProperties);
			if (initialProperties.command) { // if the command is defined
				if (initialProperties.command instanceof LatexSyntax.Command) { // type test
					// the command is the symbol for the superclass
					superInitialProperties.symbol = initialProperties.command;
					super(superInitialProperties); // the superclass constructor
				} else {
					throw new TypeError("\"initialProperties.command\" isn't a LatexSyntax.Command instance");
				}
			} else { // if the command isn't defined
				if (typeof initialProperties.name === "string") { // type test
					superInitialProperties.pattern = "";
					super(superInitialProperties); // the superclass constructor
					Object.defineProperty(this, "name", { value: initialProperties.name }); // store the unrecognized name
				} else {
					throw new TypeError("\"initialProperties.name\" isn't a string");
				}
			}
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


  /**
   * Get the LaTeX command
   * @return {!LatexSyntax.Command} the command description
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get command () {
		return this.symbol;
	}


  /**
   * Get the LaTeX command name
   * @return {string} the command name
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get name () {
		return this.command.name;
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
		if (formatting === false) {
			return `\\${ this.name }${ super._toString(false, maxDepth, depth) }`;
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}
};
Object.defineProperties(LatexTree.CommandToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.CommandToken", enumerable: true }
});
Object.defineProperties(LatexTree.CommandToken.prototype, { // make getters and setters enumerable
	command: { enumerable: true },
	name: { enumerable: true }
});



/**
 * LaTeX environment token properties
 * @typedef {Object} LatexTree.EnvironmentTokenProperties
 * @extends LatexTree.TokenProperties
 * @property {!LatexSyntax.Environment|undefined} environment -
 *           The LaTeX environment or undefined if the environment is unrecognized
 * @property {string|undefined} name - The name that corresponds to the unrecognized environment
 * @property
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX environment token structure
 * @class LatexTree.EnvironmentToken
 * @extends LatexTree.Token
 * @property {!LatexSyntax.Environment} environment -
 *           The corresponding LaTeX environments or null if the environment is unrecognized
 * @property {string|undefined} name - The LaTeX environment name
 * @property {?LatexTree.CommandToken} beginCommandToken -
 *           The environment begin command token or null is there is no such a token
 * @property {?LatexTree.CommandToken} endCommandToken -
 *           The environment end command token or null is there is no such a token
 * @property {?LatexTree.EnvironmentBodyToken} bodyToken -
 *           The environment body token or null is there is no such a token
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.EnvironmentToken = class extends LatexTree.Token {
  /**
   * Constructor
   * @param {!LatexTree.EnvironmentTokenProperties} initialProperties the initial property values
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	constructor(initialProperties) {
		if (initialProperties instanceof Object) { // type test
			super(initialProperties); // the superclass constructor
			if (initialProperties.environment) { // if the environments is defined
				if (initialProperties.environment instanceof LatexSyntax.Environment) { // type test
					// store the environment
					Object.defineProperty(this, "environment", { value: initialProperties.environment, enumerable: true });
				} else {
					throw new TypeError("\"initialProperties.environment\" isn't a LatexSyntax.Environment instance");
				}
			} else { // if the environment isn't defined
				if (typeof initialProperties.name === "string") {
					Object.defineProperty(this, "name", { value: initialProperties.name }); // store the unrecognized name
				} else {
					throw new TypeError("\"initialProperties.name\" isn't a string");
				}
			}
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


  /**
   * Get the logical lexeme
   * @return {(Latex.Lexeme|null)} the lexeme or null if the lexeme isn't defined
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get lexeme () {
		return this.environment ? this.environment.lexeme : null;
	}


  /**
   * Get the name of the environment
   * @return {string} the environment name
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get name () {
		return this.environment.name;
	}


  /**
   * Get the begin command token
   * @return {?LatexTree.CommandToken} the command token or null if there is no begin command
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get beginCommandToken () {
		let beginCommandToken = this.childNode(0);
		return beginCommandToken instanceof LatexTree.CommandToken ? beginCommandToken : null;
	}


  /**
   * Get the end command token
   * @return {?LatexTree.CommandToken} the command token or null if there is no end command
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get endCommandToken () {
		let endCommandToken = this.childNode(2);
		return endCommandToken instanceof LatexTree.CommandToken ? endCommandToken : null;
	}



  /**
   * Get the environment body token
   * @return {?LatexTree.EnvironmentBodyToken} the body or null if there is no body
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get bodyToken () {
		let bodyToken = this.childNode(1);
		return bodyToken instanceof LatexTree.EnvironmentBodyToken ? bodyToken : null;
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
		if (formatting === false) {
			let beginCommandToken = this.beginCommandToken; // the begin command token
			let endCommandToken = this.endCommandToken; // the end command token
			let bodyToken = this.bodyToken; // the environment body token
			return `\\begin{${ this.name }}${ beginCommandToken
				?	LatexTree.SymbolToken.prototype._toString.call(beginCommandToken, false, maxDepth, depth + 1)
				: "??"
			}${	bodyToken
				? bodyToken._toString(false, maxDepth, depth + 1)
				: "??"
			}\\end{${ this.name }}${ endCommandToken
				? LatexTree.SymbolToken.prototype._toString.call(endCommandToken, false, maxDepth, depth + 1)
				: "??"
			}`;
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}
};
Object.defineProperties(LatexTree.EnvironmentToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.EnvironmentToken", enumerable: true }
});
Object.defineProperties(LatexTree.EnvironmentToken.prototype, { // make getters and setters enumerable
	name: { enumerable: true },
	beginToken: { enumerable: true },
	endToken: { enumerable: true }
});
Object.defineProperties(LatexTree.SymbolToken.prototype, { // default properties
	environment: { value: null, enumerable: true } // no environment description
});



/**
 * LaTeX environment body token structure
 * @class LatexTree.EnvironmentBodyToken
 * @extends LatexTree.Token
 * @property {?LatexSyntax.Environment} environment -
 *           The LaTeX environment or null if there is no parent environment
 * @property {?LatexTree.EnvironmentToken} environmentToken - The parent environment token
 * @property {?LatexTree.CommandToken} beginCommandToken -
 *           The environment begin command token or null is there is no such a token
 * @property {?LatexTree.CommandToken} endCommandToken -
 *           The environment end command token or null is there is no such a token
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.EnvironmentBodyToken = class extends LatexTree.Token {
  /**
   * Get the LaTeX environment
   * @return {?LatexSyntax.Environment} the environment or null if there is no parent environment
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get environment () {
		return this.parentNode && this.parentNode.environment;
	}


  /**
   * Get the parent environment token
   * @return {?LatexTree.EnvironmentToken} the environment or null if there is no parent environment
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get environmentToken () {
		return /** @type ?LatexTree.EnvironmentToken */ this.parentToken;
	}


  /**
   * Get the environment begin command token
   * @return {?LatexTree.CommandToken} the command token or null if there is no begin command
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get beginCommandToken () {
		return this.parentNode && this.parentNode.beginCommandToken;
	}


  /**
   * Get the environment end command token
   * @return {(LatexTree.CommandToken|null)} the command token or null if there is no end command
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get endCommandToken () {
		return this.parentNode && this.parentNode.endCommandToken;
	}


	/**
	 * Get the appropriate class for the parent node
	 * @return {!Function} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _parentNodeClass() {
		return LatexTree.EnvironmentToken; // parent node must be a LatexTree.EnvironmentToken instance
	}
};
Object.defineProperties(LatexTree.EnvironmentBodyToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.EnvironmentBodyToken", enumerable: true }
});



/**
 * LaTeX space token properties
 * @typedef {Object} LatexTree.SpaceTokenProperties
 * @extends LatexTree.TokenProperties
 * @property {number|undefined} lineBreakCount - The number of line breaks
 * @property
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX space token structure
 * @class LatexTree.SpaceToken
 * @extends LatexTree.Token
 * @property {number} lineBreakCount - The number of line breaks
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.SpaceToken = class extends LatexTree.Token {
  /**
   * Constructor
   * @param {!LatexTree.SpaceTokenProperties} initialProperties the initial property values
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	constructor(initialProperties) {
		super(initialProperties); // the superclass constructor
		if (initialProperties instanceof Object) { // type test
			if (initialProperties.lineBreakCount) { // if the line break number is defined
				if (!parseInt(initialProperties.lineBreakCount, 10) || initialProperties.lineBreakCount < 0)
					throw new TypeError("\"initialProperties.lineBreakCount\" isn't a non-negative integer");
				// store the line break number
				Object.defineProperty(this, "lineBreakCount", { value: initialProperties.lineBreakCount, enumerable: true });
			}
		} else {
			if (initialProperties !== undefined)
				throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


  /**
   * Get the logical lexeme
   * @return {(Latex.Lexeme|null)} the lexeme or null if the lexeme isn't defined
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	get lexeme () {
		return  this.lineBreakCount <= 1 ? Latex.Lexeme.SPACE : Latex.Lexeme.PARAGRAPH_SEPARATOR;
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
		if (formatting === false) {
			switch (this.lineBreakCount) {
			case 0:
				return " ";
			case 1:
				return "\n";
			default:
				return "\n\n";
			}
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}
};
Object.defineProperties(LatexTree.SpaceToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.SpaceToken", enumerable: true }
});
Object.defineProperties(LatexTree.SpaceToken.prototype, { // default properties
	lineBreakCount: { value: 0, enumerable: true } // line break number
});



/**
 * LaTeX source fragment token properties
 * @typedef {Object} LatexTree.SourceTokenProperties
 * @extends LatexTree.TokenProperties
 * @property {Latex.Lexeme} lexeme - The logical lexeme
 * @property {string} source - The source fragment
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX source fragment token structure
 * @class LatexTree.SourceToken
 * @extends LatexTree.Token
 * @property {string} source - The source fragment
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexTree.SourceToken = class extends LatexTree.Token {
  /**
   * Constructor
   * @param {!LatexTree.SourceTokenProperties} initialProperties the initial property values
   * @author Kirill Chuvilin <k.chuvilin@texnous.org>
   */
	constructor(initialProperties) {
		if (initialProperties instanceof Object) { // type test
			super(initialProperties); // the superclass constructor
			if (Latex.Lexeme[initialProperties.lexeme]) {
				// store the lexeme
				Object.defineProperty(this, "lexeme", { value: initialProperties.lexeme, enumerable: true });
				if (typeof initialProperties.source === "string") {
					// store the sources
					Object.defineProperty(this, "source", { value: initialProperties.source, enumerable: true });
				} else {
					throw new TypeError("\"initialProperties.sources\" isn't a string");
				}
			} else {
				throw new TypeError("\"initialProperties.lexeme\" isn't known");
			}
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
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
		if (formatting === false) {
			return this.source;
		} else {
			return super._toString(formatting, maxDepth, depth);
		}
	}
};
Object.defineProperties(LatexTree.SourceToken.prototype.constructor, { // define the class name
	name: { value: "LatexTree.SourceToken", enumerable: true }
});



module.exports = LatexTree;

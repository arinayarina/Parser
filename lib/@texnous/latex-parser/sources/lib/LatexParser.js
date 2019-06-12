/**
 * @fileoverview LaTeX parser class
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

const Latex = require("@texnous/latex"); // general LaTeX definitions
const LatexSyntax = require("@texnous/latex-syntax"); // LaTeX syntax structures
const LatexTree = require("@texnous/latex-tree"); // tree structure elements
const Parser = require("@texnous/parser"); // formatted text parser base class



/**
 * LaTeX parser class
 * @class LatexParser
 * @property {!LatexSyntax} latexSyntax - The LaTeX syntax description to be used for parsing
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
class LatexParser extends Parser {
	/**
	 * Constructor
	 * @param {!LatexSyntax} latexSyntax The LaTeX syntax description to be used for parsing
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor(latexSyntax) {
		if (latexSyntax instanceof LatexSyntax) {
			super(); // the superclass constructor
			Object.defineProperty(this, "latexSyntax", { value: latexSyntax, enumerable: true });
		} else {
			throw new TypeError("\"latexSyntax\" isn't a LatexSyntax instance");
		}
	}


	/**
	 * Create a parsing context
	 * @param {string=} source the source text to parse (empty string by default)
	 * @return {!LatexParser.Context} the created context
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	createContext(source) {
		return new LatexParser.Context(source);
	}


	/**
	 * Get the callback to parse the next token
	 * @param {!LatexParser.Context} context the parsing context, it can be changed
	 * @return {?Parser.TokenParserCallback} the callback to parse the token or null if the next token cannot be parsed
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_tokenParserCallback(context) {
		while (this._parseCommentLine(context)) { // skip all the comments
		}
		if (context.latexCommandName !== null) return this._parseCommandToken;
		if (context.isAtSourceEnd()) return null; // cannot get the token if the source is ended
		if (context.latexParameter !== null) return this._parseParameterToken;
		if (context.stopLabel) return this._parseSourceToken;
		if (context.latexEnvironmentName !== null) return this._parseEnvironmentBodyToken;
		if (context.sourceProbe(/^\\begin(?:\s|%[^\n]*\n)*{[A-Za-z@]+\*?}/)) return this._parseEnvironmentToken;
		if (context.sourceProbe(/^\\[A-Za-z@]/)) return this._parseCommandToken;
		return this._parseSymbolToken;
	}


	/**
	 * Get the appropriate class for the parsing context
	 * @return {!LatexParser.Context.constructor} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _contextClass() {
		return LatexParser.Context;
	}


	/**
	 * Parse a symbol token
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.SymbolToken} the parsed token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseSymbolToken(context) {
		let sourceCharacter = context.sourceCharacter; // the current sources character
		// try to parse a token by the pattern
		let token = this._parsePatterns(context, this.latexSyntax.symbols(context.state.latexState, sourceCharacter));
		if (token === null) { // if cannot parse a symbol token
			token = this._parseSpaceToken(context); // try to parse a space token
			if (token === null) { // if a space token cannot be parsed
				this.unknownSymbolCallback(context, sourceCharacter);
				++context.sourceOffset; // go to the next source character
				token = new LatexTree.SymbolToken({ pattern: sourceCharacter }); // generate unrecognized symbol token
			}
		}
		return token;
	}


	/**
	 * Parse a command token
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.CommandToken} the parsed token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseCommandToken(context) {
		let commandName = context.latexCommandName; // try to get the command name from the context
		let contextBackup = context.copy(); // backup the context
		if (commandName === null) { // if there is no command name in the context
			let commandNameMatch = context.sourceMatch(/^\\([A-Za-z@]+\*?)/); // try to find a command name
			if (commandNameMatch === null) return null; // exit if cannot find a command name
			commandName = commandNameMatch[1]; // the name of the command
			context.sourceOffset += commandNameMatch[0].length; // just after the command name
		} else { // if the command name was stored in the context
			context.clearLatexCommandName(); // don't store the name any more
		}
		// try to parse a token by the pattern
		let token = this._parsePatterns(context, this.latexSyntax.commands(context.state.latexState, commandName));
		if (token === null) { // if cannot parse a command token
			this.unknownCommandCallback(contextBackup, commandName);
			token = new LatexTree.CommandToken({ name: commandName }); // generate unrecognized command token
		}
		return token;
	}


	/**
	 * Parse a parameter token
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.ParameterToken} the parsed token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseParameterToken(context) {
		let parameter = context.latexParameter; // the LaTeX parameter description
		if (parameter === null) return null; // return if cannot get the parameter description
		context.clearLatexParameter(); // don't store the parameter description in the context any more
		context.updateState(parameter.operations); // update the LaTeX state
		if (context.stopLabel) { // if the parameter must be parsed until the label in the source
			// create the parameter token
			context.token = new LatexTree.ParameterToken({ hasBrackets: false, hasSpacePrefix: false });
		} else { // if the parameter must be parsed as a single token
			// has the param space prefix or not
			let spacePrefixState = this._parseSpaceToken(context) !== null;
			// TODO: transfer comments
			if (context.sourceProbe("{", true)) { // if the parameter is bounded by brackets
				// create the parameter token
				context.token = new LatexTree.ParameterToken({ hasBrackets: true, hasSpacePrefix: spacePrefixState });
				context.stopLabel = "}"; // should parse until the closing bracket
			} else { // if the parameter is't bounded by brackets
				// create the parameter token
				context.token =	new LatexTree.ParameterToken({ hasBrackets: false, hasSpacePrefix: spacePrefixState });
			}
		}
		let parameterToken = context.token; // the created token
		if (context.stopLabel === null) { // if the parameter must be parsed as a single token
			this._parseToken(context); // parse the parameter internal token
		} else { // if the parameter must be parsed until the label or the bracket
			let stopLabel = context.stopLabel; // store the stop label
			if (parameter.lexeme === null) { // if the lexeme isn't defined
				this.parse(context); // just parse all the tokens until the label
			} else { // if the lexeme is defined
				context.latexLexeme = parameter.lexeme; // set lexeme for the source token
				this._parseToken(context); // parse the source token
			}
			if (!context.sourceProbe(stopLabel, true)) { // if there is no stop label in the source
				// TODO: handle unexpected source end
			}
		}
		return /** @type ?LatexTree.ParameterToken */ parameterToken;
	}


	/**
	 * Parse source token
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.SourceToken} the parsed token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseSourceToken(context) {
		let stopLabel = context.stopLabel; // get the source label to parse until
		if (!stopLabel)	throw new ReferenceError("\"context.stopLabel\" isn't a non-empty string");
		context.clearStopLabel(); // don't store the stol label any more
		let stopLabelOffset = context.source.indexOf(stopLabel, context.sourceOffset); // try to find the stop label
		let tokenSource = stopLabelOffset < 0 // the source for the token
			?	context.source.substring(context.sourceOffset) // all the source tail is there is no stop label
			:	context.source.substring(context.sourceOffset, stopLabelOffset); // until the stop label is there is one
		context.sourceOffset += tokenSource.length; // update the offset
		// TODO notification about unexpected source end
		let latexLexeme = context.latexLexeme;
		if (latexLexeme) { // if the lexeme is defined
			context.clearLatexLexeme(); // don't store the lexeme any more
			return new LatexTree.SourceToken({ source: tokenSource, lexeme: latexLexeme });
		} else { // if the lexeme isn't defined
			return new LatexTree.SourceToken(/** @type LatexTree.SourceTokenProperties */ { source: tokenSource });
		}
	}


	/**
	 * Parse an environment token
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.EnvironmentToken} the parsed token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseEnvironmentToken(context) {
		if (!context.sourceProbe("\\begin", true)) return null; // return if there is no environment begin
		let contextBackup = context.copy(); // backup the current context
		this._parseSpaceToken(context); // skip all the spaces
		// TODO: transfer comments
		let environmentNameMatch = context.sourceMatch(/^{([\w@]+\*?)}/); // try to obtain the environment name
		if (environmentNameMatch === null) return null; // exit if cannot get the environment name
		let environmentName = environmentNameMatch[1]; // the environment name
		// try to get the environment description
		let environment = this.latexSyntax.environments(context.state.latexState, environmentName)[0];
		if (!environment)	this.unknownEnvironmentCallback(contextBackup, environmentName);
		let environmentToken = context.token = environment // the environment token
			? new LatexTree.EnvironmentToken({ environment: environment })
			: new LatexTree.EnvironmentToken({ name: environmentName });
		context.sourceOffset += environmentNameMatch[0].length; // just after the environment name
		context.latexCommandName = environmentName; // the begin command name
		this._parseToken(context); // parse the begin command token
		context.latexEnvironmentName = environmentName; // prepare to parse environment body
		this._parseToken(context); // parse the body token
		if (context.sourceProbe("\\end", true)) { // if the stop label is found
			this._parseSpaceToken(context); // skip all the spaces
			// TODO: transfer comments
			if (context.sourceProbe(`{${ environmentName }}`, true)) { // if there is the end command
				context.latexCommandName = `end${ environmentName }`; // the end command name
				this._parseToken(context); // parse the end command token
				return environmentToken; // go back to the environment token end return it
			} else {
				// TODO incorrect environment end notification
			}
		} else {
			// TODO no environment end notification
		}
		return environmentToken; // go back to the environment token end return it
	}


	/**
	 * Parse an environment body token
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.EnvironmentBodyToken} the parsed token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseEnvironmentBodyToken(context) {
		let environmentName = context.latexEnvironmentName; // try to get the environment name from the context
		if (environmentName === null) { // if there is no environment name in the context
			return null; // no way to get the environment name
		} else { // if the command name was stored in the context
			context.clearLatexEnvironmentName(); // don't store the name any more
		}
		context.token = new LatexTree.EnvironmentBodyToken(); // token for environment body
		// the label to parse until
		context.stopLabel = /^\\end(?:{|\s|%)/;
		this.parse(context); // parse the environment body components
		return /** @type LatexTree.EnvironmentBodyToken */ context.token; // return the parsed token
	}


	/**
	 * Parse a comment line
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {string|null} the comment line or null is there is no comment
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseCommentLine(context) {
		// try to find a comment in the sources tail
		let commentMatch = context.sourceMatch(/^%([^\n]*)(\n[ \t]*)?/);
		if (commentMatch === null) return null; // return if there is no comment at this offset
		let comment = commentMatch[1]; // the comment string
		context.storeComment(comment); // store the comment string
		context.sourceOffset += commentMatch[0].length; // just after the comment
		return comment;
	}


	/**
	 * Parse space for a token (space or paragraph separator)
	 * @param {!LatexParser.Context} context the parsing context
	 * @return {?LatexTree.SpaceToken} the parsed token or null if cannot parse a space token
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parseSpaceToken(context) {
		let isSpace = false; // true is the sources fragment is a space token, false otherwise
		let nLineBreaks = 0; // number of parsed line breaks
		while (!context.isAtSourceEnd()) { // while there is something to parse
			if (this._parseCommentLine(context) !== null) continue; // go to the next iteration if there was a comment
			switch (context.sourceCharacter) { // depend on the sources current character
			case " ": // if a space
			case "\t": // if a tabular
			case "\r": // if carriage return
				isSpace = true; // and one more parsed char
				++context.sourceOffset; // go to the next sources char
				continue;
			case "\n": // if a line break
				isSpace = true; // and one more parsed char
				++nLineBreaks; // one more parsed line
				++context.sourceOffset; // go to the next sources char
				continue; // go to the next iteration
			}
			break; // stop if not a space char
		}
		// create a space token if needed
		return isSpace ? new LatexTree.SpaceToken({ lineBreakCount: nLineBreaks }) : null;
	}


	/**
	 * Try to parse a symbol pattern
	 * @param {!LatexParser.Context} context the parsing context
	 * @param {!Array.<!LatexSyntax.Symbol>} symbols the symbol or command descriptions in the priority descending order
	 * @return {?LatexTree.SymbolToken|?LatexTree.CommandToken} the parsed symbol or command token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parsePatterns(context, symbols) {
		let contextBackup = context.copy(); // backup the current context
		let token = null; // the parsed token
		symbols.some(symbol => { // for all the symbols until the parsing success
			token = this._parsePattern(context, symbol);
			if (token) return true; // stop if the token was parsed
			contextBackup.copy(context); // restore the context
			return false; // go to the next symbol
		});
		return token;
	}


	/**
	 * Try to parse a symbol pattern
	 * @param {!LatexParser.Context} context the parsing context
	 * @param {!LatexSyntax.Symbol} symbol the symbol or command description
	 * @return {?LatexTree.Token} the parsed symbol or command token or null if cannot parse
	 * @private
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_parsePattern(context, symbol) {
		context.token = symbol instanceof LatexSyntax.Command // if a command description is given
			?	new LatexTree.CommandToken({ command: symbol }) // generate a command token
			:	new LatexTree.SymbolToken({ symbol: symbol }); // generate a symbol token
		let patternComponents = symbol.patternComponents; // the symbol pattern components
		let nPatternComponents = patternComponents.length; // the pattern component number
		let iPatternComponent = 0; // the pattern component iterator
		for ( ; iPatternComponent < nPatternComponents; ++iPatternComponent) { // for all the pattern components
			let patternComponent = patternComponents[iPatternComponent]; // the pattern component
			switch (typeof patternComponent) {
			case "number": { // if a parameter is expected
				context.latexParameter = symbol.parameter(patternComponent); // the description to parse a parameter token
				// try to get the end label for the parameter
				let parameterEndLabel = patternComponents[iPatternComponent + 1];
				if (typeof parameterEndLabel === "string") { // if there is the end label for the token
					context.stopLabel = parameterEndLabel; // set the stop label for parsing
					if (this._parseToken(context)) { // if can parse the parameter token
						++iPatternComponent; // skip the end label in the pattern
						continue; // go to the next pattern component
					}
				} else { // if there is no a end label
					if (this._parseToken(context)) { // if can parse the parameter token
						continue; // go to the next pattern component
					}
				}
				break; // stop parsing if cannot parse a parameter token
			}
			case "string": // is a source pattern is expected
				while (this._parseCommentLine(context)) { // skip all the comments
				}
				if (context.sourceProbe(patternComponent, true)) { // if the sources fragment is equal the pattern component
					continue; // go to the next pattern component
				}
				break;
			default: // if a space is expected
				if (this._parseSpaceToken(context)) continue; // go to the next pattern component if can parse a space
				// TODO: transfer comments
			}
			break; // stop parsing if there was no continue call
		}
		if (iPatternComponent < nPatternComponents) return null; // return if the pattern parsing was broken
		context.updateState(symbol.operations); // update the LaTeX state
		return /** @type ?LatexTree.Token */ context.token; //return the parsed token
	}


	/**
	 * Default handler of unknown symbol
	 * @param {!LatexParser.Context} context the parsing context
	 * @param {!string} symbolPattern the pattern of the symbol
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	unknownSymbolCallback(context, symbolPattern) {
		let position = context.sourcePosition;
		console.log("Unknown symbol \"%SYMBOL_PATTERN%\" at line %LINE_NUMBER% char %CHAR_NUMBER%"
			.replace("%SYMBOL_PATTERN%", symbolPattern)
			.replace("%LINE_NUMBER%", position.line.toString())
			.replace("%CHAR_NUMBER%", position.char.toString()));
	}


	/**
	 * Default handler of unknown command
	 * @param {!LatexParser.Context} context the parsing context
	 * @param {!string} commandName the name of the command
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	unknownCommandCallback(context, commandName) {
		let position = context.sourcePosition;
		console.log("Unknown command \"%COMMAND_NAME%\" at line %LINE_NUMBER% char %CHAR_NUMBER%"
			.replace("%COMMAND_NAME%", commandName)
			.replace("%LINE_NUMBER%", position.line.toString())
			.replace("%CHAR_NUMBER%", position.char.toString()));
	}


	/**
	 * Default handler of unknown environment
	 * @param {!LatexParser.Context} context the parsing context
	 * @param {!string} environmentName the name of the command
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	unknownEnvironmentCallback(context, environmentName) {
		let position = context.sourcePosition;
		console.log("Unknown environment \"%ENVIRONMENT_NAME%\" at line %LINE_NUMBER% char %CHAR_NUMBER%"
			.replace("%ENVIRONMENT_NAME%", environmentName)
			.replace("%LINE_NUMBER%", position.line.toString())
			.replace("%CHAR_NUMBER%", position.char.toString()));
	}
}



/**
 * The parsing context
 * @class LatexParser.Context
 * @extends Parser.Context
 * @property {?Latex.Lexeme} latexLexeme the lexeme of the token to parse
 * @property {string|null} latexCommandName the name of the LaTeX command to parse the pattern
 *           or null if not a command token should be parsed
 * @property {?LatexSyntax.Parameter} latexParameter the LaTeX parameter description to parse
 *           or null if not a parameter token should be parsed
 * @property {string|null} latexEnvironmentName the name of the LaTeX environment to parse the body
 *           or null if not an environment body token should be parsed
 * @property {Array.<string>} _comments - The private storage for comments
 * @author Kirill Chuvilin <kirill.chuvilin@gmail.com>
 */
LatexParser.Context = class extends Parser.Context {
	/**
	 * Constructor
	 * @param {(string|!LatexParser.Context)=} source the source text to parse, another context to copy
	 *        or undefined to initiate with an empty source text
	 */
	constructor(source) {
		if (source === undefined) source = ""; // by default source is an empty string
		super(source); // the superclass constructor
		if (typeof source === "string") { // if the source string is set
			Object.defineProperties(this, {
				_latexLexeme: { value: null, writable: true }, // no token lexeme set
				_latexCommandName: { value: null, writable: true }, // no command pattern to parse
				_latexParameter: { value: null, writable: true }, // no parameter to parse
				_latexEnvironmentName: { value: null, writable: true }, // no environment body to parse
				_comments: { value: [], writable: true } // empty list of comments
			});
		} else if (source instanceof LatexParser.Context) { // if the instance to copy values from is defined
			Object.defineProperties(this, {
				_latexLexeme: { value: source._latexLexeme, writable: true }, // copy the lexeme
				// copy the name of the command to parse pattern
				_latexCommandName: { value: source._latexCommandName, writable: true },
				// copy the parameter description to parse
				_latexParameter: { value: source._latexParameter, writable: true },
				// copy the name of the environment to parse body
				_latexEnvironmentName: { value: source._latexEnvironmentName, writable: true },
				_comments: { value: source._comments.slice(), writable: true } // copy the list of comments
			});
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"other\" isn't a string or a LatexParser.Context instance");
		}
	}


	/**
	 * Copy this context
	 * @param {!Parser.Context=} target the context to copy to or undefined to create a new one
	 * @return {!LatexParser.Context} the context copy
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	copy(target) {
		if (target === undefined) { // if no instance to copy values to is defined
			return new LatexParser.Context(this); // return the new one initiated by this
		} else if (target instanceof LatexParser.Context) { // if the instance to copy values to is defined
			super.copy(target); // copy the superclass properties
			target._latexLexeme = this._latexLexeme; // store the lexeme of the token to parse
			target._latexCommandName = this._latexCommandName; // copy the name of the command to parse the pattern
			target._latexParameter = this._latexParameter; // copy the description of the parameter to parse
			target._latexEnvironmentName = this._latexEnvironmentName; // copy the name of the environment to parse the body
			target._comments = this._comments.slice(); // copy all the comments
			return target; // return the target instance
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"target\" isn't a LatexParser.Context instance");
		}
	}


	/**
	 * Create an initial parser state
	 * @return {!LatexParser.State} the created state
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	createInitialState() {
		return new LatexParser.State();
	}


	/**
	 * Update the LaTeX state
	 * @param {!Array.<!Latex.Operation>} operations the LaTeX operation list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	updateState(operations) {
		if (operations instanceof Array) {
			let newModeStates = {}; // the modes to update
			operations.forEach(operation => {
				switch (operation.directive) {
				case Latex.Directive.BEGIN:
					switch (operation.operand) {
					case Latex.GROUP:
						this.state.latexState.update(newModeStates); // store the mode states
						newModeStates = {}; // no more states to update
						this.backupState(); // store the current state
						break;
					default:
						newModeStates[operation.operand] = true; // turn the state on
					}
					break;
				case Latex.Directive.END:
					switch (operation.operand) {
					case Latex.GROUP:
						newModeStates = {}; // no need to store the states
						if (!this.restoreState()) { // if cannot restore the current state
							// TODO: process error
						}
						break;
					default:
						newModeStates[operation.operand] = false; // turn the state off
					}
					break;
				}
			});
			this.state.latexState.update(newModeStates); // store the mode states
		} else {
			throw new TypeError("\"operations\" isn't an Array instance");
		}
	}


	/**
	 * Get the LaTeX lexeme of the token to parse
	 * @return {?Latex.Lexeme} the lexeme or null if the lexeme is unknown
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get latexLexeme() {
		return this._latexLexeme;
	}


	/**
	 * Set the LaTeX lexeme of the token to parse
	 * @param {?Latex.Lexeme} latexLexeme the lexeme of the token to parse
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set latexLexeme(latexLexeme) {
		if (Latex.Lexeme[latexLexeme]) {
			if (this._latexLexeme === null) {
				this._latexLexeme = latexLexeme;
			} else {
				throw new ReferenceError("\"latexLexeme\" is already defined");
			}
		} else {
			throw new TypeError("\"latexLexeme\" isn't a Latex.Lexeme instance");
		}
	}


	/**
	 * Clear the lexeme of the token to parse
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	clearLatexLexeme() {
		this._latexLexeme = null;
	}


	/**
	 * Get the name of the LaTeX command to parse the pattern
	 * @return {string|null} the command name or null if there is no command pattern to parse
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get latexCommandName() {
		return this._latexCommandName;
	}


	/**
	 * Set the name of the LaTeX command to parse the pattern
	 * @param {string|null} latexCommandName the name of the command
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set latexCommandName(latexCommandName) {
		if (typeof(latexCommandName) === "string") {
			if (this._latexCommandName === null) {
				this._latexCommandName = latexCommandName;
			} else {
				throw new ReferenceError("\"latexCommandName\" is already defined");
			}
		} else {
			throw new TypeError("\"latexCommandName\" isn't a string");
		}
	}


	/**
	 * Clear the name of the LaTeX command to not parse a pattern
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	clearLatexCommandName() {
		this._latexCommandName = null;
	}


	/**
	 * Get the description of the LaTeX parameter to parse
	 * @return {?LatexSyntax.Parameter} the parameter description or null if there is no parameter to parse
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get latexParameter() {
		return this._latexParameter;
	}


	/**
	 * Set the description of the LaTeX parameter to parse
	 * @param {?LatexSyntax.Parameter} latexParameter the parameter description to parse
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set latexParameter(latexParameter) {
		if (latexParameter instanceof LatexSyntax.Parameter) {
			if (this._latexParameter === null) {
				this._latexParameter = latexParameter;
			} else {
				throw new ReferenceError("\"latexParameter\" is already defined");
			}
		} else {
			throw new TypeError("\"latexParameter\" isn't a LatexSyntax.Parameter instance");
		}
	}


	/**
	 * Clear the description to not parse a LaTeX parameter
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	clearLatexParameter() {
		this._latexParameter = null;
	}


	/**
	 * Get the name of the LaTeX environment to parse the body
	 * @return {string|null} the command name or null if there is no environment body to parse
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get latexEnvironmentName() {
		return this._latexEnvironmentName;
	}


	/**
	 * Set the name of the LaTeX environment to parse the body
	 * @param {string|null} latexEnvironmentName the name of the environment
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	set latexEnvironmentName(latexEnvironmentName) {
		if (typeof(latexEnvironmentName) === "string") {
			if (this._latexEnvironmentName === null) {
				this._latexEnvironmentName = latexEnvironmentName;
			} else {
				throw new ReferenceError("\"latexEnvironmentName\" is already defined");
			}
		} else {
			throw new TypeError("\"latexEnvironmentName\" isn't a string");
		}
	}


	/**
	 * Clear the name of a LaTeX environment to not parse a body
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	clearLatexEnvironmentName() {
		this._latexEnvironmentName = null;
	}


	/**
	 * Store a comment.
	 * @param {string} comment the comment string
	 */
	storeComment(comment) {
		if (typeof(comment) === "string") {
			this._comments.push(comment);
		} else {
			throw new TypeError("\"comment\" isn't a string");
		}
	}


	/**
	 * Get the appropriate class for the parser state
	 * @return {!LatexParser.State.constructor} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _stateClass() {
		return LatexParser.State;
	}


	/**
	 * Get the appropriate class for the syntax tree tokens
	 * @return {!LatexTree.Token.constructor} the class
	 * @protected
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _tokenClass() {
		return LatexTree.Token;
	}
};
Object.defineProperties(LatexParser.Context.prototype.constructor, { // define the class name
	name: { value: "LatexParser.Context", enumerable: true }
});
Object.defineProperties(LatexParser.Context.prototype, { // make getters and setters enumerable
	latexLexeme: { enumerable: true },
	latexCommandName: { enumerable: true },
	latexParameter: { enumerable: true },
	latexEnvironmentName: { enumerable: true }
});


/**
 * LaTeX parser state class
 * @class LatexParser.State
 * @extends Parser.State
 * @author Kirill Chuvilin <kirill.chuvilin@gmail.com>
 */
LatexParser.State = class extends Parser.State {
	/**
	 * Constructor
	 * @param {!LatexParser.State=} other the other state to copy or undefined to use default values
	 */
	constructor(other) {
		super(other); // the superclass constructor
		if (other === undefined) { // if no instance to copy values from is defined
			Object.defineProperties(this, {
				_latexState: { value: new Latex.State(), writable: true } // create the state
			});
		} else if (other instanceof LatexParser.State) { // if the instance to copy values from is defined
			Object.defineProperties(this, {
				_latexState: { value: other._latexState.copy(), writable: true } // create the state
			});
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"other\" isn't a LatexParser.State instance");
		}
	}


	/**
	 * Copy this state
	 * @param {!Parser.State=} target the state to copy to or undefined to create a new one
	 * @return {!LatexParser.State} this state copy
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	copy(target) {
		if (target === undefined) { // if no instance to copy values to is defined
			return new LatexParser.State(this); // return the new one initiated by this
		} else if (target instanceof LatexParser.State) { // if the instance to copy values to is defined
			super.copy(target); // copy the superclass properties
			target._latexState = this._latexState.copy(); // copy the LaTeX state
			return target; // return the target instance
		} else { // if the parameter has an unexpected type
			throw new TypeError("\"target\" isn't a LatexParser.State instance");
		}
	}


	/**
	 * Get LaTeX state
	 * @return {!Latex.State} the LaTeX state
	 */
	get latexState() {
		return this._latexState;
	}
};
Object.defineProperties(LatexParser.State.prototype.constructor, { // define the class name
	name: { value: "LatexParser.State", enumerable: true }
});
Object.defineProperties(LatexParser.State.prototype, { // make getters and setters enumerable
	latexState: { enumerable: true }
});



module.exports = LatexParser;

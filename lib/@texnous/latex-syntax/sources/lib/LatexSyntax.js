/**
 * @fileoverview LaTeX syntax structures.
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



/**
 * LaTeX syntax collection
 * @class LatexSyntax
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
class LatexSyntax {
	/**
	 * LaTeX syntax package properties
	 * @typedef {Object} LatexSyntax.PackageProperties
	 * @property {(!Array.<!LatexSyntax.SymbolProperties>|undefined)} symbols -
	 *           The symbols of the package in the priority descending order
	 * @property {(!Array.<!LatexSyntax.CommandProperties>|undefined)} commands -
	 *           The commands of the package in the priority descending order
	 * @property {(!Array.<!LatexSyntax.EnvironmentProperties>|undefined)} environments -
	 *           The environments of the package
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */


	/**
	 * Constructor
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor() {
		// The symbols by the first symbol of the pattern in the priority increasing order
		Object.defineProperty(this, "_symbols", { value: {}, enumerable: false });
		// The commands by the name in the priority increasing order
		Object.defineProperty(this, "_commands", { value: {}, enumerable: false });
		// The environments by the name in the priority increasing order
		Object.defineProperty(this, "_environments", { value: {}, enumerable: false });
	}


	/**
	 * Load a package with syntax definitions
	 * @param {string} packageName the name of the syntax package
	 * @param {LatexSyntax.PackageProperties} syntaxPackage the syntax package
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	loadPackage(packageName, syntaxPackage) {
		if (syntaxPackage.symbols !== undefined) { // if the symbol descriptions are defined
			if (syntaxPackage.symbols instanceof Array) { // type test
				// for all the symbol descriptions
				for (let iSymbol = syntaxPackage.symbols.length - 1; iSymbol >= 0; --iSymbol) {
					let symbol = new LatexSyntax.Symbol(syntaxPackage.symbols[iSymbol]); // the symbol description
					if (symbol.pattern) { // if the symbol has a pattern
						let symbolPatternFirstChar = symbol.pattern[0]; // the first char of the pattern
						// the symbols with the same pattern first char
						(this._symbols[symbolPatternFirstChar] || (this._symbols[symbolPatternFirstChar] = []))
							.push({ symbol, packageName }); // store the symbol and the package name
					}
				}
			} else {
				throw new TypeError("\"syntaxPackage.symbols\" isn't an Array");
			}
		}
		if (syntaxPackage.commands !== undefined) { // if the command descriptions are defined
			if (syntaxPackage.commands instanceof Array) { // type test
				// for all the command descriptions
				for (let iCommand = syntaxPackage.commands.length - 1; iCommand >= 0; --iCommand) {
					let command = new LatexSyntax.Command(syntaxPackage.commands[iCommand]); // the command description
					if (command.name) { // if the command has a name
						// the commands with the same name
						(this._commands[command.name] || (this._commands[command.name] = []))
							.push({ command, packageName }); // store the command and the package name
					}
				}
			} else {
				throw new TypeError("\"syntaxPackage.commands\" isn't an Array");
			}
		}
		if (syntaxPackage.environments !== undefined) { // if the environment descriptions are defined
			if (syntaxPackage.environments instanceof Array) { // type test
				// for all the environment descriptions
				for (let iEnvironment = syntaxPackage.environments.length - 1; iEnvironment >= 0; --iEnvironment) {
					// the environment description
					let environment = new LatexSyntax.Environment(syntaxPackage.environments[iEnvironment]);
					if (environment.name) { // if the environment has a name
						// the environments with the same name
						(this._environments[environment.name] || (this._environments[environment.name] = []))
							.push({ environment, packageName }); // store the environment and the package name
					}
				}
			} else {
				throw new TypeError("\"syntaxPackage.environments\" isn't an Array");
			}
		}
	}


	/**
	 * Unload a package with syntax definitions
	 * @param {string} packageName the name of the syntax package
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	unloadPackage(packageName) {
		Object.keys(this._symbols).forEach(symbolPatternFirstChar => { // for all the symbol pattern first chars
			// the filtered symbols with the same pattern first char
			let filteredSymbols = this._symbols[symbolPatternFirstChar].filter(syntaxItem => {
				return syntaxItem.packageName !== packageName;
			});
			// if there are still some symbols with the same pattern first char
			if (filteredSymbols.length) {
				// store the filtered symbol descriptions
				this._symbols[symbolPatternFirstChar] = filteredSymbols;
			} else { // if there are no the symbols with the same pattern first char
				delete this._symbols[symbolPatternFirstChar]; // delete the key-value pair
			}
		});
		Object.keys(this._commands).forEach(commandName => { // for all the command names
			// the filtered commands with the same name
			let filteredCommands = this._commands[commandName].filter(syntaxItem => {
				return syntaxItem.packageName !== packageName;
			});
			if (filteredCommands.length) { // if there are still some commands with the same name
				this._commands[commandName] = filteredCommands; // store the filtered command descriptions
			} else { // if there are no the commands with the same name
				delete this._commands[commandName]; // delete the key-value pair
			}
		});
		Object.keys(this._environments).forEach(environmentName => { // for all the environment names
			// the filtered environments with the same name
			let filteredEnvironments = this._environments[environmentName].filter(syntaxItem => {
				return syntaxItem.packageName !== packageName;
			});
			// if there are still some environments with the same name
			if (filteredEnvironments.length) {
				// store the filtered environment descriptions
				this._environments[environmentName] = filteredEnvironments;
			} else { // if there are no the environments with the same name
				delete this._environments[environmentName]; // delete the key-value pair
			}
		});
	}


	/**
	 * Get symbols
	 * @param {!Latex.State} state the state that the symbols must match to
	 * @param {string} patternFirstChar the first char of the symbol parameter pattern
	 * @return {!Array.<!Symbol>} the list of symbols in the priority descending order
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	symbols(state, patternFirstChar) {
		if (state instanceof Latex.State) { // type test
			// all the symbols with the defined first pattern char
			let symbols = this._symbols[patternFirstChar];
			if (symbols === undefined) return []; // return empty list if there are no such symbols
			let filteredSymbols = []; // the list of the symbols matching to the state
			for (let iSymbol = symbols.length - 1; iSymbol >= 0; --iSymbol) { // for all the symbols
				let symbol = symbols[iSymbol].symbol; // the symbol
				// store the symbol if it matches to the state
				if (state.test(symbol.modes)) filteredSymbols.push(symbol);
			}
			return filteredSymbols;
		}
		throw new SyntaxError("\"state\" isn't a Latex.State instance");
	}


	/**
	 * Get commands
	 * @param {!Latex.State} state the state that the commands must match to
	 * @param {!string} name the name of the command
	 * @return {Array.<Command>} the list of commands in the priority descending order
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	commands(state, name) {
		if (state instanceof Latex.State) { // type test
			let commands = this._commands[name]; // all the commands with the defined name
			if (!commands) return []; // return empty list if there are no such commands
			let filteredCommands = []; // the list of the commands matching to the state
			for (let iCommand = commands.length - 1; iCommand >= 0; --iCommand) { // for all the commands
				let command = commands[iCommand].command; // the command
				// store the command if it matches to the state
				if (state.test(command.modes)) filteredCommands.push(command);
			}
			return filteredCommands;
		}
		throw new SyntaxError("\"state\" isn't a Latex.State instance");
	}


	/**
	 * Get environments
	 * @param {!Latex.State} state the state that the environments must match to
	 * @param {!string} name the name of the environment
	 * @return {Array.<Environment>} the list of environments in the priority descending order
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	environments(state, name) {
		if (state instanceof Latex.State) { // type test
			let environments = this._environments[name]; // all the environments with the defined name
			if (!environments) return []; // return empty list if there are no such environments
			let filteredEnvironments = []; // the list of the environments matching to the state
			// for all the environments
			for (let iEnvironment = environments.length - 1; iEnvironment >= 0; --iEnvironment) {
				let environment = environments[iEnvironment].environment; // the environment
				// store the environment if it matches to the state
				if (state.test(environment.modes)) filteredEnvironments.push(environment);
			}
			return filteredEnvironments;
		}
		throw new SyntaxError("\"state\" isn't a Latex.State instance");
	}
}



/**
 * LaTeX syntax item properties
 * @typedef {Object} LatexSyntax.ItemProperties
 * @property {(Latex.Lexeme|null|undefined)} lexeme - The logical lexeme
 * @property {(!Object.<Latex.Mode, boolean>|undefined)} modes -
 *           The modes where the item is defined or not
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX syntax item encapsulation
 * @class LatexSyntax.Item
 * @property {(Latex.Lexeme|null)} lexeme - The logical lexeme
 * @property {!Object.<Latex.Mode, boolean>} modes - The modes where the item is defined or not
 * @property {!Object.<string,string>} html - HTML serialization properties
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexSyntax.Item = class {
	/**
	 * Constructor.
	 * @param {!LatexSyntax.ItemProperties=} initialProperties the initial property values
	 */
	constructor (initialProperties) {
		// do nothing if there are no initial properties
		if (initialProperties === undefined) return;
		if (initialProperties instanceof Object) { // type test
			switch (initialProperties.lexeme) {
			case undefined: break; // do nothing if no lexeme defined
			case null: break; // do nothing if the default lexeme defined
			default: {
				if (Latex.Lexeme[initialProperties.lexeme] === undefined) // if the lexeme is unknown
					throw new TypeError("\"initialProperties.lexeme\" isn't a Latex.Lexeme option");
				Object.defineProperty(this, "lexeme", { value: initialProperties.lexeme });
			}}
			if (initialProperties.modes !== undefined) {// if the mode states are set
				if (initialProperties.modes instanceof Object) { // type test
					Object.defineProperty(this, "modes", { value: {} }); // create the mode state storage
					Object.keys(initialProperties.modes).forEach(mode => { // for all the given modes
						if (Latex.Mode[mode] === undefined) // if the mode is unknown
							throw new TypeError("\"initialProperties.modes[\"" + mode + "\"]\" isn't a Latex.Mode option");
						// store the mode state
						Object.defineProperty(this.modes, mode, {
							value: initialProperties.modes[mode],
							enumerable: true
						});
					});
				} else {
					throw new TypeError("\"initialProperties.modes\" isn't an Object instance");
				}
			}
			if (initialProperties.html !== undefined) {// if the HTML serialization options are set
				if (typeof initialProperties.modes !== "object") { // type test
					Object.defineProperty(this, "html", { value: {} }); // create the HTML serialization options storage
					Object.keys(initialProperties.html).forEach(htmlKey => { // for all the keys
						Object.defineProperty(this.html, htmlKey, { // store the mode state
							value: initialProperties.html[htmlKey],
							enumerable: true
						});
					});
				} else {
					throw new TypeError("\"initialProperties.html\" isn't an Object instance");
				}
			}
		} else {
			throw new TypeError("\"initialProperties\" isn't an Object instance");
		}
	}


	/**
	 * Compare this item with the other one
	 * @param {?LatexSyntax.Item} other the item to compare with
	 * @return {boolean} true if the items are equal, false otherwise
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	equals(other) {
		if (other instanceof LatexSyntax.Item) // type test
			return this.lexeme === other.lexeme
				&& Object.keys(Latex.Mode).every(mode => this.modes[mode] === other.modes[mode]);
		return false;
	}
};
Object.defineProperties(LatexSyntax.Item.prototype.constructor, { // set class name
	name: { value: "LatexSyntax.Item", enumerable: true }
});
Object.defineProperties(LatexSyntax.Item.prototype, { // default property values
	lexeme: { value: null, enumerable: true }, // no lexeme by default
	modes: { value: {}, enumerable: true } // no mode mask by default
});



/**
 * LaTeX symbol or command parameter syntax properties
 * @typedef {Object} LatexSyntax.ParameterProperties
 * @extends LatexSyntax.ItemProperties
 * @property {(!Array.<!Latex.Operation|!Latex.OperationProperties>|undefined)} operations -
 *           The LaTeX operations that are performed before the parameter
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX symbol or command parameter syntax encapsulation
 * @class LatexSyntax.Parameter
 * @extends LatexSyntax.Item
 * @property {!Array.<!Latex.Operation>} operations -
 *           The LaTeX operations that are performed before this parameter
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexSyntax.Parameter = class extends LatexSyntax.Item {
	/**
	 * Constructor
	 * @param {!LatexSyntax.ParameterProperties=} initialProperties the initial property values
	 */
	constructor(initialProperties) {
		super(initialProperties); // the superclass constructor
		// do nothing if there are no initial properties
		if (initialProperties === undefined) return;
		if (initialProperties.operations !== undefined) { // if the operation list is set
			if (initialProperties.operations instanceof Array) {
				Object.defineProperty(this, "_operations", { // generate and store the operations list
					value: initialProperties.operations.map(operation => new Latex.Operation(operation))
				});
			} else {
				throw new TypeError("\"initialProperties.operations\" isn't an Array instance");
			}
		}
	}


	/**
	 * Get the LaTeX operations that are performed before this parameter
	 * @return {!Array.<!Latex.Operation>} the operation list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get operations() {
		return this._operations.slice();
	}


	/**
	 * Compare this parameter with the other one
	 * @param {?LatexSyntax.Item} other the parameter to compare with
	 * @return {boolean} true if the parameters are equal, false otherwise
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	equals(other) {
		if (other instanceof LatexSyntax.Parameter) { // type test
			if (!super.equals(other)) return false; // superclass test
			if (this._operations.length !== other._operations.length) return false;
			// test all the operations
			return this._operations.every((operation, iOperation) =>
				operation.equals(other._operations[iOperation]));
		}
		return false;
	}
};
Object.defineProperties(LatexSyntax.Parameter.prototype.constructor, { // set class name
	name: { value: "LatexSyntax.Parameter", enumerable: true }
});
Object.defineProperties(LatexSyntax.Parameter.prototype, { // make getters and setters enumerable
	operations: { enumerable: true }
});
Object.defineProperties(LatexSyntax.Parameter.prototype, { // default property values
	_operations: { value: [], enumerable: false } // empty operation list by default
});



/**
 * LaTeX symbol syntax properties
 * @typedef {Object} LatexSyntax.SymbolProperties
 * @extends LatexSyntax.ItemProperties
 * @property {(!Array.<!Latex.Operation|!Latex.OperationProperties>|undefined)} operations -
 *           The LaTeX operations that
 * @property {(!Array.<!LatexSyntax.Parameter|!LatexSyntax.ParameterProperties>|undefined)} parameters -
 *           The parameters description list
 * @property {(string|undefined)} pattern - The LaTeX input pattern
 * @property {(string|undefined)} html - The HTML output pattern
 * are performed after the symbol
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX symbol syntax encapsulation
 * @class LatexSyntax.Symbol
 * @extends LatexSyntax.Item
 * @property {!Array.<!Latex.Operation>} operations -
 *           The LaTeX operations that are performed after this symbol
 * @property {!Array.<!LatexSyntax.Parameter>} parameters - The parameters description list
 * @property {!Array.<null|string|number>} patternComponents - The LaTeX input pattern components
 *           null   - place for space
 *           string - place for source inclusion
 *           number - index of a parameter
 * @property {string} pattern - The LaTeX input pattern
 * @property {string} html - The HTML output pattern
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexSyntax.Symbol = class extends LatexSyntax.Item {
	/**
	 * Constructor
	 * @param {!LatexSyntax.SymbolProperties=} initialProperties the initial property values
	 */
	constructor(initialProperties) {
		super(initialProperties); // the superclass constructor
		// do nothing if there are no initial properties
		if (initialProperties === undefined) return;
		if (initialProperties.operations !== undefined) { // if the operation list is set
			if (initialProperties.operations instanceof Array) { // type test
				Object.defineProperty(this, "_operations", { // generate and store the operations list
					value: initialProperties.operations.map(operation => new Latex.Operation(operation))
				});
			} else {
				throw new TypeError("\"initialProperties.operations\" isn't an Array instance");
			}
		}
		if (initialProperties.parameters !== undefined) { // if the parameters list is set
			if (initialProperties.parameters instanceof Array) { // type test
				Object.defineProperty(this, "_parameters", { // generate and store the parameters list
					value: initialProperties.parameters.map(parameter => new LatexSyntax.Parameter(parameter))
				});
			} else {
				throw new TypeError("\"initialProperties.parameters\" isn't an Array instance");
			}
		}
		if (initialProperties.pattern !== undefined) { // if the LaTeX pattern is set
			if (typeof initialProperties.pattern !== "string")
				throw new TypeError("\"initialProperties.pattern\" isn't a string");
			// try to parse the pattern
			let patternComponents = initialProperties.pattern.match(/([ \t]+|#\d+|[^ \t#]+)/g);
			if (patternComponents !== null) { // if there is a non-trivial pattern
				Object.defineProperty(this, "_patternComponents", { // store the pattern components
					value: patternComponents.map(patternPart => {
						switch (patternPart[0]) {
						case " ": case "\t": // if a space part
							return null; // null is a mark for spaces
						case "#": { // if a parameter part
							let parameterIndex = Number(patternPart.substring(1)) - 1; // the index of a parameter
							if (!this._parameters[parameterIndex])
								throw new TypeError(
									"\"initialProperties.pattern\" contains the incorrect parameter number " +
									patternPart.substring(1)
								);
							return parameterIndex;
						}
						default: // raw pattern part
							return patternPart;
						}
					})
				});
			}
		}
		if (initialProperties.html !== undefined) { // if the LaTeX pattern is set
			if (typeof initialProperties.html !== "string")
				throw new TypeError("\"initialProperties.html\" isn't a string");
			// store the pattern
			Object.defineProperty(this, "html", { value: initialProperties.html, enumerable: true });
		}
	}


	/**
	 * Get the LaTeX operations that are performed after this symbol
	 * @return {!Array.<!Latex.Operation>} the operation list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get operations () {
		return this._operations.slice();
	}


	/**
	 * Get the parameters description list
	 * @return {!Array.<!LatexSyntax.Parameter>} the parameter list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get parameters () {
		return this._parameters.slice();
	}


	/**
	 * Get the parameter description
	 * @param {number} parameterIndex the index of the parameter
	 * @return {?LatexSyntax.Parameter} the parameter or null if there is no parameter with such an index
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	parameter(parameterIndex) {
		return this._parameters[parameterIndex] || null;
	}


	/**
	 * Get the pattern components
	 * @return {!Array.<null|string|number>} the pattern component list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get patternComponents () {
		return this._patternComponents.slice();
	}


	/**
	 * Get the pattern
	 * @return {string} the LaTeX input pattern
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get pattern () {
		return this._patternComponents.map(patternComponent => {
			switch (typeof patternComponent) {
			case "number": return "#" + (patternComponent + 1);
			case "string": return patternComponent;
			default: return " ";
			}
		}).join("");
	}

	/**
	 * Compare this symbol with the other one
	 * @param {?LatexSyntax.Item} other the symbol to compare with
	 * @return {boolean} true if the symbols are equal, false otherwise
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	equals(other) {
		if (other instanceof LatexSyntax.Symbol) { // type test
			if (!super.equals(other)) return false; // superclass test
			if (this._operations.length !== other._operations.length) return false;
			// test all the operations
			if (!this._operations.every((operation, iOperation) =>
					operation.equals(other._operations[iOperation])))
				return false;
			if (this._parameters.length !== other._parameters.length) return false;
			// test all the parameters
			if (!this._parameters.every((parameter, iParameter) =>
					parameter.equals(other._parameters[iParameter])))
				return false;
			return this.html === other.html;
		}
		return false;
	}
};
Object.defineProperties(LatexSyntax.Symbol.prototype.constructor, { // set class name
	name: { value: "LatexSyntax.Symbol", enumerable: true }
});
Object.defineProperties(LatexSyntax.Symbol.prototype, { // make getters and setters enumerable
	operations: { enumerable: true },
	parameters: { enumerable: true },
	patternComponents: { enumerable: true },
	pattern: { enumerable: true }
});
Object.defineProperties(LatexSyntax.Symbol.prototype, { // default property values
	_operations: { value: [], enumerable: false }, // empty operation list
	_parameters: { value: [], enumerable: false }, // empty parameter list
	_patternComponents: { value: [], enumerable: false }, // empty pattern
	html: { value: "", enumerable: true } // empty HTML pattern
});



/**
 * LaTeX command syntax properties
 * @typedef {Object} LatexSyntax.CommandProperties
 * @extends LatexSyntax.SymbolProperties
 * @property {(string|undefined)} name - The command name (a sequence of letters and optional star)
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX command syntax encapsulation
 * @class LatexSyntax.Command
 * @extends LatexSyntax.Symbol
 * @property {string} name - The command name (a sequence of letters and optional star)
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexSyntax.Command = class extends LatexSyntax.Symbol {
	/**
	 * Constructor
	 * @param {!LatexSyntax.CommandProperties=} initialProperties the initial property values
	 */
	constructor(initialProperties) {
		super(initialProperties); // the superclass constructor
		// do nothing if there are no initial properties
		if (initialProperties === undefined) return;
		if (initialProperties.name !== undefined) { // if the name is set
			if (typeof initialProperties.name !== "string")
				throw new TypeError("\"initialProperties.name\" isn't a string");
			// store the name
			Object.defineProperty(this, "name", { value: initialProperties.name });
		}
	}


	/**
	 * Compare this command with the other one
	 * @param {?LatexSyntax.Item} other the command to compare with
	 * @return {boolean} true if the commands are equal, false otherwise
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	equals(other) {
		if (other instanceof LatexSyntax.Command) { // type test
			if (!super.equals(other)) return false; // superclass test
			return this.name === other.name;
		}
		return false;
	}
};
Object.defineProperties(LatexSyntax.Command.prototype.constructor, { // set class name
	name: { value: "LatexSyntax.Command", enumerable: true }
});
Object.defineProperties(LatexSyntax.Command.prototype, { // default property values
	name: { value: "", enumerable: true } // empty name
});



/**
 * LaTeX command syntax properties
 * @typedef {Object} LatexSyntax.EnvironmentProperties
 * @extends LatexSyntax.ItemProperties
 * @property {(string|undefined)} name - The command name (a sequence of letters and optional star)
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * LaTeX environment syntax encapsulation
 * @class LatexSyntax.Environment
 * @extends LatexSyntax.Item
 * @property {string} name - The environment name (a sequence of letters and optional star)
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
LatexSyntax.Environment = class extends LatexSyntax.Item {
	/**
	 * Constructor
	 * @param {!LatexSyntax.EnvironmentProperties=} initialProperties the initial property values
	 */
	constructor(initialProperties) {
		super(initialProperties); // the superclass constructor
		// do nothing if there are no initial properties
		if (initialProperties === undefined) return;
		if (initialProperties.name !== undefined) { // if the name is set
			if (typeof initialProperties.name !== "string")
				throw new TypeError("\"initialProperties.name\" isn't a string");
			// store the name
			Object.defineProperty(this, "name", { value: initialProperties.name });
		}
	}


	/**
	 * Compare this environment with the other one
	 * @param {?LatexSyntax.Item} other the environment to compare with
	 * @return {boolean} true if the environments are equal, false otherwise
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	equals(other) {
		if (other instanceof LatexSyntax.Environment) { // type test
			if (!super.equals(other)) return false; // superclass test
			return this.name === other.name;
		}
		return false;
	}
};
Object.defineProperties(LatexSyntax.Environment.prototype.constructor, { // set class name
	name: { value: "LatexSyntax.Environment", enumerable: true }
});
Object.defineProperties(LatexSyntax.Environment.prototype, { // default property values
	name: { value: "", enumerable: true } // empty name
});



module.exports = LatexSyntax;

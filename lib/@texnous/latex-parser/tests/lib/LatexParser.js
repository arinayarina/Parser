/**
 * @fileoverview  LaTeX parser class tests
 * This file is a part of TeXnous project.
 *
 * @copyright TeXnous project team (http://texnous.org) 2016
 * @license LGPL-3.0
 *
 * This unit test is free software; you can redistribute it and/or modify it under the terms of the
 * GNU Lesser General Public License as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This unit test is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this unit
 * test; if not, write to the Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston,
 * MA 02111-1307, USA.
 */

"use strict";

const LatexSyntax = require("@texnous/latex-syntax"); // LaTeX syntax structures
const LatexParser =  require("../../sources/lib/LatexParser"); // LaTeX parser class

let latexStyle = new LatexSyntax();
latexStyle.loadPackage("test", {
	symbols: [{
		pattern: "\\\\"
	}, {
		pattern: " \"--- "
	}, {
		pattern: "{#1}",
		lexeme: "BRACKETS",
		parameters: [{ }]
	}],
	commands: [{
		name: "author",
		pattern: "[#1]#2",
		modes: { TEXT: true },
		parameters: [{}, {}],
		operations: []
	}, {
		name: "author",
		pattern: " [#1]#2",
		modes: { TEXT: true },
		parameters: [{}, {}],
		operations: []
	}, {
		name: "author",
		pattern: "#1",
		modes: { TEXT: true },
		parameters: [{}],
		operations: []
	}, {
		name: "document",
		modes: { TEXT: true }
	}, {
		name: "enddocument",
		modes: { TEXT: true }
	}],
	environments: [{
		name: "document",
		modes: { TEXT: true }
	}]
});
let latexParser;
let parserMassages = []; // the messages while parsing


/**
 * Test parsing result
 * @param test - The unit test object
 * @param source - The source to parse
 * @param expected - The list of expected token strings
 * @param expectedParserMessages - The list of expected parser messages
 * @author Kirill Chuvilin <kirill.chuvilin@gmail.com>
 */
function testParsing(test, source, expected, expectedParserMessages) {
	parserMassages = []; // reset parser messages
	let sourceOffset = 0;
	test.deepEqual(
		latexParser.parse(source).map(token =>
			`${ token.toString(true) } ${ sourceOffset += token.sourceOffset }-${ (sourceOffset += token.sourceLength) - 1}`),
		expected
	);
	test.deepEqual(parserMassages, expectedParserMessages);
}



/**
 * Tests of LaTeX parser
 * @author Kirill Chuvilin <kirill.chuvilin@gmail.com>
 */
module.exports = {
	"LatexParser": {
		"constructor": test => {
			test.doesNotThrow(() => latexParser = new LatexParser(latexStyle));
			latexParser.unknownSymbolCallback = (context, symbolPattern) =>	{
				let position = context.sourcePosition;
				parserMassages.push("Unknown symbol \"%SYMBOL_PATTERN%\" at line %LINE_NUMBER% char %CHAR_NUMBER%"
					.replace("%SYMBOL_PATTERN%", symbolPattern)
					.replace("%LINE_NUMBER%", position.line.toString())
					.replace("%CHAR_NUMBER%", position.char.toString()));
			};
			latexParser.unknownCommandCallback = (context, commandName) => {
				let position = context.sourcePosition;
				parserMassages.push("Unknown command \"%COMMAND_NAME%\" at line %LINE_NUMBER% char %CHAR_NUMBER%"
					.replace("%COMMAND_NAME%", commandName)
					.replace("%LINE_NUMBER%", position.line.toString())
					.replace("%CHAR_NUMBER%", position.char.toString()));
			};
			latexParser.unknownEnvironmentCallback = (context, environmentName) => {
				let position = context.sourcePosition;
				parserMassages.push("Unknown environment \"%ENVIRONMENT_NAME%\" at line %LINE_NUMBER% char %CHAR_NUMBER%"
					.replace("%ENVIRONMENT_NAME%", environmentName)
					.replace("%LINE_NUMBER%", position.line.toString())
					.replace("%CHAR_NUMBER%", position.char.toString()));
			};
			test.done();
		},
		"parse spaces": test => {
			testParsing(test, "", [], []);
			testParsing(test, "% comment\n % comment", [], []);
			testParsing(test, " ", ["LatexTree.SpaceToken { \" \" } 0-0"], []);
			testParsing(test, " % comment\n ", ["LatexTree.SpaceToken { \" \" } 0-11"], []);
			testParsing(test, "\t% comment\n ", ["LatexTree.SpaceToken { \" \" } 0-11"], []);
			testParsing(test, "\t% comment\n\n", ["LatexTree.SpaceToken { \"\n\" } 0-11"], []);
			testParsing(test, "\n % comment\n\n", ["LatexTree.SpaceToken { \"\n\n\" } 0-12"], []);
			testParsing(test, "\n % comment\n\n  % comment\n\n", ["LatexTree.SpaceToken { \"\n\n\" } 0-25"], []);
			test.done();
		},
		"parse symbols": test => {
			testParsing(test, "%\n\\\\%\n",
				["LatexTree.SymbolToken { \"\\\\\" } 2-3"],
				[]);
			testParsing(test, " \\\\",
				["LatexTree.SpaceToken { \" \" } 0-0", "LatexTree.SymbolToken { \"\\\\\" } 1-2"],
				[]);
			testParsing(test, "\\\\ ",
				["LatexTree.SymbolToken { \"\\\\\" } 0-1", "LatexTree.SpaceToken { \" \" } 2-2"],
				[]);
			testParsing(test, "\\\\\\\\",
				["LatexTree.SymbolToken { \"\\\\\" } 0-1", "LatexTree.SymbolToken { \"\\\\\" } 2-3"],
				[]);
			testParsing(test, "\"%\n",
				["LatexTree.SymbolToken { \"\"\" } 0-0"],
				["Unknown symbol \"\"\" at line 1 char 1"]);
			testParsing(test, "\\\\\"",
				["LatexTree.SymbolToken { \"\\\\\" } 0-1", "LatexTree.SymbolToken { \"\"\" } 2-2"],
				["Unknown symbol \"\"\" at line 1 char 3"]);
			testParsing(test, "%\n\"\\\\",
				["LatexTree.SymbolToken { \"\"\" } 2-2", "LatexTree.SymbolToken { \"\\\\\" } 3-4"],
				["Unknown symbol \"\"\" at line 2 char 1"]);
			testParsing(test, "\"%\n\"",
				["LatexTree.SymbolToken { \"\"\" } 0-0", "LatexTree.SymbolToken { \"\"\" } 3-3"],
				["Unknown symbol \"\"\" at line 1 char 1", "Unknown symbol \"\"\" at line 2 char 1"]);
			testParsing(test, " \"--- ",
				["LatexTree.SymbolToken { \" \"--- \" } 0-5"],
				[]);
			testParsing(test, "  \"--- ",
				["LatexTree.SymbolToken { \" \"--- \" } 0-6"],
				[]);
			testParsing(test, " \t\"--- ",
				["LatexTree.SymbolToken { \" \"--- \" } 0-6"],
				[]);
			testParsing(test, "{{}} ",
				["LatexTree.SymbolToken { \"{{}}\" } 0-3", "LatexTree.SpaceToken { \" \" } 4-4"],
				[]);
			testParsing(test, "{{}}%\n\n ",
				["LatexTree.SymbolToken { \"{{}}\" } 0-3", "LatexTree.SpaceToken { \"\n\" } 6-7"],
				[]);
			test.done();
		},
		"parse commands": test => {
			testParsing(test, "\\author{Name}",
				["LatexTree.CommandToken { \"\\author{Name}\" } 0-12"],
				[
					"Unknown symbol \"N\" at line 1 char 9",
					"Unknown symbol \"a\" at line 1 char 10",
					"Unknown symbol \"m\" at line 1 char 11",
					"Unknown symbol \"e\" at line 1 char 12"
				]);
			testParsing(test, "\\author [Opt Name] {Name}",
				["LatexTree.CommandToken { \"\\author [Opt Name] {Name}\" } 0-24"],
				[
					"Unknown symbol \"O\" at line 1 char 10",
					"Unknown symbol \"p\" at line 1 char 11",
					"Unknown symbol \"t\" at line 1 char 12",
					"Unknown symbol \"N\" at line 1 char 14",
					"Unknown symbol \"a\" at line 1 char 15",
					"Unknown symbol \"m\" at line 1 char 16",
					"Unknown symbol \"e\" at line 1 char 17",
					"Unknown symbol \"N\" at line 1 char 21",
					"Unknown symbol \"a\" at line 1 char 22",
					"Unknown symbol \"m\" at line 1 char 23",
					"Unknown symbol \"e\" at line 1 char 24"
				]);
			testParsing(test, "\\author[{Opt Name}] {Name}",
				["LatexTree.CommandToken { \"\\author[{Opt Name}] {Name}\" } 0-25"],
				[
					"Unknown symbol \"O\" at line 1 char 10",
					"Unknown symbol \"p\" at line 1 char 11",
					"Unknown symbol \"t\" at line 1 char 12",
					"Unknown symbol \"N\" at line 1 char 14",
					"Unknown symbol \"a\" at line 1 char 15",
					"Unknown symbol \"m\" at line 1 char 16",
					"Unknown symbol \"e\" at line 1 char 17",
					"Unknown symbol \"N\" at line 1 char 22",
					"Unknown symbol \"a\" at line 1 char 23",
					"Unknown symbol \"m\" at line 1 char 24",
					"Unknown symbol \"e\" at line 1 char 25"
				]);
			testParsing(test, "\\buthor{Name}",
				["LatexTree.CommandToken { \"\\buthor\" } 0-6",	"LatexTree.SymbolToken { \"{Name}\" } 7-12"],
				[
					"Unknown command \"buthor\" at line 1 char 1",
					"Unknown symbol \"N\" at line 1 char 9",
					"Unknown symbol \"a\" at line 1 char 10",
					"Unknown symbol \"m\" at line 1 char 11",
					"Unknown symbol \"e\" at line 1 char 12"
				]);
			test.done();
		},
		"parse environments": test => {
			testParsing(test, "\\begin{document}\\end{document}",
				["LatexTree.EnvironmentToken { \"\\begin{document}\\end{document}\" } 0-29"],
				[]);
			testParsing(test, "\\begin {document}\\author{Name}\\end{document}",
				["LatexTree.EnvironmentToken { \"\\begin{document}\\author{Name}\\end{document}\" } 0-43"],
				[
					"Unknown symbol \"N\" at line 1 char 26",
					"Unknown symbol \"a\" at line 1 char 27",
					"Unknown symbol \"m\" at line 1 char 28",
					"Unknown symbol \"e\" at line 1 char 29"
				]);
			testParsing(test, "\\begin{document}\\author{Name}\\end {document}",
				["LatexTree.EnvironmentToken { \"\\begin{document}\\author{Name}\\end{document}\" } 0-43"],
				[
					"Unknown symbol \"N\" at line 1 char 25",
					"Unknown symbol \"a\" at line 1 char 26",
					"Unknown symbol \"m\" at line 1 char 27",
					"Unknown symbol \"e\" at line 1 char 28"
				]);
			test.done();
		}
	}
};

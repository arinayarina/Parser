let fs = require('fs');
let Parser = require('./lib/Parser');


let text = fs.readFileSync('file.md', 'utf-8');


let parser = new Parser(text);
parser.printContext();
console.log("_____");
parser.parse();
//console.log("_____");
//parser.show();

console.log("_____");
//parser.printLines();


let fs = require('fs');
let Parser = require('./lib/Parser');


let text = fs.readFileSync('file.md', 'utf-8');


let parser = new Parser();

parser.parse(text);
console.log(parser.show());
console.log("_____");


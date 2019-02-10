let fs = require('fs');
let Parser = require('./Parser');


let text = fs.readFileSync('file.md', 'utf-8');


let parser = new Parser();

parser.init(text);

parser.printText();
console.log(parser.show());
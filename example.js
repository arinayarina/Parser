let fs = require('fs');
let MarkdownParser = require('./lib/Parser');


let text = fs.readFileSync('example.md', 'utf-8');


let parser = new MarkdownParser(text);

parser.parse();

parser.printTree();


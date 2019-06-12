let fs = require('fs');
let MarkdownParser = require('./lib/Parser');


let text = fs.readFileSync('example.md', 'utf-8');


let parser = new MarkdownParser(text);

parser.parse();

let HTML = parser.toHTML();

fs.writeFile("example.html", HTML, function (err) {
    if (err) throw err;
    console.log('HTML file is created successfully.');
});

parser.printTree();


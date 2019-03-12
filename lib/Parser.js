const Context = require('./Сontext');
const Patterns = require('./patterns');
const Tree = require('./Tree');

let patterns = new Patterns();


const PatternsReg = {
    IMG: { //доделать
        type: "image",
        reg: new RegExp('^!\\[(.{0,})\\]\\((.+)\\)'),
    },
    Horizontal_Rules: {
        type: "Horizontal Rules",
        reg: new RegExp('^[-]{3,}$|^[*]{3,}$|^[_]{3,}$'),
    },
    Header: {
        type: "Header",
        reg: new RegExp('^[#]+[\\s]+')
    },
    Header_Underline: {
        type: "Header_underline",
        reg: new RegExp('^[-]{3,}[\\s]*$|^[*]{3,}[\\s]*$|^[=]{3,}[\\s]*$')
    },
    BlockQuotes: {
        type: "BlockQuotes",
        reg: new RegExp('^[>]{1}')
    },
    List: {
        type: "List",
        reg: new RegExp('^[*|+|-]{1}[\\s]')
    },
    BlockCode: {
        type: "BlockCode",
        reg: new RegExp('^[ ]{4,}$|^[\t]')
    },
    Code: {
        type: "Code",
        reg: new RegExp('^[ ]{4,}$|^[\t]')
    },
    Backslashe: {
        type: "Backslashe",
        reg: new RegExp('^\\*(.+)\\*')
    },
    Em: {
        type: "Em",
        reg: new RegExp('^\\*(.+)\\*|^_(.+)_'),
    },
    Strong: {
        type: "Strong",
        reg: new RegExp('^[\*]{2}(.+)[\*]{2}|^[\_]{2}(.+)[\_]{2}'),
    },


    Link: { //добавить пробелы
        type: "Link",
        reg: new RegExp('^\\[(.{0,})\\]\\((.+)\\)|^\\<(.{0,})\\>\\((.+)\\)')
    },
    LinkLable: { //(2 типа)
        type: "LinkLable",
        reg: new RegExp(`^\\[.+]:(.+)$`)
    },
};


const specialSymbols = "$@#\\/|`~*_-{}[]().?,!;%:^&";

class Parser {
    constructor(text){
        this.tree = new Tree;
        this.currentNode = this.tree.getRoot();
        this.context = new Context(text);
    }

    parse() {

        while (!this.context.atEndLine()) {
            // if (context.isSpace()) { // если текущий символ -- пробел
                 // считать, посчитать
                 // если не в начале строки сгенерировать узел пробела
             //}
             let charPatterns = patterns.get(this.context);

            if(charPatterns.some(pattern => this.parsePattern(pattern))){
                console.log(true);
            }


             //if (charPatterns.some(pattern => {
               //  return parsePattern(context, pattern.type);
                 // если успех, контекст изменяется соответствующим образом:
                 // сдвигается position
                 // наращивается дерево
                 // изменяется узел, если нужно и т.п.
                 // если не успех, контекст должен быть восстановлен до исходного состояния
             //})) continue;


         }
    }


    parsePattern(pattern) {
        if(pattern.reg.test(this.context.text)) {
            if(pattern.type === "Header") {
                let new_node = this.parseHeader(this.context.line);
                console.log(this.tree);
                console.log("new",new_node);
                this.tree.addNode(new_node, this.tree.root);
                this.context.toNextLine();
                // переместить позицию контекста, пересчитать режимы
                console.log(this.tree);
            }
            return true
        } else {
            return false
        }


        /*context.backup();
        if (pattern.regexp.match(...)) {
            // сгенерировать соответствующий узел
            context.moveTo(...); // переместить позицию контекста, пересчитать режимы
            // выйти из текущего узла, если текущий узел не поддерживает формат нового узла
            // если нужно, сгенерировать узел-контейнер (код, список, цитата и т.п.)
            // добавить узел в дерево
            return true;
        } else {
            context.restore();
            return false;
        }*/
    }


    printText(text) {
        let context = new Context(text);
        context.init(text);

        context.printText();
    }
    show(){
        this.context.printText();
    }
    printLines(){
        this.context.printLines();
    }

    printContext() {
        this.context.printContext();
    }


    parseText(text, currentNode) {
        let child = "";
        let reg = new RegExp('[a-zA-Za-яА-я0-9\\s]');
        let i = 0;
        while(i !== text.length){
            if(reg.test(text[i])) {
                    child = child.concat(text[i]);
                    i++;
            } else {
                if(child !== "") {
                    currentNode.addChild(new Tree.Node("text", {text: child}));
                }
                child = "";
                if(text[i] === "*" || text[i] === "_") {
                    if(PatternsReg.Strong.reg.test(text.slice(i))) {
                        let [node, len] = this.boldText(text.slice(i));
                        i = i + len;
                        currentNode.addChild(node);
                        continue;
                    }
                    if(PatternsReg.Em.reg.test(text.slice(i))) {
                        let [node, len] = this.cursiveText(text.slice(i));
                        i = i + len;
                        currentNode.addChild(node);
                        continue;
                    }


                    currentNode.addChild(new Tree.Node("symbol", {text: text[i]}));
                    i++;
                } else {
                    if(text[i] === "\\" && specialSymbols.indexOf(text[i+1]) !== -1){
                        currentNode.addChild(new Tree.Node("specialSymbol", {symbol: text[i+1]}));
                        i = i + 2;
                    } else {
                        currentNode.addChild(new Tree.Node("symbol", {text: text[i]}));
                        i++;
                    }
                }
            }
        }

        if (child !== "") {
            currentNode.addChild(new Tree.Node("text", {text: child}));
        }
        return currentNode;
    }


    boldText(line) {
        let reg = new RegExp('[a-zA-Za-яА-я0-9\\s]');
        let i = 2;
        let text = "";
        let node = new Tree.Node("bold", {type: line[0]});
        while (line[i] !== line[0]) {
            if (PatternsReg.Em.reg.test(line.slice(i))) {
                if (text !== "") {
                    node.addChild(new Tree.Node("text", {text: text}));
                    text = "";
                }
                let [child, len] = this.cursiveText(line.slice(i));
                node.addChild(child);
                i = i + len;
                continue;
            }

            if(reg.test(line[i])) {
                text = text.concat(line[i]);
                i++;
            } else {
                if(text !== "") {
                    node.addChild(new Tree.Node("text", {text: text}));
                    text = "";
                };
                if (line[i] === "\\" && specialSymbols.indexOf(line[i + 1]) !== -1) {
                    node.addChild(new Tree.Node("specialSymbol", {symbol: line[i + 1]}));
                    i = i + 2;
                } else {
                    node.addChild(new Tree.Node("symbol", {text: line[i]}));
                    i++;
                    text =  "";
                }
            }
        }

        if(text !=="") {
            node.addChild(new Tree.Node("text", {text: text}));
        }

        return [node, i + 2];
    }

    cursiveText(line) {
        let i = 1;
        let text = "";
        let reg = new RegExp('[a-zA-Za-яА-я0-9\\s]');
        let node = new Tree.Node("cursive", {type: line[0]});
        while (line[0] !== line[i]){
            if(PatternsReg.Strong.reg.test(line.slice(i))) {
                if(text !== "") {
                    node.addChild(new Tree.Node("text", {text: text}));
                    text = "";
                }
                let [child, len] = this.boldText(line.slice(i));
                node.addChild(child);
                i = i + len;
                continue;
            }
            if(reg.test(line[i])) {
                text = text.concat(line[i]);
                i++;
            } else {
                if(text !== "") {
                    node.addChild(new Tree.Node("text", {text: text}));
                    text = "";
                }
                if (line[i] === "\\" && specialSymbols.indexOf(line[i + 1]) !== -1) {
                    node.addChild(new Tree.Node("specialSymbol", {symbol: line[i + 1]}));
                    i = i + 2;
                } else {
                    node.addChild(new Tree.Node("symbol", {text: line[i]}));
                    i++;
                    text =  "";
                }
            }
        }
        if(text !=="") {
            node.addChild(new Tree.Node("text", {text: text}));
        }
        return [node, i + 1];
    }


    parseHeader(line) {
        console.log("line:", line);
        let worlds = line.split(" ");
        console.log(line.slice(worlds[0].length + 1));
        let node = new Tree.Node("Header");
        console.log("!",node);
        node.addToken({level: worlds[0].length});

        this.parseText(line.slice(worlds[0].length + 1), node);

        return node;
    }

    parseImage() {
        console.log("", this.context.line);

    }


}

module.exports = Parser;
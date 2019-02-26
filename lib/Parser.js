const Context = require('./Сontext');
const Patterns = require('./patterns');
const Tree = require('./Tree');

let patterns = new Patterns();

class Parser {
    constructor(text){
        this.tree = new Tree;
        this.currentNode = this.tree.getRoot();
        this.context = new Context(text);
    }

    parse() {

        let charPatterns = patterns.get(this.context);

        console.log(charPatterns);
        console.log(charPatterns.some(pattern => this.parsePattern(pattern)));


        /* while (context.atEnd()) {
             if (context.isSpace()) { // если текущий символ -- пробел
                 // считать, посчитать
                 // если не в начале строки сгенерировать узел пробела
             }
             let charPatterns = patterns.get(context); // доступные шаблоны, определяемые режимом и текущим символом

             if (charPatterns.some(pattern => {
                 return parsePattern(context, pattern.type);
                 // если успех, контекст изменяется соответствующим образом:
                 // сдвигается position
                 // наращивается дерево
                 // изменяется узел, если нужно и т.п.
                 // если не успех, контекст должен быть восстановлен до исходного состояния
             })) continue;
             createErrorNode(context);
         }*/
    }


    parsePattern(pattern) {
        console.log( pattern.reg.test(this.context.text), pattern.type);

        if(pattern.reg.test(this.context.text)) {
            if(pattern.type === "Header") {
                let new_node = this.parseHeader();
                this.tree.addNode(new_node);
               // context.moveTo(...); // переместить позицию контекста, пересчитать режимы
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


    parseHeader() {
        console.log("", this.context.line);
        let worlds = this.context.line.split(" ");
        console.log(worlds);
        let node = new Tree.Node("Header");
        node.addToken({level: worlds[0].length});

        for(let i=2; i< worlds.length ; i++ ) {
            let child = new Tree.Node("text", {world: worlds[i]});
            node.addChild(child);
        }

        return node;
    }

}

module.exports = Parser;
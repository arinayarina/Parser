const Tree = require("./Tree");


const modes = {
    0: "start line", //в начале строки
    1: "start context", // в начале документа
    2: "empty line before this", //до этого пустая строка
    3: "no whitespace from the beginning" // от начала строки не было не пробельных символов
};

class Context {

    constructor(text){
        this.text = text;
        this.iChar = 0;
        this.modes = modes[0];
        this.tree = new Tree();
        this.currentNode = this.tree.getRoot();
        this.char = "";
        this.depth = 0;

    }




    init(text) {
        this.text = text;
        this.char = text[0];
    }

    show() {
        return this;
    }

    atEnd() {
        return this.iChar === this.text.length;
    }

    printText() {
        for(let i=0; i< this.text.length ; i++ ){
            console.log(i, ": ",  this.text[i]);
        }
    }

    isSpace() {
        return this.char === " ";
    }

}

module.exports = Context;
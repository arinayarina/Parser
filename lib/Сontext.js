const Tree = require("./Tree");


//const modes = {
//    0: "start line", //в начале строки
//    1: "start text", // в начале документа
//    2: "empty line before this", //до этого пустая строка
//    3: "no whitespace from the beginning" // от начала строки не было не пробельных символов
//    4: Конец строки ??
//};


class Context {

    constructor(text){
        this.text = text;
        this.lines = this.text.split("\n");
        this.position = 0;
        this.modes = {
            isStartLine: true,
            isEmptyLineBefore: false,
            isWhiteSpace: true,  //были только пробельные символы или никаких символов не было с начала строки
            isEndLine: false,

            numEmptyLineBefore: 0,
            numWhiteSpaceBefore: 0,
        };
        //this.tree = Tree;
       // this.currentNode = null;
        this.char = text[0] || "";
        this.line = this.lines[0];
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
            console.log(i + 1, this.text[i]);
        }
    }

    printLines() {
        let lines = this.text.split("\n");
        for(let i=0; i< lines.length ; i++){
            console.log(i + 1, lines[i]);
        }
    }

    printContext() {
        console.log(this)
    }

    isSpace() {
        return this.char === " ";
    }

    isLineBreak() {
        return this.char === "\n";
    }

    //Перейти к следующему символу
    toNextChar() {
        this.iChar = ++this.iChar;
        this.char = this.text[this.iChar];

        this.newMode();
    }


    //Пересчет режимов
    newMode() {

        this.modes.isStartText = this.iChar === 0; //Начало документа
        this.modes.isStartLine = this.text[this.iChar - 1 ] === "\n"; //Начало строки

        //Предыдушая строка пустая
        if(this.modes.isEmptyLineBefore && this.char !== "\n") { /// что делать если доходим до конца строки
            this.modes.isEmptyLineBefore = true;
        } else {
            this.modes.isEmptyLineBefore = this.modes.isStartLine && this.text[this.iChar - 2 ] === "\n"
        }

        if(this.char === "\n") { //Переход на новую строку
            ++this.iChar;
            this.char = this.text[this.iChar];

            this.modes.isEmptyLineBefore = false;
        }

    }


}

module.exports = Context;
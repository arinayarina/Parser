const Tree = require("./Tree");


//Состояние в данной позиции документа
//const state = {
//    0: "start line", //в начале строки
//    1: "start text", // в начале документа
//    2: "empty line before this", //до этого пустая строка
//    3: "no whitespace from the beginning" // от начала строки не было не пробельных символов
//    4: Конец строки ??
//};


class Context {

    constructor(text) {
        this.text = text;
        this.position = 0;
        this.state = {

            isStartLine: true,
            isEmptyLineBefore: true,
            isWhiteSpace: true,  //были только пробельные символы или никаких символов не было с начала строки
            isEndLine: false,

            numEmptyLineBefore: 0,
            numWhiteSpaceBefore: 0,

            isEndText: false,
        };

        this.char = text[this.position] || "";
        this.depth = 0;
    }

    init() { //предобработка текста
        this.text = this.text[this.text.length - 1] === "\n" ? this.text : this.text.concat("\n");
    }

    show() {
        return this;
    }


    printText() {
        for (let i = 0; i < this.text.length; i++) {
            console.log(i, this.text[i]);
        }
    }




    toNextChar(n = 1) {

        this.position = this.position + n;
        this.char = this.text[this.position] || "";
        this.state = {
            ...this.state,
            isStartLine: false,
            isWhiteSpace: (this.state.isWhiteSpace && this.text[this.position -1 ] === " ") || this.isLineBreak() ,
        };
        this.state.numWhiteSpaceBefore =  this.state.isWhiteSpace ? !this.isLineBreak() ? this.state.numWhiteSpaceBefore + 1 : 0 : 0;
    }



    printContext() {
        console.log(this)
    }

    isSpace() {
        return this.char === " ";
    }

    isLineBreak() {
        return this.char === "\n" || this.char === "\r";
    }

    moveUp() {
        this.depth--;
        //console.log("depth:", this.depth);
    }


    modeDown(){
        this.depth++;
        //console.log("depth: ",this.depth);
    }


    isEndText() {
        return this.position >= this.text.length || this.text === "\n";
    }

    changeState() {
            this.state = {
            ...this.state,
            isStartLine: true,
            isEmptyLineBefore: this.state.numEmptyLineBefore > 0,
            numEmptyLineBefore: this.state.isStartLine &&  this.isLineBreak() ? this.state.numEmptyLineBefore + 1 : 0,
        };
        this.position = this.position + 1;
        this.char = this.text[this.position] || "";
    }

    getEndLine() {
        let line = this.text.slice(this.position);
        let index =  line.indexOf('\n')  || line.indexOf("\r") || line.indexOf("\r\n") ;
        if (index !== -1 ){
            return index + this.position;
        } else {
            return this.text.length - 1;
        }
    }


}

module.exports = Context;
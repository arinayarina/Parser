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
        this.lines = this.text.split("\n");
        this.position = 0;
        this.state = {

            isStartLine: true,
            isEmptyLineBefore: false,
            isWhiteSpace: true,  //были только пробельные символы или никаких символов не было с начала строки
            isEndLine: false,

            numEmptyLineBefore: 0,
            numWhiteSpaceBefore: 0,
            isEndText: false,
        };

        this.char = text[0] || "";

        this.numLine = 0;
        this.line = this.lines[this.numLine];

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
        for (let i = 0; i < this.text.length; i++) {
            console.log(i + 1, this.text[i]);
        }
    }

    printLines() {
        let lines = this.text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            console.log(i + 1, lines[i]);
        }
    }

    toNextLine() {
        if (this.numLine + 1 === this.lines.length) {
            this.numLine = this.numLine + 1;
        } else {
            this.numLine = this.numLine + 1;
            this.line = this.lines[this.numLine];
            this.char = this.line[0] || "";
            this.state = {

                isStartLine: true,
                isEmptyLineBefore: this.lines[this.numLine - 1] === "\n", //?
                isWhiteSpace: true,  //были только пробельные символы или никаких символов не было с начала строки

                numEmptyLineBefore: this.lines[this.numLine - 1] === "\n" ? this.state.numEmptyLineBefore + 1 : this.state.numEmptyLineBefore,
                numWhiteSpaceBefore: 0,
            };
        }
        //как считать this.position
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

    atEndLine() {
        console.log(this.numLine);
        console.log(this.lines.length);
        return this.numLine === this.lines.length;
    }


    //Пересчет режимов
    newMode() {

        this.state.isStartText = this.iChar === 0; //Начало документа
        this.state.isStartLine = this.text[this.iChar - 1] === "\n"; //Начало строки

        //Предыдушая строка пустая
        if (this.state.isEmptyLineBefore && this.char !== "\n") { /// что делать если доходим до конца строки
            this.state.isEmptyLineBefore = true;
        } else {
            this.state.isEmptyLineBefore = this.state.isStartLine && this.text[this.iChar - 2] === "\n"
        }

        if (this.char === "\n") { //Переход на новую строку
            ++this.iChar;
            this.char = this.text[this.iChar];

            this.state.isEmptyLineBefore = false;
        }

    }


}

module.exports = Context;
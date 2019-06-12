/**
 * @return {boolean}
 */

const PatternsReg = {
    IMG: {
        type: "Image",
        reg: new RegExp('^!\\[(.+)]\\((.+)\\)'),
    },
    IMG_Label: {
        type: "Image with label",
        reg: new RegExp('^!\\[(.+)]\\[(.*)]'),
    },
    Horizontal_Rules: {
        type: "Horizontal Rules",
        reg: new RegExp('^([ ]*[-][ ]*[-][ ]*[-][ ]?)[- ]*[\\n]|^([ ]*[*][ ]*[*][ ]*[*][ ]?)[* ]*[\\n]|^([ ]*[_][ ]*[_][ ]*[_][ ]?)[_ ]*[\\n]'),
    },
    Header: {
        type: "Header",
        reg: new RegExp(`^[#]{1,6}[\\s]`)
    },
    Header_Underline: {
        type: "Header_underline",
        reg: new RegExp('^[\\\\\\-!`[\\]$@#|/%^&*()=+_{}a-zA-Za-яА-я0-9ё ]+[\\n]+[ ]{0,3}([-]+|[=]+)[\\s]*[\\n]') //все символы и
        // reg: new RegExp(`^(.+)+[\\n]+[ ]{0,3}([-]+|[=]+)[\\s]*[\\n]`) //все символы и

    },
    BlockQuotes: {
        type: "BlockQuotes",
        reg: new RegExp('^[>]{1}[ ]{1}|^[>]{1}[\\n]{1}')
    },
    List: {
        type: "List",
        reg: new RegExp('^[*|+|-]{1}[ ]{1}|^[0-9]{1,9}.[ ]{1}')
    },
    numberList: {
        type: "List",
        reg: new RegExp(`^[0-9]{1,9}.[ ]`)
    },
    BlockCode: {
        type: "BlockCode",
        reg: new RegExp('^[ ]{4,}(.+)+[\\n]')
    },
    Code: {
        type: "Code",
        reg: new RegExp('^`((.)+[\\n]?(.)+)*`|^``((.)+[\\n]?(.)+)*``') //
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

    Link: {
        type: "Link",
        reg: new RegExp('^\\[(.+)\\]\\([ ]*(\\S)+[ ]*("(.*)")?[ ]*\\)|^<(.+)>')
    },
    ReferenceLable: {
        type: "ReferenceLable",
        reg: new RegExp(`^\\[.+][ ]*(\\[(.*)])`)
    },
    DefineLable: {
        type: "DefineLable",
        method: "0",
        reg: new RegExp(`^([ ]{0,3})\\[(.+)]:([\\s]*)([\\S]+)([\\s]*)[\\n]`),  // [id]: http://example.com/
    },
    DefineLableWithTitle_1: {
        type: "DefineLable",
        method: "1",
        reg: new RegExp(`^([ ]{0,3})\\[(.+)]:([\\s]*)([\\S]+)([\\s]*)"(.*)"[\\n]`),  // [id]: http://example.com/ "Optional title"
    },
    DefineLableWithTitle_2: {
        type: "DefineLable",
        method: "2",
        reg: new RegExp(`^([ ]{0,3})\\[(.+)]:([\\s]*)([\\S]+)([\\s]*)'(.*)'[\\n]`),  // [id]: http://example.com/ 'Optional title'
    },
    DefineLableWithTitle_3: {
        type: "DefineLable",
        method: "3",
        reg: new RegExp(`^([ ]{0,3})\\[(.+)]:([\\s]*)([\\S]+)([\\s]*)\\((.*)\\)[\\n]`),  // [id]: http://example.com/ (Optional title)
    },
    SpecialCharacter: {
        type: "SpecialCharacters",
        //reg: new RegExp(`^\\\\[!\`*_{}[1]: http://example.com[\\]()#+-.]`)
        reg: new RegExp(`^\\\\([!\`*_{}[\\]()#+-.]|[\\\\])`)
    },
    Text: {
        type: "Text",
        reg: new RegExp(`^[a-zA-Zа-яёА-Я0-9\\s]`)
    },
    ListParagraph: {
        type: " ListParagraph",
        reg: new RegExp(`^[\\n][ ]{4,7}(\\S)+`)
    },
    Styles: {
        type: "Styles",
        reg: new RegExp(`^([\s]*){(.*)}`)
    },
    Latex: {
        type: "Latex",
        reg: new RegExp(`^[\$]{2,}(.+?)[\$]{2,}`)
    },
    InlineLatex: {
        type: "InlineLatex",
        reg: new RegExp(`^[$](.+?)[$]`)
    },
};


this.state = {
    isStartLine: true,
    isEmptyLineBefore: false,
    isWhiteSpace: false,  //были только пробельные символы или никаких символов не было с начала строки
    isEndLine: false,

    numEmptyLineBefore: 0,
    numWhiteSpaceBefore: 0,
};


class Patterns {
    constructor() {
        this.patterns = PatternsReg;
    }

    getMarginPattern(context) {
        let patterns = []; ///добавить все стандартные паттерны

        if (context.state.isWhiteSpace) {
            if (context.depth === 0) {
                patterns.push(PatternsReg.BlockCode);
            }
        }

        return patterns;
    }


    getPatternChar(char) { //то что может быть вложенно в BlockQuotes
        let patterns = [];

        if (char === ">") {
            patterns.push(PatternsReg.BlockQuotes);
        }
        if (char === "#") {
            patterns.push(PatternsReg.Header);
        }
        if (char === "*" || char === "-") {
            patterns.push(PatternsReg.Horizontal_Rules); //доработать
        }
        if (char === "!") {
            patterns.push(PatternsReg.IMG, PatternsReg.IMG_Label);
        }
        if (char === "<") {
            patterns.push(PatternsReg.Link);
        }
        if (char === "+" || char === "-" || char === "*" || (new RegExp('^[0-9]')).test(char)) {
            patterns.push(PatternsReg.List);
        }
        if (char === " " || char === "{") {
            patterns.push(PatternsReg.Styles);
        }
        if (char === "$") {
            patterns.push(PatternsReg.Latex, PatternsReg.InlineLatex);
        }
        return [...patterns, PatternsReg.Header_Underline, PatternsReg.Styles];
    }


    get(context) {
        let patterns = [];

        if (context.state.isWhiteSpace) {
            patterns.push(PatternsReg.Header);
            if (context.depth === 0) {
                patterns.push(PatternsReg.Header_Underline);
                patterns.push(PatternsReg.Horizontal_Rules); //доработать
                patterns.push(PatternsReg.DefineLable);
                patterns.push(PatternsReg.DefineLableWithTitle_1, PatternsReg.DefineLableWithTitle_2, PatternsReg.DefineLableWithTitle_3);
            }

            if (context.char === ">") {
                patterns.push(PatternsReg.BlockQuotes);
            }
            if (context.char === "+" || context.char === "-" || context.char === "*" || (new RegExp('^[0-9]')).test(context.char)) {
                patterns.push(PatternsReg.List);
            }

        }
        if (context.char === " " || context.char === "{") {
            patterns.push(PatternsReg.Styles);
        }

        if (context.depth !== 0) {
            if (context.char === "!") {
                patterns.push(PatternsReg.IMG, PatternsReg.IMG_Label);
            }
            if (context.char === "*") {
                patterns.push(PatternsReg.Em, PatternsReg.Strong, PatternsReg.List);
            }
            if (context.char === "_") {
                patterns.push(PatternsReg.Em, PatternsReg.Strong);
            }
            if (context.char === "\\") {
                patterns.push(PatternsReg.SpecialCharacter);
            }
            if (context.char === "`") {
                patterns.push(PatternsReg.Code);
            }
            if (context.char === "<") {
                patterns.push(PatternsReg.Link);
            }
            if (context.char === "[") {
                patterns.push(PatternsReg.Link, PatternsReg.ReferenceLable);
            }
            if (context.char === "$") {
                patterns.push(PatternsReg.Latex, PatternsReg.InlineLatex);
            }
        }

        return [...patterns, PatternsReg.Text];
    }
}

module.exports = Patterns;


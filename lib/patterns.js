/**
 * @return {boolean}
 */

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


this.modes = {
    isStartLine: true,
    isEmptyLineBefore: false,
    isWhiteSpace: false,  //были только пробельные символы или никаких символов не было с начала строки
    isEndLine: false,

    numEmptyLineBefore: 0,
    numWhiteSpaceBefore: 0,
};


class Patterns {
    constructor() {

    }

    get(context) {
        let patterns = []; ///добавить все стандартные паттерны

        if(context.char === "!") {
            patterns.push(PatternsReg.IMG);
        }
        if(context.char === "*") {
            patterns.push(PatternsReg.Em, PatternsReg.Strong, PatternsReg.List);
        }
        if(context.char === "_") {
            patterns.push(PatternsReg.Em, PatternsReg.Strong);
        }
        if(context.char === "\\") {
            patterns.push(PatternsReg.Backslashe);
        }
        if(context.char === "`") {
            patterns.push(PatternsReg.Code);
        }
        if(context.char === "<") {
            patterns.push(PatternsReg.Link);
        }
        if(context.char === "[") {
            patterns.push(PatternsReg.Link, PatternsReg.LinkLable);
        }
        if(context.char === "+" || context.char === "-" ) {
            patterns.push(PatternsReg.List);
        }


        if (context.modes.isWhiteSpace) {
            if (context.modes.isEmptyLineBefore) {
                patterns.push(PatternsReg.Horizontal_Rules);
            } else {
                patterns.push(PatternsReg.Header_Underline)
            }
            patterns.push(PatternsReg.Header);
            patterns.push(PatternsReg.BlockQuotes);
            patterns.push(PatternsReg.BlockCode);
        }


        return patterns;
    }
}

module.exports = Patterns;
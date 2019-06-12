const Context = require('./Сontext');
const Patterns = require('./patterns');
const Tree = require('./Tree');
const Converter = require('./Converter');

const LatexSyntax = require("@texnous/latex-syntax"); // LaTeX syntax structures
const LatexParser =  require("@texnous/latex-parser"); // LaTeX parser class

let patterns = new Patterns();


let PatternsReg = patterns.patterns;


const specialSymbols = new RegExp(`^[-$@#\|/%^&*()=+_{}a-zA-Za-яА-я0-9ё\\s]`);
const nestCode = new RegExp('^``((.)+[\\n]?(.)+)*``');

const punctuationMarks = new RegExp('^[!?:;,.(){}[\\]\-]');


class MarkdownParser {
    constructor(text) {
        this.tree = new Tree;
        this.currentNode = this.tree.getRoot();
        this.context = new Context(text);

        this.references = {};
    }


    parse() {
        this.context.init();

        while (!this.context.isEndText()) {
            if (this.context.isLineBreak()) {
                this.currentNode.addChild(new Tree.EmptyLine("EmptyLine"));
                this.context.changeState();
                continue;
            }

            if (this.checkPattern(this.currentNode, this.context)) {
                if (this.context.isLineBreak()) {
                    this.context.changeState();
                    continue;
                }
            } else {
                console.log("Error");
            }
        }
    }


    parseContent(currentNode, content) {
        let new_context = new Context(content);
        new_context.init();

        while (!new_context.isEndText()) {
            if (new_context.isLineBreak()) {
                currentNode.addChild(new Tree.EmptyLine("EmptyLine"));
                new_context.changeState();
                continue;
            }

            if (this.checkPattern(currentNode, new_context)) {
                if (new_context.isLineBreak()) {
                    new_context.changeState();
                    continue;
                }
            } else {
                console.log("Error");
            }
        }


    }

    checkMarginPattern(currentNode, context) {
        let charPatterns = patterns.getMarginPattern(context);
        if (charPatterns.some(pattern => this.parsePattern(pattern, currentNode, context))) {
            context.moveUp();
            return true;
        }
        return false;
    }


    checkPattern(currentNode, context) {
        if (context.isSpace()) {
            if (this.checkMarginPattern(currentNode, context)) {
                if (context.isLineBreak()) {
                    context.changeState();
                    return true;
                }
            }
        }


        let charPatterns = patterns.get(context);

        if (charPatterns.some(pattern => this.parsePattern(pattern, currentNode, context))) {
            context.moveUp();
            return true;
        } else {
            if (currentNode.type === this.currentNode.type || currentNode.type === PatternsReg.BlockQuotes.type || currentNode.type === PatternsReg.List.type) {
                context.modeDown();
                let state = this.parseParagraph(currentNode, context);
                context.moveUp();
                return state;
            } else {

                if (punctuationMarks.test(context.char)) {
                    currentNode.addChild(new Tree.PunctuationMark("Punctuation", context.char));
                } else {
                    currentNode.addChild(new Tree.ErrorNode("Error", context.char));
                }
                context.toNextChar();
                return true;
            }
        }
    }

    checkNextLinePatternType(context, length) { //проверяем начинается ли заголовок, циатата или горизонтальная черта
        let new_position = context.position + length + 1;
        let char = context.text[new_position];
        let charPatterns = patterns.getPatternChar(char);
        let currentPosition = context.text.slice(new_position);

        if (PatternsReg.ListParagraph.reg.test(currentPosition)) {
            return false;
        } else return charPatterns.some(pattern => pattern.reg.test(currentPosition)) || currentPosition.indexOf("\n") === 0;
    }

    parsePattern(pattern, parent, context) {
        if (context.isLineBreak()) {
            context.changeState(); //пересчетать контекст , сказать что в начале строки
            return true;
        }
        let currentPosition = context.text.slice(context.position);

        if (pattern.reg.test(currentPosition)) {
            if (pattern.type === PatternsReg.Horizontal_Rules.type) {
                context.modeDown();
                let state = this.parseHorizontalLine(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Header.type) {
                context.modeDown();
                return this.parseHeader(parent, context);
                // переместить позицию контекста, пересчитать режимы
            }
            if (pattern.type === PatternsReg.Strong.type) {
                context.modeDown();
                let state = this.parseStrong(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Em.type) {
                context.modeDown();
                let state = this.parseCoursive(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.IMG.type) {
                context.modeDown();
                let state = this.parseImage(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.IMG_Label.type) {
                context.modeDown();
                let state = this.parseLabelImage(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Styles.type) {
                context.modeDown();
                let state = this.parseStyles(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.SpecialCharacter.type) {
                context.modeDown();
                let state = this.parseSpecialCharacter(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Text.type) {
                context.modeDown();
                let state = this.parseParagraph(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Code.type) {
                context.modeDown();
                let state = this.parseCode(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Header_Underline.type) {
                context.modeDown();
                let state = this.parseUnderlineHeader(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.BlockCode.type) {
                context.modeDown();
                return this.parseBlockCode(parent, context);
            }
            if (pattern.type === PatternsReg.Link.type) {
                context.modeDown();
                return this.parseLink(parent, context);
            }
            if (pattern.type === PatternsReg.ReferenceLable.type) {
                context.modeDown();
                return this.parseReferenceLable(parent, context);
            }
            if (pattern.type === PatternsReg.BlockQuotes.type) {
                context.modeDown();
                return this.parseBlockQuotes(parent, context);
            }
            if (pattern.type === PatternsReg.List.type) {
                context.modeDown();
                return this.parseList(parent, context);
            }
            if (pattern.type === PatternsReg.DefineLable.type) {
                context.modeDown();
                return this.parseDefineLable(context, pattern.method);
            }
            if (pattern.type === PatternsReg.Latex.type) {
                context.modeDown();
                return this.parseLatex(parent, context);
            }
            if (pattern.type === PatternsReg.InlineLatex.type) {
                context.modeDown();
                return this.parseInlineLatex(parent, context);
            }

            return false;
        } else {
            return false
        }
    }


    parseText(parent = {}, context) {
        let text = "";
        while (PatternsReg.Text.reg.test(context.char) && !context.isLineBreak()) {
            text = text.concat(context.char);
            context.toNextChar();
        }
        if (text !== "") {
            parent.addChild(new Tree.TextNode("text", text));
            return true;
        } else {
            return false;
        }

    }


    parseLine(parent = {}, line, context) {
        let start = context.position;
        while (context.position < start + line.length) {
            if (this.parseText(parent, context)) {
                continue;
            } else {
                if (!context.isLineBreak()) {
                    if (this.checkPattern(parent, context)) {
                        continue;
                    }
                }
            }
        }
        return true;
    }


    parseParagraph(parent = {}, context) {
        let new_node = new Tree.ParagraphNode("Paragraph");

        while (!context.isLineBreak() && !context.isEndText()) {

            if (context.isSpace()) {
                new_node.addChild(new Tree.SpaceNode("SpaceNode"));
                context.toNextChar();
                continue;
            }


            if (this.parseText(new_node, context)) {
                continue;
            } else {
                if (this.checkPattern(new_node, context)) {
                    continue;
                }
            }
        }
        if (parent.children[parent.children.length - 1] && parent.children[parent.children.length - 1].type === "Paragraph") {
            parent.children[parent.children.length - 1].children =
                [...parent.children[parent.children.length - 1].children, new Tree.lineBreakNode("LineBreak"), ...new_node.children];
        } else {
            parent.addChild(new_node);
        }
        return new_node;
    }


    parseStrong(parent, context) {

        let new_node = new Tree.EmphasizeNode("strong");
        let start = context.position;

        let length = context.text.slice(context.position + 2).indexOf(context.text[start].concat(context.text[start])); //Длина выделяемой части
        if (length !== -1) {
            context.toNextChar();
            context.toNextChar();
            this.parseLine(new_node, context.text.slice(start + 2, start + 2 + length), context);
            parent.addChild(new_node);
            context.toNextChar();
            context.toNextChar();
            return true;
        } else {
            return false
        }

    }

    parseCoursive(parent, context) {

        if (context.char === context.text[context.position + 1] && this.parseStrong(parent, context)) { //так как могут быть пересечение
            return true
        } else {
            let new_node = new Tree.EmphasizeNode("cursive");
            let start = context.position;
            let length = context.text.slice(context.position + 1).indexOf(context.text[start]); //Длина выделяемой части
            context.toNextChar();
            this.parseLine(new_node, context.text.slice(start + 1, start + 1 + length), context);
            parent.addChild(new_node);
            context.toNextChar();
            return true;
        }
    }


    parseHeader(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let level = line.split(" ")[0].length;

        let new_node = new Tree.HeaderNode("Header", level);
        context.toNextChar(level);
        context.toNextChar();
        this.parseLine(new_node, line.slice(level + 1,), context);
        parent.addChild(new_node);
        return true;
    }

    parseUnderlineHeader(parent, context) {

        // "===" - level 1
        // "---" - level 2
        let line = context.text.slice(context.position, context.getEndLine());
        let new_node = new Tree.HeaderNode("Header Underline");

        this.parseLine(new_node, line, context);
        parent.addChild(new_node);
        context.toNextChar(); // переходим на новую строку ---- или ===
        let underline = context.text.slice(context.position, context.getEndLine());
        new_node.level = underline.indexOf("=") !== -1 ? 1 : 2;
        context.toNextChar(underline.length); // пропускаем символы подчеркивания
        return true;
    }


    parseImage(parent, context) {

        let line = context.text.slice(context.position, context.getEndLine());
        let alt = line.slice(line.indexOf('[') + 1, line.indexOf(']'));
        let link = line.slice(line.indexOf('(') + 1, line.indexOf(')'));

        let title = "";
        if (link.indexOf('"') !== -1) {
            let left = link.indexOf('"');
            let right = link.slice(left + 1).indexOf('"');
            title = link.slice(left + 1, right + left + 1).toString();
            link = link.slice(0, left);
        }

        let new_node = new Tree.ImageNode("Image", alt, link, title);
        parent.addChild(new_node);
        context.toNextChar(line.indexOf(')') + 1);
        return true;
    }


    parseLabelImage(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());

        let alt = line.slice(2, line.indexOf("]"));
        line = line.slice(alt.length + 3);
        let lable = line.slice(line.indexOf("[") + 1, line.indexOf("]")).toString();


        let new_node = new Tree.ImageLableNode("Image Lable", alt, lable.length === 0 ? alt : lable);
        parent.addChild(new_node);
        context.toNextChar(alt.length + lable.length + 5 + 1);

        return true;

    }

    parseSpecialCharacter(parent, context) {
        context.toNextChar(); // переходим к символу
        let new_node = new Tree.CharacterNode("Symbol", context.char);
        context.toNextChar(); //следующий символ
        parent.addChild(new_node);

        return true;
    }

    parseCode(parent, context) {
        let line = context.text.slice(context.position);
        let isNest = nestCode.test(line); //проверяем вложенный код или нет
        let new_node = new Tree.CodeNode("Code");
        if (isNest) {
            let left = line.indexOf("``");
            let right = line.slice(2).indexOf("``");
            let code = line.slice(left + 2, right + 2);
            new_node.code = code;
            context.toNextChar(code.length + 4); //следующий символ
        } else {
            let left = line.indexOf("`");
            let right = line.slice(1).indexOf("`");
            let code = line.slice(left + 1, right + 1);
            new_node.code = code;
            context.toNextChar(code.length + 2); //следующий символ
        }

        parent.addChild(new_node);
        return true;
    }

    parseHorizontalLine(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let new_node = new Tree.HorizontalLine("Horizontal Line", line);
        context.toNextChar(line.length);
        parent.addChild(new_node);
        return false;
    }

    parseBlockCode(parent, context) {
        let new_node = new Tree.BlockCode("BlockCode");
        while (PatternsReg.BlockCode.reg.test(context.text.slice(context.position))) {
            let line_code = context.text.slice(context.position + 4, context.getEndLine());
            new_node.addLine(line_code);
            context.toNextChar(line_code.length + 5);
        }
        context.toNextChar(-1);

        parent.addChild(new_node);
        return true;
    }

    parseLink(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let alt = "";
        let link = "";
        let title = "";
        if (line[0] === "[") {
            alt = line.slice(line.indexOf('[') + 1, line.indexOf(']')).toString();
            link = line.slice(line.indexOf('(') + 1, line.indexOf(')')).toString();

            if (link.indexOf('"') !== -1) {
                let left = link.indexOf('"');
                let right = link.slice(left + 1).indexOf('"');
                title = link.slice(left + 1, right + left + 1).toString();
                link = link.slice(0, left);
            }
            context.toNextChar(line.indexOf(')') + 1);
        } else {
            link = line.slice(line.indexOf("<") + 1, line.indexOf(">")).toString();
            alt = link;
            context.toNextChar(line.indexOf('>') + 1);
        }
        link = link.replace(/\s/g, ''); //убираем пробелы;
        let new_node = new Tree.Link("Link", alt, link, title);
        parent.addChild(new_node);
        return true;
    }

    parseReferenceLable(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let link = "";
        let title = "";

        let alt = line.slice(1, line.indexOf("]"));
        line = line.slice(alt.length + 2);
        let lable = line.slice(line.indexOf("[") + 1, line.indexOf("]")).toString();

        if (lable.length === 0) {
            lable = alt;
        }
        let new_node = new Tree.ReferenceLable("Reference Lable", alt, lable, link, title);
        parent.addChild(new_node);
        context.toNextChar(alt.length + 2 + line.indexOf("]") + 1);
        return true;
    }

    parseBlockQuotes(parent, context) {
        let new_node = new Tree.BlockCode("BlockQuotes");

        let content = "";
        while (PatternsReg.BlockQuotes.reg.test(context.text.slice(context.position)) || PatternsReg.Text.reg.test(context.char)) {
            if (PatternsReg.Text.reg.test(context.char)) {
                let line = context.text.slice(context.position, context.getEndLine());
                context.toNextChar(line.length + 1);
                if (PatternsReg.Text.reg.test(context.char)) {
                    content = content.concat(line, " ");
                } else {
                    content = content.concat(line, "\n");
                }
                continue;
            }
            if (context.text[context.position + 1] === '\n') {
                content = content.concat("\n");
                context.toNextChar(2);
            } else {
                let line = context.text.slice(context.position + 2, context.getEndLine());
                context.toNextChar(line.length + 3);
                if (PatternsReg.Text.reg.test(context.char)) {
                    content = content.concat(line, " ");
                } else {
                    content = content.concat(line, "\n");
                }
            }
        }
        context.toNextChar(-1);

        this.parseContent(new_node, content);

        parent.addChild(new_node);

        return true;
    }


    getEndLine(line) {
        let index = line.indexOf('\n');
        if (index !== -1) {
            return index;
        } else {
            return -1;
        }
    }


    parseList(parent, context) {
        let new_node = new Tree.List("List");

        let type = context.char;
        new_node.setTypeList((new RegExp('^[0-9]').test(type)) ? "number" : type);

        while (PatternsReg.List.reg.test(context.text.slice(context.position)) && (type === context.char || ((new RegExp('^[0-9]').test(type)) && (new RegExp('^[0-9]').test(context.char))))) {
            let line = context.text.slice(context.position, context.getEndLine());
            let content = line; //контент для парсинга


            while (!this.checkNextLinePatternType(context, line.length)) {
                let new_line = context.text.slice(context.position + line.length + 1);

                let endLine = this.getEndLine(new_line);

                if (endLine === 0) {
                    endLine = this.getEndLine(new_line.slice(1)) + 1;
                    content = content.concat("\n");
                }
                new_line = new_line.slice(0, endLine);

                if (new_line.length === 0) {
                    break
                }
                line = line.concat("\n", new_line);
                content = content.concat("\n", new_line.replace(/^\s+/g, "")); //удаляем пробелы в начале строки
            }


            if (context.char === "*" || context.char === "_" || context.char === "+") {
                if (content.slice(2).length > 0) {
                    let li = new Tree.ParagraphNode("Li");
                    this.parseContent(li, content.slice(2));
                    new_node.addChild(li);
                } else {
                    new_node.addChild(new Tree.EmptyNode("EmptyNode"));
                }
            } else {
                let index_dot = content.indexOf(".");
                if (content.slice(index_dot + 2).length > 0) {
                    let li = new Tree.ParagraphNode("Li");
                    this.parseContent(li, content.slice(index_dot + 2));
                    new_node.addChild(li);
                } else {
                    new_node.addChild(new Tree.EmptyNode("EmptyNode"));
                }
            }

            context.toNextChar(line.length + 1);

        }
        context.toNextChar(-1);
        parent.addChild(new_node);
        return true;
    }


    parseDefineLable(context, method) {
        let line = context.text.slice(context.position, context.getEndLine());
        let lable = "";
        let link = "";
        let title = "";

        switch (method) {
            case "0":
                lable = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
                link = line.slice(line.indexOf(":") + 1).replace(/\s+/g, '');
                break;
            case "1":
                lable = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
                link = line.slice(line.indexOf(":") + 1, line.indexOf("\"")).replace(/\s+/g, '');
                title = line.slice(line.indexOf("\"") + 1, line.lastIndexOf("\""));
                break;
            case "2":
                lable = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
                link = line.slice(line.indexOf(":") + 1, line.indexOf("\'")).replace(/\s+/g, '');
                title = line.slice(line.indexOf("\'") + 1, line.lastIndexOf("\'"));
                break;
            case "3":
                lable = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
                link = line.slice(line.indexOf(":") + 1, line.indexOf("(")).replace(/\s+/g, '');
                title = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")"));
                break;
            default:
                return false;

        }

        if (this.references.hasOwnProperty(lable)) {
            console.log("Error: Reference key: ", lable, " already exist");
        } else {
            this.references[lable] = {
                link: link,
                title: title,
            };
        }


        context.toNextChar(line.length);

        return true;
    }

    parseStyles(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());

        let style = {
            classes: [],
            id: "",
        };

        let styles = line.slice(line.indexOf("{") + 1, line.indexOf("}")).replace(/\s+/g, ' ').trim();

        let i = 0;
        let end = styles.length;

        while (i < end) {

            let char = styles[i];

            if ((char === "." || char === "#") && styles[i + 1] !== " ") {
                let str = styles.slice(i + 1);
                let index_end = str.indexOf(" ");

                let content = "";

                if (index_end === -1) {
                    content = str;
                    if(content === "") {
                        break;
                    }
                } else {
                    content = str.slice(0, index_end);
                }

                if(char === "#") {
                    if(style.id.length === 0) {
                        style = {
                            ...style,
                            id: content,
                        };
                    } else  {
                        console.log("Warning: Item can have only one index.")
                    }
                } else {
                    style = {
                        ...style,
                        classes: [...style.classes, content],
                    };
                }


                if(index_end === -1 ) {
                    break;
                } else {
                    i = i + index_end + 1;
                }
                continue;
            }


            if (char === "." && styles[i + 1] === " ") {
                console.log("Error syntax in style block {}:", styles[i]);
                i = i + 1;
            }


            i = i + 1;
        }


        this.addStyleToNode(style, parent);
        context.toNextChar(line.indexOf("}") + 1);
        return true;
    }


    parseLatex(parent, context) {
        let start = context.position;

        let length = context.text.slice(context.position + 2).indexOf(context.text[start].concat(context.text[start])); //Длина выделяемой части
        if (length !== -1) {
            context.toNextChar();
            context.toNextChar();
            //this.parseLine(new_node, context.text.slice(start + 2, start + 2 + length), context);

            let latexStyle = new LatexSyntax();
            let latexParser = new LatexParser(latexStyle);

            let source = context.text.slice(start + 2, start + 2 + length);
            let latex_root = latexParser.parse(source);
            //tokenParserCallback
            console.log(latex_root);
            let new_node = new Tree.LatexNode("Latex", latex_root);
            parent.addChild(new_node);
            context.toNextChar();
            context.toNextChar();
            return true;
        } else {
            let new_node = new Tree.ErrorNode("Error", length);
            parent.addChild(new_node);
            return false
        }
    }

    parseInlineLatex(parent, context) {
        let start = context.position;

        let length = context.text.slice(context.position + 2).indexOf(context.text[start].concat(context.text[start])); //Длина выделяемой части
        if (length !== -1) {
            context.toNextChar();
            context.toNextChar();
            //this.parseLine(new_node, context.text.slice(start + 2, start + 2 + length), context);

            let latexStyle = new LatexSyntax();
            let latexParser = new LatexParser(latexStyle);

            let source = context.text.slice(start + 2, start + 2 + length);
            let latex_root = latexParser.parse(source);
            //tokenParserCallback
            console.log(latex_root);
            let new_node = new Tree.LatexNode("Latex", latex_root);
            parent.addChild(new_node);
            context.toNextChar();
            context.toNextChar();
            return true;
        } else {
            let new_node = new Tree.ErrorNode("Error", length);
            parent.addChild(new_node);
            return false
        }
    }
    addStyleToNode(style, parent) {


        function condition(child) {
            if(child.type === "text") {
                if(child.text.replace(/\s/g, '') !== ""){
                    return  true
                } else
                {
                    return false;
                }
            } else {
                return child.type !== "SpaceNode"
            }
        }

        let last_children = [...parent.children.filter(child => condition(child))][parent.children.filter(child => condition(child)).length - 1];

        if(last_children) {
            if(["strong", "cursive", "Image", "Header", "Image Lable", "Link", "Reference Lable"].includes(last_children.type)) {
                last_children.style = style;
            }
        }

    }

    printTree() {
        console.log(this.tree.root);
    }


    show() {
        return this.context.printText();
    }

    printContext() {
        this.context.printContext();
    }

    printReferences() {
        console.log("References:", this.references);
    }

    toHTML() {
        let converter = new Converter(this.tree.root, this.references);
        return converter.treeToHTML();
    }


}

module.exports = MarkdownParser;
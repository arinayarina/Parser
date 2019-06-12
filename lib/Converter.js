class Converter {
    constructor(tree, references) {
        this.html = "<!DOCTYPE html>\n<html>\n<head><meta charset=\"utf-8\">\n<title>Markdown parser</title>\n<link href=\"index.css\" rel=\"stylesheet\"></head>";
        this.tree = tree;
        this.references = references;

    }


    treeToHTML() {
        this.html = this.html.concat("<body>\n");

        this.convertChildren(this.tree.children);

        this.html = this.html.concat("</body>\n</html>");
        return this.html;
    }

    convertChildren(children) {
        for (let i = 0; i < children.length; i++) {
            this.convertChild(children[i]);
        }
    }


    convertChild(tag) {
        switch (tag.type) {
            case "Paragraph":
                this.convertParagraph(tag);
                break;
            case "Header Underline":
            case "Header":
                this.convertHeader(tag);
                break;
            case "Link":
                this.convertLink(tag);
                break;
            case "BlockCode":
                this.convertBlockCode(tag);
                break;
            case "BlockQuotes":
                this.convertBlockQuotes(tag);
                break;
            case "EmptyLine":
                this.html = this.html.concat("<br/>\n");
                break;
            case "LineBreak":
                this.html = this.html.concat("<br>\n");
                break;
            case "Horizontal Line":
                this.html = this.html.concat("<hr/>\n");
                break;
            case "Code":
                this.convertCode(tag);
                break;
            case "Image":
                this.convertImage(tag);
                break;
            case "Image Lable":
                this.covertImageLable(tag);
                break;
            case "List":
                this.convertList(tag);
                break;
            case "Li":
                this.convertLi(tag);
                break;
            case "text":
                this.convertText(tag.text);
                break;
            case "strong":
                this.convertStrong(tag);
                break;
            case "cursive":
                this.convertCursive(tag);
                break;
            case "Symbol":
            case "Punctuation":
                this.html = this.html.concat(tag.symbol);
                break;
            case "Reference Lable":
                this.convertReferenceLable(tag);
                break;
            case "SpaceNode":
                this.html = this.html.concat(tag.text);
                break;
            default:
                this.html = this.html.concat(tag.type);
                break
        }
    }


    getStyleString(style) {
        let str = "";

        if (style.classes && style.classes.length > 0) {
            let classes_join = style.classes.join(" ");
            str = str.concat(" class='", classes_join, "'");
        }
        if (style.id && style.id.length > 0) {
            str = str.concat(" id='", style.id, "'");
        }

        return str;

    };

    convertText(text) {
        this.html = this.html.concat(text);
    }

    convertStrong(text) {
        let styles = this.getStyleString(text.style);
        this.html = this.html.concat("<strong" + styles + ">");
        this.convertChildren(text.children);
        this.html = this.html.concat("</strong>");
    }

    convertCursive(text) {
        let styles = this.getStyleString(text.style);
        this.html = this.html.concat("<em" + styles + ">");
        this.convertChildren(text.children);
        this.html = this.html.concat("</em>");
    }

    convertCode(code) {
        this.html = this.html.concat("<code>", code.code, "</code>");
    }

    convertBlockQuotes(text) {
        this.html = this.html.concat("<blockquote>");
        this.convertChildren(text.children);
        this.html = this.html.concat("</blockquote>");
        this.html = this.html.concat('\n');
    }

    convertReferenceLable(tag) {

        let styles = this.getStyleString(tag.style);

        let alt = tag.alt;
        let link = "";
        let title = "";
        if (this.references.hasOwnProperty(tag.lable)) {
            link = this.references[tag.lable].link;
            title = this.references[tag.lable].title
        }

        if (title.length > 0) {
            this.html = this.html.concat("<a", styles, " href='" + link + "' title='" + title + "'>");
        } else {
            this.html = this.html.concat("<a", styles, " href='" + link + "'>");
        }

        this.html = this.html.concat(alt);
        this.html = this.html.concat("</a>");

    };

    convertImage(image) {
        let styles = this.getStyleString(image.style);
        if (image.title.length > 0) {
            this.html = this.html.concat("<img", styles, " src='", image.link, "' alt='", image.alt, "' title='", image.title, "'/>");
        } else {
            this.html = this.html.concat("<img", styles, " src='", image.link, "' alt='", image.alt, "'/>");
        }
    }

    covertImageLable(image) {
        let alt = image.alt;
        let link = "";

        let styles = this.getStyleString(image.style);


        if (this.references.hasOwnProperty(image.lable)) {
            link = this.references[image.lable].link;
        }

        this.html = this.html.concat("<img", styles, " src='", link, "' alt='", alt, "'/>");

    }

    convertParagraph(paragraph) {
        this.html = this.html.concat("<p>");
        this.convertChildren(paragraph.children);
        this.html = this.html.concat("</p>");

    }

    convertBlockCode(code) {
        this.html = this.html.concat("<pre>\n<code>\n");
        this.html = this.html.concat(code.lines.join('\n'));
        this.html = this.html.concat("\n</code>\n</pre>\n");
    }

    convertList(list) {
        if (list.typeList === "number") {
            this.html = this.html.concat("<ol>\n");
            this.convertChildren(list.children);
            this.html = this.html.concat("</ol>\n");
        } else {
            this.html = this.html.concat("<ul>\n");
            this.convertChildren(list.children);
            this.html = this.html.concat("</ul>\n");
        }
    }

    convertLi(li) {
        this.html = this.html.concat("<li>");
        this.convertChildren(li.children);
        this.html = this.html.concat("</li>\n");
    }

    convertLink(link) {
        let styles = this.getStyleString(link.style);

        if (link.title.length > 0) {
            this.html = this.html.concat("<a", styles, " href='" + link.link + "' title='" + link.title + "'>");
        } else {
            this.html = this.html.concat("<a", styles, " href='" + link.link + "'>");
        }
        this.html = this.html.concat(link.alt);
        this.html = this.html.concat("</a>");
    }

    convertHeader(header) {
        let style = this.getStyleString(header.style);
        switch (header.level) {
            case 1:
                this.html = this.html.concat("<h1", style, ">");
                break;
            case 2:
                this.html = this.html.concat("<h2", style, ">");
                break;
            case 3:
                this.html = this.html.concat("<h3", style, ">");
                break;
            case 4:
                this.html = this.html.concat("<h4", style, ">");
                break;
            case 5:
                this.html = this.html.concat("<h5", style, ">");
                break;
            case 6:
                this.html = this.html.concat("<h6", style, ">");
                break;
            default:
                this.html = this.html.concat("<p>");
                break
        }
        this.convertChildren(header.children);
        switch (header.level) {
            case 1:
                this.html = this.html.concat("</h1>");
                break;
            case 2:
                this.html = this.html.concat("</h2>");
                break;
            case 3:
                this.html = this.html.concat("</h3>");
                break;
            case 4:
                this.html = this.html.concat("</h4>");
                break;
            case 5:
                this.html = this.html.concat("</h5>");
                break;
            case 6:
                this.html = this.html.concat("</h6>");
                break;
            default:
                this.html = this.html.concat("</p>");
                break
        }
        this.html = this.html.concat('\n');

    }


}


module.exports = Converter;
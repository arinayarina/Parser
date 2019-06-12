'use strict';

class Tree {
    constructor() {
        this.nodes = [];
        this.root = new Tree.Node("root");
        this.nodes = [this.root]
    }


    getRoot() {
        return this.root;
    }

}


Tree.Node = class {
    constructor(type) {
        this.type = type;
        this.children = [];
    }

    addChild(child) {
        this.children = [...this.children, child];
    }
};

Tree.TextNode = class extends Tree.Node {
    constructor(type, text) {
        super(type);
        this.text = text;
    }
};

Tree.SpaceNode = class extends Tree.Node {
    constructor(type) {
        super(type);
        this.text = " ";
    }
};

Tree.lineBreakNode = class extends Tree.Node {
    constructor(type) {
        super(type);
    }
};

Tree.EmptyNode = class extends Tree.Node {
    constructor(type) {
        super(type);
        this.text = " ";
    }
};


Tree.ParagraphNode = class extends Tree.Node {
    constructor(type) {
        super(type);
    }
};

Tree.HeaderNode = class extends Tree.Node {
    constructor(type, level) {
        super(type);
        this.level = level;
        this.style = {};
    }
};

Tree.ImageNode = class extends Tree.Node {
    constructor(type, alt, link, title) {
        super(type);
        this.title = title || "";
        this.alt = alt;
        this.link = link;
        this.style = {};
    }
};


Tree.ImageLableNode = class extends Tree.Node {
    constructor(type, alt, lable) {
        super(type);
        this.alt = alt;
        this.lable = lable;
        this.style = {};
    }
};

Tree.CodeNode = class extends Tree.Node {
    constructor(type, code) {
        super(type);
        this.code = code;
    }
};

Tree.CharacterNode = class extends Tree.Node {
    constructor(type, symbol) {
        super(type);
        this.symbol = symbol;
    }
};
Tree.EmptyLine = class extends Tree.Node {
    constructor(type) {
        super(type);
    }
};

Tree.HorizontalLine = class extends Tree.Node {
    constructor(type, line) {
        super(type);
        this.line = line;
    }
};

Tree.BlockCode = class extends Tree.Node {
    constructor(type, lines = []) {
        super(type);
        this.lines = lines;
    }

    addLine(line) {
        this.lines = [...this.lines, line]
    }
};

Tree.BlockQuotes = class extends Tree.Node {
    constructor(type, lines = []) {
        super(type);
    }
};


Tree.PunctuationMark = class extends Tree.Node {
    constructor(type, symbol) {
        super(type);
        this.symbol = symbol;
    }
};

Tree.ErrorNode = class extends Tree.Node {
    constructor(type, symbol) {
        super(type);
        this.symbol = symbol;
    }
};

Tree.EmphasizeNode = class extends Tree.Node {
    constructor(type) {
        super(type);
        this.style = {};
    }
};


Tree.Link = class extends Tree.Node {
    constructor(type, alt, link, title) {
        super(type);
        this.link = link;
        this.alt = alt;
        this.title = title;
        this.style = {};
    }
};

Tree.ReferenceLable = class extends Tree.Node {
    constructor(type, alt, lable, link, title) {
        super(type);
        this.link = link;
        this.alt = alt;
        this.lable = lable;
        this.title = title;
        this.style = {};
    }
};

Tree.List = class extends Tree.Node {
    constructor(type, lines = []) {
        super(type);
        this.typeList = "";
        this.lines = lines;
    }




    setTypeList(typeList) {
        this.typeList = typeList;
    }

    addLine(line) {
        this.lines = [...this.lines, line]
    }
};

Tree.LatexNode = class extends Tree.Node {
    constructor(type, latex_root) {
        super(type);
        this.latex_root = latex_root;
    }
};

Tree.InlineLatexNode = class extends Tree.Node {
    constructor(type, latex_root) {
        super(type);
        this.latex_root = latex_root;
    }
};


module.exports = Tree;



'use strict';

class Tree {
    constructor() {
        this.nodes = [];
        this.root = new Tree.Node("root");
        this.nodes = [this.root]
    }

    addNode(node, parent = this.root) {
        this.nodes.push(node);
        parent.children.push(node);

        return node;
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

    addToken(token = {}) {
        this.token = token;
    }

    addChild(child) {
        this.children.push(child)
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
    }
};

Tree.ImageNode = class extends Tree.Node {
    constructor(type, level, alt, link) {
        super(type);
        this.level = level;
        this.alt = alt;
        this.link = link;
    }
};

module.exports = Tree;


//Type Node:
/*
0:  type: word - слово или пробельный символ - листья главной вершины - не имеют детей
    token: {word: word}

1:  type : Header
    token: {
    level : [1..6]  - количество решёток
    symbol: "#" - нужно ли?
    }
    children = [tree.node, ...] - содержание заголовка

2:  type: Image
    token: {
    alt: "", - str
    link: "", - str
    }



 */
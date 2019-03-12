'use strict';

class Tree {
    constructor() {
        this.root = new Tree.Node("root");
    }

    addNode(node, parent = this.root) {
        parent.children.push(node);
    }

    getRoot() {
        return this.root;
    }
}

Tree.Node = class {
    constructor(type, token = {}) {
        this.type = type;
        this.token = token;
        this.children = [];
    }

    addToken(token = {}){
        this.token = token;
    }

    addChild(child) {
        this.children.push(child)
    }
};

module.exports = Tree;


//Type Node:
/*
0:  type: world - слово или пробельный символ - листья главной вершыны  - не имеют детей
    token: {world: world}

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
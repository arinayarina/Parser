'use strict';

class Tree {
    constructor() {
        this.nodes = [];
        this.root = new Tree.Node("root");
        this.nodes = [this.root]
    }

    addNode(token, parent = this.root) {
        let node = new Tree.Node(token);
        this.nodes.push(node);
        parent.children.push(node);

        return node;
    }

    getRoot() {
        return this.root;
    }
}

Tree.Node = class {
    constructor(token) {
        this.token = token;
        this.children = [];
    }
};

module.exports = Tree;
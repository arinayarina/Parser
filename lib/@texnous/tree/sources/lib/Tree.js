/**
 * @fileoverview Tree structure elements.
 * This file is a part of TeXnous project.
 *
 * @copyright TeXnous project team (http://texnous.org) 2016-2017
 * @license LGPL-3.0
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the
 * GNU Lesser General Public License as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this library;
 * if not, write to the Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA
 * 02111-1307, USA.
 */

"use strict";


/**
 * @classdesc Tree structure
 * @class Tree
 * @property {!Tree.Node} rootNode - The root node
 * @property {number} size - The number of nodes in the tree
 * @property {!Function} _rootNodeClass - The suitable class for the root node
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
class Tree {
	/**
	 * Constructor
	 * @param {!Tree.Node} rootNode the root node (must have no parent and no tree)
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor(rootNode) {
		if (rootNode instanceof this._rootNodeClass) { // type test
			if (rootNode.parentNode) throw new TypeError("\"rootNode\" has a parent node");
			if (rootNode.tree) throw new TypeError("\"rootNode\" is a tree root");
			if (this instanceof rootNode._treeClass) { // type test
				Object.defineProperty(this, "rootNode", { value: rootNode, enumerable: true }); // store the root node
				Object.defineProperty(rootNode, "tree", { value: this, enumerable: true }); // update the root node tree
			} else {
				throw new TypeError(`"this" isn't a ${ rootNode._treeClass.constructor.name } instance`);
			}
		} else {
			throw new TypeError(`"rootNode" isn't a ${ this._rootNodeClass.prototype.constructor.name } instance`);
		}
	}


	/**
	 * Get the size.
	 * @return {number} the number of nodes in the tree
	 */
	get size() { return this.rootNode.subtreeSize; }


	/**
	 * Parameters of tree nodes enumeration.
	 * @typedef {Object} Tree.EnumerateNodesParameters
	 * @property {boolean|undefined} nodes - true to collect list of the nodes
	 * @property {boolean|undefined} nodeIndices - true to store the index for each node
	 * @property {boolean|undefined} keyRoots - true to collect the key roots
	 * @property {boolean|undefined} keyRootIndices - true to collect the key root indices
	 * @property {boolean|undefined} mostLeftChildNodes - true to collect the most left child nodes
	 * @property {boolean|undefined} mostLeftChildNodeIndices - true to collect the most left child node indices
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */


	/**
	 * Result of tree nodes enumeration.
	 * @typedef {Object} Tree.EnumerateNodesResult
	 * @property {!Array.<Node>|undefined} nodes - The list of the nodes, 0 is always null
	 * @property {!Map.<Node, number>|undefined} nodeIndices - The map of the nodes to the indices
	 * @property {!Array.<!Node>|undefined} keyRoots - The list of the key roots
	 * @property {!Array.<number>|undefined} keyRootIndices - The list of the key root indices
	 * @property {!Map.<Node, Node>|undefined} mostLeftChildNodes - The most left child node for each node
	 * @property {!Array.<number>|undefined} mostLeftChildNodeIndices - The indices of the most left child nodes
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */


	/**
	 * Collect nodes by numbers, node numbers and others.
	 * @param {!Tree.EnumerateNodesParameters} parameters what to collect
	 * @return {!Tree.EnumerateNodesResult} result of the tree enumeration
	 * @methodOf Tree
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	enumerateNodes(parameters) {
		if (!(parameters instanceof Object))
			throw new TypeError("initialProperties isn't an Object instance");
		let nodes = parameters.nodes ? new Array(this.size + 1) : undefined; // list of the nodes
		if (nodes) nodes[0] = null; // the empty node will be in the list
		let nodeIndices = parameters.nodeIndices ? (new Map()).set(null, 0) : undefined; // indices of the nodes
		let keyRoots = parameters.keyRoots ? [] : undefined; // list of the key roots
		let keyRootIndices = parameters.keyRootIndices ? [] : undefined; // list of the key root indices
		// the most left child node for each node
		let mostLeftChildNodes = parameters.mostLeftChildNodes ? (new Map()).set(null, null) : undefined;
		// the most left child node index for each node
		let mostLeftChildNodeIndices = parameters.mostLeftChildNodeIndices ? new Array(this.size + 1) : undefined;
		if (mostLeftChildNodeIndices) mostLeftChildNodeIndices[0] = 0; // the empty node has the empty most left child
		let iNode = 0; // the current node index
		(function enumerateSubtree(node) { // enumerate a node
			if (node.subtreeSize > 1) {
				node._childNodes.forEach(enumerateSubtree); // enumerate all the subtrees
				++iNode;
				if (mostLeftChildNodes) { // if the most left child nodes are stored
					// store the most left child of the first child
					mostLeftChildNodes.set(node, mostLeftChildNodes.get(node._childNodes[0]));
				}
				if (mostLeftChildNodeIndices) { // if the most left child node indices are stored
					mostLeftChildNodeIndices[iNode] =
						mostLeftChildNodeIndices[iNode - node.subtreeSize + node._childNodes[0].subtreeSize];
				}
			} else {
				++iNode;
				if (mostLeftChildNodes) mostLeftChildNodes.set(node, node); // the node is the most left for itself
				if (mostLeftChildNodeIndices) mostLeftChildNodeIndices[iNode] = iNode; // the node is the most left for itself
			}
			if (nodes) nodes[iNode] = node; // store the node
			if (nodeIndices) nodeIndices.set(node, iNode); // store the node index
			if (node.isKeyRoot) { // if the node is the key root
				if (keyRoots) keyRoots.push(node); // store the node
				if (keyRootIndices) keyRootIndices.push(iNode); // store the node index
			}
		})(this.rootNode);
		return {
			nodes,
			nodeIndices,
			keyRoots,
			keyRootIndices,
			mostLeftChildNodes,
			mostLeftChildNodeIndices
		};
	}


	/**
	 * Get the suitable class for the root node
	 * @return {!Function} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _rootNodeClass() { return Tree.Node; }
}
Object.defineProperties(Tree.prototype, { // make getters and setters enumerable
	size: { enumerable: true }
});



/**
 * Tree node properties
 * @typedef {Object} Tree.NodeProperties
 * @property {(?Tree.Node|undefined)} parentNode - The parent node or null if there is no parent
 * @property {(!Array.<Tree.Node>|undefined)} childNodes - The list of the child nodes
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */



/**
 * @classdesc Tree node structure
 * @class Tree.Node
 * @property {?Tree} tree - The tree or null if this node isn't in any tree
 * @property {?Tree.Node} parentNode - The parent node or null if there is no parent
 * @property {!Array.<Tree.Node>} childNodes - The child node list
 * @property {number} subtreeSize - The size of the subtree formed by this node
 * @property {boolean} isKeyRoot - true if the node is the key root, false otherwise
 * @property {!Function} _treeClass - The suitable class for the tree
 * @property {!Function} _parentNodeClass - The suitable class for the parent node
 * @property {!Function} _childNodeClass - The suitable class for the child nodes
 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
 */
Tree.Node = class {
	/**
	 * Constructor
	 * @param {!Tree.NodeProperties=} initialProperties the initial property values
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	constructor(initialProperties) {
		if (initialProperties !== undefined) { // if the initial properties are defined
			if (!(initialProperties instanceof Object))
				throw new TypeError("initialProperties isn't an Object instance");
			if (initialProperties.childNodes !== undefined) { // if the child node list is set
				if (!(initialProperties.childNodes instanceof Array))
					throw new TypeError("initialProperties.childNodes isn't an Array instance");
				initialProperties.childNodes.forEach(this.insertChildSubtree, this);
			}
			if (initialProperties.parentNode !== undefined) { // if the parent node is set
				if (initialProperties.parentNode instanceof Tree.Node) {
					initialProperties.parentNode.insertChildSubtree(this);
				} else {
					throw new TypeError("initialProperties.parentNode isn't a Tree.Node instance");
				}
			}
		}
	}


	/**
	 * Get the tree that contains this node
	 * @return {!Array.<Node>} the tree or null if this node isn't in any tree
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get tree() { return this.parentNode ? this.parentNode.tree : null; }


	/**
	 * Get the child nodes
	 * @return {!Array.<Node>} the child node list
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get childNodes() { return this._childNodes.slice(); }


	/**
	 * Get the child node
	 * @param {(!Tree.Node|number)} node the child node or its child index
	 * @return {?Tree.Node} the child node or null of there is no such a child node
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	childNode(node) {
		if (typeof node === "number") // if the node child index is given
			return this._childNodes[node] || null;
		if (node instanceof Node) // if the child node is given
			return node.parentNode === this ? node : null;
		throw new TypeError("\"node\" is neither a number nor a Tree.Node instance");
	}


	/**
	 * Get the child node index
	 * @param {(!Tree.Node|number)} node the child node or its child index
	 * @return {(number|null)} the child node or null of there is no such a child node
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	childIndex(node) {
		if (typeof node === "number") // if the node child index is given
			return this._childNodes[node] ? node : null;
		if (node instanceof Tree.Node) // if the child node is given
			return node.parentNode === this ? this._childNodes.indexOf(node) : null;
		throw new TypeError("\"node\" is neither a number nor a Tree.Node instance");
	}


	/**
	 * Insert a node to this child node list
	 * @param {!Tree.Node} node the node to insert (must have no parent and no child nodes)
	 * @param {number=undefined} childIndex
	 *        the position of the node for this child node list, the last by default
	 * @param {number=0} childNodesToCover
	 *        the number of this child nodes to become the child nodes of the new node
	 * @return {!Tree.Node} this node
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	insertChildNode(node, childIndex, childNodesToCover) {
		if (node instanceof this._childNodeClass) { // type test
			if (node.parentNode) throw new TypeError("\"node\" has a parent");
			if (node.tree) throw new TypeError("\"node\" is a tree root");
			if (!(this instanceof node._parentNodeClass))
				throw new TypeError("\"this\" isn't a suitable class instance");
			if (node._childNodes.length) throw new TypeError("\"node\" has child nodes");
			if (!this.hasOwnProperty("_childNodes")) // if there was no child nodes
				Object.defineProperty(this, "_childNodes", { value: [], configurable: true }); // init the property
			// use the last position by default
			if (childIndex === undefined) childIndex = this._childNodes.length;
			// do not cover any child nodes by default
			if (childNodesToCover === undefined) childNodesToCover = 0;
			// replace the child nodes by the new node
			let nodeChildNodes = this._childNodes.splice(childIndex, childNodesToCover, node);
			// update the size of the subtree formed by this node
			Object.defineProperty(this, "subtreeSize", {
				value: this.subtreeSize + 1,
				enumerable: true,
				configurable: true
			});
			// for all the parent nodes
			for (let parentNode = this.parentNode; parentNode; parentNode = parentNode.parentNode) {
				// update the size of the subtree formed by the parent node
				Object.defineProperty(parentNode, "subtreeSize", { value: parentNode.subtreeSize + 1 });
			}
			// update the parent node of the new node
			Object.defineProperty(node, "parentNode", {
				value: this,
				enumerable: true,
				configurable: true
			});
			if (nodeChildNodes.length) { // if there are child nodes for the new node
				// store the child nodes
				Object.defineProperty(node, "_childNodes", { value: nodeChildNodes, configurable: true });
				let subtreeSize = 1; // initiate the size of the subtree formed by the new node
				// for all the child nodes of the new node
				nodeChildNodes.forEach(nodeChildNode => {
					Object.defineProperty(nodeChildNode, "parentNode", {
						value: node,
						enumerable: true,
						configurable: true
					});
					subtreeSize += nodeChildNode.subtreeSize;
				});
				// store the subtree size
				Object.defineProperty(node, "subtreeSize", {
					value: subtreeSize,
					enumerable: true,
					configurable: true
				});
			}
			return this;
		} else {
			throw new TypeError(`"node" isn't a ${ this._childNodeClass.constructor.name } instance`);
		}
	}


	/**
	 * Insert a subtree to this child node list.
	 * @param {!Tree.Node} node the subtree to insert root node (must have no parent)
	 * @param {number=} childIndex
	 *        the position of the subtree root for this child node list, the last by default
	 * @return {!Tree.Node} this node
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	insertChildSubtree(node, childIndex) {
		if (node instanceof this._childNodeClass) { // type test
			if (node.parentNode) throw new TypeError("\"node\" has a parent");
			if (node.tree) throw new TypeError("\"node\" is a tree root");
			if (!(this instanceof node._parentNodeClass))
				throw new TypeError("\"this\" isn't a suitable class instance");
			// init child nodes property if not exists
			if (!this.hasOwnProperty("_childNodes")) // if there was no child nodes
				Object.defineProperty(this, "_childNodes", { value: [], configurable: true }); // init the property
			// use the last position by default
			if (childIndex === undefined) childIndex = this._childNodes.length;
			this._childNodes.splice(childIndex, 0, node); // insert the new node to the child list
			let nodeSubtreeSize = node.subtreeSize; // the size of the subtree formed by the node
			// update the size of the subtree formed by this node
			Object.defineProperty(this, "subtreeSize", {
				value: this.subtreeSize + nodeSubtreeSize, enumerable: true, configurable: true
			});
			// for all the parent nodes
			for (let parentNode = this.parentNode; parentNode; parentNode = parentNode.parentNode) {
				// update the size of the subtree formed by the parent node
				Object.defineProperty(parentNode, "subtreeSize", {
					value: parentNode.subtreeSize + nodeSubtreeSize
				});
			}
			// update the parent node of the new node
			Object.defineProperty(node, "parentNode", {
				value: this,
				enumerable: true,
				configurable: true
			});
			return this;
		} else {
			throw new TypeError(`"node" isn't a ${ this._childNodeClass.constructor.name } instance`);
		}
	}

	
	/**
	 * Remove a child node of this node. All its child nodes become the child nodes of this node
	 * @param {(!Tree.Node|number)} node the subtree root or its child index
	 * @return {?Tree.Node} the removed node or null of there is no such a child node
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	removeChildNode(node) {
		let nodeChildIndex = this.childIndex(node); // the child index of the node
		if (nodeChildIndex === null) return null; // return if there is no such a child
		node = this._childNodes[nodeChildIndex]; // the child node to remove
		// replace the node with its child nodes at this child node list
		Array.prototype.splice.apply(this._childNodes, [nodeChildIndex, 1].concat(node._childNodes));
		node._childNodes.forEach(nodeChildNode => {
			Object.defineProperty(nodeChildNode, "parentNode", {
				value: this,
				enumerable: true,
				configurable: true
			});
		}, this);
		if (this._childNodes.length) { // if there are child nodes
      // update this node subtree size
			Object.defineProperty(this, "subtreeSize", { value: this.subtreeSize - 1 });
		} else { // if there are no child nodes
			delete this._childNodes; // this node has no child nodes anymore
			delete this.subtreeSize; // this node has node subtree anymore
		}
		// for all the parent nodes
		for (let parentNode = this.parentNode; parentNode; parentNode = parentNode.parentNode) {
			// update the size of the subtree formed by the parent node
			Object.defineProperty(parentNode, "subtreeSize", { value: parentNode.subtreeSize - 1 });
		}
		delete node.parentNode; // the node has no parent node anymore
		delete node._childNodes; // the node has no child nodes anymore
		delete node.subtreeSize; // the node has no subtree anymore
		return node;
	}


	/**
	 * Remove a subtree formed by a child node of this node
	 * @param {(!Tree.Node|number)} node the subtree root or its child index
	 * @return {?Tree.Node} the removed subtree root node or null of there is no such a child node
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	removeChildSubtree(node) {
		let nodeChildIndex = this.childIndex(node); // the child index of the node
		if (nodeChildIndex === null) return null; // return if there is no such a child
		node = this._childNodes.splice(nodeChildIndex, 1)[0]; // remove the node from the child list
		let nodeSubtreeSize = node.subtreeSize; // the size of the subtree formed by the node
		if (this._childNodes.length) { // if there are child nodes
			// update this node subtree size
			Object.defineProperty(this, "subtreeSize", { value: this.subtreeSize - nodeSubtreeSize });
		} else { // if there are no child nodes
			delete this._childNodes; // this node has no child nodes anymore
			delete this.subtreeSize; // this node has no subtree anymore
		}
		// for all the parent nodes
		for (let parentNode = this.parentNode; parentNode; parentNode = parentNode.parentNode) {
			// update the size of the subtree formed by the parent node
			Object.defineProperty(parentNode, "subtreeSize", {
				value: parentNode.subtreeSize - nodeSubtreeSize
			});
		}
		delete node.parentNode; // the node has no parent node anymore
		return node;
	}


	/**
	 * Test the node to be a key root.
	 * @return {boolean} true if the node is a key root, false otherwise
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get isKeyRoot() { return (this.parentNode === null) || (this !== this.parentNode._childNodes[0]); }


	/**
	 * Get the string representation of this node
	 * @param {(undefined|boolean|string)} formatting
	 *        undefined to print a single line with all the node types
	 *        true to print a single line with the root node type
	 *        false to print a single line without node types
	 *        string to print an intended structure, formatting means one indent
	 * @param {number=0} maxDepth maximum depth of nested nodes to render, 0 to render all the subtree
	 * @return {string} the string representation
	 * @override
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	toString(formatting, maxDepth) {
		if (maxDepth === undefined) {
			maxDepth = 0;
		} else if (maxDepth !== parseInt(maxDepth, 10) || maxDepth < 0) {
			throw new TypeError("\"maxDepth\" is not a non-negative integer");
		}
		return this._toString(formatting, maxDepth, 0);
	}


	/**
	 * Get the string representation of this node
	 * @param {(undefined|boolean|string)} formatting
	 *        undefined to print a single line with all the node types
	 *        true to print a single line with the root node type
	 *        false to print a single line without node types
	 *        string to print an intended structure, formatting means one indent
	 * @param {number} maxDepth maximum depth of nested nodes to render, 0 to render all the subtree
	 * @param {number} depth amount of indents
	 * @return {string} the string representation
	 * @protected
	 * @methodOf Tree.Node
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	_toString(formatting, maxDepth, depth) {
		switch (formatting) {
		case undefined:
			return this.constructor.name + (this._childNodes.length
					? (maxDepth === depth + 1
							? " [ ... ]"
							: ` [ ${ this._childNodes.map(childNode =>
								childNode._toString(undefined, maxDepth, depth + 1)).join(", ") } ]`
					)
					: " []");
		case true:
			return this.constructor.name + (this._childNodes.length
					? (maxDepth === depth + 1
							? " { ... }"
							: ` { ${ this._toString(false, maxDepth, depth) } }`
					)
					: " {}");
		case false:
			return this._childNodes.map(childNode => childNode._toString(false, maxDepth, depth + 1)).join("");
		default:
			if (typeof formatting === "string") { // type test
				let prefix = new Array(1 + depth).join(formatting); // the indent prefix
				return prefix + this.constructor.name + (this._childNodes.length
							? (maxDepth === depth + 1
									? " [ ... ]"
									: ` [\n${	this._childNodes.map(childNode =>
										childNode._toString(formatting, maxDepth, depth + 1)).join(",\n") }\n${ prefix }]`
							)
							: " []"
					);
			} else {
				throw new TypeError("\"formatting\" is unknown");
			}
		}
	}


	/**
	 * Get the suitable class for the tree
	 * @return {!Function} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _treeClass() { return Tree; }


	/**
	 * Get the suitable class for the parent node
	 * @return {!Function} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _parentNodeClass() { return Tree.Node; }


	/**
	 * Get the suitable class for the child nodes
	 * @return {!Function} the class
	 * @protected
	 * @author Kirill Chuvilin <k.chuvilin@texnous.org>
	 */
	get _childNodeClass() { return Tree.Node; }
};
Object.defineProperties(Tree.Node.prototype.constructor, { // define the class name
	name: { value: "Tree.Node", enumerable: true }
});
Object.defineProperties(Tree.Node.prototype, { // make getters and setters enumerable
	childNodes: { enumerable: true },
	isKeyRoot: { enumerable: true }
});
Object.defineProperties(Tree.Node.prototype, { // default property values
	parentNode: { value: null, enumerable: true }, // no parent node
	subtreeSize: { value: 1, enumerable: true }, // only one node in the subtree
	_childNodes: { value: [], enumerable: false } // no child nodes
});



module.exports = Tree;

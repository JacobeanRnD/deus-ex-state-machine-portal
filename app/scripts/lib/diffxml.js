!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diffxml=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function() {
  
  global.xpath = require('xpath');

  global.Node = {
    ELEMENT_NODE : 1,
    ATTRIBUTE_NODE : 2,
    TEXT_NODE : 3,
    CDATA_SECTION_NODE : 4,
    ENTITY_REFERENCE_NODE : 5,
    ENTITY_NODE : 6,
    PROCESSING_INSTRUCTION_NODE : 7,
    COMMENT_NODE : 8,
    DOCUMENT_NODE : 9,
    DOCUMENT_TYPE_NODE : 10,
    DOCUMENT_FRAGMENT_NODE : 11,
    NOTATION_NODE : 12
  };
  
  global.XPathResult = {
    ANY_TYPE: 0,
    NUMBER_TYPE: 1,
    STRING_TYPE: 2,
    BOOLEAN_TYPE: 3,
    UNORDERED_NODE_ITERATOR_TYPE: 4,
    ORDERED_NODE_ITERATOR_TYPE: 5,
    UNORDERED_NODE_SNAPSHOT_TYPE: 6,
    ORDERED_NODE_SNAPSHOT_TYPE: 7,
    ANY_UNORDERED_NODE_TYPE: 8,
    FIRST_ORDERED_NODE_TYPE: 9     
  };
    
  require('./lib/diffxmlutils.js');
  require('./lib/delta.js');
  require('./lib/internaldelta.js');
  require('./lib/internalpatch.js');
  require('./lib/editscript.js');
  require('./lib/findposition.js');
  require('./lib/fmes.js');
  require('./lib/nodefifo.js');
  require('./lib/nodeops.js');
  require('./lib/nodepairs.js');
  require('./lib/nodedepth.js');
  require('./lib/match.js');
  require('./lib/nodesequence.js');
  require('./lib/childnumber.js');
  require('./lib/dulconstants.js');
  require('./lib/dulparser.js');

  module.exports = {
    DULParser: DULParser,
    InternalPatch: InternalPatch,
    Match: Match,
    EditScript: EditScript,
    NodeDepth: NodeDepth,
    NodeFifo: NodeFifo,
    NodeOps: NodeOps,
    NodePairs: NodePairs,
    NodeSequence: NodeSequence,
    Fmes: Fmes
  };
  
}).call();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/childnumber.js":2,"./lib/delta.js":3,"./lib/diffxmlutils.js":4,"./lib/dulconstants.js":5,"./lib/dulparser.js":6,"./lib/editscript.js":7,"./lib/findposition.js":8,"./lib/fmes.js":9,"./lib/internaldelta.js":10,"./lib/internalpatch.js":11,"./lib/match.js":12,"./lib/nodedepth.js":13,"./lib/nodefifo.js":14,"./lib/nodeops.js":15,"./lib/nodepairs.js":16,"./lib/nodesequence.js":17,"xpath":18}],2:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Class to hold and calculate DOM and XPath child numbers of node.
 */
ChildNumber = DiffXmlUtils.createClass(null, {  
  /**
   * Default constructor.
   * 
   * @constructs
   * @param node Node to find the child numbers of
   */
  init: function (node) {
    if (node == null) {
      throw new Error("Node cannot be null");
    }
    
    if (node.parentNode == null) {
      throw new Error("Node must have parent");
    }
    
    // DOM child number.
    this._domChildNo = -1;

    // XPath child number.
    this._xPathChildNo = -1;

    // XPath char position.
    this._xPathCharPos = -1;

    // In-order DOM child number.
    this._inOrderDOMChildNo = -1;

    // In-order XPath child number.
    this._inOrderXPathChildNo = -1;
    
    // In-order XPath text position.
    this._inOrderXPathCharPos = -1;
    
    // The node we are doing the calcs on.
    this._node = node;
    
    // The siblings of the node and the node itself. 
    this._siblings = this._node.parentNode.childNodes;
  },
  proto : /** @lends ChildNumber.prototype */ {
    /**
     * Get the DOM child number.
     * 
     * @return DOM child number of associated node.
     */
    getDOM: function () {
      if (this._domChildNo == -1) {
        this._calculateDOMChildNumber();
      }
      
      return this._domChildNo;
    },

    /**
     * Get the XPath child number.
     * 
     * @return XPath child number of associated node.
     */
    getXPathCharPos: function() {
      if (this._xPathCharPos == -1) {
        this._calculateXPathChildNumberAndPosition();
      }
      
      return this._xPathCharPos;
    },

    /**
     * Get the XPath child number.
     * 
     * @return XPath child number of associated node.
     */
    getInOrderXPathCharPos: function () {
      if (this._inOrderXPathCharPos == -1) {
        this._calculateInOrderXPathChildNumberAndPosition();
      }
      
      return this._inOrderXPathCharPos;
    },

    /**
     * Get the XPath child number.
     * 
     * @return XPath child number of associated node.
     */
    getXPath: function() {
      if (this._xPathChildNo == -1) {
        this._calculateXPathChildNumberAndPosition();
      }
      
      return this._xPathChildNo;
    },

    /**
     * Get the in-order XPath child number.
     * 
     * Only counts nodes marked in-order.
     * 
     * @return In-order XPath child number of associated node.
     */
    getInOrderXPath: function() {
      if (this._inOrderXPathChildNo == -1) {
        this._calculateInOrderXPathChildNumberAndPosition();
      }
      
      return this._inOrderXPathChildNo;
    },

    /**
     * Get the in-order DOM child number.
     * 
     * Only counts nodes marked in-order.
     * 
     * @return In-order DOM child number of associated node.
     */
    getInOrderDOM: function () {
      if (this._inOrderXPathChildNo == -1) {
        this._calculateInOrderDOMChildNumber();
      }
      
      return this._inOrderDOMChildNo;
    },
    
    /**
     * Determines whether XPath index should be incremented.
     * 
     * Handles differences between DOM index and XPath index
     * 
     * @param i The current position in siblings
     * @return true If index should be incremented
     */
    _incIndex: function (i) {
      var inc = true;
      var curr = this._siblings.item(i);
      // Handle non-coalescing of text nodes
      if ((i > 0 && this._nodesAreTextNodes([curr, this._siblings.item(i - 1)])) || NodeOps.nodeIsEmptyText(curr)) {
        inc = false;
      }

      return inc;
    },
    
    /**
     * Determines whether the given Nodes are all text nodes or not.
     * 
     * @param nodes The Nodes to checks.
     * @return true if all the given Nodes are text nodes
     */
    _nodesAreTextNodes: function(nodes) {
      var areText = true;
      for (var i = 0, l = nodes.length; i < l; i++) {
        var n = nodes[i];
        if ((n == null) || (n.nodeType != Node.TEXT_NODE)) {
          areText = false;
          break;
        }
      }
        
      return areText;
    },

    /**
     * Calculates the DOM index of the node.
     */
    _calculateDOMChildNumber: function () {
      var cn;

      for (cn = 0; cn < this._siblings.length; cn++) {
        if (NodeOps.checkIfSameNode(this._siblings.item(cn), this._node)) {
          break;
        }
      }
        
      this._domChildNo = cn;
    },

    /**
     * Calculates the "in order" DOM child number of the node.
     */
    _calculateInOrderDOMChildNumber: function () {
      this._inOrderDOMChildNo = 0;
      for (var i = 0; i < this._siblings.length; i++) {
        if (NodeOps.checkIfSameNode(this._siblings.item(i), this._node)) {
          break;
        }
        
        if (NodeOps.isInOrder(this._siblings.item(i))) {
          this._inOrderDOMChildNo++;
        }
      }
    },

    /**
     * Sets the XPath child number and text position.
     */
    _calculateXPathChildNumberAndPosition: function () {
      var domIndex = this._calculateXPathChildNumber();
      this._calculateXPathTextPosition(domIndex);   
    },

    /**
     * Sets the XPath child number and text position.
     */
    _calculateInOrderXPathChildNumberAndPosition: function () {
      var domIndex = this._calculateInOrderXPathChildNumber();
      this._calculateInOrderXPathTextPosition(domIndex);   
    },
    
    /**
     * Calculate the character position of the node.
     * 
     * @param domIndex The DOM index of the node in its siblings.
     */
    _calculateXPathTextPosition: function(domIndex) {
      this._xPathCharPos = 1;
      for (var i = (domIndex - 1); i >= 0; i--) {
        if (this._siblings.item(i).nodeType == Node.TEXT_NODE) {
          this._xPathCharPos = this._xPathCharPos + this._siblings.item(i).length;
        } else {
          break;
        }
      }
    },

    /**
     * Set the XPath child number of the node.
     * 
     * @return The DOM index of the node in its siblings
     */
    _calculateXPathChildNumber: function () {
      var childNo = 1;
      var domIndex;
      for (domIndex = 0; domIndex < this._siblings.length; domIndex++) {
        if (NodeOps.checkIfSameNode(this._siblings.item(domIndex), this._node)) {
          if (!this._incIndex(domIndex)) {
            childNo--;
          }
          break;
        }
        if (this._incIndex(domIndex)) {
          childNo++;
        }
      }
      
      this._xPathChildNo = childNo;
        
      return domIndex;
    },

    /**
     * Set the in-order XPath child number of the node.
     * 
     * @return The DOM index of the node in its siblings
     */
    _calculateInOrderXPathChildNumber: function () {

      var childNo = 0;
      var domIndex;
      var lastInOrderNode = null;
      var currNode = null;
      
      for (domIndex = 0; domIndex < this._siblings.length; domIndex++) {
        currNode = this._siblings.item(domIndex);
        if (NodeOps.isInOrder(currNode) && !(this._nodesAreTextNodes([currNode, lastInOrderNode]) || NodeOps.nodeIsEmptyText(currNode))) {
          childNo++;
        } 
        
        if (NodeOps.checkIfSameNode(currNode, this._node)) {
          break;
        }
        
        if (NodeOps.isInOrder(currNode)) {
          lastInOrderNode = currNode;
        }
      }
 
      //Add 1 if the given node wasn't in order
      if (currNode != null && !NodeOps.isInOrder(currNode)) {
        childNo++;
      }
 
      this._inOrderXPathChildNo = childNo;
      return domIndex;
    },

    /**
     * Calculate the character position of the node.
     * 
     * @param domIndex The DOM index of the node in its siblings.
     */
    _calculateInOrderXPathTextPosition: function (domIndex) {
      this._inOrderXPathCharPos = 1;
      
      for (var i = (domIndex - 1); i >= 0; i--) {
        if (this._siblings.item(i).nodeType == Node.TEXT_NODE) {
          if (NodeOps.isInOrder(this._siblings.item(i))) { 
            this._inOrderXPathCharPos = this._inOrderXPathCharPos + this._siblings.item(i).length;
          }
        } else if (NodeOps.isInOrder(this._siblings.item(i))) {
          break;
        }
      }
    }
  }  
});
},{}],3:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Interface for Delta formats.
 */
Delta = DiffXmlUtils.createClass(null, {
  /**
   * Constructor
   * @constructs
   */
  init: function () {
  },
  proto : /** @lends Delta.prototype */ {
    /**
     * Appends an insert operation to the delta.
     * 
     * Set charpos to 1 if not needed.
     * 
     * @param n The node to insert
     * @param parent The path to the node to be parent of n
     * @param childno The child number of the parent node that n will become
     * @param charpos The character position to insert at
     */
    insert: function (n, parent, childno, charpos) {},
    
    /**
     * Adds a delete operation to the delta for the given Node.
     * 
     * @param node The Node that is to be deleted
     */
    deleteNode: function(node) {},

    /**
     * Adds a Move operation to the delta. 
     * 
     * @param node The node being moved
     * @param parent XPath to the new parent Node
     * @param childno Child number of the parent n will become
     * @param ncharpos The new character position for the Node
     */
    move: function (node, parent, childno, ncharpos) {},

    /**
     * Adds an update operation to the delta.
     * 
     * @param w The node to update
     * @param x The node to update it to
     */
    update: function (w, x) {}
  }
});
},{}],4:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Utility class for DiffXmlJs
 */
DiffXmlUtils = /** @lends DiffXmlUtils */ {
  /**
   * Creates new class
   * 
   * @param superClass super class
   * @param definition class definition. Constructor is defined in "init" members in "proto". 
   * @returns class
   */
  createClass: function (superClass, definition) {
    if ((typeof definition.init) != 'function') {
      throw new Error("Class missing constructor");
    }

    if ((typeof definition.proto) != 'object') {
      throw new Error("Class missing proto");  
    }
    
    var properties = {};
    
    properties.constructor = {
      value: definition.init,
      enumerable: false
    };
    
    for (var funcName in definition.proto) {
      properties[funcName] = {
        value: definition.proto[funcName]
      };
    }
    
    var result = definition.init;
    result.prototype = Object.create(superClass, properties);
    
    return result;
  },
  
  /**
   * Parses a XML document from String
   * 
   * @param xml xml data
   * @returns xml document
   */
  parseXmlDocument: function (xml) {
    if (window.DOMParser) {
      var parser = new DOMParser();
      return parser.parseFromString(xml,"text/xml");
    } else {
      var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(xml);
      return xmlDoc;
    } 
  },
  
  /**
   * Serializes XML document into a string
   * 
   * @param document document
   * @returns serialized string
   */
  serializeXmlDocument: function (document) {
    var serializer = new XMLSerializer();
    return serializer.serializeToString(document);
  }
};
},{}],5:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class
 * Constants used in DUL Deltas.
 */
DULConstants = /** @lends DULConstants */ {

    /** If the delta was created as a "reverse patch". **/
  REVERSE_PATCH: "reverse_patch",
  
  /** The amount of parent sibling context. **/
  PARENT_SIBLING_CONTEXT: "par_sib_context",
  
  /** The amount of parent context. **/
  PARENT_CONTEXT: "par_context",
  
  /** The amount of sibling context. **/
  SIBLING_CONTEXT: "sib_context",
  
  /** Document element of a DUL EditScript. **/
  DELTA: "delta",
  
  /** Character position of the "new" node. **/
  NEW_CHARPOS: "new_charpos",
  
  /** Character position of the "old" node. **/
  OLD_CHARPOS: "old_charpos",
  
  /** Move operation element. **/
  MOVE: "move",
  
  /** Number of characters to extract from a text node. **/
  LENGTH: "length",
  
  /** The node for the operation. **/
  NODE: "node",
  
  /** Delete operation element. **/
  DELETE: "delete",
  
  /** Character position in text of the node. **/
  CHARPOS: "charpos",
  
  /** Name of the node. **/
  NAME: "name",
  
  /** Child number of parent node. **/
  CHILDNO: "childno",
  
  /** DOM type of the node. **/
  NODETYPE: "nodetype",
  
  /** Parent of the node. **/
  PARENT: "parent",
  
  /** Insert operation element. **/ 
  INSERT: "insert",
  
  /** Update operation element. **/ 
  UPDATE: "update",
  
  /** If entities were resolved when creating the delta. **/
  RESOLVE_ENTITIES: "resolve_entities",
  
  /** False constant. **/
  FALSE: "false",
  
  /** True constant. **/
  TRUE: "true"

};
},{}],6:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class
 * Parser for DUL Patch format
 */
DULParser = /** @lends DULParser */ {
  
  /**
   * Parses DUL format patch and converts it into internal format
   * 
   * @param dulPatch DUL patch
   * @returns InternalDelta
   */
  parseDULPatch: function (dulPatch) {
    var deltaElement = dulPatch.documentElement;
    if (deltaElement.nodeName != DULConstants.DELTA) {
      throw new Error("All deltas must begin with a " + DULConstants.DELTA + " element.");
    }

    var processed = new Array();
    
    // TODO: 
    // var siblingContext = deltaElement.attributes[DULConstants.SIBLING_CONTEXT];
    // var parentContext = deltaElement.attributes[DULConstants.PARENT_CONTEXT];
    // var parentSiblingContext = deltaElement.attributes[DULConstants.PARENT_SIBLING_CONTEXT];
    // var parentSiblingContext = deltaElement.attributes[DULConstants.REVERSE_PATCH];
    // var resolveEntities = deltaElement.attributes[DULConstants.RESOLVE_ENTITIES];
    
    for (var i = 0, l = deltaElement.childNodes.length; i < l; i++) {
      var operationNode = deltaElement.childNodes[i];
      switch (operationNode.nodeName) {
        case DULConstants.INSERT:
          processed.push(this._parseInsert(operationNode));
        break;
        case DULConstants.DELETE:
          processed.push(this._parseDelete(operationNode));
        break;
        case DULConstants.MOVE:
          processed.push(this._parseMove(operationNode));
        break;
        case DULConstants.UPDATE:
          processed.push(this._parseUpdate(operationNode));
        break;
      }
    }
    
    var delta = new InternalDelta(processed);
    return delta;
  },
  
  _parseInsert: function (operation) {
    var parent = operation.getAttribute(DULConstants.PARENT);
    var nodeType = parseInt(operation.getAttribute(DULConstants.NODETYPE));

    var internalOperation = {
      type: 'insert',
      parent: parent,
      nodeType: nodeType
    };
    
    if (nodeType != Node.ATTRIBUTE_NODE) {
      internalOperation['childNo'] = operation.getAttribute(DULConstants.CHILDNO);
    }
    
    if ((nodeType == Node.ATTRIBUTE_NODE) || (nodeType == Node.ELEMENT_NODE) || (nodeType == Node.PROCESSING_INSTRUCTION_NODE)) {
      internalOperation['nodeName'] = operation.getAttribute(DULConstants.NAME);
    }
    
    var charPosAttr = operation.attributes.getNamedItem(DULConstants.CHARPOS);
    if (charPosAttr) {
      internalOperation['charpos'] = charPosAttr.value;
    }
    
    var valueNode = operation.firstChild;
    if (valueNode) {
      internalOperation['value'] = valueNode.nodeValue;
    };

    return internalOperation;
  },
  
  _parseDelete: function (operation) {
    var internalOperation = {
      type: 'delete',
      node: operation.getAttribute(DULConstants.NODE)
    };
    
    var charpos = operation.hasAttribute(DULConstants.CHARPOS) ? parseInt(operation.getAttribute(DULConstants.CHARPOS)) : NaN;
    var length = operation.hasAttribute(DULConstants.LENGTH) ? parseInt(operation.getAttribute(DULConstants.LENGTH)) : NaN;

    if (!isNaN(charpos)) {
      internalOperation['charpos'] = parseInt(charpos);
    }
    
    if (!isNaN(length)) {
      internalOperation['length'] = parseInt(length);
    }
    
    return internalOperation;
  },
  
  _parseMove: function (operation) {
    var internalOperation = {
      type: 'move',
      node: operation.getAttribute(DULConstants.NODE),
      ocharpos: parseInt(operation.getAttribute(DULConstants.OLD_CHARPOS)),
      ncharpos: parseInt(operation.getAttribute(DULConstants.NEW_CHARPOS)),
      parent: operation.getAttribute(DULConstants.PARENT),
      childNo: parseInt(operation.getAttribute(DULConstants.CHILDNO))
    };
    
    var lengthAttribute = operation.getAttribute(DULConstants.LENGTH);
    if (lengthAttribute !== null) {
      internalOperation['length'] = parseInt(lengthAttribute);
    };
    
    return internalOperation;
  },
  
  _parseUpdate: function (operation) {
    var internalOperation = {
      type: 'update',
      node: operation.getAttribute(DULConstants.NODE)
    };
    
    // We do not know is the node element or something else so we add operation node content to 
    // both nodeName and nodeValue fields
    // this should be changed in future.
    
    internalOperation['nodeName'] = internalOperation['nodeValue'] = operation.firstChild.nodeValue;
      
    return internalOperation;
  }
  
};
},{}],7:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Creates the edit script for the fmes algorithm.
 *
 * Uses the algorithm described in the paper
 * "Change Detection in Hierarchically Structure Information".
 */
EditScript = DiffXmlUtils.createClass(null, {  
  
  /**
   * Constructor for EditScript.
   * Used to create a list of modifications that will turn document1 into document2,
   * given a set of matching nodes.
   * 
   * @constructs
   * @param document1 the original document
   * @param document2 the modified document
   * @param matchings the set of matching nodes
   */
  init: function (document1, document2, matchings) {
    // The original document.
    this._document1 = document1;

    // The modified document.
    this._document2 = document2;
    
    // The set of matching nodes.
    this._matchings = matchings;

    //Delta
    this._delta = null;
  },
  proto : /** @lends EditScript.prototype */ {
    
    /**
     * Creates an Edit Script conforming to matchings that transforms
     * document1 into document2.
     *
     * Uses algorithm in "Change Detection in Hierarchically Structured
     * Information".
     *
     * @param delta (optional) delta object, if not specified InternalDelta is used.
     *
     * @return the resultant Edit Script
     */
    create: function(delta) {
      this._delta = delta||new InternalDelta();
      
      // Fifo used to do a breadth first traversal of doc2
      var fifo = new NodeFifo();
      fifo.addChildrenOfNode(this._document2);
      
      var doc2docEl = this._document2.documentElement;
      //Special case for aligning children of root node
      this._alignChildren(this._document1, this._document2, this._matchings);

      while (!fifo.isEmpty()) {
          var x = fifo.pop();
          fifo.addChildrenOfNode(x);

          var y = x.parentNode;
          var z = this._matchings.getPartner(y);
          var w = this._matchings.getPartner(x);

          if (!this._matchings.isMatched(x)) {
            w = this._doInsert(x, z);
          } else {
            // TODO: Update should go here
            // Special case for document element
              if (NodeOps.checkIfSameNode(x, doc2docEl) && !Match.compareElements(w, x)) {
                w = this._doUpdate(w, x);
              } else { 
                if (!(this._matchings.getPartner(y) == w.parentNode)) {
                  this._doMove(w, x, z, this._matchings);
                }
              }
          }

          this._alignChildren(w, x, this._matchings);
      }

      this._deletePhase(this._document1, this._matchings);

      // TODO: Assert following
      // Post-Condition es is a minimum cost edit script,
      // Matchings is a total matching and
      // doc1 is isomorphic to doc2

      return this._delta;
    },

    /**
     * Updates a Node to the value of another node.
     * 
     * @param w The Node to be updated
     * @param x The Node to make it like
     * @return The new Node
     */
    _doUpdate: function (w, x) {
      var doc1 = w.ownerDocument;
      var newW = null;
      if (w.nodeType == Node.ELEMENT_NODE) {

          this._delta.update(w, x);

          //Unfortunately, you can't change the node name in DOM, so we need
          //to create a new node and copy it all over
          
          //TODO: Note you don't actually *need* to do this!!!
          //TODO: Only call this when in debug
          newW = doc1.createElement(x.nodeName);
          
          // Copy x's attributes to the new element
          var attrs = x.attributes;
          for (var i = 0; i < attrs.length; i++) {
            newW.setAttribute(attrs[i].name, attrs[i].value);
          }
          
          while (w.hasChildNodes()) {
            newW.appendChild(w.firstChild);
          }

          w.parentNode.replaceChild(newW, w);
          this._matchings.remove(w);
          this._matchings.add(newW, x);   
      }
      
      return newW;
    },
    /**
     * Inserts (clone of) node x as child of z according to the algorithm 
     * and updates the Edit Script.
     *
     * @param x          current node
     * @param z          partner of x's parent
     * @return           the inserted node
     */
    _doInsert: function (x, z) {
        //Find the child number (k) to insert w as child of z 
        var pos = new FindPosition(x, this._matchings);

        //Apply insert to doc1
        //The node we want to insert is the import of x with attributes but no children

        var w = x.cloneNode(false);
        
        //Need to set in order as won't be revisited
        NodeOps.setInOrder(w);
        NodeOps.setInOrder(x);

        this._delta.insert(w, NodeOps.getXPath(z), pos.getXPathInsertPosition(), pos.getCharInsertPosition());

        //Take match of parent (z), and insert
        w = this._insertAsChild(pos.getDOMInsertPosition(), z, w);

        this._matchings.add(w, x);

        return w;
    },

    /**
     * Performs a move operation according to the algorithm and updates
     * the EditScript.
     *
     * @param w          the node to be moved
     * @param x          the matching node
     * @param z          the partner of x's parent
     * @param matchings  the set of matching nodes
     */
    _doMove: function (w, x, z, matchings) {
      
      var v = w.parentNode;
      var y = x.parentNode;
      
      // Apply move if parents not matched and not null

      var partnerY = matchings.getPartner(y);
      if (NodeOps.checkIfSameNode(v, partnerY)) {
        throw new Error("v is same as partnerY");
      }
      
      var pos = new FindPosition(x, matchings);
      
      NodeOps.setInOrder(w);
      NodeOps.setInOrder(x);

      this._delta.move(w, NodeOps.getXPath(z), pos.getXPathInsertPosition(), pos.getCharInsertPosition());

      //Apply move to T1
      this._insertAsChild(pos.getDOMInsertPosition(), z, w);
    },

    /**
     * Performs the deletePhase of the algorithm.
     *
     * @param n          the current node
     * @param matchings  the set of matching nodes
     */
    _deletePhase: function (n, matchings) {
      var kids = n.childNodes;
      if (kids != null) {
        // Note that we loop *backward* through kids
        for (var i = (kids.length - 1); i >= 0; i--) {
          this._deletePhase(kids.item(i), matchings);
        }
      }

      // If node isn't matched, delete it
      if (!matchings.isMatched(n) && n.nodeType != Node.DOCUMENT_TYPE_NODE) {
        this._delta.deleteNode(n);
        n.parentNode.removeChild(n);
      }
    },

    /**
     * Mark the children of a node out of order.
     *
     * @param n the parent of the nodes to mark out of order
     */
    _markChildrenOutOfOrder: function (n) {
      if (n.childNodes) {
        for (var i = 0, l = n.childNodes.length; i < l; i++) {
          NodeOps.setOutOfOrder(n.childNodes.item(i));
        }
      }
    },

    /**
     * Mark the children of a node in order.
     *
     * @param n the parent of the nodes to mark in order
     */
    _markChildrenInOrder: function (n) {
      if (n.childNodes) {
        for (var i = 0, l = n.childNodes.length; i < l; i++) {
          NodeOps.setInOrder(n.childNodes.item(i));
        }
      }
    },
    
    /**
     * Marks the Nodes in the given list and their partners "inorder".
     *
     * @param seq  the Nodes to mark "inorder"
     * @param matchings the set of matching Nodes
     */
    _setNodesInOrder: function (seq, matchings) {
      for (var i = 0, l = seq.length; i < l; i++) {
        var node = seq[i];
        NodeOps.setInOrder(node);
        NodeOps.setInOrder(matchings.getPartner(node));
      }
    },

    /**
     * Moves nodes that are not in order to correct position.
     *
     * @param w Node with potentially misaligned children
     * @param wSeq Sequence of children of w that have matches in the children of x
     * @param stay The List of nodes not to be moved
     * @param matchings The set of matching nodes
     */
    _moveMisalignedNodes: function (w, wSeq, stay, matchings) {
      for (var wSeqIndex = 0, wSeqLength = wSeq.length; wSeqIndex < wSeqLength; wSeqIndex++) {
        var a = wSeq[wSeqIndex];
        if (NodeOps.getNodeIndex(stay, a) == -1) {
          var b = matchings.getPartner(a);
          var pos = new FindPosition(b, matchings);
          this._delta.move(a, NodeOps.getXPath(w), pos.getXPathInsertPosition(), pos.getCharInsertPosition());
          this._insertAsChild(pos.getDOMInsertPosition(), w, a);
          NodeOps.setInOrder(a);
          NodeOps.setInOrder(b);
        }
      }
    },

    /**
     * Aligns children of current node that are not in order.
     *
     * @param w  the match of the current node.
     * @param x  the current node

     * @param matchings  the set of matchings
     */
    _alignChildren: function (w, x, matchings) {
      //Order of w and x is important
      this._markChildrenOutOfOrder(w);
      this._markChildrenOutOfOrder(x);

      var wKids = w.childNodes;
      var xKids = x.childNodes;

      var wSeq = NodeSequence.getSequence(wKids, xKids, matchings);
      var xSeq = NodeSequence.getSequence(xKids, wKids, matchings);
      if (wSeq && xSeq) {
        var lcsSeq = NodeSequence.getLCS(wSeq, xSeq, matchings);
        this._setNodesInOrder(lcsSeq, matchings);
        this._moveMisalignedNodes(w, wSeq, lcsSeq, matchings);
      }
      
      //The following is missing from the algorithm, but is important
      this._markChildrenInOrder(w);
      this._markChildrenInOrder(x);
    },
    
    /**
     * Inserts a given node as numbered child of a parent node.
     *
     * If childNum doesn't exist the node is simply appended.
     *
     * @param childNum  the position to add the node to
     * @param parent    the node that is to be the parent
     * @param insNode   the node to be inserted
     * @return The inserted Node
     */
    _insertAsChild: function (childNum, parent, insNode) {
      if (insNode.parentNode) {
        insNode.parentNode.removeChild(insNode);
      }
      
      var child = parent.childNodes.item(childNum);
      if (child) {
        parent.insertBefore(insNode, child);
      } else {
        parent.appendChild(insNode);
      }
      
      return insNode;
    }
  }
});
},{}],8:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class 
 * Finds the position to insert a Node at.
 * 
 * Calculates XPath, DOM and character position.
 */
FindPosition = DiffXmlUtils.createClass(null, {
  
  /**
   * Finds the child number to insert a node as.
   *
   * (Equivalent to the current child number of the node to insert
   * before)
   *
   * @constructs
   * @param x         the node with no partner
   * @param matchings the set of matching nodes
   */
  init: function (x, matchings) {
    
    // The DOM position. 
    this._insertPositionDOM = null;
    
    // The XPath position.
    this._insertPositionXPath = null;
    
    // The character position.
    this._charInsertPosition = null;
    
    var v = this._getInOrderLeftSibling(x);
    if (v == null) {
      this._insertPositionDOM = 0;
      this._insertPositionXPath = 1;
      this._charInsertPosition = 1;
    } else {
      // Get partner of v and return index after
      // (we want to insert after the previous in-order node, so that
      // w's position is equivalent to x's).
      var u = matchings.getPartner(v);
      var uChildNo = new ChildNumber(u);
      //Need position after u
      this._insertPositionDOM = uChildNo.getInOrderDOM() + 1;
      this._insertPositionXPath = uChildNo.getInOrderXPath() + 1;
      //For xpath, character position is used if node is text node
      if (u.nodeType == Node.TEXT_NODE) {
        this._charInsertPosition = uChildNo.getInOrderXPathCharPos() + u.length;
      } else {
       this._charInsertPosition = 1;
      }
    }
  },
  proto : /** @lends FindPosition.prototype */ {
    /**
     * Gets the rightmost left sibling of n marked "inorder".
     *
     * @param n Node to find "in order" left sibling of
     * @return  Either the "in order" left sibling or null if none
     */
    _getInOrderLeftSibling: function (n) {
      var curr = n.previousSibling;
      while (curr != null && !NodeOps.isInOrder(curr)) {
        curr = curr.previousSibling;
      }

      return curr;
    },

    /**
     * Returns the DOM number the node should have when inserted.
     * 
     * @return the DOM number to insert the node as
     */
    getDOMInsertPosition: function () {
      return this._insertPositionDOM;
    },
    
    /**
     * Returns the XPath number the node should have when inserted.
     * 
     * @return The XPath number to insert the node as
     */
    getXPathInsertPosition: function () {
      return this._insertPositionXPath;
    },
    
    /**
     * Returns the character position to insert the node as.
     * 
     * @return The character position to insert the node at
     */
    getCharInsertPosition: function () {
      return this._charInsertPosition;
    }
  }  
});
},{}],9:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class 
 * Fmes finds the differences between two DOM documents.
 *
 * Uses the Fast Match Edit Script algorithm (fmes).
 */
Fmes = DiffXmlUtils.createClass(null, { 
  /**
   * Constructor
   * @constructs
   */
  init: function () {
  },
  proto : /** @lends Fmes.prototype */ {
    /**
     * Differences two DOM documents and returns the delta.
     *
     * @param document1    The original document
     * @param document2    The new document
     * @param delta        (optional) Delta object to be used
     *
     * @return A delta of changes
     */
    diff: function (document1, document2, delta) {
      var matchings = Match.easyMatch(document1, document2);
      return (new EditScript(document1, document2, matchings)).create(delta);
    } 
  }
});
},{}],10:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Default delta.
 * @extends Delta
 */
InternalDelta = DiffXmlUtils.createClass(Delta, {
  /**
   * Constructor
   * @constructs
   */
  init: function (operations) {
    this._changes = operations||new Array();
  },
  proto : /** @lends InternalDelta.prototype */ {
    
    /**
     * Returns changes array
     * 
     * @returns changes array
     */
    getChanges: function () {
      return this._changes;
    },

    /**
     * Returns move operations as array
     * 
     * @returns move operations as array
     */
    getMoved: function () {
      return this._getChangesByType("move");
    },
    
    /**
     * Returns delete operations as array
     * 
     * @returns delete operations as array
     */
    getDeleted: function () {
      return this._getChangesByType("delete");
    },
    
    /**
     * Returns insert operations as array
     * 
     * @returns insert operations as array
     */
    getInserted: function () {
      return this._getChangesByType("insert");
    },
    
    /**
     * Returns update operations as array
     * 
     * @returns update operations as array
     */
    getUpdated: function () {
      return this._getChangesByType("update");
    },

    /**
     * Adds inserts for attributes of a node to an delta.
     * 
     * @param attrs the attributes to be added
     * @param path the path to the node they are to be added to
     */
    addAttrsToDelta: function (attrs, path) {
      var numAttrs;
      if (attrs == null) {
        numAttrs = 0;
      } else {
        numAttrs = attrs.length;
      }

      for (var i = 0; i < numAttrs; i++) {
        this.insert(attrs.item(i), path, 0, 1);
      }
    },
    
    /**
     * Appends an insert operation to the delta.
     * 
     * Set charpos to 1 if not needed.
     * 
     * @param n The node to insert
     * @param parent The path to the node to be parent of n
     * @param childno The child number of the parent node that n will become
     * @param charpos The character position to insert at
     */
    insert: function (n, parent, childno, charpos) {
      var inserted = {
        type: 'insert',
        parent: parent,
        nodeType: n.nodeType,
        value: n.nodeValue
      };
      
      if (n.nodeType != Node.ATTRIBUTE_NODE) {
        inserted['childNo'] = childno;
      } 
      
      if (n.nodeType == Node.ATTRIBUTE_NODE || n.nodeType == Node.ELEMENT_NODE || n.nodeType == Node.PROCESSING_INSTRUCTION_NODE) {
        inserted['nodeName'] = n.nodeName;
      }
      
      if (charpos > 1) {
        inserted['charpos'] = charpos;
      }
      
      this._changes.push(inserted);
      
      if (n.nodeType == Node.ELEMENT_NODE) {
        this.addAttrsToDelta(n.attributes, parent + "/node()[" + childno + "]");
      }
    },
    
    /**
     * Adds a delete operation to the delta for the given Node.
     * 
     * @param n The Node that is to be deleted
     */
    deleteNode: function(n) {
      var deleted = {
        type: 'delete',
        node: NodeOps.getXPath(n)
      };
      
      if (n.nodeType == Node.TEXT_NODE) {
        var cn = new ChildNumber(n);
        var charpos = cn.getXPathCharPos();
        
        if (charpos >= 1) {
          deleted['charpos'] = charpos;
          deleted['length'] = n.length;
        }
      }

      this._changes.push(deleted);
    },

    /**
     * Adds a Move operation to the delta. 
     * 
     * @param n The node being moved
     * @param parent XPath to the new parent Node
     * @param childno Child number of the parent n will become
     * @param ncharpos The new character position for the Node
     */
    move: function (n, parent, childno, ncharpos) {
      if (ncharpos < 1) {
        throw new Error("New Character position must be >= 1");
      }

      var moved = {
        type: 'move',
        node: NodeOps.getXPath(n),
        ocharpos: new ChildNumber(n).getXPathCharPos(),
        ncharpos: ncharpos,
        parent: parent,
        childNo: childno
      };
      
      if (n.nodeType == Node.TEXT_NODE) {
        moved['length'] = n.length;
      }
      
      this._changes.push(moved);
    },

    /**
     * Adds an update operation to the delta.
     * 
     * @param w The node to update
     * @param x The node to update it to
     */
    update: function (w, x) {
      var updated = {
        type: 'update',
        node: NodeOps.getXPath(w)
      };
      
      if (w.nodeType == Node.ELEMENT_NODE) {
        updated['nodeName'] = x.nodeName;
        this._updateAttributes(w, x);
      } else {
        updated['nodeValue'] = x.nodeValue;
      }
      
      this._changes.push(updated);
    },
    
    /**
     * Returns delta in DUL format
     * 
     * @returns delta in DUL format
     */
    toDUL: function () {
      var changes = this.getChanges();
      
      var dulDocument = DiffXmlUtils.parseXmlDocument('<?xml version="1.0" encoding="UTF-8" standalone="no"?><delta/>');
      
      for (var i = 0, l = changes.length; i < l; i++) {
        var change = changes[i];

        switch (change.type) {
          case 'insert':
            this._appendInsertDULNode(dulDocument, change.parent, change.nodeType, change.childNo, change.nodeName, change.charpos, change.value);
          break;
          case 'delete':
            this._appendDeleteDULNode(dulDocument, change.charpos, change.length, change.node);
          break;
          case 'move':
            this._appendMoveDULNode(dulDocument, change.node, change.ocharpos, change.ncharpos, change.parent, change.childNo, change.length);
          break;
          case 'update':
            this._appendUpdateDULNode(dulDocument, change.node, change.nodeName, change.nodeValue);
          break;
          default:
            throw new Error("Invalid operation: " + change.type);
          break;
        }
      }
      
      return DiffXmlUtils.serializeXmlDocument(dulDocument);
    },
    
    _appendInsertDULNode: function (dulDocument, parent, nodeType, childNo, nodeName, charpos, value) {
      var node = dulDocument.createElement(DULConstants.INSERT);

      if (charpos) {
        node.setAttribute(DULConstants.CHARPOS, charpos);
      }
      
      if (childNo) {
        node.setAttribute(DULConstants.CHILDNO, childNo);
      }

      if (nodeName) {
        node.setAttribute(DULConstants.NAME, nodeName);
      }
      
      if (nodeType) {
        node.setAttribute(DULConstants.NODETYPE, nodeType);
      }
      
      if (parent) {
        node.setAttribute(DULConstants.PARENT, parent);
      }

      if (value) {
        node.appendChild(dulDocument.createTextNode(value));
      }
      
      dulDocument.documentElement.appendChild(node);
    },
    
    _appendDeleteDULNode: function (dulDocument, charpos, length, nodeAttr) {
      var node = dulDocument.createElement(DULConstants.DELETE);
      
      if (charpos) {
        node.setAttribute(DULConstants.CHARPOS, charpos);
      }

      if (length) {
        node.setAttribute(DULConstants.LENGTH, length);
      }
      
      if (nodeAttr) {
        node.setAttribute(DULConstants.NODE, nodeAttr);
      }
      
      dulDocument.documentElement.appendChild(node);
    },
    
    _appendMoveDULNode: function (dulDocument, node, ocharpos, ncharpos, parent, childNo, length) {
      var node = dulDocument.createElement(DULConstants.MOVE);
      
      if (node) {
        node.setAttribute(DULConstants.NODE, node);
      }

      if (ocharpos) {
        node.setAttribute(DULConstants.OLD_CHARPOS, ocharpos);
      }
      
      if (ncharpos) {
        node.setAttribute(DULConstants.NEW_CHARPOS, ncharpos);
      }
      
      if (parent) {
        node.setAttribute(DULConstants.PARENT, parent);
      }
      
      if (childNo) {
        node.setAttribute(DULConstants.CHILDNO, childNo);
      }

      if (length) {
        node.setAttribute(DULConstants.LENGTH, length);
      }
      
      dulDocument.documentElement.appendChild(node);
    },
    
    _appendUpdateDULNode: function (dulDocument, node, nodeName, nodeValue) {
      var node = dulDocument.createElement(DULConstants.DELETE);
      
      if (node) {
        node.setAttribute(DULConstants.NODE, node);
      }
      
      if (nodeName) {
        node.appendChild(dulDocument.createTextNode(nodeName));
      } else if (nodeValue) {
        node.appendChild(dulDocument.createTextNode(nodeValue));
      }
      
      dulDocument.documentElement.appendChild(node);
    },
    
    /**
     * Updates the attributes of element w to be the same as x's.
     * 
     * @param w The Element to update the attributes of
     * @param x The element holding the correct attributes
     */
    _updateAttributes: function (w, x) {
      var wAttrs = w.attributes;
      var xAttrs = x.attributes;
      
      //Delete any attrs of w not in x, update others
      for (var i = 0; i < wAttrs.length; i++) {
        var wAttr = wAttrs.item(i);
        var xAttr = xAttrs[wAttr.name];
        if (xAttr == null) {
          this.deleteNode(wAttrs.item(i));
        } else if (wAttr.nodeValue != xAttr.nodeValue) {
          this.update(wAttr, xAttr);
        }
      }
        
      //Add any attrs in x but not w
      for (var j = 0; j < xAttrs.length; j++) {
        var xAttr = xAttrs.item(j);
        if (wAttrs[xAttr.name] == null) {
          this.insert(xAttr, NodeOps.getXPath(w), 0, 1);
        }
      }
    },
    
    _getChangesByType: function (type) {
      var result = new Array();
      for (var i = 0, l = this._changes.length; i < l; i++) {
        if (this._changes[i].type == type) {
          result.push(this._changes[i]);
        }
      }
      return result;
    }
  }
});
},{}],11:[function(require,module,exports){
(function (global){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class
 */
InternalPatch = DiffXmlUtils.createClass(null, {

  init : function() {

  },
  proto : /** @lends InternalPatch.prototype */
  {

    /**
     * Apply patch to XML document.
     * 
     * @param doc
     *          the XML document to be patched
     * @param patch
     *          the patch
     * @throws PatchFormatException
     *           if there is an error parsing the patch
     */
    apply : function(doc, patch) {

      for ( var i = 0, l = patch.getChanges().length; i < l; i++) {
        // Normalize is essential for deletes to work
        doc.normalize();
        
        var operation = patch.getChanges()[i];
        switch (operation.type) {
          case 'insert':
            this._doInsert(doc, operation);
          break;
          case 'delete':
            this._doDelete(doc, operation);
          break;
          case 'move':
            this._doMove(doc, operation);
          break;
          case 'update':
            this._doUpdate(doc, operation);
          break;
        }
      }

    },

    /**
     * Apply insert operation to document.
     * 
     * @param doc
     *          the document to be patched
     * @param operation
     *          the insert operation node
     */
    _doInsert : function(doc, operation) {
      var charpos = parseInt(operation.charpos || 1);
      var parentNode = this._findNodeByXPath(doc, operation.parent);
      var siblings = parentNode.childNodes;
      var nodeType = operation.nodeType;
      var value = operation.value;
      var childNo = operation.childNo === undefined ? 1 : parseInt(operation.childNo);
      var domChildNo = this._getDOMChildNo(nodeType, siblings, childNo);
      var ins = null;

      switch (nodeType) {
        case Node.TEXT_NODE:
          ins = doc.createTextNode(value);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.CDATA_SECTION_NODE:
          ins = doc.createCDATASection(value);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.ELEMENT_NODE:
          ins = doc.createElement(operation.nodeName);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.COMMENT_NODE:
          ins = doc.createComment(value);
          this._insertNode(siblings, parentNode, domChildNo, charpos, ins, doc);
        break;
        case Node.ATTRIBUTE_NODE:
          if (parentNode.nodeType != Node.ELEMENT_NODE) {
            throw new Error("Parent not an element");
          }

          parentNode.setAttribute(operation.nodeName, value);
        break;
        default:
          throw new Error("Unknown NodeType " + nodeType);
      }
    },

    /**
     * Apply delete operation.
     * 
     * @param doc
     *          document to be patched
     * @param operation
     *          delete operation
     */
    _doDelete : function(doc, operation) {
      var deleteNode = this._findNodeByXPath(doc, operation.node);
      if (deleteNode.nodeType == Node.ATTRIBUTE_NODE) {
        deleteNode.ownerElement.removeAttributeNode(deleteNode);
      } else if (deleteNode.nodeType == Node.TEXT_NODE) {
        var charpos = operation.charpos === undefined ? 1 : operation.charpos;
        var length = operation.length;
        if (length === undefined) {
          this._deleteText2(deleteNode, charpos, doc);
        } else {
          try {
            this._deleteText(deleteNode, charpos, length, doc);
          } catch (e) {
            this._deleteText2(deleteNode, charpos, doc);
          }
        }
      } else {
        deleteNode.parentNode.removeChild(deleteNode);
      }
    },

    /**
     * Perform update operation.
     * 
     * @param doc
     *          The document being patched
     * @param operation
     *          The update operation
     */
    _doUpdate : function(doc, operation) {
      var node = this._findNodeByXPath(doc, operation.node);

      if (node.nodeType == Node.ELEMENT_NODE) {
        var newNode = doc.createElement(operation.nodeName);
        for ( var i = 0, l = node.attributes.length; i < l; i++) {
          newNode.setAttribute(node.attributes[i].name, node.attributes[i].value);
        }

        // Move all the children over
        while (node.hasChildNodes()) {
          newNode.appendChild(updateNode.firstChild);
        }

        node.parentNode.replaceChild(newNode, node);
      } else {
        if (node.nodeType == Node.ATTRIBUTE_NODE) {
          node.value = operation.nodeValue;
        } else {
          node.nodeValue = operation.nodeValue;
        }
      }
    },

    /**
     * Apply move operation.
     * 
     * @param doc
     *          document to be patched
     * @param operation
     *          move operation
     */
    _doMove : function(doc, operation) {
      var node = this._findNodeByXPath(doc, operation.node);
      var oldCharPos = operation.ocharpos;
      var newCharPos = operation.ncharpos;

      if (node.nodeType == Node.TEXT_NODE) {
        var text = "";
        try {
          var length = operation.length;
          if (length) {
            text = this._deleteText(node, oldCharPos, length, doc);
          } else {
            text = this._deleteText2(node, oldCharPos, doc);
          }
        } catch (e) {
          text = this._deleteText2(node, oldCharPos, doc);
        }

        node = doc.createTextNode(text);
      }

      if (node.nodeType != Node.TEXT_NODE) {
        node = node.parentNode.removeChild(node);
      }

      // Find position to move to
      // Get parent
      var parent = this._findNodeByXPath(doc, operation.parent);
      var newSiblings = parent.childNodes;
      var domcn = this._getDOMChildNo(node.nodeType, newSiblings, operation.childNo);

      // Perform insert
      this._insertNode(newSiblings, parent, domcn, newCharPos, node, doc);
    },

    _findNodeByXPath : function(document, xpath) {
      if ((typeof document.evaluate) === 'undefined') {
        if ((typeof (global||window).xpath) !== 'undefined') {
          var result = (global||window).xpath.select(xpath, document);
          if (result && result.length > 0) {
            return result[0];
          }
        }
      } else {
        var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        return result.iterateNext();
      }
      
      return null;
    },

    /**
     * Get the DOM Child number
     * 
     * @param nodeType
     *          the nodeType to be inserted
     * @param siblings
     *          the siblings of the node
     * @param xPathChildNo
     *          operation childNo
     * @return the DOM Child number of the node
     */
    _getDOMChildNo : function(nodeType, siblings, xpathcn) {
      var domcn = 0;

      //Convert xpath childno to DOM childno
      if (nodeType != Node.ATTRIBUTE_NODE) {
          domcn = this._getDOMChildNoFromXPath(siblings, xpathcn);
      }

      return domcn;
    },
    
    /**
     * Get the DOM Child Number equivalent of the XPath childnumber.
     *
     * @param siblings the NodeList we are interested in
     * @param xpathcn  the XPath child number
     * @return the equivalent DOM child number
     */
    _getDOMChildNoFromXPath: function (siblings, xpathcn) {
      var domIndex = 0;
      var xPathIndex = 1;
      while ((xPathIndex < xpathcn) && (domIndex < siblings.length)) {
        if (!((this._prevNodeIsATextNode(siblings, domIndex)) && (siblings.item(domIndex).nodeType == Node.TEXT_NODE))) {
          xPathIndex++;
        }
        domIndex++;
      }
      //Handle appending nodes
      if (xPathIndex < xpathcn) {
        domIndex++;
        xPathIndex++;
      }
      
      return domIndex;
    },

    /**
     * Tests if previous node is a text node.
     * 
     * @param siblings
     *          siblings of current node
     * @param index
     *          index of current node
     * @return true if previous node is a text node, false otherwise
     */
    _prevNodeIsATextNode : function(siblings, index) {
      return index > 0 && siblings.item(index - 1).nodeType == Node.TEXT_NODE;
    },

    /**
     * Inserts a node at the given character position.
     * 
     * @param charpos
     *          the character position to insert at
     * @param siblings
     *          the NodeList to insert the node into
     * @param domcn
     *          the child number to insert the node as
     * @param ins
     *          the node to insert
     * @param parent
     *          the node to become the parent of the inserted node
     */
    _insertAtCharPos : function(charpos, siblings, domcn, ins, parent, doc) {
      // we know text node at domcn -1
      var cp = charpos;
      var textNodeIndex = domcn - 1;
      var append = false;

      while (this._prevNodeIsATextNode(siblings, textNodeIndex)) {
        textNodeIndex--;
      }

      while ((siblings.item(textNodeIndex).nodeType == Node.TEXT_NODE) && (cp > siblings.item(textNodeIndex).length)) {
        cp = cp - siblings.item(textNodeIndex).length;
        textNodeIndex++;

        if (textNodeIndex == siblings.length) {
          if (cp > 1) {
            throw new Error("charpos past end of text");
          }
          append = true;
          parent.appendChild(ins);
          break;
        }
      }
      ;

      var sibNode = siblings.item(textNodeIndex);

      if (!append) {
        if (cp == 1) {
          parent.insertBefore(ins, sibNode);
        } else if (cp > sibNode.length) {
          var nextSib = sibNode.nextSibling;
          if (nextSib != null) {
            parent.insertBefore(ins, nextSib);
          } else {
            parent.appendChild(ins);
          }
        } else {
          var text = sibNode.nodeValue;
          var nextSib = sibNode.nextSibling;
          parent.removeChild(sibNode);
          var text1 = doc.createTextNode(text.substring(0, cp - 1));
          var text2 = doc.createTextNode(text.substring(cp - 1));
          if (nextSib != null) {
            parent.insertBefore(text1, nextSib);
            parent.insertBefore(ins, nextSib);
            parent.insertBefore(text2, nextSib);
          } else {
            parent.appendChild(text1);
            parent.appendChild(ins);
            parent.appendChild(text2);
          }
        }
      }
    },

    /**
     * Insert a node under parent node at given position.
     * 
     * @param siblings
     *          the NodeList to insert the node into
     * @param parent
     *          the parent to insert the node under
     * @param domcn
     *          the child number to insert the node as
     * @param charpos
     *          the character position at which to insert the node
     * @param ins
     *          the node to be inserted
     * @param doc
     *          the document we are inserting into
     */
    _insertNode : function(siblings, parent, domcn, charpos, ins, doc) {
      // siblings(domcn) is the node currently at the position we want to put
      // the node

      if (domcn > siblings.length) {
        throw new Error("Child number past end of nodes");
      }
      if (parent.nodeType != Node.ELEMENT_NODE && parent.nodeType != Node.DOCUMENT_NODE) {
        throw new Error("Parent must be an element");
      }

      if ((siblings.length > 0)) {

        // Check if inserting into text
        if (this._prevNodeIsATextNode(siblings, domcn)) {
          this._insertAtCharPos(charpos, siblings, domcn, ins, parent, doc);
        } else if (domcn < siblings.length) {
          parent.insertBefore(ins, siblings.item(domcn));
        } else {
          parent.appendChild(ins);
        }
      } else {
        parent.appendChild(ins);
      }
    },

    /**
     * Delete the appropriate amount of text from a Node.
     * 
     * Assumes a normalized document, i.e. no adjacent or empty text nodes.
     * 
     * @param delNode the text node to delete text from
     * @param charpos the character position at which to delete
     * @param length the number of characters to delete
     * @param doc the document being deleted from
     * @return the deleted text
     */
    _deleteText : function(delNode, charpos, length, doc) {
      if (delNode.nodeType != Node.TEXT_NODE) {
        throw new Error("Attempt to delete text from non-text node.");
      }

      var text = delNode.nodeValue;
      if (charpos > text.length) {
        throw new Error("charpos past end of text node.");
      }

      if ((length + charpos - 1) > text.length) {
        throw new Error("length past end of text node.");
      }

      var newText = text.substring(0, charpos - 1) + text.substring(charpos - 1 + length);
      if (newText.length > 0) {
        var newTextNode = doc.createTextNode(newText);
        delNode.parentNode.insertBefore(newTextNode, delNode);
      }

      delNode.parentNode.removeChild(delNode);

      return text.substring(charpos - 1, charpos - 1 + length);
    },

    /**
     * Delete the appropriate amount of text from a Node.
     * 
     * @param delNode the text node to delete text from
     * @param charpos the character position at which to delete
     * @param doc the document being deleted from
     * @return the deleted text
     */
    _deleteText2 : function(delNode, charpos, doc) {
      var length = delNode.nodeValue.length - charpos + 1;
      return this._deleteText(delNode, charpos, length, doc);
    }
  }
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class
 * Solves the "good matchings" problem for the FMES algorithm.
 *
 * Essentially pairs nodes that match between documents.
 * Uses the "fast match" algorithm is detailed in the paper
 * "Change Detection in Hierarchically Structure Information".
 *
 * WARNING: Will only work correctly with acylic documents.
 * TODO: Add alternate matching code for cylic documents.
 * See: http://www.devarticles.com/c/a/Development-Cycles/How-to-Strike-a-Match/
 * for information on how to match strings.
 */
Match = /** @lends Match */ {
  /**
   * Performs fast match algorithm on given DOM documents.
   * 
   *  TODO: May want to consider starting at same point in 2nd tree somehow, 
   *  may lead to better matches.
   * 
   * @param document1 The original document
   * @param document2 The modified document
   * 
   * @return NodeSet containing pairs of matching nodes.
   */
  easyMatch: function (document1, document2) {
    var matchSet = new NodePairs();
    
    document1.documentElement.normalize();
    document2.documentElement.normalize();
    
    var list1 = this._initialiseAndOrderNodes(document1);
    var list2 = this._initialiseAndOrderNodes(document2);
    
    //Explicitly add document elements and root
    matchSet.add(document1, document2);
    matchSet.add(document1.documentElement, document2.documentElement);
    
    // Proceed bottom up on List 1
    for (var i = 0, l = list1.length; i < l; i++) {
      var nd1 = list1[i];
      var n1 = nd1.getNode();
      for (var j = 0, jl = list2.length; j < jl; j++) {
        var nd2 = list2[j];
        var n2 = nd2.getNode();
        
        if (this._compareNodes(n1, n2)) {
          matchSet.add(n1, n2);
          //Don't want to consider it again
          this._removeItemFromNodeDepth(list2, nd2);
          break;
        }
      }
    }

    return matchSet;
  },
  
  /**
   * Compares two elements two determine whether they should be matched.
   * 
   * TODO: This method is critical in getting good results. Will need to be
   * tweaked. In addition, it may be an idea to allow certain doc types to
   * override it. Consider comparing position, matching of kids etc.
   * 
   * @param a First element
   * @param b Potential match for b
   * @return true if nodes match, false otherwise
   */
  compareElements: function (a, b) {
    var ret = false;

    if (a.nodeName == b.nodeName) {
        //Compare attributes
        
        //Attributes are equal until we find one that doesn't match
        ret = true;
        
        var aAttrs = a.attributes;
        var bAttrs = b.attributes;

        var numberAAttrs = 0;
        if (aAttrs != null) {
            numberAAttrs = aAttrs.length;
        }
        var numberBAttrs = 0;
        if (bAttrs != null) {
            numberBAttrs = bAttrs.length;
        }
        if (numberAAttrs != numberBAttrs) {
            ret = false;
        }

        var i = 0;
        while (ret && (i < numberAAttrs)) {
            // Check if attr exists in other tag
            var bItem = bAttrs.getNamedItem(aAttrs.item(i).nodeName);
            if (bItem == null || (bItem.value != aAttrs.item(i).value)) {
                ret = false;
            } 
            i++;
        }
    }
    
    return ret;
  },
  
  /**
   * Compares two text nodes to determine if they should be matched.
   * 
   * Takes into account whitespace options.
   * 
   * @param a First node
   * @param b Potential match for a
   * @return True if nodes match, false otherwise
   */

  compareTextNodes: function (a, b) {
    var aString = a.data;
    var bString = b.data;

    return aString == bString;
  },

  /**
   * Compares 2 nodes to determine whether they should match.
   * 
   * TODO: Check if more comparisons are needed
   * TODO: Consider moving out to a separate class, implementing an interface
   * 
   * @param a first node
   * @param b potential match for a
   * @return true if nodes match, false otherwise
   */
  _compareNodes: function (a, b) {
    var ret = false;

    if (a.nodeType == b.nodeType) { 
      switch (a.nodeType) {
        case Node.ELEMENT_NODE :
          ret = this.compareElements(a, b);
        break;
        case Node.TEXT_NODE :
          ret = this.compareTextNodes(a, b);
        break;
        case Node.DOCUMENT_NODE :
          //Always match document nodes
          ret = true;
        break;
        default :
          ret = a.nodeValue == b.nodeValue;
        break;
      }
    }
    
    return ret;
  },

  /**
   * Returns a list of Nodes sorted according to their depths.
   * 
   * Does *NOT* include root or documentElement
   * 
   * TreeSet is sorted in reverse order of depth according to
   * NodeInfoComparator.
   * 
   * @param doc The document to be initialised and ordered.
   * @return A depth-ordered list of the nodes in the doc.
   */
  _initialiseAndOrderNodes: function (doc) {
    var depthSorted = [];
    if ((typeof doc.createNodeIterator) !== 'undefined') {
      var ni = doc.createNodeIterator(doc, NodeFilter.SHOW_ALL, null);
      var n;
      while ((n = ni.nextNode()) != null) {
        if (!(NodeOps.checkIfSameNode(doc, n) || NodeOps.checkIfSameNode(doc.documentElement, n) || n.nodeType == Node.DOCUMENT_TYPE_NODE)) {
          depthSorted.push(new NodeDepth(n));
        }
      }
    
      ni.detach();
    } else {
      if ((typeof (global||window).xpath) !== 'undefined') {
        var nodes = (global||window).xpath.select("/descendant-or-self::node()", doc.documentElement);
        for (var i = 0, l = nodes.length; i < l; i++) {
          var n = nodes[i];
          if (!(NodeOps.checkIfSameNode(doc, n) || NodeOps.checkIfSameNode(doc.documentElement, n) || n.nodeType == Node.DOCUMENT_TYPE_NODE)) {
            depthSorted.push(new NodeDepth(n));
          }
        }
      }
    }
  
    depthSorted.sort(function (nodeInfo1, nodeInfo2) {
      return nodeInfo2.getDepth() - nodeInfo1.getDepth();
    });
  
    return depthSorted;
  },
  
  /**
   * Removes nodeDepth from array of nodeDepths
   * 
   * @param list array of nodeDepths
   * @param nodeDepth nodeDepth to be removed
   */
  _removeItemFromNodeDepth: function (list, nodeDepth) {
    var index = list.indexOf(nodeDepth);
    if (index != -1) {
      list.splice(index, 1);
    }
  }

};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Associates depth with a node.
 */
NodeDepth = DiffXmlUtils.createClass(null, {
  /**
   * Create a NodeDepth for the given node.
   *
   * @constructs
   * @param node The node to find the depth of
   */
  init: function (node) {
    // Node we're pointing to.
    this._node = node;

    // Field holding nodes depth.
    this._depth = this._calculateDepth(this._node);
  },
  proto : /** @lends NodeDepth.prototype */ {
    
    /**
     * Returns the depth value.
     *
     * @return The current depth value
     */
    getDepth: function () {
      return this._depth;
    },
    
    /**
     * Returns the underlying node.
     *
     * @return The Node.
     */
    getNode: function () {
      return this._node;  
    },
    
    /**
     * Calculates the depth of a Node.
     * 
     * The root Node is at depth 0.
     * 
     * @param node The Node to calculate the depth of
     * @return The depth of the node
     */
    _calculateDepth: function (node) {
      var depth = 0;
      var tmpNode = node;
      var doc;
      if (node.nodeType == Node.DOCUMENT_NODE) {
        doc = node;
      } else {
        doc = tmpNode.ownerDocument;
      }

      while (tmpNode != doc) {
        depth++;
        tmpNode = tmpNode.parentNode;
      }
      
      return depth;
    }
  }  
});
},{}],14:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class 
 * Implements a First In First Out list.
 *
 * Equivalent to a stack where elements are removed from
 * the *opposite* end to where the are added. Hence the
 * Stack terms "push" and pop" are used.
 */
NodeFifo = DiffXmlUtils.createClass(null, {
  /**
   * Default constructor.
   * @constructs
   */
  init: function () {
    // Underlying list.
    this._fifo = new Array();
  },
  proto : /** @lends NodeFifo.prototype */ {
    
    push: function (n) {
      this._fifo.push(n);
    },

    /**
     * Checks if the Fifo contains any objects.
     *
     * @return true if there are any objects in the Fifo
     */

    isEmpty: function () {
       return this._fifo.length == 0;
    },

    /**
     * Remove a Node from the Fifo.
     *
     * This Node is always the oldest item in the array.
     *
     * @return the oldest item in the Fifo
     */
    pop: function () {
      if (this.isEmpty()) {
        return null;
      }
      
      return this._fifo.shift();
    },

    /**
     * Adds the children of a node to the fifo.
     *
     * @param x the node whose children are to be added
     */
    addChildrenOfNode: function (x) {
      var kids = x.childNodes;

      if (kids != null) {
        for (var i = 0, l = kids.length; i < l; i++) {
          if ((kids.item(i).nodeType == Node.DOCUMENT_TYPE_NODE)) {
            continue;
          }

          this.push(kids.item(i));
        }
      }
    }
  }  
});
},{}],15:[function(require,module,exports){
/**
 * @class 
 * Class to handle general diffxml operations on Nodes.
 */
NodeOps = /** @lends NodeOps */ {
    
  /**
   * Replacement for obsolete Node.setUserData
   * 
   * @param node node
   * @param name userKey
   * @param value userData
   */
  setUserData: function (node, name, value) {
    // TODO: Use Element.dataSet (https://developer.mozilla.org/en-US/docs/DOM/element.dataset) when supported
    
    if (!node._userData) {
      node._userData = {};
    }
    
    node._userData[name] = value;
  },
  
  /**
   * Replacement for obsolete Node.getUserData
   * 
   * @param node node
   * @param name userKey
   */
  getUserData: function (node, name) {
    // TODO: Use Element.dataSet (https://developer.mozilla.org/en-US/docs/DOM/element.dataset) when supported

    if (node._userData) {
      return node._userData[name];
    }
    
    return null;
  },
  
  /**
   * Returns a index of a node from array of nodes or NodeList
   * 
   * @param list array / NodeList
   * @param node node
   * @returns index of node or -1 if not found
   */
  getNodeIndex: function (list, node) {
    // TODO: Is this method really necessary?
    if (list instanceof Array) {
      return list.indexOf(node);
    } else if (list instanceof NodeList) {
      for (var i = 0, l = list.length; i < l; i++) {
        if (list.item(i) == node) {
          return i;
        }
      }
    }
    
    return -1;
  },

  /**
   * Mark the node as being "inorder".
   *
   * @param n the node to mark as "inorder"
   */
  setInOrder: function (n) {
    NodeOps.setUserData(n, "inorder", true);
  },

  /**
   * Mark the node as not being "inorder".
   *
   * @param n the node to mark as not "inorder"
   */
  setOutOfOrder: function (n) {
    NodeOps.setUserData(n, "inorder", false);
  },

  /**
   * Check if node is marked "inorder".
   *
   * Note that nodes are inorder by default.
   *
   * @param n node to check
   * @return false if UserData set to False, true otherwise
   */
  isInOrder: function (n) {
    var data = NodeOps.getUserData(n, "inorder");
    return data == null ? true : data;
  },

  /**
   * Check if nodes are the same.
   * 
   * @param x first node to check
   * @param y second node to check
   * @return true if same node, false otherwise
   */

  checkIfSameNode: function (x, y) {
    if (x != null && y != null) {
      return x == y;
    } 

    return false;
  },
  
  /**
   * Calculates an XPath that uniquely identifies the given node.
   * For text nodes note that the given node may only be part of the returned
   * node due to coalescing issues; use an offset and length to identify it
   * unambiguously.
   * 
   * @param n The node to calculate the XPath for.
   * @return The XPath to the node as a String
   */
  getXPath: function(n) {
    var xpath;
    if (n.nodeType == Node.ATTRIBUTE_NODE) {
        //Slightly special case for attributes as they are considered to
        //have no parent
      // TODO: ownerElement property is deprecated.
      xpath = this.getXPath(n.ownerElement) + "/@" + n.nodeName;
    } else if (n.nodeType == Node.DOCUMENT_NODE) {
      xpath = "/";
    } else if (n.nodeType == Node.DOCUMENT_TYPE_NODE) {
      throw new Error("DocumentType nodes cannot be identified with XPath");
    } else if (n.parentNode.nodeType == Node.DOCUMENT_NODE) {
      var cn = new ChildNumber(n);
      xpath = "/node()[" + cn.getXPath() + "]"; 
    } else {
      var cn = new ChildNumber(n);
      xpath = this.getXPath(n.parentNode) + "/node()[" + cn.getXPath() + "]";
    }
    
    return xpath;
  },
  
  /**
   * Check if node is an empty text node.
   * 
   * @param n The Node to test.
   * @return True if it is a 0 sized text node
   */
  nodeIsEmptyText: function (n) {
    if (n.nodeType === Node.TEXT_NODE) {
      return n.length === 0;
    }
    
    return false;
  }
};

},{}],16:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Class to hold pairs of nodes.
 */
NodePairs = DiffXmlUtils.createClass(null, {
  /**
   * Constructor
   * @constructs
   */
  init: function () {
    this._pairs = new Object();
    this._pairCount = 0;
    this._hashCounter = new Date().getTime();
  },
  proto : /** @lends NodePairs.prototype */ {
    /**
     * Adds a pair of nodes to the set. Sets UserData as matched.
     * 
     * @param x first node
     * @param y partner of first node
     */
    add: function (x, y) {
      var xHash = ++this._hashCounter; 
      var yHash = ++this._hashCounter; 
    
      this._pairs[xHash] = y;
      this._pairs[yHash] = x;
      this._pairCount += 2;
      
      NodeOps.setUserData(x, "hash", xHash);
      NodeOps.setUserData(y, "hash", yHash);

      this._setMatched(x, y);
    },

    /**
     * Mark the node as being "matched".
     *
     * @param n the node to mark as "matched"
     */
    _setMatchedNode: function (n) {
      NodeOps.setUserData(n, "matched", true);
    },

    /**
     * Check if node is marked "matched".
     *
     * Made static so that I can use a instance method later if it is faster or
     * better.
     * 
     * @param n node to check
     * @return true if marked "matched", false otherwise
     */
    isMatched: function (n) {
      var data = NodeOps.getUserData(n, "matched");
      return data == null ? false : data;
    },
    
    /**
     * Mark a pair of nodes as matched.
     *
     * @param nodeA  The unmatched partner of nodeB
     * @param nodeB  The unmatched partner of nodeA
     */
    _setMatched: function (nodeA, nodeB) {
      this._setMatchedNode(nodeA);
      this._setMatchedNode(nodeB);
    },
    
    /**
     * Returns the partner of a given node. Returns null if the node does not
     * exist.
     * 
     * @param n the node to find the partner of.
     * @return the partner of n.
     */
    getPartner: function (n) {
      if (n == null) {
        return null;
      } else {
        var hash = NodeOps.getUserData(n, "hash");
        return hash ? this._pairs[hash]||null : null;
      }
    },

    /**
     * Get the number of nodes stored. 
     * 
     * Note that this includes both nodes and partners.
     * 
     * @return The number of nodes stored.
     */
    size: function () {
      return this._pairCount;
    },
    
    /**
     * Remove a node and it's partner from the list of matchings.
     * 
     * @param n The Node to remove
     */
    remove: function (n) {
      var nHash = NodeOps.getUserData(n, "hash");
      var nMatch = this._pairs[nHash];
      NodeOps.setUserData(nMatch, "matched", null);
      NodeOps.setUserData(n, "matched", null);
      
      delete this._pairs[NodeOps.getUserData(nMatch, "hash")];
      delete this._pairs[nHash];
      
      this._pairCount -= 2;
    }
    
  }
});
},{}],17:[function(require,module,exports){
/*
 * DiffXmlJs - JavaScript library for comparing XML files.
 * 
 * Licensed under GNU Lesser General Public License Version 3 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Antti Leppä / Foyt
 * antti.leppa@foyt.fi
 */

/**
 * @class Class to hold pairs of nodes.
 */
NodeSequence = /** @lends NodeSequence */ {
  
  /**
   * Gets the nodes in set1 which have matches in set2.
   *
   * @param set1      the first set of nodes
   * @param set2      the set of nodes to match against
   * @param matchings the set of matching nodes
   *
   * @return the nodes in set1 which have matches in set2
   */
  getSequence: function (set1, set2, matchings) {
    var seq = null;
    if (set1 != null && set2 != null) {
      var resultSet = new Array();
      var set2list = new Array();
      for (var i = 0, l = set2.length; i < l; i++) {
        set2list.push(set2.item(i));
      }
      
      for (var i = 0, l = set1.length; i < l; i++) {
        if (set2list.indexOf(matchings.getPartner(set1.item(i))) != -1) {
          resultSet.push(set1.item(i));
        }   
      }
      
      seq = resultSet;
    }
    
    return seq; 
  },

  /**
   * Gets the Longest Common Subsequence for the given Node arrays.
   * 
   * "Matched" Nodes are considered equal.
   * The returned nodes are from s1.
   * 
   * TODO: Check for better algorithms
   * 
   * @param s1 First Node sequence 
   * @param s2 Second Node sequence
   * @param matchings Set of matching Nodes
   * @return A list of Nodes representing the Longest Common Subsequence 
   */
  getLCS: function (s1, s2, matchings) {
    var num = new Array();
    for (var i = 0, l = s1.length + 1; i < l; i++) {
      var subArray = new Array();
      for (var j = 0, jl = s2.length + 1; j < jl; j++) {
        subArray.push(0);
      }
      
      num.push(subArray);
    }
    
    for (var i = 1; i <= s1.length; i++) {
      for (var j = 1; j <= s2.length; j++) {
        var n1 = matchings.getPartner(s1[i - 1]);
        var n2 = s2[j - 1];
        if (NodeOps.checkIfSameNode(n1, n2)) {
          num[i][j] = 1 + num[i - 1][j - 1];
        } else {
          num[i][j] = Math.max(num[i - 1][j], num[i][j - 1]);
        }
      }
    }
    
    //Length of LCS is num[s1.length][s2.length]);

    var s1position = s1.length; 
    var s2position = s2.length;
    
    var result = new Array();

    while (s1position != 0 && s2position != 0) {
      if (NodeOps.checkIfSameNode(matchings.getPartner(s1[s1position - 1]), s2[s2position - 1])) {
        result.unshift(s1[s1position - 1]);
        s1position--;
        s2position--;
      } else if (num[s1position][s2position - 1] >= num[s1position - 1][s2position]) {
        s2position--;
      } else {
        s1position--;
      }
    }

    return result;
  }   
};
},{}],18:[function(require,module,exports){
/*
 * xpath.js
 *
 * An XPath 1.0 library for JavaScript.
 *
 * Cameron McCormack <cam (at) mcc.id.au>
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike
 * License. To view a copy of this license, visit
 * 
 *   http://creativecommons.org/licenses/by-sa/2.0/
 *
 * or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford,
 * California 94305, USA.
 *
 * Revision 20: April 26, 2011
 *   Fixed a typo resulting in FIRST_ORDERED_NODE_TYPE results being wrong,
 *   thanks to <shi_a009 (at) hotmail.com>.
 *
 * Revision 19: November 29, 2005
 *   Nodesets now store their nodes in a height balanced tree, increasing
 *   performance for the common case of selecting nodes in document order,
 *   thanks to S閎astien Cramatte <contact (at) zeninteractif.com>.
 *   AVL tree code adapted from Raimund Neumann <rnova (at) gmx.net>.
 *
 * Revision 18: October 27, 2005
 *   DOM 3 XPath support.  Caveats:
 *     - namespace prefixes aren't resolved in XPathEvaluator.createExpression,
 *       but in XPathExpression.evaluate.
 *     - XPathResult.invalidIteratorState is not implemented.
 *
 * Revision 17: October 25, 2005
 *   Some core XPath function fixes and a patch to avoid crashing certain
 *   versions of MSXML in PathExpr.prototype.getOwnerElement, thanks to
 *   S閎astien Cramatte <contact (at) zeninteractif.com>.
 *
 * Revision 16: September 22, 2005
 *   Workarounds for some IE 5.5 deficiencies.
 *   Fixed problem with prefix node tests on attribute nodes.
 *
 * Revision 15: May 21, 2005
 *   Fixed problem with QName node tests on elements with an xmlns="...".
 *
 * Revision 14: May 19, 2005
 *   Fixed QName node tests on attribute node regression.
 *
 * Revision 13: May 3, 2005
 *   Node tests are case insensitive now if working in an HTML DOM.
 *
 * Revision 12: April 26, 2005
 *   Updated licence.  Slight code changes to enable use of Dean
 *   Edwards' script compression, http://dean.edwards.name/packer/ .
 *
 * Revision 11: April 23, 2005
 *   Fixed bug with 'and' and 'or' operators, fix thanks to
 *   Sandy McArthur <sandy (at) mcarthur.org>.
 *
 * Revision 10: April 15, 2005
 *   Added support for a virtual root node, supposedly helpful for
 *   implementing XForms.  Fixed problem with QName node tests and
 *   the parent axis.
 *
 * Revision 9: March 17, 2005
 *   Namespace resolver tweaked so using the document node as the context
 *   for namespace lookups is equivalent to using the document element.
 *
 * Revision 8: February 13, 2005
 *   Handle implicit declaration of 'xmlns' namespace prefix.
 *   Fixed bug when comparing nodesets.
 *   Instance data can now be associated with a FunctionResolver, and
 *     workaround for MSXML not supporting 'localName' and 'getElementById',
 *     thanks to Grant Gongaware.
 *   Fix a few problems when the context node is the root node.
 *   
 * Revision 7: February 11, 2005
 *   Default namespace resolver fix from Grant Gongaware
 *   <grant (at) gongaware.com>.
 *
 * Revision 6: February 10, 2005
 *   Fixed bug in 'number' function.
 *
 * Revision 5: February 9, 2005
 *   Fixed bug where text nodes not getting converted to string values.
 *
 * Revision 4: January 21, 2005
 *   Bug in 'name' function, fix thanks to Bill Edney.
 *   Fixed incorrect processing of namespace nodes.
 *   Fixed NamespaceResolver to resolve 'xml' namespace.
 *   Implemented union '|' operator.
 *
 * Revision 3: January 14, 2005
 *   Fixed bug with nodeset comparisons, bug lexing < and >.
 *
 * Revision 2: October 26, 2004
 *   QName node test namespace handling fixed.  Few other bug fixes.
 *   
 * Revision 1: August 13, 2004
 *   Bug fixes from William J. Edney <bedney (at) technicalpursuit.com>.
 *   Added minimal licence.
 *
 * Initial version: June 14, 2004
 */

// XPathParser ///////////////////////////////////////////////////////////////

XPathParser.prototype = new Object();
XPathParser.prototype.constructor = XPathParser;
XPathParser.superclass = Object.prototype;

function XPathParser() {
	this.init();
}

XPathParser.prototype.init = function() {
	this.reduceActions = [];

	this.reduceActions[3] = function(rhs) {
		return new OrOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[5] = function(rhs) {
		return new AndOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[7] = function(rhs) {
		return new EqualsOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[8] = function(rhs) {
		return new NotEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[10] = function(rhs) {
		return new LessThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[11] = function(rhs) {
		return new GreaterThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[12] = function(rhs) {
		return new LessThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[13] = function(rhs) {
		return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[15] = function(rhs) {
		return new PlusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[16] = function(rhs) {
		return new MinusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[18] = function(rhs) {
		return new MultiplyOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[19] = function(rhs) {
		return new DivOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[20] = function(rhs) {
		return new ModOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[22] = function(rhs) {
		return new UnaryMinusOperation(rhs[1]);
	};
	this.reduceActions[24] = function(rhs) {
		return new BarOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[25] = function(rhs) {
		return new PathExpr(undefined, undefined, rhs[0]);
	};
	this.reduceActions[27] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		return rhs[0];
	};
	this.reduceActions[28] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		return rhs[0];
	};
	this.reduceActions[29] = function(rhs) {
		return new PathExpr(rhs[0], [], undefined);
	};
	this.reduceActions[30] = function(rhs) {
		if (Utilities.instance_of(rhs[0], PathExpr)) {
			if (rhs[0].filterPredicates == undefined) {
				rhs[0].filterPredicates = [];
			}
			rhs[0].filterPredicates.push(rhs[1]);
			return rhs[0];
		} else {
			return new PathExpr(rhs[0], [rhs[1]], undefined);
		}
	};
	this.reduceActions[32] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[33] = function(rhs) {
		return new XString(rhs[0]);
	};
	this.reduceActions[34] = function(rhs) {
		return new XNumber(rhs[0]);
	};
	this.reduceActions[36] = function(rhs) {
		return new FunctionCall(rhs[0], []);
	};
	this.reduceActions[37] = function(rhs) {
		return new FunctionCall(rhs[0], rhs[2]);
	};
	this.reduceActions[38] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[39] = function(rhs) {
		rhs[2].unshift(rhs[0]);
		return rhs[2];
	};
	this.reduceActions[43] = function(rhs) {
		return new LocationPath(true, []);
	};
	this.reduceActions[44] = function(rhs) {
		rhs[1].absolute = true;
		return rhs[1];
	};
	this.reduceActions[46] = function(rhs) {
		return new LocationPath(false, [ rhs[0] ]);
	};
	this.reduceActions[47] = function(rhs) {
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[49] = function(rhs) {
		return new Step(rhs[0], rhs[1], []);
	};
	this.reduceActions[50] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], []);
	};
	this.reduceActions[51] = function(rhs) {
		return new Step(rhs[0], rhs[1], rhs[2]);
	};
	this.reduceActions[52] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], rhs[1]);
	};
	this.reduceActions[54] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[55] = function(rhs) {
		rhs[1].unshift(rhs[0]);
		return rhs[1];
	};
	this.reduceActions[56] = function(rhs) {
		if (rhs[0] == "ancestor") {
			return Step.ANCESTOR;
		} else if (rhs[0] == "ancestor-or-self") {
			return Step.ANCESTORORSELF;
		} else if (rhs[0] == "attribute") {
			return Step.ATTRIBUTE;
		} else if (rhs[0] == "child") {
			return Step.CHILD;
		} else if (rhs[0] == "descendant") {
			return Step.DESCENDANT;
		} else if (rhs[0] == "descendant-or-self") {
			return Step.DESCENDANTORSELF;
		} else if (rhs[0] == "following") {
			return Step.FOLLOWING;
		} else if (rhs[0] == "following-sibling") {
			return Step.FOLLOWINGSIBLING;
		} else if (rhs[0] == "namespace") {
			return Step.NAMESPACE;
		} else if (rhs[0] == "parent") {
			return Step.PARENT;
		} else if (rhs[0] == "preceding") {
			return Step.PRECEDING;
		} else if (rhs[0] == "preceding-sibling") {
			return Step.PRECEDINGSIBLING;
		} else if (rhs[0] == "self") {
			return Step.SELF;
		}
		return -1;
	};
	this.reduceActions[57] = function(rhs) {
		return Step.ATTRIBUTE;
	};
	this.reduceActions[59] = function(rhs) {
		if (rhs[0] == "comment") {
			return new NodeTest(NodeTest.COMMENT, undefined);
		} else if (rhs[0] == "text") {
			return new NodeTest(NodeTest.TEXT, undefined);
		} else if (rhs[0] == "processing-instruction") {
			return new NodeTest(NodeTest.PI, undefined);
		} else if (rhs[0] == "node") {
			return new NodeTest(NodeTest.NODE, undefined);
		}
		return new NodeTest(-1, undefined);
	};
	this.reduceActions[60] = function(rhs) {
		return new NodeTest(NodeTest.PI, rhs[2]);
	};
	this.reduceActions[61] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[63] = function(rhs) {
		rhs[1].absolute = true;
		rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		return rhs[1];
	};
	this.reduceActions[64] = function(rhs) {
		rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[65] = function(rhs) {
		return new Step(Step.SELF, new NodeTest(NodeTest.NODE, undefined), []);
	};
	this.reduceActions[66] = function(rhs) {
		return new Step(Step.PARENT, new NodeTest(NodeTest.NODE, undefined), []);
	};
	this.reduceActions[67] = function(rhs) {
		return new VariableReference(rhs[1]);
	};
	this.reduceActions[68] = function(rhs) {
		return new NodeTest(NodeTest.NAMETESTANY, undefined);
	};
	this.reduceActions[69] = function(rhs) {
		var prefix = rhs[0].substring(0, rhs[0].indexOf(":"));
		return new NodeTest(NodeTest.NAMETESTPREFIXANY, prefix);
	};
	this.reduceActions[70] = function(rhs) {
		return new NodeTest(NodeTest.NAMETESTQNAME, rhs[0]);
	};
};

XPathParser.actionTable = [
	" s s        sssssssss    s ss  s  ss",
	"                 s                  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                rrrrr               ",
	" s s        sssssssss    s ss  s  ss",
	"rs  rrrrrrrr s  sssssrrrrrr  rrs rs ",
	" s s        sssssssss    s ss  s  ss",
	"                            s       ",
	"                            s       ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"  s                                 ",
	"                            s       ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"a                                   ",
	"r       s                    rr  r  ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrs  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr sr  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                sssss               ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"              s                     ",
	"                             s      ",
	"                rrrrr               ",
	" s s        sssssssss    s sss s  ss",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss      ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             rr     ",
	"                             s      ",
	"                             rs     ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"                                 r  ",
	"                                 s  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s s        sssssssss    s ss  s  ss",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             r      "
];

XPathParser.actionTableNumber = [
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                 J                  ",
	"a  aaaaaaaaa         aaaaaaa aa  a  ",
	"                YYYYY               ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"K1  KKKKKKKK .  +*)('KKKKKK  KK# K\" ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                            N       ",
	"                            O       ",
	"e  eeeeeeeee         eeeeeee ee ee  ",
	"f  fffffffff         fffffff ff ff  ",
	"d  ddddddddd         ddddddd dd dd  ",
	"B  BBBBBBBBB         BBBBBBB BB BB  ",
	"A  AAAAAAAAA         AAAAAAA AA AA  ",
	"  P                                 ",
	"                            Q       ",
	" 1           .  +*)('          #  \" ",
	"b  bbbbbbbbb         bbbbbbb bb  b  ",
	"                                    ",
	"!       S                    !!  !  ",
	"\"      T\"                    \"\"  \"  ",
	"$   V  $$            U       $$  $  ",
	"&   &ZY&&            &XW     &&  &  ",
	")   )))))            )))\\[   ))  )  ",
	".   ....._^]         .....   ..  .  ",
	"1   11111111         11111   11  1  ",
	"5   55555555         55555`  55  5  ",
	"7   77777777         777777  77  7  ",
	"9   99999999         999999  99  9  ",
	":  c::::::::         ::::::b :: a:  ",
	"I  fIIIIIIII         IIIIIIe II  I  ",
	"=  =========         ======= == ==  ",
	"?  ?????????         ??????? ?? ??  ",
	"C  CCCCCCCCC         CCCCCCC CC CC  ",
	"J   JJJJJJJJ         JJJJJJ  JJ  J  ",
	"M   MMMMMMMM         MMMMMM  MM  M  ",
	"N  NNNNNNNNN         NNNNNNN NN  N  ",
	"P  PPPPPPPPP         PPPPPPP PP  P  ",
	"                +*)('               ",
	"R  RRRRRRRRR         RRRRRRR RR aR  ",
	"U  UUUUUUUUU         UUUUUUU UU  U  ",
	"Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ",
	"c  ccccccccc         ccccccc cc cc  ",
	"                             j      ",
	"L  fLLLLLLLL         LLLLLLe LL  L  ",
	"6   66666666         66666   66  6  ",
	"              k                     ",
	"                             l      ",
	"                XXXXX               ",
	" 1 0        /.-,+*)('    & %$m #  \"!",
	"_  f________         ______e __  _  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('      %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	">  >>>>>>>>>         >>>>>>> >> >>  ",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	"Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ",
	"V  VVVVVVVVV         VVVVVVV VV aV  ",
	"T  TTTTTTTTT         TTTTTTT TT  T  ",
	"@  @@@@@@@@@         @@@@@@@ @@ @@  ",
	"                             \x87      ",
	"[  [[[[[[[[[         [[[[[[[ [[ [[  ",
	"D  DDDDDDDDD         DDDDDDD DD DD  ",
	"                             HH     ",
	"                             \x88      ",
	"                             F\x89     ",
	"#      T#                    ##  #  ",
	"%   V  %%            U       %%  %  ",
	"'   'ZY''            'XW     ''  '  ",
	"(   (ZY((            (XW     ((  (  ",
	"+   +++++            +++\\[   ++  +  ",
	"*   *****            ***\\[   **  *  ",
	"-   -----            ---\\[   --  -  ",
	",   ,,,,,            ,,,\\[   ,,  ,  ",
	"0   00000_^]         00000   00  0  ",
	"/   /////_^]         /////   //  /  ",
	"2   22222222         22222   22  2  ",
	"3   33333333         33333   33  3  ",
	"4   44444444         44444   44  4  ",
	"8   88888888         888888  88  8  ",
	"                                 ^  ",
	"                                 \x8a  ",
	";  f;;;;;;;;         ;;;;;;e ;;  ;  ",
	"<  f<<<<<<<<         <<<<<<e <<  <  ",
	"O  OOOOOOOOO         OOOOOOO OO  O  ",
	"`  `````````         ``````` ``  `  ",
	"S  SSSSSSSSS         SSSSSSS SS  S  ",
	"W  WWWWWWWWW         WWWWWWW WW  W  ",
	"\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ",
	"E  EEEEEEEEE         EEEEEEE EE EE  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"]  ]]]]]]]]]         ]]]]]]] ]] ]]  ",
	"                             G      "
];

XPathParser.gotoTable = [
	"3456789:;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"L456789:;<=>?@ AB  CDEFGH IJ ",
	"            M        EFGH IJ ",
	"       N;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"            S        EFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"              e              ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                        h  J ",
	"              i          j   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ ABpqCDEFGH IJ ",
	"                             ",
	"  r6789:;<=>?@ AB  CDEFGH IJ ",
	"   s789:;<=>?@ AB  CDEFGH IJ ",
	"    t89:;<=>?@ AB  CDEFGH IJ ",
	"    u89:;<=>?@ AB  CDEFGH IJ ",
	"     v9:;<=>?@ AB  CDEFGH IJ ",
	"     w9:;<=>?@ AB  CDEFGH IJ ",
	"     x9:;<=>?@ AB  CDEFGH IJ ",
	"     y9:;<=>?@ AB  CDEFGH IJ ",
	"      z:;<=>?@ AB  CDEFGH IJ ",
	"      {:;<=>?@ AB  CDEFGH IJ ",
	"       |;<=>?@ AB  CDEFGH IJ ",
	"       };<=>?@ AB  CDEFGH IJ ",
	"       ~;<=>?@ AB  CDEFGH IJ ",
	"         \x7f=>?@ AB  CDEFGH IJ ",
	"\x80456789:;<=>?@ AB  CDEFGH IJ\x81",
	"            \x82        EFGH IJ ",
	"            \x83        EFGH IJ ",
	"                             ",
	"                     \x84 GH IJ ",
	"                     \x85 GH IJ ",
	"              i          \x86   ",
	"              i          \x87   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ AB\x8cqCDEFGH IJ ",
	"                             ",
	"                             "
];

XPathParser.productions = [
	[1, 1, 2],
	[2, 1, 3],
	[3, 1, 4],
	[3, 3, 3, -9, 4],
	[4, 1, 5],
	[4, 3, 4, -8, 5],
	[5, 1, 6],
	[5, 3, 5, -22, 6],
	[5, 3, 5, -5, 6],
	[6, 1, 7],
	[6, 3, 6, -23, 7],
	[6, 3, 6, -24, 7],
	[6, 3, 6, -6, 7],
	[6, 3, 6, -7, 7],
	[7, 1, 8],
	[7, 3, 7, -25, 8],
	[7, 3, 7, -26, 8],
	[8, 1, 9],
	[8, 3, 8, -12, 9],
	[8, 3, 8, -11, 9],
	[8, 3, 8, -10, 9],
	[9, 1, 10],
	[9, 2, -26, 9],
	[10, 1, 11],
	[10, 3, 10, -27, 11],
	[11, 1, 12],
	[11, 1, 13],
	[11, 3, 13, -28, 14],
	[11, 3, 13, -4, 14],
	[13, 1, 15],
	[13, 2, 13, 16],
	[15, 1, 17],
	[15, 3, -29, 2, -30],
	[15, 1, -15],
	[15, 1, -16],
	[15, 1, 18],
	[18, 3, -13, -29, -30],
	[18, 4, -13, -29, 19, -30],
	[19, 1, 20],
	[19, 3, 20, -31, 19],
	[20, 1, 2],
	[12, 1, 14],
	[12, 1, 21],
	[21, 1, -28],
	[21, 2, -28, 14],
	[21, 1, 22],
	[14, 1, 23],
	[14, 3, 14, -28, 23],
	[14, 1, 24],
	[23, 2, 25, 26],
	[23, 1, 26],
	[23, 3, 25, 26, 27],
	[23, 2, 26, 27],
	[23, 1, 28],
	[27, 1, 16],
	[27, 2, 16, 27],
	[25, 2, -14, -3],
	[25, 1, -32],
	[26, 1, 29],
	[26, 3, -20, -29, -30],
	[26, 4, -21, -29, -15, -30],
	[16, 3, -33, 30, -34],
	[30, 1, 2],
	[22, 2, -4, 14],
	[24, 3, 14, -4, 23],
	[28, 1, -35],
	[28, 1, -2],
	[17, 2, -36, -18],
	[29, 1, -17],
	[29, 1, -19],
	[29, 1, -18]
];

XPathParser.DOUBLEDOT = 2;
XPathParser.DOUBLECOLON = 3;
XPathParser.DOUBLESLASH = 4;
XPathParser.NOTEQUAL = 5;
XPathParser.LESSTHANOREQUAL = 6;
XPathParser.GREATERTHANOREQUAL = 7;
XPathParser.AND = 8;
XPathParser.OR = 9;
XPathParser.MOD = 10;
XPathParser.DIV = 11;
XPathParser.MULTIPLYOPERATOR = 12;
XPathParser.FUNCTIONNAME = 13;
XPathParser.AXISNAME = 14;
XPathParser.LITERAL = 15;
XPathParser.NUMBER = 16;
XPathParser.ASTERISKNAMETEST = 17;
XPathParser.QNAME = 18;
XPathParser.NCNAMECOLONASTERISK = 19;
XPathParser.NODETYPE = 20;
XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL = 21;
XPathParser.EQUALS = 22;
XPathParser.LESSTHAN = 23;
XPathParser.GREATERTHAN = 24;
XPathParser.PLUS = 25;
XPathParser.MINUS = 26;
XPathParser.BAR = 27;
XPathParser.SLASH = 28;
XPathParser.LEFTPARENTHESIS = 29;
XPathParser.RIGHTPARENTHESIS = 30;
XPathParser.COMMA = 31;
XPathParser.AT = 32;
XPathParser.LEFTBRACKET = 33;
XPathParser.RIGHTBRACKET = 34;
XPathParser.DOT = 35;
XPathParser.DOLLAR = 36;

XPathParser.prototype.tokenize = function(s1) {
	var types = [];
	var values = [];
	var s = s1 + '\0';

	var pos = 0;
	var c = s.charAt(pos++);
	while (1) {
		while (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
			c = s.charAt(pos++);
		}
		if (c == '\0' || pos >= s.length) {
			break;
		}

		if (c == '(') {
			types.push(XPathParser.LEFTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ')') {
			types.push(XPathParser.RIGHTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '[') {
			types.push(XPathParser.LEFTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ']') {
			types.push(XPathParser.RIGHTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '@') {
			types.push(XPathParser.AT);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ',') {
			types.push(XPathParser.COMMA);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '|') {
			types.push(XPathParser.BAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '+') {
			types.push(XPathParser.PLUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '-') {
			types.push(XPathParser.MINUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '=') {
			types.push(XPathParser.EQUALS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '$') {
			types.push(XPathParser.DOLLAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		
		if (c == '.') {
			c = s.charAt(pos++);
			if (c == '.') {
				types.push(XPathParser.DOUBLEDOT);
				values.push("..");
				c = s.charAt(pos++);
				continue;
			}
			if (c >= '0' && c <= '9') {
				var number = "." + c;
				c = s.charAt(pos++);
				while (c >= '0' && c <= '9') {
					number += c;
					c = s.charAt(pos++);
				}
				types.push(XPathParser.NUMBER);
				values.push(number);
				continue;
			}
			types.push(XPathParser.DOT);
			values.push('.');
			continue;
		}

		if (c == '\'' || c == '"') {
			var delimiter = c;
			var literal = "";
			while ((c = s.charAt(pos++)) != delimiter) {
				literal += c;
			}
			types.push(XPathParser.LITERAL);
			values.push(literal);
			c = s.charAt(pos++);
			continue;
		}

		if (c >= '0' && c <= '9') {
			var number = c;
			c = s.charAt(pos++);
			while (c >= '0' && c <= '9') {
				number += c;
				c = s.charAt(pos++);
			}
			if (c == '.') {
				if (s.charAt(pos) >= '0' && s.charAt(pos) <= '9') {
					number += c;
					number += s.charAt(pos++);
					c = s.charAt(pos++);
					while (c >= '0' && c <= '9') {
						number += c;
						c = s.charAt(pos++);
					}
				}
			}
			types.push(XPathParser.NUMBER);
			values.push(number);
			continue;
		}

		if (c == '*') {
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					types.push(XPathParser.MULTIPLYOPERATOR);
					values.push(c);
					c = s.charAt(pos++);
					continue;
				}
			}
			types.push(XPathParser.ASTERISKNAMETEST);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == ':') {
			if (s.charAt(pos) == ':') {
				types.push(XPathParser.DOUBLECOLON);
				values.push("::");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '/') {
			c = s.charAt(pos++);
			if (c == '/') {
				types.push(XPathParser.DOUBLESLASH);
				values.push("//");
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.SLASH);
			values.push('/');
			continue;
		}

		if (c == '!') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.NOTEQUAL);
				values.push("!=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '<') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.LESSTHANOREQUAL);
				values.push("<=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.LESSTHAN);
			values.push('<');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '>') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.GREATERTHANOREQUAL);
				values.push(">=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.GREATERTHAN);
			values.push('>');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '_' || Utilities.isLetter(c.charCodeAt(0))) {
			var name = c;
			c = s.charAt(pos++);
			while (Utilities.isNCNameChar(c.charCodeAt(0))) {
				name += c;
				c = s.charAt(pos++);
			}
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					if (name == "and") {
						types.push(XPathParser.AND);
						values.push(name);
						continue;
					}
					if (name == "or") {
						types.push(XPathParser.OR);
						values.push(name);
						continue;
					}
					if (name == "mod") {
						types.push(XPathParser.MOD);
						values.push(name);
						continue;
					}
					if (name == "div") {
						types.push(XPathParser.DIV);
						values.push(name);
						continue;
					}
				}
			}
			if (c == ':') {
				if (s.charAt(pos) == '*') {
					types.push(XPathParser.NCNAMECOLONASTERISK);
					values.push(name + ":*");
					pos++;
					c = s.charAt(pos++);
					continue;
				}
				if (s.charAt(pos) == '_' || Utilities.isLetter(s.charCodeAt(pos))) {
					name += ':';
					c = s.charAt(pos++);
					while (Utilities.isNCNameChar(c.charCodeAt(0))) {
						name += c;
						c = s.charAt(pos++);
					}
					if (c == '(') {
						types.push(XPathParser.FUNCTIONNAME);
						values.push(name);
						continue;
					}
					types.push(XPathParser.QNAME);
					values.push(name);
					continue;
				}
				if (s.charAt(pos) == ':') {
					types.push(XPathParser.AXISNAME);
					values.push(name);
					continue;
				}
			}
			if (c == '(') {
				if (name == "comment" || name == "text" || name == "node") {
					types.push(XPathParser.NODETYPE);
					values.push(name);
					continue;
				}
				if (name == "processing-instruction") {
					if (s.charAt(pos) == ')') {
						types.push(XPathParser.NODETYPE);
					} else {
						types.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
					}
					values.push(name);
					continue;
				}
				types.push(XPathParser.FUNCTIONNAME);
				values.push(name);
				continue;
			}
			types.push(XPathParser.QNAME);
			values.push(name);
			continue;
		}

		throw new Error("Unexpected character " + c);
	}
	types.push(1);
	values.push("[EOF]");
	return [types, values];
};

XPathParser.SHIFT = 's';
XPathParser.REDUCE = 'r';
XPathParser.ACCEPT = 'a';

XPathParser.prototype.parse = function(s) {
	var types;
	var values;
	var res = this.tokenize(s);
	if (res == undefined) {
		return undefined;
	}
	types = res[0];
	values = res[1];
	var tokenPos = 0;
	var state = [];
	var tokenType = [];
	var tokenValue = [];
	var s;
	var a;
	var t;

	state.push(0);
	tokenType.push(1);
	tokenValue.push("_S");

	a = types[tokenPos];
	t = values[tokenPos++];
	while (1) {
		s = state[state.length - 1];
		switch (XPathParser.actionTable[s].charAt(a - 1)) {
			case XPathParser.SHIFT:
				tokenType.push(-a);
				tokenValue.push(t);
				state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
				a = types[tokenPos];
				t = values[tokenPos++];
				break;
			case XPathParser.REDUCE:
				var num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
				var rhs = [];
				for (var i = 0; i < num; i++) {
					tokenType.pop();
					rhs.unshift(tokenValue.pop());
					state.pop();
				}
				var s_ = state[state.length - 1];
				tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
				if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] == undefined) {
					tokenValue.push(rhs[0]);
				} else {
					tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
				}
				state.push(XPathParser.gotoTable[s_].charCodeAt(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2) - 33);
				break;
			case XPathParser.ACCEPT:
				return new XPath(tokenValue.pop());
			default:
				throw new Error("XPath parse error");
		}
	}
};

// XPath /////////////////////////////////////////////////////////////////////

XPath.prototype = new Object();
XPath.prototype.constructor = XPath;
XPath.superclass = Object.prototype;

function XPath(e) {
	this.expression = e;
}

XPath.prototype.toString = function() {
	return this.expression.toString();
};

XPath.prototype.evaluate = function(c) {
	c.contextNode = c.expressionContextNode;
	c.contextSize = 1;
	c.contextPosition = 1;
	c.caseInsensitive = false;
	if (c.contextNode != null) {
		var doc = c.contextNode;
		if (doc.nodeType != 9 /*Node.DOCUMENT_NODE*/) {
			doc = doc.ownerDocument;
		}
		try {
			c.caseInsensitive = doc.implementation.hasFeature("HTML", "2.0");
		} catch (e) {
			c.caseInsensitive = true;
		}
	}
	return this.expression.evaluate(c);
};

XPath.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace";
XPath.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/";

// Expression ////////////////////////////////////////////////////////////////

Expression.prototype = new Object();
Expression.prototype.constructor = Expression;
Expression.superclass = Object.prototype;

function Expression() {
}

Expression.prototype.init = function() {
};

Expression.prototype.toString = function() {
	return "<Expression>";
};

Expression.prototype.evaluate = function(c) {
	throw new Error("Could not evaluate expression.");
};

// UnaryOperation ////////////////////////////////////////////////////////////

UnaryOperation.prototype = new Expression();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.superclass = Expression.prototype;

function UnaryOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryOperation.prototype.init = function(rhs) {
	this.rhs = rhs;
};

// UnaryMinusOperation ///////////////////////////////////////////////////////

UnaryMinusOperation.prototype = new UnaryOperation();
UnaryMinusOperation.prototype.constructor = UnaryMinusOperation;
UnaryMinusOperation.superclass = UnaryOperation.prototype;

function UnaryMinusOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryMinusOperation.prototype.init = function(rhs) {
	UnaryMinusOperation.superclass.init.call(this, rhs);
};

UnaryMinusOperation.prototype.evaluate = function(c) {
	return this.rhs.evaluate(c).number().negate();
};

UnaryMinusOperation.prototype.toString = function() {
	return "-" + this.rhs.toString();
};

// BinaryOperation ///////////////////////////////////////////////////////////

BinaryOperation.prototype = new Expression();
BinaryOperation.prototype.constructor = BinaryOperation;
BinaryOperation.superclass = Expression.prototype;

function BinaryOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BinaryOperation.prototype.init = function(lhs, rhs) {
	this.lhs = lhs;
	this.rhs = rhs;
};

// OrOperation ///////////////////////////////////////////////////////////////

OrOperation.prototype = new BinaryOperation();
OrOperation.prototype.constructor = OrOperation;
OrOperation.superclass = BinaryOperation.prototype;

function OrOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

OrOperation.prototype.init = function(lhs, rhs) {
	OrOperation.superclass.init.call(this, lhs, rhs);
};

OrOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
};

OrOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// AndOperation //////////////////////////////////////////////////////////////

AndOperation.prototype = new BinaryOperation();
AndOperation.prototype.constructor = AndOperation;
AndOperation.superclass = BinaryOperation.prototype;

function AndOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

AndOperation.prototype.init = function(lhs, rhs) {
	AndOperation.superclass.init.call(this, lhs, rhs);
};

AndOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
};

AndOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (!b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// EqualsOperation ///////////////////////////////////////////////////////////

EqualsOperation.prototype = new BinaryOperation();
EqualsOperation.prototype.constructor = EqualsOperation;
EqualsOperation.superclass = BinaryOperation.prototype;

function EqualsOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

EqualsOperation.prototype.init = function(lhs, rhs) {
	EqualsOperation.superclass.init.call(this, lhs, rhs);
};

EqualsOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
};

EqualsOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
};

// NotEqualOperation /////////////////////////////////////////////////////////

NotEqualOperation.prototype = new BinaryOperation();
NotEqualOperation.prototype.constructor = NotEqualOperation;
NotEqualOperation.superclass = BinaryOperation.prototype;

function NotEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

NotEqualOperation.prototype.init = function(lhs, rhs) {
	NotEqualOperation.superclass.init.call(this, lhs, rhs);
};

NotEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
};

NotEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
};

// LessThanOperation /////////////////////////////////////////////////////////

LessThanOperation.prototype = new BinaryOperation();
LessThanOperation.prototype.constructor = LessThanOperation;
LessThanOperation.superclass = BinaryOperation.prototype;

function LessThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOperation.prototype.init = function(lhs, rhs) {
	LessThanOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
};

LessThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
};

// GreaterThanOperation //////////////////////////////////////////////////////

GreaterThanOperation.prototype = new BinaryOperation();
GreaterThanOperation.prototype.constructor = GreaterThanOperation;
GreaterThanOperation.superclass = BinaryOperation.prototype;

function GreaterThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
};

GreaterThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
};

// LessThanOrEqualOperation //////////////////////////////////////////////////

LessThanOrEqualOperation.prototype = new BinaryOperation();
LessThanOrEqualOperation.prototype.constructor = LessThanOrEqualOperation;
LessThanOrEqualOperation.superclass = BinaryOperation.prototype;

function LessThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	LessThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthanorequal(this.rhs.evaluate(c));
};

LessThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
};

// GreaterThanOrEqualOperation ///////////////////////////////////////////////

GreaterThanOrEqualOperation.prototype = new BinaryOperation();
GreaterThanOrEqualOperation.prototype.constructor = GreaterThanOrEqualOperation;
GreaterThanOrEqualOperation.superclass = BinaryOperation.prototype;

function GreaterThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
};

GreaterThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
};

// PlusOperation /////////////////////////////////////////////////////////////

PlusOperation.prototype = new BinaryOperation();
PlusOperation.prototype.constructor = PlusOperation;
PlusOperation.superclass = BinaryOperation.prototype;

function PlusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

PlusOperation.prototype.init = function(lhs, rhs) {
	PlusOperation.superclass.init.call(this, lhs, rhs);
};

PlusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().plus(this.rhs.evaluate(c).number());
};

PlusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
};

// MinusOperation ////////////////////////////////////////////////////////////

MinusOperation.prototype = new BinaryOperation();
MinusOperation.prototype.constructor = MinusOperation;
MinusOperation.superclass = BinaryOperation.prototype;

function MinusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MinusOperation.prototype.init = function(lhs, rhs) {
	MinusOperation.superclass.init.call(this, lhs, rhs);
};

MinusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().minus(this.rhs.evaluate(c).number());
};

MinusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
};

// MultiplyOperation /////////////////////////////////////////////////////////

MultiplyOperation.prototype = new BinaryOperation();
MultiplyOperation.prototype.constructor = MultiplyOperation;
MultiplyOperation.superclass = BinaryOperation.prototype;

function MultiplyOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MultiplyOperation.prototype.init = function(lhs, rhs) {
	MultiplyOperation.superclass.init.call(this, lhs, rhs);
};

MultiplyOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().multiply(this.rhs.evaluate(c).number());
};

MultiplyOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
};

// DivOperation //////////////////////////////////////////////////////////////

DivOperation.prototype = new BinaryOperation();
DivOperation.prototype.constructor = DivOperation;
DivOperation.superclass = BinaryOperation.prototype;

function DivOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

DivOperation.prototype.init = function(lhs, rhs) {
	DivOperation.superclass.init.call(this, lhs, rhs);
};

DivOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().div(this.rhs.evaluate(c).number());
};

DivOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
};

// ModOperation //////////////////////////////////////////////////////////////

ModOperation.prototype = new BinaryOperation();
ModOperation.prototype.constructor = ModOperation;
ModOperation.superclass = BinaryOperation.prototype;

function ModOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

ModOperation.prototype.init = function(lhs, rhs) {
	ModOperation.superclass.init.call(this, lhs, rhs);
};

ModOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().mod(this.rhs.evaluate(c).number());
};

ModOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
};

// BarOperation //////////////////////////////////////////////////////////////

BarOperation.prototype = new BinaryOperation();
BarOperation.prototype.constructor = BarOperation;
BarOperation.superclass = BinaryOperation.prototype;

function BarOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BarOperation.prototype.init = function(lhs, rhs) {
	BarOperation.superclass.init.call(this, lhs, rhs);
};

BarOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).nodeset().union(this.rhs.evaluate(c).nodeset());
};

BarOperation.prototype.toString = function() {
	return this.lhs.toString() + " | " + this.rhs.toString();
};

// PathExpr //////////////////////////////////////////////////////////////////

PathExpr.prototype = new Expression();
PathExpr.prototype.constructor = PathExpr;
PathExpr.superclass = Expression.prototype;

function PathExpr(filter, filterPreds, locpath) {
	if (arguments.length > 0) {
		this.init(filter, filterPreds, locpath);
	}
}

PathExpr.prototype.init = function(filter, filterPreds, locpath) {
	PathExpr.superclass.init.call(this);
	this.filter = filter;
	this.filterPredicates = filterPreds;
	this.locationPath = locpath;
};

PathExpr.prototype.evaluate = function(c) {
	var nodes;
	var xpc = new XPathContext();
	xpc.variableResolver = c.variableResolver;
	xpc.functionResolver = c.functionResolver;
	xpc.namespaceResolver = c.namespaceResolver;
	xpc.expressionContextNode = c.expressionContextNode;
	xpc.virtualRoot = c.virtualRoot;
	xpc.caseInsensitive = c.caseInsensitive;
	if (this.filter == null) {
		nodes = [ c.contextNode ];
	} else {
		var ns = this.filter.evaluate(c);
		if (!Utilities.instance_of(ns, XNodeSet)) {
			if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null) {
				throw new Error("Path expression filter must evaluate to a nodset if predicates or location path are used");
			}
			return ns;
		}
		nodes = ns.toArray();
		if (this.filterPredicates != null) {
			// apply each of the predicates in turn
			for (var j = 0; j < this.filterPredicates.length; j++) {
				var pred = this.filterPredicates[j];
				var newNodes = [];
				xpc.contextSize = nodes.length;
				for (xpc.contextPosition = 1; xpc.contextPosition <= xpc.contextSize; xpc.contextPosition++) {
					xpc.contextNode = nodes[xpc.contextPosition - 1];
					if (this.predicateMatches(pred, xpc)) {
						newNodes.push(xpc.contextNode);
					}
				}
				nodes = newNodes;
			}
		}
	}
	if (this.locationPath != null) {
		if (this.locationPath.absolute) {
			if (nodes[0].nodeType != 9 /*Node.DOCUMENT_NODE*/) {
				if (xpc.virtualRoot != null) {
					nodes = [ xpc.virtualRoot ];
				} else {
					if (nodes[0].ownerDocument == null) {
						// IE 5.5 doesn't have ownerDocument?
						var n = nodes[0];
						while (n.parentNode != null) {
							n = n.parentNode;
						}
						nodes = [ n ];
					} else {
						nodes = [ nodes[0].ownerDocument ];
					}
				}
			} else {
				nodes = [ nodes[0] ];
			}
		}
		for (var i = 0; i < this.locationPath.steps.length; i++) {
			var step = this.locationPath.steps[i];
			var newNodes = [];
			for (var j = 0; j < nodes.length; j++) {
				xpc.contextNode = nodes[j];
				switch (step.axis) {
					case Step.ANCESTOR:
						// look at all the ancestor nodes
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						var m;
						if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
							m = this.getOwnerElement(xpc.contextNode);
						} else {
							m = xpc.contextNode.parentNode;
						}
						while (m != null) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
							if (m === xpc.virtualRoot) {
								break;
							}
							m = m.parentNode;
						}
						break;

					case Step.ANCESTORORSELF:
						// look at all the ancestor nodes and the current node
						for (var m = xpc.contextNode; m != null; m = m.nodeType == 2 /*Node.ATTRIBUTE_NODE*/ ? this.getOwnerElement(m) : m.parentNode) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
							if (m === xpc.virtualRoot) {
								break;
							}
						}
						break;

					case Step.ATTRIBUTE:
						// look at the attributes
						var nnm = xpc.contextNode.attributes;
						if (nnm != null) {
							for (var k = 0; k < nnm.length; k++) {
								var m = nnm.item(k);
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
							}
						}
						break;

					case Step.CHILD:
						// look at all child elements
						for (var m = xpc.contextNode.firstChild; m != null; m = m.nextSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.DESCENDANT:
						// look at all descendant nodes
						var st = [ xpc.contextNode.firstChild ];
						while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.DESCENDANTORSELF:
						// look at self
						if (step.nodeTest.matches(xpc.contextNode, xpc)) {
							newNodes.push(xpc.contextNode);
						}
						// look at all descendant nodes
						var st = [ xpc.contextNode.firstChild ];
						while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.FOLLOWING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						var st = [];
						if (xpc.contextNode.firstChild != null) {
							st.unshift(xpc.contextNode.firstChild);
						} else {
							st.unshift(xpc.contextNode.nextSibling);
						}
						for (var m = xpc.contextNode.parentNode; m != null && m.nodeType != 9 /*Node.DOCUMENT_NODE*/ && m !== xpc.virtualRoot; m = m.parentNode) {
							st.unshift(m.nextSibling);
						}
						do {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						} while (st.length > 0);
						break;
						
					case Step.FOLLOWINGSIBLING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						for (var m = xpc.contextNode.nextSibling; m != null; m = m.nextSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.NAMESPACE:
						var n = {};
						if (xpc.contextNode.nodeType == 1 /*Node.ELEMENT_NODE*/) {
							n["xml"] = XPath.XML_NAMESPACE_URI;
							n["xmlns"] = XPath.XMLNS_NAMESPACE_URI;
							for (var m = xpc.contextNode; m != null && m.nodeType == 1 /*Node.ELEMENT_NODE*/; m = m.parentNode) {
								for (var k = 0; k < m.attributes.length; k++) {
									var attr = m.attributes.item(k);
									var nm = String(attr.name);
									if (nm == "xmlns") {
										if (n[""] == undefined) {
											n[""] = attr.value;
										}
									} else if (nm.length > 6 && nm.substring(0, 6) == "xmlns:") {
										var pre = nm.substring(6, nm.length);
										if (n[pre] == undefined) {
											n[pre] = attr.value;
										}
									}
								}
							}
							for (var pre in n) {
								var nsn = new NamespaceNode(pre, n[pre], xpc.contextNode);
								if (step.nodeTest.matches(nsn, xpc)) {
									newNodes.push(nsn);
								}
							}
						}
						break;

					case Step.PARENT:
						m = null;
						if (xpc.contextNode !== xpc.virtualRoot) {
							if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
								m = this.getOwnerElement(xpc.contextNode);
							} else {
								m = xpc.contextNode.parentNode;
							}
						}
						if (m != null && step.nodeTest.matches(m, xpc)) {
							newNodes.push(m);
						}
						break;

					case Step.PRECEDING:
						var st;
						if (xpc.virtualRoot != null) {
							st = [ xpc.virtualRoot ];
						} else {
							st = xpc.contextNode.nodeType == 9 /*Node.DOCUMENT_NODE*/
								? [ xpc.contextNode ]
								: [ xpc.contextNode.ownerDocument ];
						}
						outer: while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (m == xpc.contextNode) {
									break outer;
								}
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.unshift(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.PRECEDINGSIBLING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						for (var m = xpc.contextNode.previousSibling; m != null; m = m.previousSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.SELF:
						if (step.nodeTest.matches(xpc.contextNode, xpc)) {
							newNodes.push(xpc.contextNode);
						}
						break;

					default:
				}
			}
			nodes = newNodes;
			// apply each of the predicates in turn
			for (var j = 0; j < step.predicates.length; j++) {
				var pred = step.predicates[j];
				var newNodes = [];
				xpc.contextSize = nodes.length;
				for (xpc.contextPosition = 1; xpc.contextPosition <= xpc.contextSize; xpc.contextPosition++) {
					xpc.contextNode = nodes[xpc.contextPosition - 1];
					if (this.predicateMatches(pred, xpc)) {
						newNodes.push(xpc.contextNode);
					} else {
					}
				}
				nodes = newNodes;
			}
		}
	}
	var ns = new XNodeSet();
	ns.addArray(nodes);
	return ns;
};

PathExpr.prototype.predicateMatches = function(pred, c) {
	var res = pred.evaluate(c);
	if (Utilities.instance_of(res, XNumber)) {
		return c.contextPosition == res.numberValue();
	}
	return res.booleanValue();
};

PathExpr.prototype.toString = function() {
	if (this.filter != undefined) {
		var s = this.filter.toString();
		if (Utilities.instance_of(this.filter, XString)) {
			s = "'" + s + "'";
		}
		if (this.filterPredicates != undefined) {
			for (var i = 0; i < this.filterPredicates.length; i++) {
				s = s + "[" + this.filterPredicates[i].toString() + "]";
			}
		}
		if (this.locationPath != undefined) {
			if (!this.locationPath.absolute) {
				s += "/";
			}
			s += this.locationPath.toString();
		}
		return s;
	}
	return this.locationPath.toString();
};

PathExpr.prototype.getOwnerElement = function(n) {
	// DOM 2 has ownerElement
	if (n.ownerElement) {
		return n.ownerElement;
	}
	// DOM 1 Internet Explorer can use selectSingleNode (ironically)
	try {
		if (n.selectSingleNode) {
			return n.selectSingleNode("..");
		}
	} catch (e) {
	}
	// Other DOM 1 implementations must use this egregious search
	var doc = n.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? n
			: n.ownerDocument;
	var elts = doc.getElementsByTagName("*");
	for (var i = 0; i < elts.length; i++) {
		var elt = elts.item(i);
		var nnm = elt.attributes;
		for (var j = 0; j < nnm.length; j++) {
			var an = nnm.item(j);
			if (an === n) {
				return elt;
			}
		}
	}
	return null;
};

// LocationPath //////////////////////////////////////////////////////////////

LocationPath.prototype = new Object();
LocationPath.prototype.constructor = LocationPath;
LocationPath.superclass = Object.prototype;

function LocationPath(abs, steps) {
	if (arguments.length > 0) {
		this.init(abs, steps);
	}
}

LocationPath.prototype.init = function(abs, steps) {
	this.absolute = abs;
	this.steps = steps;
};

LocationPath.prototype.toString = function() {
	var s;
	if (this.absolute) {
		s = "/";
	} else {
		s = "";
	}
	for (var i = 0; i < this.steps.length; i++) {
		if (i != 0) {
			s += "/";
		}
		s += this.steps[i].toString();
	}
	return s;
};

// Step //////////////////////////////////////////////////////////////////////

Step.prototype = new Object();
Step.prototype.constructor = Step;
Step.superclass = Object.prototype;

function Step(axis, nodetest, preds) {
	if (arguments.length > 0) {
		this.init(axis, nodetest, preds);
	}
}

Step.prototype.init = function(axis, nodetest, preds) {
	this.axis = axis;
	this.nodeTest = nodetest;
	this.predicates = preds;
};

Step.prototype.toString = function() {
	var s;
	switch (this.axis) {
		case Step.ANCESTOR:
			s = "ancestor";
			break;
		case Step.ANCESTORORSELF:
			s = "ancestor-or-self";
			break;
		case Step.ATTRIBUTE:
			s = "attribute";
			break;
		case Step.CHILD:
			s = "child";
			break;
		case Step.DESCENDANT:
			s = "descendant";
			break;
		case Step.DESCENDANTORSELF:
			s = "descendant-or-self";
			break;
		case Step.FOLLOWING:
			s = "following";
			break;
		case Step.FOLLOWINGSIBLING:
			s = "following-sibling";
			break;
		case Step.NAMESPACE:
			s = "namespace";
			break;
		case Step.PARENT:
			s = "parent";
			break;
		case Step.PRECEDING:
			s = "preceding";
			break;
		case Step.PRECEDINGSIBLING:
			s = "preceding-sibling";
			break;
		case Step.SELF:
			s = "self";
			break;
	}
	s += "::";
	s += this.nodeTest.toString();
	for (var i = 0; i < this.predicates.length; i++) {
		s += "[" + this.predicates[i].toString() + "]";
	}
	return s;
};

Step.ANCESTOR = 0;
Step.ANCESTORORSELF = 1;
Step.ATTRIBUTE = 2;
Step.CHILD = 3;
Step.DESCENDANT = 4;
Step.DESCENDANTORSELF = 5;
Step.FOLLOWING = 6;
Step.FOLLOWINGSIBLING = 7;
Step.NAMESPACE = 8;
Step.PARENT = 9;
Step.PRECEDING = 10;
Step.PRECEDINGSIBLING = 11;
Step.SELF = 12;

// NodeTest //////////////////////////////////////////////////////////////////

NodeTest.prototype = new Object();
NodeTest.prototype.constructor = NodeTest;
NodeTest.superclass = Object.prototype;

function NodeTest(type, value) {
	if (arguments.length > 0) {
		this.init(type, value);
	}
}

NodeTest.prototype.init = function(type, value) {
	this.type = type;
	this.value = value;
};

NodeTest.prototype.toString = function() {
	switch (this.type) {
		case NodeTest.NAMETESTANY:
			return "*";
		case NodeTest.NAMETESTPREFIXANY:
			return this.value + ":*";
		case NodeTest.NAMETESTRESOLVEDANY:
			return "{" + this.value + "}*";
		case NodeTest.NAMETESTQNAME:
			return this.value;
		case NodeTest.NAMETESTRESOLVEDNAME:
			return "{" + this.namespaceURI + "}" + this.value;
		case NodeTest.COMMENT:
			return "comment()";
		case NodeTest.TEXT:
			return "text()";
		case NodeTest.PI:
			if (this.value != undefined) {
				return "processing-instruction(\"" + this.value + "\")";
			}
			return "processing-instruction()";
		case NodeTest.NODE:
			return "node()";
	}
	return "<unknown nodetest type>";
};

NodeTest.prototype.matches = function(n, xpc) {
	switch (this.type) {
		case NodeTest.NAMETESTANY:
			if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/
					|| n.nodeType == 1 /*Node.ELEMENT_NODE*/
					|| n.nodeType == XPathNamespace.XPATH_NAMESPACE_NODE) {
				return true;
			}
			return false;
		case NodeTest.NAMETESTPREFIXANY:
			if ((n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/ || n.nodeType == 1 /*Node.ELEMENT_NODE*/)) {
				var ns = xpc.namespaceResolver.getNamespace(this.value, xpc.expressionContextNode);
				if (ns == null) {
					throw new Error("Cannot resolve QName " + this.value);
				}
				return true;	
			}
			return false;
		case NodeTest.NAMETESTQNAME:
			if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/
					|| n.nodeType == 1 /*Node.ELEMENT_NODE*/
					|| n.nodeType == XPathNamespace.XPATH_NAMESPACE_NODE) {
				var test = Utilities.resolveQName(this.value, xpc.namespaceResolver, xpc.expressionContextNode, false);
				if (test[0] == null) {
					throw new Error("Cannot resolve QName " + this.value);
				}
				test[0] = String(test[0]);
				test[1] = String(test[1]);
				if (test[0] == "") {
					test[0] = null;
				}
				var node = Utilities.resolveQName(n.nodeName, xpc.namespaceResolver, n, n.nodeType == 1 /*Node.ELEMENT_NODE*/);
				node[0] = String(node[0]);
				node[1] = String(node[1]);
				if (node[0] == "") {
					node[0] = null;
				}
				if (xpc.caseInsensitive) {
					return test[0] == node[0] && String(test[1]).toLowerCase() == String(node[1]).toLowerCase();
				}
				return test[0] == node[0] && test[1] == node[1];
			}
			return false;
		case NodeTest.COMMENT:
			return n.nodeType == 8 /*Node.COMMENT_NODE*/;
		case NodeTest.TEXT:
			return n.nodeType == 3 /*Node.TEXT_NODE*/ || n.nodeType == 4 /*Node.CDATA_SECTION_NODE*/;
		case NodeTest.PI:
			return n.nodeType == 7 /*Node.PROCESSING_INSTRUCTION_NODE*/
				&& (this.value == null || n.nodeName == this.value);
		case NodeTest.NODE:
			return n.nodeType == 9 /*Node.DOCUMENT_NODE*/
				|| n.nodeType == 1 /*Node.ELEMENT_NODE*/
				|| n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/
				|| n.nodeType == 3 /*Node.TEXT_NODE*/
				|| n.nodeType == 4 /*Node.CDATA_SECTION_NODE*/
				|| n.nodeType == 8 /*Node.COMMENT_NODE*/
				|| n.nodeType == 7 /*Node.PROCESSING_INSTRUCTION_NODE*/;
	}
	return false;
};

NodeTest.NAMETESTANY = 0;
NodeTest.NAMETESTPREFIXANY = 1;
NodeTest.NAMETESTQNAME = 2;
NodeTest.COMMENT = 3;
NodeTest.TEXT = 4;
NodeTest.PI = 5;
NodeTest.NODE = 6;

// VariableReference /////////////////////////////////////////////////////////

VariableReference.prototype = new Expression();
VariableReference.prototype.constructor = VariableReference;
VariableReference.superclass = Expression.prototype;

function VariableReference(v) {
	if (arguments.length > 0) {
		this.init(v);
	}
}

VariableReference.prototype.init = function(v) {
	this.variable = v;
};

VariableReference.prototype.toString = function() {
	return "$" + this.variable;
};

VariableReference.prototype.evaluate = function(c) {
	return c.variableResolver.getVariable(this.variable, c);
};

// FunctionCall //////////////////////////////////////////////////////////////

FunctionCall.prototype = new Expression();
FunctionCall.prototype.constructor = FunctionCall;
FunctionCall.superclass = Expression.prototype;

function FunctionCall(fn, args) {
	if (arguments.length > 0) {
		this.init(fn, args);
	}
}

FunctionCall.prototype.init = function(fn, args) {
	this.functionName = fn;
	this.arguments = args;
};

FunctionCall.prototype.toString = function() {
	var s = this.functionName + "(";
	for (var i = 0; i < this.arguments.length; i++) {
		if (i > 0) {
			s += ", ";
		}
		s += this.arguments[i].toString();
	}
	return s + ")";
};

FunctionCall.prototype.evaluate = function(c) {
	var f = c.functionResolver.getFunction(this.functionName, c);
	if (f == undefined) {
		throw new Error("Unknown function " + this.functionName);
	}
	var a = [c].concat(this.arguments);
	return f.apply(c.functionResolver.thisArg, a);
};

// XString ///////////////////////////////////////////////////////////////////

XString.prototype = new Expression();
XString.prototype.constructor = XString;
XString.superclass = Expression.prototype;

function XString(s) {
	if (arguments.length > 0) {
		this.init(s);
	}
}

XString.prototype.init = function(s) {
	this.str = s;
};

XString.prototype.toString = function() {
	return this.str;
};

XString.prototype.evaluate = function(c) {
	return this;
};

XString.prototype.string = function() {
	return this;
};

XString.prototype.number = function() {
	return new XNumber(this.str);
};

XString.prototype.bool = function() {
	return new XBoolean(this.str);
};

XString.prototype.nodeset = function() {
	throw new Error("Cannot convert string to nodeset");
};

XString.prototype.stringValue = function() {
	return this.str;
};

XString.prototype.numberValue = function() {
	return this.number().numberValue();
};

XString.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XString.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().equals(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.equals);
	}
	return new XBoolean(this.str == r.str);
};

XString.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().notequal(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.notequal);
	}
	return new XBoolean(this.str != r.str);
};

XString.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthanorequal);
	}
	return this.number().lessthan(r.number());
};

XString.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthanorequal);
	}
	return this.number().greaterthan(r.number());
};

XString.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthan);
	}
	return this.number().lessthanorequal(r.number());
};

XString.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthan);
	}
	return this.number().greaterthanorequal(r.number());
};

// XNumber ///////////////////////////////////////////////////////////////////

XNumber.prototype = new Expression();
XNumber.prototype.constructor = XNumber;
XNumber.superclass = Expression.prototype;

function XNumber(n) {
	if (arguments.length > 0) {
		this.init(n);
	}
}

XNumber.prototype.init = function(n) {
	this.num = Number(n);
};

XNumber.prototype.toString = function() {
	return this.num;
};

XNumber.prototype.evaluate = function(c) {
	return this;
};

XNumber.prototype.string = function() {
	return new XString(this.num);
};

XNumber.prototype.number = function() {
	return this;
};

XNumber.prototype.bool = function() {
	return new XBoolean(this.num);
};

XNumber.prototype.nodeset = function() {
	throw new Error("Cannot convert number to nodeset");
};

XNumber.prototype.stringValue = function() {
	return this.string().stringValue();
};

XNumber.prototype.numberValue = function() {
	return this.num;
};

XNumber.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XNumber.prototype.negate = function() {
	return new XNumber(-this.num);
};

XNumber.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.equals(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.equals);
	}
	return new XBoolean(this.num == r.num);
};

XNumber.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.notequal(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.notequal);
	}
	return new XBoolean(this.num != r.num);
};

XNumber.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthan(r.number());
	}
	return new XBoolean(this.num < r.num);
};

XNumber.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthan(r.number());
	}
	return new XBoolean(this.num > r.num);
};

XNumber.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthanorequal(r.number());
	}
	return new XBoolean(this.num <= r.num);
};

XNumber.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthanorequal(r.number());
	}
	return new XBoolean(this.num >= r.num);
};

XNumber.prototype.plus = function(r) {
	return new XNumber(this.num + r.num);
};

XNumber.prototype.minus = function(r) {
	return new XNumber(this.num - r.num);
};

XNumber.prototype.multiply = function(r) {
	return new XNumber(this.num * r.num);
};

XNumber.prototype.div = function(r) {
	return new XNumber(this.num / r.num);
};

XNumber.prototype.mod = function(r) {
	return new XNumber(this.num % r.num);
};

// XBoolean //////////////////////////////////////////////////////////////////

XBoolean.prototype = new Expression();
XBoolean.prototype.constructor = XBoolean;
XBoolean.superclass = Expression.prototype;

function XBoolean(b) {
	if (arguments.length > 0) {
		this.init(b);
	}
}

XBoolean.prototype.init = function(b) {
	this.b = Boolean(b);
};

XBoolean.prototype.toString = function() {
	return this.b.toString();
};

XBoolean.prototype.evaluate = function(c) {
	return this;
};

XBoolean.prototype.string = function() {
	return new XString(this.b);
};

XBoolean.prototype.number = function() {
	return new XNumber(this.b);
};

XBoolean.prototype.bool = function() {
	return this;
};

XBoolean.prototype.nodeset = function() {
	throw new Error("Cannot convert boolean to nodeset");
};

XBoolean.prototype.stringValue = function() {
	return this.string().stringValue();
};

XBoolean.prototype.numberValue = function() {
	return this.num().numberValue();
};

XBoolean.prototype.booleanValue = function() {
	return this.b;
};

XBoolean.prototype.not = function() {
	return new XBoolean(!this.b);
};

XBoolean.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.equals(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.equals);
	}
	return new XBoolean(this.b == r.b);
};

XBoolean.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.notequal(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.notequal);
	}
	return new XBoolean(this.b != r.b);
};

XBoolean.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthanorequal);
	}
	return this.number().lessthan(r.number());
};

XBoolean.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthanorequal);
	}
	return this.number().greaterthan(r.number());
};

XBoolean.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthan);
	}
	return this.number().lessthanorequal(r.number());
};

XBoolean.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthan);
	}
	return this.number().greaterthanorequal(r.number());
};

// AVLTree ///////////////////////////////////////////////////////////////////

AVLTree.prototype = new Object();
AVLTree.prototype.constructor = AVLTree;
AVLTree.superclass = Object.prototype;

function AVLTree(n) {
	this.init(n);
}

AVLTree.prototype.init = function(n) {
	this.left = null;
    this.right = null;
	this.node = n;
	this.depth = 1;
};

AVLTree.prototype.balance = function() {
    var ldepth = this.left  == null ? 0 : this.left.depth;
    var rdepth = this.right == null ? 0 : this.right.depth;

	if (ldepth > rdepth + 1) {
        // LR or LL rotation
        var lldepth = this.left.left  == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;

        if (lldepth < lrdepth) {
            // LR rotation consists of a RR rotation of the left child
            this.left.rotateRR();
            // plus a LL rotation of this node, which happens anyway 
        }
        this.rotateLL();       
    } else if (ldepth + 1 < rdepth) {
        // RR or RL rorarion
		var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
		var rldepth = this.right.left  == null ? 0 : this.right.left.depth;
	 
        if (rldepth > rrdepth) {
            // RR rotation consists of a LL rotation of the right child
            this.right.rotateLL();
            // plus a RR rotation of this node, which happens anyway 
        }
        this.rotateRR();
    }	     
};

AVLTree.prototype.rotateLL = function() {
    // the left side is too long => rotate from the left (_not_ leftwards)
    var nodeBefore = this.node;
    var rightBefore = this.right;
    this.node = this.left.node;
    this.right = this.left;
    this.left = this.left.left;
    this.right.left = this.right.right;
    this.right.right = rightBefore;
    this.right.node = nodeBefore;
    this.right.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.rotateRR = function() {
    // the right side is too long => rotate from the right (_not_ rightwards)
    var nodeBefore = this.node;
    var leftBefore = this.left;
    this.node = this.right.node;
    this.left = this.right;
    this.right = this.right.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
}; 
	
AVLTree.prototype.updateInNewLocation = function() {
    this.getDepthFromChildren();
};

AVLTree.prototype.getDepthFromChildren = function() {
    this.depth = this.node == null ? 0 : 1;
    if (this.left != null) {
        this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
    }
};

AVLTree.prototype.order = function(n1, n2) {
	if (n1 === n2) {
		return 0;
	}
	var d1 = 0;
	var d2 = 0;
	for (var m1 = n1; m1 != null; m1 = m1.parentNode) {
		d1++;
	}
	for (var m2 = n2; m2 != null; m2 = m2.parentNode) {
		d2++;
	}
	if (d1 > d2) {
		while (d1 > d2) {
			n1 = n1.parentNode;
			d1--;
		}
		if (n1 == n2) {
			return 1;
		}
	} else if (d2 > d1) {
		while (d2 > d1) {
			n2 = n2.parentNode;
			d2--;
		}
		if (n1 == n2) {
			return -1;
		}
	}
	while (n1.parentNode != n2.parentNode) {
		n1 = n1.parentNode;
		n2 = n2.parentNode;
	}
	while (n1.previousSibling != null && n2.previousSibling != null) {
		n1 = n1.previousSibling;
		n2 = n2.previousSibling;
	}
	if (n1.previousSibling == null) {
		return -1;
	}
	return 1;
};

AVLTree.prototype.add = function(n)  {
	if (n === this.node) {
        return false;
    }
	
	var o = this.order(n, this.node);
	
    var ret = false;
    if (o == -1) {
        if (this.left == null) {
            this.left = new AVLTree(n);
            ret = true;
        } else {
            ret = this.left.add(n);
            if (ret) {
                this.balance();
            }
        }
    } else if (o == 1) {
        if (this.right == null) {
            this.right = new AVLTree(n);
            ret = true;
        } else {
            ret = this.right.add(n);
            if (ret) {
                this.balance();
            }
        }
    }
	
    if (ret) {
        this.getDepthFromChildren();
    }
    return ret;
};

// XNodeSet //////////////////////////////////////////////////////////////////

XNodeSet.prototype = new Expression();
XNodeSet.prototype.constructor = XNodeSet;
XNodeSet.superclass = Expression.prototype;

function XNodeSet() {
	this.init();
}

XNodeSet.prototype.init = function() {
	this.tree = null;
	this.size = 0;
};

XNodeSet.prototype.toString = function() {
	var p = this.first();
	if (p == null) {
		return "";
	}
	return this.stringForNode(p);
};

XNodeSet.prototype.evaluate = function(c) {
	return this;
};

XNodeSet.prototype.string = function() {
	return new XString(this.toString());
};

XNodeSet.prototype.stringValue = function() {
	return this.toString();
};

XNodeSet.prototype.number = function() {
	return new XNumber(this.string());
};

XNodeSet.prototype.numberValue = function() {
	return Number(this.string());
};

XNodeSet.prototype.bool = function() {
	return new XBoolean(this.tree != null);
};

XNodeSet.prototype.booleanValue = function() {
	return this.tree != null;
};

XNodeSet.prototype.nodeset = function() {
	return this;
};

XNodeSet.prototype.stringForNode = function(n) {
	if (n.nodeType == 9 /*Node.DOCUMENT_NODE*/) {
		n = n.documentElement;
	}
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		return this.stringForNodeRec(n);
	}
	if (n.isNamespaceNode) {
		return n.namespace;
	}
	return n.nodeValue;
};

XNodeSet.prototype.stringForNodeRec = function(n) {
	var s = "";
	for (var n2 = n.firstChild; n2 != null; n2 = n2.nextSibling) {
		if (n2.nodeType == 3 /*Node.TEXT_NODE*/) {
			s += n2.nodeValue;
		} else if (n2.nodeType == 1 /*Node.ELEMENT_NODE*/) {
			s += this.stringForNodeRec(n2);
		}
	}
	return s;
};

XNodeSet.prototype.first = function() {
	var p = this.tree;
	if (p == null) {
		return null;
	}
	while (p.left != null) {
		p = p.left;
	}
	return p.node;
};

XNodeSet.prototype.add = function(n) {
    var added;
    if (this.tree == null) {
        this.tree = new AVLTree(n);
        added = true;
    } else {
        added = this.tree.add(n);
    }
    if (added) {
        this.size++;
    }
};

XNodeSet.prototype.addArray = function(ns) {
	for (var i = 0; i < ns.length; i++) {
		this.add(ns[i]);
	}
};

XNodeSet.prototype.toArray = function() {
	var a = [];
	this.toArrayRec(this.tree, a);
	return a;
};

XNodeSet.prototype.toArrayRec = function(t, a) {
	if (t != null) {
		this.toArrayRec(t.left, a);
		a.push(t.node);
		this.toArrayRec(t.right, a);
	}
};

XNodeSet.prototype.compareWithString = function(r, o) {
	var a = this.toArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XString(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithNumber = function(r, o) {
	var a = this.toArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XNumber(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithBoolean = function(r, o) {
	return o(this.bool(), r);
};

XNodeSet.prototype.compareWithNodeSet = function(r, o) {
	var a = this.toArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XString(this.stringForNode(n));
		var b = r.toArray();
		for (var j = 0; j < b.length; j++) {
			var n2 = b[j];
			var r = new XString(this.stringForNode(n2));
			var res = o(l, r);
			if (res.booleanValue()) {
				return res;
			}
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, Operators.equals);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.equals);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.equals);
	}
	return this.compareWithNodeSet(r, Operators.equals);
};

XNodeSet.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, Operators.notequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.notequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.notequal);
	}
	return this.compareWithNodeSet(r, Operators.notequal);
};

XNodeSet.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.lessthan);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.lessthan);
	}
	return this.compareWithNodeSet(r, Operators.lessthan);
};

XNodeSet.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.greaterthan);
	}
	return this.compareWithNodeSet(r, Operators.greaterthan);
};

XNodeSet.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.lessthanorequal);
	}
	return this.compareWithNodeSet(r, Operators.lessthanorequal);
};

XNodeSet.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.greaterthanorequal);
	}
	return this.compareWithNodeSet(r, Operators.greaterthanorequal);
};

XNodeSet.prototype.union = function(r) {
	var ns = new XNodeSet();
	ns.tree = this.tree;
	ns.size = this.size;
	ns.addArray(r.toArray());
	return ns;
};

// XPathNamespace ////////////////////////////////////////////////////////////

XPathNamespace.prototype = new Object();
XPathNamespace.prototype.constructor = XPathNamespace;
XPathNamespace.superclass = Object.prototype;

function XPathNamespace(pre, ns, p) {
	this.isXPathNamespace = true;
	this.ownerDocument = p.ownerDocument;
	this.nodeName = "#namespace";
	this.prefix = pre;
	this.localName = pre;
	this.namespaceURI = ns;
	this.nodeValue = ns;
	this.ownerElement = p;
	this.nodeType = XPathNamespace.XPATH_NAMESPACE_NODE;
}

XPathNamespace.prototype.toString = function() {
	return "{ \"" + this.prefix + "\", \"" + this.namespaceURI + "\" }";
};

// Operators /////////////////////////////////////////////////////////////////

var Operators = new Object();

Operators.equals = function(l, r) {
	return l.equals(r);
};

Operators.notequal = function(l, r) {
	return l.notequal(r);
};

Operators.lessthan = function(l, r) {
	return l.lessthan(r);
};

Operators.greaterthan = function(l, r) {
	return l.greaterthan(r);
};

Operators.lessthanorequal = function(l, r) {
	return l.lessthanorequal(r);
};

Operators.greaterthanorequal = function(l, r) {
	return l.greaterthanorequal(r);
};

// XPathContext //////////////////////////////////////////////////////////////

XPathContext.prototype = new Object();
XPathContext.prototype.constructor = XPathContext;
XPathContext.superclass = Object.prototype;

function XPathContext(vr, nr, fr) {
	this.variableResolver = vr != null ? vr : new VariableResolver();
	this.namespaceResolver = nr != null ? nr : new NamespaceResolver();
	this.functionResolver = fr != null ? fr : new FunctionResolver();
}

// VariableResolver //////////////////////////////////////////////////////////

VariableResolver.prototype = new Object();
VariableResolver.prototype.constructor = VariableResolver;
VariableResolver.superclass = Object.prototype;

function VariableResolver() {
}

VariableResolver.prototype.getVariable = function(vn, c) {
	var parts = Utilities.splitQName(vn);
	if (parts[0] != null) {
		parts[0] = c.namespaceResolver.getNamespace(parts[0], c.expressionContextNode);
        if (parts[0] == null) {
            throw new Error("Cannot resolve QName " + fn);
        }
	}
	return this.getVariableWithName(parts[0], parts[1], c.expressionContextNode);
};

VariableResolver.prototype.getVariableWithName = function(ns, ln, c) {
	return null;
};

// FunctionResolver //////////////////////////////////////////////////////////

FunctionResolver.prototype = new Object();
FunctionResolver.prototype.constructor = FunctionResolver;
FunctionResolver.superclass = Object.prototype;

function FunctionResolver(thisArg) {
	this.thisArg = thisArg != null ? thisArg : Functions;
	this.functions = new Object();
	this.addStandardFunctions();
}

FunctionResolver.prototype.addStandardFunctions = function() {
	this.functions["{}last"] = Functions.last;
	this.functions["{}position"] = Functions.position;
	this.functions["{}count"] = Functions.count;
	this.functions["{}id"] = Functions.id;
	this.functions["{}local-name"] = Functions.localName;
	this.functions["{}namespace-uri"] = Functions.namespaceURI;
	this.functions["{}name"] = Functions.name;
	this.functions["{}string"] = Functions.string;
	this.functions["{}concat"] = Functions.concat;
	this.functions["{}starts-with"] = Functions.startsWith;
	this.functions["{}contains"] = Functions.contains;
	this.functions["{}substring-before"] = Functions.substringBefore;
	this.functions["{}substring-after"] = Functions.substringAfter;
	this.functions["{}substring"] = Functions.substring;
	this.functions["{}string-length"] = Functions.stringLength;
	this.functions["{}normalize-space"] = Functions.normalizeSpace;
	this.functions["{}translate"] = Functions.translate;
	this.functions["{}boolean"] = Functions.boolean_;
	this.functions["{}not"] = Functions.not;
	this.functions["{}true"] = Functions.true_;
	this.functions["{}false"] = Functions.false_;
	this.functions["{}lang"] = Functions.lang;
	this.functions["{}number"] = Functions.number;
	this.functions["{}sum"] = Functions.sum;
	this.functions["{}floor"] = Functions.floor;
	this.functions["{}ceiling"] = Functions.ceiling;
	this.functions["{}round"] = Functions.round;
};

FunctionResolver.prototype.addFunction = function(ns, ln, f) {
	this.functions["{" + ns + "}" + ln] = f;
};

FunctionResolver.prototype.getFunction = function(fn, c) {
	var parts = Utilities.resolveQName(fn, c.namespaceResolver, c.contextNode, false);
    if (parts[0] == null) {
        throw new Error("Cannot resolve QName " + fn);
    }
	return this.getFunctionWithName(parts[0], parts[1], c.contextNode);
};

FunctionResolver.prototype.getFunctionWithName = function(ns, ln, c) {
	return this.functions["{" + ns + "}" + ln];
};

// NamespaceResolver /////////////////////////////////////////////////////////

NamespaceResolver.prototype = new Object();
NamespaceResolver.prototype.constructor = NamespaceResolver;
NamespaceResolver.superclass = Object.prototype;

function NamespaceResolver() {
}

NamespaceResolver.prototype.getNamespace = function(prefix, n) {
	if (prefix == "xml") {
		return XPath.XML_NAMESPACE_URI;
	} else if (prefix == "xmlns") {
		return XPath.XMLNS_NAMESPACE_URI;
	}
	if (n.nodeType == 9 /*Node.DOCUMENT_NODE*/) {
		n = n.documentElement;
	} else if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		n = PathExpr.prototype.getOwnerElement(n);
	} else if (n.nodeType != 1 /*Node.ELEMENT_NODE*/) {
		n = n.parentNode;
	}
	while (n != null && n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		var nnm = n.attributes;
		for (var i = 0; i < nnm.length; i++) {
			var a = nnm.item(i);
			var aname = a.nodeName;
			if (aname == "xmlns" && prefix == ""
					|| aname == "xmlns:" + prefix) {
				return String(a.nodeValue);
			}
		}
		n = n.parentNode;
	}
	return null;
};

// Functions /////////////////////////////////////////////////////////////////

Functions = new Object();

Functions.last = function() {
	var c = arguments[0];
	if (arguments.length != 1) {
		throw new Error("Function last expects ()");
	}
	return new XNumber(c.contextSize);
};

Functions.position = function() {
	var c = arguments[0];
	if (arguments.length != 1) {
		throw new Error("Function position expects ()");
	}
	return new XNumber(c.contextPosition);
};

Functions.count = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
		throw new Error("Function count expects (node-set)");
	}
	return new XNumber(ns.size);
};

Functions.id = function() {
	var c = arguments[0];
	var id;
	if (arguments.length != 2) {
		throw new Error("Function id expects (object)");
	}
	id = arguments[1].evaluate(c);
	if (Utilities.instance_of(id, XNodeSet)) {
		id = id.toArray().join(" ");
	} else {
		id = id.stringValue();
	}
	var ids = id.split(/[\x0d\x0a\x09\x20]+/);
	var count = 0;
	var ns = new XNodeSet();
	var doc = c.contextNode.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? c.contextNode
			: c.contextNode.ownerDocument;
	for (var i = 0; i < ids.length; i++) {
		var n;
		if (doc.getElementById) {
			n = doc.getElementById(ids[i]);
		} else {
			n = Utilities.getElementById(doc, ids[i]);
		}
		if (n != null) {
			ns.add(n);
			count++;
		}
	}
	return ns;
};

Functions.localName = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function local-name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	return new XString(n.localName ? n.localName : n.baseName);
};

Functions.namespaceURI = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function namespace-uri expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	return new XString(n.namespaceURI);
};

Functions.name = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/ || n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		return new XString(n.nodeName);
	} else if (n.localName == null) {
		return new XString("");
	} else {
		return new XString(n.localName);
	}
};

Functions.string = function() {
	var c = arguments[0];
	if (arguments.length == 1) {
		return XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		return arguments[1].evaluate(c).string();
	}
	throw new Error("Function string expects (object?)");
};

Functions.concat = function() {
	var c = arguments[0];
	if (arguments.length < 3) {
		throw new Error("Function concat expects (string, string, string*)");
	}
	var s = "";
	for (var i = 1; i < arguments.length; i++) {
		s += arguments[i].evaluate(c).stringValue();
	}
	return new XString(s);
};

Functions.startsWith = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function startsWith expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.substring(0, s2.length) == s2);
};

Functions.contains = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function contains expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.indexOf(s2) != -1);
};

Functions.substringBefore = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-before expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XString(s1.substring(0, s1.indexOf(s2)));
};

Functions.substringAfter = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-after expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	if (s2.length == 0) {
		return new XString(s1);
	}
	var i = s1.indexOf(s2);
	if (i == -1) {
		return new XString("");
	}
	return new XString(s1.substring(s1.indexOf(s2) + 1));
};

Functions.substring = function() {
	var c = arguments[0];
	if (!(arguments.length == 3 || arguments.length == 4)) {
		throw new Error("Function substring expects (string, number, number?)");
	}
	var s = arguments[1].evaluate(c).stringValue();
	var n1 = Math.round(arguments[2].evaluate(c).numberValue()) - 1;
	var n2 = arguments.length == 4 ? n1 + Math.round(arguments[3].evaluate(c).numberValue()) : undefined;
	return new XString(s.substring(n1, n2));
};

Functions.stringLength = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function string-length expects (string?)");
	}
	return new XNumber(s.length);
};

Functions.normalizeSpace = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function normalize-space expects (string?)");
	}
	var i = 0;
	var j = s.length - 1;
	while (Utilities.isSpace(s.charCodeAt(j))) {
		j--;
	}
	var t = "";
	while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
		i++;
	}
	while (i <= j) {
		if (Utilities.isSpace(s.charCodeAt(i))) {
			t += " ";
			while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
				i++;
			}
		} else {
			t += s.charAt(i);
			i++;
		}
	}
	return new XString(t);
};

Functions.translate = function() {
	var c = arguments[0];
	if (arguments.length != 4) {
		throw new Error("Function translate expects (string, string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	var s3 = arguments[3].evaluate(c).stringValue();
	var map = [];
	for (var i = 0; i < s2.length; i++) {
		var j = s2.charCodeAt(i);
		if (map[j] == undefined) {
			var k = i > s3.length ? "" : s3.charAt(i);
			map[j] = k;
		}
	}
	var t = "";
	for (var i = 0; i < s1.length; i++) {
		var c = s1.charCodeAt(i);
		var r = map[c];
		if (r == undefined) {
			t += s1.charAt(i);
		} else {
			t += r;
		}
	}
	return new XString(t);
};

Functions.boolean_ = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function boolean expects (object)");
	}
	return arguments[1].evaluate(c).bool();
};

Functions.not = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function not expects (object)");
	}
	return arguments[1].evaluate(c).bool().not();
};

Functions.true_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function true expects ()");
	}
	return new XBoolean(true);
};

Functions.false_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function false expects ()");
	}
	return new XBoolean(false);
};

Functions.lang = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function lang expects (string)");
	}
	var lang;
	for (var n = c.contextNode; n != null && n.nodeType != 9 /*Node.DOCUMENT_NODE*/; n = n.parentNode) {
		var a = n.getAttributeNS(XPath.XML_NAMESPACE_URI, "lang");
		if (a != null) {
			lang = String(a);
			break;
		}
	}
	if (lang == null) {
		return new XBoolean(false);
	}
	var s = arguments[1].evaluate(c).stringValue();
	return new XBoolean(lang.substring(0, s.length) == s
				&& (lang.length == s.length || lang.charAt(s.length) == '-'));
};

Functions.number = function() {
	var c = arguments[0];
	if (!(arguments.length == 1 || arguments.length == 2)) {
		throw new Error("Function number expects (object?)");
	}
	if (arguments.length == 1) {
		return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
	}
	return arguments[1].evaluate(c).number();
};

Functions.sum = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of((ns = arguments[1].evaluate(c)), XNodeSet)) {
		throw new Error("Function sum expects (node-set)");
	}
	ns = ns.toArray();
	var n = 0;
	for (var i = 0; i < ns.length; i++) {
		n += new XNumber(XNodeSet.prototype.stringForNode(ns[i])).numberValue();
	}
	return new XNumber(n);
};

Functions.floor = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function floor expects (number)");
	}
	return new XNumber(Math.floor(arguments[1].evaluate(c).numberValue()));
};

Functions.ceiling = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function ceiling expects (number)");
	}
	return new XNumber(Math.ceil(arguments[1].evaluate(c).numberValue()));
};

Functions.round = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function round expects (number)");
	}
	return new XNumber(Math.round(arguments[1].evaluate(c).numberValue()));
};

// Utilities /////////////////////////////////////////////////////////////////

Utilities = new Object();

Utilities.splitQName = function(qn) {
	var i = qn.indexOf(":");
	if (i == -1) {
		return [ null, qn ];
	}
	return [ qn.substring(0, i), qn.substring(i + 1) ];
};

Utilities.resolveQName = function(qn, nr, n, useDefault) {
	var parts = Utilities.splitQName(qn);
	if (parts[0] != null) {
		parts[0] = nr.getNamespace(parts[0], n);
	} else {
		if (useDefault) {
			parts[0] = nr.getNamespace("", n);
			if (parts[0] == null) {
				parts[0] = "";
			}
		} else {
			parts[0] = "";
		}
	}
	return parts;
};

Utilities.isSpace = function(c) {
	return c == 0x9 || c == 0xd || c == 0xa || c == 0x20;
};

Utilities.isLetter = function(c) {
	return c >= 0x0041 && c <= 0x005A ||
		c >= 0x0061 && c <= 0x007A ||
		c >= 0x00C0 && c <= 0x00D6 ||
		c >= 0x00D8 && c <= 0x00F6 ||
		c >= 0x00F8 && c <= 0x00FF ||
		c >= 0x0100 && c <= 0x0131 ||
		c >= 0x0134 && c <= 0x013E ||
		c >= 0x0141 && c <= 0x0148 ||
		c >= 0x014A && c <= 0x017E ||
		c >= 0x0180 && c <= 0x01C3 ||
		c >= 0x01CD && c <= 0x01F0 ||
		c >= 0x01F4 && c <= 0x01F5 ||
		c >= 0x01FA && c <= 0x0217 ||
		c >= 0x0250 && c <= 0x02A8 ||
		c >= 0x02BB && c <= 0x02C1 ||
		c == 0x0386 ||
		c >= 0x0388 && c <= 0x038A ||
		c == 0x038C ||
		c >= 0x038E && c <= 0x03A1 ||
		c >= 0x03A3 && c <= 0x03CE ||
		c >= 0x03D0 && c <= 0x03D6 ||
		c == 0x03DA ||
		c == 0x03DC ||
		c == 0x03DE ||
		c == 0x03E0 ||
		c >= 0x03E2 && c <= 0x03F3 ||
		c >= 0x0401 && c <= 0x040C ||
		c >= 0x040E && c <= 0x044F ||
		c >= 0x0451 && c <= 0x045C ||
		c >= 0x045E && c <= 0x0481 ||
		c >= 0x0490 && c <= 0x04C4 ||
		c >= 0x04C7 && c <= 0x04C8 ||
		c >= 0x04CB && c <= 0x04CC ||
		c >= 0x04D0 && c <= 0x04EB ||
		c >= 0x04EE && c <= 0x04F5 ||
		c >= 0x04F8 && c <= 0x04F9 ||
		c >= 0x0531 && c <= 0x0556 ||
		c == 0x0559 ||
		c >= 0x0561 && c <= 0x0586 ||
		c >= 0x05D0 && c <= 0x05EA ||
		c >= 0x05F0 && c <= 0x05F2 ||
		c >= 0x0621 && c <= 0x063A ||
		c >= 0x0641 && c <= 0x064A ||
		c >= 0x0671 && c <= 0x06B7 ||
		c >= 0x06BA && c <= 0x06BE ||
		c >= 0x06C0 && c <= 0x06CE ||
		c >= 0x06D0 && c <= 0x06D3 ||
		c == 0x06D5 ||
		c >= 0x06E5 && c <= 0x06E6 ||
		c >= 0x0905 && c <= 0x0939 ||
		c == 0x093D ||
		c >= 0x0958 && c <= 0x0961 ||
		c >= 0x0985 && c <= 0x098C ||
		c >= 0x098F && c <= 0x0990 ||
		c >= 0x0993 && c <= 0x09A8 ||
		c >= 0x09AA && c <= 0x09B0 ||
		c == 0x09B2 ||
		c >= 0x09B6 && c <= 0x09B9 ||
		c >= 0x09DC && c <= 0x09DD ||
		c >= 0x09DF && c <= 0x09E1 ||
		c >= 0x09F0 && c <= 0x09F1 ||
		c >= 0x0A05 && c <= 0x0A0A ||
		c >= 0x0A0F && c <= 0x0A10 ||
		c >= 0x0A13 && c <= 0x0A28 ||
		c >= 0x0A2A && c <= 0x0A30 ||
		c >= 0x0A32 && c <= 0x0A33 ||
		c >= 0x0A35 && c <= 0x0A36 ||
		c >= 0x0A38 && c <= 0x0A39 ||
		c >= 0x0A59 && c <= 0x0A5C ||
		c == 0x0A5E ||
		c >= 0x0A72 && c <= 0x0A74 ||
		c >= 0x0A85 && c <= 0x0A8B ||
		c == 0x0A8D ||
		c >= 0x0A8F && c <= 0x0A91 ||
		c >= 0x0A93 && c <= 0x0AA8 ||
		c >= 0x0AAA && c <= 0x0AB0 ||
		c >= 0x0AB2 && c <= 0x0AB3 ||
		c >= 0x0AB5 && c <= 0x0AB9 ||
		c == 0x0ABD ||
		c == 0x0AE0 ||
		c >= 0x0B05 && c <= 0x0B0C ||
		c >= 0x0B0F && c <= 0x0B10 ||
		c >= 0x0B13 && c <= 0x0B28 ||
		c >= 0x0B2A && c <= 0x0B30 ||
		c >= 0x0B32 && c <= 0x0B33 ||
		c >= 0x0B36 && c <= 0x0B39 ||
		c == 0x0B3D ||
		c >= 0x0B5C && c <= 0x0B5D ||
		c >= 0x0B5F && c <= 0x0B61 ||
		c >= 0x0B85 && c <= 0x0B8A ||
		c >= 0x0B8E && c <= 0x0B90 ||
		c >= 0x0B92 && c <= 0x0B95 ||
		c >= 0x0B99 && c <= 0x0B9A ||
		c == 0x0B9C ||
		c >= 0x0B9E && c <= 0x0B9F ||
		c >= 0x0BA3 && c <= 0x0BA4 ||
		c >= 0x0BA8 && c <= 0x0BAA ||
		c >= 0x0BAE && c <= 0x0BB5 ||
		c >= 0x0BB7 && c <= 0x0BB9 ||
		c >= 0x0C05 && c <= 0x0C0C ||
		c >= 0x0C0E && c <= 0x0C10 ||
		c >= 0x0C12 && c <= 0x0C28 ||
		c >= 0x0C2A && c <= 0x0C33 ||
		c >= 0x0C35 && c <= 0x0C39 ||
		c >= 0x0C60 && c <= 0x0C61 ||
		c >= 0x0C85 && c <= 0x0C8C ||
		c >= 0x0C8E && c <= 0x0C90 ||
		c >= 0x0C92 && c <= 0x0CA8 ||
		c >= 0x0CAA && c <= 0x0CB3 ||
		c >= 0x0CB5 && c <= 0x0CB9 ||
		c == 0x0CDE ||
		c >= 0x0CE0 && c <= 0x0CE1 ||
		c >= 0x0D05 && c <= 0x0D0C ||
		c >= 0x0D0E && c <= 0x0D10 ||
		c >= 0x0D12 && c <= 0x0D28 ||
		c >= 0x0D2A && c <= 0x0D39 ||
		c >= 0x0D60 && c <= 0x0D61 ||
		c >= 0x0E01 && c <= 0x0E2E ||
		c == 0x0E30 ||
		c >= 0x0E32 && c <= 0x0E33 ||
		c >= 0x0E40 && c <= 0x0E45 ||
		c >= 0x0E81 && c <= 0x0E82 ||
		c == 0x0E84 ||
		c >= 0x0E87 && c <= 0x0E88 ||
		c == 0x0E8A ||
		c == 0x0E8D ||
		c >= 0x0E94 && c <= 0x0E97 ||
		c >= 0x0E99 && c <= 0x0E9F ||
		c >= 0x0EA1 && c <= 0x0EA3 ||
		c == 0x0EA5 ||
		c == 0x0EA7 ||
		c >= 0x0EAA && c <= 0x0EAB ||
		c >= 0x0EAD && c <= 0x0EAE ||
		c == 0x0EB0 ||
		c >= 0x0EB2 && c <= 0x0EB3 ||
		c == 0x0EBD ||
		c >= 0x0EC0 && c <= 0x0EC4 ||
		c >= 0x0F40 && c <= 0x0F47 ||
		c >= 0x0F49 && c <= 0x0F69 ||
		c >= 0x10A0 && c <= 0x10C5 ||
		c >= 0x10D0 && c <= 0x10F6 ||
		c == 0x1100 ||
		c >= 0x1102 && c <= 0x1103 ||
		c >= 0x1105 && c <= 0x1107 ||
		c == 0x1109 ||
		c >= 0x110B && c <= 0x110C ||
		c >= 0x110E && c <= 0x1112 ||
		c == 0x113C ||
		c == 0x113E ||
		c == 0x1140 ||
		c == 0x114C ||
		c == 0x114E ||
		c == 0x1150 ||
		c >= 0x1154 && c <= 0x1155 ||
		c == 0x1159 ||
		c >= 0x115F && c <= 0x1161 ||
		c == 0x1163 ||
		c == 0x1165 ||
		c == 0x1167 ||
		c == 0x1169 ||
		c >= 0x116D && c <= 0x116E ||
		c >= 0x1172 && c <= 0x1173 ||
		c == 0x1175 ||
		c == 0x119E ||
		c == 0x11A8 ||
		c == 0x11AB ||
		c >= 0x11AE && c <= 0x11AF ||
		c >= 0x11B7 && c <= 0x11B8 ||
		c == 0x11BA ||
		c >= 0x11BC && c <= 0x11C2 ||
		c == 0x11EB ||
		c == 0x11F0 ||
		c == 0x11F9 ||
		c >= 0x1E00 && c <= 0x1E9B ||
		c >= 0x1EA0 && c <= 0x1EF9 ||
		c >= 0x1F00 && c <= 0x1F15 ||
		c >= 0x1F18 && c <= 0x1F1D ||
		c >= 0x1F20 && c <= 0x1F45 ||
		c >= 0x1F48 && c <= 0x1F4D ||
		c >= 0x1F50 && c <= 0x1F57 ||
		c == 0x1F59 ||
		c == 0x1F5B ||
		c == 0x1F5D ||
		c >= 0x1F5F && c <= 0x1F7D ||
		c >= 0x1F80 && c <= 0x1FB4 ||
		c >= 0x1FB6 && c <= 0x1FBC ||
		c == 0x1FBE ||
		c >= 0x1FC2 && c <= 0x1FC4 ||
		c >= 0x1FC6 && c <= 0x1FCC ||
		c >= 0x1FD0 && c <= 0x1FD3 ||
		c >= 0x1FD6 && c <= 0x1FDB ||
		c >= 0x1FE0 && c <= 0x1FEC ||
		c >= 0x1FF2 && c <= 0x1FF4 ||
		c >= 0x1FF6 && c <= 0x1FFC ||
		c == 0x2126 ||
		c >= 0x212A && c <= 0x212B ||
		c == 0x212E ||
		c >= 0x2180 && c <= 0x2182 ||
		c >= 0x3041 && c <= 0x3094 ||
		c >= 0x30A1 && c <= 0x30FA ||
		c >= 0x3105 && c <= 0x312C ||
		c >= 0xAC00 && c <= 0xD7A3 ||
		c >= 0x4E00 && c <= 0x9FA5 ||
		c == 0x3007 ||
		c >= 0x3021 && c <= 0x3029;
};

Utilities.isNCNameChar = function(c) {
	return c >= 0x0030 && c <= 0x0039 
		|| c >= 0x0660 && c <= 0x0669 
		|| c >= 0x06F0 && c <= 0x06F9 
		|| c >= 0x0966 && c <= 0x096F 
		|| c >= 0x09E6 && c <= 0x09EF 
		|| c >= 0x0A66 && c <= 0x0A6F 
		|| c >= 0x0AE6 && c <= 0x0AEF 
		|| c >= 0x0B66 && c <= 0x0B6F 
		|| c >= 0x0BE7 && c <= 0x0BEF 
		|| c >= 0x0C66 && c <= 0x0C6F 
		|| c >= 0x0CE6 && c <= 0x0CEF 
		|| c >= 0x0D66 && c <= 0x0D6F 
		|| c >= 0x0E50 && c <= 0x0E59 
		|| c >= 0x0ED0 && c <= 0x0ED9 
		|| c >= 0x0F20 && c <= 0x0F29
		|| c == 0x002E
		|| c == 0x002D
		|| c == 0x005F
		|| Utilities.isLetter(c)
		|| c >= 0x0300 && c <= 0x0345 
		|| c >= 0x0360 && c <= 0x0361 
		|| c >= 0x0483 && c <= 0x0486 
		|| c >= 0x0591 && c <= 0x05A1 
		|| c >= 0x05A3 && c <= 0x05B9 
		|| c >= 0x05BB && c <= 0x05BD 
		|| c == 0x05BF 
		|| c >= 0x05C1 && c <= 0x05C2 
		|| c == 0x05C4 
		|| c >= 0x064B && c <= 0x0652 
		|| c == 0x0670 
		|| c >= 0x06D6 && c <= 0x06DC 
		|| c >= 0x06DD && c <= 0x06DF 
		|| c >= 0x06E0 && c <= 0x06E4 
		|| c >= 0x06E7 && c <= 0x06E8 
		|| c >= 0x06EA && c <= 0x06ED 
		|| c >= 0x0901 && c <= 0x0903 
		|| c == 0x093C 
		|| c >= 0x093E && c <= 0x094C 
		|| c == 0x094D 
		|| c >= 0x0951 && c <= 0x0954 
		|| c >= 0x0962 && c <= 0x0963 
		|| c >= 0x0981 && c <= 0x0983 
		|| c == 0x09BC 
		|| c == 0x09BE 
		|| c == 0x09BF 
		|| c >= 0x09C0 && c <= 0x09C4 
		|| c >= 0x09C7 && c <= 0x09C8 
		|| c >= 0x09CB && c <= 0x09CD 
		|| c == 0x09D7 
		|| c >= 0x09E2 && c <= 0x09E3 
		|| c == 0x0A02 
		|| c == 0x0A3C 
		|| c == 0x0A3E 
		|| c == 0x0A3F 
		|| c >= 0x0A40 && c <= 0x0A42 
		|| c >= 0x0A47 && c <= 0x0A48 
		|| c >= 0x0A4B && c <= 0x0A4D 
		|| c >= 0x0A70 && c <= 0x0A71 
		|| c >= 0x0A81 && c <= 0x0A83 
		|| c == 0x0ABC 
		|| c >= 0x0ABE && c <= 0x0AC5 
		|| c >= 0x0AC7 && c <= 0x0AC9 
		|| c >= 0x0ACB && c <= 0x0ACD 
		|| c >= 0x0B01 && c <= 0x0B03 
		|| c == 0x0B3C 
		|| c >= 0x0B3E && c <= 0x0B43 
		|| c >= 0x0B47 && c <= 0x0B48 
		|| c >= 0x0B4B && c <= 0x0B4D 
		|| c >= 0x0B56 && c <= 0x0B57 
		|| c >= 0x0B82 && c <= 0x0B83 
		|| c >= 0x0BBE && c <= 0x0BC2 
		|| c >= 0x0BC6 && c <= 0x0BC8 
		|| c >= 0x0BCA && c <= 0x0BCD 
		|| c == 0x0BD7 
		|| c >= 0x0C01 && c <= 0x0C03 
		|| c >= 0x0C3E && c <= 0x0C44 
		|| c >= 0x0C46 && c <= 0x0C48 
		|| c >= 0x0C4A && c <= 0x0C4D 
		|| c >= 0x0C55 && c <= 0x0C56 
		|| c >= 0x0C82 && c <= 0x0C83 
		|| c >= 0x0CBE && c <= 0x0CC4 
		|| c >= 0x0CC6 && c <= 0x0CC8 
		|| c >= 0x0CCA && c <= 0x0CCD 
		|| c >= 0x0CD5 && c <= 0x0CD6 
		|| c >= 0x0D02 && c <= 0x0D03 
		|| c >= 0x0D3E && c <= 0x0D43 
		|| c >= 0x0D46 && c <= 0x0D48 
		|| c >= 0x0D4A && c <= 0x0D4D 
		|| c == 0x0D57 
		|| c == 0x0E31 
		|| c >= 0x0E34 && c <= 0x0E3A 
		|| c >= 0x0E47 && c <= 0x0E4E 
		|| c == 0x0EB1 
		|| c >= 0x0EB4 && c <= 0x0EB9 
		|| c >= 0x0EBB && c <= 0x0EBC 
		|| c >= 0x0EC8 && c <= 0x0ECD 
		|| c >= 0x0F18 && c <= 0x0F19 
		|| c == 0x0F35 
		|| c == 0x0F37 
		|| c == 0x0F39 
		|| c == 0x0F3E 
		|| c == 0x0F3F 
		|| c >= 0x0F71 && c <= 0x0F84 
		|| c >= 0x0F86 && c <= 0x0F8B 
		|| c >= 0x0F90 && c <= 0x0F95 
		|| c == 0x0F97 
		|| c >= 0x0F99 && c <= 0x0FAD 
		|| c >= 0x0FB1 && c <= 0x0FB7 
		|| c == 0x0FB9 
		|| c >= 0x20D0 && c <= 0x20DC 
		|| c == 0x20E1 
		|| c >= 0x302A && c <= 0x302F 
		|| c == 0x3099 
		|| c == 0x309A
		|| c == 0x00B7 
		|| c == 0x02D0 
		|| c == 0x02D1 
		|| c == 0x0387 
		|| c == 0x0640 
		|| c == 0x0E46 
		|| c == 0x0EC6 
		|| c == 0x3005 
		|| c >= 0x3031 && c <= 0x3035 
		|| c >= 0x309D && c <= 0x309E 
		|| c >= 0x30FC && c <= 0x30FE;
};

Utilities.coalesceText = function(n) {
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		if (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
			var s = m.nodeValue;
			var first = m;
			m = m.nextSibling;
			while (m != null && (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/)) {
				s += m.nodeValue;
				var del = m;
				m = m.nextSibling;
				del.parentNode.removeChild(del);
			}
			if (first.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
				var p = first.parentNode;
				if (first.nextSibling == null) {
					p.removeChild(first);
					p.appendChild(p.ownerDocument.createTextNode(s));
				} else {
					var next = first.nextSibling;
					p.removeChild(first);
					p.insertBefore(p.ownerDocument.createTextNode(s), next);
				}
			} else {
				first.nodeValue = s;
			}
			if (m == null) {
				break;
			}
		} else if (m.nodeType == 1 /*Node.ELEMENT_NODE*/) {
			Utilities.coalesceText(m);
		}
	}
};

Utilities.instance_of = function(o, c) {
	while (o != null) {
		if (o.constructor === c) {
			return true;
		}
		if (o === Object) {
			return false;
		}
		o = o.constructor.superclass;
	}
	return false;
};

Utilities.getElementById = function(n, id) {
	// Note that this does not check the DTD to check for actual
	// attributes of type ID, so this may be a bit wrong.
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		if (n.getAttribute("id") == id
				|| n.getAttributeNS(null, "id") == id) {
			return n;
		}
	}
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		var res = Utilities.getElementById(m, id);
		if (res != null) {
			return res;
		}
	}
	return null;
};

// XPathException ////////////////////////////////////////////////////////////

XPathException.prototype = {};
XPathException.prototype.constructor = XPathException;
XPathException.superclass = Object.prototype;

function XPathException(c, e) {
	this.code = c;
	this.exception = e;
}

XPathException.prototype.toString = function() {
	var msg = this.exception ? ": " + this.exception.toString() : "";
	switch (this.code) {
		case XPathException.INVALID_EXPRESSION_ERR:
			return "Invalid expression" + msg;
		case XPathException.TYPE_ERR:
			return "Type error" + msg;
	}
};

XPathException.INVALID_EXPRESSION_ERR = 51;
XPathException.TYPE_ERR = 52;

// XPathExpression ///////////////////////////////////////////////////////////

XPathExpression.prototype = {};
XPathExpression.prototype.constructor = XPathExpression;
XPathExpression.superclass = Object.prototype;

function XPathExpression(e, r, p) {
	this.xpath = p.parse(e);
	this.context = new XPathContext();
	this.context.namespaceResolver = new XPathNSResolverWrapper(r);
}

XPathExpression.prototype.evaluate = function(n, t, res) {
	this.context.expressionContextNode = n;
	var result = this.xpath.evaluate(this.context);
	return new XPathResult(result, t);
}

// XPathNSResolverWrapper ////////////////////////////////////////////////////

XPathNSResolverWrapper.prototype = {};
XPathNSResolverWrapper.prototype.constructor = XPathNSResolverWrapper;
XPathNSResolverWrapper.superclass = Object.prototype;

function XPathNSResolverWrapper(r) {
	this.xpathNSResolver = r;
}

XPathNSResolverWrapper.prototype.getNamespace = function(prefix, n) {
    if (this.xpathNSResolver == null) {
        return null;
    }
	return this.xpathNSResolver.lookupNamespaceURI(prefix);
};

// NodeXPathNSResolver ///////////////////////////////////////////////////////

NodeXPathNSResolver.prototype = {};
NodeXPathNSResolver.prototype.constructor = NodeXPathNSResolver;
NodeXPathNSResolver.superclass = Object.prototype;

function NodeXPathNSResolver(n) {
	this.node = n;
	this.namespaceResolver = new NamespaceResolver();
}

NodeXPathNSResolver.prototype.lookupNamespaceURI = function(prefix) {
	return this.namespaceResolver.getNamespace(prefix, this.node);
};

// XPathResult ///////////////////////////////////////////////////////////////

XPathResult.prototype = {};
XPathResult.prototype.constructor = XPathResult;
XPathResult.superclass = Object.prototype;

function XPathResult(v, t) {
	if (t == XPathResult.ANY_TYPE) {
		if (v.constructor === XString) {
			t = XPathResult.STRING_TYPE;
		} else if (v.constructor === XNumber) {
			t = XPathResult.NUMBER_TYPE;
		} else if (v.constructor === XBoolean) {
			t = XPathResult.BOOLEAN_TYPE;
		} else if (v.constructor === XNodeSet) {
			t = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
		}
	}
	this.resultType = t;
	switch (t) {
		case XPathResult.NUMBER_TYPE:
			this.numberValue = v.numberValue();
			return;
		case XPathResult.STRING_TYPE:
			this.stringValue = v.stringValue();
			return;
		case XPathResult.BOOLEAN_TYPE:
			this.booleanValue = v.booleanValue();
			return;
		case XPathResult.ANY_UNORDERED_NODE_TYPE:
		case XPathResult.FIRST_ORDERED_NODE_TYPE:
			if (v.constructor === XNodeSet) {
				this.singleNodeValue = v.first();
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
		case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			if (v.constructor === XNodeSet) {
				this.invalidIteratorState = false;
				this.nodes = v.toArray();
				this.iteratorIndex = 0;
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
		case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			if (v.constructor === XNodeSet) {
				this.nodes = v.toArray();
				this.snapshotLength = this.nodes.length;
				return;
			}
			break;
	}
	throw new XPathException(XPathException.TYPE_ERR);
};

XPathResult.prototype.iterateNext = function() {
	if (this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[this.iteratorIndex++];
};

XPathResult.prototype.snapshotItem = function(i) {
	if (this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[i];
};

XPathResult.ANY_TYPE = 0;
XPathResult.NUMBER_TYPE = 1;
XPathResult.STRING_TYPE = 2;
XPathResult.BOOLEAN_TYPE = 3;
XPathResult.UNORDERED_NODE_ITERATOR_TYPE = 4;
XPathResult.ORDERED_NODE_ITERATOR_TYPE = 5;
XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7;
XPathResult.ANY_UNORDERED_NODE_TYPE = 8;
XPathResult.FIRST_ORDERED_NODE_TYPE = 9;

// DOM 3 XPath support ///////////////////////////////////////////////////////

function installDOM3XPathSupport(doc, p) {
	doc.createExpression = function(e, r) {
		try {
			return new XPathExpression(e, r, p);
		} catch (e) {
			throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e);
		}
	};
	doc.createNSResolver = function(n) {
		return new NodeXPathNSResolver(n);
	};
	doc.evaluate = function(e, cn, r, t, res) {
		if (t < 0 || t > 9) {
			throw { code: 0, toString: function() { return "Request type not supported"; } };
		}
        return doc.createExpression(e, r, p).evaluate(cn, t, res);
	};
};

// ---------------------------------------------------------------------------

// Install DOM 3 XPath support for the current document.
try {
	var shouldInstall = true;
	try {
		if (document.implementation
				&& document.implementation.hasFeature
				&& document.implementation.hasFeature("XPath", null)) {
			shouldInstall = false;
		}
	} catch (e) {
	}
	if (shouldInstall) {
		installDOM3XPathSupport(document, new XPathParser());
	}
} catch (e) {
}

// ---------------------------------------------------------------------------
// exports for node.js

installDOM3XPathSupport(exports, new XPathParser());

exports.XPathResult = XPathResult;

// helper
exports.select = function(e, doc, single) {
	return exports.selectWithResolver(e, doc, null, single);
};

exports.useNamespaces = function(mappings) {
	var resolver = {
		mappings: mappings || {},
		lookupNamespaceURI: function(prefix) {
			return this.mappings[prefix];
		}
	}

	return function(e, doc, single) {
		return exports.selectWithResolver(e, doc, resolver, single);
	};
};

exports.selectWithResolver = function(e, doc, resolver, single) {
	var expression = new XPathExpression(e, resolver, new XPathParser());
	var type = XPathResult.ANY_TYPE;

	var result = expression.evaluate(doc, type, null);

	if (result.resultType == XPathResult.STRING_TYPE) {
		result = result.stringValue;
	}
	else if (result.resultType == XPathResult.NUMBER_TYPE) {
		result = result.numberValue;
	}
	else if (result.resultType == XPathResult.BOOLEAN_TYPE) {
		result = result.booleanValue;
	}
	else {
		result = result.nodes;
		if (single) {
			result = result[0];
		}
	}

	return result;
};

exports.select1 = function(e, doc) {
	return exports.select(e, doc, true);
};

},{}]},{},[1])(1)
});
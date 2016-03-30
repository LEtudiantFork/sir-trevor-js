(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scribeBuild = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (root, factory) {
  if (false) {
    define('html-janitor', factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.HTMLJanitor = factory();
  }
}(this, function () {

  /**
   * @param {Object} config.tags Dictionary of allowed tags.
   * @param {boolean} config.keepNestedBlockElements Default false.
   */
  function HTMLJanitor(config) {

    var tagDefinitions = config['tags'];
    var tags = Object.keys(tagDefinitions);

    var validConfigValues = tags
      .map(function(k) { return typeof tagDefinitions[k]; })
      .every(function(type) { return type === 'object' || type === 'boolean' || type === 'function'; });

    if(!validConfigValues) {
      throw new Error("The configuration was invalid");
    }

    this.config = config;
  }

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'TD', 'TH', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE'];
  function isBlockElement(node) {
    return blockElementNames.indexOf(node.nodeName) !== -1;
  }

  var inlineElementNames = ['A', 'B', 'STRONG', 'I', 'EM', 'SUB', 'SUP', 'U', 'STRIKE'];
  function isInlineElement(node) {
    return inlineElementNames.indexOf(node.nodeName) !== -1;
  }

  HTMLJanitor.prototype.clean = function (html) {
    var sandbox = document.createElement('div');
    sandbox.innerHTML = html;

    this._sanitize(sandbox);

    return sandbox.innerHTML;
  };

  HTMLJanitor.prototype._sanitize = function (parentNode) {
    var treeWalker = createTreeWalker(parentNode);
    var node = treeWalker.firstChild();
    if (!node) { return; }

    do {
      // Ignore nodes that have already been sanitized
      if (node._sanitized) {
        continue;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        // If this text node is just whitespace and the previous or next element
        // sibling is a block element, remove it
        // N.B.: This heuristic could change. Very specific to a bug with
        // `contenteditable` in Firefox: http://jsbin.com/EyuKase/1/edit?js,output
        // FIXME: make this an option?
        if (node.data.trim() === ''
            && ((node.previousElementSibling && isBlockElement(node.previousElementSibling))
                 || (node.nextElementSibling && isBlockElement(node.nextElementSibling)))) {
          parentNode.removeChild(node);
          this._sanitize(parentNode);
          break;
        } else {
          continue;
        }
      }

      // Remove all comments
      if (node.nodeType === Node.COMMENT_NODE) {
        parentNode.removeChild(node);
        this._sanitize(parentNode);
        break;
      }

      var isInline = isInlineElement(node);
      var containsBlockElement;
      if (isInline) {
        containsBlockElement = Array.prototype.some.call(node.childNodes, isBlockElement);
      }

      // Block elements should not be nested (e.g. <li><p>...); if
      // they are, we want to unwrap the inner block element.
      var isNotTopContainer = !! parentNode.parentNode;
      var isNestedBlockElement =
            isBlockElement(parentNode) &&
            isBlockElement(node) &&
            isNotTopContainer;

      var nodeName = node.nodeName.toLowerCase();

      var allowedAttrs = getAllowedAttrs(this.config, nodeName, node);

      var isInvalid = isInline && containsBlockElement;

      // Drop tag entirely according to the whitelist *and* if the markup
      // is invalid.
      if (isInvalid || shouldRejectNode(node, allowedAttrs)
          || (!this.config.keepNestedBlockElements && isNestedBlockElement)) {
        // Do not keep the inner text of SCRIPT/STYLE elements.
        if (! (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE')) {
          while (node.childNodes.length > 0) {
            parentNode.insertBefore(node.childNodes[0], node);
          }
        }
        parentNode.removeChild(node);

        this._sanitize(parentNode);
        break;
      }

      // Sanitize attributes
      for (var a = 0; a < node.attributes.length; a += 1) {
        var attr = node.attributes[a];

        if (shouldRejectAttr(attr, allowedAttrs, node)) {
          node.removeAttribute(attr.name);
          // Shift the array to continue looping.
          a = a - 1;
        }
      }

      // Sanitize children
      this._sanitize(node);

      // Mark node as sanitized so it's ignored in future runs
      node._sanitized = true;
    } while ((node = treeWalker.nextSibling()));
  };

  function createTreeWalker(node) {
    return document.createTreeWalker(node,
                                     NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT,
                                     null, false);
  }

  function getAllowedAttrs(config, nodeName, node){
    if (typeof config.tags[nodeName] === 'function') {
      return config.tags[nodeName](node);
    } else {
      return config.tags[nodeName];
    }
  }

  function shouldRejectNode(node, allowedAttrs){
    if (typeof allowedAttrs === 'undefined') {
      return true;
    } else if (typeof allowedAttrs === 'boolean') {
      return !allowedAttrs;
    }

    return false;
  }

  function shouldRejectAttr(attr, allowedAttrs, node){
    var attrName = attr.name.toLowerCase();

    if (allowedAttrs === true){
      return false;
    } else if (typeof allowedAttrs[attrName] === 'function'){
      return !allowedAttrs[attrName](attr.value, node);
    } else if (typeof allowedAttrs[attrName] === 'undefined'){
      return true;
    } else if (allowedAttrs[attrName] === false) {
      return true;
    } else if (typeof allowedAttrs[attrName] === 'string') {
      return (allowedAttrs[attrName] !== attr.value);
    }

    return false;
  }

  return HTMLJanitor;

}));

},{}],2:[function(_dereq_,module,exports){
/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.Immutable = factory();
}(this, function () { 'use strict';var SLICE$0 = Array.prototype.slice;

  function createClass(ctor, superClass) {
    if (superClass) {
      ctor.prototype = Object.create(superClass.prototype);
    }
    ctor.prototype.constructor = ctor;
  }

  function Iterable(value) {
      return isIterable(value) ? value : Seq(value);
    }


  createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }


  createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }


  createClass(SetIterable, Iterable);
    function SetIterable(value) {
      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }



  function isIterable(maybeIterable) {
    return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
  }

  function isKeyed(maybeKeyed) {
    return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
  }

  function isIndexed(maybeIndexed) {
    return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  function isOrdered(maybeOrdered) {
    return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
  }

  Iterable.isIterable = isIterable;
  Iterable.isKeyed = isKeyed;
  Iterable.isIndexed = isIndexed;
  Iterable.isAssociative = isAssociative;
  Iterable.isOrdered = isOrdered;

  Iterable.Keyed = KeyedIterable;
  Iterable.Indexed = IndexedIterable;
  Iterable.Set = SetIterable;


  var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  // Used for setting prototype methods that IE8 chokes on.
  var DELETE = 'delete';

  // Constants describing the size of trie nodes.
  var SHIFT = 5; // Resulted in best performance after ______?
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  // A consistent shared value representing "not set" which equals nothing other
  // than itself, and nothing that could be provided externally.
  var NOT_SET = {};

  // Boolean references, Rough equivalent of `bool &`.
  var CHANGE_LENGTH = { value: false };
  var DID_ALTER = { value: false };

  function MakeRef(ref) {
    ref.value = false;
    return ref;
  }

  function SetRef(ref) {
    ref && (ref.value = true);
  }

  // A function which returns a value representing an "owner" for transient writes
  // to tries. The return value will only ever equal itself, and will not equal
  // the return of any subsequent call of this function.
  function OwnerID() {}

  // http://jsperf.com/copy-array-inline
  function arrCopy(arr, offset) {
    offset = offset || 0;
    var len = Math.max(0, arr.length - offset);
    var newArr = new Array(len);
    for (var ii = 0; ii < len; ii++) {
      newArr[ii] = arr[ii + offset];
    }
    return newArr;
  }

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    // This implements "is array index" which the ECMAString spec defines as:
    //
    //     A String property name P is an array index if and only if
    //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
    //     to 2^32−1.
    //
    // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
    if (typeof index !== 'number') {
      var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
      if ('' + uint32Index !== index || uint32Index === 4294967295) {
        return NaN;
      }
      index = uint32Index;
    }
    return index < 0 ? ensureSize(iter) + index : index;
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return (begin === 0 || (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined ?
      defaultIndex :
      index < 0 ?
        Math.max(0, size + index) :
        size === undefined ?
          index :
          Math.min(size, index);
  }

  /* global Symbol */

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


  function Iterator(next) {
      this.next = next;
    }

    Iterator.prototype.toString = function() {
      return '[Iterator]';
    };


  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect =
  Iterator.prototype.toSource = function () { return this.toString(); }
  Iterator.prototype[ITERATOR_SYMBOL] = function () {
    return this;
  };


  function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
      value: value, done: false
    });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn = iterable && (
      (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]
    );
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  function isArrayLike(value) {
    return value && typeof value.length === 'number';
  }

  createClass(Seq, Iterable);
    function Seq(value) {
      return value === null || value === undefined ? emptySequence() :
        isIterable(value) ? value.toSeq() : seqFromValue(value);
    }

    Seq.of = function(/*...values*/) {
      return Seq(arguments);
    };

    Seq.prototype.toSeq = function() {
      return this;
    };

    Seq.prototype.toString = function() {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, true);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, true);
    };



  createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
      return value === null || value === undefined ?
        emptySequence().toKeyedSeq() :
        isIterable(value) ?
          (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
          keyedSeqFromValue(value);
    }

    KeyedSeq.prototype.toKeyedSeq = function() {
      return this;
    };



  createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
      return value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }

    IndexedSeq.of = function(/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function() {
      return this;
    };

    IndexedSeq.prototype.toString = function() {
      return this.__toString('Seq [', ']');
    };

    IndexedSeq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, false);
    };

    IndexedSeq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, false);
    };



  createClass(SetSeq, Seq);
    function SetSeq(value) {
      return (
        value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value
      ).toSetSeq();
    }

    SetSeq.of = function(/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function() {
      return this;
    };



  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

  Seq.prototype[IS_SEQ_SENTINEL] = true;



  createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }

    ArraySeq.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function(fn, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ArraySeq.prototype.__iterator = function(type, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      var ii = 0;
      return new Iterator(function() 
        {return ii > maxIndex ?
          iteratorDone() :
          iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])}
      );
    };



  createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }

    ObjectSeq.prototype.get = function(key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function(key) {
      return this._object.hasOwnProperty(key);
    };

    ObjectSeq.prototype.__iterate = function(fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var key = keys[reverse ? maxIndex - ii : ii];
        if (fn(object[key], key, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ObjectSeq.prototype.__iterator = function(type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var key = keys[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, key, object[key]);
      });
    };

  ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
      this._iterable = iterable;
      this.size = iterable.length || iterable.size;
    }

    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };



  createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
      this._iterator = iterator;
      this._iteratorCache = [];
    }

    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      while (iterations < cache.length) {
        if (fn(cache[iterations], iterations++, this) === false) {
          return iterations;
        }
      }
      var step;
      while (!(step = iterator.next()).done) {
        var val = step.value;
        cache[iterations] = val;
        if (fn(val, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };

    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      return new Iterator(function()  {
        if (iterations >= cache.length) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          cache[iterations] = step.value;
        }
        return iteratorValue(type, iterations, cache[iterations++]);
      });
    };




  // # pragma Helper functions

  function isSeq(maybeSeq) {
    return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
  }

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq =
      Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
      isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
      hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
      typeof value === 'object' ? new ObjectSeq(value) :
      undefined;
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of [k, v] entries, '+
        'or keyed object: ' + value
      );
    }
    return seq;
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values: ' + value
      );
    }
    return seq;
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value) ||
      (typeof value === 'object' && new ObjectSeq(value));
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values, or keyed object: ' + value
      );
    }
    return seq;
  }

  function maybeIndexedSeqFromValue(value) {
    return (
      isArrayLike(value) ? new ArraySeq(value) :
      isIterator(value) ? new IteratorSeq(value) :
      hasIterator(value) ? new IterableSeq(value) :
      undefined
    );
  }

  function seqIterate(seq, fn, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var entry = cache[reverse ? maxIndex - ii : ii];
        if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
          return ii + 1;
        }
      }
      return ii;
    }
    return seq.__iterateUncached(fn, reverse);
  }

  function seqIterator(seq, type, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var entry = cache[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
      });
    }
    return seq.__iteratorUncached(type, reverse);
  }

  function fromJS(json, converter) {
    return converter ?
      fromJSWith(converter, json, '', {'': json}) :
      fromJSDefault(json);
  }

  function fromJSWith(converter, json, key, parentJSON) {
    if (Array.isArray(json)) {
      return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    if (isPlainObj(json)) {
      return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    return json;
  }

  function fromJSDefault(json) {
    if (Array.isArray(json)) {
      return IndexedSeq(json).map(fromJSDefault).toList();
    }
    if (isPlainObj(json)) {
      return KeyedSeq(json).map(fromJSDefault).toMap();
    }
    return json;
  }

  function isPlainObj(value) {
    return value && (value.constructor === Object || value.constructor === undefined);
  }

  /**
   * An extension of the "same-value" algorithm as [described for use by ES6 Map
   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
   *
   * NaN is considered the same as NaN, however -0 and 0 are considered the same
   * value, which is different from the algorithm described by
   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   *
   * This is extended further to allow Objects to describe the values they
   * represent, by way of `valueOf` or `equals` (and `hashCode`).
   *
   * Note: because of this extension, the key equality of Immutable.Map and the
   * value equality of Immutable.Set will differ from ES6 Map and Set.
   *
   * ### Defining custom values
   *
   * The easiest way to describe the value an object represents is by implementing
   * `valueOf`. For example, `Date` represents a value by returning a unix
   * timestamp for `valueOf`:
   *
   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
   *     var date2 = new Date(1234567890000);
   *     date1.valueOf(); // 1234567890000
   *     assert( date1 !== date2 );
   *     assert( Immutable.is( date1, date2 ) );
   *
   * Note: overriding `valueOf` may have other implications if you use this object
   * where JavaScript expects a primitive, such as implicit string coercion.
   *
   * For more complex types, especially collections, implementing `valueOf` may
   * not be performant. An alternative is to implement `equals` and `hashCode`.
   *
   * `equals` takes another object, presumably of similar type, and returns true
   * if the it is equal. Equality is symmetrical, so the same result should be
   * returned if this and the argument are flipped.
   *
   *     assert( a.equals(b) === b.equals(a) );
   *
   * `hashCode` returns a 32bit integer number representing the object which will
   * be used to determine how to store the value object in a Map or Set. You must
   * provide both or neither methods, one must not exist without the other.
   *
   * Also, an important relationship between these methods must be upheld: if two
   * values are equal, they *must* return the same hashCode. If the values are not
   * equal, they might have the same hashCode; this is called a hash collision,
   * and while undesirable for performance reasons, it is acceptable.
   *
   *     if (a.equals(b)) {
   *       assert( a.hashCode() === b.hashCode() );
   *     }
   *
   * All Immutable collections implement `equals` and `hashCode`.
   *
   */
  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
    if (typeof valueA.valueOf === 'function' &&
        typeof valueB.valueOf === 'function') {
      valueA = valueA.valueOf();
      valueB = valueB.valueOf();
      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
        return true;
      }
      if (!valueA || !valueB) {
        return false;
      }
    }
    if (typeof valueA.equals === 'function' &&
        typeof valueB.equals === 'function' &&
        valueA.equals(valueB)) {
      return true;
    }
    return false;
  }

  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (
      !isIterable(b) ||
      a.size !== undefined && b.size !== undefined && a.size !== b.size ||
      a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
      isKeyed(a) !== isKeyed(b) ||
      isIndexed(a) !== isIndexed(b) ||
      isOrdered(a) !== isOrdered(b)
    ) {
      return false;
    }

    if (a.size === 0 && b.size === 0) {
      return true;
    }

    var notAssociative = !isAssociative(a);

    if (isOrdered(a)) {
      var entries = a.entries();
      return b.every(function(v, k)  {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done;
    }

    var flipped = false;

    if (a.size === undefined) {
      if (b.size === undefined) {
        if (typeof a.cacheResult === 'function') {
          a.cacheResult();
        }
      } else {
        flipped = true;
        var _ = a;
        a = b;
        b = _;
      }
    }

    var allEqual = true;
    var bSize = b.__iterate(function(v, k)  {
      if (notAssociative ? !a.has(v) :
          flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
        allEqual = false;
        return false;
      }
    });

    return allEqual && a.size === bSize;
  }

  createClass(Repeat, IndexedSeq);

    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }

    Repeat.prototype.toString = function() {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.includes = function(searchValue) {
      return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function(begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size) ? this :
        new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };

    Repeat.prototype.reverse = function() {
      return this;
    };

    Repeat.prototype.indexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };

    Repeat.prototype.lastIndexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };

    Repeat.prototype.__iterate = function(fn, reverse) {
      for (var ii = 0; ii < this.size; ii++) {
        if (fn(this._value, ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    Repeat.prototype.__iterator = function(type, reverse) {var this$0 = this;
      var ii = 0;
      return new Iterator(function() 
        {return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone()}
      );
    };

    Repeat.prototype.equals = function(other) {
      return other instanceof Repeat ?
        is(this._value, other._value) :
        deepEqual(other);
    };


  var EMPTY_REPEAT;

  function invariant(condition, error) {
    if (!condition) throw new Error(error);
  }

  createClass(Range, IndexedSeq);

    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }

    Range.prototype.toString = function() {
      if (this.size === 0) {
        return 'Range []';
      }
      return 'Range [ ' +
        this._start + '...' + this._end +
        (this._step > 1 ? ' by ' + this._step : '') +
      ' ]';
    };

    Range.prototype.get = function(index, notSetValue) {
      return this.has(index) ?
        this._start + wrapIndex(this, index) * this._step :
        notSetValue;
    };

    Range.prototype.includes = function(searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return possibleIndex >= 0 &&
        possibleIndex < this.size &&
        possibleIndex === Math.floor(possibleIndex);
    };

    Range.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };

    Range.prototype.indexOf = function(searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index
        }
      }
      return -1;
    };

    Range.prototype.lastIndexOf = function(searchValue) {
      return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function(fn, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(value, ii, this) === false) {
          return ii + 1;
        }
        value += reverse ? -step : step;
      }
      return ii;
    };

    Range.prototype.__iterator = function(type, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      var ii = 0;
      return new Iterator(function()  {
        var v = value;
        value += reverse ? -step : step;
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
      });
    };

    Range.prototype.equals = function(other) {
      return other instanceof Range ?
        this._start === other._start &&
        this._end === other._end &&
        this._step === other._step :
        deepEqual(this, other);
    };


  var EMPTY_RANGE;

  createClass(Collection, Iterable);
    function Collection() {
      throw TypeError('Abstract');
    }


  createClass(KeyedCollection, Collection);function KeyedCollection() {}

  createClass(IndexedCollection, Collection);function IndexedCollection() {}

  createClass(SetCollection, Collection);function SetCollection() {}


  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  var imul =
    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
    Math.imul :
    function imul(a, b) {
      a = a | 0; // int
      b = b | 0; // int
      var c = a & 0xffff;
      var d = b & 0xffff;
      // Shift by 0 fixes the sign on the high part.
      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
    };

  // v8 has an optimization for storing 31-bit signed numbers.
  // Values which have either 00 or 11 as the high order bits qualify.
  // This function drops the highest order bit in a signed number, maintaining
  // the sign bit.
  function smi(i32) {
    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
  }

  function hash(o) {
    if (o === false || o === null || o === undefined) {
      return 0;
    }
    if (typeof o.valueOf === 'function') {
      o = o.valueOf();
      if (o === false || o === null || o === undefined) {
        return 0;
      }
    }
    if (o === true) {
      return 1;
    }
    var type = typeof o;
    if (type === 'number') {
      var h = o | 0;
      if (h !== o) {
        h ^= o * 0xFFFFFFFF;
      }
      while (o > 0xFFFFFFFF) {
        o /= 0xFFFFFFFF;
        h ^= o;
      }
      return smi(h);
    }
    if (type === 'string') {
      return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
    }
    if (typeof o.hashCode === 'function') {
      return o.hashCode();
    }
    if (type === 'object') {
      return hashJSObj(o);
    }
    if (typeof o.toString === 'function') {
      return hashString(o.toString());
    }
    throw new Error('Value type ' + type + ' cannot be hashed.');
  }

  function cachedHashString(string) {
    var hash = stringHashCache[string];
    if (hash === undefined) {
      hash = hashString(string);
      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
        STRING_HASH_CACHE_SIZE = 0;
        stringHashCache = {};
      }
      STRING_HASH_CACHE_SIZE++;
      stringHashCache[string] = hash;
    }
    return hash;
  }

  // http://jsperf.com/hashing-strings
  function hashString(string) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
    // (exclusive) by dropping high bits.
    var hash = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hash = 31 * hash + string.charCodeAt(ii) | 0;
    }
    return smi(hash);
  }

  function hashJSObj(obj) {
    var hash;
    if (usingWeakMap) {
      hash = weakMap.get(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = obj[UID_HASH_KEY];
    if (hash !== undefined) {
      return hash;
    }

    if (!canDefineProperty) {
      hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
      if (hash !== undefined) {
        return hash;
      }

      hash = getIENodeHash(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = ++objHashUID;
    if (objHashUID & 0x40000000) {
      objHashUID = 0;
    }

    if (usingWeakMap) {
      weakMap.set(obj, hash);
    } else if (isExtensible !== undefined && isExtensible(obj) === false) {
      throw new Error('Non-extensible objects are not allowed as keys.');
    } else if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': hash
      });
    } else if (obj.propertyIsEnumerable !== undefined &&
               obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
      // Since we can't define a non-enumerable property on the object
      // we'll hijack one of the less-used non-enumerable properties to
      // save our hash on it. Since this is a function it will not show up in
      // `JSON.stringify` which is what we want.
      obj.propertyIsEnumerable = function() {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
    } else if (obj.nodeType !== undefined) {
      // At this point we couldn't get the IE `uniqueID` to use as a hash
      // and we couldn't use a non-enumerable property to exploit the
      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
      // itself.
      obj[UID_HASH_KEY] = hash;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }

    return hash;
  }

  // Get references to ES5 object methods.
  var isExtensible = Object.isExtensible;

  // True if Object.defineProperty works as expected. IE8 fails this test.
  var canDefineProperty = (function() {
    try {
      Object.defineProperty({}, '@', {});
      return true;
    } catch (e) {
      return false;
    }
  }());

  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
  // and avoid memory leaks from the IE cloneNode bug.
  function getIENodeHash(node) {
    if (node && node.nodeType > 0) {
      switch (node.nodeType) {
        case 1: // Element
          return node.uniqueID;
        case 9: // Document
          return node.documentElement && node.documentElement.uniqueID;
      }
    }
  }

  // If possible, use a WeakMap.
  var usingWeakMap = typeof WeakMap === 'function';
  var weakMap;
  if (usingWeakMap) {
    weakMap = new WeakMap();
  }

  var objHashUID = 0;

  var UID_HASH_KEY = '__immutablehash__';
  if (typeof Symbol === 'function') {
    UID_HASH_KEY = Symbol(UID_HASH_KEY);
  }

  var STRING_HASH_CACHE_MIN_STRLEN = 16;
  var STRING_HASH_CACHE_MAX_SIZE = 255;
  var STRING_HASH_CACHE_SIZE = 0;
  var stringHashCache = {};

  function assertNotInfinite(size) {
    invariant(
      size !== Infinity,
      'Cannot perform this action with an infinite size.'
    );
  }

  createClass(Map, KeyedCollection);

    // @pragma Construction

    function Map(value) {
      return value === null || value === undefined ? emptyMap() :
        isMap(value) && !isOrdered(value) ? value :
        emptyMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    Map.prototype.toString = function() {
      return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function(k, notSetValue) {
      return this._root ?
        this._root.get(0, undefined, k, notSetValue) :
        notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function(k, v) {
      return updateMap(this, k, v);
    };

    Map.prototype.setIn = function(keyPath, v) {
      return this.updateIn(keyPath, NOT_SET, function()  {return v});
    };

    Map.prototype.remove = function(k) {
      return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteIn = function(keyPath) {
      return this.updateIn(keyPath, function()  {return NOT_SET});
    };

    Map.prototype.update = function(k, notSetValue, updater) {
      return arguments.length === 1 ?
        k(this) :
        this.updateIn([k], notSetValue, updater);
    };

    Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
      if (!updater) {
        updater = notSetValue;
        notSetValue = undefined;
      }
      var updatedValue = updateInDeepMap(
        this,
        forceIterator(keyPath),
        notSetValue,
        updater
      );
      return updatedValue === NOT_SET ? undefined : updatedValue;
    };

    Map.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };

    // @pragma Composition

    Map.prototype.merge = function(/*...iters*/) {
      return mergeIntoMapWith(this, undefined, arguments);
    };

    Map.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, merger, iters);
    };

    Map.prototype.mergeIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.merge === 'function' ?
          m.merge.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoMapWith(this, deepMerger, arguments);
    };

    Map.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, deepMergerWith(merger), iters);
    };

    Map.prototype.mergeDeepIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.mergeDeep === 'function' ?
          m.mergeDeep.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.sort = function(comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator, mapper));
    };

    // @pragma Mutability

    Map.prototype.withMutations = function(fn) {
      var mutable = this.asMutable();
      fn(mutable);
      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };

    Map.prototype.asMutable = function() {
      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };

    Map.prototype.asImmutable = function() {
      return this.__ensureOwner();
    };

    Map.prototype.wasAltered = function() {
      return this.__altered;
    };

    Map.prototype.__iterator = function(type, reverse) {
      return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      this._root && this._root.iterate(function(entry ) {
        iterations++;
        return fn(entry[1], entry[0], this$0);
      }, reverse);
      return iterations;
    };

    Map.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };


  function isMap(maybeMap) {
    return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
  }

  Map.isMap = isMap;

  var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

  var MapPrototype = Map.prototype;
  MapPrototype[IS_MAP_SENTINEL] = true;
  MapPrototype[DELETE] = MapPrototype.remove;
  MapPrototype.removeIn = MapPrototype.deleteIn;


  // #pragma Trie Nodes



    function ArrayMapNode(ownerID, entries) {
      this.ownerID = ownerID;
      this.entries = entries;
    }

    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && entries.length === 1) {
        return; // undefined
      }

      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries, key, value);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new ArrayMapNode(ownerID, newEntries);
    };




    function BitmapIndexedNode(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    }

    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue :
        this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };

    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;

      if (!exists && value === NOT_SET) {
        return this;
      }

      var idx = popCount(bitmap & (bit - 1));
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : undefined;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

      if (newNode === node) {
        return this;
      }

      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }

      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }

      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ?
        setIn(nodes, idx, newNode, isEditable) :
        spliceOut(nodes, idx, isEditable) :
        spliceIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }

      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };




    function HashArrayMapNode(ownerID, count, nodes) {
      this.ownerID = ownerID;
      this.count = count;
      this.nodes = nodes;
    }

    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };

    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];

      if (removed && !node) {
        return this;
      }

      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }

      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }

      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };




    function HashCollisionNode(ownerID, keyHash, entries) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries;
    }

    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }

      var removed = value === NOT_SET;

      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
      }

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && len === 2) {
        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };




    function ValueNode(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    }

    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };

    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }

      SetRef(didAlter);

      if (removed) {
        SetRef(didChangeSize);
        return; // undefined
      }

      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [key, value]);
      }

      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };



  // #pragma Iterators

  ArrayMapNode.prototype.iterate =
  HashCollisionNode.prototype.iterate = function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }

  BitmapIndexedNode.prototype.iterate =
  HashArrayMapNode.prototype.iterate = function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }

  ValueNode.prototype.iterate = function (fn, reverse) {
    return fn(this.entry);
  }

  createClass(MapIterator, Iterator);

    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }

    MapIterator.prototype.next = function() {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex;
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
          }
        } else {
          maxIndex = node.nodes.length - 1;
          if (index <= maxIndex) {
            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
            if (subNode) {
              if (subNode.entry) {
                return mapIteratorValue(type, subNode.entry);
              }
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          }
        }
        stack = this._stack = this._stack.__prev;
      }
      return iteratorDone();
    };


  function mapIteratorValue(type, entry) {
    return iteratorValue(type, entry[0], entry[1]);
  }

  function mapIteratorFrame(node, prev) {
    return {
      node: node,
      index: 0,
      __prev: prev
    };
  }

  function makeMap(size, root, ownerID, hash) {
    var map = Object.create(MapPrototype);
    map.size = size;
    map._root = root;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_MAP;
  function emptyMap() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  function updateMap(map, k, v) {
    var newRoot;
    var newSize;
    if (!map._root) {
      if (v === NOT_SET) {
        return map;
      }
      newSize = 1;
      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
    } else {
      var didChangeSize = MakeRef(CHANGE_LENGTH);
      var didAlter = MakeRef(DID_ALTER);
      newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
      if (!didAlter.value) {
        return map;
      }
      newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
    }
    if (map.__ownerID) {
      map.size = newSize;
      map._root = newRoot;
      map.__hash = undefined;
      map.__altered = true;
      return map;
    }
    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
  }

  function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (!node) {
      if (value === NOT_SET) {
        return node;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return new ValueNode(ownerID, keyHash, [key, value]);
    }
    return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
  }

  function isLeafNode(node) {
    return node.constructor === ValueNode || node.constructor === HashCollisionNode;
  }

  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
    if (node.keyHash === keyHash) {
      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
    }

    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

    var newNode;
    var nodes = idx1 === idx2 ?
      [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
      ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
  }

  function createNodes(ownerID, entries, key, value) {
    if (!ownerID) {
      ownerID = new OwnerID();
    }
    var node = new ValueNode(ownerID, hash(key), [key, value]);
    for (var ii = 0; ii < entries.length; ii++) {
      var entry = entries[ii];
      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
    }
    return node;
  }

  function packNodes(ownerID, nodes, count, excluding) {
    var bitmap = 0;
    var packedII = 0;
    var packedNodes = new Array(count);
    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
      var node = nodes[ii];
      if (node !== undefined && ii !== excluding) {
        bitmap |= bit;
        packedNodes[packedII++] = node;
      }
    }
    return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
  }

  function expandNodes(ownerID, nodes, bitmap, including, node) {
    var count = 0;
    var expandedNodes = new Array(SIZE);
    for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
    }
    expandedNodes[including] = node;
    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
  }

  function mergeIntoMapWith(map, merger, iterables) {
    var iters = [];
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = KeyedIterable(value);
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    return mergeIntoCollectionWith(map, merger, iters);
  }

  function deepMerger(existing, value, key) {
    return existing && existing.mergeDeep && isIterable(value) ?
      existing.mergeDeep(value) :
      is(existing, value) ? existing : value;
  }

  function deepMergerWith(merger) {
    return function(existing, value, key)  {
      if (existing && existing.mergeDeepWith && isIterable(value)) {
        return existing.mergeDeepWith(merger, value);
      }
      var nextValue = merger(existing, value, key);
      return is(existing, nextValue) ? existing : nextValue;
    };
  }

  function mergeIntoCollectionWith(collection, merger, iters) {
    iters = iters.filter(function(x ) {return x.size !== 0});
    if (iters.length === 0) {
      return collection;
    }
    if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
      return collection.constructor(iters[0]);
    }
    return collection.withMutations(function(collection ) {
      var mergeIntoMap = merger ?
        function(value, key)  {
          collection.update(key, NOT_SET, function(existing )
            {return existing === NOT_SET ? value : merger(existing, value, key)}
          );
        } :
        function(value, key)  {
          collection.set(key, value);
        }
      for (var ii = 0; ii < iters.length; ii++) {
        iters[ii].forEach(mergeIntoMap);
      }
    });
  }

  function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
    var isNotSet = existing === NOT_SET;
    var step = keyPathIter.next();
    if (step.done) {
      var existingValue = isNotSet ? notSetValue : existing;
      var newValue = updater(existingValue);
      return newValue === existingValue ? existing : newValue;
    }
    invariant(
      isNotSet || (existing && existing.set),
      'invalid keyPath'
    );
    var key = step.value;
    var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
    var nextUpdated = updateInDeepMap(
      nextExisting,
      keyPathIter,
      notSetValue,
      updater
    );
    return nextUpdated === nextExisting ? existing :
      nextUpdated === NOT_SET ? existing.remove(key) :
      (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
  }

  function popCount(x) {
    x = x - ((x >> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x = x + (x >> 8);
    x = x + (x >> 16);
    return x & 0x7f;
  }

  function setIn(array, idx, val, canEdit) {
    var newArray = canEdit ? array : arrCopy(array);
    newArray[idx] = val;
    return newArray;
  }

  function spliceIn(array, idx, val, canEdit) {
    var newLen = array.length + 1;
    if (canEdit && idx + 1 === newLen) {
      array[idx] = val;
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        newArray[ii] = val;
        after = -1;
      } else {
        newArray[ii] = array[ii + after];
      }
    }
    return newArray;
  }

  function spliceOut(array, idx, canEdit) {
    var newLen = array.length - 1;
    if (canEdit && idx === newLen) {
      array.pop();
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        after = 1;
      }
      newArray[ii] = array[ii + after];
    }
    return newArray;
  }

  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

  createClass(List, IndexedCollection);

    // @pragma Construction

    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedIterable(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function(list ) {
        list.setSize(size);
        iter.forEach(function(v, i)  {return list.set(i, v)});
      });
    }

    List.of = function(/*...values*/) {
      return this(arguments);
    };

    List.prototype.toString = function() {
      return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      if (index >= 0 && index < this.size) {
        index += this._origin;
        var node = listNodeFor(this, index);
        return node && node.array[index & MASK];
      }
      return notSetValue;
    };

    // @pragma Modification

    List.prototype.set = function(index, value) {
      return updateList(this, index, value);
    };

    List.prototype.remove = function(index) {
      return !this.has(index) ? this :
        index === 0 ? this.shift() :
        index === this.size - 1 ? this.pop() :
        this.splice(index, 1);
    };

    List.prototype.insert = function(index, value) {
      return this.splice(index, 0, value);
    };

    List.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };

    List.prototype.push = function(/*...values*/) {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function(list ) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };

    List.prototype.pop = function() {
      return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function(/*...values*/) {
      var values = arguments;
      return this.withMutations(function(list ) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };

    List.prototype.shift = function() {
      return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.merge = function(/*...iters*/) {
      return mergeIntoListWith(this, undefined, arguments);
    };

    List.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, merger, iters);
    };

    List.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoListWith(this, deepMerger, arguments);
    };

    List.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, deepMergerWith(merger), iters);
    };

    List.prototype.setSize = function(size) {
      return setListBounds(this, 0, size);
    };

    // @pragma Iteration

    List.prototype.slice = function(begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(
        this,
        resolveBegin(begin, size),
        resolveEnd(end, size)
      );
    };

    List.prototype.__iterator = function(type, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      return new Iterator(function()  {
        var value = values();
        return value === DONE ?
          iteratorDone() :
          iteratorValue(type, index++, value);
      });
    };

    List.prototype.__iterate = function(fn, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, index++, this) === false) {
          break;
        }
      }
      return index;
    };

    List.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        return this;
      }
      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };


  function isList(maybeList) {
    return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
  }

  List.isList = isList;

  var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

  var ListPrototype = List.prototype;
  ListPrototype[IS_LIST_SENTINEL] = true;
  ListPrototype[DELETE] = ListPrototype.remove;
  ListPrototype.setIn = MapPrototype.setIn;
  ListPrototype.deleteIn =
  ListPrototype.removeIn = MapPrototype.removeIn;
  ListPrototype.update = MapPrototype.update;
  ListPrototype.updateIn = MapPrototype.updateIn;
  ListPrototype.mergeIn = MapPrototype.mergeIn;
  ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  ListPrototype.withMutations = MapPrototype.withMutations;
  ListPrototype.asMutable = MapPrototype.asMutable;
  ListPrototype.asImmutable = MapPrototype.asImmutable;
  ListPrototype.wasAltered = MapPrototype.wasAltered;



    function VNode(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    }

    // TODO: seems like these methods are very similar

    VNode.prototype.removeBefore = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = (index >>> level) & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = undefined;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };

    VNode.prototype.removeAfter = function(ownerID, level, index) {
      if (index === (level ? 1 << level : 0) || this.array.length === 0) {
        return this;
      }
      var sizeIndex = ((index - 1) >>> level) & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }

      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
          return this;
        }
      }

      var editable = editableVNode(this, ownerID);
      editable.array.splice(sizeIndex + 1);
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };



  var DONE = {};

  function iterateList(list, reverse) {
    var left = list._origin;
    var right = list._capacity;
    var tailPos = getTailOffset(right);
    var tail = list._tail;

    return iterateNodeOrLeaf(list._root, list._level, 0);

    function iterateNodeOrLeaf(node, level, offset) {
      return level === 0 ?
        iterateLeaf(node, offset) :
        iterateNode(node, level, offset);
    }

    function iterateLeaf(node, offset) {
      var array = offset === tailPos ? tail && tail.array : node && node.array;
      var from = offset > left ? 0 : left - offset;
      var to = right - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        return array && array[idx];
      };
    }

    function iterateNode(node, level, offset) {
      var values;
      var array = node && node.array;
      var from = offset > left ? 0 : (left - offset) >> level;
      var to = ((right - offset) >> level) + 1;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        do {
          if (values) {
            var value = values();
            if (value !== DONE) {
              return value;
            }
            values = null;
          }
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          values = iterateNodeOrLeaf(
            array && array[idx], level - SHIFT, offset + (idx << level)
          );
        } while (true);
      };
    }
  }

  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
    var list = Object.create(ListPrototype);
    list.size = capacity - origin;
    list._origin = origin;
    list._capacity = capacity;
    list._level = level;
    list._root = root;
    list._tail = tail;
    list.__ownerID = ownerID;
    list.__hash = hash;
    list.__altered = false;
    return list;
  }

  var EMPTY_LIST;
  function emptyList() {
    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
  }

  function updateList(list, index, value) {
    index = wrapIndex(list, index);

    if (index !== index) {
      return list;
    }

    if (index >= list.size || index < 0) {
      return list.withMutations(function(list ) {
        index < 0 ?
          setListBounds(list, index).set(0, value) :
          setListBounds(list, 0, index + 1).set(index, value)
      });
    }

    index += list._origin;

    var newTail = list._tail;
    var newRoot = list._root;
    var didAlter = MakeRef(DID_ALTER);
    if (index >= getTailOffset(list._capacity)) {
      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
    } else {
      newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
    }

    if (!didAlter.value) {
      return list;
    }

    if (list.__ownerID) {
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
  }

  function updateVNode(node, ownerID, level, index, value, didAlter) {
    var idx = (index >>> level) & MASK;
    var nodeHas = node && idx < node.array.length;
    if (!nodeHas && value === undefined) {
      return node;
    }

    var newNode;

    if (level > 0) {
      var lowerNode = node && node.array[idx];
      var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
      if (newLowerNode === lowerNode) {
        return node;
      }
      newNode = editableVNode(node, ownerID);
      newNode.array[idx] = newLowerNode;
      return newNode;
    }

    if (nodeHas && node.array[idx] === value) {
      return node;
    }

    SetRef(didAlter);

    newNode = editableVNode(node, ownerID);
    if (value === undefined && idx === newNode.array.length - 1) {
      newNode.array.pop();
    } else {
      newNode.array[idx] = value;
    }
    return newNode;
  }

  function editableVNode(node, ownerID) {
    if (ownerID && node && ownerID === node.ownerID) {
      return node;
    }
    return new VNode(node ? node.array.slice() : [], ownerID);
  }

  function listNodeFor(list, rawIndex) {
    if (rawIndex >= getTailOffset(list._capacity)) {
      return list._tail;
    }
    if (rawIndex < 1 << (list._level + SHIFT)) {
      var node = list._root;
      var level = list._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }

  function setListBounds(list, begin, end) {
    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      end = end | 0;
    }
    var owner = list.__ownerID || new OwnerID();
    var oldOrigin = list._origin;
    var oldCapacity = list._capacity;
    var newOrigin = oldOrigin + begin;
    var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
      return list;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newCapacity) {
      return list.clear();
    }

    var newLevel = list._level;
    var newRoot = list._root;

    // New origin might need creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
      newLevel += SHIFT;
      offsetShift += 1 << newLevel;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newCapacity += offsetShift;
      oldCapacity += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldCapacity);
    var newTailOffset = getTailOffset(newCapacity);

    // New size might need creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = list._tail;
    var newTail = newTailOffset < oldTailOffset ?
      listNodeFor(list, newCapacity - 1) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

    // Merge Tail into tree.
    if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
      newRoot = editableVNode(newRoot, owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = editableVNode(node.array[idx], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newCapacity < oldCapacity) {
      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newCapacity -= newTailOffset;
      newLevel = SHIFT;
      newRoot = null;
      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      while (newRoot) {
        var beginIndex = (newOrigin >>> newLevel) & MASK;
        if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
          break;
        }
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot.array[beginIndex];
      }

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newCapacity -= offsetShift;
      }
    }

    if (list.__ownerID) {
      list.size = newCapacity - newOrigin;
      list._origin = newOrigin;
      list._capacity = newCapacity;
      list._level = newLevel;
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
  }

  function mergeIntoListWith(list, merger, iterables) {
    var iters = [];
    var maxSize = 0;
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = IndexedIterable(value);
      if (iter.size > maxSize) {
        maxSize = iter.size;
      }
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    if (maxSize > list.size) {
      list = list.setSize(maxSize);
    }
    return mergeIntoCollectionWith(list, merger, iters);
  }

  function getTailOffset(size) {
    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
  }

  createClass(OrderedMap, Map);

    // @pragma Construction

    function OrderedMap(value) {
      return value === null || value === undefined ? emptyOrderedMap() :
        isOrderedMap(value) ? value :
        emptyOrderedMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    OrderedMap.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedMap.prototype.toString = function() {
      return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function(k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function(k, v) {
      return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function(k) {
      return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function() {
      return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._list.__iterate(
        function(entry ) {return entry && fn(entry[1], entry[0], this$0)},
        reverse
      );
    };

    OrderedMap.prototype.__iterator = function(type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };


  function isOrderedMap(maybeOrderedMap) {
    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
  }

  OrderedMap.isOrderedMap = isOrderedMap;

  OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



  function makeOrderedMap(map, list, ownerID, hash) {
    var omap = Object.create(OrderedMap.prototype);
    omap.size = map ? map.size : 0;
    omap._map = map;
    omap._list = list;
    omap.__ownerID = ownerID;
    omap.__hash = hash;
    return omap;
  }

  var EMPTY_ORDERED_MAP;
  function emptyOrderedMap() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
  }

  function updateOrderedMap(omap, k, v) {
    var map = omap._map;
    var list = omap._list;
    var i = map.get(k);
    var has = i !== undefined;
    var newMap;
    var newList;
    if (v === NOT_SET) { // removed
      if (!has) {
        return omap;
      }
      if (list.size >= SIZE && list.size >= map.size * 2) {
        newList = list.filter(function(entry, idx)  {return entry !== undefined && i !== idx});
        newMap = newList.toKeyedSeq().map(function(entry ) {return entry[0]}).flip().toMap();
        if (omap.__ownerID) {
          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
        }
      } else {
        newMap = map.remove(k);
        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
      }
    } else {
      if (has) {
        if (v === list.get(i)[1]) {
          return omap;
        }
        newMap = map;
        newList = list.set(i, [k, v]);
      } else {
        newMap = map.set(k, list.size);
        newList = list.set(list.size, [k, v]);
      }
    }
    if (omap.__ownerID) {
      omap.size = newMap.size;
      omap._map = newMap;
      omap._list = newList;
      omap.__hash = undefined;
      return omap;
    }
    return makeOrderedMap(newMap, newList);
  }

  createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }

    ToKeyedSequence.prototype.get = function(key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function(key) {
      return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function() {
      return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function() {var this$0 = this;
      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function()  {return this$0._iter.toSeq().reverse()};
      }
      return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function(mapper, context) {var this$0 = this;
      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function()  {return this$0._iter.toSeq().map(mapper, context)};
      }
      return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var ii;
      return this._iter.__iterate(
        this._useKeys ?
          function(v, k)  {return fn(v, k, this$0)} :
          ((ii = reverse ? resolveSize(this) : 0),
            function(v ) {return fn(v, reverse ? --ii : ii++, this$0)}),
        reverse
      );
    };

    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
      if (this._useKeys) {
        return this._iter.__iterator(type, reverse);
      }
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var ii = reverse ? resolveSize(this) : 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, reverse ? --ii : ii++, step.value, step);
      });
    };

  ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToIndexedSequence.prototype.includes = function(value) {
      return this._iter.includes(value);
    };

    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      return this._iter.__iterate(function(v ) {return fn(v, iterations++, this$0)}, reverse);
    };

    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, iterations++, step.value, step)
      });
    };



  createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToSetSequence.prototype.has = function(key) {
      return this._iter.includes(key);
    };

    ToSetSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(v ) {return fn(v, v, this$0)}, reverse);
    };

    ToSetSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, step.value, step.value, step);
      });
    };



  createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }

    FromEntriesSequence.prototype.entrySeq = function() {
      return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(entry ) {
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedIterable = isIterable(entry);
          return fn(
            indexedIterable ? entry.get(1) : entry[1],
            indexedIterable ? entry.get(0) : entry[0],
            this$0
          );
        }
      }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          // Check if entry exists first so array access doesn't throw for holes
          // in the parent iteration.
          if (entry) {
            validateEntry(entry);
            var indexedIterable = isIterable(entry);
            return iteratorValue(
              type,
              indexedIterable ? entry.get(0) : entry[0],
              indexedIterable ? entry.get(1) : entry[1],
              step
            );
          }
        }
      });
    };


  ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;


  function flipFactory(iterable) {
    var flipSequence = makeSequence(iterable);
    flipSequence._iter = iterable;
    flipSequence.size = iterable.size;
    flipSequence.flip = function()  {return iterable};
    flipSequence.reverse = function () {
      var reversedSequence = iterable.reverse.apply(this); // super.reverse()
      reversedSequence.flip = function()  {return iterable.reverse()};
      return reversedSequence;
    };
    flipSequence.has = function(key ) {return iterable.includes(key)};
    flipSequence.includes = function(key ) {return iterable.has(key)};
    flipSequence.cacheResult = cacheResultThrough;
    flipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(k, v, this$0) !== false}, reverse);
    }
    flipSequence.__iteratorUncached = function(type, reverse) {
      if (type === ITERATE_ENTRIES) {
        var iterator = iterable.__iterator(type, reverse);
        return new Iterator(function()  {
          var step = iterator.next();
          if (!step.done) {
            var k = step.value[0];
            step.value[0] = step.value[1];
            step.value[1] = k;
          }
          return step;
        });
      }
      return iterable.__iterator(
        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
        reverse
      );
    }
    return flipSequence;
  }


  function mapFactory(iterable, mapper, context) {
    var mappedSequence = makeSequence(iterable);
    mappedSequence.size = iterable.size;
    mappedSequence.has = function(key ) {return iterable.has(key)};
    mappedSequence.get = function(key, notSetValue)  {
      var v = iterable.get(key, NOT_SET);
      return v === NOT_SET ?
        notSetValue :
        mapper.call(context, v, key, iterable);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(
        function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, this$0) !== false},
        reverse
      );
    }
    mappedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        return iteratorValue(
          type,
          key,
          mapper.call(context, entry[1], key, iterable),
          step
        );
      });
    }
    return mappedSequence;
  }


  function reverseFactory(iterable, useKeys) {
    var reversedSequence = makeSequence(iterable);
    reversedSequence._iter = iterable;
    reversedSequence.size = iterable.size;
    reversedSequence.reverse = function()  {return iterable};
    if (iterable.flip) {
      reversedSequence.flip = function () {
        var flipSequence = flipFactory(iterable);
        flipSequence.reverse = function()  {return iterable.flip()};
        return flipSequence;
      };
    }
    reversedSequence.get = function(key, notSetValue) 
      {return iterable.get(useKeys ? key : -1 - key, notSetValue)};
    reversedSequence.has = function(key )
      {return iterable.has(useKeys ? key : -1 - key)};
    reversedSequence.includes = function(value ) {return iterable.includes(value)};
    reversedSequence.cacheResult = cacheResultThrough;
    reversedSequence.__iterate = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(v, k, this$0)}, !reverse);
    };
    reversedSequence.__iterator =
      function(type, reverse)  {return iterable.__iterator(type, !reverse)};
    return reversedSequence;
  }


  function filterFactory(iterable, predicate, context, useKeys) {
    var filterSequence = makeSequence(iterable);
    if (useKeys) {
      filterSequence.has = function(key ) {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
      };
      filterSequence.get = function(key, notSetValue)  {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
          v : notSetValue;
      };
    }
    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      }, reverse);
      return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          var value = entry[1];
          if (predicate.call(context, value, key, iterable)) {
            return iteratorValue(type, useKeys ? key : iterations++, value, step);
          }
        }
      });
    }
    return filterSequence;
  }


  function countByFactory(iterable, grouper, context) {
    var groups = Map().asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        0,
        function(a ) {return a + 1}
      );
    });
    return groups.asImmutable();
  }


  function groupByFactory(iterable, grouper, context) {
    var isKeyedIter = isKeyed(iterable);
    var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        function(a ) {return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a)}
      );
    });
    var coerce = iterableClass(iterable);
    return groups.map(function(arr ) {return reify(iterable, coerce(arr))});
  }


  function sliceFactory(iterable, begin, end, useKeys) {
    var originalSize = iterable.size;

    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      end = end | 0;
    }

    if (wholeSlice(begin, end, originalSize)) {
      return iterable;
    }

    var resolvedBegin = resolveBegin(begin, originalSize);
    var resolvedEnd = resolveEnd(end, originalSize);

    // begin or end will be NaN if they were provided as negative numbers and
    // this iterable's size is unknown. In that case, cache first so there is
    // a known size and these do not resolve to NaN.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
    }

    // Note: resolvedEnd is undefined when the original sequence's length is
    // unknown and this slice did not supply an end and should contain all
    // elements after resolvedBegin.
    // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
    var resolvedSize = resolvedEnd - resolvedBegin;
    var sliceSize;
    if (resolvedSize === resolvedSize) {
      sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
    }

    var sliceSeq = makeSequence(iterable);

    // If iterable.size is undefined, the size of the realized sliceSeq is
    // unknown at this point unless the number of items to slice is 0
    sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

    if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
      sliceSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < sliceSize ?
          iterable.get(index + resolvedBegin, notSetValue) :
          notSetValue;
      }
    }

    sliceSeq.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (sliceSize === 0) {
        return 0;
      }
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var skipped = 0;
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k)  {
        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
                 iterations !== sliceSize;
        }
      });
      return iterations;
    };

    sliceSeq.__iteratorUncached = function(type, reverse) {
      if (sliceSize !== 0 && reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      // Don't bother instantiating parent iterator if taking 0.
      var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
      var skipped = 0;
      var iterations = 0;
      return new Iterator(function()  {
        while (skipped++ < resolvedBegin) {
          iterator.next();
        }
        if (++iterations > sliceSize) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (useKeys || type === ITERATE_VALUES) {
          return step;
        } else if (type === ITERATE_KEYS) {
          return iteratorValue(type, iterations - 1, undefined, step);
        } else {
          return iteratorValue(type, iterations - 1, step.value[1], step);
        }
      });
    }

    return sliceSeq;
  }


  function takeWhileFactory(iterable, predicate, context) {
    var takeSequence = makeSequence(iterable);
    takeSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      iterable.__iterate(function(v, k, c) 
        {return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0)}
      );
      return iterations;
    };
    takeSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterating = true;
      return new Iterator(function()  {
        if (!iterating) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var k = entry[0];
        var v = entry[1];
        if (!predicate.call(context, v, k, this$0)) {
          iterating = false;
          return iteratorDone();
        }
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return takeSequence;
  }


  function skipWhileFactory(iterable, predicate, context, useKeys) {
    var skipSequence = makeSequence(iterable);
    skipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      });
      return iterations;
    };
    skipSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var skipping = true;
      var iterations = 0;
      return new Iterator(function()  {
        var step, k, v;
        do {
          step = iterator.next();
          if (step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, undefined, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
          var entry = step.value;
          k = entry[0];
          v = entry[1];
          skipping && (skipping = predicate.call(context, v, k, this$0));
        } while (skipping);
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return skipSequence;
  }


  function concatFactory(iterable, values) {
    var isKeyedIterable = isKeyed(iterable);
    var iters = [iterable].concat(values).map(function(v ) {
      if (!isIterable(v)) {
        v = isKeyedIterable ?
          keyedSeqFromValue(v) :
          indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedIterable) {
        v = KeyedIterable(v);
      }
      return v;
    }).filter(function(v ) {return v.size !== 0});

    if (iters.length === 0) {
      return iterable;
    }

    if (iters.length === 1) {
      var singleton = iters[0];
      if (singleton === iterable ||
          isKeyedIterable && isKeyed(singleton) ||
          isIndexed(iterable) && isIndexed(singleton)) {
        return singleton;
      }
    }

    var concatSeq = new ArraySeq(iters);
    if (isKeyedIterable) {
      concatSeq = concatSeq.toKeyedSeq();
    } else if (!isIndexed(iterable)) {
      concatSeq = concatSeq.toSetSeq();
    }
    concatSeq = concatSeq.flatten(true);
    concatSeq.size = iters.reduce(
      function(sum, seq)  {
        if (sum !== undefined) {
          var size = seq.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
      },
      0
    );
    return concatSeq;
  }


  function flattenFactory(iterable, depth, useKeys) {
    var flatSequence = makeSequence(iterable);
    flatSequence.__iterateUncached = function(fn, reverse) {
      var iterations = 0;
      var stopped = false;
      function flatDeep(iter, currentDepth) {var this$0 = this;
        iter.__iterate(function(v, k)  {
          if ((!depth || currentDepth < depth) && isIterable(v)) {
            flatDeep(v, currentDepth + 1);
          } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
            stopped = true;
          }
          return !stopped;
        }, reverse);
      }
      flatDeep(iterable, 0);
      return iterations;
    }
    flatSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(type, reverse);
      var stack = [];
      var iterations = 0;
      return new Iterator(function()  {
        while (iterator) {
          var step = iterator.next();
          if (step.done !== false) {
            iterator = stack.pop();
            continue;
          }
          var v = step.value;
          if (type === ITERATE_ENTRIES) {
            v = v[1];
          }
          if ((!depth || stack.length < depth) && isIterable(v)) {
            stack.push(iterator);
            iterator = v.__iterator(type, reverse);
          } else {
            return useKeys ? step : iteratorValue(type, iterations++, v, step);
          }
        }
        return iteratorDone();
      });
    }
    return flatSequence;
  }


  function flatMapFactory(iterable, mapper, context) {
    var coerce = iterableClass(iterable);
    return iterable.toSeq().map(
      function(v, k)  {return coerce(mapper.call(context, v, k, iterable))}
    ).flatten(true);
  }


  function interposeFactory(iterable, separator) {
    var interposedSequence = makeSequence(iterable);
    interposedSequence.size = iterable.size && iterable.size * 2 -1;
    interposedSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k) 
        {return (!iterations || fn(separator, iterations++, this$0) !== false) &&
        fn(v, iterations++, this$0) !== false},
        reverse
      );
      return iterations;
    };
    interposedSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      var step;
      return new Iterator(function()  {
        if (!step || iterations % 2) {
          step = iterator.next();
          if (step.done) {
            return step;
          }
        }
        return iterations % 2 ?
          iteratorValue(type, iterations++, separator) :
          iteratorValue(type, iterations++, step.value, step);
      });
    };
    return interposedSequence;
  }


  function sortFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    var isKeyedIterable = isKeyed(iterable);
    var index = 0;
    var entries = iterable.toSeq().map(
      function(v, k)  {return [k, v, index++, mapper ? mapper(v, k, iterable) : v]}
    ).toArray();
    entries.sort(function(a, b)  {return comparator(a[3], b[3]) || a[2] - b[2]}).forEach(
      isKeyedIterable ?
      function(v, i)  { entries[i].length = 2; } :
      function(v, i)  { entries[i] = v[1]; }
    );
    return isKeyedIterable ? KeyedSeq(entries) :
      isIndexed(iterable) ? IndexedSeq(entries) :
      SetSeq(entries);
  }


  function maxFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    if (mapper) {
      var entry = iterable.toSeq()
        .map(function(v, k)  {return [v, mapper(v, k, iterable)]})
        .reduce(function(a, b)  {return maxCompare(comparator, a[1], b[1]) ? b : a});
      return entry && entry[0];
    } else {
      return iterable.reduce(function(a, b)  {return maxCompare(comparator, a, b) ? b : a});
    }
  }

  function maxCompare(comparator, a, b) {
    var comp = comparator(b, a);
    // b is considered the new max if the comparator declares them equal, but
    // they are not equal and b is in fact a nullish value.
    return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
  }


  function zipWithFactory(keyIter, zipper, iters) {
    var zipSequence = makeSequence(keyIter);
    zipSequence.size = new ArraySeq(iters).map(function(i ) {return i.size}).min();
    // Note: this a generic base implementation of __iterate in terms of
    // __iterator which may be more generically useful in the future.
    zipSequence.__iterate = function(fn, reverse) {
      /* generic:
      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        iterations++;
        if (fn(step.value[1], step.value[0], this) === false) {
          break;
        }
      }
      return iterations;
      */
      // indexed:
      var iterator = this.__iterator(ITERATE_VALUES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    zipSequence.__iteratorUncached = function(type, reverse) {
      var iterators = iters.map(function(i )
        {return (i = Iterable(i), getIterator(reverse ? i.reverse() : i))}
      );
      var iterations = 0;
      var isDone = false;
      return new Iterator(function()  {
        var steps;
        if (!isDone) {
          steps = iterators.map(function(i ) {return i.next()});
          isDone = steps.some(function(s ) {return s.done});
        }
        if (isDone) {
          return iteratorDone();
        }
        return iteratorValue(
          type,
          iterations++,
          zipper.apply(null, steps.map(function(s ) {return s.value}))
        );
      });
    };
    return zipSequence
  }


  // #pragma Helper Functions

  function reify(iter, seq) {
    return isSeq(iter) ? seq : iter.constructor(seq);
  }

  function validateEntry(entry) {
    if (entry !== Object(entry)) {
      throw new TypeError('Expected [K, V] tuple: ' + entry);
    }
  }

  function resolveSize(iter) {
    assertNotInfinite(iter.size);
    return ensureSize(iter);
  }

  function iterableClass(iterable) {
    return isKeyed(iterable) ? KeyedIterable :
      isIndexed(iterable) ? IndexedIterable :
      SetIterable;
  }

  function makeSequence(iterable) {
    return Object.create(
      (
        isKeyed(iterable) ? KeyedSeq :
        isIndexed(iterable) ? IndexedSeq :
        SetSeq
      ).prototype
    );
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    } else {
      return Seq.prototype.cacheResult.call(this);
    }
  }

  function defaultComparator(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function forceIterator(keyPath) {
    var iter = getIterator(keyPath);
    if (!iter) {
      // Array might not be iterable in this environment, so we need a fallback
      // to our wrapped type.
      if (!isArrayLike(keyPath)) {
        throw new TypeError('Expected iterable or array-like: ' + keyPath);
      }
      iter = getIterator(Iterable(keyPath));
    }
    return iter;
  }

  createClass(Record, KeyedCollection);

    function Record(defaultValues, name) {
      var hasInitialized;

      var RecordType = function Record(values) {
        if (values instanceof RecordType) {
          return values;
        }
        if (!(this instanceof RecordType)) {
          return new RecordType(values);
        }
        if (!hasInitialized) {
          hasInitialized = true;
          var keys = Object.keys(defaultValues);
          setProps(RecordTypePrototype, keys);
          RecordTypePrototype.size = keys.length;
          RecordTypePrototype._name = name;
          RecordTypePrototype._keys = keys;
          RecordTypePrototype._defaultValues = defaultValues;
        }
        this._map = Map(values);
      };

      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;

      return RecordType;
    }

    Record.prototype.toString = function() {
      return this.__toString(recordName(this) + ' {', '}');
    };

    // @pragma Access

    Record.prototype.has = function(k) {
      return this._defaultValues.hasOwnProperty(k);
    };

    Record.prototype.get = function(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var defaultVal = this._defaultValues[k];
      return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };

    // @pragma Modification

    Record.prototype.clear = function() {
      if (this.__ownerID) {
        this._map && this._map.clear();
        return this;
      }
      var RecordType = this.constructor;
      return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
    };

    Record.prototype.set = function(k, v) {
      if (!this.has(k)) {
        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
      }
      var newMap = this._map && this._map.set(k, v);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.remove = function(k) {
      if (!this.has(k)) {
        return this;
      }
      var newMap = this._map && this._map.remove(k);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Record.prototype.__iterator = function(type, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterator(type, reverse);
    };

    Record.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterate(fn, reverse);
    };

    Record.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map && this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return makeRecord(this, newMap, ownerID);
    };


  var RecordPrototype = Record.prototype;
  RecordPrototype[DELETE] = RecordPrototype.remove;
  RecordPrototype.deleteIn =
  RecordPrototype.removeIn = MapPrototype.removeIn;
  RecordPrototype.merge = MapPrototype.merge;
  RecordPrototype.mergeWith = MapPrototype.mergeWith;
  RecordPrototype.mergeIn = MapPrototype.mergeIn;
  RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
  RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
  RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  RecordPrototype.setIn = MapPrototype.setIn;
  RecordPrototype.update = MapPrototype.update;
  RecordPrototype.updateIn = MapPrototype.updateIn;
  RecordPrototype.withMutations = MapPrototype.withMutations;
  RecordPrototype.asMutable = MapPrototype.asMutable;
  RecordPrototype.asImmutable = MapPrototype.asImmutable;


  function makeRecord(likeRecord, map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(likeRecord));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }

  function recordName(record) {
    return record._name || record.constructor.name || 'Record';
  }

  function setProps(prototype, names) {
    try {
      names.forEach(setProp.bind(undefined, prototype));
    } catch (error) {
      // Object.defineProperty failed. Probably IE8.
    }
  }

  function setProp(prototype, name) {
    Object.defineProperty(prototype, name, {
      get: function() {
        return this.get(name);
      },
      set: function(value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      }
    });
  }

  createClass(Set, SetCollection);

    // @pragma Construction

    function Set(value) {
      return value === null || value === undefined ? emptySet() :
        isSet(value) && !isOrdered(value) ? value :
        emptySet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    Set.of = function(/*...values*/) {
      return this(arguments);
    };

    Set.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    Set.prototype.toString = function() {
      return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function(value) {
      return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function(value) {
      return updateSet(this, this._map.set(value, true));
    };

    Set.prototype.remove = function(value) {
      return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function() {
      return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.union = function() {var iters = SLICE$0.call(arguments, 0);
      iters = iters.filter(function(x ) {return x.size !== 0});
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function(set ) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetIterable(iters[ii]).forEach(function(value ) {return set.add(value)});
        }
      });
    };

    Set.prototype.intersect = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (!iters.every(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.subtract = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (iters.some(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.merge = function() {
      return this.union.apply(this, arguments);
    };

    Set.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return this.union.apply(this, iters);
    };

    Set.prototype.sort = function(comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Set.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._map.__iterate(function(_, k)  {return fn(k, k, this$0)}, reverse);
    };

    Set.prototype.__iterator = function(type, reverse) {
      return this._map.map(function(_, k)  {return k}).__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };


  function isSet(maybeSet) {
    return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
  }

  Set.isSet = isSet;

  var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

  var SetPrototype = Set.prototype;
  SetPrototype[IS_SET_SENTINEL] = true;
  SetPrototype[DELETE] = SetPrototype.remove;
  SetPrototype.mergeDeep = SetPrototype.merge;
  SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
  SetPrototype.withMutations = MapPrototype.withMutations;
  SetPrototype.asMutable = MapPrototype.asMutable;
  SetPrototype.asImmutable = MapPrototype.asImmutable;

  SetPrototype.__empty = emptySet;
  SetPrototype.__make = makeSet;

  function updateSet(set, newMap) {
    if (set.__ownerID) {
      set.size = newMap.size;
      set._map = newMap;
      return set;
    }
    return newMap === set._map ? set :
      newMap.size === 0 ? set.__empty() :
      set.__make(newMap);
  }

  function makeSet(map, ownerID) {
    var set = Object.create(SetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_SET;
  function emptySet() {
    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
  }

  createClass(OrderedSet, Set);

    // @pragma Construction

    function OrderedSet(value) {
      return value === null || value === undefined ? emptyOrderedSet() :
        isOrderedSet(value) ? value :
        emptyOrderedSet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    OrderedSet.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedSet.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    OrderedSet.prototype.toString = function() {
      return this.__toString('OrderedSet {', '}');
    };


  function isOrderedSet(maybeOrderedSet) {
    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
  }

  OrderedSet.isOrderedSet = isOrderedSet;

  var OrderedSetPrototype = OrderedSet.prototype;
  OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

  OrderedSetPrototype.__empty = emptyOrderedSet;
  OrderedSetPrototype.__make = makeOrderedSet;

  function makeOrderedSet(map, ownerID) {
    var set = Object.create(OrderedSetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_ORDERED_SET;
  function emptyOrderedSet() {
    return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
  }

  createClass(Stack, IndexedCollection);

    // @pragma Construction

    function Stack(value) {
      return value === null || value === undefined ? emptyStack() :
        isStack(value) ? value :
        emptyStack().unshiftAll(value);
    }

    Stack.of = function(/*...values*/) {
      return this(arguments);
    };

    Stack.prototype.toString = function() {
      return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function(index, notSetValue) {
      var head = this._head;
      index = wrapIndex(this, index);
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function() {
      return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function(/*...values*/) {
      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments[ii],
          next: head
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function(iter) {
      iter = IndexedIterable(iter);
      if (iter.size === 0) {
        return this;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.reverse().forEach(function(value ) {
        newSize++;
        head = {
          value: value,
          next: head
        };
      });
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pop = function() {
      return this.slice(1);
    };

    Stack.prototype.unshift = function(/*...values*/) {
      return this.push.apply(this, arguments);
    };

    Stack.prototype.unshiftAll = function(iter) {
      return this.pushAll(iter);
    };

    Stack.prototype.shift = function() {
      return this.pop.apply(this, arguments);
    };

    Stack.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };

    Stack.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        // super.slice(begin, end);
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function(fn, reverse) {
      if (reverse) {
        return this.reverse().__iterate(fn);
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };

    Stack.prototype.__iterator = function(type, reverse) {
      if (reverse) {
        return this.reverse().__iterator(type);
      }
      var iterations = 0;
      var node = this._head;
      return new Iterator(function()  {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };


  function isStack(maybeStack) {
    return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
  }

  Stack.isStack = isStack;

  var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

  var StackPrototype = Stack.prototype;
  StackPrototype[IS_STACK_SENTINEL] = true;
  StackPrototype.withMutations = MapPrototype.withMutations;
  StackPrototype.asMutable = MapPrototype.asMutable;
  StackPrototype.asImmutable = MapPrototype.asImmutable;
  StackPrototype.wasAltered = MapPrototype.wasAltered;


  function makeStack(size, head, ownerID, hash) {
    var map = Object.create(StackPrototype);
    map.size = size;
    map._head = head;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_STACK;
  function emptyStack() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  /**
   * Contributes additional methods to a constructor
   */
  function mixin(ctor, methods) {
    var keyCopier = function(key ) { ctor.prototype[key] = methods[key]; };
    Object.keys(methods).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
    return ctor;
  }

  Iterable.Iterator = Iterator;

  mixin(Iterable, {

    // ### Conversion to other types

    toArray: function() {
      assertNotInfinite(this.size);
      var array = new Array(this.size || 0);
      this.valueSeq().__iterate(function(v, i)  { array[i] = v; });
      return array;
    },

    toIndexedSeq: function() {
      return new ToIndexedSequence(this);
    },

    toJS: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJS === 'function' ? value.toJS() : value}
      ).__toJS();
    },

    toJSON: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJSON === 'function' ? value.toJSON() : value}
      ).__toJS();
    },

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, true);
    },

    toMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return Map(this.toKeyedSeq());
    },

    toObject: function() {
      assertNotInfinite(this.size);
      var object = {};
      this.__iterate(function(v, k)  { object[k] = v; });
      return object;
    },

    toOrderedMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedMap(this.toKeyedSeq());
    },

    toOrderedSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
    },

    toSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return Set(isKeyed(this) ? this.valueSeq() : this);
    },

    toSetSeq: function() {
      return new ToSetSequence(this);
    },

    toSeq: function() {
      return isIndexed(this) ? this.toIndexedSeq() :
        isKeyed(this) ? this.toKeyedSeq() :
        this.toSetSeq();
    },

    toStack: function() {
      // Use Late Binding here to solve the circular dependency.
      return Stack(isKeyed(this) ? this.valueSeq() : this);
    },

    toList: function() {
      // Use Late Binding here to solve the circular dependency.
      return List(isKeyed(this) ? this.valueSeq() : this);
    },


    // ### Common JavaScript methods and properties

    toString: function() {
      return '[Iterable]';
    },

    __toString: function(head, tail) {
      if (this.size === 0) {
        return head + tail;
      }
      return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    concat: function() {var values = SLICE$0.call(arguments, 0);
      return reify(this, concatFactory(this, values));
    },

    includes: function(searchValue) {
      return this.some(function(value ) {return is(value, searchValue)});
    },

    entries: function() {
      return this.__iterator(ITERATE_ENTRIES);
    },

    every: function(predicate, context) {
      assertNotInfinite(this.size);
      var returnValue = true;
      this.__iterate(function(v, k, c)  {
        if (!predicate.call(context, v, k, c)) {
          returnValue = false;
          return false;
        }
      });
      return returnValue;
    },

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, true));
    },

    find: function(predicate, context, notSetValue) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[1] : notSetValue;
    },

    findEntry: function(predicate, context) {
      var found;
      this.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          found = [k, v];
          return false;
        }
      });
      return found;
    },

    findLastEntry: function(predicate, context) {
      return this.toSeq().reverse().findEntry(predicate, context);
    },

    forEach: function(sideEffect, context) {
      assertNotInfinite(this.size);
      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
    },

    join: function(separator) {
      assertNotInfinite(this.size);
      separator = separator !== undefined ? '' + separator : ',';
      var joined = '';
      var isFirst = true;
      this.__iterate(function(v ) {
        isFirst ? (isFirst = false) : (joined += separator);
        joined += v !== null && v !== undefined ? v.toString() : '';
      });
      return joined;
    },

    keys: function() {
      return this.__iterator(ITERATE_KEYS);
    },

    map: function(mapper, context) {
      return reify(this, mapFactory(this, mapper, context));
    },

    reduce: function(reducer, initialReduction, context) {
      assertNotInfinite(this.size);
      var reduction;
      var useFirst;
      if (arguments.length < 2) {
        useFirst = true;
      } else {
        reduction = initialReduction;
      }
      this.__iterate(function(v, k, c)  {
        if (useFirst) {
          useFirst = false;
          reduction = v;
        } else {
          reduction = reducer.call(context, reduction, v, k, c);
        }
      });
      return reduction;
    },

    reduceRight: function(reducer, initialReduction, context) {
      var reversed = this.toKeyedSeq().reverse();
      return reversed.reduce.apply(reversed, arguments);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, true));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, true));
    },

    some: function(predicate, context) {
      return !this.every(not(predicate), context);
    },

    sort: function(comparator) {
      return reify(this, sortFactory(this, comparator));
    },

    values: function() {
      return this.__iterator(ITERATE_VALUES);
    },


    // ### More sequential methods

    butLast: function() {
      return this.slice(0, -1);
    },

    isEmpty: function() {
      return this.size !== undefined ? this.size === 0 : !this.some(function()  {return true});
    },

    count: function(predicate, context) {
      return ensureSize(
        predicate ? this.toSeq().filter(predicate, context) : this
      );
    },

    countBy: function(grouper, context) {
      return countByFactory(this, grouper, context);
    },

    equals: function(other) {
      return deepEqual(this, other);
    },

    entrySeq: function() {
      var iterable = this;
      if (iterable._cache) {
        // We cache as an entries array, so we can just return the cache!
        return new ArraySeq(iterable._cache);
      }
      var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
      entriesSequence.fromEntrySeq = function()  {return iterable.toSeq()};
      return entriesSequence;
    },

    filterNot: function(predicate, context) {
      return this.filter(not(predicate), context);
    },

    findLast: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
    },

    first: function() {
      return this.find(returnTrue);
    },

    flatMap: function(mapper, context) {
      return reify(this, flatMapFactory(this, mapper, context));
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, true));
    },

    fromEntrySeq: function() {
      return new FromEntriesSequence(this);
    },

    get: function(searchKey, notSetValue) {
      return this.find(function(_, key)  {return is(key, searchKey)}, undefined, notSetValue);
    },

    getIn: function(searchKeyPath, notSetValue) {
      var nested = this;
      // Note: in an ES6 environment, we would prefer:
      // for (var key of searchKeyPath) {
      var iter = forceIterator(searchKeyPath);
      var step;
      while (!(step = iter.next()).done) {
        var key = step.value;
        nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
      return nested;
    },

    groupBy: function(grouper, context) {
      return groupByFactory(this, grouper, context);
    },

    has: function(searchKey) {
      return this.get(searchKey, NOT_SET) !== NOT_SET;
    },

    hasIn: function(searchKeyPath) {
      return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
    },

    isSubset: function(iter) {
      iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
      return this.every(function(value ) {return iter.includes(value)});
    },

    isSuperset: function(iter) {
      iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
      return iter.isSubset(this);
    },

    keySeq: function() {
      return this.toSeq().map(keyMapper).toIndexedSeq();
    },

    last: function() {
      return this.toSeq().reverse().first();
    },

    max: function(comparator) {
      return maxFactory(this, comparator);
    },

    maxBy: function(mapper, comparator) {
      return maxFactory(this, comparator, mapper);
    },

    min: function(comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
    },

    minBy: function(mapper, comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
    },

    rest: function() {
      return this.slice(1);
    },

    skip: function(amount) {
      return this.slice(Math.max(0, amount));
    },

    skipLast: function(amount) {
      return reify(this, this.toSeq().reverse().skip(amount).reverse());
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, true));
    },

    skipUntil: function(predicate, context) {
      return this.skipWhile(not(predicate), context);
    },

    sortBy: function(mapper, comparator) {
      return reify(this, sortFactory(this, comparator, mapper));
    },

    take: function(amount) {
      return this.slice(0, Math.max(0, amount));
    },

    takeLast: function(amount) {
      return reify(this, this.toSeq().reverse().take(amount).reverse());
    },

    takeWhile: function(predicate, context) {
      return reify(this, takeWhileFactory(this, predicate, context));
    },

    takeUntil: function(predicate, context) {
      return this.takeWhile(not(predicate), context);
    },

    valueSeq: function() {
      return this.toIndexedSeq();
    },


    // ### Hashable Object

    hashCode: function() {
      return this.__hash || (this.__hash = hashIterable(this));
    }


    // ### Internal

    // abstract __iterate(fn, reverse)

    // abstract __iterator(type, reverse)
  });

  // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  var IterablePrototype = Iterable.prototype;
  IterablePrototype[IS_ITERABLE_SENTINEL] = true;
  IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
  IterablePrototype.__toJS = IterablePrototype.toArray;
  IterablePrototype.__toStringMapper = quoteString;
  IterablePrototype.inspect =
  IterablePrototype.toSource = function() { return this.toString(); };
  IterablePrototype.chain = IterablePrototype.flatMap;
  IterablePrototype.contains = IterablePrototype.includes;

  // Temporary warning about using length
  (function () {
    try {
      Object.defineProperty(IterablePrototype, 'length', {
        get: function () {
          if (!Iterable.noLengthWarning) {
            var stack;
            try {
              throw new Error();
            } catch (error) {
              stack = error.stack;
            }
            if (stack.indexOf('_wrapObject') === -1) {
              console && console.warn && console.warn(
                'iterable.length has been deprecated, '+
                'use iterable.size or iterable.count(). '+
                'This warning will become a silent error in a future version. ' +
                stack
              );
              return this.size;
            }
          }
        }
      });
    } catch (e) {}
  })();



  mixin(KeyedIterable, {

    // ### More sequential methods

    flip: function() {
      return reify(this, flipFactory(this));
    },

    findKey: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry && entry[0];
    },

    findLastKey: function(predicate, context) {
      return this.toSeq().reverse().findKey(predicate, context);
    },

    keyOf: function(searchValue) {
      return this.findKey(function(value ) {return is(value, searchValue)});
    },

    lastKeyOf: function(searchValue) {
      return this.findLastKey(function(value ) {return is(value, searchValue)});
    },

    mapEntries: function(mapper, context) {var this$0 = this;
      var iterations = 0;
      return reify(this,
        this.toSeq().map(
          function(v, k)  {return mapper.call(context, [k, v], iterations++, this$0)}
        ).fromEntrySeq()
      );
    },

    mapKeys: function(mapper, context) {var this$0 = this;
      return reify(this,
        this.toSeq().flip().map(
          function(k, v)  {return mapper.call(context, k, v, this$0)}
        ).flip()
      );
    }

  });

  var KeyedIterablePrototype = KeyedIterable.prototype;
  KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
  KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
  KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
  KeyedIterablePrototype.__toStringMapper = function(v, k)  {return JSON.stringify(k) + ': ' + quoteString(v)};



  mixin(IndexedIterable, {

    // ### Conversion to other types

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, false);
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, false));
    },

    findIndex: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    indexOf: function(searchValue) {
      var key = this.toKeyedSeq().keyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    lastIndexOf: function(searchValue) {
      var key = this.toKeyedSeq().reverse().keyOf(searchValue);
      return key === undefined ? -1 : key;

      // var index =
      // return this.toSeq().reverse().indexOf(searchValue);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, false));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, false));
    },

    splice: function(index, removeNum /*, ...values*/) {
      var numArgs = arguments.length;
      removeNum = Math.max(removeNum | 0, 0);
      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
        return this;
      }
      // If index is negative, it should resolve relative to the size of the
      // collection. However size may be expensive to compute if not cached, so
      // only call count() if the number is in fact negative.
      index = resolveBegin(index, index < 0 ? this.count() : this.size);
      var spliced = this.slice(0, index);
      return reify(
        this,
        numArgs === 1 ?
          spliced :
          spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
      );
    },


    // ### More collection methods

    findLastIndex: function(predicate, context) {
      var key = this.toKeyedSeq().findLastKey(predicate, context);
      return key === undefined ? -1 : key;
    },

    first: function() {
      return this.get(0);
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, false));
    },

    get: function(index, notSetValue) {
      index = wrapIndex(this, index);
      return (index < 0 || (this.size === Infinity ||
          (this.size !== undefined && index > this.size))) ?
        notSetValue :
        this.find(function(_, key)  {return key === index}, undefined, notSetValue);
    },

    has: function(index) {
      index = wrapIndex(this, index);
      return index >= 0 && (this.size !== undefined ?
        this.size === Infinity || index < this.size :
        this.indexOf(index) !== -1
      );
    },

    interpose: function(separator) {
      return reify(this, interposeFactory(this, separator));
    },

    interleave: function(/*...iterables*/) {
      var iterables = [this].concat(arrCopy(arguments));
      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
      var interleaved = zipped.flatten(true);
      if (zipped.size) {
        interleaved.size = zipped.size * iterables.length;
      }
      return reify(this, interleaved);
    },

    last: function() {
      return this.get(-1);
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, false));
    },

    zip: function(/*, ...iterables */) {
      var iterables = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, iterables));
    },

    zipWith: function(zipper/*, ...iterables */) {
      var iterables = arrCopy(arguments);
      iterables[0] = this;
      return reify(this, zipWithFactory(this, zipper, iterables));
    }

  });

  IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
  IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



  mixin(SetIterable, {

    // ### ES6 Collection methods (ES6 Array and Map)

    get: function(value, notSetValue) {
      return this.has(value) ? value : notSetValue;
    },

    includes: function(value) {
      return this.has(value);
    },


    // ### More sequential methods

    keySeq: function() {
      return this.valueSeq();
    }

  });

  SetIterable.prototype.has = IterablePrototype.includes;


  // Mixin subclasses

  mixin(KeyedSeq, KeyedIterable.prototype);
  mixin(IndexedSeq, IndexedIterable.prototype);
  mixin(SetSeq, SetIterable.prototype);

  mixin(KeyedCollection, KeyedIterable.prototype);
  mixin(IndexedCollection, IndexedIterable.prototype);
  mixin(SetCollection, SetIterable.prototype);


  // #pragma Helper functions

  function keyMapper(v, k) {
    return k;
  }

  function entryMapper(v, k) {
    return [k, v];
  }

  function not(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    }
  }

  function neg(predicate) {
    return function() {
      return -predicate.apply(this, arguments);
    }
  }

  function quoteString(value) {
    return typeof value === 'string' ? JSON.stringify(value) : value;
  }

  function defaultZipper() {
    return arrCopy(arguments);
  }

  function defaultNegComparator(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function hashIterable(iterable) {
    if (iterable.size === Infinity) {
      return 0;
    }
    var ordered = isOrdered(iterable);
    var keyed = isKeyed(iterable);
    var h = ordered ? 1 : 0;
    var size = iterable.__iterate(
      keyed ?
        ordered ?
          function(v, k)  { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
          function(v, k)  { h = h + hashMerge(hash(v), hash(k)) | 0; } :
        ordered ?
          function(v ) { h = 31 * h + hash(v) | 0; } :
          function(v ) { h = h + hash(v) | 0; }
    );
    return murmurHashOfSize(size, h);
  }

  function murmurHashOfSize(size, h) {
    h = imul(h, 0xCC9E2D51);
    h = imul(h << 15 | h >>> -15, 0x1B873593);
    h = imul(h << 13 | h >>> -13, 5);
    h = (h + 0xE6546B64 | 0) ^ size;
    h = imul(h ^ h >>> 16, 0x85EBCA6B);
    h = imul(h ^ h >>> 13, 0xC2B2AE35);
    h = smi(h ^ h >>> 16);
    return h;
  }

  function hashMerge(a, b) {
    return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
  }

  var Immutable = {

    Iterable: Iterable,

    Seq: Seq,
    Collection: Collection,
    Map: Map,
    OrderedMap: OrderedMap,
    List: List,
    Stack: Stack,
    Set: Set,
    OrderedSet: OrderedSet,

    Record: Record,
    Range: Range,
    Repeat: Repeat,

    is: is,
    fromJS: fromJS

  };

  return Immutable;

}));
},{}],3:[function(_dereq_,module,exports){
module.exports = function () {
    function arrayCopy(source, array) {
        var index = -1, length = source.length;
        array || (array = Array(length));
        while (++index < length) {
            array[index] = source[index];
        }
        return array;
    }
    return arrayCopy;
}();
},{}],4:[function(_dereq_,module,exports){
module.exports = function () {
    function arrayEach(array, iteratee) {
        var index = -1, length = array.length;
        while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    }
    return arrayEach;
}();
},{}],5:[function(_dereq_,module,exports){
module.exports = function () {
    function assignDefaults(objectValue, sourceValue) {
        return typeof objectValue == 'undefined' ? sourceValue : objectValue;
    }
    return assignDefaults;
}();
},{}],6:[function(_dereq_,module,exports){
module.exports = function (baseCopy, keys) {
    function baseAssign(object, source, customizer) {
        var props = keys(source);
        if (!customizer) {
            return baseCopy(source, object, props);
        }
        var index = -1, length = props.length;
        while (++index < length) {
            var key = props[index], value = object[key], result = customizer(value, source[key], key, object, source);
            if ((result === result ? result !== value : value === value) || typeof value == 'undefined' && !(key in object)) {
                object[key] = result;
            }
        }
        return object;
    }
    return baseAssign;
}(_dereq_('./baseCopy'), _dereq_('../object/keys'));
},{"../object/keys":40,"./baseCopy":8}],7:[function(_dereq_,module,exports){
module.exports = function (arrayCopy, arrayEach, baseCopy, baseForOwn, initCloneArray, initCloneByTag, initCloneObject, isArray, isObject, keys) {
    var argsTag = '[object Arguments]', arrayTag = '[object Array]', boolTag = '[object Boolean]', dateTag = '[object Date]', errorTag = '[object Error]', funcTag = '[object Function]', mapTag = '[object Map]', numberTag = '[object Number]', objectTag = '[object Object]', regexpTag = '[object RegExp]', setTag = '[object Set]', stringTag = '[object String]', weakMapTag = '[object WeakMap]';
    var arrayBufferTag = '[object ArrayBuffer]', float32Tag = '[object Float32Array]', float64Tag = '[object Float64Array]', int8Tag = '[object Int8Array]', int16Tag = '[object Int16Array]', int32Tag = '[object Int32Array]', uint8Tag = '[object Uint8Array]', uint8ClampedTag = '[object Uint8ClampedArray]', uint16Tag = '[object Uint16Array]', uint32Tag = '[object Uint32Array]';
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[mapTag] = cloneableTags[setTag] = cloneableTags[weakMapTag] = false;
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
        var result;
        if (customizer) {
            result = object ? customizer(value, key, object) : customizer(value);
        }
        if (typeof result != 'undefined') {
            return result;
        }
        if (!isObject(value)) {
            return value;
        }
        var isArr = isArray(value);
        if (isArr) {
            result = initCloneArray(value);
            if (!isDeep) {
                return arrayCopy(value, result);
            }
        } else {
            var tag = objToString.call(value), isFunc = tag == funcTag;
            if (tag == objectTag || tag == argsTag || isFunc && !object) {
                result = initCloneObject(isFunc ? {} : value);
                if (!isDeep) {
                    return baseCopy(value, result, keys(value));
                }
            } else {
                return cloneableTags[tag] ? initCloneByTag(value, tag, isDeep) : object ? value : {};
            }
        }
        stackA || (stackA = []);
        stackB || (stackB = []);
        var length = stackA.length;
        while (length--) {
            if (stackA[length] == value) {
                return stackB[length];
            }
        }
        stackA.push(value);
        stackB.push(result);
        (isArr ? arrayEach : baseForOwn)(value, function (subValue, key) {
            result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
        });
        return result;
    }
    return baseClone;
}(_dereq_('./arrayCopy'), _dereq_('./arrayEach'), _dereq_('./baseCopy'), _dereq_('./baseForOwn'), _dereq_('./initCloneArray'), _dereq_('./initCloneByTag'), _dereq_('./initCloneObject'), _dereq_('../lang/isArray'), _dereq_('../lang/isObject'), _dereq_('../object/keys'));
},{"../lang/isArray":32,"../lang/isObject":34,"../object/keys":40,"./arrayCopy":3,"./arrayEach":4,"./baseCopy":8,"./baseForOwn":11,"./initCloneArray":19,"./initCloneByTag":20,"./initCloneObject":21}],8:[function(_dereq_,module,exports){
module.exports = function () {
    function baseCopy(source, object, props) {
        if (!props) {
            props = object;
            object = {};
        }
        var index = -1, length = props.length;
        while (++index < length) {
            var key = props[index];
            object[key] = source[key];
        }
        return object;
    }
    return baseCopy;
}();
},{}],9:[function(_dereq_,module,exports){
module.exports = function (toObject) {
    function baseFor(object, iteratee, keysFunc) {
        var index = -1, iterable = toObject(object), props = keysFunc(object), length = props.length;
        while (++index < length) {
            var key = props[index];
            if (iteratee(iterable[key], key, iterable) === false) {
                break;
            }
        }
        return object;
    }
    return baseFor;
}(_dereq_('./toObject'));
},{"./toObject":29}],10:[function(_dereq_,module,exports){
module.exports = function (baseFor, keysIn) {
    function baseForIn(object, iteratee) {
        return baseFor(object, iteratee, keysIn);
    }
    return baseForIn;
}(_dereq_('./baseFor'), _dereq_('../object/keysIn'));
},{"../object/keysIn":41,"./baseFor":9}],11:[function(_dereq_,module,exports){
module.exports = function (baseFor, keys) {
    function baseForOwn(object, iteratee) {
        return baseFor(object, iteratee, keys);
    }
    return baseForOwn;
}(_dereq_('./baseFor'), _dereq_('../object/keys'));
},{"../object/keys":40,"./baseFor":9}],12:[function(_dereq_,module,exports){
module.exports = function (arrayEach, baseForOwn, baseMergeDeep, isArray, isLength, isObject, isObjectLike, isTypedArray) {
    var undefined;
    function baseMerge(object, source, customizer, stackA, stackB) {
        if (!isObject(object)) {
            return object;
        }
        var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
        (isSrcArr ? arrayEach : baseForOwn)(source, function (srcValue, key, source) {
            if (isObjectLike(srcValue)) {
                stackA || (stackA = []);
                stackB || (stackB = []);
                return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
            }
            var value = object[key], result = customizer ? customizer(value, srcValue, key, object, source) : undefined, isCommon = typeof result == 'undefined';
            if (isCommon) {
                result = srcValue;
            }
            if ((isSrcArr || typeof result != 'undefined') && (isCommon || (result === result ? result !== value : value === value))) {
                object[key] = result;
            }
        });
        return object;
    }
    return baseMerge;
}(_dereq_('./arrayEach'), _dereq_('./baseForOwn'), _dereq_('./baseMergeDeep'), _dereq_('../lang/isArray'), _dereq_('./isLength'), _dereq_('../lang/isObject'), _dereq_('./isObjectLike'), _dereq_('../lang/isTypedArray'));
},{"../lang/isArray":32,"../lang/isObject":34,"../lang/isTypedArray":36,"./arrayEach":4,"./baseForOwn":11,"./baseMergeDeep":13,"./isLength":24,"./isObjectLike":25}],13:[function(_dereq_,module,exports){
module.exports = function (arrayCopy, isArguments, isArray, isLength, isPlainObject, isTypedArray, toPlainObject) {
    var undefined;
    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
        var length = stackA.length, srcValue = source[key];
        while (length--) {
            if (stackA[length] == srcValue) {
                object[key] = stackB[length];
                return;
            }
        }
        var value = object[key], result = customizer ? customizer(value, srcValue, key, object, source) : undefined, isCommon = typeof result == 'undefined';
        if (isCommon) {
            result = srcValue;
            if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
                result = isArray(value) ? value : value ? arrayCopy(value) : [];
            } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
                result = isArguments(value) ? toPlainObject(value) : isPlainObject(value) ? value : {};
            } else {
                isCommon = false;
            }
        }
        stackA.push(srcValue);
        stackB.push(result);
        if (isCommon) {
            object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
        } else if (result === result ? result !== value : value === value) {
            object[key] = result;
        }
    }
    return baseMergeDeep;
}(_dereq_('./arrayCopy'), _dereq_('../lang/isArguments'), _dereq_('../lang/isArray'), _dereq_('./isLength'), _dereq_('../lang/isPlainObject'), _dereq_('../lang/isTypedArray'), _dereq_('../lang/toPlainObject'));
},{"../lang/isArguments":31,"../lang/isArray":32,"../lang/isPlainObject":35,"../lang/isTypedArray":36,"../lang/toPlainObject":37,"./arrayCopy":3,"./isLength":24}],14:[function(_dereq_,module,exports){
module.exports = function () {
    function baseToString(value) {
        if (typeof value == 'string') {
            return value;
        }
        return value == null ? '' : value + '';
    }
    return baseToString;
}();
},{}],15:[function(_dereq_,module,exports){
module.exports = function (identity) {
    function bindCallback(func, thisArg, argCount) {
        if (typeof func != 'function') {
            return identity;
        }
        if (typeof thisArg == 'undefined') {
            return func;
        }
        switch (argCount) {
        case 1:
            return function (value) {
                return func.call(thisArg, value);
            };
        case 3:
            return function (value, index, collection) {
                return func.call(thisArg, value, index, collection);
            };
        case 4:
            return function (accumulator, value, index, collection) {
                return func.call(thisArg, accumulator, value, index, collection);
            };
        case 5:
            return function (value, other, key, object, source) {
                return func.call(thisArg, value, other, key, object, source);
            };
        }
        return function () {
            return func.apply(thisArg, arguments);
        };
    }
    return bindCallback;
}(_dereq_('../utility/identity'));
},{"../utility/identity":47}],16:[function(_dereq_,module,exports){
module.exports = function (constant, isNative, root) {
    var ArrayBuffer = isNative(ArrayBuffer = root.ArrayBuffer) && ArrayBuffer, bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice, floor = Math.floor, Uint8Array = isNative(Uint8Array = root.Uint8Array) && Uint8Array;
    var Float64Array = function () {
        try {
            var func = isNative(func = root.Float64Array) && func, result = new func(new ArrayBuffer(10), 0, 1) && func;
        } catch (e) {
        }
        return result;
    }();
    var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;
    function bufferClone(buffer) {
        return bufferSlice.call(buffer, 0);
    }
    if (!bufferSlice) {
        bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function (buffer) {
            var byteLength = buffer.byteLength, floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0, offset = floatLength * FLOAT64_BYTES_PER_ELEMENT, result = new ArrayBuffer(byteLength);
            if (floatLength) {
                var view = new Float64Array(result, 0, floatLength);
                view.set(new Float64Array(buffer, 0, floatLength));
            }
            if (byteLength != offset) {
                view = new Uint8Array(result, offset);
                view.set(new Uint8Array(buffer, offset));
            }
            return result;
        };
    }
    return bufferClone;
}(_dereq_('../utility/constant'), _dereq_('../lang/isNative'), _dereq_('./root'));
},{"../lang/isNative":33,"../utility/constant":46,"./root":26}],17:[function(_dereq_,module,exports){
module.exports = function (bindCallback, isIterateeCall) {
    function createAssigner(assigner) {
        return function () {
            var args = arguments, length = args.length, object = args[0];
            if (length < 2 || object == null) {
                return object;
            }
            var customizer = args[length - 2], thisArg = args[length - 1], guard = args[3];
            if (length > 3 && typeof customizer == 'function') {
                customizer = bindCallback(customizer, thisArg, 5);
                length -= 2;
            } else {
                customizer = length > 2 && typeof thisArg == 'function' ? thisArg : null;
                length -= customizer ? 1 : 0;
            }
            if (guard && isIterateeCall(args[1], args[2], guard)) {
                customizer = length == 3 ? null : customizer;
                length = 2;
            }
            var index = 0;
            while (++index < length) {
                var source = args[index];
                if (source) {
                    assigner(object, source, customizer);
                }
            }
            return object;
        };
    }
    return createAssigner;
}(_dereq_('./bindCallback'), _dereq_('./isIterateeCall'));
},{"./bindCallback":15,"./isIterateeCall":23}],18:[function(_dereq_,module,exports){
module.exports = function () {
    var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;',
        '`': '&#96;'
    };
    function escapeHtmlChar(chr) {
        return htmlEscapes[chr];
    }
    return escapeHtmlChar;
}();
},{}],19:[function(_dereq_,module,exports){
module.exports = function () {
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function initCloneArray(array) {
        var length = array.length, result = new array.constructor(length);
        if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
            result.index = array.index;
            result.input = array.input;
        }
        return result;
    }
    return initCloneArray;
}();
},{}],20:[function(_dereq_,module,exports){
module.exports = function (bufferClone) {
    var boolTag = '[object Boolean]', dateTag = '[object Date]', numberTag = '[object Number]', regexpTag = '[object RegExp]', stringTag = '[object String]';
    var arrayBufferTag = '[object ArrayBuffer]', float32Tag = '[object Float32Array]', float64Tag = '[object Float64Array]', int8Tag = '[object Int8Array]', int16Tag = '[object Int16Array]', int32Tag = '[object Int32Array]', uint8Tag = '[object Uint8Array]', uint8ClampedTag = '[object Uint8ClampedArray]', uint16Tag = '[object Uint16Array]', uint32Tag = '[object Uint32Array]';
    var reFlags = /\w*$/;
    function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
        case arrayBufferTag:
            return bufferClone(object);
        case boolTag:
        case dateTag:
            return new Ctor(+object);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
            var buffer = object.buffer;
            return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
        case numberTag:
        case stringTag:
            return new Ctor(object);
        case regexpTag:
            var result = new Ctor(object.source, reFlags.exec(object));
            result.lastIndex = object.lastIndex;
        }
        return result;
    }
    return initCloneByTag;
}(_dereq_('./bufferClone'));
},{"./bufferClone":16}],21:[function(_dereq_,module,exports){
module.exports = function () {
    function initCloneObject(object) {
        var Ctor = object.constructor;
        if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
            Ctor = Object;
        }
        return new Ctor();
    }
    return initCloneObject;
}();
},{}],22:[function(_dereq_,module,exports){
module.exports = function () {
    var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    function isIndex(value, length) {
        value = +value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return value > -1 && value % 1 == 0 && value < length;
    }
    return isIndex;
}();
},{}],23:[function(_dereq_,module,exports){
module.exports = function (isIndex, isLength, isObject) {
    function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
            return false;
        }
        var type = typeof index;
        if (type == 'number') {
            var length = object.length, prereq = isLength(length) && isIndex(index, length);
        } else {
            prereq = type == 'string' && index in object;
        }
        if (prereq) {
            var other = object[index];
            return value === value ? value === other : other !== other;
        }
        return false;
    }
    return isIterateeCall;
}(_dereq_('./isIndex'), _dereq_('./isLength'), _dereq_('../lang/isObject'));
},{"../lang/isObject":34,"./isIndex":22,"./isLength":24}],24:[function(_dereq_,module,exports){
module.exports = function () {
    var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    function isLength(value) {
        return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    return isLength;
}();
},{}],25:[function(_dereq_,module,exports){
module.exports = function () {
    function isObjectLike(value) {
        return value && typeof value == 'object' || false;
    }
    return isObjectLike;
}();
},{}],26:[function(_dereq_,module,exports){
(function (global){
module.exports = function () {
    var objectTypes = {
        'function': true,
        'object': true
    };
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
    var freeWindow = objectTypes[typeof window] && window;
    var root = freeGlobal || freeWindow !== (this && this.window) && freeWindow || this;
    return root;
}();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(_dereq_,module,exports){
module.exports = function (baseForIn, isObjectLike) {
    var objectTag = '[object Object]';
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objToString = objectProto.toString;
    function shimIsPlainObject(value) {
        var Ctor;
        if (!(isObjectLike(value) && objToString.call(value) == objectTag) || !hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor))) {
            return false;
        }
        var result;
        baseForIn(value, function (subValue, key) {
            result = key;
        });
        return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }
    return shimIsPlainObject;
}(_dereq_('./baseForIn'), _dereq_('./isObjectLike'));
},{"./baseForIn":10,"./isObjectLike":25}],28:[function(_dereq_,module,exports){
module.exports = function (isArguments, isArray, isIndex, isLength, keysIn, support) {
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function shimKeys(object) {
        var props = keysIn(object), propsLength = props.length, length = propsLength && object.length;
        var allowIndexes = length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object));
        var index = -1, result = [];
        while (++index < propsLength) {
            var key = props[index];
            if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
                result.push(key);
            }
        }
        return result;
    }
    return shimKeys;
}(_dereq_('../lang/isArguments'), _dereq_('../lang/isArray'), _dereq_('./isIndex'), _dereq_('./isLength'), _dereq_('../object/keysIn'), _dereq_('../support'));
},{"../lang/isArguments":31,"../lang/isArray":32,"../object/keysIn":41,"../support":45,"./isIndex":22,"./isLength":24}],29:[function(_dereq_,module,exports){
module.exports = function (isObject) {
    function toObject(value) {
        return isObject(value) ? value : Object(value);
    }
    return toObject;
}(_dereq_('../lang/isObject'));
},{"../lang/isObject":34}],30:[function(_dereq_,module,exports){
module.exports = function (baseClone, bindCallback) {
    function cloneDeep(value, customizer, thisArg) {
        customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
        return baseClone(value, true, customizer);
    }
    return cloneDeep;
}(_dereq_('../internal/baseClone'), _dereq_('../internal/bindCallback'));
},{"../internal/baseClone":7,"../internal/bindCallback":15}],31:[function(_dereq_,module,exports){
module.exports = function (isLength, isObjectLike) {
    var undefined;
    var argsTag = '[object Arguments]';
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function isArguments(value) {
        var length = isObjectLike(value) ? value.length : undefined;
        return isLength(length) && objToString.call(value) == argsTag || false;
    }
    return isArguments;
}(_dereq_('../internal/isLength'), _dereq_('../internal/isObjectLike'));
},{"../internal/isLength":24,"../internal/isObjectLike":25}],32:[function(_dereq_,module,exports){
module.exports = function (isLength, isNative, isObjectLike) {
    var arrayTag = '[object Array]';
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;
    var isArray = nativeIsArray || function (value) {
        return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag || false;
    };
    return isArray;
}(_dereq_('../internal/isLength'), _dereq_('./isNative'), _dereq_('../internal/isObjectLike'));
},{"../internal/isLength":24,"../internal/isObjectLike":25,"./isNative":33}],33:[function(_dereq_,module,exports){
module.exports = function (escapeRegExp, isObjectLike) {
    var funcTag = '[object Function]';
    var reHostCtor = /^\[object .+?Constructor\]$/;
    var objectProto = Object.prototype;
    var fnToString = Function.prototype.toString;
    var objToString = objectProto.toString;
    var reNative = RegExp('^' + escapeRegExp(objToString).replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
    function isNative(value) {
        if (value == null) {
            return false;
        }
        if (objToString.call(value) == funcTag) {
            return reNative.test(fnToString.call(value));
        }
        return isObjectLike(value) && reHostCtor.test(value) || false;
    }
    return isNative;
}(_dereq_('../string/escapeRegExp'), _dereq_('../internal/isObjectLike'));
},{"../internal/isObjectLike":25,"../string/escapeRegExp":44}],34:[function(_dereq_,module,exports){
module.exports = function () {
    function isObject(value) {
        var type = typeof value;
        return type == 'function' || value && type == 'object' || false;
    }
    return isObject;
}();
},{}],35:[function(_dereq_,module,exports){
module.exports = function (isNative, shimIsPlainObject) {
    var objectTag = '[object Object]';
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    var getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf;
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function (value) {
        if (!(value && objToString.call(value) == objectTag)) {
            return false;
        }
        var valueOf = value.valueOf, objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);
        return objProto ? value == objProto || getPrototypeOf(value) == objProto : shimIsPlainObject(value);
    };
    return isPlainObject;
}(_dereq_('./isNative'), _dereq_('../internal/shimIsPlainObject'));
},{"../internal/shimIsPlainObject":27,"./isNative":33}],36:[function(_dereq_,module,exports){
module.exports = function (isLength, isObjectLike) {
    var argsTag = '[object Arguments]', arrayTag = '[object Array]', boolTag = '[object Boolean]', dateTag = '[object Date]', errorTag = '[object Error]', funcTag = '[object Function]', mapTag = '[object Map]', numberTag = '[object Number]', objectTag = '[object Object]', regexpTag = '[object RegExp]', setTag = '[object Set]', stringTag = '[object String]', weakMapTag = '[object WeakMap]';
    var arrayBufferTag = '[object ArrayBuffer]', float32Tag = '[object Float32Array]', float64Tag = '[object Float64Array]', int8Tag = '[object Int8Array]', int16Tag = '[object Int16Array]', int32Tag = '[object Int32Array]', uint8Tag = '[object Uint8Array]', uint8ClampedTag = '[object Uint8ClampedArray]', uint16Tag = '[object Uint16Array]', uint32Tag = '[object Uint32Array]';
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function isTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)] || false;
    }
    return isTypedArray;
}(_dereq_('../internal/isLength'), _dereq_('../internal/isObjectLike'));
},{"../internal/isLength":24,"../internal/isObjectLike":25}],37:[function(_dereq_,module,exports){
module.exports = function (baseCopy, keysIn) {
    function toPlainObject(value) {
        return baseCopy(value, keysIn(value));
    }
    return toPlainObject;
}(_dereq_('../internal/baseCopy'), _dereq_('../object/keysIn'));
},{"../internal/baseCopy":8,"../object/keysIn":41}],38:[function(_dereq_,module,exports){
module.exports = function (baseAssign, createAssigner) {
    var assign = createAssigner(baseAssign);
    return assign;
}(_dereq_('../internal/baseAssign'), _dereq_('../internal/createAssigner'));
},{"../internal/baseAssign":6,"../internal/createAssigner":17}],39:[function(_dereq_,module,exports){
module.exports = function (arrayCopy, assign, assignDefaults) {
    var undefined;
    function defaults(object) {
        if (object == null) {
            return object;
        }
        var args = arrayCopy(arguments);
        args.push(assignDefaults);
        return assign.apply(undefined, args);
    }
    return defaults;
}(_dereq_('../internal/arrayCopy'), _dereq_('./assign'), _dereq_('../internal/assignDefaults'));
},{"../internal/arrayCopy":3,"../internal/assignDefaults":5,"./assign":38}],40:[function(_dereq_,module,exports){
module.exports = function (isLength, isNative, isObject, shimKeys) {
    var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;
    var keys = !nativeKeys ? shimKeys : function (object) {
        if (object) {
            var Ctor = object.constructor, length = object.length;
        }
        if (typeof Ctor == 'function' && Ctor.prototype === object || typeof object != 'function' && (length && isLength(length))) {
            return shimKeys(object);
        }
        return isObject(object) ? nativeKeys(object) : [];
    };
    return keys;
}(_dereq_('../internal/isLength'), _dereq_('../lang/isNative'), _dereq_('../lang/isObject'), _dereq_('../internal/shimKeys'));
},{"../internal/isLength":24,"../internal/shimKeys":28,"../lang/isNative":33,"../lang/isObject":34}],41:[function(_dereq_,module,exports){
module.exports = function (isArguments, isArray, isIndex, isLength, isObject, support) {
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function keysIn(object) {
        if (object == null) {
            return [];
        }
        if (!isObject(object)) {
            object = Object(object);
        }
        var length = object.length;
        length = length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object)) && length || 0;
        var Ctor = object.constructor, index = -1, isProto = typeof Ctor == 'function' && Ctor.prototype === object, result = Array(length), skipIndexes = length > 0;
        while (++index < length) {
            result[index] = index + '';
        }
        for (var key in object) {
            if (!(skipIndexes && isIndex(key, length)) && !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
                result.push(key);
            }
        }
        return result;
    }
    return keysIn;
}(_dereq_('../lang/isArguments'), _dereq_('../lang/isArray'), _dereq_('../internal/isIndex'), _dereq_('../internal/isLength'), _dereq_('../lang/isObject'), _dereq_('../support'));
},{"../internal/isIndex":22,"../internal/isLength":24,"../lang/isArguments":31,"../lang/isArray":32,"../lang/isObject":34,"../support":45}],42:[function(_dereq_,module,exports){
module.exports = function (baseMerge, createAssigner) {
    var merge = createAssigner(baseMerge);
    return merge;
}(_dereq_('../internal/baseMerge'), _dereq_('../internal/createAssigner'));
},{"../internal/baseMerge":12,"../internal/createAssigner":17}],43:[function(_dereq_,module,exports){
module.exports = function (baseToString, escapeHtmlChar) {
    var reUnescapedHtml = /[&<>"'`]/g, reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    function escape(string) {
        string = baseToString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
    }
    return escape;
}(_dereq_('../internal/baseToString'), _dereq_('../internal/escapeHtmlChar'));
},{"../internal/baseToString":14,"../internal/escapeHtmlChar":18}],44:[function(_dereq_,module,exports){
module.exports = function (baseToString) {
    var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g, reHasRegExpChars = RegExp(reRegExpChars.source);
    function escapeRegExp(string) {
        string = baseToString(string);
        return string && reHasRegExpChars.test(string) ? string.replace(reRegExpChars, '\\$&') : string;
    }
    return escapeRegExp;
}(_dereq_('../internal/baseToString'));
},{"../internal/baseToString":14}],45:[function(_dereq_,module,exports){
module.exports = function (isNative, root) {
    var reThis = /\bthis\b/;
    var objectProto = Object.prototype;
    var document = (document = root.window) && document.document;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var support = {};
    (function (x) {
        support.funcDecomp = !isNative(root.WinRTError) && reThis.test(function () {
            return this;
        });
        support.funcNames = typeof Function.name == 'string';
        try {
            support.dom = document.createDocumentFragment().nodeType === 11;
        } catch (e) {
            support.dom = false;
        }
        try {
            support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
        } catch (e) {
            support.nonEnumArgs = true;
        }
    }(0, 0));
    return support;
}(_dereq_('./lang/isNative'), _dereq_('./internal/root'));
},{"./internal/root":26,"./lang/isNative":33}],46:[function(_dereq_,module,exports){
module.exports = function () {
    function constant(value) {
        return function () {
            return value;
        };
    }
    return constant;
}();
},{}],47:[function(_dereq_,module,exports){
module.exports = function () {
    function identity(value) {
        return value;
    }
    return identity;
}();
},{}],48:[function(_dereq_,module,exports){
module.exports = function (buildCommandPatch, buildCommand, buildSelection, buildSimpleCommand) {
    'use strict';
    return function Api(scribe) {
        this.CommandPatch = buildCommandPatch(scribe);
        this.Command = buildCommand(scribe);
        this.Selection = buildSelection(scribe);
        this.SimpleCommand = buildSimpleCommand(this, scribe);
    };
}(_dereq_('./api/command-patch'), _dereq_('./api/command'), _dereq_('./api/selection'), _dereq_('./api/simple-command'));
},{"./api/command":50,"./api/command-patch":49,"./api/selection":51,"./api/simple-command":52}],49:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function (scribe) {
        function CommandPatch(commandName) {
            this.commandName = commandName;
        }
        CommandPatch.prototype.execute = function (value) {
            scribe.transactionManager.run(function () {
                document.execCommand(this.commandName, false, value || null);
            }.bind(this));
        };
        CommandPatch.prototype.queryState = function () {
            return document.queryCommandState(this.commandName);
        };
        CommandPatch.prototype.queryEnabled = function () {
            return document.queryCommandEnabled(this.commandName);
        };
        return CommandPatch;
    };
}();
},{}],50:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function (scribe) {
        function Command(commandName) {
            this.commandName = commandName;
            this.patch = scribe.commandPatches[this.commandName];
        }
        Command.prototype.execute = function (value) {
            if (this.patch) {
                this.patch.execute(value);
            } else {
                scribe.transactionManager.run(function () {
                    document.execCommand(this.commandName, false, value || null);
                }.bind(this));
            }
        };
        Command.prototype.queryState = function () {
            if (this.patch) {
                return this.patch.queryState();
            } else {
                return document.queryCommandState(this.commandName);
            }
        };
        Command.prototype.queryEnabled = function () {
            if (this.patch) {
                return this.patch.queryEnabled();
            } else {
                return document.queryCommandEnabled(this.commandName);
            }
        };
        return Command;
    };
}();
},{}],51:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function (scribe) {
        var rootDoc = scribe.el.ownerDocument;
        var nodeHelpers = scribe.node;
        if (rootDoc.compareDocumentPosition(scribe.el) & Node.DOCUMENT_POSITION_DISCONNECTED) {
            var currentElement = scribe.el.parentNode;
            while (currentElement && nodeHelpers.isFragment(currentElement)) {
                currentElement = currentElement.parentNode;
            }
            if (currentElement && currentElement.getSelection) {
                rootDoc = currentElement;
            }
        }
        function createMarker() {
            var node = document.createElement('em');
            node.style.display = 'none';
            node.classList.add('scribe-marker');
            return node;
        }
        function insertMarker(range, marker) {
            range.insertNode(marker);
            if (marker.nextSibling && nodeHelpers.isEmptyTextNode(marker.nextSibling)) {
                nodeHelpers.removeNode(marker.nextSibling);
            }
            if (marker.previousSibling && nodeHelpers.isEmptyTextNode(marker.previousSibling)) {
                nodeHelpers.removeNode(marker.previousSibling);
            }
        }
        function Selection() {
            this.selection = rootDoc.getSelection();
            if (this.selection.rangeCount && this.selection.anchorNode) {
                var startNode = this.selection.anchorNode;
                var startOffset = this.selection.anchorOffset;
                var endNode = this.selection.focusNode;
                var endOffset = this.selection.focusOffset;
                if (startNode === endNode && endOffset < startOffset) {
                    var tmp = startOffset;
                    startOffset = endOffset;
                    endOffset = tmp;
                } else if (nodeHelpers.isBefore(endNode, startNode)) {
                    var tmpNode = startNode, tmpOffset = startOffset;
                    startNode = endNode;
                    startOffset = endOffset;
                    endNode = tmpNode;
                    endOffset = tmpOffset;
                }
                this.range = document.createRange();
                this.range.setStart(startNode, startOffset);
                this.range.setEnd(endNode, endOffset);
            }
        }
        Selection.prototype.getContaining = function (nodeFilter) {
            var range = this.range;
            if (!range) {
                return;
            }
            var node = this.range.commonAncestorContainer;
            return !(node && scribe.el === node) && nodeFilter(node) ? node : nodeHelpers.getAncestor(node, scribe.el, nodeFilter);
        };
        Selection.prototype.placeMarkers = function () {
            var range = this.range;
            if (!range) {
                return;
            }
            if (!document.contains(scribe.el)) {
                return;
            }
            if (scribe.el.contains(range.startContainer) && scribe.el.contains(range.endContainer)) {
                insertMarker(range.cloneRange(), createMarker());
                if (!range.collapsed) {
                    var rangeEnd = range.cloneRange();
                    rangeEnd.collapse(false);
                    insertMarker(rangeEnd, createMarker());
                }
                this.selection.removeAllRanges();
                this.selection.addRange(range);
            }
        };
        Selection.prototype.getMarkers = function () {
            return scribe.el.querySelectorAll('em.scribe-marker');
        };
        Selection.prototype.removeMarkers = function () {
            Array.prototype.forEach.call(this.getMarkers(), function (marker) {
                var markerParent = marker.parentNode;
                nodeHelpers.removeNode(marker);
                markerParent.normalize();
            });
        };
        Selection.prototype.selectMarkers = function (keepMarkers) {
            var markers = this.getMarkers();
            if (!markers.length) {
                return;
            }
            var newRange = document.createRange();
            newRange.setStartBefore(markers[0]);
            newRange.setEndAfter(markers.length >= 2 ? markers[1] : markers[0]);
            if (!keepMarkers) {
                this.removeMarkers();
            }
            this.selection.removeAllRanges();
            this.selection.addRange(newRange);
        };
        Selection.prototype.isCaretOnNewLine = function () {
            var containerPElement = this.getContaining(function (node) {
                return node.nodeName === 'P';
            });
            return !!containerPElement && nodeHelpers.isEmptyInlineElement(containerPElement);
        };
        return Selection;
    };
}();
},{}],52:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function (api, scribe) {
        function SimpleCommand(commandName, nodeName) {
            scribe.api.Command.call(this, commandName);
            this._nodeName = nodeName;
        }
        SimpleCommand.prototype = Object.create(api.Command.prototype);
        SimpleCommand.prototype.constructor = SimpleCommand;
        SimpleCommand.prototype.queryState = function () {
            var selection = new scribe.api.Selection();
            return scribe.api.Command.prototype.queryState.call(this) && !!selection.getContaining(function (node) {
                return node.nodeName === this._nodeName;
            }.bind(this));
        };
        return SimpleCommand;
    };
}();
},{}],53:[function(_dereq_,module,exports){
module.exports = function (defaults) {
    var blockModePlugins = [
            'setRootPElement',
            'enforcePElements',
            'ensureSelectableContainers'
        ], inlineModePlugins = ['inlineElementsMode'], defaultOptions = {
            allowBlockElements: true,
            debug: false,
            undo: {
                manager: false,
                enabled: true,
                limit: 100,
                interval: 250
            },
            defaultCommandPatches: [
                'bold',
                'indent',
                'insertHTML',
                'insertList',
                'outdent',
                'createLink'
            ],
            defaultPlugins: blockModePlugins.concat(inlineModePlugins),
            defaultFormatters: [
                'escapeHtmlCharactersFormatter',
                'replaceNbspCharsFormatter'
            ]
        };
    function checkOptions(userSuppliedOptions) {
        var options = userSuppliedOptions || {};
        if (options.defaultPlugins) {
            options.defaultPlugins = options.defaultPlugins.filter(filterByPluginExists(defaultOptions.defaultPlugins));
        }
        if (options.defaultFormatters) {
            options.defaultFormatters = options.defaultFormatters.filter(filterByPluginExists(defaultOptions.defaultFormatters));
        }
        return Object.freeze(defaults(options, defaultOptions));
    }
    function sortByPlugin(priorityPlugin) {
        return function (pluginCurrent, pluginNext) {
            if (pluginCurrent === priorityPlugin) {
                return -1;
            } else if (pluginNext === priorityPlugin) {
                return 1;
            }
            return 0;
        };
    }
    function filterByBlockLevelMode(isBlockLevelMode) {
        return function (plugin) {
            return (isBlockLevelMode ? blockModePlugins : inlineModePlugins).indexOf(plugin) !== -1;
        };
    }
    function filterByPluginExists(pluginList) {
        return function (plugin) {
            return pluginList.indexOf(plugin) !== -1;
        };
    }
    return {
        defaultOptions: defaultOptions,
        checkOptions: checkOptions,
        sortByPlugin: sortByPlugin,
        filterByBlockLevelMode: filterByBlockLevelMode,
        filterByPluginExists: filterByPluginExists
    };
}(_dereq_('lodash-amd/modern/object/defaults'));
},{"lodash-amd/modern/object/defaults":39}],54:[function(_dereq_,module,exports){
module.exports = function (Immutable) {
    var blockElementNames = Immutable.Set.of('ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI', 'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD', 'TH', 'TFOOT', 'UL', 'VIDEO');
    return blockElementNames;
}(_dereq_('immutable'));
},{"immutable":2}],55:[function(_dereq_,module,exports){
module.exports = function (Immutable) {
    var inlineElementNames = Immutable.Set.of('B', 'BIG', 'I', 'SMALL', 'TT', 'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 'EM', 'KBD', 'STRONG', 'SAMP', 'VAR', 'A', 'BDO', 'BR', 'IMG', 'MAP', 'OBJECT', 'Q', 'SCRIPT', 'SPAN', 'SUB', 'SUP', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA');
    return inlineElementNames;
}(_dereq_('immutable'));
},{"immutable":2}],56:[function(_dereq_,module,exports){
module.exports = function (nodeHelpers, mutations) {
    var maybeWindow = typeof window === 'object' ? window : undefined;
    var MutationObserver = mutations.determineMutationObserver(maybeWindow);
    function hasRealMutation(n) {
        return !nodeHelpers.isEmptyTextNode(n) && !nodeHelpers.isSelectionMarkerNode(n);
    }
    function includeRealMutations(mutations) {
        return mutations.some(function (mutation) {
            return Array.prototype.some.call(mutation.addedNodes, hasRealMutation) || Array.prototype.some.call(mutation.removedNodes, hasRealMutation);
        });
    }
    function observeDomChanges(el, callback) {
        var runningPostMutation = false;
        var observer = new MutationObserver(function (mutations) {
            if (!runningPostMutation && includeRealMutations(mutations)) {
                runningPostMutation = true;
                try {
                    callback();
                } catch (e) {
                    throw e;
                } finally {
                    setTimeout(function () {
                        runningPostMutation = false;
                    }, 0);
                }
            }
        });
        observer.observe(el, {
            childList: true,
            subtree: true
        });
        return observer;
    }
    return observeDomChanges;
}(_dereq_('./node'), _dereq_('./mutations'));
},{"./mutations":58,"./node":59}],57:[function(_dereq_,module,exports){
module.exports = function (Immutable) {
    'use strict';
    function EventEmitter() {
        this._listeners = {};
    }
    EventEmitter.prototype.on = function (eventName, fn) {
        var listeners = this._listeners[eventName] || Immutable.Set();
        this._listeners[eventName] = listeners.add(fn);
    };
    EventEmitter.prototype.off = function (eventName, fn) {
        var listeners = this._listeners[eventName] || Immutable.Set();
        if (fn) {
            this._listeners[eventName] = listeners.delete(fn);
        } else {
            this._listeners[eventName] = listeners.clear();
        }
    };
    EventEmitter.prototype.trigger = function (eventName, args) {
        var events = eventName.split(':');
        while (!!events.length) {
            var currentEvent = events.join(':');
            var listeners = this._listeners[currentEvent] || Immutable.Set();
            listeners.forEach(function (listener) {
                listener.apply(null, args);
            });
            events.splice(events.length - 1, 1);
        }
    };
    return EventEmitter;
}(_dereq_('immutable'));
},{"immutable":2}],58:[function(_dereq_,module,exports){
module.exports = function () {
    function determineMutationObserver(window) {
        if (typeof window === 'undefined') {
            return function () {
                return {
                    observe: function () {
                    }
                };
            };
        } else {
            return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        }
    }
    return { determineMutationObserver: determineMutationObserver };
}();
},{}],59:[function(_dereq_,module,exports){
module.exports = function (inlineElementNames, blockElementNames, Immutable) {
    'use strict';
    function isBlockElement(node) {
        return blockElementNames.includes(node.nodeName);
    }
    function isInlineElement(node) {
        return inlineElementNames.includes(node.nodeName);
    }
    function isEmptyInlineElement(node) {
        if (node.children.length > 1)
            return false;
        if (node.children.length === 1 && node.textContent.trim() !== '')
            return false;
        if (node.children.length === 0)
            return node.textContent.trim() === '';
        return isEmptyInlineElement(node.children[0]);
    }
    function isText(node) {
        return node.nodeType === Node.TEXT_NODE;
    }
    function isEmptyTextNode(node) {
        return isText(node) && node.data === '';
    }
    function isFragment(node) {
        return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
    }
    function isBefore(node1, node2) {
        return node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_FOLLOWING;
    }
    function elementHasClass(Node, className) {
        return function (node) {
            return node.nodeType === Node.ELEMENT_NODE && node.className === className;
        };
    }
    function isSelectionMarkerNode(node) {
        return elementHasClass(Node, 'scribe-marker')(node);
    }
    function isCaretPositionNode(node) {
        return elementHasClass(Node, 'caret-position')(node);
    }
    function isNotObservableNode(node) {
        return elementHasClass(Node, 'scribe-not-observable')(node);
    }
    function firstDeepestChild(node) {
        var fs = node.firstChild;
        return !fs || fs.nodeName === 'BR' ? node : firstDeepestChild(fs);
    }
    function insertAfter(newNode, referenceNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    function removeNode(node) {
        return node.parentNode.removeChild(node);
    }
    function getAncestor(node, rootElement, nodeFilter) {
        function isTopContainerElement(element) {
            return rootElement === element;
        }
        if (isTopContainerElement(node)) {
            return;
        }
        var currentNode = node.parentNode;
        while (currentNode && !isTopContainerElement(currentNode)) {
            if (nodeFilter(currentNode)) {
                return currentNode;
            }
            currentNode = currentNode.parentNode;
        }
    }
    function nextSiblings(node) {
        var all = Immutable.List();
        while (node = node.nextSibling) {
            all = all.push(node);
        }
        return all;
    }
    function wrap(nodes, parentNode) {
        nodes[0].parentNode.insertBefore(parentNode, nodes[0]);
        nodes.forEach(function (node) {
            parentNode.appendChild(node);
        });
        return parentNode;
    }
    function unwrap(node, childNode) {
        while (childNode.childNodes.length > 0) {
            node.insertBefore(childNode.childNodes[0], childNode);
        }
        node.removeChild(childNode);
    }
    function removeChromeArtifacts(parentElement) {
        function isInlineWithStyle(parentStyle, element) {
            return window.getComputedStyle(element).lineHeight === parentStyle.lineHeight;
        }
        var nodes = Immutable.List(parentElement.querySelectorAll(inlineElementNames.map(function (elName) {
            return elName + '[style*="line-height"]';
        }).join(',')));
        nodes = nodes.filter(isInlineWithStyle.bind(null, window.getComputedStyle(parentElement)));
        var emptySpans = Immutable.List();
        nodes.forEach(function (node) {
            node.style.lineHeight = null;
            if (!node.getAttribute('style')) {
                node.removeAttribute('style');
            }
            if (node.nodeName === 'SPAN' && node.attributes.length === 0) {
                emptySpans = emptySpans.push(node);
            }
        });
        emptySpans.forEach(function (node) {
            unwrap(node.parentNode, node);
        });
    }
    return {
        isInlineElement: isInlineElement,
        isBlockElement: isBlockElement,
        isEmptyInlineElement: isEmptyInlineElement,
        isText: isText,
        isEmptyTextNode: isEmptyTextNode,
        isFragment: isFragment,
        isBefore: isBefore,
        isSelectionMarkerNode: isSelectionMarkerNode,
        isCaretPositionNode: isCaretPositionNode,
        firstDeepestChild: firstDeepestChild,
        insertAfter: insertAfter,
        removeNode: removeNode,
        getAncestor: getAncestor,
        nextSiblings: nextSiblings,
        wrap: wrap,
        unwrap: unwrap,
        removeChromeArtifacts: removeChromeArtifacts,
        elementHasClass: elementHasClass
    };
}(_dereq_('./constants/inline-element-names'), _dereq_('./constants/block-element-names'), _dereq_('immutable'));
},{"./constants/block-element-names":54,"./constants/inline-element-names":55,"immutable":2}],60:[function(_dereq_,module,exports){
module.exports = function (indent, insertList, outdent, redo, subscript, superscript, undo) {
    'use strict';
    return {
        indent: indent,
        insertList: insertList,
        outdent: outdent,
        redo: redo,
        subscript: subscript,
        superscript: superscript,
        undo: undo
    };
}(_dereq_('./commands/indent'), _dereq_('./commands/insert-list'), _dereq_('./commands/outdent'), _dereq_('./commands/redo'), _dereq_('./commands/subscript'), _dereq_('./commands/superscript'), _dereq_('./commands/undo'));
},{"./commands/indent":61,"./commands/insert-list":62,"./commands/outdent":63,"./commands/redo":64,"./commands/subscript":65,"./commands/superscript":66,"./commands/undo":67}],61:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var indentCommand = new scribe.api.Command('indent');
            indentCommand.queryEnabled = function () {
                var selection = new scribe.api.Selection();
                var listElement = selection.getContaining(function (element) {
                    return element.nodeName === 'UL' || element.nodeName === 'OL';
                });
                return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && !listElement;
            };
            scribe.commands.indent = indentCommand;
        };
    };
}();
},{}],62:[function(_dereq_,module,exports){
module.exports = function (Immutable) {
    'use strict';
    return function () {
        return function (scribe) {
            var nodeHelpers = scribe.node;
            var InsertListCommand = function (commandName) {
                scribe.api.Command.call(this, commandName);
            };
            InsertListCommand.prototype = Object.create(scribe.api.Command.prototype);
            InsertListCommand.prototype.constructor = InsertListCommand;
            InsertListCommand.prototype.execute = function (value) {
                function splitList(listItemElements) {
                    if (!!listItemElements.size) {
                        var newListNode = document.createElement(listNode.nodeName);
                        while (!!listItemElements.size) {
                            newListNode.appendChild(listItemElements.first());
                            listItemElements = listItemElements.shift();
                        }
                        listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
                    }
                }
                if (this.queryState()) {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var listNode = selection.getContaining(function (node) {
                        return node.nodeName === 'OL' || node.nodeName === 'UL';
                    });
                    var listItemElement = selection.getContaining(function (node) {
                        return node.nodeName === 'LI';
                    });
                    scribe.transactionManager.run(function () {
                        if (listItemElement) {
                            var nextListItemElements = nodeHelpers.nextSiblings(listItemElement);
                            splitList(nextListItemElements);
                            selection.placeMarkers();
                            var pNode = document.createElement('p');
                            pNode.innerHTML = listItemElement.innerHTML;
                            listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
                            listItemElement.parentNode.removeChild(listItemElement);
                        } else {
                            var selectedListItemElements = Immutable.List(listNode.querySelectorAll('li')).filter(function (listItemElement) {
                                return range.intersectsNode(listItemElement);
                            });
                            var lastSelectedListItemElement = selectedListItemElements.last();
                            var listItemElementsAfterSelection = nodeHelpers.nextSiblings(lastSelectedListItemElement);
                            splitList(listItemElementsAfterSelection);
                            selection.placeMarkers();
                            var documentFragment = document.createDocumentFragment();
                            selectedListItemElements.forEach(function (listItemElement) {
                                var pElement = document.createElement('p');
                                pElement.innerHTML = listItemElement.innerHTML;
                                documentFragment.appendChild(pElement);
                            });
                            listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling);
                            selectedListItemElements.forEach(function (listItemElement) {
                                listItemElement.parentNode.removeChild(listItemElement);
                            });
                        }
                        if (listNode.childNodes.length === 0) {
                            listNode.parentNode.removeChild(listNode);
                        }
                        selection.selectMarkers();
                    }.bind(this));
                } else {
                    scribe.api.Command.prototype.execute.call(this, value);
                }
            };
            InsertListCommand.prototype.queryEnabled = function () {
                return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements();
            };
            scribe.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
            scribe.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');
        };
    };
}(_dereq_('immutable'));
},{"immutable":2}],63:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var outdentCommand = new scribe.api.Command('outdent');
            outdentCommand.queryEnabled = function () {
                var selection = new scribe.api.Selection();
                var listElement = selection.getContaining(function (element) {
                    return element.nodeName === 'UL' || element.nodeName === 'OL';
                });
                return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && !listElement;
            };
            scribe.commands.outdent = outdentCommand;
        };
    };
}();
},{}],64:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var redoCommand = new scribe.api.Command('redo');
            redoCommand.execute = function () {
                scribe.undoManager.redo();
            };
            redoCommand.queryEnabled = function () {
                return scribe.undoManager.position > 0;
            };
            scribe.commands.redo = redoCommand;
            if (scribe.options.undo.enabled) {
                scribe.el.addEventListener('keydown', function (event) {
                    if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
                        event.preventDefault();
                        redoCommand.execute();
                    }
                });
            }
        };
    };
}();
},{}],65:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var subscriptCommand = new scribe.api.Command('subscript');
            scribe.commands.subscript = subscriptCommand;
        };
    };
}();
},{}],66:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var superscriptCommand = new scribe.api.Command('superscript');
            scribe.commands.superscript = superscriptCommand;
        };
    };
}();
},{}],67:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var undoCommand = new scribe.api.Command('undo');
            undoCommand.execute = function () {
                scribe.undoManager.undo();
            };
            undoCommand.queryEnabled = function () {
                return scribe.undoManager.position < scribe.undoManager.length;
            };
            scribe.commands.undo = undoCommand;
            if (scribe.options.undo.enabled) {
                scribe.el.addEventListener('keydown', function (event) {
                    if (!event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
                        event.preventDefault();
                        undoCommand.execute();
                    }
                });
            }
        };
    };
}();
},{}],68:[function(_dereq_,module,exports){
module.exports = function (observeDomChanges, Immutable) {
    'use strict';
    return function () {
        return function (scribe) {
            var nodeHelpers = scribe.node;
            scribe.el.addEventListener('focus', function placeCaretOnFocus() {
                var selection = new scribe.api.Selection();
                if (selection.range) {
                    var isFirefoxBug = scribe.allowsBlockElements() && selection.range.startContainer === scribe.el;
                    if (isFirefoxBug) {
                        var focusElement = nodeHelpers.firstDeepestChild(scribe.el);
                        var range = selection.range;
                        range.setStart(focusElement, 0);
                        range.setEnd(focusElement, 0);
                        selection.selection.removeAllRanges();
                        selection.selection.addRange(range);
                    }
                }
            }.bind(scribe));
            var applyFormatters = function () {
                if (!scribe._skipFormatters) {
                    var selection = new scribe.api.Selection();
                    var isEditorActive = selection.range;
                    var runFormatters = function () {
                        if (isEditorActive) {
                            selection.placeMarkers();
                        }
                        scribe.setHTML(scribe._htmlFormatterFactory.format(scribe.getHTML()));
                        selection.selectMarkers();
                    }.bind(scribe);
                    scribe.transactionManager.run(runFormatters);
                }
                delete scribe._skipFormatters;
            }.bind(scribe);
            observeDomChanges(scribe.el, applyFormatters);
            if (scribe.allowsBlockElements()) {
                scribe.el.addEventListener('keydown', function (event) {
                    if (event.keyCode === 13) {
                        var selection = new scribe.api.Selection();
                        var range = selection.range;
                        var headingNode = selection.getContaining(function (node) {
                            return /^(H[1-6])$/.test(node.nodeName);
                        });
                        if (headingNode && range.collapsed) {
                            var contentToEndRange = range.cloneRange();
                            contentToEndRange.setEndAfter(headingNode, 0);
                            var contentToEndFragment = contentToEndRange.cloneContents();
                            if (contentToEndFragment.firstChild.textContent === '') {
                                event.preventDefault();
                                scribe.transactionManager.run(function () {
                                    var pNode = document.createElement('p');
                                    var brNode = document.createElement('br');
                                    pNode.appendChild(brNode);
                                    headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);
                                    range.setStart(pNode, 0);
                                    range.setEnd(pNode, 0);
                                    selection.selection.removeAllRanges();
                                    selection.selection.addRange(range);
                                });
                            }
                        }
                    }
                });
            }
            if (scribe.allowsBlockElements()) {
                scribe.el.addEventListener('keydown', function (event) {
                    if (event.keyCode === 13 || event.keyCode === 8) {
                        var selection = new scribe.api.Selection();
                        var range = selection.range;
                        if (range.collapsed) {
                            var containerLIElement = selection.getContaining(function (node) {
                                return node.nodeName === 'LI';
                            });
                            if (containerLIElement && containerLIElement.textContent.trim() === '') {
                                event.preventDefault();
                                var listNode = selection.getContaining(function (node) {
                                    return node.nodeName === 'UL' || node.nodeName === 'OL';
                                });
                                var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
                                command.event = event;
                                command.execute();
                            }
                        }
                    }
                });
            }
            scribe.el.addEventListener('paste', function handlePaste(event) {
                if (event.clipboardData && event.clipboardData.types.length > 0) {
                    event.preventDefault();
                    if (Immutable.List(event.clipboardData.types).includes('text/html')) {
                        scribe.insertHTML(event.clipboardData.getData('text/html'));
                    } else {
                        scribe.insertPlainText(event.clipboardData.getData('text/plain'));
                    }
                } else {
                    var selection = new scribe.api.Selection();
                    selection.placeMarkers();
                    var bin = document.createElement('div');
                    document.body.appendChild(bin);
                    bin.setAttribute('contenteditable', true);
                    bin.focus();
                    setTimeout(function () {
                        var data = bin.innerHTML;
                        bin.parentNode.removeChild(bin);
                        selection.selectMarkers();
                        scribe.el.focus();
                        scribe.insertHTML(data);
                    }, 1);
                }
            });
        };
    };
}(_dereq_('../../dom-observer'), _dereq_('immutable'));
},{"../../dom-observer":56,"immutable":2}],69:[function(_dereq_,module,exports){
module.exports = function (replaceNbspCharsFormatter, escapeHtmlCharactersFormatter) {
    'use strict';
    return {
        replaceNbspCharsFormatter: replaceNbspCharsFormatter,
        escapeHtmlCharactersFormatter: escapeHtmlCharactersFormatter
    };
}(_dereq_('./formatters/html/replace-nbsp-chars'), _dereq_('./formatters/plain-text/escape-html-characters'));
},{"./formatters/html/replace-nbsp-chars":72,"./formatters/plain-text/escape-html-characters":73}],70:[function(_dereq_,module,exports){
module.exports = function (Immutable) {
    'use strict';
    return function () {
        return function (scribe) {
            var nodeHelpers = scribe.node;
            function wrapChildNodes(parentNode) {
                var index = 0;
                Immutable.List(parentNode.childNodes).filter(function (node) {
                    return node.nodeType === Node.TEXT_NODE || !nodeHelpers.isBlockElement(node);
                }).groupBy(function (node, key, list) {
                    return key === 0 || node.previousSibling === list.get(key - 1) ? index : index += 1;
                }).forEach(function (nodeGroup) {
                    nodeHelpers.wrap(nodeGroup.toArray(), document.createElement('p'));
                });
            }
            function traverse(parentNode) {
                var i = 0, node;
                while (node = parentNode.children[i++]) {
                    if (node.tagName === 'BLOCKQUOTE') {
                        wrapChildNodes(node);
                    }
                }
            }
            scribe.registerHTMLFormatter('normalize', function (html) {
                var bin = document.createElement('div');
                bin.innerHTML = html;
                wrapChildNodes(bin);
                traverse(bin);
                return bin.innerHTML;
            });
        };
    };
}(_dereq_('immutable'));
},{"immutable":2}],71:[function(_dereq_,module,exports){
module.exports = function (nodeHelpers, Immutable) {
    'use strict';
    var html5VoidElements = Immutable.Set.of('AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR');
    function parentHasNoTextContent(node) {
        if (nodeHelpers.isCaretPositionNode(node)) {
            return true;
        } else {
            return node.parentNode.textContent.trim() === '';
        }
    }
    function traverse(parentNode) {
        var node = parentNode.firstElementChild;
        function isEmpty(node) {
            if (node.children.length === 0 && nodeHelpers.isBlockElement(node) || node.children.length === 1 && nodeHelpers.isSelectionMarkerNode(node.children[0])) {
                return true;
            }
            if (!nodeHelpers.isBlockElement(node) && node.children.length === 0) {
                return parentHasNoTextContent(node);
            }
            return false;
        }
        while (node) {
            if (!nodeHelpers.isSelectionMarkerNode(node)) {
                if (isEmpty(node) && node.textContent.trim() === '' && !html5VoidElements.includes(node.nodeName)) {
                    node.appendChild(document.createElement('br'));
                } else if (node.children.length > 0) {
                    traverse(node);
                }
            }
            node = node.nextElementSibling;
        }
    }
    return function () {
        return function (scribe) {
            scribe.registerHTMLFormatter('normalize', function (html) {
                var bin = document.createElement('div');
                bin.innerHTML = html;
                traverse(bin);
                return bin.innerHTML;
            });
        };
    };
}(_dereq_('../../../../node'), _dereq_('immutable'));
},{"../../../../node":59,"immutable":2}],72:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var nbspCharRegExp = /(\s|&nbsp;)+/g;
            scribe.registerHTMLFormatter('export', function (html) {
                return html.replace(nbspCharRegExp, ' ');
            });
        };
    };
}();
},{}],73:[function(_dereq_,module,exports){
module.exports = function (escape) {
    'use strict';
    return function () {
        return function (scribe) {
            scribe.registerPlainTextFormatter(escape);
        };
    };
}(_dereq_('lodash-amd/modern/string/escape'));
},{"lodash-amd/modern/string/escape":43}],74:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    function hasContent(rootNode) {
        var treeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ALL, null, false);
        while (treeWalker.nextNode()) {
            if (treeWalker.currentNode) {
                if (~['br'].indexOf(treeWalker.currentNode.nodeName.toLowerCase()) || treeWalker.currentNode.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
    return function () {
        return function (scribe) {
            scribe.el.addEventListener('keydown', function (event) {
                if (event.keyCode === 13) {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var blockNode = selection.getContaining(function (node) {
                        return node.nodeName === 'LI' || /^(H[1-6])$/.test(node.nodeName);
                    });
                    if (!blockNode) {
                        event.preventDefault();
                        scribe.transactionManager.run(function () {
                            if (scribe.el.lastChild.nodeName === 'BR') {
                                scribe.el.removeChild(scribe.el.lastChild);
                            }
                            var brNode = document.createElement('br');
                            range.insertNode(brNode);
                            range.collapse(false);
                            var contentToEndRange = range.cloneRange();
                            contentToEndRange.setEndAfter(scribe.el.lastChild, 0);
                            var contentToEndFragment = contentToEndRange.cloneContents();
                            if (!hasContent(contentToEndFragment)) {
                                var bogusBrNode = document.createElement('br');
                                range.insertNode(bogusBrNode);
                            }
                            var newRange = range.cloneRange();
                            newRange.setStartAfter(brNode, 0);
                            newRange.setEndAfter(brNode, 0);
                            selection.selection.removeAllRanges();
                            selection.selection.addRange(newRange);
                        });
                    }
                }
            }.bind(this));
            if (scribe.getHTML().trim() === '') {
                scribe.setContent('');
            }
        };
    };
}();
},{}],75:[function(_dereq_,module,exports){
module.exports = function (boldCommand, indentCommand, insertHTMLCommand, insertListCommands, outdentCommand, createLinkCommand, events) {
    'use strict';
    return {
        commands: {
            bold: boldCommand,
            indent: indentCommand,
            insertHTML: insertHTMLCommand,
            insertList: insertListCommands,
            outdent: outdentCommand,
            createLink: createLinkCommand
        },
        events: events
    };
}(_dereq_('./patches/commands/bold'), _dereq_('./patches/commands/indent'), _dereq_('./patches/commands/insert-html'), _dereq_('./patches/commands/insert-list'), _dereq_('./patches/commands/outdent'), _dereq_('./patches/commands/create-link'), _dereq_('./patches/events'));
},{"./patches/commands/bold":76,"./patches/commands/create-link":77,"./patches/commands/indent":78,"./patches/commands/insert-html":79,"./patches/commands/insert-list":80,"./patches/commands/outdent":81,"./patches/events":82}],76:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var boldCommand = new scribe.api.CommandPatch('bold');
            boldCommand.queryEnabled = function () {
                var selection = new scribe.api.Selection();
                var headingNode = selection.getContaining(function (node) {
                    return /^(H[1-6])$/.test(node.nodeName);
                });
                return scribe.api.CommandPatch.prototype.queryEnabled.apply(this, arguments) && !headingNode;
            };
            scribe.commandPatches.bold = boldCommand;
        };
    };
}();
},{}],77:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var createLinkCommand = new scribe.api.CommandPatch('createLink');
            scribe.commandPatches.createLink = createLinkCommand;
            createLinkCommand.execute = function (value) {
                var selection = new scribe.api.Selection();
                if (selection.range.collapsed) {
                    var aElement = document.createElement('a');
                    aElement.setAttribute('href', value);
                    aElement.textContent = value;
                    selection.range.insertNode(aElement);
                    var newRange = document.createRange();
                    newRange.setStartBefore(aElement);
                    newRange.setEndAfter(aElement);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(newRange);
                } else {
                    scribe.api.CommandPatch.prototype.execute.call(this, value);
                }
            };
        };
    };
}();
},{}],78:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    var INVISIBLE_CHAR = '\uFEFF';
    return function () {
        return function (scribe) {
            var indentCommand = new scribe.api.CommandPatch('indent');
            indentCommand.execute = function (value) {
                scribe.transactionManager.run(function () {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var isCaretOnNewLine = range.commonAncestorContainer.nodeName === 'P' && range.commonAncestorContainer.innerHTML === '<br>';
                    if (isCaretOnNewLine) {
                        var textNode = document.createTextNode(INVISIBLE_CHAR);
                        range.insertNode(textNode);
                        range.setStart(textNode, 0);
                        range.setEnd(textNode, 0);
                        selection.selection.removeAllRanges();
                        selection.selection.addRange(range);
                    }
                    scribe.api.CommandPatch.prototype.execute.call(this, value);
                    selection = new scribe.api.Selection();
                    var blockquoteNode = selection.getContaining(function (node) {
                        return node.nodeName === 'BLOCKQUOTE';
                    });
                    if (blockquoteNode) {
                        blockquoteNode.removeAttribute('style');
                    }
                }.bind(this));
            };
            scribe.commandPatches.indent = indentCommand;
        };
    };
}();
},{}],79:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
            var nodeHelpers = scribe.node;
            insertHTMLCommandPatch.execute = function (value) {
                scribe.transactionManager.run(function () {
                    scribe.api.CommandPatch.prototype.execute.call(this, value);
                    nodeHelpers.removeChromeArtifacts(scribe.el);
                }.bind(this));
            };
            scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
        };
    };
}();
},{}],80:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var nodeHelpers = scribe.node;
            var InsertListCommandPatch = function (commandName) {
                scribe.api.CommandPatch.call(this, commandName);
            };
            InsertListCommandPatch.prototype = Object.create(scribe.api.CommandPatch.prototype);
            InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;
            InsertListCommandPatch.prototype.execute = function (value) {
                scribe.transactionManager.run(function () {
                    scribe.api.CommandPatch.prototype.execute.call(this, value);
                    if (this.queryState()) {
                        var selection = new scribe.api.Selection();
                        var listElement = selection.getContaining(function (node) {
                            return node.nodeName === 'OL' || node.nodeName === 'UL';
                        });
                        if (listElement.nextElementSibling && listElement.nextElementSibling.childNodes.length === 0) {
                            nodeHelpers.removeNode(listElement.nextElementSibling);
                        }
                        if (listElement) {
                            var listParentNode = listElement.parentNode;
                            if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                                selection.placeMarkers();
                                nodeHelpers.insertAfter(listElement, listParentNode);
                                selection.selectMarkers();
                                if (listParentNode.childNodes.length === 2 && nodeHelpers.isEmptyTextNode(listParentNode.firstChild)) {
                                    nodeHelpers.removeNode(listParentNode);
                                }
                                if (listParentNode.childNodes.length === 0) {
                                    nodeHelpers.removeNode(listParentNode);
                                }
                            }
                        }
                        nodeHelpers.removeChromeArtifacts(listElement);
                    }
                }.bind(this));
            };
            InsertListCommandPatch.prototype.queryState = function () {
                try {
                    return scribe.api.CommandPatch.prototype.queryState.apply(this, arguments);
                } catch (err) {
                    if (err.name == 'NS_ERROR_UNEXPECTED') {
                        return false;
                    } else {
                        throw err;
                    }
                }
            };
            scribe.commandPatches.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
            scribe.commandPatches.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
        };
    };
}();
},{}],81:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var nodeHelpers = scribe.node;
            var outdentCommand = new scribe.api.CommandPatch('outdent');
            outdentCommand.execute = function () {
                scribe.transactionManager.run(function () {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var blockquoteNode = selection.getContaining(function (node) {
                        return node.nodeName === 'BLOCKQUOTE';
                    });
                    if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
                        selection.placeMarkers();
                        selection.selectMarkers(true);
                        var selectedNodes = range.cloneContents();
                        blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode);
                        range.deleteContents();
                        selection.selectMarkers();
                        if (blockquoteNode.textContent === '') {
                            blockquoteNode.parentNode.removeChild(blockquoteNode);
                        }
                    } else {
                        var pNode = selection.getContaining(function (node) {
                            return node.nodeName === 'P';
                        });
                        if (pNode) {
                            var nextSiblingNodes = nodeHelpers.nextSiblings(pNode);
                            if (!!nextSiblingNodes.size) {
                                var newContainerNode = document.createElement(blockquoteNode.nodeName);
                                while (!!nextSiblingNodes.size) {
                                    newContainerNode.appendChild(nextSiblingNodes.first());
                                    nextSiblingNodes = nextSiblingNodes.shift();
                                }
                                blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling);
                            }
                            selection.placeMarkers();
                            blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling);
                            selection.selectMarkers();
                            if (blockquoteNode.innerHTML === '') {
                                blockquoteNode.parentNode.removeChild(blockquoteNode);
                            }
                        } else {
                            scribe.api.CommandPatch.prototype.execute.call(this);
                        }
                    }
                }.bind(this));
            };
            scribe.commandPatches.outdent = outdentCommand;
        };
    };
}();
},{}],82:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var nodeHelpers = scribe.node;
            if (scribe.allowsBlockElements()) {
                scribe.el.addEventListener('keyup', function (event) {
                    if (event.keyCode === 8 || event.keyCode === 46) {
                        var selection = new scribe.api.Selection();
                        var containerPElement = selection.getContaining(function (node) {
                            return node.nodeName === 'P';
                        });
                        if (containerPElement) {
                            scribe.transactionManager.run(function () {
                                selection.placeMarkers();
                                nodeHelpers.removeChromeArtifacts(containerPElement);
                                selection.selectMarkers();
                            }, true);
                        }
                    }
                });
            }
        };
    };
}();
},{}],83:[function(_dereq_,module,exports){
module.exports = function (setRootPElement, enforcePElements, ensureSelectableContainers, inlineElementsMode) {
    'use strict';
    return {
        setRootPElement: setRootPElement,
        enforcePElements: enforcePElements,
        ensureSelectableContainers: ensureSelectableContainers,
        inlineElementsMode: inlineElementsMode
    };
}(_dereq_('./set-root-p-element'), _dereq_('./formatters/html/enforce-p-elements'), _dereq_('./formatters/html/ensure-selectable-containers'), _dereq_('./inline-elements-mode'));
},{"./formatters/html/enforce-p-elements":70,"./formatters/html/ensure-selectable-containers":71,"./inline-elements-mode":74,"./set-root-p-element":84}],84:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            if (scribe.getHTML().trim() === '') {
                scribe.setContent('<p><br></p>');
            }
        };
    };
}();
},{}],85:[function(_dereq_,module,exports){
module.exports = function (plugins, commands, formatters, events, patches, Api, buildTransactionManager, UndoManager, EventEmitter, nodeHelpers, Immutable, config) {
    'use strict';
    function Scribe(el, options) {
        EventEmitter.call(this);
        this.el = el;
        this.commands = {};
        this.options = config.checkOptions(options);
        this.commandPatches = {};
        this._plainTextFormatterFactory = new FormatterFactory();
        this._htmlFormatterFactory = new HTMLFormatterFactory();
        this.api = new Api(this);
        this.Immutable = Immutable;
        var TransactionManager = buildTransactionManager(this);
        this.transactionManager = new TransactionManager();
        this.undoManager = false;
        if (this.options.undo.enabled) {
            if (this.options.undo.manager) {
                this.undoManager = this.options.undo.manager;
            } else {
                this.undoManager = new UndoManager(this.options.undo.limit, this.el);
            }
            this._merge = false;
            this._forceMerge = false;
            this._mergeTimer = 0;
            this._lastItem = { content: '' };
        }
        this.setHTML(this.getHTML());
        this.el.setAttribute('contenteditable', true);
        this.el.addEventListener('input', function () {
            this.transactionManager.run();
        }.bind(this), false);
        var corePlugins = Immutable.OrderedSet(this.options.defaultPlugins).sort(config.sortByPlugin('setRootPElement')).filter(config.filterByBlockLevelMode(this.allowsBlockElements())).map(function (plugin) {
            return plugins[plugin];
        });
        var defaultFormatters = Immutable.List(this.options.defaultFormatters).filter(function (formatter) {
            return !!formatters[formatter];
        }).map(function (formatter) {
            return formatters[formatter];
        });
        var defaultPatches = Immutable.List.of(patches.events);
        var defaultCommandPatches = Immutable.List(this.options.defaultCommandPatches).map(function (patch) {
            return patches.commands[patch];
        });
        var defaultCommands = Immutable.List.of('indent', 'insertList', 'outdent', 'redo', 'subscript', 'superscript', 'undo').map(function (command) {
            return commands[command];
        });
        var allPlugins = Immutable.List().concat(corePlugins, defaultFormatters, defaultPatches, defaultCommandPatches, defaultCommands);
        allPlugins.forEach(function (plugin) {
            this.use(plugin());
        }.bind(this));
        this.use(events());
    }
    Scribe.prototype = Object.create(EventEmitter.prototype);
    Scribe.prototype.node = nodeHelpers;
    Scribe.prototype.element = Scribe.prototype.node;
    Scribe.prototype.use = function (configurePlugin) {
        configurePlugin(this);
        return this;
    };
    Scribe.prototype.setHTML = function (html, skipFormatters) {
        this._lastItem.content = html;
        if (skipFormatters) {
            this._skipFormatters = true;
        }
        if (this.el.innerHTML !== html) {
            this.el.innerHTML = html;
        }
    };
    Scribe.prototype.getHTML = function () {
        return this.el.innerHTML;
    };
    Scribe.prototype.getContent = function () {
        return this._htmlFormatterFactory.formatForExport(this.getHTML().replace(/<br>$/, ''));
    };
    Scribe.prototype.getTextContent = function () {
        return this.el.textContent;
    };
    Scribe.prototype.pushHistory = function () {
        var scribe = this;
        if (scribe.options.undo.enabled) {
            var lastContentNoMarkers = scribe._lastItem.content.replace(/<em [^>]*class="scribe-marker"[^>]*>[^<]*?<\/em>/g, '');
            if (scribe.getHTML() !== lastContentNoMarkers) {
                var selection = new scribe.api.Selection();
                selection.placeMarkers();
                var content = scribe.getHTML();
                selection.removeMarkers();
                var previousItem = scribe.undoManager.item(scribe.undoManager.position);
                if ((scribe._merge || scribe._forceMerge) && previousItem && scribe._lastItem == previousItem[0]) {
                    scribe._lastItem.content = content;
                } else {
                    scribe._lastItem = {
                        previousItem: scribe._lastItem,
                        content: content,
                        scribe: scribe,
                        execute: function () {
                        },
                        undo: function () {
                            this.scribe.restoreFromHistory(this.previousItem);
                        },
                        redo: function () {
                            this.scribe.restoreFromHistory(this);
                        }
                    };
                    scribe.undoManager.transact(scribe._lastItem, false);
                }
                clearTimeout(scribe._mergeTimer);
                scribe._merge = true;
                scribe._mergeTimer = setTimeout(function () {
                    scribe._merge = false;
                }, scribe.options.undo.interval);
                return true;
            }
        }
        return false;
    };
    Scribe.prototype.getCommand = function (commandName) {
        return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
    };
    Scribe.prototype.restoreFromHistory = function (historyItem) {
        this._lastItem = historyItem;
        this.setHTML(historyItem.content, true);
        var selection = new this.api.Selection();
        selection.selectMarkers();
        this.trigger('content-changed');
    };
    Scribe.prototype.allowsBlockElements = function () {
        return this.options.allowBlockElements;
    };
    Scribe.prototype.setContent = function (content) {
        if (!this.allowsBlockElements()) {
            content = content + '<br>';
        }
        this.setHTML(content);
        this.trigger('content-changed');
    };
    Scribe.prototype.insertPlainText = function (plainText) {
        this.insertHTML('<p>' + this._plainTextFormatterFactory.format(plainText) + '</p>');
    };
    Scribe.prototype.insertHTML = function (html) {
        this.getCommand('insertHTML').execute(this._htmlFormatterFactory.format(html));
    };
    Scribe.prototype.isDebugModeEnabled = function () {
        return this.options.debug;
    };
    Scribe.prototype.registerHTMLFormatter = function (phase, formatter) {
        this._htmlFormatterFactory.formatters[phase] = this._htmlFormatterFactory.formatters[phase].push(formatter);
    };
    Scribe.prototype.registerPlainTextFormatter = function (formatter) {
        this._plainTextFormatterFactory.formatters = this._plainTextFormatterFactory.formatters.push(formatter);
    };
    function FormatterFactory() {
        this.formatters = Immutable.List();
    }
    FormatterFactory.prototype.format = function (html) {
        var formatted = this.formatters.reduce(function (formattedData, formatter) {
            return formatter(formattedData);
        }, html);
        return formatted;
    };
    function HTMLFormatterFactory() {
        this.formatters = {
            sanitize: Immutable.List(),
            normalize: Immutable.List(),
            'export': Immutable.List()
        };
    }
    HTMLFormatterFactory.prototype = Object.create(FormatterFactory.prototype);
    HTMLFormatterFactory.prototype.constructor = HTMLFormatterFactory;
    HTMLFormatterFactory.prototype.format = function (html) {
        var formatters = this.formatters.sanitize.concat(this.formatters.normalize);
        var formatted = formatters.reduce(function (formattedData, formatter) {
            return formatter(formattedData);
        }, html);
        return formatted;
    };
    HTMLFormatterFactory.prototype.formatForExport = function (html) {
        return this.formatters['export'].reduce(function (formattedData, formatter) {
            return formatter(formattedData);
        }, html);
    };
    return Scribe;
}(_dereq_('./plugins/core/plugins'), _dereq_('./plugins/core/commands'), _dereq_('./plugins/core/formatters'), _dereq_('./plugins/core/events'), _dereq_('./plugins/core/patches'), _dereq_('./api'), _dereq_('./transaction-manager'), _dereq_('./undo-manager'), _dereq_('./event-emitter'), _dereq_('./node'), _dereq_('immutable'), _dereq_('./config'));
},{"./api":48,"./config":53,"./event-emitter":57,"./node":59,"./plugins/core/commands":60,"./plugins/core/events":68,"./plugins/core/formatters":69,"./plugins/core/patches":75,"./plugins/core/plugins":83,"./transaction-manager":86,"./undo-manager":87,"immutable":2}],86:[function(_dereq_,module,exports){
module.exports = function (assign) {
    'use strict';
    return function (scribe) {
        function TransactionManager() {
            this.history = [];
        }
        assign(TransactionManager.prototype, {
            start: function () {
                this.history.push(1);
            },
            end: function () {
                this.history.pop();
                if (this.history.length === 0) {
                    scribe.pushHistory();
                    scribe.trigger('content-changed');
                }
            },
            run: function (transaction, forceMerge) {
                this.start();
                try {
                    if (transaction) {
                        transaction();
                    }
                } finally {
                    scribe._forceMerge = forceMerge === true;
                    this.end();
                    scribe._forceMerge = false;
                }
            }
        });
        return TransactionManager;
    };
}(_dereq_('lodash-amd/modern/object/assign'));
},{"lodash-amd/modern/object/assign":38}],87:[function(_dereq_,module,exports){
module.exports = function (Immutable) {
    'use strict';
    function UndoManager(limit, undoScopeHost) {
        this._stack = Immutable.List();
        this._limit = limit;
        this._fireEvent = typeof CustomEvent != 'undefined' && undoScopeHost && undoScopeHost.dispatchEvent;
        this._ush = undoScopeHost;
        this.position = 0;
        this.length = 0;
    }
    UndoManager.prototype.transact = function (transaction, merge) {
        if (arguments.length < 2) {
            throw new TypeError('Not enough arguments to UndoManager.transact.');
        }
        transaction.execute();
        if (this.position > 0) {
            this.clearRedo();
        }
        var transactions;
        if (merge && this.length) {
            transactions = this._stack.first().push(transaction);
            this._stack = this._stack.shift().unshift(transactions);
        } else {
            transactions = Immutable.List.of(transaction);
            this._stack = this._stack.unshift(transactions);
            this.length++;
            if (this._limit && this.length > this._limit) {
                this.clearUndo(this._limit);
            }
        }
        this._dispatch('DOMTransaction', transactions);
    };
    UndoManager.prototype.undo = function () {
        if (this.position >= this.length) {
            return;
        }
        var transactions = this._stack.get(this.position);
        var i = transactions.size;
        while (i--) {
            transactions.get(i).undo();
        }
        this.position++;
        this._dispatch('undo', transactions);
    };
    UndoManager.prototype.redo = function () {
        if (this.position === 0) {
            return;
        }
        this.position--;
        var transactions = this._stack.get(this.position);
        for (var i = 0; i < transactions.size; i++) {
            transactions.get(i).redo();
        }
        this._dispatch('redo', transactions);
    };
    UndoManager.prototype.item = function (index) {
        return index >= 0 && index < this.length ? this._stack.get(index).toArray() : null;
    };
    UndoManager.prototype.clearUndo = function (position) {
        this._stack = this._stack.take(position !== undefined ? position : this.position);
        this.length = this._stack.size;
    };
    UndoManager.prototype.clearRedo = function () {
        this._stack = this._stack.skip(this.position);
        this.length = this._stack.size;
        this.position = 0;
    };
    UndoManager.prototype._dispatch = function (event, transactions) {
        if (this._fireEvent) {
            this._ush.dispatchEvent(new CustomEvent(event, {
                detail: { transactions: transactions.toArray() },
                bubbles: true,
                cancelable: false
            }));
        }
    };
    return UndoManager;
}(_dereq_('immutable'));
},{"immutable":2}],88:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            scribe.registerPlainTextFormatter(function (html) {
                return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
            });
        };
    };
}();
},{}],89:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function (level) {
        return function (scribe) {
            var tag = '<h' + level + '>';
            var nodeName = 'H' + level;
            var commandName = 'h' + level;
            var headingCommand = new scribe.api.Command('formatBlock');
            headingCommand.execute = function () {
                if (this.queryState()) {
                    scribe.api.Command.prototype.execute.call(this, '<p>');
                } else {
                    scribe.api.Command.prototype.execute.call(this, tag);
                }
            };
            headingCommand.queryState = function () {
                var selection = new scribe.api.Selection();
                return !!selection.getContaining(function (node) {
                    return node.nodeName === nodeName;
                });
            };
            headingCommand.queryEnabled = function () {
                var selection = new scribe.api.Selection();
                var listNode = selection.getContaining(function (node) {
                    return node.nodeName === 'OL' || node.nodeName === 'UL';
                });
                return scribe.api.Command.prototype.queryEnabled.apply(this, arguments) && scribe.allowsBlockElements() && !listNode;
            };
            scribe.commands[commandName] = headingCommand;
        };
    };
}();
},{}],90:[function(_dereq_,module,exports){
module.exports = function () {
    'use strict';
    return function () {
        return function (scribe) {
            var linkPromptCommand = new scribe.api.Command('createLink');
            linkPromptCommand.nodeName = 'A';
            linkPromptCommand.execute = function () {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                var anchorNode = selection.getContaining(function (node) {
                    return node.nodeName === this.nodeName;
                }.bind(this));
                var initialLink = anchorNode ? anchorNode.href : '';
                var link = window.prompt('Enter a link.', initialLink);
                if (anchorNode) {
                    range.selectNode(anchorNode);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(range);
                }
                if (link) {
                    var urlProtocolRegExp = /^https?\:\/\//;
                    var mailtoProtocolRegExp = /^mailto\:/;
                    if (!urlProtocolRegExp.test(link) && !mailtoProtocolRegExp.test(link)) {
                        if (/@/.test(link)) {
                            var shouldPrefixEmail = window.confirm('The URL you entered appears to be an email address. ' + 'Do you want to add the required \u201Cmailto:\u201D prefix?');
                            if (shouldPrefixEmail) {
                                link = 'mailto:' + link;
                            }
                        } else {
                            var shouldPrefixLink = window.confirm('The URL you entered appears to be a link. ' + 'Do you want to add the required \u201Chttp://\u201D prefix?');
                            if (shouldPrefixLink) {
                                link = 'http://' + link;
                            }
                        }
                    }
                    scribe.api.SimpleCommand.prototype.execute.call(this, link);
                }
            };
            linkPromptCommand.queryState = function () {
                var selection = new scribe.api.Selection();
                return !!selection.getContaining(function (node) {
                    return node.nodeName === this.nodeName;
                }.bind(this));
            };
            scribe.commands.linkPrompt = linkPromptCommand;
        };
    };
}();
},{}],91:[function(_dereq_,module,exports){
module.exports = function (HTMLJanitor, merge, cloneDeep) {
    'use strict';
    return function (config) {
        var configAllowMarkers = merge(cloneDeep(config), {
            tags: {
                em: { class: 'scribe-marker' },
                br: {}
            }
        });
        return function (scribe) {
            var janitor = new HTMLJanitor(configAllowMarkers);
            scribe.registerHTMLFormatter('sanitize', janitor.clean.bind(janitor));
        };
    };
}(_dereq_('html-janitor'), _dereq_('lodash-amd/modern/object/merge'), _dereq_('lodash-amd/modern/lang/cloneDeep'));
},{"html-janitor":1,"lodash-amd/modern/lang/cloneDeep":30,"lodash-amd/modern/object/merge":42}],92:[function(_dereq_,module,exports){
'use strict';

/**
    Why this file?

    Scribe and its plugins are built with AMD. Madebymany solved the difficulty of mixing AMD with a CommonJS environment by switching
    Browserify for Webpack. We don't want to do that because we're quite happy with Browserify thank you very much.

    So, we have added a build script to create a bundle from this file. The bundle has to be standalone so it can be deamdified and derequired.
*/

var Scribe = _dereq_('scribe-editor');

var scribePluginFormatterPlainTextConvertNewLinesToHTML = _dereq_('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');
var scribePluginLinkPromptCommand = _dereq_('scribe-plugin-link-prompt-command');
var scribePluginSanitizer = _dereq_('scribe-plugin-sanitizer');
var scribePluginHeadingCommand = _dereq_('scribe-plugin-heading-command');

module.exports = {
    Scribe: Scribe,
    scribePluginFormatterPlainTextConvertNewLinesToHTML: scribePluginFormatterPlainTextConvertNewLinesToHTML,
    scribePluginLinkPromptCommand: scribePluginLinkPromptCommand,
    scribePluginSanitizer: scribePluginSanitizer,
    scribePluginHeadingCommand: scribePluginHeadingCommand
};

},{"scribe-editor":85,"scribe-plugin-formatter-plain-text-convert-new-lines-to-html":88,"scribe-plugin-heading-command":89,"scribe-plugin-link-prompt-command":90,"scribe-plugin-sanitizer":91}]},{},[92])(92)
});
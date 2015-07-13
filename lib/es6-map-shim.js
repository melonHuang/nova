/**
 * Copyright 2012 Eric Wendelin - MIT License
 *
 * es6-map-shim.js is a DESTRUCTIVE shim that follows the latest Map specification
 * as closely as possible. It is destructive in the sense that it overrides native implementations.
 *
 * IMPORTANT: Currently, get(), set(), has() and delete() are all O(n) operations.
 * Normally, they would be O(1). Therefore it is NOT recommended to use this with
 * a large dataset or in any production environment.
 *
 * This library assumes ES5 functionality: Object.create, Object.defineProperty,
 * Array.indexOf, Function.bind and others.
 */
(function(module) {
    function Map(iterable) {
        var _items = [];
        var _keys = [];
        var _values = [];

        // Object.is polyfill, courtesy of @WebReflection
        var is = Object.is || function(a, b) {
            return a === b ?
                a !== 0 || 1 / a == 1 / b :
                a != a && b != b;
        };

        // More reliable indexOf, courtesy of @WebReflection
        var betterIndexOf = function(value) {
            if(value != value || value === 0) {
                for(var i = this.length; i-- && !is(this[i], value););
            } else {
                i = [].indexOf.call(this, value);
            }
            return i;
        };

        /**
         * MapIterator used for iterating over all entries in given map.
         *
         * @param map {Map} to iterate
         * @param kind {String} identifying what to yield. Possible values
         *      are 'keys', 'values' and 'keys+values'
         * @constructor
         */
        var MapIterator = function MapIterator(map, kind) {
            var _index = 0;

            return Object.create({}, {
                next: {
                    value: function() {
                        // check if index is within bounds
                        if (_index < map.items().length) {
                            switch(kind) {
                                case 'keys': return map.keys()[_index++];
                                case 'values': return map.values()[_index++];
                                case 'keys+values': return [].slice.call(map.items()[_index++]);
                                default: throw new TypeError('Invalid iterator type');
                            }
                        }
                        // TODO: make sure I'm interpreting the spec correctly here
                        throw new Error('Stop Iteration');
                    }
                },
                iterator: {
                    value: function() {
                        return this;
                    }
                },
                toString: {
                    value: function() {
                        return '[object Map Iterator]';
                    }
                }
            });
        };

        var _set = function(key, value) {
            // check if key exists and overwrite
            var index = betterIndexOf.call(_keys, key);
            if (index > -1) {
                _items[index][1] = value;
                _values[index] = value;
            } else {
                _items.push([key, value]);
                _keys.push(key);
                _values.push(value);
            }
        };

        var setItem = function(item) {
            if (item.length !== 2) {
                throw new TypeError('Invalid iterable passed to Map constructor');
            }

            _set(item[0], item[1]);
        };

        // FIXME: accommodate any class that defines an @@iterator method that returns
        //      an iterator object that produces two element array-like objects
        if (Array.isArray(iterable)) {
            iterable.forEach(setItem);
        } else if (iterable !== undefined) {
            throw new TypeError('Invalid Map');
        }

        return Object.create(MapPrototype, {
            /**
             * @return {Array} all entries in the Map, in order
             */
            items:{
                value:function() {
                    return [].slice.call(_items);
                }
            },
            /**
             * @return {Array} all keys in the Map, in order
             */
            keys:{
                value:function() {
                    return [].slice.call(_keys);
                }
            },
            /**
             * @return {Array} all values in the Map, in order
             */
            values:{
                value:function() {
                    return [].slice.call(_values);
                }
            },
            /**
             * Given a key, indicate whether that key exists in this Map.
             *
             * @param key {Object} expected key
             * @return {Boolean} true if key in Map
             */
            has:{
                value:function(key) {
                    // TODO: double-check how spec reads about null values
                    var index = betterIndexOf.call(_keys, key);
                    return index > -1;
                }
            },
            /**
             * Given a key, retrieve the value associated with that key (or undefined).
             *
             * @param key {Object}
             * @return {Object} value associated with key or undefined
             */
            get:{
                value:function(key) {
                    var index = betterIndexOf.call(_keys, key);
                    return index > -1 ? _values[index] : undefined;
                }
            },
            /**
             * Add or overwrite entry associating key with value. Always returns undefined.
             *
             * @param key {Object} anything
             * @param value {Object} also anything
             */
            set:{
                value: _set
            },
            /**
             * Return the number of entries in this Map.
             *
             * @return {Number} number of entries
             */
            size:{
                get:function() {
                    return _items.length;
                }
            },
            /**
             * Remove all entries in this Map. Returns undefined.
             */
            clear:{
                value:function() {
                    _keys.length = _values.length = _items.length = 0;
                }
            },
            /**
             * Delete entry with given key, if it exists.
             *
             * @param key {Object} any possible key
             * @return {Boolean} true if an entry was deleted
             */
            'delete':{
                value:function(key) {
                    var index = betterIndexOf.call(_keys, key);
                    if (index > -1) {
                        _keys.splice(index, 1);
                        _values.splice(index, 1);
                        _items.splice(index, 1);
                        return true;
                    }
                    return false;
                }
            },
            /**
             * Given a callback function and optional context, invoke the callback on all
             * entries in this Map.
             *
             * @param callbackFn {Function}
             */
            forEach:{
                value:function(callbackfn /*, thisArg*/) {
                    if (typeof callbackfn != 'function') {
                        throw new TypeError('Invalid callback function given to forEach');
                    }

                    function tryNext() {
                        try {
                            return iter.next();
                        } catch(e) {
                            return undefined;
                        }
                    }

                    var iter = this.iterator();
                    var current = tryNext();
                    var next = tryNext();
                    while(current !== undefined) {
                        callbackfn.apply(arguments[1], [current[1], current[0], this]);
                        current = next;
                        next = tryNext();
                    }
                }
            },
            /**
             * Return a MapIterator object for this map.
             */
            iterator:{
                value: function() {
                    return new MapIterator(this, 'keys+values');
                }
            },
            toString:{
                value: function() {
                    return '[Object Map]';
                }
            }
        });
    }

    var notInNode = module == 'undefined';
    var window = notInNode ? this : global;
    var module = notInNode ? {} : exports;
    var MapPrototype = Map.prototype;

    Map.prototype = MapPrototype = Map();

    window.Map = module.Map = window.Map || Map;
}.call(this, typeof exports));

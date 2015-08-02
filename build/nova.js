'use strict';
(function () {
    var Nova = function Nova(prototype) {
        Nova.Utils.chainObject(prototype, Nova.Base);
        var opts = { prototype: prototype };
        if (prototype['extends']) {
            opts['extends'] = prototype['extends'];
        }
        var registered = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return getConstructor(registered);
    };

    function getConstructor(realConstructor) {
        return function (initData) {
            initData && Nova.Initial.set(initData);
            return new realConstructor();
        };
    }

    var NovaExports = function NovaExports(prototype) {
        Nova.Utils.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    };
    NovaExports.exports = {};

    window.Nova = Nova;
    window.NovaExports = NovaExports;
})();
'use strict';

Nova.CssParse = (function () {

  var api = {
    // given a string of css, return a simple rule tree
    parse: function parse(text) {
      text = this._clean(text);
      return this._parseCss(this._lex(text), text);
    },

    // remove stuff we don't care about that may hinder parsing
    _clean: function _clean(cssText) {
      return cssText.replace(rx.comments, '').replace(rx.port, '');
    },

    // super simple {...} lexer that returns a node tree
    _lex: function _lex(text) {
      var root = { start: 0, end: text.length };
      var n = root;
      for (var i = 0, s = 0, l = text.length; i < l; i++) {
        switch (text[i]) {
          case this.OPEN_BRACE:
            //console.group(i);
            if (!n.rules) {
              n.rules = [];
            }
            var p = n;
            var previous = p.rules[p.rules.length - 1];
            n = { start: i + 1, parent: p, previous: previous };
            p.rules.push(n);
            break;
          case this.CLOSE_BRACE:
            //console.groupEnd(n.start);
            n.end = i + 1;
            n = n.parent || root;
            break;
        }
      }
      return root;
    },

    // add selectors/cssText to node tree
    _parseCss: function _parseCss(node, text) {
      var t = text.substring(node.start, node.end - 1);
      node.parsedCssText = node.cssText = t.trim();
      if (node.parent) {
        var ss = node.previous ? node.previous.end : node.parent.start;
        t = text.substring(ss, node.start - 1);
        // TODO(sorvell): ad hoc; make selector include only after last ;
        // helps with mixin syntax
        t = t.substring(t.lastIndexOf(';') + 1);
        var s = node.parsedSelector = node.selector = t.trim();
        node.atRule = s.indexOf(AT_START) === 0;
        // note, support a subset of rule types...
        if (node.atRule) {
          if (s.indexOf(MEDIA_START) === 0) {
            node.type = this.types.MEDIA_RULE;
          } else if (s.match(rx.keyframesRule)) {
            node.type = this.types.KEYFRAMES_RULE;
          }
        } else {
          if (s.indexOf(VAR_START) === 0) {
            node.type = this.types.MIXIN_RULE;
          } else {
            node.type = this.types.STYLE_RULE;
          }
        }
      }
      var r$ = node.rules;
      if (r$) {
        for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
          this._parseCss(r, text);
        }
      }
      return node;
    },

    // stringify parsed css.
    stringify: function stringify(node, preserveProperties, text) {
      text = text || '';
      // calc rule cssText
      var cssText = '';
      if (node.cssText || node.rules) {
        var r$ = node.rules;
        if (r$ && (preserveProperties || !hasMixinRules(r$))) {
          for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
            cssText = this.stringify(r, preserveProperties, cssText);
          }
        } else {
          cssText = preserveProperties ? node.cssText : removeCustomProps(node.cssText);
          cssText = cssText.trim();
          if (cssText) {
            cssText = '  ' + cssText + '\n';
          }
        }
      }
      // emit rule iff there is cssText
      if (cssText) {
        if (node.selector) {
          text += node.selector + ' ' + this.OPEN_BRACE + '\n';
        }
        text += cssText;
        if (node.selector) {
          text += this.CLOSE_BRACE + '\n\n';
        }
      }
      return text;
    },

    types: {
      STYLE_RULE: 1,
      KEYFRAMES_RULE: 7,
      MEDIA_RULE: 4,
      MIXIN_RULE: 1000
    },

    OPEN_BRACE: '{',
    CLOSE_BRACE: '}'

  };

  function hasMixinRules(rules) {
    return rules[0].selector.indexOf(VAR_START) >= 0;
  }

  function removeCustomProps(cssText) {
    return cssText.replace(rx.customProp, '').replace(rx.mixinProp, '').replace(rx.mixinApply, '').replace(rx.varApply, '');
  }

  var VAR_START = '--';
  var MEDIA_START = '@media';
  var AT_START = '@';

  // helper regexp's
  var rx = {
    comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
    port: /@import[^;]*;/gim,
    customProp: /(?:^|[\s;])--[^;{]*?:[^{};]*?;/gim,
    mixinProp: /(?:^|[\s;])--[^;{]*?:[^{;]*?{[^}]*?};?/gim,
    mixinApply: /@apply[\s]*\([^)]*?\)[\s]*;/gim,
    varApply: /[^;:]*?:[^;]*var[^;]*;/gim,
    keyframesRule: /^@[^\s]*keyframes/
  };

  // exports
  return api;
})();
'use strict';
(function () {

  var CaseMap = {

    _caseMap: {},

    dashToCamelCase: function dashToCamelCase(dash) {
      var mapped = this._caseMap[dash];
      if (mapped) {
        return mapped;
      }
      // TODO(sjmiles): is rejection test actually helping perf?
      if (dash.indexOf('-') < 0) {
        return this._caseMap[dash] = dash;
      }
      return this._caseMap[dash] = dash.replace(/-([a-z])/g, function (m) {
        return m[1].toUpperCase();
      });
    },

    camelToDashCase: function camelToDashCase(camel) {
      var mapped = this._caseMap[camel];
      if (mapped) {
        return mapped;
      }
      return this._caseMap[camel] = camel.replace(/([a-z][A-Z])/g, function (g) {
        return g[0] + '-' + g[1].toLowerCase();
      });
    }

  };

  Nova.CaseMap = CaseMap;
})();
'use strict';
(function () {

    var Utils = {
        mix: function mix(des, src, override) {
            if (src && src.constructor == Array) {
                for (var i = 0, len = src.length; i < len; i++) {
                    this.mix(des, src[i], override);
                }
                return des;
            }
            if (typeof override == 'function') {
                for (i in src) {
                    des[i] = override(des[i], src[i], i);
                }
            } else {
                for (i in src) {
                    if (override || !(des[i] || i in des)) {
                        des[i] = src[i];
                    }
                }
            }
            return des;
        },
        /*
        * 使object的原型链尾端指向inherited, 拥有inherited的属性和方法
        */
        chainObject: function chainObject(object, inherited) {
            if (object && inherited && object !== inherited) {
                if (!Object.__proto__) {
                    object = this.mix(Object.create(inherited), object, true);
                } else {
                    // 首先找到object原型链末端
                    var lastPrototype = object;
                    while (lastPrototype.__proto__ && lastPrototype.__proto__.__proto__) {
                        lastPrototype = lastPrototype.__proto__;
                    }
                    lastPrototype.__proto__ = inherited;
                }
            }
            return object;
        },
        tmpl: function tmpl(str, data, format) {
            str = str.replace(/\{\{([^\{\}]*)\}\}/g, function (sub, expr) {
                if (!expr) return '';
                try {
                    var r = new Function('data', 'with(data){return (' + expr + ');}')(data);
                    return format ? format(r, expr) : r;
                } catch (ex) {
                    return sub;
                }
            });

            return str;
        }
    };

    Nova.Utils = Utils;
})();
'use strict';
(function () {

    var Initial = {
        /***************** 操作和读写initial data **********************/
        set: function set(initData) {
            Nova._initData = initData;
        },
        get: function get() {
            return Nova._initData;
        },
        clear: function clear() {
            delete Nova._initData;
        },
        has: function has() {
            return !!Nova._initData;
        }
    };

    Nova.Initial = Initial;
})();
'use strict';
(function () {
    var lastInsertedStylesheet = undefined;

    /*
    * 解析stylesheet属性，并添加css scope插入到DOM中
    * */
    var Style = {
        init: function init(prototype) {
            if (!prototype.stylesheet || !prototype.stylesheet.trim()) {
                return;
            }

            var stylesheet = prototype.stylesheet;

            // 编译Stylesheet，为其添加scope
            stylesheet = this.compile(stylesheet, prototype.is);

            // 将stylesheet插入到head中
            this.attach(stylesheet);
        },

        compile: function compile(stylesheet, tagName) {
            var parsedStyle = Nova.CssParse.parse(stylesheet);
            var rules = parsedStyle.rules;
            return this.compileRules(rules, tagName);
        },

        compileRules: function compileRules(rules, tagName) {
            var self = this;
            var generatedCss = '';
            rules.forEach(function (rule) {
                // style
                if (rule.type == Nova.CssParse.types.STYLE_RULE) {
                    (function () {
                        // 生成selector
                        var selectors = rule.selector;
                        selectors = selectors.replace(/([+>]|::content|::shadow)/g, function (match) {
                            return ' ' + match + ' ';
                        }).replace(/,/g, ' , ');
                        selectors = selectors.split(/\s+/);
                        var selector = '';
                        selectors.every(function (s, i) {
                            // :host 替换为tagName
                            if (s.indexOf(':host') >= 0) {
                                selector += s.replace(':host', tagName) + ' ';
                            }
                            // ::content, ::shadow 替换为空格
                            else if (s == '::content' || s == '::shadow') {
                                if (i > 0) {
                                    for (var j = i + 1; j < selectors.length; j++) {
                                        selector += selectors[j] + ' ';
                                    }
                                    return false;
                                } else {
                                    selector += s;
                                }
                            }
                            // >+, 直接拼接不做处理
                            else if ('> + ,'.split(' ').indexOf(s) >= 0) {
                                selector += s + ' ';
                            }
                            // 默认添加.tagName
                            else {
                                var pseudoStart = s.indexOf(':');
                                if (pseudoStart < 0) {
                                    selector += s + '.' + tagName + ' ';
                                } else {
                                    selector += s.slice(0, pseudoStart) + '.' + tagName + s.slice(pseudoStart) + ' ';
                                }
                            }
                            return true;
                        });

                        // 生成CSS属性
                        var cssText = rule.cssText;
                        generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                    })();
                }

                // keyframes
                if (rule.type == Nova.CssParse.types.KEYFRAMES_RULE) {
                    var selector = rule.selector;
                    var cssText = rule.cssText;
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }

                // media rule
                if (rule.type == Nova.CssParse.types.MEDIA_RULE) {
                    var selector = rule.selector;
                    var cssText = self.compileRules(rule.rules || [], tagName);
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }
            });
            return generatedCss;
        },

        attach: function attach(stylesheet) {
            var head = document.head;
            var styleEle = document.createElement('style');
            styleEle.innerHTML = stylesheet;

            // 第一次通过Nova插入Stylesheet，直接插入到head顶部
            if (!lastInsertedStylesheet) {
                head.insertBefore(styleEle, head.firstChild);
                // 若已有通过Nova插入的Stylesheet，则插入到其后面
            } else {
                head.insertBefore(styleEle, lastInsertedStylesheet.nextSibling);
            }
            lastInsertedStylesheet = styleEle;
        }
    };

    Nova.Style = Style;
})();
'use strict';

(function () {
    /***************************** custom event polyfill ******************************/
    if (!window.CustomEvent) {
        var _CustomEvent = function _CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('Events');
            evt.initEvent(event, params.bubbles, params.cancelable);
            evt.detail = params.detail;
            return evt;
        };
        _CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = _CustomEvent;
    }

    /***************************** event behavior ******************************/
    var EVENT_SPLITTER = ' ';
    var EventBehavior = {
        /*
        * 绑定事件
        * @param {String} types 事件名，绑定多个事件可以空格间隔
        * @param {Function} listener 监听函数
        * @param {Boolean} optional useCapture 是否在捕捉阶段执行回调
        * */
        on: function on(types, listener, useCapture) {
            types = types.split(EVENT_SPLITTER);
            var type = undefined;
            while (type = types.shift()) {
                var cb = addListener.call(this, type, listener);
                this.addEventListener(type, cb, useCapture);
            }
        },

        /*
        * 注销事件
        * @param {String} types 事件名，绑定多个事件可以空格间隔
        * @param {Function} listener 监听函数
        * @param {Boolean} optional useCapture 是否在捕捉阶段执行回调
        * */
        off: function off(types, listener, useCapture) {
            types = types.split(EVENT_SPLITTER);
            var type = undefined;
            while (type = types.shift()) {
                var cb = removeListener.call(this, type, listener);
                cb && this.removeEventListener(type, cb, useCapture);
            }
        },

        /*
        * 触发事件
        * @param {String} types 事件名，绑定多个事件可以空格间隔
        * @param {Array} details 额外参数
        * */
        trigger: function trigger(types, details) {
            types = types.split(EVENT_SPLITTER);
            var type = undefined;
            while (type = types.shift()) {
                var _event = new CustomEvent(type, { detail: details });
                this.dispatchEvent(_event);
            }
        }
    };

    function addListener(type, listener) {
        !this._eventListeners && (this._eventListeners = {});
        !this._eventListeners[type] && (this._eventListeners[type] = new Map());

        var self = this;
        var listenersMap = this._eventListeners[type];
        var listenerWrap = listenersMap.get(listener);

        if (!listenerWrap) {
            listenerWrap = function (e) {
                var args = [e].concat(e.detail);
                listener.apply(self, args);
            };
            listenersMap.set(listener, listenerWrap);
        }

        return listenerWrap;
    }

    function removeListener(type, listener) {
        if (!this._eventListeners || !this._eventListeners[type]) {
            return;
        }
        var listenersMap = this._eventListeners[type];
        var listenerWrap = listenersMap.get(listener);
        listenersMap['delete'](listener);
        return listenerWrap;
    }

    Nova.EventBehavior = EventBehavior;
})();
'use strict';

(function () {
    var ASPECT_SPLITTER = ' ';
    var AspectBehavior = {
        /*
        * 在某个方法之前插入方法
        * @param {String} methodName 被插队的方法名
        * @param {Function} callback 插入的方法
        * */
        before: function before(methodName, callback) {
            weaver.call(this, 'before', methodName, callback);
            return this;
        },

        /*
        * 在某个方法之后插入方法
        * @param {String} methodName 被插队的方法名
        * @param {Function} callback 插入的方法
        * */
        after: function after(methodName, callback) {
            weaver.call(this, 'after', methodName, callback);
            return this;
        }
    };

    // 将callback绑定到methodName执行的前/后时触发
    function weaver(when, methodName, callback) {
        var names = methodName.split(ASPECT_SPLITTER);
        var name, method;
        while (name = names.shift()) {
            method = this[name];
            if (!method || typeof method != 'function') {
                break;
            }
            if (!method._isAspected) {
                wrap.call(this, name);
            }
            this.on(when + ':' + name, callback);
        }
    }

    function wrap(methodName) {
        var method = this[methodName];
        var ret, beforeFunRet;
        var me = this;
        this[methodName] = function () {
            beforeFunRet = this.trigger('before:' + methodName, Array.prototype.slice.call(arguments));
            if (beforeFunRet === false) {
                return;
            }
            ret = method.apply(this, arguments);
            this.trigger('after:' + methodName, Array.prototype.slice.call(arguments));
            return ret;
        };
        this[methodName]._isAspected = true;
    }

    Nova.AspectBehavior = AspectBehavior;
})();
'use strict';
(function () {
    /*
    * Properties功能：
    * 1. 定义props中声明的properties，监听变化
    * 2. 通过attributes初始化properties
    * 3. 监听attributes，变化时，同步更新到props声明的properties
    * */
    var PropBehavior = {
        props: function props() {},

        /*
        * Used when transfering attribute to prop
        */
        _propTypes: [Object, Number, String, Boolean, Date, Array],

        /*
         * 所有属性改变时，都会触发的事件
         * */
        _propsCommonChangeEvent: '_propsChanged',

        createdHandler: function createdHandler() {
            initProperties.call(this);
        },

        attributeChangedHandler: function attributeChangedHandler(attrName, oldVal, newVal) {
            var propName = Nova.CaseMap.dashToCamelCase(attrName);
            var prop = this.props[propName];
            if (prop) {
                setPropFromAttr.call(this, attrName, newVal);
            }
        },

        set: function set(path, value, opt) {
            var paths = path.split('.');

            if (paths.length == 1 && this.get(path) != value) {
                this[paths[0]] = value;
                return;
            }

            var curObj = this;
            var oldVal = curObj[paths[0]];
            for (var i = 0, len = paths.length; i < len - 1; i++) {
                if (!curObj[paths[i]]) {
                    return;
                }
                curObj = curObj[paths[i]];
            }
            curObj[paths[paths.length - 1]] = value;
            triggerPropChange.call(this, this._getPropChangeEventName(paths[0]), [oldVal, this[paths[0]], path]);
        },

        get: function get(path) {
            var paths = path.split('.');
            var curObj = this;
            for (var i = 0, len = paths.length; i < len; i++) {
                curObj = curObj[paths[i]];
            }
            return curObj;
        },

        addProperty: function addProperty(prop, config) {
            this.props[prop] = config;
            defineProperty.call(this, prop, config);
        },

        hasProperty: function hasProperty(propName) {
            return !!this.props[propName];
        },

        notifyPath: function notifyPath(path) {
            var paths = path.split(',');
            triggerPropChange.call(this, this._getPropChangeEventName(paths[0]), [this[paths[0]], this[paths[0]], path]);
        },

        _getPropChangeEventName: function _getPropChangeEventName(propName) {
            return '_' + propName + 'Changed';
        }
    };

    function triggerPropChange(event, args) {
        this.trigger.apply(this, arguments);
        this.trigger(this._propsCommonChangeEvent, args);
    }

    /*
     * 初始化props
     * 1. 将props转换为标准格式{type:String, ...}
     * 2. 解析props的config，解析并应用到this
     * 3. 将attribute上的属性应用到props
     * */
    function initProperties() {
        var proto = {};
        var oldProto = this.__proto__;
        this.__proto__ = proto;
        proto.__proto__ = oldProto;
        // 定义properties
        for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop)) {
                transferProperty.call(this, prop);
                defineProperty.call(this, prop, this.props[prop]);
            }
        }
        // 设置properties初始值
        for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop)) {
                setPropInitVal.call(this, prop, this.props[prop]);
            }
        }
    }

    /*
    * 通过Attribute，设置property
    * */
    function setPropFromAttr(attrName) {
        var propName = Nova.CaseMap.dashToCamelCase(attrName);
        var prop = this.props[propName];
        var val = this.getAttribute(attrName);
        this[propName] = fromAttrToProp.call(this, attrName, val, prop);
    }

    /*
    * 将props转换为完整定义
    * */
    function transferProperty(prop) {
        var value = this.props[prop];
        // 检测是否简单写法，如果是，转换成完整写法
        if (this._propTypes.indexOf(value) >= 0) {
            this.props[prop] = {
                type: this.props[prop]
            };
        }
    }

    /*
    * 定义单个property
    * */
    function defineProperty(name, config) {
        var self = this;
        var realPropPrefix = '_prop_';

        Object.defineProperty(this.__proto__, name, {

            get: function get() {
                return self[realPropPrefix + name];
            },
            set: function set(val) {
                var oldVal = self[realPropPrefix + name];

                if (val == oldVal) {
                    return;
                }

                self[realPropPrefix + name] = val;
                // TODO: 实现relectToAttribute
                /*
                if(config.reflectToAttribute) {
                    self.setAttribute(name, fromPropToAttr.call(this, config));
                }
                */
                triggerPropChange.call(self, self._getPropChangeEventName(name), [oldVal, val, name]);
            }
        });

        // init observers
        if (config.observer) {
            this.on(self._getPropChangeEventName(name), function () {
                if (self[config.observer]) {
                    self[config.observer].apply(self, arguments);
                }
            });
        }
    }

    function setPropInitVal(name, config) {
        var oldVal = this[name];
        delete this[name];

        // set value
        var attrName = Nova.CaseMap.camelToDashCase(name);

        // 优先读取attribute
        if (this.hasAttribute(attrName)) {
            setPropFromAttr.call(this, attrName);
        }
        // 若已有绑定的值，则使用原来的值
        else if (oldVal) {
            this[name] = oldVal;
        }
        // 否则使用默认值
        else if (config.hasOwnProperty('value')) {
            if (typeof config.value == 'function') {
                this[name] = config.value.apply(this);
            } else {
                this[name] = config.value;
            }
        }
    }

    function fromAttrToProp(attrName, value, config) {
        var type = config.type;
        if (type != String) {
            value && (value = value.trim());
        }

        var result = value;
        switch (type) {
            case Object:
            case Array:
                try {
                    result = JSON.parse(value);
                } catch (e) {
                    result = null;
                    console.warn('Nova::Attributes: could not decode Array as JSON');
                }
                break;
            case Number:
                result = Number(value);
                break;
            case Date:
                result = new Date(value);
                break;
            case Boolean:
                return this.hasAttribute(attrName);
                break;
        }
        return result;
    }

    Nova.PropBehavior = PropBehavior;
})();

/*
prop: {
    type: 'String',
    value: 'haha',
    observe: '_xxx',
    reflectToAttribute: false
},
prop2: Object       // Object, Number, String, Boolean, Date, Array
*/
'use strict';
(function () {
    /*
     * Scan a template and produce an annotation data
     *
     * Supported Expressions:
     *
     * 1. double-mastache annotations in text content. 
     * <tag>{{annotation}}</tag>
     * <tag>{{annotation::change}}</tag>
     *
     * 2. double-escaped annotations in an attribute
     * <tag some-attribute="{{annotation}}"></tag>
     *
     *
     * Generated data-structure:
     * {
     *  node: [
     *      {
     *          type: 'property' | 'attribute' | 'text',
     *          name: 'attr-name' | 'propName',
     *          value: '{{prop1.value+"px"}} is longer than {{prop2.value + "px"}}',
     *
     *          // 当表达式可作为左值时，可以进行双向绑定
     *          isLeftValue: true,
     *          event: 'change',
     *
     *          relatedProps: [{name:'prop1', path: 'prop1.value'}, {name:'prop2', path:'prop2.value'}],
     *          annotations: [
     *              {
     *                  value: '{{prop1.value + "px"}}',
     *                  relatedProps: [{name:'prop1', path: 'prop1.value'}]
     *              }
     *          ]
     *      }
     *  ]
     * }
     *
     *
     * Notes:
     * nodes inside <template-repeat> will not be parsed
     *
     * */
    Nova.ExpressionParser = {
        BIND_TYPES: {
            TEXT: 1,
            PROPERTY: 2,
            ATTRIBUTE: 3,
            EVENT: 4
        },
        ANNOTATION_REGEXP: /{{.+?}}/g,
        SCOPED_ELEMENTS: ['TEMPLATE-REPEAT-ITEM', 'TEMPLATE'],
        parse: function parse(node) {
            var data = new Map();

            this._parseNode(node, data);

            return data;
        },

        // 解析一个节点
        _parseNode: function _parseNode(node, data) {
            if (node.nodeType == Node.TEXT_NODE) {
                this._parseTextNode(node, data);
            } else {
                this._parseElementNode(node, data);
            }
        },

        _parseTextNode: function _parseTextNode(node, data) {
            var value = node.textContent;
            if (!this._testEscape(value)) {
                return;
            }

            var self = this;
            var bindObj = this._parseExpression(value);
            $.extend(bindObj, {
                type: this.BIND_TYPES.TEXT
            });
            data.set(node, [bindObj]);
        },

        _parseElementNode: function _parseElementNode(node, data) {
            var self = this;

            var bindings = [];

            // parse attribute
            Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
                if (attr.constructor == Attr && self._testEscape(attr.value)) {
                    var bindType = self._getTypeByAttrName(attr.name);
                    var bindObj = {
                        type: bindType
                    };

                    switch (bindType) {
                        case self.BIND_TYPES.EVENT:
                            bindObj.event = Nova.CaseMap.dashToCamelCase(attr.name.match(/^on-(.+)$/)[1]);
                            bindObj.callback = self._parseCallbackAnnotation(attr.value);
                            break;
                        case self.BIND_TYPES.ATTRIBUTE:
                        case self.BIND_TYPES.PROPERTY:
                            bindObj.name = bindType == self.BIND_TYPES.ATTRIBUTE ? attr.name.slice(0, -1) : Nova.CaseMap.dashToCamelCase(attr.name);
                            $.extend(bindObj, self._parseExpression(attr.value));
                            break;
                    }
                    node.removeAttribute(attr.name);
                    bindings.push(bindObj);
                }
            });

            if (bindings.length > 0) {
                data.set(node, bindings);
            }

            // 遍历子节点
            if (this.SCOPED_ELEMENTS.indexOf(node.tagName) < 0) {
                node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                    self._parseNode(child, data);
                });
            }
        },

        _getTypeByAttrName: function _getTypeByAttrName(attrName) {
            // event binding
            if (attrName.match(/^on-(.+)$/)) {
                return this.BIND_TYPES.EVENT;
            }
            // attr binding
            else if (attrName[attrName.length - 1] == '_') {
                return this.BIND_TYPES.ATTRIBUTE;
            }
            // prop binding
            else {
                return this.BIND_TYPES.PROPERTY;
            }
        },

        _parseExpression: function _parseExpression(value) {
            var self = this;
            var annotations = [];
            var isLeftValue = undefined;
            var event = undefined;
            var props = [];
            value.replace(this.ANNOTATION_REGEXP, function (match) {
                annotations.push(self._parseAnnotation(match));
            });

            // 判断annotation中的表达式，是否是左值
            if (/^{{\s*([_$a-zA-Z][\w_\$\d\[\].:]*)\s*}}$/.test(value.trim())) {
                isLeftValue = true;
                event = annotations[0].event;
            }

            annotations.forEach(function (annotation) {
                // 检查是否为非左值进行双向绑定并提示警告
                if (!isLeftValue && annotation.event) {
                    console.warn('Cannot bind to non left value');
                }
                // 整理出相关的prop
                annotation.relatedProps.forEach(function (prop) {
                    if (props.indexOf(prop) < 0) {
                        props.push(prop);
                    }
                });
            });

            return {
                value: value,
                isLeftValue: isLeftValue,
                event: event,
                relatedProps: props,
                annotations: annotations
            };
        },

        // 解析表达式中的占位符{{}}
        _parseAnnotation: function _parseAnnotation(value) {
            var props = [];
            var annotationFactors = value.slice(2).slice(0, -2).trim().split('::');
            var expression = annotationFactors[0];
            var event = annotationFactors[1];
            var isLeftValue = undefined;

            // 移除表达式中的字符串
            var tmp = expression.replace(/"/g, '\'').replace(/\\\'/g, '').replace(/'.*?'/g, '');

            // 解析annotation中的属性
            // TODO: 现在把a.b.c()，解析出a.b.c。实际应该是a.b
            tmp.replace(/([_$a-zA-Z][\w_\$\d\[\].]*)/g, function (match, prop) {
                props.push({
                    name: prop.split('.')[0],
                    path: prop
                });
            });

            return {
                value: value,
                relatedProps: props,
                event: event
            };
        },

        _parseCallbackAnnotation: function _parseCallbackAnnotation(annotation) {
            var match = annotation.match(/^{{([_$a-zA-Z][\w_\$\d]*)}}$/);
            return match ? match[1] : undefined;
        },

        _testEscape: function _testEscape(value) {
            return value.match(this.ANNOTATION_REGEXP);
        }

    };
})();
'use strict';
(function () {
    Nova.ExpressionEvaluator = {
        compile: function compile(info, scope) {
            var self = this;
            var annotations = info.annotations;

            // 遍历scope链，获得渲染data
            var data = this.getTmplData(info, scope);

            var tmplString = this.compileTmplString(info);

            return this.evaluate(tmplString, data, info);
        },

        // TODO: 支持输入{}转义
        evaluate: function evaluate(str, data, extra) {
            // 如果绑定的是属性，且expression只有一个annotation，且annotation两边没有其他字符
            // 则返回的值，不能转换成字符串
            if (extra.type == Nova.ExpressionParser.BIND_TYPES.PROPERTY && extra.annotations.length == 1 && str.trim().match(/^\{\{[^\{\}]*}\}$/)) {
                var result = undefined;
                str.replace(/\{\{([^\{\}]*)\}\}/g, function (sub, expr) {
                    if (!expr) return '';
                    try {
                        result = new Function('data', 'with(data){return (' + expr + ');}')(data);
                    } catch (ex) {
                        result = sub;
                    }
                });

                return result;
            }

            return Nova.Utils.tmpl(str, data);
        },

        compileTmplString: function compileTmplString(info) {
            var self = this;
            if (!info.tmplString) {
                (function () {
                    var tmplValue = info.value;
                    info.annotations.forEach(function (annotation) {
                        var annotationTmplValue = self.compileAnnotationTmplString(annotation);
                        tmplValue = tmplValue.replace(annotation.value, annotationTmplValue);
                    });
                    info.tmplString = tmplValue;
                })();
            }
            return info.tmplString;
        },

        compileAnnotationTmplString: function compileAnnotationTmplString(annotation) {
            var self = this;
            var tmplValue = annotation.value;

            // 去除::event
            tmplValue = tmplValue.replace(/::.+?}}/g, '}}');

            // 将a.0.b替换为a[0].b
            annotation.relatedProps.forEach(function (propObj) {
                var prop = propObj.path;
                // TODO: 排除字符串
                tmplValue = tmplValue.replace(new RegExp(prop, 'g'), function (match) {
                    // 将items.0转换为items[0]
                    var tmp = prop.replace(/\.(\d+)($|\.)/g, function (match, p1, p2) {
                        return '[' + p1 + ']' + p2;
                    });

                    return tmp;
                });
            });
            return tmplValue;
        },

        getTmplData: function getTmplData(info, scope) {
            var data = {};

            // 遍历scope链，生成data
            info.relatedProps.forEach(function (prop) {
                //if(info.value.indexOf('writer') >= 0)debugger;
                var curScope = scope;
                while (curScope) {
                    if (curScope.props[prop.name]) {
                        data[prop.name] = curScope[prop.name];
                        break;
                    }
                    curScope = curScope._nova.parentScope;
                }
            });

            return data;
        }
    };
})();
'use strict';
(function () {
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    var TemplateBehavior = {
        parentScope: null,

        createdHandler: function createdHandler() {
            if (!this.template) {
                return;
            }

            var self = this;

            // 内部使用属性
            this._nova.binds = {
                hostToChild: {},
                childToHost: new Map(),
                allBindings: [] // 所有绑定，包括与父scope的绑定
            };

            // 绑定事件，包括：
            // 1. 监听属性变化，属性改变时同步到child node
            bindEvents.call(self);

            // Data binding
            var nodeWrap = bindTemplate.call(this);

            // 插入content
            insertContent.call(this, nodeWrap);

            // 将编译好的节点插入到DOM中
            attach.call(this, nodeWrap);

            this.updateTemplate();
        },

        /*
         * 编译节点，工作包括
         * 1. 给每个节点添加tagName class，支持Scoped CSS
         * 2. data binding
         * */
        compileNode: function compileNode(node) {
            addClass.call(this, node);

            // 绑定节点与属性
            this.bindNode(node);
        },

        /*
         * Data binding
         * */
        bindNode: function bindNode(node) {
            var self = this;
            var bindData = Nova.ExpressionParser.parse(node);

            //if(this.is == 'template-repeat-item' && bindData.size > 0) debugger;

            // 遍历有绑定关系的节点
            bindData.forEach(function (bindings, node) {
                // 遍历节点与host绑定的不同attr/prop/textContent
                bindings.forEach(function (bindObj) {
                    // 通过on-event, 绑定child和host的方法
                    if (bindObj.type == Nova.ExpressionParser.BIND_TYPES.EVENT) {
                        var scope = findScopeByProp.call(self, bindObj.callback, true);
                        scope && hostListenToChild.call(scope, node, bindObj.event, bindObj);
                    }
                    // 绑定child和host的属性
                    else {
                        // From host to child 遍历被模板监听的属性
                        bindObj.relatedProps.forEach(function (prop) {
                            var scope = findScopeByProp.call(self, prop.name);
                            scope && childListenToHost.call(scope, node, prop.name, prop.path, bindObj);
                            self._nova.binds.allBindings.push(bindObj);
                        });

                        //  From child to host
                        if (bindObj.event) {
                            var scope = findScopeByProp.call(self, bindObj.relatedProps[0].name);
                            scope && hostListenToChild.call(scope, node, bindObj.event, bindObj);
                        }
                    }
                });

                // 添加scope
                if (Nova.ExpressionParser.SCOPED_ELEMENTS.indexOf(node.tagName) >= 0) {
                    node._nova = node._nova || {};
                    node._nova.parentScope = self;
                }
            });
        },

        /*
         * 取消节点与host的data binding
         * */
        unbindNode: function unbindNode(node) {
            var self = this;

            childUnlistenHost.call(self, node);
            hostUnListenChild.call(self, node);

            // traverse childNodes
            node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                self.unbindNode(child);
            });
        },

        updateTemplate: function updateTemplate(props) {
            var self = this;

            // 获取要刷新的属性列表
            if (props) {
                if (props.constructor != Array) {
                    props = [props];
                }
            }
            // 若没穿prop，则获取template中所有相关的属性，包括父级属性
            else {
                props = [];
                this._nova.binds.allBindings.forEach(function (bindObj) {
                    bindObj.relatedProps.forEach(function (prop) {
                        if (props.indexOf(prop.name) < 0) {
                            props.push(prop.path);
                        }
                    });
                });
            }

            // 遍历props，刷新属性相关节点
            props.forEach(function (propPath) {
                var scope = findScopeByProp.call(self, propPath.split('.')[0]);
                scope && updateTemplateByPropPath.call(scope, propPath);
            });
        }
    };

    // 寻找最近的scope
    // prop: 属性名
    // notDefinedProp: 若为true, 则寻找最近的拥有prop属性的scope，若为false，则寻找最近的通过props定义了属性的scope
    function findScopeByProp(prop, notDefinedProp) {
        var scope = this;
        while (scope) {
            if (!notDefinedProp && scope.hasProperty(prop)) {
                break;
            }
            if (notDefinedProp && typeof scope[prop] == 'function') {
                break;
            }
            scope = scope._nova.parentScope;
        }
        return scope;
    }

    function bindEvents() {
        this.on(this._propsCommonChangeEvent, propsChangedHandler);
    }

    /******************************* data binding ***********************************/
    function bindTemplate() {
        var wrap = document.createElement('div');
        wrap.innerHTML = this.template;
        this.compileNode(wrap);
        return wrap;
    }

    /*
     * host属性变化时，遍历this._nova.binds.hostToChild。
     * 同步监听host变化属性的child
     * */
    function propsChangedHandler(ev, oldVal, newVal, path) {
        updateTemplateByPropPath.call(this, path);
    }

    function updateTemplateByPropPath(path) {
        var self = this;
        var prop = path ? path.split('.')[0] : '';
        var bindingNodes = this._nova.binds.hostToChild[prop];

        bindingNodes && bindingNodes.forEach(function (bindArray, node) {
            bindArray && bindArray.forEach(function (bindInfo) {
                // 若path是bindInfo.propPath的父属性，eg.path:a.b, propPath:a.b.c，则同步数据
                if (bindInfo.propPath.slice(0, path.length) == path) {
                    var value = Nova.ExpressionEvaluator.compile(bindInfo.bindObj, self);
                    syncChild.call(self, node, value, bindInfo.bindObj);
                }
            });
        });
    }

    function childListenToHost(child, propName, propPath, bindObj) {
        var binds = this._nova.binds.hostToChild[propName] || new Map();
        this._nova.binds.hostToChild[propName] = binds;
        var bindArray = binds.get(child) || [];
        binds.set(child, bindArray);
        bindArray.push({
            propPath: propPath,
            bindObj: bindObj
        });
    }

    function hostListenToChild(child, event, bindObj) {
        var self = this;
        var binds = this._nova.binds.childToHost.get(child) || {};
        this._nova.binds.childToHost.set(child, binds);

        if (!binds[event]) {
            binds[event] = [];
            var callback = function callback(ev) {
                binds[event].forEach(function (bindObj) {
                    if (bindObj.type == Nova.ExpressionParser.BIND_TYPES.EVENT) {
                        var args = [ev].concat(ev.detail || []);
                        self[bindObj.callback].apply(self, args);
                    } else {
                        syncHost.call(self, child, bindObj.relatedProps[0].path, bindObj);
                    }
                });
            };
            child.addEventListener(event, callback);
            binds[event].callback = callback;
        }

        binds[event].push(bindObj);
    }

    function childUnlistenHost(child) {
        var self = this;
        for (var prop in this._nova.binds.hostToChild) {
            var bindArray = this._nova.binds.hostToChild[prop].get(child);
            bindArray && bindArray.forEach(function (bindInfo) {
                var index = self._nova.binds.allBindings.indexOf(bindInfo.bindObj);
                self._nova.binds.allBindings.splice(index, 1);
            });
            this._nova.binds.hostToChild[prop]['delete'](child);
        }
    }

    function hostUnListenChild(child) {
        var binds = this._nova.binds.childToHost.get(child);
        if (binds) {
            for (var _event in binds) {
                if (binds.hasOwnProperty(_event)) {
                    child.removeEventListener(_event, binds[_event].callback);
                }
            }
            this._nova.binds.childToHost['delete'](child);
        }
    }

    /*
     * 将host的属性同步到child
     * */
    function syncChild(child, value, extra) {
        switch (extra.type) {
            case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                if (child.getAttribute(extra.name) != value) {
                    child.setAttribute(extra.name, value);
                }
                break;
            case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                if (child[extra.name] != value) {
                    child[extra.name] = value;
                }
                break;
            case Nova.ExpressionParser.BIND_TYPES.TEXT:
                if (child.textContent != value) {
                    child.textContent = value;
                }
                break;
        }
    }

    function syncHost(child, propPath, extra) {
        var newVal = undefined;
        switch (extra.type) {
            case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                newVal = child[extra.name];
                break;
            case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                newVal = child.getAttribute(extra.name);
                break;
        }
        this.set(propPath, newVal);
    }

    /******************************* content insertion ***********************************/
    function insertContent(nodesWrap) {
        var self = this;
        var contents = Array.prototype.slice.call(nodesWrap.querySelectorAll('content'));
        contents.forEach(function (content) {
            var select = content.getAttribute('select');
            var replacement = undefined;

            replacement = Array.prototype.slice.call((select ? self.querySelectorAll(select) : self.childNodes) || []);
            replacement.forEach(function (selectedEle) {
                if (Array.prototype.slice.call(self.children).indexOf(selectedEle) >= 0 || !select) {
                    content.parentElement.insertBefore(selectedEle, content);
                }
            });
            content.parentElement.removeChild(content);
        });
    }

    /******************************* others ***********************************/

    /*
     * Add tagName class to nodes to support Scoped CSS
     * */
    function addClass(node) {
        var self = this;

        // 添加tagName class, 支持css scope
        var scope = this;
        while (scope) {
            if (Nova.ExpressionParser.SCOPED_ELEMENTS.indexOf(scope.tagName) < 0) {
                if (!node.className || node.className.indexOf(scope.is) < 0) {
                    node.className += ' ' + scope.is;
                }
                // XXX
                if (node.hasAttribute && node.hasAttribute('class_')) {
                    node.setAttribute('class_', node.getAttribute('class_') + ' ' + scope.is);
                }
            }
            scope = scope._nova.parentScope;
        }

        // traverse childNodes
        node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
            addClass.call(self, child);
        });
    }

    /*
     * attach the compiled nodes to this
     * */
    function attach(nodesWrap) {
        var childNodes = Array.prototype.slice.call(nodesWrap.childNodes);
        for (var i = 0; i < childNodes.length; i++) {
            this.appendChild(childNodes[i]);
        }
    }

    Nova.TemplateBehavior = TemplateBehavior;
})();
'use strict';
(function () {
    /*
    * Nova Custom Element的基础原型链
    * */
    var Utils = Nova.Utils;
    var enable = true;
    var eleStack = [];

    var Base = {

        _behaviors: [Nova.EventBehavior, Nova.AspectBehavior, Nova.PropBehavior, Nova.TemplateBehavior],

        behaviors: [],

        props: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {
            var self = this;

            // 内部变量命名空间
            self._nova = self._nova || {};

            // 初始化behaviors
            self._initBehaviors();

            // 当parent完成created初始化后
            // 1. 设置初始的prop和attrs
            // 2. 调用behaviors和自定义元素的createdHandler
            this._waitForInit(function () {
                eleStack.push(self);

                // 设置元素创建时的初始attr/prop
                self._initInitialData();

                // 调用Behaviors的createdHandler
                self.trigger('created');

                self._nova.isCreated = true;
                eleStack.pop();
                self.trigger('finishCreated');

                // 调用自定义元素的CreatedHandler
                self.createdHandler && self.createdHandler();
            });
        },

        attachedCallback: function attachedCallback() {
            var self = this;
            this._waitForInit(function () {
                self.trigger('attached');
                self.attachedHandler && self.attachedHandler();
            });
        },

        detachedCallback: function detachedCallback() {
            var self = this;
            this._waitForInit(function () {
                self.trigger('detached');
                self.detachedHandler && self.detachedHandler();
            });
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            var self = this;
            if (this._nova.isCreated) {
                self.trigger('attributeChanged', [attrName, oldVal, newVal]);
                self.attributeChangedHandler && self.attributeChangedHandler(attrName, oldVal, newVal);
            }
        },

        _waitForInit: function _waitForInit(callback) {
            // 当parent完成created初始化后，才能开始create
            var parent = eleStack[eleStack.length - 1];
            if (!parent || parent._nova.isCreated) {
                callback();
            } else {
                (function () {
                    var finishCb = function finishCb() {
                        parent.off('finishCreated', finishCb);
                        callback();
                    };
                    parent.on('finishCreated', finishCb);
                })();
            }
        },

        /***************************** 初始化initial attrs/props ******************************/
        _initInitialData: function _initInitialData() {
            var data = Nova.Initial.get();
            Nova.Initial.clear();
            if (!data) {
                return;
            }
            if (data.attrs) {
                for (var attrName in data.attrs) {
                    this.setAttribute(attrName, data.attrs[attrName]);
                }
            }
            if (data.props) {
                for (var prop in data.props) {
                    this[prop] = data.props[prop];
                }
            }
            if (data.beforeCreated) {
                data.beforeCreated.call(this);
            }
        },

        /***************************** 初始化behaviors ******************************/
        _initBehaviors: function _initBehaviors() {
            var self = this;
            var behaviors = self._behaviors.concat(self.behaviors);

            /* 将behaviors的行为和属性合并到元素上 */
            behaviors.forEach(function (behavior) {
                var toMix = Utils.mix({}, behavior);
                'createdHandler attachedHandler detachedHandler attributeChangedHandler'.split(' ').forEach(function (prop) {
                    delete toMix[prop];
                });

                // 合并方法
                Utils.mix(self, toMix);

                // 合并属性
                Utils.mix(self.props, toMix.props);
            });

            /* 在生命周期的各个阶段初始化behaviors */
            this.on('created attached detached attributeChanged', function (e) {
                var args = arguments;
                behaviors.forEach(function (behavior) {
                    var handler = behavior[e.type + 'Handler'];
                    if (handler) {
                        handler.apply(self, Array.prototype.slice.call(args, 1));
                    }
                });
            });
        },

        /***************************** 保存和获取内部使用属性 ******************************/
        _getPrivateProp: function _getPrivateProp(prop) {
            if (!this._nova) {
                return;
            }
            return this._nova[prop];
        },

        _setPrivateProp: function _setPrivateProp(prop, val) {
            if (!this._nova) {
                this._nova = {};
            }
            this._nova[prop] = val;
        }
    };

    Base = Utils.chainObject(Base, HTMLElement.prototype);
    Nova.Base = Base;
})();
"use strict";

NovaExports.exports = { "stylesheet": "<style>\n        :host {display:none;}\n    </style>", "template": "<template>\n    </template>" };
"use strict";
var TemplateRepeat = NovaExports({
    is: "template-repeat",
    "extends": "template",
    props: {
        items: {
            type: Array,
            value: function value() {
                return [];
            }
        },
        as: {
            type: Array,
            value: "item"
        },
        indexAs: {
            type: String,
            value: "index"
        },
        parentSelector: String
    },
    createdHandler: function createdHandler() {
        var self = this;

        this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) : this.parentElement;

        // NOTICE: 通过setTimeout，保证使用js通过wrap创建元素后，能获取内部的template-repeat
        setTimeout(function () {
            self.parentElement && self.parentElement.removeChild(self);
        }, 0);

        this.on("_itemsChanged", this._itemsObserver);
        this.notifyPath("items");
    },
    _itemsObserver: function _itemsObserver(ev, oldVal, newVal, path) {
        if (path != "items" || !newVal) {
            return;
        }

        this.itemNodes = this.itemNodes || [];

        // 删除所有项
        for (var i = this.itemNodes.length - 1; i >= 0; i--) {
            this.removeItem(i);
        }
        // 添加新项
        for (var i = 0, len = newVal.length; i < len; i++) {
            this.appendItem(i);
        }
    },
    appendItem: function appendItem(index) {
        var self = this;

        var item = new TemplateRepeatItem({
            attrs: {
                index: index,
                item: "{{items." + index + "}}",
                as: this.as,
                "index-as": this.indexAs
            },
            props: {
                item: self.items[index],
                template: this.innerHTML,
                insertParent: this.insertParent
            },
            beforeCreated: function beforeCreated() {
                self.compileNode(this);
            }
        });

        item.on("_itemChanged", function (ev, oldVal, newVal, path) {
            self.itemChangedHandler.call(self, ev, oldVal, newVal, path, index);
        });

        this.itemNodes.push(item);
    },
    removeItem: function removeItem(index) {
        var self = this;
        var item = this.itemNodes.splice(index, 1)[0];
        item._childNodes.forEach(function (node) {
            node.parentElement && node.parentElement.removeChild(node);
            self.unbindNode(item);
        });
    },
    itemChangedHandler: function itemChangedHandler(ev, oldVal, newVal, path, index) {
        this.trigger("itemChanged", oldVal, newVal, path, index);
    }
});
"use strict";

NovaExports.exports = { "stylesheet": "", "template": "" };
"use strict";
var TemplateRepeat = NovaExports({
    is: "template-if",
    props: {
        "if": {
            type: Boolean
        }
    },
    createdHandler: function createdHandler() {
        this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) : this.parentElement;
        this.nodes = Array.prototype.slice.call(this.childNodes);

        // NOTICE: 通过setTimeout，保证使用js通过wrap创建元素后，能获取内部的template-if
        setTimeout(function () {
            self.parentElement && self.parentElement.removeChild(self);
        }, 0);

        this.on("_ifChanged", this._ifObserver);
        this.trigger("_ifChanged", [this["if"], this["if"]]);
    },
    _ifObserver: function _ifObserver(ev, oldVal, newVal) {
        var self = this;
        if (newVal) {
            this.nodes.forEach(function (node) {
                self.insertParent.appendChild(node);
            });
        } else {
            Array.prototype.slice.call(this.insertParent.childNodes).forEach(function (node) {
                self.insertParent.removeChild(node);
            });
        }
    }
});
"use strict";

NovaExports.exports = { "stylesheet": "", "template": "<template>\n        <content></content>\n    </template>" };
"use strict";
window.TemplateRepeatItem = NovaExports({
    is: "template-repeat-item",
    props: {
        insertParent: {
            type: Object
        },
        item: {
            type: null
        },
        index: {
            type: Number
        },
        as: {
            type: String,
            value: "item"
        },
        indexAs: {
            type: String,
            value: "index"
        },
        readyToRender: Boolean
    },
    createdHandler: function createdHandler() {
        var self = this;
        // 根据this.as和this.indexAs声明两个属性，为data-binding做准备
        if (!this.hasProperty(this.as)) {
            this.addProperty(this.as, { type: null, value: this.item });
            this[this.as] = this.item;
            this._bindProps("item", this.as);
        }
        if (!this.hasProperty(this.indexAs)) {
            this.addProperty(this.indexAs, { type: null, value: this.index });
            this[this.indexAs] = this.index;
            this._bindProps("index", this.indexAs);
        }

        // 绑定所有子节点
        this._childNodes = Array.prototype.slice.call(this.childNodes);

        // item改变时
        this.on("_itemChanged", function () {
            self.updateTemplate();
        });

        // 绑定子节点，插入到insertParent
        self._childNodes.forEach(function (child) {
            self.compileNode(child);
            self.insertParent.appendChild(child);
        });
    },
    _bindProps: function _bindProps(p1, p2) {
        var self = this;
        this.on(this._getPropChangeEventName(p1), function () {
            self[p2] = self[p1];
        });
        this.on(this._getPropChangeEventName(p2), function () {
            self[p1] = self[p2];
        });
    }

});
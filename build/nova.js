'use strict';
(function () {
    var Nova = function Nova(prototype) {
        Nova.Utils.chainObject(prototype, Nova.Base);
        var opts = { prototype: prototype };
        if (prototype['extends']) {
            opts['extends'] = prototype['extends'];
        }
        var registerd = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return registerd;
    };

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
        }

    };

    Nova.Utils = Utils;
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
                        selectors = selectors.replace(/([+>])/g, function (match) {
                            return ' ' + match + ' ';
                        });
                        selectors = selectors.split(/\s+/);
                        var selector = '';
                        selectors.every(function (s, i) {
                            if (s.indexOf(':host') >= 0) {
                                selector += s.replace(':host', tagName) + ' ';
                            } else if (s == '::content') {
                                if (i > 0) {
                                    for (var j = i + 1; j < selectors.length; j++) {
                                        selector += selectors[j] + ' ';
                                    }
                                    return false;
                                } else {
                                    selector += '::content ';
                                }
                            } else if ('> +'.split(' ').indexOf(s) >= 0) {
                                selector += s + ' ';
                            } else {
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

        createdHandler: function createdHandler() {
            initProperties.call(this);
        },

        attributeChangedHandler: function attributeChangedHandler(attrName, oldVal, newVal) {
            var propName = Nova.CaseMap.dashToCamelCase(attrName);
            var prop = this.props[propName];
            if (prop) {
                setPropFromAttr.call(this, attrName, newVal);
            }
        }

    };

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
        for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop)) {
                transferProperty.call(this, prop);
                defineProperty.call(this, prop, this.props[prop]);
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
                //alert('set:' + name + ' to ' + val);
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
                self.trigger(getPropChangeEventName(name), [oldVal, val]);
            }
        });

        // init observers
        if (config.observer) {
            this.on(getPropChangeEventName(name), function () {
                if (self[config.observer]) {
                    self[config.observer].apply(self, arguments);
                }
            });
        }

        // set value
        var attrName = Nova.CaseMap.camelToDashCase(name);
        if (this.hasAttribute(attrName)) {
            setPropFromAttr.call(this, attrName);
        } else if (config.hasOwnProperty('value')) {
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
            value = value.trim();
        }

        var result = value;
        switch (type) {
            case Object:
            case Array:
                result = JSON.parse(value);
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

    function getPropChangeEventName(propName) {
        return '_' + propName + 'Changed';
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
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    var TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            ATTRIBUTE: 2
        },
        createdHandler: function createdHandler() {
            if (!this.template) {
                return;
            }

            var self = this;
            var wrap = document.createElement('div');
            wrap.innerHTML = this.template;

            // 初始化每一个节点
            initNode.call(this, wrap);

            // 插入content
            insertContent.call(this, wrap);

            // 插入到DOM中
            attach.call(this, wrap);
        }
    };

    /*
    * content insertion
    * */
    function insertContent(nodesWrap) {
        var self = this;
        var contents = Array.prototype.slice.call(nodesWrap.querySelectorAll('content'));
        contents.forEach(function (content) {
            var select = content.getAttribute('select');
            var replacement = undefined;

            replacement = Array.prototype.slice.call((select ? self.querySelectorAll(select) : self.childNodes) || []);
            replacement.forEach(function (selectedEle) {
                if (Array.prototype.slice.call(self.children).indexOf(selectedEle) >= 0) {
                    content.parentElement.insertBefore(selectedEle, content);
                }
            });
            content.remove();
        });
    }

    /*
    * 将解析好的模板插入到DOM中
    * */
    function attach(nodesWrap) {
        var childNodes = Array.prototype.slice.call(nodesWrap.childNodes);
        for (var i = 0; i < childNodes.length; i++) {
            this.appendChild(childNodes[i]);
        }
    }

    /*
    * 初始化template中的每个节点
    * 1. 添加tagName Class
    * 2. 添加annotation单向数据绑定
    * */
    function initNode(node) {
        var self = this;

        // 添加tagName class
        var className = this.is;
        node.className += ' ' + className;

        // 解析annotation
        // 替换属性注解<div attr="{{annotation}}">
        for (var i in node.attributes) {
            if (node.attributes.hasOwnProperty(i) && node.attributes[i].constructor == Attr) {
                var attr = node.attributes[i];
                var _match = attr.value.match(/^{{(.+)}}$/);
                if (_match) {
                    bind.call(this, node, _match[1], this.BIND_TYPES.ATTRIBUTE, { name: attr.name });
                }
            }
        }

        // 替换标签注解，<tagName>{{annotaion}}</tagName>
        var html = node.innerHTML.trim();
        var match = html.match(/^{{(.+)}}$/);
        if (match) {
            bind.call(this, node, match[1], this.BIND_TYPES.INNERHTML);
        }

        Array.prototype.slice.call(node.children).forEach(function (child) {
            initNode.call(self, child);
        });
    }

    /*
    * 对节点进行单向绑定
    * 1. html绑定
    * 2. attribute绑定
    * */
    function bind(node, prop, type, config) {
        var self = this;
        var propPath = prop.split('.');
        if (self.props.hasOwnProperty(prop)) {
            self.on('_' + propPath[0] + 'Changed', function (ev, oldVal, newVal) {
                for (var i = 1; i < propPath.length; i++) {
                    newVal = newVal[propPath[i]];
                }

                if (type == self.BIND_TYPES.INNERHTML) {
                    node.innerHTML = newVal;
                } else if (type == self.BIND_TYPES.ATTRIBUTE) {
                    var _type = self.props[propPath].type;
                    if (_type == Boolean) {
                        newVal ? node.setAttribute(config.name, '') : node.removeAttribute(config.name);
                    } else {
                        node.setAttribute(config.name, newVal);
                    }
                }
            });
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
    var Base = {

        _behaviors: [Nova.EventBehavior, Nova.AspectBehavior, Nova.TemplateBehavior, Nova.PropBehavior],

        behaviors: [],

        props: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {
            this._initBehaviors();

            this.trigger('created');
            this.createdHandler && this.createdHandler();
        },

        attachedCallback: function attachedCallback() {
            this.trigger('attached');
            this.attachedHandler && this.attachedHandler();
        },

        detachedCallback: function detachedCallback() {
            this.trigger('detached');
            this.detachedHandler && this.detachedHandler();
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            this.trigger('attributeChanged', [attrName, oldVal, newVal]);
            this.attributeChangedHandler && this.attributeChangedHandler(attrName, oldVal, newVal);
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
        }
    };

    Base = Utils.chainObject(Base, HTMLElement.prototype);
    Nova.Base = Base;
})();
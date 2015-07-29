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
        },
        tmpl2: (function () {

            var tmplFuns = {};
            /*
            sArrName 拼接字符串的变量名。
            */
            var sArrName = 'sArrCMX',
                sLeft = sArrName + '.push("';
            /*
                tag:模板标签,各属性含义：
                tagG: tag系列
                isBgn: 是开始类型的标签
                isEnd: 是结束类型的标签
                cond: 标签条件
                rlt: 标签结果
                sBgn: 开始字符串
                sEnd: 结束字符串
            */
            var tags = {
                '=': {
                    tagG: '=',
                    isBgn: 1,
                    isEnd: 1,
                    sBgn: '",QW.StringH.encode4HtmlValue(',
                    sEnd: '),"'
                },
                'js': {
                    tagG: 'js',
                    isBgn: 1,
                    isEnd: 1,
                    sBgn: '");',
                    sEnd: ';' + sLeft
                },
                //任意js语句, 里面如果需要输出到模板，用print("aaa");
                'if': {
                    tagG: 'if',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");if',
                    sEnd: '{' + sLeft
                },
                //if语句，写法为{if($a>1)},需要自带括号
                'elseif': {
                    tagG: 'if',
                    cond: 1,
                    rlt: 1,
                    sBgn: '");} else if',
                    sEnd: '{' + sLeft
                },
                //if语句，写法为{elseif($a>1)},需要自带括号
                'else': {
                    tagG: 'if',
                    cond: 1,
                    rlt: 2,
                    sEnd: '");}else{' + sLeft
                },
                //else语句，写法为{else}
                '/if': {
                    tagG: 'if',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                },
                //endif语句，写法为{/if}
                'for': {
                    tagG: 'for',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");for',
                    sEnd: '{' + sLeft
                },
                //for语句，写法为{for(var i=0;i<1;i++)},需要自带括号
                '/for': {
                    tagG: 'for',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                },
                //endfor语句，写法为{/for}
                'while': {
                    tagG: 'while',
                    isBgn: 1,
                    rlt: 1,
                    sBgn: '");while',
                    sEnd: '{' + sLeft
                },
                //while语句,写法为{while(i-->0)},需要自带括号
                '/while': {
                    tagG: 'while',
                    isEnd: 1,
                    sEnd: '");}' + sLeft
                } //endwhile语句, 写法为{/while}
            };

            return function (sTmpl, noJoin) {
                noJoin = noJoin ? 1 : 0;

                var fun = tmplFuns[sTmpl];
                if (!fun) {
                    var N = -1,
                        NStat = []; //语句堆栈;
                    var ss = [[/\{strip\}([\s\S]*?)\{\/strip\}/g, function (a, b) {
                        return b.replace(/[\r\n]\s*\}/g, ' }').replace(/[\r\n]\s*/g, '');
                    }], [/\\/g, '\\\\'], [/"/g, '\\"'], [/\r/g, '\\r'], [/\n/g, '\\n'], //为js作转码.
                    [/\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格。
                    function (a) {
                        a = a.substr(1, a.length - 2);
                        for (var i = 0; i < ss2.length; i++) {
                            a = a.replace(ss2[i][0], ss2[i][1]);
                        }
                        var tagName = a;
                        if (/^(=|.\w+)/.test(tagName)) {
                            tagName = RegExp.$1;
                        }
                        var tag = tags[tagName];
                        if (tag) {
                            if (tag.isBgn) {
                                var stat = NStat[++N] = {
                                    tagG: tag.tagG,
                                    rlt: tag.rlt
                                };
                            }
                            if (tag.isEnd) {
                                if (N < 0) {
                                    throw new Error('Unexpected Tag: ' + a);
                                }
                                stat = NStat[N--];
                                if (stat.tagG != tag.tagG) {
                                    throw new Error('Unmatch Tags: ' + stat.tagG + '--' + tagName);
                                }
                            } else if (!tag.isBgn) {
                                if (N < 0) {
                                    throw new Error('Unexpected Tag:' + a);
                                }
                                stat = NStat[N];
                                if (stat.tagG != tag.tagG) {
                                    throw new Error('Unmatch Tags: ' + stat.tagG + '--' + tagName);
                                }
                                if (tag.cond && !(tag.cond & stat.rlt)) {
                                    throw new Error('Unexpected Tag: ' + tagName);
                                }
                                stat.rlt = tag.rlt;
                            }
                            return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
                        } else {
                            return '",(' + a + '),"';
                        }
                    }]];
                    var ss2 = [[/\\n/g, '\n'], [/\\r/g, '\r'], [/\\"/g, '"'], [/\\\\/g, '\\'], [/\$(\w+)/g, 'opts["$1"]'], [/print\(/g, sArrName + '.push(']];
                    for (var i = 0; i < ss.length; i++) {
                        sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
                    }
                    if (N >= 0) {
                        throw new Error('Lose end Tag: ' + NStat[N].tagG);
                    }

                    sTmpl = sTmpl.replace(/##7b/g, '{').replace(/##7d/g, '}').replace(/##23/g, '#'); //替换特殊符号{}#
                    sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");if(' + noJoin + ') { return ' + sArrName + ';};return ' + sArrName + '.join("");';

                    //alert('转化结果\n'+sTmpl);
                    tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
                }

                return fun;
            };
        })()

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

        set: function set(path, value) {
            var paths = path.split('.');
            if (path.length == 0) {
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
            var oldSubVal = curObj[paths[paths.length - 1]];
            if (oldSubVal != value) {
                curObj[paths[paths.length - 1]] = value;
                triggerPropChange.call(this, this._getPropChangeEventName(paths[0]), [oldVal, this[paths[0]], path]);
            }
        },

        get: function get(path) {
            var paths = path.split('.');
            var curObj = this;
            for (var i = 0, len = paths.length; i < len; i++) {
                curObj = curObj[paths[i]];
            }
            return curObj;
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
            ATTRIBUTE: 3
        },
        ANNOTATION_REGEXP: /{{.+?}}/g,
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
                    var isBindAttribute = attr.name[attr.name.length - 1] == '$';
                    var bindObj = self._parseExpression(attr.value);
                    $.extend(bindObj, {
                        type: isBindAttribute ? self.BIND_TYPES.ATTRIBUTE : self.BIND_TYPES.PROPERTY,
                        name: isBindAttribute ? attr.name.slice(0, -1) : Nova.CaseMap.dashToCamelCase(attr.name)
                    });
                    node.removeAttribute(attr.name);
                    bindings.push(bindObj);
                }
            });

            if (bindings.length > 0) {
                data.set(node, bindings);
            }

            // 遍历子节点
            if (!(node.tagName && node.tagName.toLowerCase() == 'template-repeat')) {
                node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                    self._parseNode(child, data);
                });
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
            if (/^{{\s*([_$a-zA-Z][\w_\$\d\[\].]*)\s*}}$/.test(value.trim())) {
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
            // TODO: 排除字符串中有\'的场景
            var tmp = expression.replace(/"/g, '\'').replace(/'.*?'/g, '');

            // 解析annotation中的属性
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

            // 编译获取tmplFun
            /*
            if(!info.tmplFun) {
                let tmplValue = info.value;
                annotations.forEach(function(annotation) {
                    let annotationTmplValue = self.generateAnnotationTmplValue(annotation);
                    tmplValue = tmplValue.replace(annotation.value, annotationTmplValue);
                });
                info.tmplFun = Nova.Utils.tmpl(tmplValue, true);
            }
            */

            // 遍历scope链，获得渲染data
            var data = this.getTmplData(info, scope);

            return this.evaluate(info.value, data, info);
        },

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

        // 为占位符中的属性，添加'$'前缀，准备在模板中使用
        generateAnnotationTmplValue: function generateAnnotationTmplValue(annotation) {
            var self = this;
            var tmplValue = annotation.value;

            // 去除::event
            tmplValue = tmplValue.replace(/::.+?}}/g, '}}');

            // 将{{}}替换为{}
            tmplValue = tmplValue.slice(1).slice(0, -1);

            // 给所有属性添加$前缀
            annotation.relatedProps.forEach(function (propObj) {
                var prop = propObj.path;
                // TODO: 排除字符串
                tmplValue = tmplValue.replace(new RegExp(prop, 'g'), function (match) {
                    // 将items.0转换为items[0]
                    var tmp = prop.replace(/\.(\d+)($|\.)/g, function (match, p1, p2) {
                        return '[' + p1 + ']' + p2;
                    });

                    return '$' + tmp;
                });
            });
            return tmplValue;
        },

        getTmplData: function getTmplData(info, scope) {
            var propList = [];
            var data = {};

            // 整理出所有bind的属性
            info.annotations.forEach(function (annotation) {
                annotation.relatedProps.forEach(function (propObj) {
                    var prop = propObj.name;
                    if (propList.indexOf(prop) < 0) {
                        propList.push(prop);
                    }
                });
            });

            // 遍历scope链，生成data
            propList.forEach(function (prop) {
                var curScope = scope;
                while (curScope) {
                    if (curScope.props[prop]) {
                        data[prop] = curScope[prop];
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
     * generated this._nova.binds:
     * {
     *  propName: {
     *      node: {
     *          type: 'attribute',
     *          name: 'attr-name',
     *          value: '{{a}}hehe{{b}}',
     *          annotations: [{
     *              value: '{{a}}',
     *              properties: ['a'],
     *              event: 'change'
     *          }, {
     *              value: '{{b}}',
     *              properties: ['b']
     *          }];
     *      }
     *  }
     * }
     *
     * generated this._nova.listeningNodes
     * {
     *  node: {
     *      event: [{
     *          type: 'attribute',
     *          name: 'attr-name',
     *          value: '{{a}}'
     *      }]
     *  }
     * }
     *
     * */
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    var TemplateBehavior = {
        createdHandler: function createdHandler() {
            if (!this.template) {
                return;
            }

            var self = this;

            // 内部使用属性
            this._nova.binds = {
                hostToChild: {},
                childToHost: new Map()
            };
            //this._nova.listeningNodes = new Map();

            // 绑定事件，包括：
            // 1. 监听属性变化，属性改变时同步到child node
            bindEvents.call(self);

            // Data binding
            var nodeWrap = bindTemplate.call(this);

            // 插入content
            insertContent.call(this, nodeWrap);

            // 将编译好的节点插入到DOM中
            attach.call(this, nodeWrap);
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

            // 遍历有绑定关系的节点
            bindData.forEach(function (bindings, node) {
                // 遍历节点与host绑定的不同attr/prop/textContent
                bindings.forEach(function (bindObj) {
                    // 遍历相关的属性
                    bindObj.relatedProps.forEach(function (prop) {
                        childListenToHost.call(self, node, prop.name, bindObj);
                    });

                    if (bindObj.event) {
                        hostListenToChild.call(self, child, event, bindObj);
                    }
                });
            });

            /*
            bindList.forEach(function(nodeObj) {
                nodeObj.bindings.forEach(function(bindObj) {
                    let listenedProps = [];
                    bindObj.annotations.forEach(function(annotation) {
                        // binding: 从prop到node
                        annotation.properties.forEach(function(prop) {
                            prop = prop.split('.')[0];
                            if(!self._nova.binds[prop]) {
                                watchPropAndBind.call(self, prop);
                            }
                            // 将节点加入监听属性的列表
                            self._nova.binds[prop].set(nodeObj.node, bindObj);
                            listenedProps.push(prop);
                        });
                         // binding: 从node到prop
                        if(annotation.event) {
                            if(!self._nova.listeningNodes.get(node) || !self._nova.listeningNodes.get(node)[annotation.event]) {
                                watchNodeAndBind.call(self, nodeObj.node, annotation.event);
                            }
                            self._nova.listeningNodes.get(nodeObj.node)[annotation.event].push(bindObj);
                        }
                    });
                    // 记录节点监听的属性
                    nodeObj.node._nova = nodeObj.node._nova || {};
                    nodeObj.node._nova.listens = nodeObj.node._nova.listens || new Map();
                    nodeObj.node._nova.listens.set(self, listenedProps.join(' '));
                });
            });
            */
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
        }
    };

    function bindEvents() {
        this.on(this._propsCommonChangeEvent, propsChangedHandler);
    }

    /******************************* data binding ***********************************/
    function bindTemplate() {
        var wrap = document.createElement('div');
        wrap.innerHTML = this.template;
        this.bindNode(wrap);
        return wrap;
    }

    /*
     * host属性变化时，遍历this._nova.binds.hostToChild。
     * 同步监听host变化属性的child
     * */
    function propsChangedHandler(ev, oldVal, newVal, path) {
        var self = this;
        var prop = path.split('.')[0];
        var bindingNodes = this._nova.binds.hostToChild[prop];

        bindingNodes && bindingNodes.forEach(function (bindObj, node) {
            var value = Nova.ExpressionEvaluator.compile(bindObj, self);
            syncChild.call(self, node, value, bindObj);
        });
    }

    function childListenToHost(child, prop, bindObj) {
        var binds = this._nova.binds.hostToChild[prop] || new Map();
        this._nova.binds.hostToChild[prop] = binds;
        binds.set(child, bindObj);
    }

    function hostListenToChild(child, event, bindObj) {
        var self = this;
        var binds = this._nova.binds.childToHost.get(child) || {};
        this._nova.binds.childToHost.set(child, binds);

        if (!binds[event]) {
            binds[event] = [];
            var callback = function callback() {
                binds[event].forEach(function (bindObj) {
                    syncHost.call(self, child, bindObj.relatedProps[0].path, bindObj);
                });
            };
            child.addEventListener(event, callback);
        }

        binds[event].push(bindObj);
    }

    function childUnlistenHost(child) {}

    function hostUnListenChild(child) {}

    /*
     * 将host的属性同步到child
     * */
    function syncChild(child, value, extra) {
        switch (extra.type) {
            case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                child.setAttribute(extra.name, value);
                break;
            case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                child[extra.name] = value;
                break;
            case Nova.ExpressionParser.BIND_TYPES.TEXT:
                child.textContent = value;
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
        self.set(propPath, newVal);
    }

    /*
    function watchPropAndBind(prop) {
        let self = this;
        self._nova.binds[prop] = new Map();
        let binds = this._nova.binds[prop];
         this.on(this._getPropChangeEventName(prop), function(e, oldVal, newVal, path) {
            binds.forEach(function(bindObj, node) {
                let value = Nova.Expression.compile(bindObj, self);
                switch(bindObj.type) {
                    case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                        node.setAttribute(bindObj.name, value);
                        break;
                    case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                        node[bindObj.name] = value;
                        break;
                    case Nova.ExpressionParser.BIND_TYPES.TEXT:
                        if(node.nodeType == Node.TEXT_NODE) {
                            node.textContent = value;
                        } else {
                            node.innerHTML = value;
                        }
                        break;
                }
            });
        });
    }
    function watchNodeAndBind(node, event) {
        let self = this;
        if(!this._nova.listeningNodes.get(node)) {
            this._nova.listeningNodes.set(node, {});
        }
        if(!this._nova.listeningNodes.get(node)[event]) {
            this._nova.listeningNodes.get(node)[event] = [];
        }
        node.addEventListener(event, function() {
            let propList = self._nova.listeningNodes.get(node)[event];
            propList && propList.forEach(function(prop) {
                let propPath;
                prop.value.replace(/{{(.+)}}/, function(match, p) {
                    propPath = p;
                });
                propPath = propPath.split('::')[0];
                 let newVal;
                switch(prop.type) {
                    case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                        newVal = node[prop.name];
                        break;
                    case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                        newVal = node.getAttribute(prop.name);
                        break;
                }
                self.set(propPath, newVal);
            });
        });
    }
     */

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
        node.className += this.is;

        // traverse childNodes
        node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
            addClass.call(addClass, child);
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

        _behaviors: [Nova.EventBehavior, Nova.AspectBehavior, Nova.TemplateBehavior, Nova.PropBehavior],

        behaviors: [],

        props: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {

            //console.log(this.tagName + this.id, 'createdCallback');

            //alert(this.tagName + 'created');
            //if(this.id == 'inner') debugger;
            var self = this;
            self._nova = {}; // 内部变量命名空间
            self._initBehaviors();

            // 当parent完成created初始化后，才能开始create
            this._waitForInit(create);

            function create() {

                eleStack.push(self);
                self.trigger('created');

                self._nova.isCreated = true;
                eleStack.pop();
                self.trigger('finishCreated');

                ready();
            }

            function ready() {
                self.createdHandler && self.createdHandler();
                self._nova.ready = true;
            }
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
                parent.on('finishCreated', function () {
                    callback();
                });
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

NovaExports.exports = { "stylesheet": "\n        :host {display:none;}\n    ", "template": "\n    " };
"use strict";
var TemplateRepeat = NovaExports({
    is: "template-repeat",
    props: {
        items: {
            type: Array,
            value: function value() {
                return [];
            }
        },
        itemNodes: {
            type: Array,
            value: function value() {
                return [];
            }
        },
        parentSelector: String
    },
    createdHandler: function createdHandler() {
        var self = this;

        this.repeatTemplate = this.compileTemplate();
        this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) : this.parentElement;
        // NOTICE: 通过setTimeout，保证使用js通过wrap创建元素后，能获取内部的template-repeat
        setTimeout(function () {
            self.parentElement && self.parentElement.removeChild(self);
        }, 0);

        this.on("_itemsChanged", this.itemsObserver);
        this.trigger("_itemsChanged", [[], this.items]);
    },
    itemsObserver: function itemsObserver(ev, oldVal, newVal, path, noNeedToRender) {
        // 由最后一行主动触发时，无需重新渲染
        if (noNeedToRender) {
            return;
        }
        if (!newVal || newVal.constructor != Array) {
            return;
        }

        // 进行diff，若无改变，则返回
        var valString = JSON.stringify(newVal);
        if (this._lastVal == valString) {
            return;
        }

        this._lastVal = valString;

        // 删除所有项
        for (var i = this.itemNodes.length - 1; i >= 0; i--) {
            this.removeItem(i);
        }
        // 添加新项
        for (var i = 0, len = newVal.length; i < len; i++) {
            this.appendItem(i);
        }

        // 触发change，渲染刚刚添加的模板
        this.trigger("_itemsChanged", [[], this.items, path, true]);
    },
    appendItem: function appendItem(index) {
        var self = this;

        // 编译模板
        var wrap = document.createElement("div");
        var tmpl = this.repeatTemplate.replace(/{{items\[i\]:index}}/g, function () {
            return index;
        });
        tmpl = tmpl.replace(/{{items\[i\]/g, function () {
            return "{{items." + index;
        });
        wrap.innerHTML = tmpl;
        this.bindNode(wrap);

        // 插入到父元素
        var nodes = Array.prototype.slice.call(wrap.childNodes);
        nodes.forEach(function (node) {
            self.insertParent.appendChild(node);
        });

        // 保存到cache
        this.itemNodes.push(nodes);
    },
    removeItem: function removeItem(index) {
        var self = this;
        var nodes = this.itemNodes.splice(index, 1)[0];
        nodes.forEach(function (node) {
            node.parentElement && node.parentElement.removeChild(node);
            self.unbindNode(node);
        });
    },
    /*
    * 遍历除了内嵌的template-repeat以外的所有节点
    * 将{{item}}或{{item.xx}}替换为{{items[i].xx}}
    * 将{{item:index}}替换为{{items[i]:index}}
    * 保证appendItem替换占位符时，不会影响到内嵌的template-repeat
    */
    compileTemplate: function compileTemplate() {
        var self = this;
        this.compileNode(this);
        Array.prototype.slice.call(this.childNodes).forEach(function (child) {
            self.compileNode(child);
        });
        return this.innerHTML;
    },
    compileNode: function compileNode(node) {
        var self = this;

        // 替换{{item.name}}为{{item[i].name}}

        if (node.nodeType == Node.TEXT_NODE) {
            var cont = node.textContent.replace(/{{item(\..+|:index)?}}/g, function (match, p) {
                return "{{items[i]" + (p || "") + "}}";
            });
            //console.log(node.textContent, cont);
            node.textContent = cont;
        } else {
            // 遍历attribute
            Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
                if (attr.constructor == Attr) {
                    var match = attr.value.match(/^{{item(\..+|:index)?}}$/);
                    if (match) {
                        node.setAttribute(attr.name, "{{items[i]" + (match[1] || "") + "}}");
                    }
                }
            });
        }

        // 替换innerHTML
        /*
        let html = node.innerHTML.trim();
        let match = html.match(/^{{item(\..+|:index)?}}$/);
        if(match) {
            node.innerHTML = '{{items[i]' + (match[1] || '') + '}}';
        }
        */

        if (!(node.tagName && node.tagName.toLowerCase() == "template-repeat")) {
            node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                self.compileNode(child);
            });
        }
    }
});
"use strict";

NovaExports.exports = { "stylesheet": null, "template": null };
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
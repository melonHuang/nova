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
        /*
         * 模板函数
         * @param {String} str 模板字符串，表达式定界符为{{exp}}，表达式中不可包含连续的大括号，如'{{'或'}}'
         * @param {Object} data 数据
         * @param {Function} format
         * */
        tmpl: function tmpl(str, data, format) {
            var toString = true;
            if (str.trim().match(/^{{.*}}$/) && str.trim().match(/{{(.*?)}}/g).length == 1) {
                toString = false;
            }

            var r;
            str = str.replace(/\{\{(.*?)\}\}/g, function (sub, expr) {
                if (!expr) return '';
                try {
                    r = new Function('data', 'with(data){return (' + expr + ');}')(data);
                    return format ? format(r, expr) : r;
                } catch (ex) {
                    r = sub;
                    return sub;
                }
            });

            return toString ? str : r;
        }
    };

    Nova.Utils = Utils;
})();
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
            if (!method || !$.isFunction(method)) {
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
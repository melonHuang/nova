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
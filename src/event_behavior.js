'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

//define(function() {
(function () {

    var EVENT_SPLITTER = ' ';

    var CustomEvent = (function () {
        function CustomEvent(target, type, eventArgs) {
            _classCallCheck(this, CustomEvent);

            Nova.Base.mix(this, [{
                target: target,
                type: type,
                timeStamp: new Date() - 1
            }, eventArgs], true);
        }

        _createClass(CustomEvent, [{
            key: 'preventDefault',
            value: function preventDefault() {
                this._defaultPrevented = true;
            }
        }]);

        return CustomEvent;
    })();

    var EventBehavior = {
        on: function on(events, callback, context) {
            var cache = undefined,
                event = undefined;

            if (!callback) return this;

            cache = this.__events = this.__events || {};
            events = events.split(EVENT_SPLITTER);
            while (event = events.shift()) {
                cache[event] = cache[event] || [];
                cache[event].push(callback, context);
            }
            return this;
        },

        // this.off() 清除全部
        // this.off('switch') 清除全部switch事件的处理函数
        // this.off('switch', 'fun1'); 清除switch事件的fun1处理函数
        off: function off(events, callback) {
            var cache = this.__events,
                event = undefined;

            // 全部为空，则清除全部handler
            if (!(events || callback)) {
                delete this.__events;
                return this;
            }
            events = events.split(EVENT_SPLITTER);
            while (event = events.shift()) {
                var handlers = cache[event];
                // 若callback为空，则去除所有event的handler
                if (!callback) {
                    delete cache[event];
                }
                // 否则遍历event的handler，去除指定callback
                else if (handlers) {
                    for (var i = 0, len = handlers.length; i < len - 1; i += 2) {
                        if (handlers[i] == callback) {
                            handlers.splice(i, 2);
                        }
                    }
                }
            }
            return this;
        },

        // this.trigger('switch', [args1, args2]);
        // this.trigger('switch change', [args1, args2]);
        // @return true/false
        trigger: function trigger(events) {
            var cache = this.__events,
                event = undefined,
                me = this,
                returnValue = true;

            if (!cache) return me;

            events = events.split(EVENT_SPLITTER);
            while (event = events.shift()) {
                var handlers = cache[event];
                var ev = new CustomEvent(me, event);
                if (handlers) {
                    for (var i = 0, len = handlers.length; i < len; i += 2) {
                        var ctx = handlers[i + 1] || me;
                        var args = arguments[1] ? arguments[1].slice() : [];
                        args.unshift(ev);

                        var ret = handlers[i].apply(ctx, args);

                        // 当callback返回false时，阻止事件继续触发
                        if (ret === false) {
                            ev.preventDefault();
                        }

                        if (ev._defaultPrevented) {
                            returnValue = false;
                            break;
                        }
                    }
                }
            }
            return returnValue;
        }
    };

    Nova.EventBehavior = EventBehavior;
})();
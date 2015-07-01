'use strict';

(function () {
    /***************************** custom event polyfill ******************************/
    if (!window.CustomEvent) {
        var _CustomEvent = function _CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        _CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = _CustomEvent;
    }

    /***************************** event behavior ******************************/
    var EVENT_SPLITTER = ' ';
    var EventBehavior = {
        on: function on(types, listener, userCapture) {
            var _this = this;

            types = types.split(EVENT_SPLITTER);
            var type = undefined;

            var _loop = function () {
                var self = _this;
                _this.addEventListener(type, function (e) {
                    var args = [e].concat(e.detail);
                    listener.apply(self, args);
                }, userCapture);
            };

            while (type = types.shift()) {
                _loop();
            }
        },

        off: function off(types, listener, useCapture) {
            types = types.split(EVENT_SPLITTER);
            var type = undefined;
            while (type = types.shift()) {
                this.removeEventListener(type, listener, userCapture);
            }
        },

        trigger: function trigger(types, details) {
            types = types.split(EVENT_SPLITTER);
            var type = undefined;
            while (type = types.shift()) {
                var _event = new CustomEvent(type, { detail: details });
                this.dispatchEvent(_event);
            }
        }
    };

    Nova.EventBehavior = EventBehavior;
})();
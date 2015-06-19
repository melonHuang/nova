'use strict';
define(function () {
    var Event = {
        /***************************** 事件模型 ******************************/
        trigger: function trigger() {
            this.$.trigger.apply(this.$, arguments);
        },

        on: function on() {
            this.$.on.apply(this.$, arguments);
        },

        off: function off() {
            this.$.off.apply(this.$, arguments);
        }
    };

    return Event;
});
//# sourceMappingURL=event.js.map

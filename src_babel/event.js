'use strict';
define(function() {
    let Event = {
        /***************************** 事件模型 ******************************/
        trigger: function() {
            this.$.trigger.apply(this.$, arguments);
        },

        on: function() {
            this.$.on.apply(this.$, arguments);
        },

        off: function() {
            this.$.off.apply(this.$, arguments);
        },
    }

    return Event
});

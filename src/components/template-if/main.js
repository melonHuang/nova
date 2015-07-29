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
"use strict";

NovaExports.__fixedUglify = "script>";NovaExports.exports = { "stylesheet": "", "template": "" };
"use strict";
Nova.Components.TemplateIf = NovaExports({
    is: "template-if",
    props: {
        "if": {
            type: Boolean
        }
    },
    createdHandler: function createdHandler() {
        var self = this;
        this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) : this.parentElement;
        this.insertNextSibling = this.nextSibling;
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
                self.append(node);
            });
        } else {
            this.nodes.forEach(function (node) {
                if (node.parentElement == self.insertParent) {
                    self.insertParent.removeChild(node);
                }
            });
        }
    },
    // 插入策略类似template-repeat
    append: function append(child) {
        if (this.insertNextSibling && this.insertNextSibling.parentElement == this.insertParent) {
            this.insertParent.insertBefore(child, this.insertNextSibling);
        } else {
            this.insertParent.appendChild(child);
        }
    }
});
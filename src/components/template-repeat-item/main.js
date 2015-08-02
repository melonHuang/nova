"use strict";

NovaExports.exports = { "stylesheet": "", "template": "<template>\n        <content></content>\n    </template>" };
"use strict";
window.TemplateRepeatItem = NovaExports({
    is: "template-repeat-item",
    props: {
        insertParent: {
            type: Object
        },
        item: {
            type: null
        },
        index: {
            type: Number
        },
        as: {
            type: String,
            value: "item"
        },
        indexAs: {
            type: String,
            value: "index"
        },
        readyToRender: Boolean
    },
    createdHandler: function createdHandler() {
        var self = this;
        // 根据this.as和this.indexAs声明两个属性，为data-binding做准备
        if (!this.hasProperty(this.as)) {
            this.addProperty(this.as, { type: null, value: this.item });
            this[this.as] = this.item;
            this._bindProps("item", this.as);
        }
        if (!this.hasProperty(this.indexAs)) {
            this.addProperty(this.indexAs, { type: null, value: this.index });
            this[this.indexAs] = this.index;
            this._bindProps("index", this.indexAs);
        }

        // 绑定所有子节点
        this._childNodes = Array.prototype.slice.call(this.childNodes);

        // item改变时
        this.on("_itemChanged", function () {
            self.updateTemplate();
        });

        // 绑定子节点，插入到insertParent
        self._childNodes.forEach(function (child) {
            self.compileNode(child);
            self.insertParent.appendChild(child);
        });
    },
    _bindProps: function _bindProps(p1, p2) {
        var self = this;
        this.on(this._getPropChangeEventName(p1), function () {
            self[p2] = self[p1];
        });
        this.on(this._getPropChangeEventName(p2), function () {
            self[p1] = self[p2];
        });
    }

});
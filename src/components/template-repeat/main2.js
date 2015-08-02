"use strict";

NovaExports.exports = { "stylesheet": "<style>\n        :host {display:none;}\n    </style>", "template": "<template>\n    </template>" };
"use strict";
var TemplateRepeat = NovaExports({
    is: "template-repeat",
    props: {
        items: {
            type: Array,
            value: function value() {
                return [];
            }
        },
        itemNodes: {
            type: Array,
            value: function value() {
                return [];
            }
        },
        parentSelector: String
    },
    createdHandler: function createdHandler() {
        var self = this;

        this.repeatTemplate = this.compileTemplate();
        this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) : this.parentElement;
        // NOTICE: 通过setTimeout，保证使用js通过wrap创建元素后，能获取内部的template-repeat
        setTimeout(function () {
            self.parentElement && self.parentElement.removeChild(self);
        }, 0);

        this.on("_itemsChanged", this.itemsObserver);
        this.trigger("_itemsChanged", [[], this.items, "items"]);
    },
    itemsObserver: function itemsObserver(ev, oldVal, newVal, path, noNeedToRender) {
        if (path != "items") return;

        console.log("regenerated repeat html");
        // 由最后一行主动触发时，无需重新渲染
        if (noNeedToRender) {
            return;
        }
        if (!newVal || newVal.constructor != Array) {
            return;
        }

        // 进行diff，若无改变，则返回
        var valString = JSON.stringify(newVal);
        if (this._lastVal == valString) {
            return;
        }

        this._lastVal = valString;

        // 删除所有项
        for (var i = this.itemNodes.length - 1; i >= 0; i--) {
            this.removeItem(i);
        }
        // 添加新项
        for (var i = 0, len = newVal.length; i < len; i++) {
            this.appendItem(i);
        }

        // 触发change，渲染刚刚添加的模板
        this.trigger("_propsChanged", [[], this.items, path, true]);
    },
    appendItem: function appendItem(index) {
        var self = this;

        // 编译模板
        var wrap = document.createElement("div");
        var tmpl = this.repeatTemplate.replace(/{{items\[i\]:index}}/g, function () {
            return index;
        });
        tmpl = tmpl.replace(/{{items\[i\]/g, function () {
            return "{{items." + index;
        });
        wrap.innerHTML = tmpl;
        this.bindNode(wrap);

        // 插入到父元素
        var nodes = Array.prototype.slice.call(wrap.childNodes);
        nodes.forEach(function (node) {
            self.insertParent.appendChild(node);
        });

        // 保存到cache
        this.itemNodes.push(nodes);
    },
    removeItem: function removeItem(index) {
        var self = this;
        var nodes = this.itemNodes.splice(index, 1)[0];
        nodes.forEach(function (node) {
            node.parentElement && node.parentElement.removeChild(node);
            self.unbindNode(node);
        });
    },
    /*
    * 遍历除了内嵌的template-repeat以外的所有节点
    * 将{{item}}或{{item.xx}}替换为{{items[i].xx}}
    * 将{{item:index}}替换为{{items[i]:index}}
    * 保证appendItem替换占位符时，不会影响到内嵌的template-repeat
    */
    compileTemplate: function compileTemplate() {
        var self = this;
        this.compileNode(this);
        Array.prototype.slice.call(this.childNodes).forEach(function (child) {
            self.compileNode(child);
        });
        return this.innerHTML;
    },
    compileNode: function compileNode(node) {
        var self = this;

        // 替换{{item.name}}为{{item[i].name}}

        if (node.nodeType == Node.TEXT_NODE) {
            var cont = node.textContent.replace(/{{item(\..+|:index)?}}/g, function (match, p) {
                return "{{items[i]" + (p || "") + "}}";
            });
            //console.log(node.textContent, cont);
            node.textContent = cont;
        } else {
            // 遍历attribute
            Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
                if (attr.constructor == Attr) {
                    var match = attr.value.match(/^{{item(\..+|:index)?}}$/);
                    if (match) {
                        node.setAttribute(attr.name, "{{items[i]" + (match[1] || "") + "}}");
                    }
                }
            });
        }

        // 替换innerHTML
        /*
        let html = node.innerHTML.trim();
        let match = html.match(/^{{item(\..+|:index)?}}$/);
        if(match) {
            node.innerHTML = '{{items[i]' + (match[1] || '') + '}}';
        }
        */

        if (!(node.tagName && node.tagName.toLowerCase() == "template-repeat")) {
            node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                self.compileNode(child);
            });
        }
    }
});
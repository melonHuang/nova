NovaExports.exports={"stylesheet":null,"template":"\n        <content></content>\n    "};
        'use strict';
        window.TemplateRepeatItem = NovaExports({
            is: 'template-repeat-item',
            props: {
            },
            beforeTemplateInit: function() {
                let self = this;
                // 根据this.as和this.indexAs声明两个属性，为data-binding做准备
                this[this.as] = this.item;
                this.addProperty(this.as, {type: null, value: this.item});
                //this._bindProps('item', this.as);
                this[this.indexAs] = this.index;
                this.addProperty(this.indexAs, {type: null, value: this.index});
                //this._bindProps('index', this.indexAs);
            },
            createdHandler: function() {
                let self = this;

                // 绑定所有子节点
                this._childNodes = Array.prototype.slice.call(this.childNodes);

                // 绑定子节点，插入到insertParent
                self._childNodes.forEach(function(child) {
                    self.compileNodes(child);
                    self.insertParent.appendChild(child);
                });
            }

        });
    
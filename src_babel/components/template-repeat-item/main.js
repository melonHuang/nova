undefined;NovaExports.__fixedUglify="script>";NovaExports.exports={"template":"\n        <content></content>\n    "};
        'use strict';
        Nova.Components.TemplateRepeatItem = NovaExports({
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
                    self.append(child);
                });
            },

            /*
             * 插入策略优先级：
             * 1. 优先寻找template-repeat后面的兄弟节点，若有且其父元素未变更、则插入到这个节点之前
             * 2. 否则直接追加到template-repeat的父元素之后
             * 注意：若template-repeat的兄弟节点可能被移动、建议使用单独的元素包裹template-repeat
             */
            append: function(child) {
                if(this.insertNextSibling && this.insertNextSibling.parentElement == this.insertParent) {
                    this.insertParent.insertBefore(child, this.insertNextSibling);
                } else {
                    this.insertParent.appendChild(child);
                }
            }

        });
    
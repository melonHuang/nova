NovaExports.exports={"stylesheet":null,"template":"\n        <content></content>\n    "};
        'use strict';
        let TemplateRepeat = NovaExports({
            is: 'template-repeat-item',
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
                    value: 'item'
                },
                indexAs: {
                    type: String,
                    value: 'index'
                },
                readyToRender: Boolean
            },
            createdHandler: function() {
                let self = this;
                // 根据this.as和this.indexAs声明两个属性，为data-binding做准备
                if(!this.hasProperty(this.as)) {
                    this.addProperty(this.as, {type: null, value: this.item});
                    this[this.as] = this.item;
                    this._bindProps('item', this.as);
                }
                if(!this.hasProperty(this.indexAs)) {
                    this.addProperty(this.indexAs, {type: null, value: this.index});
                    this[this.indexAs] = this.index;
                    this._bindProps('index', this.indexAs);
                }

                // 绑定所有子节点
                this._childNodes = Array.prototype.slice.call(this.childNodes);

                // item改变时
                this.on('_itemChanged', function() {
                    self.updateTemplate();
                });

                this.on('_readyToRenderChanged', function() {
                    if(self.readyToRender) {
                        self._childNodes.forEach(function(child) {
                            self.compileNode(child);
                            self.insertParent.appendChild(child);
                        });
                    }
                });
            },
            render: function(html) {
            },
            _bindProps: function(p1, p2) {
                let self = this;
                this.on(this._getPropChangeEventName(p1), function() {
                    self[p2] = self[p1];
                });
                this.on(this._getPropChangeEventName(p2), function() {
                    self[p1] = self[p2];
                });
            }


        });
    
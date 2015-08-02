'use strict';
(function() {
    /*
    * Nova Custom Element的基础原型链
    * */
    let Utils = Nova.Utils;
    let enable = true;
    let eleStack = [];

    let Base = {

        _behaviors: [
            Nova.EventBehavior,
            Nova.AspectBehavior,
            Nova.PropBehavior,
            Nova.TemplateBehavior
        ],

        behaviors: [],

        props: {
        },

        /***************************** 生命周期 ******************************/
        createdCallback: function() {
            let self = this;

            // 内部变量命名空间
            self._nova = self._nova || {};


            // 初始化behaviors
            self._initBehaviors();

            // 当parent完成created初始化后
            // 1. 设置初始的prop和attrs
            // 2. 调用behaviors和自定义元素的createdHandler
            this._waitForInit(function() {
                eleStack.push(self);

                // 设置元素创建时的初始attr/prop
                self._initInitialData();

                // 调用Behaviors的createdHandler
                self.trigger('created');

                self._nova.isCreated = true;
                eleStack.pop();
                self.trigger('finishCreated');

                // 调用自定义元素的CreatedHandler
                self.createdHandler && self.createdHandler();
            });
        },

        attachedCallback: function() {
            let self = this;
            this._waitForInit(function() {
                self.trigger('attached');
                self.attachedHandler && self.attachedHandler();
            });
        },

        detachedCallback: function() {
            let self = this;
            this._waitForInit(function() {
                self.trigger('detached');
                self.detachedHandler && self.detachedHandler();
            });
        },

        attributeChangedCallback: function(attrName, oldVal, newVal) {
            let self = this;
            if(this._nova.isCreated) {
                self.trigger('attributeChanged', [attrName, oldVal, newVal]);
                self.attributeChangedHandler && self.attributeChangedHandler(attrName, oldVal, newVal);
            }
        },

        _waitForInit: function(callback) {
            // 当parent完成created初始化后，才能开始create
            let parent = eleStack[eleStack.length - 1];
            if(!parent  || parent._nova.isCreated) {
                callback();
            } else {
                let finishCb = function() {
                    parent.off('finishCreated', finishCb);
                    callback();
                }
                parent.on('finishCreated', finishCb)
            }
        },

        /***************************** 初始化initial attrs/props ******************************/
        _initInitialData: function() {
            let data = Nova.Initial.get();
            Nova.Initial.clear();
            if(!data) {return;}
            if(data.attrs) {
                for(let attrName in data.attrs) {
                    this.setAttribute(attrName, data.attrs[attrName])
                }
            }
            if(data.props) {
                for(let prop in data.props) {
                    this[prop] = data.props[prop];
                }
            }
            if(data.beforeCreated) {
                data.beforeCreated.call(this);
            }
        },

        /***************************** 初始化behaviors ******************************/
        _initBehaviors: function() {
            let self = this;
            let behaviors = self._behaviors.concat(self.behaviors);

            /* 将behaviors的行为和属性合并到元素上 */
            behaviors.forEach(function(behavior) {
                var toMix = Utils.mix({}, behavior);
                'createdHandler attachedHandler detachedHandler attributeChangedHandler'.split(' ').forEach(function(prop) {
                    delete toMix[prop];
                });

                // 合并方法
                Utils.mix(self, toMix);

                // 合并属性
                Utils.mix(self.props, toMix.props);

            });

            /* 在生命周期的各个阶段初始化behaviors */
            this.on('created attached detached attributeChanged', function(e) {
                let args = arguments;
                behaviors.forEach(function(behavior) {
                    var handler = behavior[e.type + 'Handler'];
                    if(handler) {
                        handler.apply(self, Array.prototype.slice.call(args, 1));
                    }
                });
            });

        },

        /***************************** 保存和获取内部使用属性 ******************************/
        _getPrivateProp: function(prop) {
            if(!this._nova) { return; }
            return this._nova[prop];
        },

        _setPrivateProp: function(prop, val) {
            if(!this._nova) { this._nova = {}; }
            this._nova[prop] = val;
        }
    };

    Base = Utils.chainObject(Base, HTMLElement.prototype);
    Nova.Base = Base;

})();

'use strict';
console.log('nova');
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
            Nova.TemplateBehavior,
            Nova.StyleBehavior
        ],

        behaviors: [],

        props: {
        },

        /***************************** 生命周期 ******************************/
        createdCallback: function() {
            let self = this;

            // 内部变量命名空间
            self._nova = self._nova || {};

            // mix behaviors
            self._initBehaviors();

            // 等待parent完成behaviors初始化，再开始自身的初始化
            // 原因：自身的prop/attr，需要先由parent的behaviors初始化
            this._waitForParentBehaviorsReady(function() {
                eleStack.push(self);

                // 设置元素创建时的初始attr/prop
                self._initInitialData();

                // 调用Behaviors的createdHandler
                self.trigger('nova.behaviors.created');
                self._nova.isBehaviorsReady = true;
                eleStack.pop();
                self.trigger('nova.behaviors.ready');

                // 调用自定义元素的CreatedHandler
                self.createdHandler && self.createdHandler();

                self.trigger('nova.ready');
                self._nova.isReady = true;
            });
        },

        attachedCallback: function() {
            let self = this;
            this._waitForParentBehaviorsReady(function() {
                self.trigger('nova.behaviors.attached');
                self.attachedHandler && self.attachedHandler();
            });
        },

        detachedCallback: function() {
            let self = this;
            this._waitForParentBehaviorsReady(function() {
                self.trigger('nova.behaviors.detached');
                self.detachedHandler && self.detachedHandler();
            });
        },

        attributeChangedCallback: function(attrName, oldVal, newVal) {
            let self = this;
            if(this._nova.isBehaviorsReady) {
                self.trigger('nova.behaviors.attributeChanged', [attrName, oldVal, newVal]);
                self.attributeChangedHandler && self.attributeChangedHandler(attrName, oldVal, newVal);
            }
        },

        _waitForParentBehaviorsReady: function(callback) {
            // 当parent完成created初始化后，才能开始create
            let parent = eleStack[eleStack.length - 1];
            if(!parent  || parent._nova.isBehaviorsReady) {
                callback();
            } else {
                let finishCb = function() {
                    parent.off('nova.behaviors.ready', finishCb);
                    callback();
                }
                parent.on('nova.behaviors.ready', finishCb)
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

            /* 将behaviors均转为标准格式(behaviors支持标准格式或构造函数格式) */
            behaviors.forEach(function(behavior, index) {
                // 构造函数格式
                if(typeof behavior == 'function') {
                    var srcPrototype = behavior.realConstructor.prototype;
                    var destBehavior = {};
                    behaviors[index] = destBehavior;

                    // 将prototype所有非原型链继承的属性都提取到destBehavior
                    for(var prop in srcPrototype) {
                        if(srcPrototype.hasOwnProperty(prop)) {
                            destBehavior[prop] = srcPrototype[prop];
                        }
                    }

                    // 将srcPrototype中的behaviors合并到此元素的behaviors中
                    (srcPrototype.behaviors || []).forEach(function(b, j) {
                        behaviors.splice(index + 1 + j, 0, b);
                    });
                }
            });

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
            this.on('nova.behaviors.created nova.behaviors.attached nova.behaviors.detached nova.behaviors.attributeChanged', function(e) {
                let args = arguments;
                let type = e.type.match(/nova\.behaviors\.(.+)$/)[1];
                behaviors.forEach(function(behavior) {
                    var handler = behavior[type + 'Handler'];
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

    //Base = Utils.chainObject(Base, HTMLElement.prototype);
    Nova.Base = Base;

})();

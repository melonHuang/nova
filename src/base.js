'use strict';
console.log('nova');
(function () {
    /*
    * Nova Custom Element的基础原型链
    * */
    var Utils = Nova.Utils;
    var enable = true;
    var eleStack = [];

    var Base = {

        _behaviors: [Nova.EventBehavior, Nova.AspectBehavior, Nova.PropBehavior, Nova.TemplateBehavior, Nova.StyleBehavior],

        behaviors: [],

        props: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {
            var self = this;

            // 内部变量命名空间
            self._nova = self._nova || {};

            // mix behaviors
            self._initBehaviors();

            // 等待parent完成behaviors初始化，再开始自身的初始化
            // 原因：自身的prop/attr，需要先由parent的behaviors初始化
            this._waitForParentBehaviorsReady(function () {
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

        attachedCallback: function attachedCallback() {
            var self = this;
            this._waitForParentBehaviorsReady(function () {
                self.trigger('nova.behaviors.attached');
                self.attachedHandler && self.attachedHandler();
            });
        },

        detachedCallback: function detachedCallback() {
            var self = this;
            this._waitForParentBehaviorsReady(function () {
                self.trigger('nova.behaviors.detached');
                self.detachedHandler && self.detachedHandler();
            });
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            var self = this;
            if (this._nova.isBehaviorsReady) {
                self.trigger('nova.behaviors.attributeChanged', [attrName, oldVal, newVal]);
                self.attributeChangedHandler && self.attributeChangedHandler(attrName, oldVal, newVal);
            }
        },

        _waitForParentBehaviorsReady: function _waitForParentBehaviorsReady(callback) {
            // 当parent完成created初始化后，才能开始create
            var parent = eleStack[eleStack.length - 1];
            if (!parent || parent._nova.isBehaviorsReady) {
                callback();
            } else {
                (function () {
                    var finishCb = function finishCb() {
                        parent.off('nova.behaviors.ready', finishCb);
                        callback();
                    };
                    parent.on('nova.behaviors.ready', finishCb);
                })();
            }
        },

        /***************************** 初始化initial attrs/props ******************************/
        _initInitialData: function _initInitialData() {
            var data = Nova.Initial.get();
            Nova.Initial.clear();
            if (!data) {
                return;
            }
            if (data.attrs) {
                for (var attrName in data.attrs) {
                    this.setAttribute(attrName, data.attrs[attrName]);
                }
            }
            if (data.props) {
                for (var prop in data.props) {
                    this[prop] = data.props[prop];
                }
            }
            if (data.beforeCreated) {
                data.beforeCreated.call(this);
            }
        },

        /***************************** 初始化behaviors ******************************/
        _initBehaviors: function _initBehaviors() {
            var self = this;
            var behaviors = self._behaviors.concat(self.behaviors);

            /* 将behaviors的行为和属性合并到元素上 */
            behaviors.forEach(function (behavior) {
                var toMix = Utils.mix({}, behavior);
                'createdHandler attachedHandler detachedHandler attributeChangedHandler'.split(' ').forEach(function (prop) {
                    delete toMix[prop];
                });

                // 合并方法
                Utils.mix(self, toMix);

                // 合并属性
                Utils.mix(self.props, toMix.props);
            });

            /* 在生命周期的各个阶段初始化behaviors */
            this.on('nova.behaviors.created nova.behaviors.attached nova.behaviors.detached nova.behaviors.attributeChanged', function (e) {
                var args = arguments;
                var type = e.type.match(/nova\.behaviors\.(.+)$/)[1];
                behaviors.forEach(function (behavior) {
                    var handler = behavior[type + 'Handler'];
                    if (handler) {
                        handler.apply(self, Array.prototype.slice.call(args, 1));
                    }
                });
            });
        },

        /***************************** 保存和获取内部使用属性 ******************************/
        _getPrivateProp: function _getPrivateProp(prop) {
            if (!this._nova) {
                return;
            }
            return this._nova[prop];
        },

        _setPrivateProp: function _setPrivateProp(prop, val) {
            if (!this._nova) {
                this._nova = {};
            }
            this._nova[prop] = val;
        }
    };

    Base = Utils.chainObject(Base, HTMLElement.prototype);
    Nova.Base = Base;
})();
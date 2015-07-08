'use strict';
(function () {
    /*
    * Nova Custom Element的基础原型链
    * */
    var Utils = Nova.Utils;
    var Base = {

        _behaviors: [Nova.EventBehavior, Nova.AspectBehavior, Nova.TemplateBehavior, Nova.PropBehavior],

        behaviors: [],

        props: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {
            this._initBehaviors();

            this.trigger('created');
            this.createdHandler && this.createdHandler();
        },

        attachedCallback: function attachedCallback() {
            this.trigger('attached');
            this.attachedHandler && this.attachedHandler();
        },

        detachedCallback: function detachedCallback() {
            this.trigger('detached');
            this.detachedHandler && this.detachedHandler();
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            this.trigger('attributeChanged', [attrName, oldVal, newVal]);
            this.attributeChangedHandler && this.attributeChangedHandler(attrName, oldVal, newVal);
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
            this.on('created attached detached attributeChanged', function (e) {
                var args = arguments;
                behaviors.forEach(function (behavior) {
                    var handler = behavior[e.type + 'Handler'];
                    if (handler) {
                        handler.apply(self, Array.prototype.slice.call(args, 1));
                    }
                });
            });
        }
    };

    Base = Utils.chainObject(Base, HTMLElement.prototype);
    Nova.Base = Base;
})();
'use strict';
(function () {
    /*
    * Nova Custom Element的基础原型链
    * */
    var Utils = Nova.Utils;
    var enable = true;

    var Base = {

        _behaviors: [Nova.EventBehavior, Nova.AspectBehavior, Nova.PropBehavior, Nova.TemplateBehavior],

        behaviors: [],

        props: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {
            if (!this._canInit()) {
                return;
            }

            //alert(this.tagName + 'created');
            var self = this;
            this._nova = {};
            this._initBehaviors();

            this.trigger('created');
            self.createdHandler && self.createdHandler();
        },

        attachedCallback: function attachedCallback() {
            if (!this._canInit()) {
                return;
            }
            this.trigger('attached');
            this.attachedHandler && this.attachedHandler();
        },

        detachedCallback: function detachedCallback() {
            if (!this._canInit()) {
                return;
            }
            this.trigger('detached');
            this.detachedHandler && this.detachedHandler();
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            if (!this._canInit()) {
                return;
            }
            this.trigger('attributeChanged', [attrName, oldVal, newVal]);
            this.attributeChangedHandler && this.attributeChangedHandler(attrName, oldVal, newVal);
        },

        /***************************** 控制是否初始化 ******************************/
        /*
         * 存在一些场景，不希望调用createdCallback
         * 例如：在templateBehaviors中，通过div.innerHTML = template模拟一个template元素的功能时，只是希望使用dom的接口，方便进行数据绑定。而不希望真正的去初始化内部元素。
         * */
        _enableInit: function _enableInit() {
            enable = true;
        },

        _disableInit: function _disableInit() {
            enable = false;
        },

        _canInit: function _canInit() {
            return enable;
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
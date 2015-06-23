'use strict';
//define(["properties_behavior", "event_behavior", "template_behavior"], function(PropBehavior, EventBehavior, TemplateBehavior) {
(function () {

    var Base = {

        _behaviors: [Nova.EventBehavior, Nova.TemplateBehavior, Nova.PropBehavior],

        behaviors: [],

        properties: {},

        /***************************** 生命周期 ******************************/
        createdCallback: function createdCallback() {
            this._initBehaviors();

            this.trigger('created');
            this.created && this.created();
            console.log('created: ', arguments);
        },

        attachedCallback: function attachedCallback() {
            this.trigger('attached');
            this.attached && this.attached();
        },

        detachedCallback: function detachedCallback() {
            this.trigger('detached');
            this.detached && this.detached();
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            this.trigger('attributeChanged', [attrName, oldVal, newVal]);
            this.attributeChanged && this.attributeChanged(attrName, oldVal, newVal);
        },

        /***************************** 初始化behaviors ******************************/
        _initBehaviors: function _initBehaviors() {
            var self = this;
            var behaviors = self._behaviors.concat(self.behaviors);

            /* 将behaviors的行为和属性合并到元素上 */
            behaviors.forEach(function (behavior) {
                // 合并方法
                self.mix(self, behavior);

                // 合并属性
                self.mix(self.properties, behavior.properties);
            });

            /* 在生命周期的各个阶段初始化behaviors */
            this.on('created attached detached attributeChanged', function (e) {
                behaviors.forEach(function (behavior) {
                    if (behavior[e.type]) {
                        behavior[e.type].call(self, Array.prototype.slice.call(arguments, 1));
                    }
                });
            });
        },

        /***************************** helpers ******************************/
        mix: function mix(des, src, override) {
            if (src && src.constructor == Array) {
                for (var i = 0, len = src.length; i < len; i++) {
                    this.mix(des, src[i], override);
                }
                return des;
            }
            if (typeof override == 'function') {
                for (i in src) {
                    des[i] = override(des[i], src[i], i);
                }
            } else {
                for (i in src) {
                    //杩欓噷瑕佸姞涓€涓猟es[i]锛屾槸鍥犱负瑕佺収椤句竴浜涗笉鍙灇涓剧殑灞炴€�
                    if (override || !(des[i] || i in des)) {
                        des[i] = src[i];
                    }
                }
            }
            return des;
        },
        /*
        * 使object的原型链尾端指向inherited, 拥有inherited的属性和方法
        */
        chainObject: function chainObject(object, inherited) {
            if (object && inherited && object !== inherited) {
                if (!Object.__proto__) {
                    object = this.mix(Object.create(inherited), object, true);
                } else {
                    // 首先找到object原型链末端
                    var lastPrototype = object;
                    while (lastPrototype.__proto__ && lastPrototype.__proto__.__proto__) {
                        lastPrototype = lastPrototype.__proto__;
                    }
                    lastPrototype.__proto__ = inherited;
                }
            }
            return object;
        }

    };

    Base = Base.chainObject(Base, HTMLElement.prototype);

    Nova.Base = Base;
})();
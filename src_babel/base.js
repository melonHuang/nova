'use strict';
define(["properties", "event"], function(Prop, Event) {

    let Base = {

        behaviors: [
            Prop,
            Event
        ],

        properties: {
        },

        /***************************** 生命周期 ******************************/
        createdCallback: function() {

            // 初始化jQuery对象
            this.$ = $(this);

            this._initBehaviors();

            this.trigger('created.life');
            this.created && this.created();
        },

        attachedCallback: function() {
            this.trigger('attached.life');
            this.attached && this.attached();
        },

        detachedCallback: function() {
            this.trigger('detached.life');
            this.detached && this.detached();
        },

        attributeChangedCallback: function(attrName, oldVal, newVal) {
            this.trigger('attributeChanged.life', [attrName, oldVal, newVal]);
            this.attributeChanged && this.attributeChanged(attr, oldVal, newVal);
        },

        /***************************** 初始化behaviors ******************************/
        _initBehaviors: function() {
            let self = this;

            /* 将behaviors的行为合并到元素上 */
            self.behaviors.forEach(function(behavior) {
                self.chainObject(self, behavior);
                $.extend();
            });

            /* 在生命周期的各个阶段初始化behaviors */
            this.on('created.life attached.life detached.life attributeChanged.life', function(e) {
                self.behaviors.forEach(function(behavior) {
                    if(behavior[e.type]) {
                        behavior[e.type].call(self, Array.prototype.slice.call(arguments, 1));
                    }
                });
            });

        },

        /*
        * 使object的原型链尾端指向inherited, 拥有inherited的属性和方法
        */
        chainObject: function(object, inherited) {
            if (object && inherited && object !== inherited) {
                if (!Object.__proto__) {
                    object = $.extend(Object.create(inherited), object);
                } else {
                    // 首先找到object原型链末端
                    let lastPrototype = object;
                    while(lastPrototype.__proto__ && lastPrototype.__proto__.__proto__) {
                        lastPrototype = lastPrototype.__proto__;
                    }
                    lastPrototype.__proto__ = inherited;
                }
            }
            return object;
        }

    };

    Base = Base.chainObject(Base, HTMLElement.prototype);

    return Base;

});

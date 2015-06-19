'use strict';

(function () {

    Nova.Element = Nova.Base.extend({
        attrs: {},

        initialize: function initialize() {},

        createdCallback: function createdCallback() {
            alert('created');
            this.created();
        },

        attachedCallback: function attachedCallback() {
            alert('attached');
            this.attached();
        },

        detachedCallback: function detachedCallback() {
            alert('detached');
            this.detached();
        },

        attributeChangedCallback: function attributeChangedCallback(attrName, oldVal, newVal) {
            alert('attributed changed');
            this.attributeChanged(attr, oldVal, newVal);
        },

        /*
        * 使object的原型链指向inherited, 拥有inherited的属性和方法
        */
        chainObject: function chainObject(object, inherited) {
            if (object && inherited && object !== inherited) {
                if (!Object.__proto__) {
                    object = $.extend(Object.create(inherited), object);
                }
                object.__proto__ = inherited;
            }
            return object;
        }

    });

    Nova.createElement = function () {};
})();
//# sourceMappingURL=element.js.map

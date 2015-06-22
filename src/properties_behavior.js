'use strict';
//define(['lib/case_map'], function(CaseMap) {
(function () {
    var PropBehavior = {
        properties: function properties() {},

        /*
        * Used when transfering attribute to prop
        */
        _propTypes: [Object, Number, String, Boolean, Date, Array],

        created: function created() {
            initProperties.call(this);
        },

        attributeChanged: function attributeChanged(attrName, oldVal, newVal) {
            var propName = Nova.CaseMap.dashToCamelCase(attrName);
            var prop = this.properties[propName];
            if (prop) {
                setPropFromAttr.call(this, attrName, newVal);
            }
        }

    };

    /*
     * 初始化properties
     * 1. 将properties转换为标准格式{type:String, ...}
     * 2. 解析properties的config，解析并应用到this
     * 3. 将attribute上的属性应用到properties
     * */
    function initProperties() {
        for (var prop in this.properties) {
            if (this.properties.hasOwnProperty(prop)) {
                transferProperty.call(this, prop);
                defineProperty.call(this, prop, this.properties[prop]);
            }
        }
    }

    function setPropFromAttr(attrName) {
        var propName = Nova.CaseMap.dashToCamelCase(attrName);
        var prop = this.properties[propName];
        var val = this.getAttribute(attrName);
        this[propName] = fromAttrToProp.call(this, attrName, val, prop);
    }

    function transferProperty(prop) {
        var value = this.properties[prop];
        // 检测是否简单写法，如果是，转换成完整写法
        if (this._propTypes.indexOf(value) >= 0) {
            this.properties[prop] = {
                type: this.properties[prop]
            };
        }
    }

    function defineProperty(name, config) {
        var self = this;
        var realPropPrefix = '_prop_';

        Object.defineProperty(this, name, {

            get: function get() {
                return self[realPropPrefix + name];
            },
            set: function set(val) {
                var oldVal = self[realPropPrefix + name];

                if (val == oldVal) {
                    return;
                }

                self[realPropPrefix + name] = val;
                // TODO: 实现relectToAttribute
                /*
                if(config.reflectToAttribute) {
                    self.setAttribute(name, fromPropToAttr.call(this, config));
                }
                */
                self.trigger(getPropChangeEventName(name), [oldVal, val]);
            }
        });

        // init observers
        if (config.observer) {
            this.on(getPropChangeEventName(name), this[config.observer]);
        }

        // set value
        var attrName = Nova.CaseMap.camelToDashCase(name);
        if (this.hasAttribute(attrName)) {
            setPropFromAttr.call(this, attrName);
        } else if (config.hasOwnProperty('value')) {
            if (typeof config.value == 'function') {
                this[name] = config.value.apply(this);
            } else {
                this[name] = config.value;
            }
        }
    }

    function fromAttrToProp(attrName, value, config) {
        var type = config.type;
        if (type != String) {
            value = value.trim();
        }

        var result = value;
        switch (type) {
            case Object:
            case Array:
                result = JSON.parse(value);
                break;
            case Number:
                result = Number(value);
                break;
            case Date:
                result = new Date(value);
                break;
            case Boolean:
                return this.hasAttribute(attrName);
                break;
        }
        return result;
    }

    function getPropChangeEventName(propName) {
        return '_' + propName + 'Changed';
    }

    Nova.PropBehavior = PropBehavior;
})();

/*
prop: {
    type: 'String',
    value: 'haha',
    observe: '_xxx',
    reflectToAttribute: false
},
prop2: Object       // Object, Number, String, Boolean, Date, Array
*/
'use strict';
(function () {
    /*
    * Properties功能：
    * 1. 定义props中声明的properties，监听变化
    * 2. 通过attributes初始化properties
    * 3. 监听attributes，变化时，同步更新到props声明的properties
    * */
    var PropBehavior = {
        props: function props() {},

        /*
        * Used when transfering attribute to prop
        */
        _propTypes: [Object, Number, String, Boolean, Date, Array],

        /*
         * 所有属性改变时，都会触发的事件
         * */
        _propsCommonChangeEvent: '_propsChanged',

        createdHandler: function createdHandler() {
            this.beforePropsInit && this.beforePropsInit();

            this.props = Nova.Utils.mix({}, [this.props]);

            initProperties.call(this);
        },

        attributeChangedHandler: function attributeChangedHandler(attrName, oldVal, newVal) {
            var propName = Nova.CaseMap.dashToCamelCase(attrName);
            var prop = this.props[propName];
            if (prop) {
                setPropFromAttr.call(this, attrName, newVal);
            }
        },

        set: function set(path, value, opt) {
            var paths = path.split('.');
            var oldVal = this[paths[0]];

            this._setProp(path, value);

            // 若不会触发setter，则需手动触发_propChange事件
            if (!(paths.length == 1 && this.get(path) != value)) {
                if (oldVal != value) {
                    triggerPropChange.call(this, this._getPropChangeEventName(paths[0]), [oldVal, this[paths[0]], path]);
                }
            }
        },

        _setProp: function _setProp(path, value) {
            var paths = path.split('.');
            var curObj = this;
            for (var i = 0, len = paths.length; i < len - 1; i++) {
                if (!curObj[paths[i]]) {
                    return;
                }
                curObj = curObj[paths[i]];
            }
            curObj[paths[paths.length - 1]] = value;
        },

        get: function get(path) {
            var paths = path.split('.');
            var curObj = this;
            for (var i = 0, len = paths.length; i < len; i++) {
                curObj = curObj[paths[i]];
            }
            return curObj;
        },

        addProperty: function addProperty(prop, config) {
            this.props[prop] = config;
            defineProperty.call(this, prop, config);
            setPropInitVal.call(this, prop, config);
        },

        hasProperty: function hasProperty(propName) {
            return !!this.props[propName];
        },

        notifyPath: function notifyPath(path) {
            var paths = path.split(',');
            triggerPropChange.call(this, this._getPropChangeEventName(paths[0]), [this[paths[0]], this[paths[0]], path]);
        },

        _getPropChangeEventName: function _getPropChangeEventName(propName) {
            return '_' + propName + 'Changed';
        }
    };

    function triggerPropChange(event, args) {
        this.trigger.apply(this, arguments);
        this.trigger(this._propsCommonChangeEvent, args);
    }

    /*
     * 初始化props
     * 1. 将props转换为标准格式{type:String, ...}
     * 2. 解析props的config，解析并应用到this
     * 3. 将attribute上的属性应用到props
     * */
    function initProperties() {
        var proto = {};
        var oldProto = this.__proto__;
        this.__proto__ = proto;
        proto.__proto__ = oldProto;
        // 定义properties
        for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop)) {
                transferProperty.call(this, prop);
                defineProperty.call(this, prop, this.props[prop]);
            }
        }
        // 设置properties初始值
        for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop)) {
                setPropInitVal.call(this, prop, this.props[prop]);
            }
        }
    }

    /*
    * 通过Attribute，设置property
    * */
    function setPropFromAttr(attrName) {
        var propName = Nova.CaseMap.dashToCamelCase(attrName);
        var prop = this.props[propName];
        var val = this.getAttribute(attrName);
        this[propName] = fromAttrToProp.call(this, attrName, val, prop);
    }

    /*
    * 将props转换为完整定义
    * */
    function transferProperty(prop) {
        var value = this.props[prop];
        // 检测是否简单写法，如果是，转换成完整写法
        if (this._propTypes.indexOf(value) >= 0) {
            this.props[prop] = {
                type: this.props[prop]
            };
        }
    }

    /*
    * 定义单个property
    * */
    function defineProperty(name, config) {
        var self = this;
        var realPropPrefix = '_prop_';

        Object.defineProperty(this.__proto__, name, {

            get: function get() {
                return self[realPropPrefix + name];
            },
            set: function set(val) {
                var oldVal = self[realPropPrefix + name];

                if (val == oldVal || val != val && oldVal != oldVal) {
                    return;
                }

                self[realPropPrefix + name] = val;
                // TODO: 实现relectToAttribute
                /*
                if(config.reflectToAttribute) {
                    self.setAttribute(name, fromPropToAttr.call(this, config));
                }
                */
                triggerPropChange.call(self, self._getPropChangeEventName(name), [oldVal, val, name]);
            }
        });

        // init observers
        if (config.observer) {
            this.on(self._getPropChangeEventName(name), function () {
                if (self[config.observer]) {
                    self[config.observer].apply(self, arguments);
                }
            });
        }
    }

    function setPropInitVal(name, config) {
        var oldVal = this[name];
        var hasOldVal = this.hasOwnProperty(name);
        delete this[name];

        var attrName = Nova.CaseMap.camelToDashCase(name);

        // 优先读取attribute
        if (this.hasAttribute(attrName)) {
            setPropFromAttr.call(this, attrName);
        }
        // 若已有绑定的值，则使用原来的值
        else if (hasOldVal) {
            this[name] = oldVal;
        }
        // 否则使用默认值
        else if (config.hasOwnProperty('value')) {
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
            value && (value = value.trim());
        }

        var result = value;
        switch (type) {
            case Object:
            case Array:
                try {
                    result = JSON.parse(value);
                } catch (e) {
                    result = null;
                    console.warn('Nova::Attributes: could not decode Array as JSON');
                }
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
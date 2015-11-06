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
            var propPath = Nova.CaseMap.dashToCamelCase(attrName);
            var propName = propPath.split('.')[0];

            if (this.hasProperty(propName)) {
                setPropFromAttr.call(this, attrName, newVal);
            }
        },

        set: function set(path, value, opt) {
            var paths = path.split('.');
            var oldVal = this[paths[0]];
            var oldSubVal = this.get(path);

            Nova.Utils.setPropByPath(this, path, value);

            // 若不会触发setter，则需手动触发_propChange事件
            if (!(paths.length == 1 && this.get(path) != value)) {
                if (oldSubVal != value) {
                    triggerPropChange.call(this, this._getPropChangeEventName(paths[0]), [oldVal, this[paths[0]], path]);
                }
            }
        },

        get: function get(path) {
            return Nova.Utils.getPropByPath(this, path);
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

        // 获取attrs初始化props的列表
        this._nova.attrsToPropsMap = getAttrsToPropsMap.call(this);

        // 设置properties初始值
        for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop)) {
                setPropInitVal.call(this, prop, this.props[prop]);
            }
        }
    }

    /*
     * 获得attrsToProps数据，格式：
     * {
     *      propName: {
     *          path,
     *          value,
     *          subProps: [{
     *              path,
     *              value
     *          }]
     *      }
     * }
     * */
    function getAttrsToPropsMap() {
        var self = this;
        var data = {};
        Array.prototype.slice.call(this.attributes || []).forEach(function (attr) {
            if (attr.constructor == Attr) {
                var attrName = attr.name;
                var attrVal = attr.value;
                var propPath = Nova.CaseMap.dashToCamelCase(attrName);
                var isSubProp = propPath.indexOf('.') >= 0;
                var propName = propPath.split('.')[0];
                var propConfig = self.props[propName];

                if (self.hasProperty(propName)) {
                    var mapData = data[propName] || {};
                    data[propName] = mapData;

                    if (isSubProp) {
                        mapData.subProps = mapData.subProps || [];
                        mapData.subProps.push({
                            path: propPath,
                            value: attrVal
                        });
                    } else {
                        Nova.Utils.mix(mapData, {
                            path: propPath,
                            value: fromAttrToProp.call(self, attrName, attrVal, propConfig)
                        });
                    }
                }
            }
        });
        return data;
    }

    function setPropFromAttr(attrName, attrVal) {
        var propPath = Nova.CaseMap.dashToCamelCase(attrName);
        var propName = propPath.split('.')[0];
        var isSubProp = propPath.indexOf('.') >= 0;
        var propConfig = this.props[propName];

        if (isSubProp) {
            this.set(propPath, attrVal);
        } else {
            this[propName] = fromAttrToProp.call(this, attrName, attrVal, propConfig);
        }
    }

    /*
    * 通过Attribute，初始化property
    * */
    function initPropFromAttr(propName) {
        var _this = this;

        var attrName = Nova.CaseMap.camelToDashCase(propName);
        var mapData = this._nova.attrsToPropsMap[propName];

        /* 通过attr初始化一级属性，如info="{}" */
        if (mapData.value) {
            this[propName] = mapData.value;
        }
        /* 通过attr初始化子属性，如info.age="1" */
        else {
            (function () {
                var configVal = getPropConfigValue(_this.props[propName]);
                mapData.subProps.forEach(function (subProp) {
                    var path = subProp.path.replace(/^(.+)\./, '');
                    Nova.Utils.setPropByPath(configVal, path, subProp.value);
                });
                _this[propName] = configVal;
            })();
        }
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

        // 优先通过attribute初始化属性
        //if(this.hasAttribute(attrName)) {
        if (this._nova.attrsToPropsMap[name]) {
            initPropFromAttr.call(this, name);
        }
        // 若已有绑定的值，则使用原来的值
        else if (hasOldVal) {
            this[name] = oldVal;
        }
        // 否则使用默认值
        else {
            this[name] = getPropConfigValue(config);
        }
    }

    function getPropConfigValue(config) {
        var value;
        if (config.hasOwnProperty('value')) {
            if (typeof config.value == 'function') {
                value = config.value.apply(this);
            } else {
                value = config.value;
            }
        }
        return value;
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
                return this.hasAttribute(attrName) && value != 'false';
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
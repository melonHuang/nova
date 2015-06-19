'use strict';
define(function () {
    var Prop = {
        properties: function properties() {},

        /*
        * Used when transfering attribute to prop
        */
        _propTypes: [Object, Number, String, Boolean, Date, Array],

        created: function created() {
            transferProperties.call(this);
        },

        set: function set(name, value) {}
    };

    function transferProperties() {
        for (var prop in this.properties) {
            if (this.properties.hasOwnProperty(prop)) {
                var value = properties[prop];
                // 检测是否简单写法，如果是，转换成完整写法
                if (this._propTypes.indexOf(value) >= 0) {
                    this.properties[prop] = {
                        type: this.properties[prop]
                    };
                }
                // 将properties值定义到this上
                this[prop] = this.properties[prop].value;
            }
        }
    }

    return Prop;
});

/*
prop: {
    type: 'String',
    value: 'haha',
    merge: true,
    observe: '_xxx'
},
prop2: Object       // Object, Number, String, Boolean, Date, Array
*/
//# sourceMappingURL=properties.js.map

'use strict';
(function() {
    /*
     * Scan a template and produce an annotation data
     *
     * Supported Expressions:
     *
     * 1. double-mastache annotations in text content. 
     * <tag>{{annotation}}</tag>
     * <tag>{{annotation::change}}</tag>
     *
     * 2. double-escaped annotations in an attribute
     * <tag some-attribute="{{annotation}}"></tag>
     *
     *
     * Generated data-structure:
     * {
     *  node: [
     *      {
     *          type: 'property' | 'attribute' | 'text',
     *          name: 'attr-name' | 'propName',
     *          value: '{{prop1.value+"px"}} is longer than {{prop2.value + "px"}}',
     *
     *          // 当表达式可作为左值时，可以进行双向绑定
     *          isLeftValue: true,
     *          event: 'change',
     *
     *          relatedProps: [{name:'prop1', path: 'prop1.value'}, {name:'prop2', path:'prop2.value'}],
     *          annotations: [
     *              {
     *                  value: '{{prop1.value + "px"}}',
     *                  relatedProps: [{name:'prop1', path: 'prop1.value'}]
     *              }
     *          ]
     *      }
     *  ]
     * }
     *
     *
     * Notes:
     * nodes inside <template-repeat> will not be parsed
     *
     * */
    Nova.ExpressionParser = {
        BIND_TYPES: {
            TEXT: 1,
            PROPERTY: 2,
            ATTRIBUTE: 3
        },
        ANNOTATION_REGEXP: /{{.+?}}/g,
        parse: function(node) {
            let data = new Map();

            this._parseNode(node, data);

            return data;
        },

        // 解析一个节点
        _parseNode: function(node, data) {
            if(node.nodeType == Node.TEXT_NODE) {
                this._parseTextNode(node, data);
            } else {
                this._parseElementNode(node, data);
            }
        },

        _parseTextNode: function(node, data) {
            let value = node.textContent;
            if(!this._testEscape(value)) {return;}

            let self = this;
            let bindObj = this._parseExpression(value);
            $.extend(bindObj, {
                type: this.BIND_TYPES.TEXT
            })
            data.set(node, [bindObj]);
        },


        _parseElementNode: function(node, data) {
            let self = this;

            let bindings = [];


            // parse attribute
            Array.prototype.slice.call(node.attributes || []).forEach(function(attr) {
                if(attr.constructor == Attr && self._testEscape(attr.value)) {
                    let isBindAttribute = attr.name[attr.name.length - 1] == '$';
                    let bindObj = self._parseExpression(attr.value);
                    $.extend(bindObj, {
                        type: isBindAttribute ? self.BIND_TYPES.ATTRIBUTE : self.BIND_TYPES.PROPERTY,
                        name: isBindAttribute ? attr.name.slice(0, -1) : Nova.CaseMap.dashToCamelCase(attr.name),
                    });
                    node.removeAttribute(attr.name);
                    bindings.push(bindObj);
                }
            });

            if(bindings.length > 0) {
                data.set(node, bindings);
            }

            // 遍历子节点
            if(!(node.tagName && node.tagName.toLowerCase() == 'template-repeat')) {
                node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function(child) {
                    self._parseNode(child, data);
                });
            }
        },

        _parseExpression: function(value) {
            let self = this;
            let annotations = [];
            let isLeftValue;
            let event;
            let props = [];
            value.replace(this.ANNOTATION_REGEXP, function(match) {
                annotations.push(self._parseAnnotation(match));
            });

            // 判断annotation中的表达式，是否是左值
            if(/^{{\s*([_$a-zA-Z][\w_\$\d\[\].]*)\s*}}$/.test(value.trim())) {
                isLeftValue = true;
                event = annotations[0].event;
            }

            annotations.forEach(function(annotation) {
                // 检查是否为非左值进行双向绑定并提示警告
                if(!isLeftValue && annotation.event) {
                    console.warn('Cannot bind to non left value');
                }
                // 整理出相关的prop
                annotation.relatedProps.forEach(function(prop) {
                    if(props.indexOf(prop) < 0) {
                        props.push(prop);
                    }
                });
            });

            return {
                value: value,
                isLeftValue: isLeftValue,
                event: event,
                relatedProps: props,
                annotations: annotations
            };
        },

        // 解析表达式中的占位符{{}}
        _parseAnnotation: function(value) {
            let props = [];
            let annotationFactors = value.slice(2).slice(0, -2).trim().split('::')
            let expression = annotationFactors[0];
            let event = annotationFactors[1];
            let isLeftValue;

            // 移除表达式中的字符串
            // TODO: 排除字符串中有\'的场景
            let tmp = expression.replace(/"/g, '\'').replace(/'.*?'/g, '');

            // 解析annotation中的属性
            tmp.replace(/([_$a-zA-Z][\w_\$\d\[\].]*)/g, function(match, prop) {
                props.push({
                    name: prop.split('.')[0],
                    path: prop
                });
            });

            return {
                value: value,
                relatedProps: props,
                event: event
            };
        },


        _testEscape: function(value) {
            return value.match(this.ANNOTATION_REGEXP);
        }

    };
})();

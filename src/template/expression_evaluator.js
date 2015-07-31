'use strict';
(function () {
    Nova.ExpressionEvaluator = {
        compile: function compile(info, scope) {
            var self = this;
            var annotations = info.annotations;

            // 遍历scope链，获得渲染data
            var data = this.getTmplData(info, scope);

            var tmplString = this.compileTmplString(info);

            return this.evaluate(tmplString, data, info);
        },

        // TODO: 支持输入{}转义
        evaluate: function evaluate(str, data, extra) {
            // 如果绑定的是属性，且expression只有一个annotation，且annotation两边没有其他字符
            // 则返回的值，不能转换成字符串
            if (extra.type == Nova.ExpressionParser.BIND_TYPES.PROPERTY && extra.annotations.length == 1 && str.trim().match(/^\{\{[^\{\}]*}\}$/)) {
                var result = undefined;
                str.replace(/\{\{([^\{\}]*)\}\}/g, function (sub, expr) {
                    if (!expr) return '';
                    try {
                        result = new Function('data', 'with(data){return (' + expr + ');}')(data);
                    } catch (ex) {
                        result = sub;
                    }
                });

                return result;
            }

            return Nova.Utils.tmpl(str, data);
        },

        compileTmplString: function compileTmplString(info) {
            var self = this;
            if (!info.tmplString) {
                (function () {
                    var tmplValue = info.value;
                    info.annotations.forEach(function (annotation) {
                        var annotationTmplValue = self.compileAnnotationTmplString(annotation);
                        tmplValue = tmplValue.replace(annotation.value, annotationTmplValue);
                    });
                    info.tmplString = tmplValue;
                })();
            }
            return info.tmplString;
        },

        compileAnnotationTmplString: function compileAnnotationTmplString(annotation) {
            var self = this;
            var tmplValue = annotation.value;

            // 去除::event
            tmplValue = tmplValue.replace(/::.+?}}/g, '}}');

            // 将a.0.b替换为a[0].b
            annotation.relatedProps.forEach(function (propObj) {
                var prop = propObj.path;
                // TODO: 排除字符串
                tmplValue = tmplValue.replace(new RegExp(prop, 'g'), function (match) {
                    // 将items.0转换为items[0]
                    var tmp = prop.replace(/\.(\d+)($|\.)/g, function (match, p1, p2) {
                        return '[' + p1 + ']' + p2;
                    });

                    return tmp;
                });
            });
            return tmplValue;
        },

        getTmplData: function getTmplData(info, scope) {
            var data = {};

            // 遍历scope链，生成data
            info.relatedProps.forEach(function (prop) {
                //if(info.value.indexOf('writer') >= 0)debugger;
                var curScope = scope;
                while (curScope) {
                    if (curScope.props[prop.name]) {
                        data[prop.name] = curScope[prop.name];
                        break;
                    }
                    curScope = curScope._nova.parentScope;
                }
            });

            return data;
        }
    };
})();
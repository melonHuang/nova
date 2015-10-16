'use strict';
(function () {
    Nova.ExpressionEvaluator = {
        compile: function compile(info) {
            var self = this;
            var annotations = info.annotations;
            var scope = info.scope;

            // 遍历scope链，获得渲染data
            var data = this.getTmplData(info, scope);

            var tmplString = this.compileTmplString(info);

            return this.evaluate(tmplString, data, info);
        },

        evaluate: function evaluate(str, data, extra) {
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
                    if ((curScope == scope || curScope.enumerableAsParentScope) && curScope.hasProperty(prop.name)) {
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
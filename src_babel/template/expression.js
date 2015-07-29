'use strict';
(function() {
    Nova.ExpressionEvaluator = {
        compile: function(info, scope) {
            let self = this;
            let annotations = info.annotations;

            // 编译获取tmplFun
            /*
            if(!info.tmplFun) {
                let tmplValue = info.value;
                annotations.forEach(function(annotation) {
                    let annotationTmplValue = self.generateAnnotationTmplValue(annotation);
                    tmplValue = tmplValue.replace(annotation.value, annotationTmplValue);
                });
                info.tmplFun = Nova.Utils.tmpl(tmplValue, true);
            }
            */

            // 遍历scope链，获得渲染data
            let data = this.getTmplData(info, scope);

            return this.evaluate(info.value, data, info);
        },

        evaluate: function(str, data, extra) {
            // 如果绑定的是属性，且expression只有一个annotation，且annotation两边没有其他字符
            // 则返回的值，不能转换成字符串
            if(extra.type == Nova.ExpressionParser.BIND_TYPES.PROPERTY && extra.annotations.length == 1 && str.trim().match(/^\{\{[^\{\}]*}\}$/)) {
                let result;
                str.replace(/\{\{([^\{\}]*)\}\}/g, function(sub, expr) {
                    if(!expr) return '';
                    try{
                        result = (new Function("data", "with(data){return (" + expr + ");}"))(data);
                    } catch(ex){
                        result = sub;
                    }
                });

                return result;
            }

            return Nova.Utils.tmpl(str, data);
        },

        // 为占位符中的属性，添加'$'前缀，准备在模板中使用
        generateAnnotationTmplValue: function(annotation) {
            let self = this;
            let tmplValue = annotation.value;

            // 去除::event
            tmplValue = tmplValue.replace(/::.+?}}/g, '}}');

            // 将{{}}替换为{}
            tmplValue = tmplValue.slice(1).slice(0, -1);


            // 给所有属性添加$前缀
            annotation.relatedProps.forEach(function(propObj) {
                let prop = propObj.path;
                // TODO: 排除字符串
                tmplValue = tmplValue.replace(new RegExp(prop, 'g'), function(match) {
                    // 将items.0转换为items[0]
                    let tmp = prop.replace(/\.(\d+)($|\.)/g, function(match, p1, p2) {
                        return '[' + p1 + ']' + p2;
                    });

                    return '$' + tmp;
                });
            });
            return tmplValue;
        },

        getTmplData: function(info, scope) {
            let propList = [];
            let data = {};

            // 整理出所有bind的属性
            info.annotations.forEach(function(annotation) {
                annotation.relatedProps.forEach(function(propObj) {
                    let prop = propObj.name;
                    if(propList.indexOf(prop) < 0) {
                        propList.push(prop);
                    }
                });
            });

            // 遍历scope链，生成data
            propList.forEach(function(prop) {
                let curScope = scope;
                while(curScope) {
                    if(curScope.props[prop]) {
                        data[prop] = curScope[prop];
                        break;
                    }
                    curScope = curScope._nova.parentScope;
                }
            });

            return data;
        }
    }
})();

'use strict';
(function() {
    let lastInsertedStylesheet;

    /*
    * 解析stylesheet属性，并添加css scope插入到DOM中
    * */
    let Style = {
        init: function(prototype) {
            if(!prototype.stylesheet || !prototype.stylesheet.trim()) { return; }

            let stylesheet = prototype.stylesheet;

            // 编译Stylesheet，为其添加scope
            stylesheet = this.compile(stylesheet, prototype.is);

            // 将stylesheet插入到head中
            this.attach(stylesheet);
        },

        compile: function(stylesheet, tagName) {
            let parsedStyle = Nova.CssParse.parse(stylesheet);
            let rules = parsedStyle.rules;
            return this.compileRules(rules, tagName);

        },

        compileRules: function(rules, tagName) {
            let self = this;
            let generatedCss = '';
            rules.forEach(function(rule) {
                // style
                if(rule.type == Nova.CssParse.types.STYLE_RULE) {
                    // 生成selector
                    let selectors = rule.selector;
                    selectors = selectors.replace(/([+>]|::content|::shadow)/g, function(match) {
                        return ' ' + match + ' ';
                    }).replace(/,/g, ' , ');
                    selectors = selectors.split(/\s+/);
                    let selector = '';
                    selectors.every(function(s, i) {
                        // :host 替换为tagName
                        if (s.indexOf(':host') >= 0) {
                            selector += s.replace(':host', tagName) + ' ';
                        }
                        // ::content, ::shadow 替换为空格
                        else if(s == '::content' || s == '::shadow'){
                            if(i > 0) {
                                for(let j = i + 1; j < selectors.length; j++) {
                                    selector += selectors[j] + ' ';
                                }
                                return false;
                            } else {
                                selector += s;
                            }
                        }
                        // >+, 直接拼接不做处理
                        else if('> + ,'.split(' ').indexOf(s) >= 0) {
                            selector += s + ' ';
                        }
                        // 默认添加.tagName
                        else {
                            let pseudoStart = s.indexOf(':');
                            if(pseudoStart < 0) {
                                selector += s + '.' + tagName + ' ';
                            } else {
                                selector += s.slice(0, pseudoStart) + '.' + tagName + s.slice(pseudoStart) + ' ';
                            }
                        }
                        return true;
                    });

                    // 生成CSS属性
                    let cssText = rule.cssText;
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }

                // keyframes
                if(rule.type == Nova.CssParse.types.KEYFRAMES_RULE) {
                    let selector = rule.selector;
                    let cssText = rule.cssText;
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }

                // media rule
                if(rule.type == Nova.CssParse.types.MEDIA_RULE) {
                    let selector = rule.selector;
                    let cssText = self.compileRules(rule.rules || [], tagName);
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }
            });
            return generatedCss;
        },

        attach: function(stylesheet) {
            let head = document.head;
            let styleEle = document.createElement('style');
            styleEle.innerHTML = stylesheet;

            // 第一次通过Nova插入Stylesheet，直接插入到head顶部
            if(!lastInsertedStylesheet) {
                head.insertBefore(styleEle, head.firstChild);
            // 若已有通过Nova插入的Stylesheet，则插入到其后面
            } else {
                head.insertBefore(styleEle, lastInsertedStylesheet.nextSibling);
            }
            lastInsertedStylesheet = styleEle;
        }
    };

    Nova.Style = Style;
})();

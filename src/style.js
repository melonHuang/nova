'use strict';
(function () {
    var lastInsertedStylesheet = undefined;

    /*
    * 解析stylesheet属性，并添加css scope插入到DOM中
    * */
    var Style = {
        init: function init(prototype) {
            if (!prototype.stylesheet) {
                return;
            }

            var stylesheet = prototype.stylesheet;

            // 编译Stylesheet，为其添加scope
            stylesheet = this.compile(stylesheet, prototype.is);

            // 将stylesheet插入到head中
            this.attach(stylesheet);
        },

        compile: function compile(stylesheet, tagName) {
            var parsedStyle = Nova.CssParse.parse(stylesheet);
            var rules = parsedStyle.rules;
            return this.compileRules(rules, tagName);
        },

        compileRules: function compileRules(rules, tagName) {
            var self = this;
            var generatedCss = '';
            rules.forEach(function (rule) {
                // style
                if (rule.type == Nova.CssParse.types.STYLE_RULE) {
                    (function () {
                        // 生成selector
                        var selectors = rule.selector;
                        selectors = selectors.replace(/([+>])/g, function (match) {
                            return ' ' + match + ' ';
                        });
                        selectors = selectors.split(/\s+/);
                        var selector = '';
                        selectors.every(function (s, i) {
                            if (s.indexOf(':host') >= 0) {
                                selector += s.replace(':host', tagName) + ' ';
                            } else if (s == '::content') {
                                if (i > 0) {
                                    for (var j = i + 1; j < selectors.length; j++) {
                                        selector += selectors[j] + ' ';
                                    }
                                    return false;
                                } else {
                                    selector += '::content ';
                                }
                            } else if ('> +'.split(' ').indexOf(s) >= 0) {
                                selector += s + ' ';
                            } else {
                                var pseudoStart = s.indexOf(':');
                                if (pseudoStart < 0) {
                                    selector += s + '.' + tagName + ' ';
                                } else {
                                    selector += s.slice(0, pseudoStart) + '.' + tagName + s.slice(pseudoStart) + ' ';
                                }
                            }
                            return true;
                        });

                        // 生成CSS属性
                        var cssText = rule.cssText;
                        generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                    })();
                }

                // keyframes
                if (rule.type == Nova.CssParse.types.KEYFRAMES_RULE) {
                    var selector = rule.selector;
                    var cssText = rule.cssText;
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }

                // media rule
                if (rule.type == Nova.CssParse.types.MEDIA_RULE) {
                    var selector = rule.selector;
                    var cssText = self.compileRules(rule.rules || [], tagName);
                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                }
            });
            return generatedCss;
        },

        attach: function attach(stylesheet) {
            var head = document.head;
            var styleEle = document.createElement('style');
            styleEle.innerHTML = stylesheet;

            // 第一次通过Nova插入Stylesheet，直接插入到head顶部
            if (!lastInsertedStylesheet) {
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
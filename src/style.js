'use strict';
(function () {
    var lastInsertedStylesheet = undefined;

    var Style = {
        init: function init(prototype) {
            if (prototype.stylesheet) {
                var stylesheet = $(prototype.stylesheet);
                if (lastInsertedStylesheet) {
                    stylesheet.insertAfter(lastInsertedStylesheet);
                    lastInsertedStylesheet = stylesheet;
                } else {
                    (function () {
                        //let tagName = Nova.CaseMap.camelToDashCase(prototype.is);

                        var generateCss = function generateCss(rules) {
                            var generatedCss = '';
                            rules.forEach(function (rule) {
                                // style
                                if (rule.type == Nova.CssParse.types.STYLE_RULE) {
                                    (function () {
                                        // 生成selector
                                        var selectors = rule.selector.split(' ');
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
                                            } else if ('>'.split(' ').indexOf(s) >= 0) {
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

                                        /*R
                                        if(selector.indexOf(':host') >= 0) {
                                            selector = selector.replace(':host', tagName);
                                        } else {
                                            selector = tagName + ' ' + selector;
                                        }
                                        */

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
                                    var cssText = generateCss(rule.rules || []);
                                    generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                                }
                            });
                            return generatedCss;
                        };

                        var style = Nova.CssParse.parse(stylesheet.html());
                        var tagName = prototype.is;
                        var styleText = generateCss(style.rules || []);
                        stylesheet.html(styleText);
                        stylesheet.prependTo($('head'));
                    })();
                }
            }
        }
    };

    Nova.Style = Style;
})();
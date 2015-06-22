'use strict';
(function() {
    let lastInsertedStylesheet;

    let Style = {
        init: function(prototype) {
            if(prototype.stylesheet) {
                let stylesheet = $(prototype.stylesheet);
                if(lastInsertedStylesheet) {
                    stylesheet.insertAfter(lastInsertedStylesheet);
                    lastInsertedStylesheet = stylesheet;
                } else {
                    let style = Nova.CssParse.parse(stylesheet.html());
                    let tagName = prototype.is;
                    let styleText = generateCss(style.rules || []);
                    stylesheet.html(styleText);
                    stylesheet.prependTo($('head'));
                    //let tagName = Nova.CaseMap.camelToDashCase(prototype.is);


                    function generateCss(rules) {
                        let generatedCss = '';
                        rules.forEach(function(rule) {
                            // style
                            if(rule.type == Nova.CssParse.types.STYLE_RULE) {
                                // 生成selector
                                let selectors = rule.selector.split(' ');
                                let selector = '';
                                selectors.forEach(function(s) {
                                    if(s != ':host') {
                                        selector += s + '.' + tagName + ' ';
                                    } else {
                                        selector += tagName + ' ';
                                    }
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
                                let cssText = generateCss(rule.rules || []);
                                generatedCss += selector + '\n{\n' + cssText + '\n}\n';
                            }
                        });
                        return generatedCss;
                    }

                }
            }
        }
    };

    Nova.Style = Style;
})();

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
                                let selectors = rule.selector;
                                selectors = selectors.replace(/([+>])/g, function(match) {
                                    return ' ' + match + ' ';
                                });
                                selectors = selectors.split(/\s+/);
                                let selector = '';
                                selectors.every(function(s, i) {
                                    if (s.indexOf(':host') >= 0) {
                                        selector += s.replace(':host', tagName) + ' ';
                                    } else if(s == '::content'){
                                        if(i > 0) {
                                            for(let j = i + 1; j < selectors.length; j++) {
                                                selector += selectors[j] + ' ';
                                            }
                                            return false;
                                        } else {
                                            selector += '::content ';
                                        }
                                    }
                                    else if('> +'.split(' ').indexOf(s) >= 0) {
                                        selector += s + ' ';
                                    }
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

                                /*R
                                if(selector.indexOf(':host') >= 0) {
                                    selector = selector.replace(':host', tagName);
                                } else {
                                    selector = tagName + ' ' + selector;
                                }
                                */

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

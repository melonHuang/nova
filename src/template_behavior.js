'use strict';
(function () {
    var TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            ATTRIBUTE: 2
        },
        createdHandler: function createdHandler() {
            var _this = this;

            var self = this;
            if (this.template) {
                (function () {

                    /*
                    * 遍历节点并初始化
                    * 1. 为所有节点添加class，实现css scope
                    * 2. 对节点进行单向绑定
                    */

                    var initNode = function initNode(parent, className) {
                        var children = parent.children();
                        children.each(function (index, ele) {
                            /***************************** 添加class实现css scope ******************************/
                            ele = $(ele);
                            ele.addClass(className);

                            /***************************** 替换模板中的占位符并监听 ******************************/

                            // 替换属性注解<div attr="{{annotation}}">
                            for (var i in ele[0].attributes) {
                                if (ele[0].attributes.hasOwnProperty(i) && ele[0].attributes[i].constructor == Attr) {
                                    var attr = ele[0].attributes[i];
                                    var _match = attr.value.match(/^{{(.+)}}$/);
                                    if (_match) {
                                        bind(ele, _match[1], self.BIND_TYPES.ATTRIBUTE, { name: attr.name });
                                    }
                                }
                            }

                            // 替换标签注解，<tagName>{{annotaion}}</tagName>
                            var html = ele.html().trim();
                            var match = html.match(/^{{(.+)}}$/);
                            if (match) {
                                bind(ele, match[1], self.BIND_TYPES.INNERHTML);
                            }

                            function bind(ele, prop, type, config) {
                                var propPath = prop.split('.');
                                if (self.props.hasOwnProperty(prop)) {
                                    self.on('_' + propPath[0] + 'Changed', function (ev, oldVal, newVal) {
                                        for (var i = 1; i < propPath.length; i++) {
                                            newVal = newVal[propPath[i]];
                                        }

                                        if (type == self.BIND_TYPES.INNERHTML) {
                                            ele.html(newVal);
                                        } else if (type == self.BIND_TYPES.ATTRIBUTE) {
                                            ele.attr(config.name, newVal);
                                        }
                                    });
                                }
                            }

                            if (ele.children().length > 0) {
                                initNode(ele, className);
                            }
                        });
                    };

                    var className = _this.is;
                    var template = $(_this.template).html();
                    var wrap = $('<div>');

                    //wrap.append(template);
                    wrap[0].innerHTML = template;

                    initNode(wrap, className);

                    /***************************** content insertion ******************************/
                    self._contents = wrap.find('content');
                    self._contents.each(function (index, content) {
                        content = $(content);
                        var select = content.attr('select');
                        var replacement = undefined;
                        if (select) {
                            replacement = $(self).find(select);
                            replacement.insertBefore(content);
                        } else {
                            replacement = Array.prototype.slice.call(self.childNodes);
                            for (var i = 0; i < replacement.length; i++) {
                                content[0].parentNode.insertBefore(replacement[i], content[0]);
                            }
                        }
                        content.remove();
                    });

                    /***************************** 生成DOM ******************************/
                    _this.innerHTML = '';
                    //wrap.children().appendTo(this);
                    var childNodes = Array.prototype.slice.call(wrap[0].childNodes);
                    for (var i = 0; i < childNodes.length; i++) {
                        _this.appendChild(childNodes[i]);
                    }
                })();
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();
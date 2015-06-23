'use strict';
(function () {
    var TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            ATTRIBUTE: 2
        },
        created: function created() {
            var _this = this;

            var self = this;
            if (this.template) {
                (function () {
                    var addClassToChildren = function addClassToChildren(parent, className) {
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
                                addClassToChildren(ele, className);
                            }
                        });
                    };

                    var className = _this.is;
                    var template = $(_this.template).html();
                    var wrap = $('<div>');

                    //wrap.append(template);
                    wrap[0].innerHTML = template;

                    /***************************** content insertion ******************************/
                    self._contents = wrap.find('content');
                    self._contents.each(function (index, content) {
                        content = $(content);
                        var select = content.attr('select');
                        var replacement = $(self).find(select);
                        replacement.insertBefore(content);
                        content.remove();
                    });

                    // 为所有节点加上class，实现CSS scrope
                    addClassToChildren(wrap, className);

                    /***************************** 生成DOM ******************************/
                    _this.innerHTML = '';
                    wrap.children().appendTo(_this);
                })();
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();
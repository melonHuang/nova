'use strict';
(function() {
    let TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            ATTRIBUTE: 2
        },
        createdHandler: function() {
            let self = this;
            if(this.template) {
                let className = this.is;
                let template = $(this.template).html();
                let wrap = $('<div>');

                //wrap.append(template);
                wrap[0].innerHTML = template;

                initNode(wrap, className);

                /***************************** content insertion ******************************/
                self._contents = wrap.find('content');
                self._contents.each(function(index, content) {
                    content = $(content);
                    let select = content.attr('select');
                    let replacement;
                    if(select) {
                        replacement = $(self).find(select);
                        replacement.insertBefore(content);
                    } else {
                        replacement = Array.prototype.slice.call(self.childNodes);
                        for(let i = 0; i < replacement.length; i++) {
                            content[0].parentNode.insertBefore( replacement[i], content[0]);
                        }
                    }
                    content.remove();
                });

                /***************************** 生成DOM ******************************/
                this.innerHTML = '';
                //wrap.children().appendTo(this);
                let childNodes = Array.prototype.slice.call(wrap[0].childNodes);
                for(let i = 0; i < childNodes.length; i++) {
                    this.appendChild(childNodes[i]);
                }

                /*
                * 遍历节点并初始化
                * 1. 为所有节点添加class，实现css scope
                * 2. 对节点进行单向绑定
                */
                function initNode(parent, className) {
                    let children = parent.children();
                    children.each(function(index, ele) {
                        /***************************** 添加class实现css scope ******************************/
                        ele = $(ele);
                        ele.addClass(className);

                        /***************************** 替换模板中的占位符并监听 ******************************/

                        // 替换属性注解<div attr="{{annotation}}">
                        for(let i in ele[0].attributes) {
                            if(ele[0].attributes.hasOwnProperty(i) && ele[0].attributes[i].constructor == Attr) {
                                let attr = ele[0].attributes[i];
                                let match = attr.value.match(/^{{(.+)}}$/);
                                if(match) {
                                    bind(ele, match[1], self.BIND_TYPES.ATTRIBUTE, {name: attr.name});
                                }
                            }
                        }

                        // 替换标签注解，<tagName>{{annotaion}}</tagName>
                        let html = ele.html().trim();
                        let match = html.match(/^{{(.+)}}$/);
                        if(match) {
                            bind(ele, match[1], self.BIND_TYPES.INNERHTML);
                        }

                        function bind(ele, prop, type, config) {
                            let propPath = prop.split('.');
                            if(self.props.hasOwnProperty(prop)) {
                                self.on('_' + propPath[0] + 'Changed', function(ev, oldVal, newVal) {
                                    for(let i = 1; i < propPath.length; i++) {
                                        newVal = newVal[propPath[i]];
                                    }

                                    if(type == self.BIND_TYPES.INNERHTML) {
                                        ele.html(newVal);
                                    } else if(type == self.BIND_TYPES.ATTRIBUTE) {
                                        let type = (self.props[propPath]).type;
                                        if(type == Boolean) {
                                            newVal ? ele.attr(config.name, '') : (ele.removeAttr(config.name));
                                        } else {
                                            ele.attr(config.name, newVal);
                                        }
                                    }

                                });
                            }
                        }

                        if(ele.children().length > 0) {
                            initNode(ele, className);
                        }
                    });
                }
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();

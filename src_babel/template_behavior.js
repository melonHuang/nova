'use strict';
(function() {
    let TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            ATTRIBUTE: 2
        },
        created: function() {
            let self = this;
            if(this.template) {
                let className = this.is;
                let template = $(this.template).html();
                let wrap = $('<div>');

                //wrap.append(template);
                wrap[0].innerHTML = template;

                /***************************** content insertion ******************************/
                self._contents = wrap.find('content');
                self._contents.each(function(index, content) {
                    content = $(content);
                    let select = content.attr('select');
                    let replacement = $(self).find(select);
                    replacement.insertBefore(content);
                    content.remove();
                });

                // 为所有节点加上class，实现CSS scrope
                addClassToChildren(wrap, className);

                /***************************** 生成DOM ******************************/
                this.innerHTML = '';
                wrap.children().appendTo(this);

                function addClassToChildren(parent, className) {
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
                                        ele.attr(config.name, newVal);
                                    }

                                });
                            }
                        }

                        if(ele.children().length > 0) {
                            addClassToChildren(ele, className);
                        }
                    });
                }
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();

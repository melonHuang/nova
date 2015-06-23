'use strict';
(function() {
    let TemplateBehavior = {
        created: function() {
            let self = this;
            if(this.template) {
                let className = this.is;
                let template = $(this.template).html();
                let wrap = $('<div>');
                wrap.append(template);
                addClassToChildren(wrap, className);

                function addClassToChildren(parent, className) {
                    let children = parent.children();
                    children.each(function(index, ele) {
                        /***************************** 添加class实现css scope ******************************/
                        ele = $(ele);
                        ele.addClass(className);

                        /***************************** 替换模板中的占位符并监听 ******************************/
                        let html = ele.html().trim();
                        let match = html.match(/^{{(.+)}}$/);
                        if(match) {
                            let prop = match[1];
                            let propPath = prop.split('.');

                            self.on('_' + propPath[0] + 'Changed', function(ev, oldVal, newVal) {
                                for(let i = 1; i < propPath.length; i++) {
                                    newVal = newVal[propPath[i]];
                                }
                                ele.html(newVal);
                            });
                        }

                        if(ele.children().length > 0) {
                            addClassToChildren(ele, className);
                        }
                    });
                }
                this.innerHTML = '';
                wrap.children().appendTo(this);
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();

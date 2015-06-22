'use strict';
(function() {
    let TemplateBehavior = {
        created: function() {
            if(this.template) {
                let className = this.is;
                let template = $(this.template).html();
                let wrap = $('<div>');
                wrap.append(template);
                addClassToChildren(wrap, className);

                function addClassToChildren(parent, className) {
                    let children = parent.children();
                    children.each(function(index, ele) {
                        ele = $(ele);
                        ele.addClass(className);
                        if(ele.children().length > 0) {
                            addClassToChildren(ele, className);
                        }
                    });
                }
                this.innerHTML = wrap.html();
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();

'use strict';
(function () {
    var TemplateBehavior = {
        created: function created() {
            var _this = this;

            if (this.template) {
                (function () {
                    var addClassToChildren = function addClassToChildren(parent, className) {
                        var children = parent.children();
                        children.each(function (index, ele) {
                            ele = $(ele);
                            ele.addClass(className);
                            if (ele.children().length > 0) {
                                addClassToChildren(ele, className);
                            }
                        });
                    };

                    var className = _this.is;
                    var template = $(_this.template).html();
                    var wrap = $('<div>');
                    wrap.append(template);
                    addClassToChildren(wrap, className);

                    _this.innerHTML = wrap.html();
                })();
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();
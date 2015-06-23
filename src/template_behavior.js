'use strict';
(function () {
    var TemplateBehavior = {
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
                            var html = ele.html().trim();
                            var match = html.match(/^{{(.+)}}$/);
                            if (match) {
                                (function () {
                                    var prop = match[1];
                                    var propPath = prop.split('.');

                                    self.on('_' + propPath[0] + 'Changed', function (ev, oldVal, newVal) {
                                        for (var i = 1; i < propPath.length; i++) {
                                            newVal = newVal[propPath[i]];
                                        }
                                        ele.html(newVal);
                                    });
                                })();
                            }

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

                    _this.innerHTML = '';
                    wrap.children().appendTo(_this);
                })();
            }
        }
    };

    Nova.TemplateBehavior = TemplateBehavior;
})();
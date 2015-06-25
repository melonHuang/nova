'use strict';
(function () {
    var oldNova = window.Nova;
    var inited = undefined;

    /*
    * 使用html import，可能导致import的html中的Script比DomModule的createdHandler先执行
    * 因此需重写Nova，保证import的html中的脚本未注册成功。
    */
    window.NovaExports = function (prototype) {
        Nova.Base.mix(prototype, NovaExports.exports);
        var ret = oldNova(prototype);
        NovaExports.exports = {};
        return ret;
    };
    NovaExports.exports = {};
    window.Nova = function () {};
    $.extend(window.Nova, oldNova);

    var DomModule = oldNova({
        is: 'dom-module',
        //template: '<template></template>',
        createdHandler: function createdHandler() {
            /*
            let ele = document.createElement('div');
            $(this).children().appendTo(ele);
            */
            var ele = this;
            compileAndRun();

            function compileAndRun() {
                var style = ele.querySelector('style');
                var template = ele.querySelector('template');
                var exports = {
                    stylesheet: style.outerHTML,
                    template: template.outerHTML
                };
                var script = ele.querySelector('script');

                // 时机问题，有时候createdHandler执行的时候，可能dom不完整，缺少以下任意元素
                if (!script || !style || !template) {
                    console.log('resource not completedly loaded, try again in 100ms');
                    setTimeout(compileAndRun, 100);
                    return;
                }
                script = script.innerHTML;

                script = script.replace('Nova', 'NovaExports');
                script = 'Nova.byDom=true;NovaExports.exports=' + JSON.stringify(exports) + ';' + script;

                eval(script);
                ele.innerHTML = '';
            }
        }
    });
})();
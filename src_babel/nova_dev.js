'use strict';
(function() {
    let oldNova = window.Nova;
    let inited;

    /*
    * 使用html import，可能导致import的html中的Script比DomModule的createdHandler先执行
    * 因此需重写Nova，保证import的html中的脚本未注册成功。
    */
    window.NovaExports = function(prototype) {
        Nova.Base.mix(prototype, NovaExports.exports);
        var ret = oldNova(prototype);
        NovaExports.exports = {};
        return ret;
    }
    NovaExports.exports = {};
    window.Nova = function() { };
    $.extend(window.Nova, oldNova);


    let DomModule = oldNova({
        is: 'dom-module',
        //template: '<template></template>',
        createdHandler: function() {
            /*
            let ele = document.createElement('div');
            $(this).children().appendTo(ele);
            */
            let ele = this;
            compileAndRun();

            function compileAndRun() {
                let style = ele.querySelector('style');
                let template = ele.querySelector('template');
                let exports = {
                    stylesheet: style.outerHTML,
                    template: template.outerHTML
                }
                let script = ele.querySelector('script');

                // 时机问题，有时候createdHandler执行的时候，可能dom不完整，缺少以下任意元素
                if(!script || !style || !template) {
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

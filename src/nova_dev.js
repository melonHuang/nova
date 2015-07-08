'use strict';
(function () {
    var DomModule = Nova({
        is: 'dom-module',
        //template: '<template></template>',
        createdHandler: function createdHandler() {
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
                if (!script || script.innerHTML.indexOf('Nova') < 0 || !style || !template) {
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
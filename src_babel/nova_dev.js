'use strict';
(function() {
    let DomModule = Nova({
        is: 'dom-module',
        createdHandler: function() {
            this.compileAndRun();

        },
        compileAndRun: function() {
            let ele = this;
            let style = ele.querySelector('style');
            let template = ele.querySelector('template');
            let exports = {
                stylesheet: style.innerHTML,
                template: template.innerHTML
            }
            let script = ele.querySelector('script');

            // 时机问题，有时候createdHandler执行的时候，可能dom不完整，缺少以下任意元素
            if(!script || script.innerHTML.indexOf('Nova') < 0 ||  !style || !template) {
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
    });

})();

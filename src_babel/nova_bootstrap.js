'use strict';
(function() {
    let Nova = function(prototype) {
        Nova.Utils.chainObject(prototype, Nova.Base);
        let opts = { prototype };
        if(prototype.extends) {
            opts.extends = prototype.extends
        }
        let registered = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return getConstructor(registered);
    };

    function getConstructor(realConstructor) {
        return function(initData) {
            initData && Nova.Initial.set(initData);
            return new realConstructor();
        }
    }

    let NovaExports = function(prototype) {
        Nova.Utils.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    }
    NovaExports.exports = {};

    window.Nova = Nova;
    window.NovaExports = NovaExports;
})();

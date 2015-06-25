'use strict';
(function() {
    let Nova = function(prototype) {
        Nova.Base.chainObject(prototype, Nova.Base);
        let opts = { prototype };
        if(prototype.extends) {
            opts.extends = prototype.extends
        }
        let registerd = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return registerd;
    };

    let NovaExports = function(prototype) {
        Nova.Base.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    }
    NovaExports.exports = {};

    window.Nova = Nova;
    window.NovaExports = NovaExports;
})();

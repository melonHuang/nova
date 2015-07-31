'use strict';
(function() {
    let Nova = function(prototype) {
        Nova.Utils.chainObject(prototype, Nova.Base);
        let opts = { prototype };
        if(prototype.extends) {
            opts.extends = prototype.extends
        }
        let registerd = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return registerd;
    };

    Nova.Utils.mix(Nova, {
        setInitAttributes: function() {
        },
        setInitProperties: function() {
        }
    });

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

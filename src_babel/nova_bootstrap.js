'use strict';
(function() {
    let Nova = function(prototype) {
        Nova.Base.chainObject(prototype, Nova.Base);
        window.a = prototype;
        let registerd = document.registerElement(prototype.is, {prototype});

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

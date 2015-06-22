'use strict';
(function () {
    var Nova = function Nova(prototype) {
        Nova.Base.chainObject(prototype, Nova.Base);
        window.a = prototype;
        var registerd = document.registerElement(prototype.is, { prototype: prototype });

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return registerd;
    };

    var NovaExports = function NovaExports(prototype) {
        Nova.Base.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    };
    NovaExports.exports = {};

    window.Nova = Nova;
    window.NovaExports = NovaExports;
})();
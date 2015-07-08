'use strict';
(function () {
    var Nova = function Nova(prototype) {
        Nova.Utils.chainObject(prototype, Nova.Base);
        var opts = { prototype: prototype };
        if (prototype['extends']) {
            opts['extends'] = prototype['extends'];
        }
        var registerd = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return registerd;
    };

    var NovaExports = function NovaExports(prototype) {
        Nova.Utils.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    };
    NovaExports.exports = {};

    window.Nova = Nova;
    window.NovaExports = NovaExports;
})();
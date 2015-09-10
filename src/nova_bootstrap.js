'use strict';
(function () {
    /******************** Nova **********************/
    var Nova = function Nova(prototype) {
        Nova.Utils.chainObject(prototype, Nova.Base);
        var opts = { prototype: prototype };
        if (prototype['extends']) {
            opts['extends'] = prototype['extends'];
        }
        var registered = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return getConstructor(registered);
    };

    /******************** NovaExports **********************/
    var NovaExports = function NovaExports(prototype) {
        Nova.Utils.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    };
    NovaExports.exports = {};

    /******************** Helpers **********************/
    function getConstructor(realConstructor) {
        return function (initData) {
            initData && Nova.Initial.set(initData);
            return new realConstructor();
        };
    }

    window.Nova = Nova;
    window.NovaExports = NovaExports;
})();
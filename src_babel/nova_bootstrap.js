'use strict';
(function() {
    /******************** Nova **********************/
    let Nova = function(prototype) {
        var Base = Nova.Utils.mix({}, Nova.Base);
        Nova.Utils.chainObject(prototype, Base);

        let opts = { prototype };

        // 处理继承
        if(prototype.extends) {
            var tmpEle = document.createElement(prototype.extends);
            if(tmpEle.constructor == HTMLUnknownElement) {
                console.warn('extends to HTMLUnknownElement');
            }
            Nova.Utils.chainObject(Base, tmpEle.constructor.prototype);
            opts.extends = prototype.extends
        } else {
            Nova.Utils.chainObject(Base, HTMLElement.prototype);
        }

        let registered = document.registerElement(prototype.is, opts);

        // 初始化stylesheet
        Nova.Style.init(prototype);

        return getConstructor(registered);
    };


    /******************** NovaExports **********************/
    let NovaExports = function(prototype) {
        Nova.Utils.mix(prototype, NovaExports.exports);
        var ret = Nova(prototype);
        NovaExports.exports = {};
        return ret;
    }
    NovaExports.exports = {};


    /******************** Helpers **********************/
    function getConstructor(realConstructor) {
        return function(initData) {
            initData && Nova.Initial.set(initData);
            return new realConstructor();
        }
    }

    window.Nova = Nova;
    window.NovaExports = NovaExports;

})();

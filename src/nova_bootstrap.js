'use strict';
define(['base'], function (Base) {

    var Nova = function Nova(prototype) {
        Base.chainObject(prototype, Base);
        window.a = prototype;
        var registerd = document.registerElement(prototype.is, { prototype: prototype });
        return registerd;
    };

    return Nova;
});
//# sourceMappingURL=nova_bootstrap.js.map

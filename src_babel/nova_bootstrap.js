'use strict';
define(['base'], function(Base) {

    let Nova = function(prototype) {
        Base.chainObject(prototype, Base);
        window.a = prototype;
        let registerd = document.registerElement(prototype.is, {prototype});
        return registerd;
    };

    return Nova;
});

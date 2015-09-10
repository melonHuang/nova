'use strict';
(function () {
    Nova.Utils.mix(Nova, {
        ready: function ready(ele, callback) {
            if (ele._nova && ele._nova.isReady) {
                callback();
            } else {
                ele.addEventListener('nova.ready', function () {
                    callback();
                });
            }
        }
    });
})();
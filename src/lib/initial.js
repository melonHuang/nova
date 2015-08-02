'use strict';
(function () {

    var Initial = {
        /***************** 操作和读写initial data **********************/
        set: function set(initData) {
            Nova._initData = initData;
        },
        get: function get() {
            return Nova._initData;
        },
        clear: function clear() {
            delete Nova._initData;
        },
        has: function has() {
            return !!Nova._initData;
        }
    };

    Nova.Initial = Initial;
})();
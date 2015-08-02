'use strict';
(function() {

    let Initial = {
        /***************** 操作和读写initial data **********************/
        set: function(initData) {
            Nova._initData = initData;
        },
        get: function() {
            return Nova._initData;
        },
        clear: function() {
            delete Nova._initData;
        },
        has: function() {
            return !!Nova._initData;
        }
    }

    Nova.Initial = Initial;
})();

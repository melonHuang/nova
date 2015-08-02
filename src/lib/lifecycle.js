"use strict";

Nova.Utils.mix(Nova, {
    /***************** 操作和读写initial data **********************/
    _setInitial: function _setInitial(initData) {
        Nova._initData = initData;
    },
    _getInitial: function _getInitial() {
        return Nova._initData;
    },
    _clearInitial: function _clearInitial() {
        delete Nova._initData;
    },
    _hasInitial: function _hasInitial() {
        return !!Nova._initData;
    }
});
'use strict';

(function () {
    var StyleBehavior = {
        createdHandler: function createdHandler() {
            this.removeAttribute('unresolved');
        }
    };

    Nova.StyleBehavior = StyleBehavior;
})();
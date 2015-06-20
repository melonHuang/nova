'use strict';
define(['lib/observer'], function(Observer) {
    let ObserverBehavior = {
        properties: function() {
            /*
            prop: {
                type: 'String',
                value: 'haha',
                merge: true,
                observe: '_xxx'
            },
            prop2: Object       // Object, Number, String, Boolean, Date, Array
            */
        },


        created: function() {
            var observer = new PathObserver(this, 'a');
            observer.open(function(newVal, oldVal) {
                alert('a changed to ' + newVal);
            });
        }

    }


    return ObserverBehavior;
});

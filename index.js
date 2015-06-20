
require.config({
    baseUrl: 'src_babel'
});

require(['nova_bootstrap'], function(Nova) {

    MyEle = Nova({
        is: 'my-button',
        properties: {
            name: {
                type: String,
                value: 'defaultValue',
                merge: true,
                observer: '_nameChanged'
            },
            info: {
                type: Object,
                value: function() {
                    return {a:1};
                }
            },
            date: {
                type: Date
            },
            canSwim: {
                         type: Boolean
                     }
        },
        created: function() {
            //alert('created');
        },
        attached: function() {
            //alert('attached');
        },
        _nameChanged: function(ev, oldVal, newVal) {
            console.log('name change from ' + oldVal + ' to ' + newVal);
        }
    });

    window.btn = document.querySelector('my-button');
    window.btn2 = document.createElement('my-button');

});

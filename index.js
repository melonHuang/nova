
require.config({
    baseUrl: 'src_babel'
});

require(['nova_bootstrap'], function(Nova) {

    MyEle = Nova({
        is: 'my-button',
        properties: {
            prop: {
                type: 'String',
                value: 'haha',
                merge: true,
                observe: '_xxx'
            }
        },
        created: function() {
            //alert('created');
        },
        attached: function() {
            //alert('attached');
        }
    });

    window.btn = document.querySelector('my-button');

});

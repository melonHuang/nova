<dom-module>
    <style type="text/css">
        my-button {
            background: red;
        }
    </style>

    <template>
    hehe
    </template>

    <script>
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
    </script>
</dom-module>

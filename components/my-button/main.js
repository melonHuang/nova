NovaExports.exports={"stylesheet":"<style type=\"text/css\">\n        my-button {\n            background: red;\n        }\n\n        @keyframes bounceIn {\n            0% {\n                color: red;\n            }\n            100% {\n                color: blue;\n            }\n        }\n\n        @media screen and (max-width: 600px) {\n            .hint {\n                background: black;\n            }\n        }\n    </style>","template":"<template>\n        <div class=\"hint\">\n            <div class=\"text\">hehe</div>\n        </div>\n    </template>"};
        MyEle = NovaExports({
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
    
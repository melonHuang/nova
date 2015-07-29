"use strict";

NovaExports.exports = { "stylesheet": "\n        :host {\n            //display: none;\n        }\n    ", "template": "\n        <ul>\n            <template-repeat items=\"{{data}}\">\n                <li>My name is <span>{{item.name}}</span></li>\n            </template-repeat>\n        </ul>\n    " };
var MyWrap = NovaExports({
    is: "my-wrap",
    props: {
        data: {
            type: Array,
            value: [{ name: "gua" }, { name: "pao" }, { name: "ting" }]
        }
    },
    createdHandler: function createdHandler() {}
});
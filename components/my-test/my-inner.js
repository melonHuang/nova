"use strict";

NovaExports.exports = { "stylesheet": "\n    ", "template": "\n        <span>{{value}}</span>\n    " };
var MyWrap = NovaExports({
    is: "my-inner",
    props: {
        value: {
            type: String,
            value: "sdfsd"
        }
    },
    createdHandler: function createdHandler() {},
    attributeChangedHandler: function attributeChangedHandler() {}
});
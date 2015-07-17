"use strict";

NovaExports.exports = { "stylesheet": "\n    ", "template": "\n        <my-inner value=\"{{value}}\" title=\"{{title}}\"></my-inner>\n        <content></content>\n    " };
var MyWrap = NovaExports({
    is: "my-wrap",
    props: {
        value: {
            type: String,
            value: "wrap value"
        },
        title: {
            type: String,
            value: "title here"
        }
    },
    createdHandler: function createdHandler() {}
});
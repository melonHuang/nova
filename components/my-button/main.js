"use strict";

NovaExports.exports = { "stylesheet": "\n        :host {\n            display: block;\n            color: black;\n        }\n\n        .hint>.text {\n            color: red;\n        }\n\n        .text+.text {\n            color:blue;\n        }\n\n        @keyframes bounceIn {\n            0% {\n                color: red;\n            }\n            100% {\n                color: blue;\n            }\n        }\n\n            .hint {\n                background: black;\n            }\n    ", "template": "\n        <div class=\"hint\">\n            <div class=\"text\" data-name=\"{{name}}\">{{name}}</div>\n            <div class=\"text\">{{name}}</div>\n            <content select=\".page\"></content>\n            <content select=\"div\"></content>\n            <content></content>\n        </div>\n    " };
window.MyEle = NovaExports({
    is: "my-button",
    props: {
        name: {
            type: String,
            value: "defaultValue",
            merge: true,
            observer: "_nameChanged"
        },
        info: {
            type: Object,
            value: function value() {
                return { a: 1 };
            }
        },
        date: {
            type: Date
        },
        canSwim: {
            type: Boolean
        }
    },
    createdHandler: function createdHandler() {},
    attachedHandler: function attachedHandler() {},
    _nameChanged: function _nameChanged(ev, oldVal, newVal) {
        console.log("name change from " + oldVal + " to " + newVal);
    },
    say: function say() {
        alert("hi");
    }
});

//alert('attached');
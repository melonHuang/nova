"use strict";

(function () {
  (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t();else if (typeof define == "function" && define.amd) define("components/my-test/my-inner", [], t);else {
        var n = "MyTest",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t();
      }
    })(this, function () {
      function e(e) {
        return ({})[e];
      }var t = NovaExports.__fixedUglify = "script>";NovaExports.exports = { stylesheet: "", template: "\n        <span>Writer: {{writer}}</span>\n    " };var n = NovaExports({ is: "my-inner", props: { writer: { type: String, value: "sdfsd" } }, createdHandler: function createdHandler() {}, attributeChangedHandler: function attributeChangedHandler() {} });return t;
    });
  }).call(window);
})();
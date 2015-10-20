"use strict";

(function () {
  (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t();else if (typeof define == "function" && define.amd) define("components/nova-markdown-editor/main", [], t);else {
        var n = "NovaMarkdownEditor",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t();
      }
    })(this, function () {
      function e(e) {
        return ({})[e];
      }var t = NovaExports.__fixedUglify = "script>";return (NovaExports.exports = { stylesheet: "textarea{width:100%;height:75pt}", template: "\n        <textarea>#Welcome</textarea>\n        <nova-markdown></nova-markdown>\n    " }, NovaExports({ is: "nova-markdown-editor", createdHandler: function createdHandler() {
          var e = this.querySelector("textarea"),
              t = this.querySelector("nova-markdown");e.addEventListener("input", function () {
            t.content = e.value;
          }), Nova.ready(t, function () {
            t.content = e.value.trim();
          });
        } }), t);
    });
  }).call(window);
})();
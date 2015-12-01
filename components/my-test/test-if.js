"use strict";

(function () {
  var e;(function () {
    (function (t, n) {
      typeof exports == "object" ? module.exports = n() : e = (function () {
        return typeof n == "function" ? n() : n;
      })();
    })(this, function () {
      function e(e) {
        return ({})[e];
      }var t = undefined;return (NovaExports.__fixedUglify = "script>", NovaExports.exports = { template: "\n        <p>Welcome</p>\n        <p>-------start--------</p>\n        <template-if if=\"{{gender == &apos;female&apos;}}\">\n            I&apos;m a girl, {{gender}}\n        </template-if>\n        <p>---------------</p>\n        <template-if if=\"{{gender == &apos;male&apos;}}\">\n            I&apos;m a boy, {{gender}}\n        </template-if>\n        <p>-------end--------</p>\n    " }, NovaExports({ is: "test-if", props: { gender: { type: String, value: "female" } }, createdHandler: function createdHandler() {} }), t);
    });
  }).call(window);
})();
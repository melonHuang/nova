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
      }var t = undefined;return (NovaExports.__fixedUglify = "script>", NovaExports.exports = { stylesheet: ".box{width:100px;height:100px;background:#000}.box[gender=m]{background:#00f}.box[gender=f]{background:red}", template: "\n        <div class=\"box\" gender_=\"{{gender == &apos;male&apos; ? &apos;m&apos; : &apos;f&apos;}}\" g_=\"{{isFemale}}\">\n        </div>\n    " }, NovaExports({ is: "test-template", props: { gender: { type: String, value: "male" }, isFemale: { type: Boolean, value: !1 } }, createdHandler: function createdHandler() {} }), t);
    });
  }).call(window);
})();
"use strict";

(function () {
  (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t();else if (typeof define == "function" && define.amd) define("components/my-test/test-template", [], t);else {
        var n = "MyTest",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t();
      }
    })(this, function () {
      function e(e) {
        return ({})[e];
      }var t = NovaExports.__fixedUglify = "script>";return (NovaExports.exports = { stylesheet: ".box{width:75pt;height:75pt;background:#000}.box[gender=m]{background:#00f}.box[gender=f]{background:red}", template: "\n        <div class=\"box\" gender_=\"{{gender == &apos;male&apos; ? &apos;m&apos; : &apos;f&apos;}}\" g_=\"{{isFemale}}\">\n        </div>\n    " }, NovaExports({ is: "test-template", props: { gender: { type: String, value: "male" }, isFemale: { type: Boolean, value: !1 } }, createdHandler: function createdHandler() {} }), t);
    });
  }).call(window);
})();
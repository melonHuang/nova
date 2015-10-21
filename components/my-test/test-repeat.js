"use strict";

(function () {
  (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t();else if (typeof define == "function" && define.amd) define("components/my-test/test-repeat", [], t);else {
        var n = "MyTest",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t();
      }
    })(this, function () {
      function e(e) {
        return ({})[e];
      }var t = undefined;return (NovaExports.__fixedUglify = "script>", NovaExports.exports = { stylesheet: "", template: "\n\n        <p>Welcome to girl&apos;s dorm</p>\n\n        <template is=\"template-repeat\" items=\"{{rooms}}\" as=\"room\" index-as=\"i\">\n        <div>\n            Room{{i + 1}}:\n            <div>\n                <template is=\"template-repeat\" items=\"{{room}}\" as=\"man\" index-as=\"j\">\n                <div>\n                    {{j + 1}}.{{man}}\n                </div>\n                </template>\n            </div>\n        </div>\n        </template>\n\n        <p>Haha, template repeat can finally have siblings</p>\n\n        <!-- Android浏览器中，select option必须为父子关系。因此无法通过template-repeat循环得到 -->\n        <select>\n        </select>\n        <template is=\"template-repeat\" items=\"{{rooms}}\" as=\"room\" parent-selector=\"select\">\n            <option value=\"{{room}}\">{{room}}</option>\n        </template>\n\n\n    " }, NovaExports({ is: "test-repeat", props: { rooms: { type: Array, value: [["melon", "tt"], ["zmy", "ms"]] } }, createdHandler: function createdHandler() {} }), t);
    });
  }).call(window);
})();
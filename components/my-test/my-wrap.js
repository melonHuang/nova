"use strict";

(function () {
  (function () {
    (function (e, t) {
      if (typeof exports == "object") module.exports = t();else if (typeof define == "function" && define.amd) define("components/my-test/my-wrap", [], t);else {
        var n = "MyTest",
            r = n.split("."),
            i = e;for (var s = 0; s < r.length - 1; s++) i[r[s]] === undefined && (i[r[s]] = {}), i = i[r[s]];i[r[r.length - 1]] = t();
      }
    })(this, function () {
      function e(e) {
        return ({})[e];
      }var t = undefined;NovaExports.__fixedUglify = "script>", NovaExports.exports = { stylesheet: "div,ul{display:block}", template: "\n        <my-inner writer=\"{{writer}}\"></my-inner>\n        <ul>\n        <template is=\"template-repeat\" items=\"{{data}}\" id=\"outer\" index-as=\"outerIndex\">\n            <li>My name is <span>{{item.name}}</span>\n                <div>\n                    {{writer}}\n                </div>\n\n                <p>\n                    I Love\n                    <div>\n                        <template is=\"template-repeat\" items=\"{{item.food}}\" id=\"inner\" as=\"food\" index-as=\"j\">\n                            <div>{{outerIndex  + &apos;&apos; + j}}</div>\n                            <span>{{j + 1 + &apos;.&apos;}}</span>\n                            <span>{{food}}</span>\n                        </template>\n                    </div>\n                </p>\n                <p>\n                    <input type=\"text\" value=\"{{item.nickName::input}}\">\n                </p>\n\n            </li>\n            <div>\n            <template-if if=\"{{item.option == 4}}\">\n                you choose 4\n            </template-if>\n            </div>\n            <select class=\"select\" value=\"{{item.option::change}}\"> </select>\n            <template is=\"template-repeat\" parent-selector=\".select\" items=\"{{item.options}}\">\n                <option value=\"{{item}}\">{{item}}</option>\n            </template>\n\n            <p>\n                My nick name is {{item.nickName}}\n            </p>\n            <!--\n            -->\n            <li>{{item.name}}</li>\n            {{writer}}\n\n\n        </template>\n        </ul>\n\n\n        \n    " };var n = NovaExports({ is: "my-wrap", props: { warning: { type: Object, value: { msg: "hey" } }, writer: { type: String, value: "Melon.H" }, data: { type: Array, value: [{ name: "gua", nickName: "pig", food: ["fish", "pig", "cow"], option: 2, options: [1, 2, 4] }] }, isGirl: { type: Boolean, value: !0 }, age: { type: Number, value: 10 }, items: { type: String, value: "items wahahahah" } }, createdHandler: function createdHandler() {}, _clickHandler: function _clickHandler() {
          alert("click");
        } });return t;
    });
  }).call(window);
})();
'use strict';

(function () {
  (function (root, factory) {
    if (typeof exports === 'object') {
      module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
      define([], factory);
    } else {
      var globalAlias = 'MyTest';
      var namespace = globalAlias.split('.');
      var parent = root;
      for (var i = 0; i < namespace.length - 1; i++) {
        if (parent[namespace[i]] === undefined) parent[namespace[i]] = {};
        parent = parent[namespace[i]];
      }
      parent[namespace[namespace.length - 1]] = factory();
    }
  })(this, function () {
    function _requireDep(name) {
      return ({})[name];
    }

    var _bundleExports = NovaExports.__fixedUglify = 'script>';NovaExports.exports = { 'stylesheet': '', 'template': '\n    <div>\n\n        <template is="template-repeat" items="{{rooms}}" as="room" index-as="i">\n        <div>\n            Room{{i + 1}}:\n            <div>\n                <template is="template-repeat" items="{{room}}" as="man" index-as="j">\n                <div>\n                    {{j + 1}}.{{man}}\n                </div>\n                </template>\n            </div>\n        </div>\n        </template>\n    </div>\n\n    <!-- Android浏览器中，select option必须为父子关系。因此无法通过template-repeat循环得到 -->\n    <select>\n    </select>\n    <template is="template-repeat" items="{{rooms}}" as="room" parent-selector="select">\n        <option value="{{room}}">{{room}}</option>\n    </template>\n\n\n    ' };
    NovaExports({
      is: 'test-repeat',
      props: {
        rooms: {
          type: Array,
          value: [['melon', 'tt'], ['zmy', 'ms']]
        }
      },
      createdHandler: function createdHandler() {}
    });

    return _bundleExports;
  });
}).call(window);
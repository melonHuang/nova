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

    var _bundleExports = NovaExports.__fixedUglify = 'script>';NovaExports.exports = { 'stylesheet': '.box{width:75pt;height:75pt;background:#000}.box[gender=m]{background:#00f}.box[gender=f]{background:red}', 'template': '\n        <div class="box" gender_="{{gender == &apos;male&apos; ? &apos;m&apos; : &apos;f&apos;}}" g_="{{isFemale}}">\n        </div>\n    ' };
    NovaExports({
      is: 'test-template',
      props: {
        gender: {
          type: String,
          value: 'male'
        },
        isFemale: {
          type: Boolean,
          value: false
        }
      },
      createdHandler: function createdHandler() {}
    });

    return _bundleExports;
  });
}).call(window);
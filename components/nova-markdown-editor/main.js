'use strict';

(function () {
  (function (root, factory) {
    if (typeof exports === 'object') {
      module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
      define([], factory);
    } else {
      var globalAlias = 'NovaMarkdownEditor';
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

    var _bundleExports = NovaExports.__fixedUglify = 'script>';NovaExports.exports = { 'stylesheet': 'textarea{width:100%;height:75pt}', 'template': '\n        <textarea>#Welcome</textarea>\n        <nova-markdown></nova-markdown>\n    ' };
    NovaExports({
      is: 'nova-markdown-editor',
      createdHandler: function createdHandler() {
        var textarea = this.querySelector('textarea');
        var markdown = this.querySelector('nova-markdown');
        textarea.addEventListener('input', function () {
          markdown.content = textarea.value;
        });
        Nova.ready(markdown, function () {
          markdown.content = textarea.value.trim();
        });
      }
    });

    return _bundleExports;
  });
}).call(window);
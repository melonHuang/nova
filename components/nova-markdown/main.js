'use strict';

(function () {
  (function (root, factory) {
    if (typeof exports === 'object') {
      module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
      define([], factory);
    } else {
      var globalAlias = 'NovaMarkdown';
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

    var _bundleExports = NovaExports.__fixedUglify = 'script>';NovaExports.exports = { 'stylesheet': '', 'template': '' };
    NovaExports({
      is: 'nova-markdown',
      props: {
        content: String
      },
      createdHandler: function createdHandler() {
        this.on('_contentChanged', this.contentChanged);
        this.content = this.innerHTML;
      },
      contentChanged: function contentChanged() {
        this.innerHTML = markdown.toHTML(this.content);
      }
    });

    return _bundleExports;
  });
}).call(window);
'use strict';

(function () {
  (function (root, factory) {
    if (typeof exports === 'object') {
      module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
      define([], factory);
    } else {
      var globalAlias = 'NovaDoT';
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

    var _bundleExports = NovaExports.__fixedUglify = 'script>';NovaExports.exports = { 'stylesheet': ':host{display:block}', 'template': '\n        <content></content>\n    ' };
    NovaExports({
      is: 'nova-doT',
      props: {
        data: {
          type: Object
        }
      },
      createdHandler: function createdHandler() {
        var tmplSrc = this.querySelector('script').innerHTML;
        this.tmplFun = doT.template(tmplSrc);

        this.on('_dataChanged', this.dataObserver);

        var html = this.tmplFun(this.data);
        this.refreshHTML(html);
      },
      dataObserver: function dataObserver(e, oldVal, newVal) {
        var html = this.tmplFun(newVal);
        this.refreshHTML(html);
      },
      refreshHTML: function refreshHTML(html) {
        this.innerHTML = html;
      }
    });

    return _bundleExports;
  });
}).call(window);
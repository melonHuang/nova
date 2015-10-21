'use strict';
(function () {

    if (!window.require) {

        var baseUrl = document.currentScript.getAttribute('base-url') || '/';
        var requireScript = document.createElement('script');
        requireScript.onload = function () {
            Nova.Loader.requirejs.config({
                baseUrl: baseUrl
            });
            init();
        };
        requireScript.src = 'http://s1.qhimg.com/static/1635b5234dbf88e0/require_nova.js';
        //requireScript.src = 'require.js';
        document.body.appendChild(requireScript);
    } else {
        Nova.Loader.requirejs = window.requirejs;
        Nova.Loader.require = window.require;
        Nova.Loader.define = window.define;
        init();
    }

    function init() {
        var exportsCount = 0;
        var DomModule = Nova({
            is: 'dom-module',
            'extends': 'template',
            createdHandler: function createdHandler() {
                var self = this;
                setTimeout(function () {
                    self.compileAndRun();
                });
            },

            compileAndRun: function compileAndRun() {
                var script = this._htmlToJs();
                var dependencies = this._parseDependencies();

                // 将links插入到页面
                dependencies.links.forEach(function (link) {
                    document.body.appendChild(link.cloneNode());
                });

                // 将代码包装成UMD模块并执行
                var wrappedScript = umdWrap({
                    code: script,
                    exports: '_' + Math.floor(Math.random() * 1000),
                    dependencies: dependencies.dependScripts
                });
                wrappedScript = '(function() {' + wrappedScript + '}).call(' + Nova.devOpt.umd.root + ')';
                eval(wrappedScript);
            },

            _parseDependencies: function _parseDependencies() {
                var data = {
                    links: [],
                    dependScripts: []
                };
                var ele = this.content;
                var links = Array.prototype.slice.call(ele.querySelectorAll('link[rel=import]'));
                var dependScripts = Array.prototype.slice.call(ele.querySelectorAll('script[require-src]'));

                links.forEach(function (link) {
                    data.links.push(link);
                });

                dependScripts.forEach(function (script) {

                    var requireSrc = script.getAttribute('require-src');
                    var exports = script.getAttribute('exports') || '_' + ++exportsCount;
                    data.dependScripts.push({
                        exports: exports,
                        name: requireSrc
                    });
                });

                return data;
            },

            _htmlToJs: function _htmlToJs() {
                var ele = this.content;
                var style = ele.querySelector('style');
                var template = ele.querySelector('template');
                var exports = {
                    stylesheet: style ? style.innerHTML : '',
                    template: template ? template.innerHTML : ''
                };
                var script = ele.querySelector('script:not([require-src])');

                script = script.innerHTML;
                script = script.replace('Nova(', 'NovaExports(');
                script = 'Nova.byDom=true;NovaExports.exports=' + JSON.stringify(exports) + ';' + script;

                return script;
            }
        });

        function umdWrap(opt) {

            /*
             * 需生成
             * cjsDependencies: require('module/components/plugin-confession/emoji'), require('module/components/plugin-confes    sion/es6-promise'
             * amdDependencies: module/components/plugin-confession/emoji', 'module/components/plugin-confession/es6-promise'
             * globalAlias: opt.exports
             * globalDependencies: root['jEmoji'], root['_es6Promise']
             * dependencyExports: jEmoji, _es6Promise
             * script: opt.code
             * */

            var data = {
                cjsDependencies: [],
                amdDependencies: [],
                globalAlias: opt.exports,
                globalDependencies: [],
                dependencyExports: [],
                script: opt.code
            };

            opt.dependencies.forEach(function (dep) {
                data.cjsDependencies.push('require(\'' + dep.name + '\')');
                data.amdDependencies.push('\'' + dep.name + '\'');
                data.globalDependencies.push('root[\'' + dep.exports + '\']');
                data.dependencyExports.push(dep.exports);
            });

            data.cjsDependencies.join(',');
            data.amdDependencies.join(',');
            data.globalDependencies.join(',');
            data.dependencyExports.join(',');

            var template = '\n            (function (root, factory) {\n              if (typeof exports === \'object\') {\n                module.exports = factory(<%= cjsDependencies %>);\n              }\n              else if (typeof Nova.Loader.define === \'function\' && Nova.Loader.define.amd) {\n                Nova.Loader.require([<%= amdDependencies %>], factory);\n              }\n              else {\n                var globalAlias = \'<%= globalAlias %>\';\n                var namespace = globalAlias.split(\'.\');\n                var parent = root;\n                for ( var i = 0; i < namespace.length-1; i++ ) {\n                  if ( parent[namespace[i]] === undefined ) parent[namespace[i]] = {};\n                  parent = parent[namespace[i]];\n                }\n                parent[namespace[namespace.length-1]] = factory(<%= globalDependencies %>);\n              }\n            }(this, function(<%= dependencyExports %>) {\n\n              var _bundleExports = <%= script %>\n              return  _bundleExports;\n            }));\n            ';

            var wrappedScript = template;
            // 替换占位符
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    wrappedScript = wrappedScript.replace(new RegExp('<%=\\s*' + prop + '\\s*%>', 'g'), data[prop]);
                }
            }

            return wrappedScript;
        }
    }
})();
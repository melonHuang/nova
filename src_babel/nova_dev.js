'use strict';
(function() {

    if(!window.require) {

        var baseUrl = document.currentScript.getAttribute('base-url') || '/';
        var requireScript = document.createElement('script');
        requireScript.onload = function() {
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
        let exportsCount = 0;
        let DomModule = Nova({
            is: 'dom-module',
            extends: 'template',
            createdHandler: function() {
                var self = this;
                setTimeout(function() {
                    self.compileAndRun();
                });
            },

            compileAndRun: function() {
                var script = this._htmlToJs();
                var dependencies = this._parseDependencies();

                // 将links插入到页面
                dependencies.links.forEach(function(link) {
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

            _parseDependencies: function() {
                let data = {
                    links: [],
                    dependScripts: []
                };
                let ele = this.content;
                let links = Array.prototype.slice.call(ele.querySelectorAll('link[rel=import]'));
                let dependScripts = Array.prototype.slice.call(ele.querySelectorAll('script[require-src]'));

                links.forEach(function(link) {
                    data.links.push(link);
                });

                dependScripts.forEach(function(script) {

                    let requireSrc = script.getAttribute('require-src');
                    let exports = script.getAttribute('exports') || '_' + ++exportsCount;
                    data.dependScripts.push({
                        exports: exports,
                        name: requireSrc
                    });
                });

                return data;
            },

            _htmlToJs: function() {
                let ele = this.content;
                let style = ele.querySelector('style');
                let template = ele.querySelector('template');
                let exports = {
                    stylesheet: style ? style.innerHTML : '',
                    template: template ? template.innerHTML : ''
                }
                let script = ele.querySelector('script:not([require-src])');

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

            let data = {
                cjsDependencies: [],
                amdDependencies: [],
                globalAlias: opt.exports,
                globalDependencies: [],
                dependencyExports: [],
                script: opt.code,
            };

            opt.dependencies.forEach(function(dep) {
                data.cjsDependencies.push('require(\'' + dep.name + '\')');
                data.amdDependencies.push('\'' + dep.name + '\'');
                data.globalDependencies.push('root[\'' + dep.exports + '\']');
                data.dependencyExports.push(dep.exports);
            });

            data.cjsDependencies.join(',');
            data.amdDependencies.join(',');
            data.globalDependencies.join(',');
            data.dependencyExports.join(',');

            let template = `
            (function (root, factory) {
              if (typeof exports === 'object') {
                module.exports = factory(<%= cjsDependencies %>);
              }
              else if (typeof Nova.Loader.define === 'function' && Nova.Loader.define.amd) {
                Nova.Loader.require([<%= amdDependencies %>], factory);
              }
              else {
                var globalAlias = '<%= globalAlias %>';
                var namespace = globalAlias.split('.');
                var parent = root;
                for ( var i = 0; i < namespace.length-1; i++ ) {
                  if ( parent[namespace[i]] === undefined ) parent[namespace[i]] = {};
                  parent = parent[namespace[i]];
                }
                parent[namespace[namespace.length-1]] = factory(<%= globalDependencies %>);
              }
            }(this, function(<%= dependencyExports %>) {

              var _bundleExports = <%= script %>
              return  _bundleExports;
            }));
            `;

            let wrappedScript = template;
            // 替换占位符
            for(let prop in data) {
                if(data.hasOwnProperty(prop)) {
                    wrappedScript = wrappedScript.replace(new RegExp('<%=\\s*' + prop + '\\s*%>', 'g'), data[prop]);
                }
            }

            return wrappedScript;

        }

    }


})();

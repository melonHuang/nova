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

        var _bundleExports = NovaExports.__fixedUglify = 'script>';NovaExports.exports = { 'stylesheet': 'div,ul{display:block}', 'template': '\n        <my-inner writer="{{writer}}"></my-inner>\n        <ul>\n        <template is="template-repeat" items="{{data}}" id="outer" index-as="outerIndex">\n            <li>My name is <span>{{item.name}}</span>\n                <div>\n                    {{writer}}\n                </div>\n\n                <p>\n                    I Love\n                    <div>\n                        <template is="template-repeat" items="{{item.food}}" id="inner" as="food" index-as="j">\n                            <div>{{outerIndex  + &apos;&apos; + j}}</div>\n                            <span>{{j + 1 + &apos;.&apos;}}</span>\n                            <span>{{food}}</span>\n                        </template>\n                    </div>\n                </p>\n                <p>\n                    <input type="text" value="{{item.nickName::input}}">\n                </p>\n\n            </li>\n            <div>\n            <template-if if="{{item.option == 4}}">\n                you choose 4\n            </template-if>\n            </div>\n            <select class="select" value="{{item.option::change}}"> </select>\n            <template is="template-repeat" parent-selector=".select" items="{{item.options}}">\n                <option value="{{item}}">{{item}}</option>\n            </template>\n\n            <p>\n                My nick name is {{item.nickName}}\n            </p>\n            <!--\n            -->\n            <li>{{item.name}}</li>\n            {{writer}}\n\n\n        </template>\n        </ul>\n\n\n        \n    ' };
        var MyWrap = NovaExports({
            is: 'my-wrap',
            props: {
                warning: {
                    type: Object,
                    value: {
                        msg: 'hey'
                    }
                },
                writer: {
                    type: String,
                    value: 'Melon.H'
                },
                data: {
                    type: Array,
                    value: [{
                        name: 'gua',
                        nickName: 'pig',
                        food: ['fish', 'pig', 'cow'],
                        option: 2,
                        options: [1, 2, 4]
                    }
                    /*
                    {name:'pao'},
                    {name:'ting'}
                    */
                    ]
                },
                isGirl: {
                    type: Boolean,
                    value: true
                },
                age: {
                    type: Number,
                    value: 10
                },
                items: {
                    type: String,
                    value: 'items wahahahah'
                }
            },
            createdHandler: function createdHandler() {},
            _clickHandler: function _clickHandler() {
                alert('click');
            }
        });

        return _bundleExports;
    });
}).call(window);

//alert();
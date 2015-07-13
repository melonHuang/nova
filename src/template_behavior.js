'use strict';
(function () {
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    var TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            ATTRIBUTE: 2
        },
        createdHandler: function createdHandler() {
            if (!this.template) {
                return;
            }

            var self = this;
            var wrap = document.createElement('div');
            wrap.innerHTML = this.template;

            // 初始化每一个节点
            initNode.call(this, wrap);

            // 插入content
            insertContent.call(this, wrap);

            // 插入到DOM中
            attach.call(this, wrap);
        }
    };

    /*
    * content insertion
    * */
    function insertContent(nodesWrap) {
        var self = this;
        var contents = Array.prototype.slice.call(nodesWrap.querySelectorAll('content'));
        contents.forEach(function (content) {
            var select = content.getAttribute('select');
            var replacement = undefined;

            replacement = Array.prototype.slice.call((select ? self.querySelectorAll(select) : self.childNodes) || []);
            replacement.forEach(function (selectedEle) {
                if (Array.prototype.slice.call(self.children).indexOf(selectedEle) >= 0) {
                    content.parentElement.insertBefore(selectedEle, content);
                }
            });
            content.remove();
        });
    }

    /*
    * 将解析好的模板插入到DOM中
    * */
    function attach(nodesWrap) {
        var childNodes = Array.prototype.slice.call(nodesWrap.childNodes);
        for (var i = 0; i < childNodes.length; i++) {
            this.appendChild(childNodes[i]);
        }
    }

    /*
    * 初始化template中的每个节点
    * 1. 添加tagName Class
    * 2. 添加annotation单向数据绑定
    * */
    function initNode(node) {
        var self = this;

        // 添加tagName class
        var className = this.is;
        node.className += ' ' + className;

        // 解析annotation
        // 替换属性注解<div attr="{{annotation}}">
        for (var i in node.attributes) {
            if (node.attributes.hasOwnProperty(i) && node.attributes[i].constructor == Attr) {
                var attr = node.attributes[i];
                var _match = attr.value.match(/^{{(.+)}}$/);
                if (_match) {
                    bind.call(this, node, _match[1], this.BIND_TYPES.ATTRIBUTE, { name: attr.name });
                }
            }
        }

        // 替换标签注解，<tagName>{{annotaion}}</tagName>
        var html = node.innerHTML.trim();
        var match = html.match(/^{{(.+)}}$/);
        if (match) {
            bind.call(this, node, match[1], this.BIND_TYPES.INNERHTML);
        }

        Array.prototype.slice.call(node.children).forEach(function (child) {
            initNode.call(self, child);
        });
    }

    /*
    * 对节点进行单向绑定
    * 1. html绑定
    * 2. attribute绑定
    * */
    function bind(node, prop, type, config) {
        var self = this;
        var propPath = prop.split('.');
        if (self.props.hasOwnProperty(prop)) {
            self.on('_' + propPath[0] + 'Changed', function (ev, oldVal, newVal) {
                for (var i = 1; i < propPath.length; i++) {
                    newVal = newVal[propPath[i]];
                }

                if (type == self.BIND_TYPES.INNERHTML) {
                    node.innerHTML = newVal;
                } else if (type == self.BIND_TYPES.ATTRIBUTE) {
                    var _type = self.props[propPath].type;
                    if (_type == Boolean) {
                        newVal ? node.setAttribute(config.name, '') : node.removeAttribute(config.name);
                    } else {
                        node.setAttribute(config.name, newVal);
                    }
                }
            });
        }
    }

    Nova.TemplateBehavior = TemplateBehavior;
})();
'use strict';
(function () {
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    var TemplateBehavior = {
        createdHandler: function createdHandler() {
            if (!this.template) {
                return;
            }

            var self = this;

            self._nova.binds = new Map();

            var wrap = document.createElement('div');
            wrap.innerHTML = this.template;

            //if(this.tagName == 'TEMPLATE-REPEAT') debugger;

            // 初始化每一个节点
            this.bindNode(wrap);

            // 插入content
            insertContent.call(this, wrap);

            // 插入到DOM中
            attach.call(this, wrap);
        },

        /*
        * 遍历并初始化所有节点
        * 1. 添加tagName Class
        * 2. 添加annotation单向数据绑定
        * */
        bindNode: function bindNode(node) {
            var self = this;

            // 添加tagName class
            var className = this.is;
            node.className += ' ' + className;

            // 解析annotation
            // 替换属性注解<div attr="{{annotation}}">
            Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
                if (attr.constructor == Attr) {
                    var _match = attr.value.match(/^{{(.+)}}$/);
                    if (_match) {
                        var type = attr.name[attr.name.length - 1] == '$' ? self.BIND_TYPES.ATTRIBUTE : self.BIND_TYPES.PROPERTY;
                        var config = {};
                        // 绑定attribute
                        if (type == self.BIND_TYPES.ATTRIBUTE) {
                            config.attrName = attr.name.slice(0, attr.name.length - 1);
                            config.propName = Nova.CaseMap.dashToCamelCase(config.attrName);
                            node.removeAttribute(attr.name);
                        }
                        // 绑定property
                        else {
                            config.attrName = attr.name;
                            config.propName = Nova.CaseMap.dashToCamelCase(config.attrName);
                            node.removeAttribute(attr.name);
                        }
                        bind.call(self, node, _match[1], type, config);
                    }
                }
            });

            // 替换标签注解，<tagName>{{annotaion}}</tagName>
            var html = node.innerHTML.trim();
            var match = html.match(/^{{(.+)}}$/);
            if (match) {
                bind.call(this, node, match[1], this.BIND_TYPES.INNERHTML);
            }

            if (node.tagName.toLowerCase() != 'template-repeat') {
                node.children && Array.prototype.slice.call(node.children).forEach(function (child) {
                    self.bindNode(child);
                });
            }
        },
        /*
        * 遍历节点，取消绑定
        * */
        unbindNode: function unbindNode(node) {
            var self = this;
            unbind.call(this, node);
            node.children && Array.prototype.slice.call(node.children).forEach(function (child) {
                self.unbindNode(child);
            });
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
                if (Array.prototype.slice.call(self.children).indexOf(selectedEle) >= 0 || !select) {
                    /*
                    let node = document.createElement('div');
                    node.appendChild(selectedEle);
                    let node2 = document.createElement('div');
                    node2.innerHTML = node.innerHTML;
                    node.remove();
                    content.parentElement.insertBefore(node2.childNodes[0], content);
                    */
                    content.parentElement.insertBefore(selectedEle, content);
                }
            });
            content.parentElement.removeChild(content);
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
    * 对节点进行双向绑定
    * 1. html绑定
    * 2. attribute绑定
    * */
    function bind(node, prop, type, config) {
        var self = this;
        var propPathString = prop.split('::')[0];
        var propPath = propPathString.split('.');
        var event = prop.split('::')[1];
        if (self.props.hasOwnProperty(propPath[0])) {

            var _bind = {};

            // 绑定：从prop到node
            var propToNodeHandler = function propToNodeHandler(ev, oldVal, newVal, path) {
                //console.log('template binding', this.tagName, propPath[0], 'change from', oldVal, 'to', newVal, path);
                for (var i = 1; i < propPath.length; i++) {
                    newVal = newVal[propPath[i]];
                }

                switch (type) {
                    case self.BIND_TYPES.INNERHTML:
                        node.innerHTML = newVal;
                        break;
                    case self.BIND_TYPES.PROPERTY:
                        node[config.propName] = newVal;
                        break;
                    case self.BIND_TYPES.ATTRIBUTE:
                        node.setAttribute(config.attrName, newVal);
                        break;

                }
            };
            var propEvent = self._getPropChangeEventName(propPath[0]);
            self.on(propEvent, propToNodeHandler);

            _bind.propToNode = {
                event: propEvent,
                handler: propToNodeHandler
            };

            // 绑定：从node到prop
            if (event) {
                var nodeToPropHandler = function nodeToPropHandler() {
                    var newVal = undefined;
                    switch (type) {
                        case self.BIND_TYPES.PROPERTY:
                            newVal = node[config.propName];
                            break;
                        case self.BIND_TYPES.ATTRIBUTE:
                            newVal = node.getAttribute(config.attrName);
                            break;

                    }
                    self.set(propPathString, newVal);
                };
                node.addEventListener(event, nodeToPropHandler);
                _bind.nodeToProp = {
                    event: event,
                    handler: nodeToPropHandler
                };
            }

            self._nova.binds.set(node, _bind);
        }
    }

    function unbind(node) {
        var bind = this._nova.binds.get(node);
        if (bind) {
            if (bind.propToNode) {
                this.off(bind.propToNode.event, bind.propToNode.handler);
            }
            if (bind.nodeToProp) {
                this.off(bind.nodeToProp.event, bind.nodeToProp.handler);
            }
        }
    }

    Nova.TemplateBehavior = TemplateBehavior;
})();
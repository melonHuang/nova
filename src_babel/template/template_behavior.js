'use strict';
(function() {
            /*
             * generated this._nova.binds:
             * {
             *  propName: {
             *      node: {
             *          type: 'attribute',
             *          name: 'attr-name',
             *          value: '{{a}}hehe{{b}}',
             *          annotations: [{
             *              value: '{{a}}',
             *              properties: ['a'],
             *              event: 'change'
             *          }, {
             *              value: '{{b}}',
             *              properties: ['b']
             *          }];
             *      }
             *  }
             * }
             *
             * generated this._nova.listeningNodes
             * {
             *  node: {
             *      event: [{
             *          type: 'attribute',
             *          name: 'attr-name',
             *          value: '{{a}}'
             *      }]
             *  }
             * }
             *
             * */
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    let TemplateBehavior = {
        createdHandler: function() {
            if(!this.template) { return; }

            let self = this;

            // 内部使用属性
            this._nova.binds = {
                hostToChild: {},
                childToHost: new Map()
            };
            //this._nova.listeningNodes = new Map();

            // 绑定事件，包括：
            // 1. 监听属性变化，属性改变时同步到child node
            bindEvents.call(self);

            // Data binding
            let nodeWrap = bindTemplate.call(this);

            // 插入content
            insertContent.call(this, nodeWrap);

            // 将编译好的节点插入到DOM中
            attach.call(this, nodeWrap);
        },

        /*
         * 编译节点，工作包括
         * 1. 给每个节点添加tagName class，支持Scoped CSS
         * 2. data binding
         * */
        compileNode: function(node) {

            addClass.call(this, node);

            // 绑定节点与属性
            this.bindNode(node);
        },

        /*
         * Data binding
         * */
        bindNode: function(node) {
            let self = this;
            let bindData = Nova.ExpressionParser.parse(node);

            // 遍历有绑定关系的节点
            bindData.forEach(function(bindings, node) {
                // 遍历节点与host绑定的不同attr/prop/textContent
                bindings.forEach(function(bindObj) {
                    // 遍历相关的属性
                    bindObj.relatedProps.forEach(function(prop) {
                        childListenToHost.call(self, node, prop.name, bindObj);
                    });

                    if(bindObj.event) {
                        hostListenToChild.call(self, child, event, bindObj);
                    }
                });
            });

            /*
            bindList.forEach(function(nodeObj) {
                nodeObj.bindings.forEach(function(bindObj) {
                    let listenedProps = [];
                    bindObj.annotations.forEach(function(annotation) {
                        // binding: 从prop到node
                        annotation.properties.forEach(function(prop) {
                            prop = prop.split('.')[0];
                            if(!self._nova.binds[prop]) {
                                watchPropAndBind.call(self, prop);
                            }
                            // 将节点加入监听属性的列表
                            self._nova.binds[prop].set(nodeObj.node, bindObj);
                            listenedProps.push(prop);
                        });

                        // binding: 从node到prop
                        if(annotation.event) {
                            if(!self._nova.listeningNodes.get(node) || !self._nova.listeningNodes.get(node)[annotation.event]) {
                                watchNodeAndBind.call(self, nodeObj.node, annotation.event);
                            }
                            self._nova.listeningNodes.get(nodeObj.node)[annotation.event].push(bindObj);
                        }
                    });
                    // 记录节点监听的属性
                    nodeObj.node._nova = nodeObj.node._nova || {};
                    nodeObj.node._nova.listens = nodeObj.node._nova.listens || new Map();
                    nodeObj.node._nova.listens.set(self, listenedProps.join(' '));
                });
            });
            */
        },

        /*
         * 取消节点与host的data binding
         * */
        unbindNode: function(node) {
            let self = this;

            childUnlistenHost.call(self, node);
            hostUnListenChild.call(self, node);

            // traverse childNodes
            node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function(child) {
                self.unbindNode(child);
            });
        }
    };

    function bindEvents() {
        this.on(this._propsCommonChangeEvent, propsChangedHandler);
    }

    /******************************* data binding ***********************************/
    function bindTemplate() {
        let wrap = document.createElement('div');
        wrap.innerHTML = this.template;
        this.bindNode(wrap);
        return wrap;
    }

    /*
     * host属性变化时，遍历this._nova.binds.hostToChild。
     * 同步监听host变化属性的child
     * */
    function propsChangedHandler(ev, oldVal, newVal, path) {
        let self = this;
        let prop = path.split('.')[0];
        let bindingNodes = this._nova.binds.hostToChild[prop];

        bindingNodes && bindingNodes.forEach(function(bindObj, node) {
            let value = Nova.ExpressionEvaluator.compile(bindObj, self);
            syncChild.call(self, node, value, bindObj);
        });
    }

    function childListenToHost(child, prop, bindObj) {
        let binds = this._nova.binds.hostToChild[prop] || new Map();
        this._nova.binds.hostToChild[prop] = binds;
        binds.set(child, bindObj);
    }

    function hostListenToChild(child, event, bindObj) {
        let self = this;
        let binds = this._nova.binds.childToHost.get(child) || {};
        this._nova.binds.childToHost.set(child, binds);

        if(!binds[event]) {
            binds[event] = [];
            let callback = function() {
                binds[event].forEach(function(bindObj) {
                    syncHost.call(self, child, bindObj.relatedProps[0].path, bindObj);
                });
            }
            child.addEventListener(event, callback);
        }

        binds[event].push(bindObj);
    }

    function childUnlistenHost(child) {
    }

    function hostUnListenChild(child) {
    }

    /*
     * 将host的属性同步到child
     * */
    function syncChild(child, value, extra) {
        switch(extra.type) {
            case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                child.setAttribute(extra.name, value);
                break;
            case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                child[extra.name] = value;
                break;
            case Nova.ExpressionParser.BIND_TYPES.TEXT:
                child.textContent = value;
                break;
        }
    }

    function syncHost(child, propPath, extra) {
        let newVal;
        switch(extra.type) {
            case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                newVal = child[extra.name];
                break;
            case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                newVal = child.getAttribute(extra.name);
                break;
        }
        self.set(propPath, newVal);
    }

    /*
    function watchPropAndBind(prop) {
        let self = this;
        self._nova.binds[prop] = new Map();
        let binds = this._nova.binds[prop];

        this.on(this._getPropChangeEventName(prop), function(e, oldVal, newVal, path) {
            binds.forEach(function(bindObj, node) {
                let value = Nova.Expression.compile(bindObj, self);
                switch(bindObj.type) {
                    case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                        node.setAttribute(bindObj.name, value);
                        break;
                    case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                        node[bindObj.name] = value;
                        break;
                    case Nova.ExpressionParser.BIND_TYPES.TEXT:
                        if(node.nodeType == Node.TEXT_NODE) {
                            node.textContent = value;
                        } else {
                            node.innerHTML = value;
                        }
                        break;
                }
            });
        });
    }
    function watchNodeAndBind(node, event) {
        let self = this;
        if(!this._nova.listeningNodes.get(node)) {
            this._nova.listeningNodes.set(node, {});
        }
        if(!this._nova.listeningNodes.get(node)[event]) {
            this._nova.listeningNodes.get(node)[event] = [];
        }
        node.addEventListener(event, function() {
            let propList = self._nova.listeningNodes.get(node)[event];
            propList && propList.forEach(function(prop) {
                let propPath;
                prop.value.replace(/{{(.+)}}/, function(match, p) {
                    propPath = p;
                });
                propPath = propPath.split('::')[0];

                let newVal;
                switch(prop.type) {
                    case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                        newVal = node[prop.name];
                        break;
                    case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                        newVal = node.getAttribute(prop.name);
                        break;
                }
                self.set(propPath, newVal);
            });
        });
    }

    */

    /******************************* content insertion ***********************************/
    function insertContent(nodesWrap) {
        let self = this;
        let contents = Array.prototype.slice.call(nodesWrap.querySelectorAll('content'));
        contents.forEach(function(content) {
            let select = content.getAttribute('select');
            let replacement;

            replacement = Array.prototype.slice.call((select ? self.querySelectorAll(select) : self.childNodes) || []);
            replacement.forEach(function(selectedEle) {
                if(Array.prototype.slice.call(self.children).indexOf(selectedEle) >= 0 || !select) {
                    content.parentElement.insertBefore(selectedEle, content);
                }
            });
            content.parentElement.removeChild(content);
        });
    }

    /******************************* others ***********************************/

    /*
     * Add tagName class to nodes to support Scoped CSS
     * */
    function addClass(node) {
        let self = this;

        // 添加tagName class, 支持css scope
        node.className += this.is;

        // traverse childNodes
        node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function(child) {
            addClass.call(addClass, child);
        });
    }


    /*
     * attach the compiled nodes to this
     * */
    function attach(nodesWrap) {
        let childNodes = Array.prototype.slice.call(nodesWrap.childNodes);
        for(let i = 0; i < childNodes.length; i++) {
            this.appendChild(childNodes[i]);
        }
    }

    Nova.TemplateBehavior = TemplateBehavior;
})();

'use strict';
(function() {
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    let TemplateBehavior = {
        host: null,
        parentScope: null,
        enumerableAsParentScope: true,

        createdHandler: function() {
            this.beforeTemplateInit && this.beforeTemplateInit();

            if(!this.template) { return; }

            let self = this;

            // 内部使用属性
            this._nova.binds = {
                hostToChild: {},
                childToHost: new Map(),
                allBindings: []         // 所有绑定，包括与父scope的绑定
            };

            // 监听属性变化，属性改变时同步到child node
            listenToProps.call(self);

            // Data binding
            let nodeWrap = bindTemplate.call(this);

            // 插入content
            insertContent.call(this, nodeWrap);

            // 将编译好的节点插入到DOM中
            attach.call(this, nodeWrap);

            this.updateTemplate();
        },

        /*
         * 编译节点，工作包括
         * 1. 给每个节点添加tagName class，支持Scoped CSS
         * 2. data binding
         * */
        compileNodes: function(node) {
            addClass.call(this, node);

            // 绑定节点与属性
            this.bindNodes(node);
        },

        bindNodeByConfigs: function(node, configs) {
            let self = this;
            configs.forEach(function(config) {
                let bindObj = $.extend({}, config, {
                    scope: self
                });
                switch(bindObj.type) {
                    case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                    case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                          $.extend(bindObj, Nova.ExpressionParser._parseExpression(bindObj.value));
                          break;
                }
                bind.call(self, node, bindObj);
            });
            node._nova = node._nova || {};
            node._nova.host = self;
            // 添加scope
            if(Nova.ExpressionParser.SCOPED_ELEMENTS.indexOf(node.tagName) >= 0) {
                node._nova.parentScope = node._nova.host;
            }
        },

        /*
         * Data binding
         * */
        bindNodes: function(node) {
            let self = this;
            let bindData = Nova.ExpressionParser.parse(node, this);

            //if(this.is == 'template-repeat-item' && bindData.size > 0) debugger;

            // 遍历有绑定关系的节点
            bindData.forEach(function(bindings, node) {
                // 遍历节点与host绑定的不同attr/prop/textContent
                bindings.forEach(function(bindObj) {
                    bind.call(self, node, bindObj);
                });

                // 添加scope
                node._nova = node._nova || {};
                node._nova.host = self;
                if(Nova.ExpressionParser.SCOPED_ELEMENTS.indexOf(node.tagName) >= 0) {
                    node._nova.parentScope = node._nova.host;
                }
            });
        },

        /*
         * 取消节点与host的data binding
         * */
        unbindNodes: function(node) {
            let self = this;

            childUnlistenHost.call(self, node);
            hostUnListenChild.call(self, node);

            // traverse childNodes
            node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function(child) {
                self.unbindNodes(child);
            });
        },

        updateTemplate: function(props) {
            let self = this;

            // 获取要刷新的属性列表
            if(props) {
                if(props.constructor != Array) {
                    props = [props];
                }
            }
            // 若没穿prop，则获取template中所有相关的属性，包括父级属性
            else {
                props = [];
                this._nova.binds.allBindings.forEach(function(bindObj) {
                    bindObj.relatedProps.forEach(function(prop) {
                        let exist;
                        for(let i = 0, len = props.length; i < len; i++) {
                            if(prop.path.indexOf(props[i]) == 0 && (!prop.path[props[i]] || prop.prop[props[i]] == '.')) {
                                exist = true;
                            }
                        }
                        !exist && props.push(prop.path);
                    });
                });
            }

            // 遍历props，刷新属性相关节点
            props.forEach(function(propPath) {
                let scope = findScopeByProp.call(self, propPath.split('.')[0]);
                scope && updateTemplateByPropPath.call(scope, propPath);
            });
        }
    };

    function bind(node, bindObj) {
        let self = this;
        // 通过on-event, 绑定child和host的方法
        if(bindObj.type == Nova.ExpressionParser.BIND_TYPES.EVENT) {
            let scope = findScopeByProp.call(self, bindObj.callback, true);
            scope && hostListenToChild.call(scope, node, bindObj.event, bindObj);
        }
        // 绑定child和host的属性
        else {
            // From host to child 遍历被模板监听的属性
            bindObj.relatedProps.forEach(function(prop) {
                let scope = findScopeByProp.call(self, prop.name);
                scope && childListenToHost.call(scope, node, prop.name, prop.path, bindObj);
                self._nova.binds.allBindings.push(bindObj);
            });

            //  From child to host
            if(bindObj.isLeftValue) {
                let scope = findScopeByProp.call(self, bindObj.relatedProps[0].name);
                scope && bindObj.event && hostListenToChild.call(scope, node, bindObj.event, bindObj);
                scope && bindObj.type == Nova.ExpressionParser.BIND_TYPES.PROPERTY && hostListenToChild.call(scope, node, this._getPropChangeEventName(bindObj.name), bindObj);
            }
        }
    }

    // 寻找最近的scope
    // prop: 属性名
    // notDefinedProp: 若为true, 则寻找最近的拥有prop属性的scope，若为false，则寻找最近的通过props定义了属性的scope
    function findScopeByProp(prop, notDefinedProp) {
        let scope = this;
        while(scope) {
            if(scope == this || scope.enumerableAsParentScope) {
                if(!notDefinedProp && scope.hasProperty(prop)) {
                    break;
                }
                if(notDefinedProp && (typeof scope[prop] == 'function')) {
                    break;
                }
            }
            scope = scope._nova.parentScope;
        }
        return scope;
    }

    function listenToProps() {
        this.on(this._propsCommonChangeEvent, propsChangedHandler);
    }

    /******************************* data binding ***********************************/
    function bindTemplate() {
        let wrap = document.createElement('div');
        wrap.innerHTML = this.template;
        this.compileNodes(wrap);
        return wrap;
    }

    /*
     * host属性变化时，遍历this._nova.binds.hostToChild。
     * 同步监听host变化属性的child
     * */
    function propsChangedHandler(ev, oldVal, newVal, path) {
        updateTemplateByPropPath.call(this, path);
    }

    function updateTemplateByPropPath(path) {
        let self = this;
        let prop = path ? path.split('.')[0] : '';
        let bindingNodes = this._nova.binds.hostToChild[prop];

        bindingNodes && bindingNodes.forEach(function(bindArray, node) {
            bindArray && bindArray.forEach(function(bindInfo) {
                // 若path是bindInfo.propPath的父属性，eg.path:a.b, propPath:a.b.c，则同步数据
                if(bindInfo.propPath.slice(0, path.length) == path) {
                    let value = Nova.ExpressionEvaluator.compile(bindInfo.bindObj);
                    syncChild.call(self, node, value, bindInfo.bindObj);
                }
            });
        });
    }

    function childListenToHost(child, propName, propPath, bindObj) {
        let binds = this._nova.binds.hostToChild[propName] || new Map();
        this._nova.binds.hostToChild[propName] = binds;
        let bindArray = binds.get(child) || [];
        binds.set(child, bindArray);
        bindArray.push({
            propPath: propPath,
            bindObj: bindObj
        });
    }

    function hostListenToChild(child, event, bindObj) {
        let self = this;
        let binds = this._nova.binds.childToHost.get(child) || {};
        this._nova.binds.childToHost.set(child, binds);

        if(!binds[event]) {
            binds[event] = [];
            let callback = function(ev) {
                binds[event].forEach(function(bindObj) {
                    if(bindObj.type == Nova.ExpressionParser.BIND_TYPES.EVENT) {
                        let args = [ev].concat(ev.detail || []);
                        self[bindObj.callback].apply(self, args);
                    } else {
                        syncHost.call(self, child, bindObj.relatedProps[0].path, bindObj);
                    }
                });
            }
            child.addEventListener(event, callback);
            binds[event].callback = callback;
        }

        binds[event].push(bindObj);
    }

    function childUnlistenHost(child) {
        let self = this;
        for(let prop in this._nova.binds.hostToChild) {
            let bindArray = this._nova.binds.hostToChild[prop].get(child);
            bindArray && bindArray.forEach(function(bindInfo) {
                let index = self._nova.binds.allBindings.indexOf(bindInfo.bindObj);
                self._nova.binds.allBindings.splice(index, 1);
            });
            this._nova.binds.hostToChild[prop].delete(child);
        }
    }

    function hostUnListenChild(child) {
        let binds = this._nova.binds.childToHost.get(child);
        if(binds) {
            for(let event in binds) {
                if(binds.hasOwnProperty(event)) {
                    child.removeEventListener(event, binds[event].callback);
                }
            }
            this._nova.binds.childToHost.delete(child);
        }
    }

    /*
     * 将host的属性同步到child
     * */
    function syncChild(child, value, extra) {
        switch(extra.type) {
            case Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE:
                if(child.getAttribute(extra.name) != value) {
                    child.setAttribute(extra.name, value);
                }
                break;
            case Nova.ExpressionParser.BIND_TYPES.PROPERTY:
                if(child[extra.name] != value) {
                    child[extra.name] = value;
                }
                break;
            case Nova.ExpressionParser.BIND_TYPES.TEXT:
                if(child.textContent != value) {
                    child.textContent = value;
                }
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
        this.set(propPath, newVal);
    }


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
        let scope = this;
        while(scope) {
            if(Nova.ExpressionParser.SCOPED_ELEMENTS.indexOf(scope.tagName) < 0) {
                if(!node.className || node.className.indexOf(scope.is) < 0) {
                    node.className += ' ' + scope.is;
                }
                // XXX
                if(node.hasAttribute && node.hasAttribute('class_')) {
                    node.setAttribute('class_', node.getAttribute('class_') + ' ' + scope.is);
                }
            }
            scope = scope._nova.parentScope;
        }

        // traverse childNodes
        node.childNodes && Array.prototype.slice.call(node.childNodes).forEach(function(child) {
            addClass.call(self, child);
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

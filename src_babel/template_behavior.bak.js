'use strict';
(function() {
    /*
    * Template功能：
    * 1. content insertion
    * 2. 为template中，除content insertion的dom节点，添加tagName class
    * 3. 解析模板中的annotaion，进行单向数据绑定
    * */
    let BIND_ATTR_NAME = '_nova-bind';
    let bindingData = [];

    let TemplateBehavior = {
        BIND_TYPES: {
            INNERHTML: 1,
            PROPERTY: 2,
            ATTRIBUTE: 3
        },
        createdHandler: function() {
            if(!this.template) { return; }

            let self = this;

            // 编译template
            let wrap = document.createElement('div');
            wrap.innerHTML = compileTemplate.call(this, this.template);

            console.log(this.tagName, wrap.innerHTML);



            // 初始化每一个节点
            initNode.call(this, wrap);

            // 插入content
            insertContent.call(this, wrap);

            // 插入到DOM中
            attach.call(this, wrap);
        },
    };

    function compileTemplate(template) {

        let wrap = document.createElement('div');
        wrap.innerHTML = template;

        compileNode.call(this, wrap);

        return wrap.innerHTML;
    }

    function compileNode(node) {
        let self = this;
        let binds = [];

        // 解析annotation
        // 替换属性注解<div attr="{{annotation}}">
        Array.prototype.slice.call(node.attributes || []).forEach(function(attr) {
            if(attr.constructor == Attr) {
                let match = attr.value.match(/^{{(.+)}}$/);
                if(match) {
                    let type = attr.name[attr.name.length - 1] == '$' ? self.BIND_TYPES.ATTRIBUTE : self.BIND_TYPES.PROPERTY;
                    let config = {};
                    // 绑定attribute
                    if(type == self.BIND_TYPES.ATTRIBUTE) {
                        config.attrName = attr.name.slice(0, attr.name.length - 1);
                        config.propName = Nova.CaseMap.dashToCamelCase(config.attrName);
                        node.removeAttribute(attr.name);
                        node.setAttribute(config.attrName, self.get(match[1]));
                    }
                    // 绑定property
                    else {
                        config.attrName = attr.name;
                        config.propName = Nova.CaseMap.dashToCamelCase(config.attrName);
                        node.removeAttribute(attr.name);
                        node.setAttribute(config.attrName, self.get(match[1]));
                        // TODO: set init prop
                    }
                    binds.push({
                        propName: match[1],
                        type: type,
                        config: config
                    });
                }
            }
        });

        // 替换标签注解，<tagName>{{annotaion}}</tagName>
        let html = node.innerHTML.trim();
        let match = html.match(/^{{(.+)}}$/);
        if(match) {
            node.innerHTML = self.get(match[1]);
            binds.push({
                propName: match[1],
                type: this.BIND_TYPES.INNERHTML
            });
        }

        if(binds.length > 0) {
            let bindArr = [];
            for(let i = 0, len = binds.length; i < len; i++) {
                bindArr.push(bindingData.length + i);
            }
            node.setAttribute(BIND_ATTR_NAME, bindArr.join(','));
            bindingData = bindingData.concat(binds);
        }

        Array.prototype.slice.call(node.children).forEach(function(child) {
            compileNode.call(self, child);
        });
    }

    /*
    * content insertion
    * */
    function insertContent(nodesWrap) {
        let self = this;
        let contents = Array.prototype.slice.call(nodesWrap.querySelectorAll('content'));
        contents.forEach(function(content) {
            let select = content.getAttribute('select');
            let replacement;

            replacement = Array.prototype.slice.call((select ? self.querySelectorAll(select) : self.childNodes) || []);
            replacement.forEach(function(selectedEle) {
                if(Array.prototype.slice.call(self.children).indexOf(selectedEle) >= 0 || !select) {
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
            //content.remove();
            content.parentElement.removeChild(content);
        });
    }

    /*
    * 将解析好的模板插入到DOM中
    * */
    function attach(nodesWrap) {
        let childNodes = Array.prototype.slice.call(nodesWrap.childNodes);
        for(let i = 0; i < childNodes.length; i++) {
            this.appendChild(childNodes[i]);
        }
    }

    /*
    * 初始化template中的每个节点
    * 1. 添加tagName Class
    * 2. 添加annotation单向数据绑定
    * */
    function initNode(node) {
        let self = this;

        // 添加tagName class
        let className = this.is;
        node.className += ' ' + className;

        let binds = node.getAttribute(BIND_ATTR_NAME);
        if(binds) {
            binds = binds.split(',');
            for(let i = 0, len = binds.length; i < len; i++) {
                let bindInfo = bindingData[binds[i]];
                bind.call(this, node, bindInfo.propName, bindInfo.type, bindInfo.config);
            }
            node.removeAttribute(BIND_ATTR_NAME);
        }

        Array.prototype.slice.call(node.children).forEach(function(child) {
            initNode.call(self, child);
        });
    }


    /*
    * 对节点进行双向绑定
    * 1. html绑定
    * 2. attribute绑定
    * */
    function bind(node, prop, type, config) {
        let self = this;
        let propPathString = prop.split('::')[0];
        let propPath = propPathString.split('.');
        let event = prop.split('::')[1];
        if(self.props.hasOwnProperty(propPath[0])) {
            // 绑定：从prop到node
            self.on('_' + propPath[0] + 'Changed', function(ev, oldVal, newVal) {
                //console.log(propPath[0], 'change from', oldVal, 'to', newVal);
                for(let i = 1; i < propPath.length; i++) {
                    newVal = newVal[propPath[i]];
                }

                switch(type) {
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

            });

            // 绑定：从node到prop
            if(event) {
                node.addEventListener(event, function() {
                    let newVal;
                    switch(type) {
                        case self.BIND_TYPES.PROPERTY:
                            newVal = node[config.propName];
                            break;
                        case self.BIND_TYPES.ATTRIBUTE:
                            newVal = node.getAttribute(config.attrName);
                            break;

                    }
                    self.set(propPathString, newVal);
                });
            }
        }
    }


    Nova.TemplateBehavior = TemplateBehavior;
})();

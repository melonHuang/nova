## 静态方法

#### Nova.ready
```js
/*
 * 功能：在元素完成注册后，执行回调
 * @param {Array} eles 元素数组
 * @param {Function} callback 回调函数
 */
Nova.ready(eles, callback);
```

## 原型方法
### 事件
#### on
```js
/*
 * 功能：绑定事件
 * @param {String} eventName 事件名，可传多个事件,用逗号分隔
 * @param {Function} callback 监听函数
 * @param {Boolean} useCapture 是否在捕获阶段执行
 */
ele.on(eventName, callback, useCapture);
```
#### off
```js
/*
 * 功能：注销事件
 * @param {String} eventName 事件名，可传多个事件,用逗号分隔
 * @param {Function} callback 监听函数
 * @param {Boolean} useCapture 是否在捕获阶段执行
 */
ele.set(eventName, callback, useCapture);
```
#### trigger
```js
/*
 * 功能：触发事件
 * @param {String} eventName 事件名，可传多个事件,用逗号分隔
 * @param {Array} details 额外信息
 */
ele.trigger(eventName, details);
```

### 方法切片
#### before
```js
/*
 * 功能：在元素的某个方法执行前插入执行一个方法
 * @param {String} methodName 方法名
 * @param {Function} callback 回调函数
 */
ele.before(methodName, callback);
```
#### after
```js
/*
 * 功能：在元素的某个方法执行后插入执行一个方法
 * @param {String} methodName 方法名
 * @param {Function} callback 回调函数
 */
ele.after(methodName, callback);
```
### 属性方法

#### set
```js
/*
 * 功能：修改属性，子属性有改变时也会触发属性修改事件
 * @param {String} propPath 属性路径，如name, info.birthday
 * @param value 新的值
 */
ele.set(propPath, value);
```

#### get
```js
/*
 * 功能：获取属性
 * @param {String} propPath 属性路径，如name, info.birthday
 * @return 属性值
 */
ele.set(propPath, value);
```

#### notifyPath
```js
/*
 * 功能：触发属性修改事件
 * @param {String} propPath 属性路径，如name, info.birthday
 */
ele.notifyPath(path);
```

#### addProperty
```js
/*
 * 功能：定义属性
 * @param {String} propName 属性名称
 * @param {Object} config 属性配置
 */
ele.addProperty(propName, config);
```

#### hasProperty
```js
/*
 * 功能：是否定义属性
 * @param {String} propName 属性名称
 * @return {Boolean} 是否定义属性
 */
ele.hasProperty(propName);
```

### 模板方法
#### compileNodes

```js
/*
 * 功能：编译动态插入的节点, 使动态插入的节点可应用内部样式、与host元素绑定。
 * @param {DOM} node 元素
 */
ele.compileNodes(node);
```

#### bindNodeByConfigs
```js
/*
 * 功能：节点与host元素双向绑定
 * @param {DOM} node 元素
 * @params {Array} configs 绑定配置
    [{
        type: Nova.ExpressionParser.BIND_TYPES.ATTRIBUTE || Nova.ExpressionParser.BIND_TYPES.PROPERTY,  // 绑定类型：attribute或property
        name: 'child-attr-name' || 'childPropName', // attribute或property名
        value: '{{hostProp}}'                       // 绑定的表达式
    }]
 */
ele.bindNodeByConfigs(node, configs);
```

#### unbindNodes
```js
/*
 * 功能：取消节点与host元素的绑定
 * @param {DOM} node 元素
 */
ele.unbindNodes(node);
```

#### updateTemplate
```js
/*
 * 功能：更新元素innerHTML
 * @param {Array} optional props 有更改的属性，若为空，则ele会刷新所有可能有修改的地方。
 */
ele.updateTemplate(props);
```

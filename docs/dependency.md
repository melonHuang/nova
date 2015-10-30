# 依赖管理

## 依赖语法


 Nova.js在上线模式和开发模式，都会将main.html编译成一个umd模块并执行。

main.html中可定义多个`<script>`:
* 拥有attribute`require-src`的`<script>`表示依赖：
    * attribute`require-src`: 依赖的文件路径。
    * attribute`exports`: UMD模块中，依赖文件暴露的变量名。如果不使用require.js则无需关心。
    * `require-src`是相对于baseUrl的路径。
    * `baseUrl`默认为'/'，可在引入nova_dev.js的`<script>`上，通过attribute`base-url`定义。例如`<script src="nova_dev.js" base-url="/static">`

* 没有attribute`require-src`的`<script>`表示注册自定义元素的脚本：
    * attribute`exports`: 定义它暴露在哪个对象上。

#### 例子

```html
<template is="dom-module">
    <!-- 依赖的脚本 -->
    <script require-src="js/doT" exports="doT"></script>

    <script exports="Nova.Components.MyEle">
        var MyEle = Nova({
            // ...
        });
        return MyEle;
    </script>
</template>
```
会被编译成：
```js
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('js/doT'));
    } else if (typeof define === 'function' && define.amd) {
        define(['js/doT'], factory);
    } else {
        var globalAlias = 'Nova.Components.MyEle';
        var namespace = globalAlias.split('.');
        var parent = root;
        for (var i = 0; i < namespace.length - 1; i++) {
            if (parent[namespace[i]] === undefined) parent[namespace[i]] = {};
            parent = parent[namespace[i]];
        }
        parent[namespace[namespace.length - 1]] = factory();
    }
})(this, function (doT) {
    var MyEle = Nova({
        // ...
    });
    return MyEle;
});
```



## 依赖自定义元素

若元素依赖的不是脚本，而是另一个自定义元素，可通过`<link rel="import">`表示：
* 自定义元素也需定义`require-src`属性，在编译时告诉编译脚本依赖元素编译后的文件地址。


```html
<!-- 定义<nova-markdown-editor> -->
<template is="dom-module">
    <!-- 依赖的自定义元素 -->
    <link rel="import" href="/static/components/nova-markdown/main.html" require-src="components/nova-markdown/main">
</template>
```


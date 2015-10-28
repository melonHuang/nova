# 自定义元素

## 目录结构

1. 手动创建

创建一个目录，目录名与自定义元素的标签名(必须用-分隔)相同，并在目录中创建main.html。在main.html编写元素定义。

```markup
/my-element
    main.html
```

2. 使用yeoman创建

执行以下命令：
```markup
npm install -g yeoman
npm install -g generator-nova
mkdir my-element
cd my-element
yo nova
```

## 定义元素

在以上创建的main.html中，对元素进行定义:
```markup
<template is="dom=module">
    <style>
        h1 { color: #f44; }
    </style>
    <template>
        <h1>Hello Nova!</h1>
    </template>
    <script exports="Nova.Component.MyElement">
        var MyEle = Nova({
            is: 'my-element',   // 标签名
            props: { },         // 属性
            // 生命周期
            createdHandler: function() { },
            attachedHandler: function() { },
            detachedHandler: function() { },
            attributeChangedHandler: function() { },
        });
    </script>
</template>
```

自定义元素是在`<template is="dom-module"></template>`中定义的，它包含子元素：
* style: 定义元素的样式。只能有一个
* template: 定义元素内部结构。只能有一个
* script: 定义元素属性、生命周期、方法等。可以有多个script标签，详情见依赖管理

### 通过window.Nova方法注册自定义元素

`window.Nova`方法接收一个类型为对象的参数。Nova会将这个参数作为自定义元素的prototype，来注册元素。
该原型有几个特殊的属性：
* is: 自定义元素的标签名，必须有-分隔，以区分自定义元素和原生元素。
* props: 定义属性。通过props定义属性，可监听属性变化，在模板中使用属性，通过attribute初始化属性。详情见定义属性。
* createdHandler， attachedHandler，detachedHandler， attributeChangedHandler。定义组件的生命周期。详情见生命周期。
* behaviors: 定义元素行为。方便多个自定义元素之间复用方法或属性。详情见Behavior机制

## 使用元素

1. 开发模式

```markup
<!-- 开发模式需要引入nova_polyfills.js -->
<script src="http://s0.qhimg.com/static/c194ef77618ac141/nova_polyfills.js"></script>
<link rel="import" href="/my-element/main.html">

<my-element></my-element>
```

开发时可直接通过`<link rel="import">`引入main.html，同时需要在页面中引入nova_dev.js。

2. 线上模式
由于只有部分浏览器支持`<link rel="import">`，上线时需要将main.html编译成相应的main.js
详情见：gulp-nova

编译后直接在页面中引入main.js即可。

```markup
<script src="/my-element/main.js"></script>

<my-element></my-element>
```


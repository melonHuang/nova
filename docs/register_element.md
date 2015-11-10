# 创建自定义元素

## 目录结构

#### 手动创建

创建一个目录，目录名与自定义元素的标签名(必须用-分隔)相同，并在目录中创建main.html。在main.html编写元素定义。

```
/my-element
    main.html
```

#### 使用yeoman创建

```bash
npm install -g yeoman
npm install -g generator-novajs
yo novajs
```

## 定义元素

在以上创建的main.html中，对元素进行定义:
```html
<!-- main.html -->
<template is="dom-module">
    <style>
        h1 { color: #f44; }
    </style>
    <template>
        <h1>Hello Nova!</h1>
    </template>
    <script>
        var MyEle = Nova({
            // 标签名
            is: 'my-element',
            // 声明属性
            props: { },
            // 生命周期
            createdHandler: function() { },
            attachedHandler: function() { },
            detachedHandler: function() { },
            attributeChangedHandler: function() { },

            // 其他方法
            sayHi: function() {alert('hi');}
        });
    </script>
</template>
```

```html
<!-- 使用自定义元素 -->
<my-element></my-element>
<script>
    var myElement = document.querySelector('my-element');
    myElement.sayHi();
</script>
```

自定义元素是在`<template is="dom-module"></template>`中定义的，它包含子元素：
* style: 定义元素的样式。
* template: 定义元素内部结构。元素初始化时、会使用template的innerHTML作为自己的innerHTML。
* script: 定义元素属性、生命周期、方法等。

### 通过window.Nova方法注册自定义元素

`window.Nova`方法接收一个类型为对象的参数。Nova会将这个参数作为自定义元素的prototype，来注册元素。
该原型有几个特殊的属性：
* `is`: 自定义元素的标签名，必须有"-"分隔，以区分自定义元素和原生元素。
* `props`: 定义属性。通过props定义属性，可监听属性变化、在模板中使用属性、通过attribute初始化属性。详情见[声明属性](doc.html#doc=define_property)。
* `createdHandler`，`attachedHandler`，`detachedHandler`， `attributeChangedHandler`。定义组件的生命周期。详情见[生命周期](doc.html#doc=lifecycle)。
* `behaviors`: 通过它可mixin属性、方法、生命周期回调。方便多个自定义元素之间复用方法或属性。详情见[Behavior机制](doc.html#behavior)

## 使用元素

#### 开发模式

```html
<!-- 开发模式需要引入nova_dev.js -->
<link rel="import" href="/my-element/main.html">
<script src="http://s7.qhimg.com/!9cf3a0f2/nova_dev.1.0.1.js"></script>
<!-- https
<script src="https://s.ssl.qhimg.com/!9cf3a0f2/nova_dev.1.0.1.js"></script>
-->

<!-- 使用自定义元素 -->
<my-element></my-element>
```

开发时可直接通过`<link rel="import">`引入main.html，同时需要在页面中引入nova_dev.js。

#### 线上模式
由于只有部分浏览器支持`<link rel="import">`，上线时需要将main.html编译成相应的main.js
详情见：[编译](doc.html#doc=compile)

编译后直接在页面中引入main.js即可。

```html
<!-- 引入编译后的main.js -->
<script src="/my-element/main.js"></script>

<!-- 使用自定义元素 -->
<my-element></my-element>
```

## 例子
以下文件是一个在线编辑markdown的例子

<a href="https://github.com/melonHuang/nova-demo/archive/master.zip" class="btn btn-primary">Download ZIP</a>

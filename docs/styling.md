# 定义样式

组件的样式，可在`<template is="dom-module">`中的`<style></style>`标签中定义。

```html
<!-- 自定义元素<my-element> -->
<template is="dom-module">
    <style>
        :host { display:block; }
        h1 { color:red; }
    </style>
    <template>
        <h1>Hello Nova</h1>
    </template>
    <script>
        Nova({
            is: 'my-element'
        });
    </script>
</template>
```

## 样式作用域

在以上`style`标签中定义的CSS样式，只会作用于自定义元素及其内部。

```html
<h1>Outer title</h1>
<my-element></my-element>
```

例如，在以上例子中。`<my-element>`元素中定义的`h1 { color:red; }`只会应用于`<my-element>`在初始化之后添加到内部的`<h1>Hello Nova</h1>`，而不会影响它的兄弟节点`<h1>Outer title</h1>`。

## 特定选择器

#### :host

定义`<my-element>`元素本身的样式，可使用选择器:host。
```html
<style>
    :host { display:block; }
</style>
```

#### ::shadow

以下定义的`<wrap-element>`的模板中，有子元素`<my-element>`。  
如果`<wrap-element>`想定义`<my-element>`模板初始化后内部的`<h1>Hello Nova</h1>`，可通过`::shadow`选择器定义`<my-element>`模板定义的内部元素。

使用格式：
```css
my-element ::host h1 {}
```

```html
<!-- 自定义元素<wrap-element>  -->
<template is="dom-module">
    <style>
        my-element ::shadow h1 { font-size:32px; }
    </style>
    <template>
        <my-element></my-element>
    </template>
    <script exports="Nova.Components.WrapElement">
        Nova({
            is: 'wrap-element'
        });
    </script>
</template>
```

#### ::content

模板支持通过`<content>`标签，在模板中插入元素初始化前内部的节点。详情见[模板语法](doc.html#doc=data_binding)

如果想定义通过`<content>`插入的元素的样式，可通过`::content`选择器。  

使用格式：
```css
.nav-list ::content a {}
```
注意：::content前必须有选择器。

```html
<!-- 自定义元素<my-nav> -->
<template is="dom-module">
    <style>
        .nav-list ::content a { float:right; }
    </style>
    <template>
        <div class="nav-list">
            <content></content>
        </div>
    </template>
    <script exports="Nova.Components.WrapElement">
        Nova({
            is: 'my-nav'
        });
    </script>
</template>

<my-element>
    <a href="start.html">快速开始</a>
    <a href="api.html">API文档</a>
    <a href="comp.html">组件库</a>
</my-element>
```

## 动态插入节点

某些场景下，需要给自定义元素动态插入子节点。如果希望应用`<style>`中定义的样式，需要使用`compileNodeis`接口编译要动态插入节点。
#### 例子
```js
Nova({
    is: 'my-element',
    createdHandler: function() {
        var ul = this.querySelector('ul');
        var li = document.createElement('li');

        ul.appendChild(this.compileNodes(li));
    }
});
```

# 快速入门

## 简介

Nova.js是一个小巧的Web Component框架，旨在帮助开发者方便快速地开发组件。
作者起初希望在一个移动端项目中使用Polymer进行开发，但发现Polymer的代码对于移动端小型项目过于庞大、且只支持到Android4.4。因此借鉴了Polymer的部分组件开发的思想，实现了Nova.js。
Nova.js压缩后总共12K(包括nova_polyfill)。支持所有主流的移动端浏览器(Android2.3+, IOS4.0+)，PC端支持Chrome, Safari, Firefox,IE8+等。

包括功能：
* 自定义元素
* Scoped CSS
* 模板双向绑定
* 监听属性
* 事件模型
* 方法切片
* Behavior复用机制


## 获取Nova
1. 通过Bowser获取
2. 直接下载
3. 使用CDN资源


```html
<script src="http://s0.qhimg.com/static/c194ef77618ac141/nova_polyfills.js"></script>
<script src="http://s4.qhimg.com/static/a2435fb6e1b4b1c3/nova.js"></script>
```

## 使用已有自定义元素
```html
<script src="/my-element/main.js"></script>
<my-element></my-element>
```

## 注册自定义元素
(如何自定义元素)['/'];

## 例子
nova-todolist


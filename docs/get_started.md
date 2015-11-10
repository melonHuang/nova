# 使用Nova.js

## 简介

Nova.js是一个小巧的Web Component框架，旨在帮助开发者方便快速地开发组件。

作者起初希望在一个移动端项目中使用Polymer进行开发，但发现Polymer的代码对于移动端小型项目过于庞大、且只支持到Android4.4。因此借鉴了Polymer的部分组件开发的思想，实现了Nova.js。

Nova.js使用gzip压缩后的总大小为12K。

#### 浏览器支持度

* 移动端主流浏览器(Android2.3+, iOS4.0+)
* PC端主流浏览器(Chrome, Safari, Firefox, IE8+)

#### 功能列表
* 自定义元素
* Scoped CSS
* 模板双向绑定
* 监听属性
* 事件模型
* 方法切片
* Behaviors复用机制


## 获取Nova

#### 通过Bower获取

```bash
bower install --save Nova.js
```

#### 直接下载

<a href="https://github.com/melonHuang/nova/archive/master.zip" class="btn btn-primary">Download ZIP</a>


#### 使用CDN资源
```html
<script src="http://s0.qhimg.com/static/c194ef77618ac141/nova_polyfills.1.0.1.js"></script>
<script src="http://s1.qhimg.com/static/c70d46df1c829566/nova.1.0.1.js"></script>

<!-- https -->
<script src="https://s.ssl.qhimg.com/static/c194ef77618ac141/nova_polyfills.1.0.1.js"></script>
<script src="https://s.ssl.qhimg.com/static/c70d46df1c829566/nova.1.0.1.js"></script>
```

<!--
## 使用已有自定义元素
```html
<script src="/my-element/main.js"></script>
<my-element></my-element>
```

## 注册自定义元素
(如何自定义元素)['/'];
-->


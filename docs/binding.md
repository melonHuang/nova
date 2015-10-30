# 模板语法

组件开发者可通过在`<template>`标签中定义元素的内部结构。元素在初始化时，`<template>`中定义的模板会作为它的`innerHTML`。
因此使用者只需声明使用元素、而无需关心元素的内部结构。


```html
<template is="dom-module">
    <style></style>
    <template>
        <h1>Hello {{firstName + ' ' + lastName}}</h1>
    </template>
    <script>
        Nova({
            is: 'my-element',
            props: {
                firstName: {
                    type: String,
                    value: 'Melon'
                },
                lastName: {
                    type: String,
                    value: 'Huang'
                }
            }
        });
    </script>
</template>
```

## 模板绑定

#### 占位符
* 模板中支持通过`{{}}`占位符, 绑定表达模板与属性。
* `{{}}`占位符内支持表达式, 例如`{{!isSelected}}`, `{{index + 1}}`。

#### 作用域
表达式能访问通过props定义的属性和window对象

#### 绑定类型
模板中支持四种绑定类型：

* 绑定textNode
    ```html
    <template>
        <h1>Hello {{name}}</h1>
    </template>
    ```
    * 所有内容均会被转义。

* 绑定property

    ```html
    <template is="dom-module">
        <template>
            <!-- 绑定语法 child-prop="{{hostProp}}" -->
            <a href="info.html" doc-name="{{name}}">About</a>
        </template>
        <script>
            Nova({
                is: 'my-book',
                createdHandler: function() {
                    var aEle = this.querySelector('a');
                    console.log(aEle.docName == this.name); // true
                }
            });
        </script>
    </template>
    ```
    `doc-name="{{name}}"`绑定了模板中`<a>`的property`docName`和自定义元素的property`name`。  
    * 绑定property语法：child-prop="{{hostProp}}"。
    * 绑定时，必须将child的属性名由驼峰命名转为dash命名。

* 绑定attribute
    ```html
    <template is="dom-module">
        <template>
            <!-- 绑定语法：attribute名_="{{name}}" -->
            <a href="info.html" doc-name_="{{name}}">About</a>
        </template>
        <script>
            Nova({
                is: 'my-book',
                createdHandler: function() {
                    var aEle = this.querySelector('a');
                    console.log(aEle.getAttribute('doc-name') == this.name); // true
                }
            });
        </script>
    </template>
    ```
    `doc-name_="{{name}}"`绑定了模板中`<a>`的attribute`doc-name`和自定义元素的property`name`。  

    * 绑定property和绑定attribute的语法相似。主要通过绑定时`attribute`的最后一位是否为`_`来区分两者。

* 绑定事件
    ```html
    <template is="dom-module">
        <template>
            <button on-click="{{clickHandler}}">Click me</button>
        </template>
        <script>
            Nova({
                is: 'my-element',
                clickHandler: function() {}
            });
        </script>
    </template>
    ```

    * 绑定语法：`on-event="{{methodName}}"`， 只有在绑定事件时，才可通过`{{}}`访问自定义元素的方法。

#### 双向绑定

* 双向绑定自定义元素

    ```html
    <!-- <my-wrap>的模板 -->
    <template>
        <my-inner inner-name="{{wrapName}}"></my-inner>
    </template>
    ```
    ```javascript
    var myWrap = document.querySelector('my-wrap');
    var myInner = myWrap.querySelector('my-inner');

    myWrap.wrapName = 'Mike';
    console.log(myInner.innerName == 'Mike');   // true

    myInner.wrapName = 'Susan';
    console.log(myWrap.innerName == 'Susan');   // true
    ```
    当通过`name="{{wrapName}}"`的方式绑定了`<my-inner>`的`innerName`属性，和`<my-wrap>`的`wrapName`属性后。Nova会自动对它们两个进行双向绑定。

    * 绑定语法：child-prop="{{hostProp}}"

* 双向绑定原生元素

    ```html
    <!-- <my-element>的模板 -->
    <template>
        <!-- 在input发生input事件时，将value属性赋值给<my-element>的inputText -->
        <input type="text" value="{{inputText::input}}">

        <!-- 在input发生change事件时，将value属性复制给<my-element>的inputText
        <input type="text" value="{{inputText::change}}">
        -->
    </template>
    ```
    在如下例子中，通过`value="{{inputText::input}}"`，双向绑定了`<input>`的`value`属性和`<my-element>`的`inputText`属性。  
    当`<input>`发生`input`事件时。会将`<input>`的`value`属性，复制给`<my-element>`的`inputText`属性。

    * 绑定语法：child-prop="{{hostProp::childEvent}}"


## `<content>`

#### 使用场景
自定义元素初始化时，会使用模板作为它的`innerHTML`。但在一些常见中，组件开发者是希望一部分内部元素由使用者自己定义。在这种场景下、可以依靠`<content></content>`元素实现。

#### 使用语法
`<content select="a">`会从使用者声明的元素中，查找符合`select`选择器的元素，插入到`<content>`的位置。

#### 例子
在如下`<my-tab>`例子中、组件开发者希望tab的标签和内容由使用者自己定义。因此通过`<content select="a">`和`<content select=".cont-item">`表达了希望在此处插入使用者自己声明的元素。因此使用者定义的`<a>`会被插入到`<div class="tab-header">`中， `<div class="cont-item">`会被插入到`<div class="tab-content">`中


```html
<!-- <my-tab> template -->
<template>
    <div class="tab-header">
        <content select="a"></content>
    </div>
    <div class="tab-content">
        <content select=".cont-item"></content>
    </div>
</template>

<!-- 使用<my-tab> -->
<my-tab>
    <a href="###">新闻</a>
    <a href="###">图片</a>
    <a href="###">笑话</a>

    <div class="cont-item">新闻内容</div>
    <div class="cont-item">图片内容</div>
    <div class="cont-item">笑话内容</div>
</my-tab>
```

## 循环

Nova.js内置自定义元素`template-repeat`，来实现模板循环。

`template-repeat`继承自`template`元素，使用方法如下：

```html
<!-- <my-nav>模板 -->
<template>
    <ul>
        <template is="template-repeat" items="{{list}}">
            <li>{{index}}.{{item}}</li>
        </template>
        <!-- 也可通过as和index-as自定义循环项和索引的变量名称
        <template is="template-repeat" items="{{list}}" as="nav" index-as="{{i}}">
            <li>{{i}}.{{nav}}</li>
        </template>
        -->
    </ul>
</template>
```

#### 要点：
* 由`template-repeat`循环得出的结构，默认会替换`template-repeat`节点。但可通过定义attribute`parent-selector`，来指定结果插入到哪个元素中。
* 由于`template-repeat`继承自`template`，因此使用时应生命`<template is="template-repeat">`，而不是`<template-repeat>`。
* 需将要循环的数组与`template-repeat`的`{{items}}`属性绑定。
* 在循环体中，默认可通过`item`和`index`读取循环项和索引。但也可通过`as`和`index-as`自定义循环项和索引的变量名称。
* `template-repeat`支持循环嵌套。

## 条件判断
Nova.js内置自定义元素`template-if`，来实现条件判断。

```html
<!-- <my-element>模板 -->
<template>
    <template-if if="{{isGirl}}">
        Hi, Lady!
    </template-if>
</template>
```
* `<template-if>`内的结构，默认会替换`<template-if>`节点。但可通过定义attribute`parent-selector`，来指定结构插入到哪个元素中。


# 声明属性

开发者可通过props来声明元素属性。
```javascript
Nova({
    is: 'my-dog',
    props: {
        name: {
            type: String,
            value: '旺财'
        },
        isGirl: Boolean,
        age: Number,
        foods: Array,
        info: {
            type: Object,
            value: function() {
                return {};
            }
        }
    }
});
```

通过props定义的属性，有以下功能：
* 通过Attribute初始化Property
* 监听属性变化
* 与模板绑定

## 声明方式

声明属性有两种方式
1. 简写
```javascript
props: {
    '属性名': 类型
}
```
2. 完整定义
```javascript
props: {
    '属性名': {
        type: 类型,
        value: 默认值
    }
}
```

属性对象：

| key | 含义 |
| ---- | ---- |
| type | 属性类型。包括：`String`, `Number`, `Boolean`, `Date`, `Object`, `Array` |
| value | 默认值。可直接传默认值，或返回默认值的方法 |

#### 注意
当type为`Date`, `Object`, `Array`时，默认值应该通过方法来定义，避免多个元素实例公用一个对象。



## Attribute to Property

使用者可通过声明式的方式初始化元素属性。

```html
<my-dog name="Doggie" age="3" is-girl foods='["meat", "cookie", "sock"]' info='{"birthday":"06.28"}'>
<!-- info可简写为
<my-dog info.birthday="06.28">
-->
<script>
    var myDog = document.querySelector('my-doc');
    Nova.ready([myDog], function() {
        console.log(myDog.name);                 // "Doggie"
        console.log(myDog.age);                  // 3
        console.log(myDog.isGirl);               // true
        console.log(myDog.foods[2]);             // "sock"
        console.log(myDog.info.birthday);        // "06.28"
    });
</script>
```

#### 命名
在解析attribute时，Nova会将attribute由dash命名转换为驼峰命名。因此attribute`is-girl`对应的property是`isGirl`。

#### 解析
不同类型的属性会以不同的方式被解析

| 类型 | 解析方式 |
| ---- | ---- |
| String    | 直接使用，不做处理  |
| Number | parseFloat(attr) |
| Boolean | hasAttribute(attr) |
| Date | new Date(attr) |
| Object | JSON.parse(attr) |
| Array | JSON.parse(attr) |

## 监听属性

#### 事件名称
当属性被修改时，会触发属性修改的事件，事件名称格式如下：

```javascript
'_' + 属性名 + 'Changed'

// 因此name属性变化的事件是
'_nameChanged'

```

#### 触发修改的条件

当修改对象或数组时，只有修改了对象本身的引用时才会触发修改事件。例如：
```javascript
// 不会触发_infoChanged和_foodsChanged事件
myDog.info.birthday = '06.29';
myDog.foods.push('can');

// 会触发_infoChanged和_foodsChanged事件
myDog.info = {birthday:'06.29'}
myDog.foods = ['can'];
```

Nova.js提供了两个接口来强制触发修改事件：
* 可直接通过set方法修改子属性，子属性有改变时，会触发修改事件
* 可在修改子属性后，通过notifyPath方法强制触发修改事件

```javascript
// 会触发_infoChanged事件
myDog.set('info.birthday', '06.29');

// 会触发_infoChanged事件
myDog.info.birthday = '09.30';
myDog.notifyPath('info.birthday');

// 会触发_foodsChanged事件
myDog.foods.push('can');
myDog.notifyPath('foods');
```


#### 监听属性变化：
```
{
    // ...
    createdHandler: function() {
        this.on('_nameChanged', function(ev, oldVal, newVal, path) {
        });
    }
}
```

监听函数的参数含义：

| 变量 | 含义 |
| ---- | ---- |
| oldVal | 修改前的值 |
| newVal | 修改后的值 |
| path | 修改属性的路径，如info.birthday |


## 绑定属性和模板

属性可与模板绑定。详情见[模板语法](doc.html#doc=binding);
```html
<template>
    <span age="{{age}}">{{name}}</span>
    <span>{{info.birthday}}</span>
</template>
```

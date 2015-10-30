# Behavior复用机制

若多个自定义元素存在相同的属性或行为，可通过Behavior机制达到代码复用或代码拆分。

## 定义Behavior

#### 功能
Behavior可定义：
* 元素生命周期回调
* 属性
* 方法

#### 例子
```javascript
var PluginBehavior = {
    props: {},
    createdHandler: functino() {},
    someMethod: function() {}
};
```

## 使用Behavior
在自定义元素时，可通过behaviors属性声明使用Behavior.

#### behaviors属性

* behaviors属性是由多个behavior组成的一个数组。
* behaviors的方法和属性会被合并到自定义元素的原型上。
* 在自定义元素的不同生命周期阶段，behaviors中定义的声明周期回调会按在behaviors数组中的顺序被依次执行。

#### 例子
```javascript
Nova({
    is: 'my-plugin',
    behaviors: [PluginBehavior, AnimBehavior]
});
```

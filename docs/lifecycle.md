# 生命周期

## 回调方法

```javascript
Nova({
    is: 'my-element',
    createdHandler: function() { },
    attachededHandler: function() { },
    detachedHandler: function() { },
    attributeChangedHandler: function(attrName, oldVal, newVal) { },
});
```


* `createdHandler`  
当DOM中的元素被解析，或者使用者通过`document.createElement('my-element')`创建元素实例时执行

* `attachedHandler`  
当元素被插入到某元素时执行

* `detachedHandler`  
当元素被从父节点中移除时执行

* `attributeChangedHandler`  
当元素在的attribute发生改变时执行

## 元素初始化时机

由于元素的初始化时机由浏览器控制，不能确定初始化时机。因此当我们想使用元素时，不能保证元素已完成初始化（属性、模板、createdHandler）。

可使用Nova.ready方法，在保证元素初始完成后执行代码：
```javascript
var myElement = document.querySelector('my-element');
Nova.ready([myElement], function() {
    // ...
});
```

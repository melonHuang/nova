# 事件模型

Nova.js封装了on、off、trigger方法，方便开发者绑定和解绑事件。

#### 例子
```
var myElement = document.createElement('my-element');
var name = 'Tom';
var age = 18;

myElement.on('checkin', callback);

myElement.trigger('checkin', [name, age]);

myElement.on('off', callback);

function callback(ev, name, age) {
});

```

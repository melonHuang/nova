# 方法切片

Nova.js提供了before、after接口，让自定义元素的使用者能更方便地对其进行扩展。

* before、after的回调函数的参数包括被切片的方法接受的参数。

#### 例子

```
var myElement = document.querySelector('my-element');

// 在myElement.checkin()方法执行前插入任务
myElement.before('checkin', function(ev, name, age) {
    // do sth
});

// 在myElement.checkin()方法执行后插入任务
myElement.after('checkin', function(ev, name, age) {
    // do sth
});

myElement.check('Tom', '18');
```


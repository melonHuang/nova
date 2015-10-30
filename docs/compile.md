# 上线编译

由于`<link rel="import">`的支持度不高，因此上线的时候需要通过将自定义元素的main.html，编译为对应的main.js。来提供更高的支持度。

## 编译原理
* 编译时，会提取main.html中的template和style，作为Nova方法的参数的template和stylesheet属性。
* 编译时，会将main.js包装成UMD模块。详情见[依赖管理](doc.html#doc=dependency)。

## 编译工具

#### nova-compile

安装：
```bash
npm install -save nova-compile
```

使用：
```js
var novaCompile = require('nova-compile');

var option = { };
novaCompile(file, option).then(function(script) {
    // ...
});
```

options:
```js
{
    umd: true,          // 是否包装为umd模块，默认为true
    combo: {            // 是否将依赖合并成一个文件，默认null
        baseUrl: '.'    // 合并的baseUrl
    }
}
```

### gulp-nova
```bash
npm install -save gulp-nova
```

```js
var gulpNova = require('gulp-nova');
gulp.src('my-element/main.html')
    .pipe(gulpNova({
        combo: {
            baseUrl: '.'
        }
    }))
    .pipe(gulp.dest('my-element/main.js'));
```


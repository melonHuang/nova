var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    rename = require('gulp-rename'),
    novaCompile = require('nova-compiler'),
    plugins = gulpLoadPlugins();

gulp.task('compile', function() {
  // place code for your default task here
    gulp.src('components/**/*.html')
        .pipe(novaCompile())
        .pipe(rename(function(path) {
            console.log(path);
            path.extname = '.js';
        }))
        .pipe(gulp.dest('./components'));
});

gulp.task('watch', function() {
    var watcher = gulp.watch('components/**/*.html', ['compile']);
});

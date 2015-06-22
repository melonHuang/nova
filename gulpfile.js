var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    babel = require('gulp-babel'),
    rename = require('gulp-rename'),
    novaCompile = require('gulp-nova'),
    plugins = gulpLoadPlugins();

gulp.task('nova-compile', function() {
  // place code for your default task here
    gulp.src('components/**/*.html')
        .pipe(novaCompile())
        .pipe(rename(function(path) {
            console.log(path);
            path.extname = '.js';
        }))
        .pipe(babel())
        .pipe(gulp.dest('./components'));
});

gulp.task('babel-compile', function() {
    gulp.src('src_babel/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('src'));
});

gulp.task('watch', function() {
    var watcher1 = gulp.watch('components/**/*.html', ['nova-compile']);
    var watcher2 = gulp.watch('src_babel/**/*.js', ['babel-compile']);
});

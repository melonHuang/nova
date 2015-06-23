var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

gulp.task('build-component', function() {
  // place code for your default task here
    gulp.src('components/**/*.html')
        .pipe(plugins.watch('components/**/*.html'))
        .pipe(plugins.nova())
        .pipe(plugins.rename(function(path) {
            console.log('building component', path);
            path.extname = '.js';
        }))
        .pipe(plugins.babel())
        .pipe(gulp.dest('components'));
});

gulp.task('build-nova', function() {
    gulp.src('src_babel/**/*.js')
        .pipe(plugins.watch('src_babel/**/*.js'))
        .pipe(plugins.babel())
        .pipe(plugins.rename(function(path) {
            console.log('building nova', path);
        }))
        .pipe(gulp.dest('src'))
        .pipe(plugins.rename(function(path) {
            gulp.start('concat-nova');
        }))

});

gulp.task('concat-nova', function() {
    gulp.src([
             'src/nova_bootstrap.js',
             'src/lib/css_parse.js',
             'src/lib/case_map.js',
             'src/style.js',
             'src/event_behavior.js',
             'src/properties_behavior.js',
             'src/template_behavior.js',
             'src/base.js'
        ])
        .pipe(plugins.concat('nova.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('default', ['build-nova', 'build-component']);

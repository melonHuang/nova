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

gulp.task('build-nova-components', function() {
  // place code for your default task here
    gulp.src('src_babel/components/**/*.html')
        .pipe(plugins.watch('src_babel/components/**/*.html'))
        .pipe(plugins.nova())
        .pipe(plugins.rename(function(path) {
            console.log('building component', path);
            path.extname = '.js';
        }))
        .pipe(gulp.dest('src_babel/components'));
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
            gulp.start('release');
        }))
});

gulp.task('release', function() {
    // 打包nova
    gulp.start('concat-nova');

    // 打包nova_dev
    gulp.src('src/nova_dev.js')
        .pipe(gulp.dest('./build'));

    // 打包nova_polyfills
    gulp.src([
             'lib/document-register-element.js',
             'lib/es6-map-shim.js'
        ])
        .pipe(plugins.concat('nova_polyfills.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('concat-nova', function() {
    gulp.src([
             'src/nova_bootstrap.js',
             'src/lib/css_parse.js',
             'src/lib/case_map.js',
             'src/lib/utils.js',
             'src/style.js',
             'src/event_behavior.js',
             'src/aspect_behavior.js',
             'src/properties_behavior.js',
             'src/template/annotation.js',
             'src/template/expression.js',
             'src/template/template_behavior.js',
             'src/base.js',
             'src/components/template-repeat/main.js',
             'src/components/template-if/main.js'
        ])
        .pipe(plugins.concat('nova.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('default', ['build-nova', 'build-nova-components']);

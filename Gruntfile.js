module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        "babel": {
            options: {
                sourceMap: true
            },
            dist: {
                /*
                files: {
                    //"www/resource/module/test.js": "www/resource/module_babel/test.js"
                }
                */
                files: [{
                    expand: true,
                    cwd: 'src_babel/',
                    src: ['**.js'],
                    dest: 'src',
                    ext: '.js'
                }]
            }
        },

        watch: {
            "babel": {
                files: ['src_babel/**.js'],
                tasks: ['babel']
            }
        }
    });

    grunt.registerTask("default", ["watch"]);
}

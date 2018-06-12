module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
        sass: {
            files: ['public/sass/*.scss'],
            tasks: ['sass']
        },
        concat: {
            files: ['public/js/*.js'],
            tasks: ['concat']
        }
    },

    sass: {
        dist: {
            options: {
                style: 'expanded'
            },
            files: {
                'public/css/main.css': 'public/sass/main.scss'
            }
        }
    },

    concat: {
        options: {
            separator: ';',
            stripBanners: true,
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },

        dist: {
            src: [
              'public/js/config.js',
              'public/js/eventwebsocket.js',
              'public/js/backend.js',
              'public/js/modelview.js',
              'public/js/toolbox.js',
              'public/js/main.js'
            ],
            dest: 'public/js/main.min.js'
        }
    }
  });


  // Load the plugin that provides the "watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Load the plugin that provides the "sass" task.
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['sass', 'concat']);
};

module.exports = function(grunt) {

  grunt.initConfig({
    concat_css: {
      all: {
        src: ['css/bootstrap.css', 'css/font-awesome.css', 'css/bootstrap-select.css', 'css/bootstrap-datepicker.css', 'css/build.css', 'css/jquery-ui.css', 'css/style.css', 'css/responsive.css'],
        dest: "css/bundle.css"
      }
    },
    watch: {
      css: {
            files: ['css/bootstrap.css', 'css/font-awesome.css', 'css/bootstrap-select.css', 'css/bootstrap-datepicker.css', 'css/build.css', 'css/jquery-ui.css', 'css/style.css', 'css/responsive.css'],
            tasks: ['concat_css']
          }
    }
  });
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);

}
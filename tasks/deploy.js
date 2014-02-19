module.exports = function(grunt) {
  grunt.registerTask('deploy', function() {
    grunt.task.run('dist');
    grunt.task.run('push-prod');
  });

};

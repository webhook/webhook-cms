module.exports = function(grunt) {
  grunt.registerTask('deploy', function() {
    grunt.task.run('exec:bower_update');
    grunt.task.run('dist');
    grunt.task.run('push-prod');
  });

};

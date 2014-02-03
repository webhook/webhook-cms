module.exports = function(grunt) {
  var wrench = require('wrench');
  var cloudStorage = require('../libs/cloudStorage.js');
  var fs = require('fs');
  var async = require('async');


  var productionBucket = 'cms.webhook.com';
  var productionVersion = 'v1';
  var distDir = 'dist/assets/';

  grunt.registerTask('push-prod', function() {
    var done = this.async();
    var files = wrench.readdirSyncRecursive(distDir);

    var uploadFunctions = [];

    files.forEach(function(file) {
      var source = distDir + file;
      if(!fs.lstatSync(source).isDirectory())
      {
        if(file.indexOf('.vendor.min.js') !== -1) {
          uploadFunctions.push(function(step) {
            grunt.log.success('uploading ' + source);
            cloudStorage.objects.upload(productionBucket, source, productionVersion + '/assets/vendor.min.js', function() {
              step();
            });
          });
        } else if (file.indexOf('.app.min.css') !== -1) {
          uploadFunctions.push(function(step) {
            grunt.log.success('uploading ' + source);
            cloudStorage.objects.upload(productionBucket, source, productionVersion + '/assets/app.min.css', function() {
              step();
            });
          });
        } else {
          uploadFunctions.push(function(step) {
            grunt.log.success('uploading ' + source);
            cloudStorage.objects.upload(productionBucket, source, productionVersion + '/assets/' + file, function() {
              step();
            });
          });
        }
      }
    });

    async.series(uploadFunctions, function() {
      grunt.log.success('Done');
      done();
    });
  });

};

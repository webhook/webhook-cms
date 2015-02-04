module.exports = {
  html: 'tmp/result/index.html',
  options: {
    dest: 'dist/',
    flow: {
      steps: { 
        js: ['concat', 'uglifyjs'], 
        css: ['concat', 'cssmin'] 
      },
      post: {
        js: [{
          name: 'concat',
          createConfig: function(context, block) {
            context.options.generated.files.forEach(function(file) {
              if(file.dest.indexOf('.min.js') !== -1) {
                file.dest = file.dest.replace('.min.js', '.js');
              }
            });
          }
        }, {
          name: 'uglify',
          createConfig: function(context, block) {
            context.options.generated.files.forEach(function(file) {
              if(file.src.indexOf('.min.js') !== -1) {
                file.src = file.src.replace('.min.js', '.js');
              } else if (Array.isArray(file.src)) {
                var newArray = [];
                file.src.forEach(function(realsrc) {
                  newArray.push(realsrc.replace('.min.js', '.js'));
                });
                file.src = newArray;
              }
            });
          }
        }]
      }
    }
  }
};

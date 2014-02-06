module.exports = {
  compile: {
    options: {
      style: 'expanded',
      loadPath: ['vendor/bourbon/app/assets/stylesheets', 'vendor/neat/app/assets/stylesheets', 'vendor/wyrm/sass', 'vendor/font-awesome/scss']
    },
    files: [{
      expand: true,
      cwd: 'app/styles',
      src: ['**/*.{scss,sass}', '!**/_*.{scss,sass}'],
      dest: 'tmp/result/assets/',
      ext: '.css'
    }]
  }
};

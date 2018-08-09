const gulp = require('gulp');

gulp.task('default', [
  'js',
  'stylus',
  'html:build',
  'html:test',
  'html:watch',
  'serve',
]);

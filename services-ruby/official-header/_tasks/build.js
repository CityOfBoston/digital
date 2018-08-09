const gulp = require('gulp');

gulp.task('build', ['js', 'stylus', 'html:build', 'html:test']);

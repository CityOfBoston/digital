const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('serve', shell.task(['puma']));

const gulp = require('gulp');
const uglify = require('gulp-uglify');

gulp.task('js', function() {
  return gulp
    .src('./src/js/header.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

const gulp = require('gulp');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');

gulp.task('stylus', function() {
  return gulp
    .src('./src/css/main.styl')
    .pipe(
      stylus({
        compress: true,
      })
    )
    .pipe(
      autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false,
      })
    )
    .pipe(plumber())
    .pipe(gulp.dest('./dist/css'));
});

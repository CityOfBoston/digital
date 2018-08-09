const gulp = require('gulp');
const inject = require('gulp-inject');
const strip = require('gulp-strip-comments');
const html2js = require('gulp-html-js-template');

gulp.task('html:build', ['stylus'], function() {
  return gulp
    .src(['./src/header.html', './src/emergency.html'])
    .pipe(
      inject(gulp.src(['./dist/css/main.css']), {
        starttag: '<!-- inject:css -->',
        transform: function(filePath, file) {
          return file.contents.toString('utf8');
        },
      })
    )
    .pipe(
      inject(gulp.src(['./src/img/cob-logo.svg']), {
        starttag: '<!-- inject:cob_logo -->',
        transform: function(filePath, file) {
          return file.contents.toString('utf8');
        },
      })
    )
    .pipe(
      inject(gulp.src(['./src/img/b-logo.svg']), {
        starttag: '<!-- inject:b_logo -->',
        transform: function(filePath, file) {
          return file.contents.toString('utf8');
        },
      })
    )
    .pipe(strip())
    .pipe(html2js())
    .pipe(gulp.dest('./dist'));
});

gulp.task('html:test', function() {
  return gulp.src('./src/test.html').pipe(gulp.dest('./dist'));
});

gulp.task('html:watch', function() {
  gulp.watch('./dist/css/main.css', ['html:build']);
  gulp.watch(['./src/header.html', './src/emergency.html'], ['html:build']);
  gulp.watch('./src/test.html', ['html:test']);
});

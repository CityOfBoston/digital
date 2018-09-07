// @flow
/* eslint no-console: 0 */

import gulp from 'gulp';
import ignore from 'gulp-ignore';
import babel from 'gulp-babel';

import del from 'del';
import plumber from 'gulp-plumber';

const IGNORED_JS_SOURCE = ['**/__mocks__', '**/*.test.js'];

gulp.task('clean:build', () => del('build'));

gulp.task('babel:server', ['clean:build'], () =>
  gulp
    .src('server/**/*.js')
    .pipe(plumber())
    .pipe(ignore.exclude(IGNORED_JS_SOURCE))
    .pipe(babel())
    .pipe(gulp.dest('build/server'))
);

gulp.task('build', ['babel:server']);

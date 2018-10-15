// @flow
/* eslint no-console: 0 */

import gulp from 'gulp';
import ignore from 'gulp-ignore';
import babel from 'gulp-babel';

import del from 'del';
import plumber from 'gulp-plumber';
import path from 'path';

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

gulp.task('babel:clear-cache', () =>
  del(path.join('node_modules', '.cache', 'babel-loader'))
);

gulp.task('build', ['babel:server']);

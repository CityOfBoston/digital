// @flow
/* eslint no-console: 0 */

import gulp from 'gulp';
import ignore from 'gulp-ignore';
import babel from 'gulp-babel';

import del from 'del';
import clearRequire from 'clear-require';
import plumber from 'gulp-plumber';
import { exec } from 'child_process';

import fetchTemplates from './tasks/fetch-templates';
import generateSchema from './tasks/generate-schema';

const IGNORED_JS_SOURCE = ['**/__mocks__', '**/*.test.js'];

gulp.task('clean:build', () => (
  del('build')
));

gulp.task('clean:next', () => (
  del('.next')
));

gulp.task('babel:server', ['clean:build'], () => (
  gulp.src('server/**/*.js')
    .pipe(plumber())
    .pipe(ignore.exclude(IGNORED_JS_SOURCE))
    .pipe(babel())
    .pipe(gulp.dest('build/server'))
));

gulp.task('next:compile', ['clean:next'], (cb) => {
  exec('next build', (err, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    cb(err);
  });
});

gulp.task('templates:fetch', () => (
  plumber()
  .pipe(fetchTemplates({
    url: 'https://edit-dev.boston.gov/api/v1/layouts/app',
  }))
  .pipe(gulp.dest('templates'))
));

const GRAPHQL_QUERIES = 'data/dao/graphql/*.graphql';
const GRAPHQL_SCHEMA = 'graphql/schema.json';

gulp.task('graphql:schema', () => {
  // need to clear because we're requiring again and we need to avoid the cache
  clearRequire.match(/server\/graphql/);

  plumber()
  .pipe(generateSchema({
    schema: require('./server/graphql').default,
  }))
  .pipe(gulp.dest('graphql'));
});

gulp.task('graphql:types', ['graphql:schema'], (cb) => {
  exec(`apollo-codegen generate ${GRAPHQL_QUERIES} --schema ${GRAPHQL_SCHEMA} --target flow --output data/dao/graphql/types.js`, (err, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    cb(err);
  });
});

gulp.task('watch:graphql', () => [
  gulp.watch('server/graphql/*.js', ['graphql:schema']),
  // gulp.watch([GRAPHQL_QUERIES, GRAPHQL_SCHEMA], ['graphql:types']),
]);

// TODO(finh): restore pulling templates at this step
gulp.task('build', ['babel:server', 'next:compile']);
gulp.task('watch', ['watch:graphql']);

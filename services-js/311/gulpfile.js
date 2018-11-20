/* eslint no-console: 0 */

const fs = require('fs');
const gulp = require('gulp');
const ignore = require('gulp-ignore');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const svgSprite = require('gulp-svg-sprite');
const path = require('path');

const del = require('del');
const plumber = require('gulp-plumber');
const pump = require('pump');
const exec = require('child_process').exec;

const IGNORED_JS_SOURCE = ['**/__mocks__', '**/*.test.js'];

const spriteDirContents = fs.readdirSync(path.join('static', 'sprites'));
const SPRITE_TASKS = [];
const SPRITE_WATCH_TASKS = [];

spriteDirContents.forEach(p => {
  if (p.startsWith('.')) {
    return;
  }

  const taskName = `sprite:${p}`;
  SPRITE_TASKS.push(taskName);
  SPRITE_WATCH_TASKS.push(`watch:${taskName}`);

  gulp.task(taskName, () =>
    gulp
      .src(`static/sprites/${p}/*.svg`)
      .pipe(plumber())
      .pipe(
        svgSprite({
          mode: {
            symbol: {
              sprite: `${p}.svg`,
              dest: '',
            },
          },
        })
      )
      .pipe(gulp.dest('static/assets/img/svg'))
  );

  gulp.task(`watch:${taskName}`, () =>
    gulp.watch(`static/sprites/${p}/*.svg`, [taskName])
  );
});

gulp.task('sprite', SPRITE_TASKS);
gulp.task('watch:sprite', SPRITE_WATCH_TASKS);

gulp.task('clean:build', () => del('build'));

gulp.task('clean:next', () => del('.next'));

gulp.task('babel:server', ['clean:build'], () =>
  gulp
    .src('server/**/*.[jt]s')
    .pipe(plumber())
    .pipe(ignore.exclude(IGNORED_JS_SOURCE))
    .pipe(babel())
    .pipe(gulp.dest('build/server'))
);

gulp.task('babel:clean', () => del('node_modules/.cache/babel-loader'));

gulp.task('next:compile', ['clean:next'], cb => {
  exec(
    `${path.join('node_modules', '.bin', 'next')} build`,
    (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      cb(err);
    }
  );
});

gulp.task('storybook:head', ['templates:fetch'], cb => {
  exec(
    `${path.join(
      'node_modules',
      '.bin',
      'babel-node'
    )} --extensions ".ts",".tsx" ${path.join(
      '.',
      'scripts',
      'make-storybook-head'
    )}`,
    (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      cb(err);
    }
  );
});

gulp.task('vendor', cb => {
  pump(
    [
      gulp.src([
        'node_modules/html5-history-api/history.js',
        'node_modules/classlist-polyfill/src/index.js',
      ]),
      uglify(),
      concat('ie9-polyfill.js'),
      gulp.dest('static/assets/vendor'),
    ],
    cb
  );
});

gulp.task('templates:fetch', ['babel:clean'], cb => {
  exec(
    `${path.join('node_modules', '.bin', 'babel-node')} ${path.join(
      '.',
      'scripts',
      'fetch-templates'
    )}`,
    (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      cb(err);
    }
  );
});

const GRAPHQL_QUERIES = path.join('data', 'dao', 'graphql', '*.graphql');
const GRAPHQL_SCHEMA = path.join('graphql', 'schema.json');

gulp.task('graphql:schema', cb => {
  exec(
    `${path.join('node_modules', '.bin', 'babel-node')} ${path.join(
      '.',
      'scripts',
      'generate-schema'
    )}`,
    (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      cb(err);
    }
  );
});

gulp.task('graphql:types', ['graphql:schema'], cb => {
  exec(
    `${path.join(
      'node_modules',
      '.bin',
      'apollo-codegen'
    )} generate ${GRAPHQL_QUERIES} --schema ${GRAPHQL_SCHEMA} --target flow --output data/queries/graphql/types.js --no-add-typename`,
    (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      cb(err);
    }
  );
});

gulp.task('watch:graphql', () => [
  gulp.watch('server/graphql/*.js', ['graphql:schema']),
  gulp.watch(
    [GRAPHQL_QUERIES.replace(/\\/g, '/'), GRAPHQL_SCHEMA.replace(/\\/g, '/')],
    ['graphql:types']
  ),
]);

gulp.task('build', [
  'templates:fetch',
  'babel:server',
  'next:compile',
  'vendor',
]);
gulp.task('watch', ['watch:graphql', 'watch:sprite']);

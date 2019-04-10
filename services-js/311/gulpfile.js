/* eslint no-console: 0 */

const fs = require('fs');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const svgSprite = require('gulp-svg-sprite');
const path = require('path');

const plumber = require('gulp-plumber');
const pump = require('pump');
const exec = require('child_process').exec;

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

gulp.task('templates:fetch', cb => {
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

gulp.task('watch', ['watch:sprite']);

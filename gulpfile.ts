import BrowserSync from 'browser-sync';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import ts from 'gulp-typescript';
import * as prettier from 'gulp-plugin-prettier';
import dotenv from 'dotenv';

const eslint = require('gulp-eslint');
const clean = require('gulp-clean');

const src = gulp.src;
const browserSync = BrowserSync.create();

const tsProject = ts.createProject('tsconfig.json');

dotenv.config({
  path: `./env/${process.env.NODE_ENV || 'development'}.env`,
});

const port = process.env.PORT;

const CONF = {
  BROWSER_SYNC_PORT: 7000,
  DIST: 'dist',
  DIST_ALL: 'dist/**/*',
  DIST_APP: 'dist/app.js',
  DIST_VIEWS: 'dist/views',
  LOCAL_HOST: `http://localhost:${port}`,
  SRC_TS_ALL: 'src/**/*.ts',
  SRC_VIEWS_ALL: 'src/views/**/*.*',
};

gulp.task('nodemon', (done) => {
  let started = false;

  return nodemon({
    script: CONF.DIST_APP,
    ext: 'ts json js',
    watch: [CONF.DIST],
    env: {
      NODE_ENV: 'development',
    },
    stdout: false,
    delay: 10,
  })
    .on('start', () => {
      // to avoid nodemon being started multiple times
      if (!started) {
        done();

        started = true;
      }
    })
    .on('restart', () => {
      console.log('nodemon restarted!');
      setTimeout(() => {
        browserSync.reload();
      }, 1000);
    })
    .on('crash', function () {
      console.error('Application has crashed!\n');
      this.emit('restart', 10); // restart the server in 10 seconds
    });
});

gulp.task(
  'browser-sync',
  gulp.series('nodemon', (done) => {
    browserSync.init(
      {
        browser: 'google chrome',
        files: [CONF.DIST_ALL],
        port: CONF.BROWSER_SYNC_PORT,
        proxy: CONF.LOCAL_HOST,
        reloadOnRestart: true,
      },
      done,
    );
  }),
);

gulp.task('clean', () => src(CONF.DIST_ALL, { read: false }).pipe(clean()));

gulp.task('prettier', () =>
  gulp
    .src([CONF.SRC_TS_ALL, './gulpfile.ts'])
    .pipe(prettier.format({}, { configFile: true }))
    .pipe(gulp.dest((file) => file.base)),
);

gulp.task('eslint', () =>
  gulp
    .src([CONF.SRC_TS_ALL])
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()),
);

gulp.task(
  'compile:tsc',
  gulp.series(() =>
    tsProject.src().pipe(tsProject()).pipe(gulp.dest(CONF.DIST)),
  ),
);

gulp.task('copy:views', () =>
  gulp.src(CONF.SRC_VIEWS_ALL).pipe(gulp.dest(CONF.DIST_VIEWS)),
);

// watch ts src
gulp.task('watch', () => {
  console.log('watching for file changes...');
  gulp.watch([CONF.SRC_TS_ALL], gulp.series('compile:tsc'));
  gulp.watch([CONF.SRC_VIEWS_ALL], gulp.series('copy:views'));
});

gulp.task(
  'build',
  gulp.series('clean', 'prettier', 'eslint', 'compile:tsc', 'copy:views'),
);

// run dev mode
gulp.task('run:dev', gulp.series('build', 'browser-sync', 'watch'));

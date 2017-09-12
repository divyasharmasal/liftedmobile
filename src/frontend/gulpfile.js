/*
 * This helps to automate the process of running `preact build` while
 * developing the frontend code. Any changes to gulpfile.js or any files
 * in the frontend/src directory will trigger `preact build`, as defined
 * in the build task below.
 *
 * To run `preact build` once and not monitor for file changes, run
 * `gulp deploy`.
 */
 
const gulp = require('gulp');
const shell = require('gulp-shell');

// The default task is to build and watch, while the deploy task runs
// build-prod and exists.
gulp.task('default', ['build', 'watch']);
gulp.task('deploy', ['build-prod']);


// Watch the following files & directories, and run the build task upon any
// change
gulp.task('watch', function () {
  gulp.watch(['./gulpfile.js'], ['build']);
  gulp.watch(['./preact.config.js'], ['build']);
  gulp.watch(['./src/**/*'], ['build'])
});

// Run preact build in development mode
gulp.task('build', shell.task([
   //'preact build --clean --production false --dest ../lm/app/static/app/dist/',
   'mv ../lm/app/static/app/dist/bundle*.js ../lm/app/static/app/dist/bundle.js',
   'mv ../lm/app/static/app/dist/polyfills*.js ../lm/app/static/app/dist/polyfills.js',
   'mv ../lm/app/static/app/dist/style*.css ../lm/app/static/app/dist/style.css',
   'rm -rf ../lm/app/static/app/dist/images',
   'cp -r ../lm/static/app/images ../lm/app/static/app/dist/images',
   'cp -r ../lm/static/app/favicons ../lm/app/static/app/dist/favicons',
  ],
  {
    env: {
      PREACT_PROD: false,
      NODE_ENV: "development",
    }
  }
));

// Run preact build in production mode, and delete JS sourcemaps
gulp.task('build-prod', shell.task([
  'preact build --clean --production true --dest ../lm/app/static/app/dist/',
  'echo "Deleting sourcemaps..."',
  'rm -rf ../lm/app/static/app/dist/*.map',
  'rm -rf ../lm/app/static/app/dist/ssr-build',
  'rm ../lm/app/static/app/dist/index.html',
  'mv ../lm/app/static/app/dist/bundle*.js ../lm/app/static/app/dist/bundle.js',
  'mv ../lm/app/static/app/dist/polyfills*.js ../lm/app/static/app/dist/polyfills.js',
  'mv ../lm/app/static/app/dist/style*.css ../lm/app/static/app/dist/style.css',
  'cp -r ../lm/static/app/images ../lm/app/static/app/dist/images',
  'cp -r ../lm/static/app/favicons ../lm/app/static/app/dist/favicons',
],
  {
    env: {
      PREACT_PROD: true,
      NODE_ENV: "production",
    }
  }
));

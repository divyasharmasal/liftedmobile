const gulp = require('gulp');
const shell = require('gulp-shell');

// The default task is to build and watch, while the deploy task runs
// build-prod and exists.
gulp.task('default', ['build', 'watch']);
gulp.task('deploy', ['build-prod']);


// Watch the following files & directories, and run the build task upon any
// change
gulp.task('watch', function () {
  gulp.watch(['gulpfile.js'], ['build']);
  gulp.watch(['preact.config.js'], ['build']);
  gulp.watch(['src/**/*'], ['build'])
  gulp.watch(['../lm/static/cms/'], ['build'])
});

// Run preact build in development mode
gulp.task('build', shell.task([
   //'preact build --clean --production false --dest ../lm/app/static/app/dist/',
   //'mv ../lm/app/static/app/dist/bundle*.js ../lm/app/static/app/dist/bundle.js',
   //'mv ../lm/app/static/app/dist/polyfills*.js ../lm/app/static/app/dist/polyfills.js',
   //'mv ../lm/app/static/app/dist/style*.css ../lm/app/static/app/dist/style.css',
   'rm -rf ../lm/cms/static/cms/dist/images',
   'cp -r ../lm/static/cms/images ../lm/cms/static/cms/dist/images',
   'cp -r ../lm/static/cms/favicons ../lm/cms/static/cms/dist/favicons',
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
  'preact build --clean --production true --no-prerender --dest ../lm/cms/static/cms/dist/',
  'echo "Deleting sourcemaps..."',
  'rm -rf ../lm/cms/static/cms/dist/*.map',
  'rm -rf ../lm/cms/static/cms/dist/ssr-build',
  'rm ../lm/cms/static/cms/dist/index.html',
  'mv ../lm/cms/static/cms/dist/bundle*.js ../lm/cms/static/cms/dist/bundle.js',
  'mv ../lm/cms/static/cms/dist/polyfills*.js ../lm/cms/static/cms/dist/polyfills.js',
  'mv ../lm/cms/static/cms/dist/style*.css ../lm/cms/static/cms/dist/style.css',
  'cp -r ../lm/static/cms/images ../lm/cms/static/cms/dist/images',
  'cp -r ../lm/static/cms/favicons ../lm/cms/static/cms/dist/favicons',
],
  {
    env: {
      PREACT_PROD: true,
      NODE_ENV: "production",
    }
  }
));

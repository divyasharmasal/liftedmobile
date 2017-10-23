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
  gulp.watch(['../cms/static/cms/'], ['build'])
});

// Run preact build in development mode
gulp.task('build', shell.task([
   'rm -rf ../static/cms/dist/images',
   'cp -r ../frontend/static/app/images ../static/cms/dist/images',
   'cp -r ../frontend/static/app/favicons ../static/cms/dist/favicons',
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
  'preact build --clean --production true --no-prerender --dest ../cms/static/app/dist/',
  'echo "Deleting sourcemaps..."',
  'rm -rf ../cms/static/app/dist/*.map',
  'rm -rf ../cms/static/app/dist/ssr-build',
  'rm ../cms/static/app/dist/index.html',
  'mv ../cms/static/app/dist/bundle*.js ../cms/static/app/dist/bundle.js',
  'mv ../cms/static/app/dist/polyfills*.js ../cms/static/app/dist/polyfills.js',
  'mv ../cms/static/app/dist/style*.css ../cms/static/app/dist/style.css',
  'cp -r ../lm/static/cms/images ../cms/static/app/dist/images',
  'cp -r ../lm/static/cms/favicons ../cms/static/app/dist/favicons',
],
  {
    env: {
      PREACT_PROD: true,
      NODE_ENV: "production",
    }
  }
));

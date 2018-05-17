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
  gulp.watch(['../lm/static/app/images'], ['build'])
});

// Keep static files updated during development
gulp.task('build', shell.task([
   'mkdir -p ../../static/app/images',
   'mkdir -p ../../static/app/favicons',
   'mkdir -p ../static/app/dist',
   'rm -rf ../static/app/dist/images',
   'rm -rf ../static/app/dist/favicons',
   'cp -r ../../static/app/images ../static/app/dist/images',
   'cp -r ../../static/app/favicons ../static/app/dist/favicons',
  ]
));

// Run preact build in production mode, and delete JS sourcemaps
gulp.task('build-prod', shell.task([
  'preact build --service-worker true --no-prerender --clean --dest ../static/app/dist/',
  'echo "Deleting sourcemaps..."',
  'rm -rf ../static/app/dist/*.map',
  'rm -rf ../static/app/dist/ssr-build',
  'rm -rf ../static/app/dist/index.html',
  'echo "Renaming output files..."',
  'mv ../static/app/dist/bundle*.js ../static/app/dist/bundle.js',
  'mv ../static/app/dist/polyfills*.js ../static/app/dist/polyfills.js',
  'mv ../static/app/dist/style*.css ../static/app/dist/style.css',
  'echo "Copying images..."',
  'cp -r ../../static/app/images ../static/app/dist/images',
  'cp -r ../../static/app/favicons ../static/app/dist/favicons',
],
  {
    env: {
      PREACT_PROD: true,
      NODE_ENV: "production",
    }
  }
));

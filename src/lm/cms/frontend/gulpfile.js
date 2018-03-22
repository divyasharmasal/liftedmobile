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
  gulp.watch(['../../static/cms/'], ['build'])
});

// Keep static files updated during development
gulp.task('build', shell.task([
  'rm -rf ../static/cms/images',
  'rm -rf ../static/cms/favicons',
  'cp -r ../../static/cms/images ../static/cms/',
  'cp -r ../../static/cms/favicons ../static/cms/',
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
  'preact build --service-worker false --clean --production true --no-prerender --dest ../static/cms/dist/',
  'echo "Deleting sourcemaps..."',
  'rm -rf ../static/cms/dist/*.map',
  'rm -rf ../static/cms/dist/ssr-build',
  'rm ../static/cms/dist/index.html',

  'echo "Renaming source files..."',
  'mv ../static/cms/dist/bundle*.js ../static/cms/dist/bundle.js',
  'mv ../static/cms/dist/polyfills*.js ../static/cms/dist/polyfills.js',
  'mv ../static/cms/dist/style*.css ../static/cms/dist/style.css',

  'echo "Copying static files..."',
  'cp -r ../../static/cms/images ../static/cms/',
],
  {
    env: {
      PREACT_PROD: true,
      NODE_ENV: "production",
    }
  }
));

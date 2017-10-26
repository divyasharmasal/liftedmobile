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

gulp.task('build', shell.task([
  'rm -rf ../static/app/dist/images',
  'cp -r ../app/static/app/images ../static/app/',
  'cp -r ../app/static/app/favicons ../static/app/',
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
  'preact build --clean --production true --no-prerender --dest ../static/app/dist/',
  'echo "Deleting sourcemaps..."',
  'rm -rf ../static/app/dist/*.map',
  'rm -rf ../static/app/dist/ssr-build',
  'rm ../static/app/dist/index.html',

  'echo "Renaming source files..."',
  'mv ../static/app/dist/bundle*.js ../static/app/dist/bundle.js',
  'mv ../static/app/dist/polyfills*.js ../static/app/dist/polyfills.js',
  'mv ../static/app/dist/style*.css ../static/app/dist/style.css',

  'echo "Copying static files..."',
  'cp -r ../app/static/app/images ../static/app/',
  'cp -r ../app/static/app/favicons ../static/app/',
],
  {
    env: {
      PREACT_PROD: true,
      NODE_ENV: "production",
    }
  }
));

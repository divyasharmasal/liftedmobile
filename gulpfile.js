var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify');
var aliasify = require('aliasify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

// keep a count of the times a task refires
var scriptsCount = 0;

// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('scripts', function () {
  bundleApp(false);
});

gulp.task('deploy', function (){
  bundleApp(true);
});

gulp.task('watch', function () {
  gulp.watch(
      ['./src/lm/app/frontend/js/*.js', 
       './src/lm/app/frontend/js/**/*.js' ],
    ['scripts']
  );
});

// When running 'gulp' on the terminal this task will fire.
// It will start watching for changes in every .js file.
// If there's a change, the task 'scripts' defined above will fire.
gulp.task('default', ['scripts','watch']);

// Private Functions
// ----------------------------------------------------------------------------
function bundleApp(isProduction) {
  scriptsCount++;
  // Browserify will bundle all our js files together in to one and will let
  // us use modules in the front end.
  var appBundler = browserify({
    entries: './src/lm/app/frontend/js/app.js',
    debug: true
  })

  appBundler
    // transform ES6 and JSX to ES5 with babelify
    .transform(babelify, {presets: ["es2015"]})
    .transform(aliasify, {
      "aliases": {
        "react": "preact-compat",
        "react-dom": "preact-compat"
      }
    })
    .bundle()
    .on('error',gutil.log)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./src/lm/app/static/app/js'))
}

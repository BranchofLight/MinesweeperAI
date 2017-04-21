var gulp = require('gulp');
    jshint = require('gulp-jshint');
    concat = require('gulp-concat');

var fileOrder = ['./src/aiobject.js', './src/game.js', './src/view.js', './src/*.js'];

gulp.task('default', function() {
  gulp.watch(fileOrder, ['jshint', 'concat']);
});

gulp.task('jshint', function() {
  return gulp.src(fileOrder)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('concat', function() {
  return gulp.src(fileOrder)
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dist/'));
});

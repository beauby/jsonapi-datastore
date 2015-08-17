var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

var SRC = 'src/*.js';
var DEST = 'dist/';

gulp.task('build', function() {
  gulp.src(SRC)
    .pipe(concat('jsonapi-datastore.js'))
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('default', ['build']);

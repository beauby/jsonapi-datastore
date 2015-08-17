var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    mocha = require('gulp-mocha');

var SRC = 'src/*.js',
    DEST = 'dist/';

gulp.task('build', function() {
  gulp.src(SRC)
    .pipe(concat('jsonapi-datastore.js'))
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('test', ['build'], function() {
  gulp.src('test/*.js')
    .pipe(mocha());
});

gulp.task('default', ['build']);

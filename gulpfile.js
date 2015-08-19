var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    mocha = require('gulp-mocha'),
    wrap = require('gulp-wrap'),
    beautify = require('gulp-jsbeautify'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    markdox = require('gulp-markdox');

var SRC = 'src/jsonapi-datastore/*.js',
    DEST = 'dist/';

gulp.task('build', ['jshint', 'jscs'], function() {
  return gulp.src(SRC)
    .pipe(concat('jsonapi-datastore.js'))
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('build-angular', ['build'], function() {
  return gulp.src('dist/jsonapi-datastore.js')
    .pipe(concat('ng-jsonapi-datastore.js'))
    .pipe(wrap({ src: 'src/angular-wrapper.js' }))
    .pipe(beautify({ indent_size: 2 }))
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
});

gulp.task('test', ['build'], function() {
  gulp.src('test/*.js')
    .pipe(mocha());
});

gulp.task('jscs', function() {
  return gulp.src(SRC)
    .pipe(jscs());
});

gulp.task('jshint', function() {
  return gulp.src(SRC)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('doc', function() {
  return gulp.src(SRC)
    .pipe(markdox())
    .pipe(concat("DOCUMENTATION.md"))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['test', 'build', 'build-angular', 'doc']);

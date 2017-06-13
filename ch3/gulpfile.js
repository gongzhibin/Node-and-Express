const gulp = require('gulp');
const mocha = require('gulp-mocha');
const jshint = require('gulp-jshint');
const exec = require('gulp-exec');


gulp.task('qa', function() {
    gulp.src('qa/tests-*.js')
        .pipe(mocha({ ui: 'tdd' }));
});

gulp.task('jshint', function() {
    const path = {
        app: ['index.js', 'public/js/**/*.js', 'lib/**/*.js'],
        qa: ['gulpfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
    };
    gulp.src(path.app)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
    gulp.src(path.qa)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default',['jshint','qa']);

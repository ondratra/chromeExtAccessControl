// require dependencies
const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');
const errorify = require('errorify');
const gulp = require('gulp');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const size = require('gulp-size');
const mergeStream = require('merge-stream');
const gutil = require('gulp-util');
const prettyBytes = require('pretty-bytes');
const del = require('del');

// setup project parameters
const sourceFolder = './src/';
const sourceFile = 'main.js';
const destFolder = './build/';
const destFile = 'regular/build.js';
const destFileMinified = 'min/build.js';
const allSourceFiles = ['./src/**/!(gui).js']; // include all .js file except gui scripts
const manifestTemplate = './manifest.json';

// get browserify stream with common settings
function getBrowserify() {
    return browserify({
        debug: true,
        entries: [sourceFolder + sourceFile]
    })
    .transform("babelify", {presets: ["es2015"]});
}

// one time compilation of ECMA files into pure js
gulp.task('browserify', function () {
    return getBrowserify()
        .bundle()
        .pipe(source(destFile))
        .pipe(gulp.dest(destFolder));
});

// additional minification of built javascript files
gulp.task('uglify', ['browserify'], function () {
    return gulp.src(destFolder + destFile)
        .pipe(rename(destFileMinified))
        .pipe(uglify({mangle: { keep_fnames: true} }))
        .pipe(gulp.dest(destFolder));
});

// additional minification of built javascript files
gulp.task('buildManifest', function () {
    return gulp.src(manifestTemplate)
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest(destFolder + 'regular'))
        .pipe(gulp.dest(destFolder + 'min'));
});

gulp.task('buildGui', function () {
    return gulp.src(sourceFolder + 'gui/**/*', { base: sourceFolder })
        .pipe(gulp.dest(destFolder + 'regular'))
        .pipe(gulp.dest(destFolder + 'min'));
});

//
gulp.task('buildStats', function () {
    // uncomment showFiles option to see all file sizes separately
    const sizeClean = size(/*{showFiles: true}*/);
    const sizeBuild = size(/*{showFiles: true}*/);
    const sizeBuildMinified = size(/*{showFiles: true}*/);
    var cleanFilesCount = 0;

    const build = gulp.src(destFolder + destFile)
        .pipe(sizeBuild);

    const buildMinified = gulp.src(destFolder + destFileMinified)
        .pipe(sizeBuildMinified);

    const cleanProject = gulp.src(allSourceFiles)
        .on('data', function() {
            cleanFilesCount++;
        })
        .pipe(sizeClean)

    // wait for streams to finish and print some useful information
    return mergeStream(cleanProject, build, buildMinified).on('end', function () {
        gutil.log('Clean project has ' + cleanFilesCount + ' files with total size ' + sizeClean.prettySize);
        if (sizeBuild.size) {
            gutil.log('Build size is ' + sizeBuild.prettySize + ' (' + parseInt(sizeBuild.size / sizeClean.size * 100) + '% of original size)');
        } else {
            gutil.log('Build not yet done');
        }

        if (sizeBuildMinified.size) {
            gutil.log('Build size after minification is ' + sizeBuildMinified.prettySize + ' (' + parseInt(sizeBuildMinified.size / sizeClean.size * 100) + '% of original size and ' + parseInt(sizeBuildMinified.size / sizeBuild.size * 100) + '% of build size)');
        } else {
            gutil.log('Build minification not yet done');
        }
    });
});

// recompile ECMA to js after some file changed (main task during development)
gulp.task('browserifyWatch', function () {
    const bundler = watchify(getBrowserify());
    bundler.plugin(errorify, {/* replacer: function (error) { return 'custom error handler: ' + error; } */});
    bundler.on('update', rebundle);

    function rebundle() {
        gutil.log('browserifyWatch - rebundling');
        return bundler.bundle()
            .pipe(source(destFile))
            .pipe(gulp.dest(destFolder));
            /* usefull?
            .on('end', function () {
                gulp.start('buildManifest');
            });
            */
    }

    return rebundle();
});


gulp.task('clean', function () {
    del([destFolder + '**/*']);
});

// default task: create full build
gulp.task('default', ['uglify', 'buildManifest', 'buildGui'], function () {
    // after build is done, print stats
    gulp.start('buildStats');
});

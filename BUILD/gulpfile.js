var gulp         = require('gulp'),
    gutil        = require('gulp-util'),
    cache        = require('gulp-cached'),
    watch        = require('gulp-watch'),
    webserver    = require('gulp-webserver'),
    rollup       = require('gulp-rollup'),

    sourcemaps   = require('gulp-sourcemaps'),
    sass         = require('gulp-sass'),
    cssGlobbing  = require('gulp-css-globbing'),
    combineMq    = require('gulp-combine-mq'),
    autoprefixer = require('gulp-autoprefixer'),
    cssshrink    = require('gulp-cssshrink'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    htmlmin      = require('gulp-htmlmin'),
    concat       = require('gulp-concat'),
    babel        = require('gulp-babel'),
    eslint       = require('gulp-eslint'),
    fc2modules   = require('gulp-file-contents-to-modules'),
    stripDebug   = require('gulp-strip-debug'),
    shell        = require('gulp-shell'),
    spritesmith  = require('gulp.spritesmith'),
    path         = require('path'),
    fs           = require('fs'),
    es           = require('event-stream'),
    insert       = require('gulp-insert');

var config = {
        namespace : 'ToDoApp',
        server : {
            // livereload: true,
            // directoryListing: true,
            host : 'localhost',
            port : 3210,
            fallback : 'index.html',
            path : '/',
            open: true
        },
        production: false
    },
    lastSpriteStream;


//////////////////////////
// SPA webserver
gulp.task('webserver', function() {
    gulp.src('../')
        .pipe(
            webserver(config.server)
        );
});

//////////////////////////
// Compile SCSS to CSS

gulp.task('scss', function() {
    gulp.src('css/dist/*.scss')
        .pipe(cssGlobbing({
            extensions: '.scss'
        }))
        .pipe(
            sass() // { errLogToConsole: true }
            // don't break on SCSS Errors:
            // https://github.com/dlmanning/gulp-sass/pull/293
            // https://github.com/gulpjs/gulp/issues/259
            .on('error', sass.logError)
        )
        .pipe(combineMq()) // combine media queries
        .pipe(autoprefixer())
        .pipe(gulp.dest('../css'))
        //.pipe(rename({suffix: '.min'}))

    if (config.production)
        gulp.task('compress');
});


//////////////////////////
// ICOMOON (generate icons and font files from JSON)
gulp.task('icomoon', '');
//gulp.task('icomoon', shell.task(['icomoon-build -p ./fonts/selection.json --scss-with-map ./css/dist/_icomoon_output.scss --fonts ../fonts/']));


//////////////////////////
// SPRITES GENERATOR

function getFolders(dir) {
    return fs.readdirSync(dir).filter(function(file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
}

gulp.task('spriteLoop', function() {
    return; // temporarily disabled

    var folders = getFolders('images/sprite');
    fs.truncate('./css/dist/_sprite.scss', 0, function() {
        console.log('emptied "_sprite.scss" file')
    });

    var tasks = folders.map(function(folder) {
        fs.readFile(path.join('images/sprite', folder, '/sprite.json'), 'utf8', function(err, data) {
            if (err) throw err;

            var data = JSON.parse(data);

            data && makeSprite(data, folder);
        });
    });
});



function makeSprite(settings, folder) {
    if (!settings) return;

    var path_images = '../images/sprite/';

    // modify settings
    settings.cssName = settings.cssName || "_sprite.scss";
    settings.imgName = folder + '.' + settings.type;
    settings.imgPath = folder + '.' + settings.type;

    if (settings.imgPath)
        settings.imgPath = '.' + path_images + settings.imgPath;


    settings.cssOpts = {
        cssClass: function(item) {
            console.log('.sprite-' + item.name);
            return '.sprite-' + item.name;
        }
    };

    // Generate sprite
    var spriteData = gulp.src(path_images + folder + '/*.' + settings.type).pipe(spritesmith(settings));
    // join this CSS stream to the last stream
    lastSpriteStream = lastSpriteStream ? es.merge(lastSpriteStream, spriteData.css) : spriteData.css;

    spriteData.img
        .pipe(gulp.dest(path_images))

    return lastSpriteStream
        .pipe(concat('_sprite.scss'))
        .pipe(gulp.dest('./css/dist'));
};




//////////////////////
// TEMPLATES - Convert template files into one javascript file with ES6 esports (per template file)

gulp.task('templates', function() {
    gulp.src('./templates/**/*.html')
        .pipe(fc2modules('templates.js'))
        //.pipe(insert.prepend(config.namespace + '.templates = '))
        //.pipe(insert.append(';'))
        .pipe(gulp.dest('./js/dist/auto-generated/'));
});


//////////////////////
// SCRIPTS

// JS concat, strip debugging and minify
gulp.task('concatJS', function() {
    gulp.src('./js/concatenated/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('../js/'))

    if (config.production)
        gulp.task('compress');
});


gulp.task('combineControllers', function() {
    // combine all page controllers
    gulp.src('./js/dist/pages/**/*.js')
        .pipe(concat('controllers_bundle.js'))
        .pipe(gulp.dest('./js/dist/auto-generated'))
});

gulp.task('bundleJS', function() {
    fs.truncate('../js/ToDoApp.js', 0, function() {
        console.log('emptied "ToDoApp.js" file')
    });

    gulp.src('js/dist/app.js', {read: false})
        //.pipe(rollup({format: 'amd'}))
        .pipe(rollup({
            format : 'umd',
            moduleId: config.namespace
           // exports : 'named', // doesn't work
        }))
        //.pipe(babel().on('error', function(err){ console.log(err.message) }))
        .pipe(concat( config.namespace + '.js'))

        .pipe(gulp.dest('../js/'))
});


// build App scripts
// DEPRECATED
gulp.task('buildJS', function() {
    var src = [
        './js/dist/app.js',
        './js/dist/templates.js',
        './js/dist/config.js',
        './js/dist/utilities.js',
        './js/dist/components/**/*.js',
        './js/dist/pages/**/*.js',
        './js/dist/modals/*.js',
    ];

    if (!config.production)
        src.push('./js/dist/DEV.js');

    // Add the "init.js" file at the end
    src.push('./js/dist/init.js');

    gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(concat( config.namespace + '.js'))
        .pipe(babel({
                modules : 'umd',
                moduleIds : 'XXX'
            }).on('error', function(err){ console.log(err.message) }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('../js/'))


    if( config.production )
        gulp.task('compress');
});


gulp.task('build_vendor_JS', function() {
    gulp.src('./js/vendor/*.js')
        .pipe(gulp.dest('../js/vendor'))
});






//////////////////////////////////////////

gulp.task('tests', function(){
    gulp.src('./tests/dist/*.js', {read: false})
        .pipe(rollup({
            format : 'umd'
        }))
        .pipe(babel({
            presets: ['es2015']
        }).on('error', function(err){ console.log(err.message) }))

        .pipe(gulp.dest('./tests/'))


    // gulp.src('./tests/dist/*.js')
    //     .pipe(babel({
    //         presets: ['es2015']
    //     }).on('error', function(err){ console.log(err.message) }))
    //     .pipe(gulp.dest('./tests/'))
});

gulp.task('tests-lint', function () {
    return gulp.src(['./tests/dist/*.js'])
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(cache('tests-linting'))
        .pipe(eslint({
            rulePaths: [],
            rules: {
                'strict': 0,
            },
            ecmaFeatures : {
                modules: true
            },
            globals: {
                'jQuery':true,
                '$':true
            },
            baseConfig: {
                //parser: 'babel-eslint',
            },
            envs: [
                'browser', 'es6'
            ]
        }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});




//////////////////////////////
// PRODUCTION ONLY

gulp.task('compress', function() {
    gulp.src('../js/all.js')
        .pipe(stripDebug())
        .pipe(uglify({
            compress: {
                sequences: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true
            },
            mangle: true
        }))
        //.pipe(concat('all.js'))
        .pipe(gulp.dest('../js/'))

    gulp.src('../js/' + config.namespace + '.js')
        .pipe(stripDebug())
        .pipe(uglify({
            compress: {
                sequences: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true
            },
            mangle: true
        }))
        .pipe(gulp.dest('../js/'))

    gulp.src('../js/vendor/*.js')
        .pipe(uglify({
            compress: {
                sequences: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true
            },
            mangle: true
        }))
        .pipe(gulp.dest('../js/vendor'))

    gulp.src('../css/*.css')
        .pipe(cssshrink())
        .pipe(gulp.dest('../css/'))

    gulp.src('../css/vendor/*.css')
        //   .pipe(cssshrink())
        .pipe(gulp.dest('../css/vendor'))
});


gulp.task('lint', function () {
    return gulp.src(['./js/dist/*.js',
                    './js/dist/components/**/*.js',
                    './js/dist/modals/**/*.js',
                    './js/dist/pages/**/*.js',
                    './js/dist/utils/**/*.js'
                    ])
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(cache('linting'))
        .pipe(eslint({
            rulePaths: [
            ],
            rules: {
                'strict': 0,
            },
            ecmaFeatures : {
                modules: true
            },
            globals: {
                'jQuery':true,
                '$':true
            },
            baseConfig: {
                //parser: 'babel-eslint',
            },
            envs: [
                'browser', 'es6'
            ]
        }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});


///////////////////////
// DEVELOPMENT ONLY
gulp.task('set-prod', function() {
    config.production = true;
});


gulp.task('prod', ['set-prod', 'default', 'compress']); // generate code for production-only

gulp.task('default', [ 'icomoon', 'scss', 'spriteLoop', 'templates', 'bundleJS', 'build_vendor_JS', 'lint', 'watch', 'webserver', 'tests']);

gulp.task('watch', function() {
    //    gulp.watch('./views/modals/*.html', ['modals']);
    //gulp.watch('./images/sprite/**/*.png', ['sprite']);
    gulp.watch('./css/dist/**/*.scss', ['scss']);
    // gulp.watch('./css/dist/voting/**/*.scss', ['voting_styles']); // voting system styles
    gulp.watch('./templates/**/*.html', ['templates', 'bundleJS']);
    //gulp.watch('./js/concatenated/*.js', ['concatJS']);
    gulp.watch(['./js/dist/pages/**/*.js'], ['combineControllers', 'bundleJS']);
    gulp.watch(['./js/dist/*.js', './js/dist/components/**/*.js', './js/dist/utils/*.js', './js/dist/vendor/**/*.js'], ['bundleJS', 'tests', 'lint']);
    gulp.watch('./js/vendor/**/*.js', ['build_vendor_JS']);
    gulp.watch('./fonts/selection.json', ['icomoon']);
    gulp.watch('./tests/dist/*.js', ['tests', 'tests-lint']);
    // Watch .js files
    //gulp.watch('src/scripts/**/*.js', ['scripts']);
});

/*
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
========================================
========================================
========================================
----------------------------------------
GULP FILE
----------------------------------------
*/

const autoprefixer = require('autoprefixer');
const clean = require('gulp-clean');
const csso = require('postcss-csso');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const { watch, series, parallel } = require('gulp');
const pkg = require('./node_modules/uswds/package.json');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uswds = require('./node_modules/uswds-gulp/config/uswds');
const fileInclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const server = require('browser-sync').create();

sass.compiler = require('sass');


/** Constants reference
 * routes      > PATHS
 * sass        > PROJECT_SASS_SRC
 * fonts       > FONTS_DEST
 * img         > IMG_DEST
 * js          > JS_DEST
 * css         > CSS_DEST
**/


/*
----------------------------------------
PATHS
----------------------------------------
- All paths are relative to the
  project root
- Don't use a trailing `/` for path
  names
----------------------------------------
*/


const PATHS = {
    root: {
        src: './',
        dest: './dist/',
    }
};

// Project Sass source directory
const PROJECT_SASS_SRC = 'assets/uswds/sass';

// Compiled CSS destination
const CSS_DEST = 'assets/uswds/css';

// Site CSS destination
// Like the _site/assets/css directory in Jekyll, if necessary.
// If using, uncomment line 168
const SITE_CSS_DEST = './path/to/site/css/destination';

// Fonts destination
const FONTS_DEST = 'assets/uswds/fonts';

// Images destination
const IMG_DEST = 'assets/uswds/img';

// JavaScript destination
const JS_DEST = 'assets/uswds/js';

// FSDP Compiled CSS destination
const FSDP_CSS_DEST = 'assets/fsdp/css';

// Font Awesome Scss destination
const FA_SASS_DEST = 'assets/fontawesome/scss';

// Font Awesome CSS destination
const FA_CSS_DEST = 'assets/fontawesome/css';

// Font Awesome Webfonts destination
const FA_WF_DEST = 'assets/fontawesome/webfonts';


/*
----------------------------------------
TASKS
----------------------------------------
*/

// USWDS SETUP
function getSetup() {
    return gulp
        .src(`${uswds}/scss/theme/**/**`)
        .pipe(
            gulp
                .dest(`${PROJECT_SASS_SRC}`)
        );
}

// USWDS FONTS
function getFonts() {
    return gulp
        .src(`${uswds}/fonts/**/**`)
        .pipe(
            gulp
                .dest(`${FONTS_DEST}`)
        );
}

// USWDS IMAGES
function getImages() {
    return gulp
        .src(`${uswds}/img/**/**`)
        .pipe(
            gulp
                .dest(`${IMG_DEST}`)
        );
}

// USWDS JS
function getScripts() {
    return gulp
        .src(`${uswds}/js/**/**`)
        .pipe(
            gulp
                .dest(`${JS_DEST}`)
        );
}

// FONT AWESOME SCSS
function getFAScss() {
    return gulp
        .src('node_modules/@fortawesome/fontawesome-free/scss/*.scss')
        // .pipe(sass())
        .pipe(gulp
            .dest(`${FA_SASS_DEST}`)
        );
}

// FONT AWESOME WEB FONTS
function getWebfonts() {
    return gulp
        .src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
        .pipe(gulp
            .dest(`${FA_WF_DEST}`)
        );
}

// Compile uswds scss then minify + combine css
function buildSass() {
    let plugins = [
        // Autoprefixer
        autoprefixer(
            {
                cascade: false,
                grid: true,
            }
        ),
        // Minify
        csso(
            {
                forceMediaMerge: false,
            }
        ),
    ];
    return gulp
        .src([`${PROJECT_SASS_SRC}/*.scss`])
        .pipe(sourcemaps.init(
            {
                largeFile: true,
            }
        ))
        .pipe(
            sass.sync(
                {
                    includePaths: [
                        `${PROJECT_SASS_SRC}`,
                        `${uswds}/scss`,
                        `${uswds}/scss/packages`,
                    ]
                }
            )
        )
        .pipe(replace(/\buswds @version\b/g, "based on uswds v" + pkg.version))
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write("."))
        // uncomment the next line if necessary for Jekyll to build properly
        //.pipe(gulp.dest(`${SITE_CSS_DEST}`))
        .pipe(
            gulp
                .dest(`${CSS_DEST}`)
        )
        .pipe(server.stream());
}

// Compile font awesome scss then minify + combine css
function compileScss() {
    return gulp
        .src([`${FA_SASS_DEST}/*.scss`])
        .pipe(sass())
        .pipe(gulp
            .dest(`${FA_CSS_DEST}`)
        );
}

// Compress uswds images => (JPEG, PNG, GIF, SVG, JPG)
function compressImages() {
    return gulp
        .src(`${uswds}/img/**/**`)
        .pipe(
            imagemin(
                [
                    imagemin.gifsicle(
                        {
                            interlaced: true,
                        }
                    ),
                    imagemin.mozjpeg(
                        {
                            quality: 75,
                            progressive: true,
                        }
                    ),
                    imagemin.optipng(
                        {
                            optimizationLevel: 5,
                        }
                    ),
                    imagemin.svgo(
                        {
                            plugins: [
                                {
                                    removeViewBox: true,
                                },
                                {
                                    cleanupIDs: false,
                                },
                            ],
                        }
                    ),
                ]
            )
        )
        .pipe(
            gulp
                .dest(`${IMG_DEST}`)
        );
}

// Compile fsdp scss then minify + combine css
function compileFSDPScss() {
    return gulp
        .src(
            [
                'assets/fsdp/sass/*.scss',
            ]
        )
        .pipe(sass())
        .pipe(gulp
            .dest(`${FSDP_CSS_DEST}`)
        )
        .pipe(server.stream());
}

// Compress fsdp images => (JPEG, PNG, GIF, SVG, JPG)
// Copy fsdp images from assets and plant in dist
function cloneCompressImages() {
    return gulp
        .src(
            [
                'assets/fsdp/img/**',
            ]
        )
        .pipe(
            imagemin(
                [
                    imagemin.gifsicle(
                        {
                            interlaced: true,
                        }
                    ),
                    imagemin.mozjpeg(
                        {
                            quality: 75,
                            progressive: true,
                        }
                    ),
                    imagemin.optipng(
                        {
                            optimizationLevel: 5,
                        }
                    ),
                    imagemin.svgo(
                        {
                            plugins: [
                                {
                                    removeViewBox: true,
                                },
                                {
                                    cleanupIDs: false,
                                },
                            ],
                        }
                    ),
                ]
            )
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/img')
        );
}

// Copy fsdp css from assets and plant in dist
async function cloneFSDPCss() {
    gulp
        .src(
            [
                'assets/fsdp/css/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/css')
        );
}

// Copy fsdp scripts from assets and plant in dist
async function cloneScripts() {
    gulp
        .src(
            [
                'assets/fsdp/js/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/js')
        );
}

// Copy uswds css from assets and plant in dist
async function cloneCssAssets() {
    gulp
        .src(
            [
                'assets/uswds/css/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/css')
        );
}

// Copy uswds fonts from assets and plant in dist
async function cloneFontsAssets() {
    gulp
        .src(
            [
                'assets/uswds/fonts/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/fonts')
        );
}

// Copy uswds images from assets and plant in dist
async function cloneImagesAssets() {
    gulp
        .src(
            [
                'assets/uswds/img/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/img')
        );
}

// Copy uswds js from assets and plant in dist
async function cloneScriptsAssets() {
    gulp
        .src(
            [
                'assets/uswds/js/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/js')
        );
}

// Copy font awesome css from assets and plant in dist
async function cloneFACss() {
    gulp
        .src(
            [
                'assets/fontawesome/css/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/css')
        );
}

// Copy font awesome webfonts from assets and plant in dist
async function cloneFAWebfonts() {
    gulp
        .src(
            [
                'assets/fontawesome/webfonts/**',
            ]
        )
        .pipe(
            gulp
                .dest(PATHS.root.dest + '/webfonts')
        );
}

// Include + minify html and plant in dist
async function includeAndMinifyHtml() {
    return gulp
        .src(
            [
                '*.html',
                'components[!banner.html, !header.html, !nav.html, !footer.html]',
            ],
        )
        .pipe(fileInclude(
            {
                prefix: '@@',
                basepath: '@file',
            }
        ))
        .pipe(htmlmin(
            {
                collapseWhitespace: true,
            }
        ))
        .pipe(
            gulp
                .dest(PATHS.root.dest)
        );
}

// Prepare all uswds src for production
async function construct() {
    await cloneCssAssets();
    await cloneFontsAssets();
    await cloneImagesAssets();
    await cloneScriptsAssets();
    await includeAndMinifyHtml();
}

// Prepare all font awesome src for production
async function constructFontAwesome() {
    await cloneFACss();
    await cloneFAWebfonts();
}

// Prepare all fsdp src for production
async function constructFSDP() {
    await cloneFSDPCss();
    await cloneCompressImages();
    await cloneScripts();
}

async function destroyBuild() {
    return gulp
        .src(PATHS.root.dest)
        .pipe(clean());
}

async function destroyAssets() {
    return gulp
        .src(['assets/uswds'])
        .pipe(clean());
}

// Reload server
async function reload() {
    server.reload();
}

// Build and reload server after the initial build
async function reloadServer() {
    await construct();
    reload();
}

// Watch all SASS when reload browser on change
async function observeSass() {
    watch(
        [
            `${PROJECT_SASS_SRC}/**/*.scss`,
            'assets/fsdp/sass/**/*.scss',
        ],
        parallel(
            buildSass,
            compileFSDPScss,
        )
    );
}

// Watch HTML when reload browser on change
async function observeHtml() {
    watch(['*.html', './components/*.html'], series(
        reloadServer,
        parallel(includeAndMinifyHtml),
    ));
}

// Watch assets when reload browser on change
async function observeAssets() {
    watch(['assets/uswds/**/*'], series(
        reloadServer,
        parallel(
            cloneCssAssets,
            cloneFontsAssets,
            cloneImagesAssets,
            cloneScriptsAssets,
        ),
    ));
}

// Watch build when reload browser on change
async function watchBuild() {
    await observeSass();
    await observeHtml();
    await observeAssets();
}

// Initialize assets
exports.init = series(
    getSetup,
    getFonts,
    getImages,
    getScripts,
    getFAScss,
    getWebfonts,
    parallel(
        buildSass,
        compileFSDPScss,
        compressImages,
    )
);

// Create dist folder and related files
exports.build = async function () {
    construct();
    constructFSDP();
    constructFontAwesome();
};

// Delete dist folder and related files
exports.clean = async function () {
    destroyBuild();
};

/*
------------------------------------------------------------------------------------------------------------------------
!!! IMPORTANT (Optional): Command `gulp destroy`
*   ==> DO NOT use `gulp destroy` once you make customizations to the uswds assets folder and files in the package.
*   ==> Already this package comes with some customizations.
*   ==> If used, it will wipe out all customizations made by deleting uswds assets folder and files.

!!! NOTE: Delete uswds assets folder and related files
*   ==> Use `gulp destroy` if wanted to delete uswds assets folder and files after `gulp init`.

!!! NOTE: Initialize and restore uswds assets folder and files
*   ==> To initialize and restore a fresh copy of uswds assets folder and files, use `gulp init` again.
------------------------------------------------------------------------------------------------------------------------
*/
exports.destroy = async function () {
    destroyAssets();
};

// Launch server and watch the build
exports.default = async function () {
    server.init(
        {
            server: {
                baseDir: PATHS.root.dest
            }
        }
    );

    watchBuild();
};
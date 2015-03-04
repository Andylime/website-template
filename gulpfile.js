// browser-sync?

"use strict";

var gulp = require('gulp'),
	coffee = require('gulp-coffee'),
	concatCss = require('gulp-concat-css'),
	concatJs = require('gulp-concat'),
	connect = require('gulp-connect'),
	imagemin = require('gulp-imagemin'),
	jade = require('gulp-jade'),
	livereload = require('gulp-livereload'),
	minifyCSS = require('gulp-minify-css'),
	minifyHTML = require('gulp-minify-html'),
	newer = require('gulp-newer'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),
	pngquant = require('imagemin-pngquant'),
	prefixer = require('gulp-autoprefixer'),
	rename = require("gulp-rename"),
	stylus = require('gulp-stylus'),
	uglify = require('gulp-uglify'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	wiredep = require('wiredep').stream;

// custom variables.
///////////////////////////////////////////////////////////////////////////////////////////////

var paths = {
	"dev": {
		"html": "app/",
		"css": "app/styles/",
		"js": "app/scripts/",
		"vendor": "app/bower_components/",
		"stylus": "app/stylus/",
		"jade": "app/jade/",
		"coffee": "app/coffee/",
		"images": "app/images/",
		"fonts": "app/fonts/"
	},
	"production": {
		"html": "public/",
		"css": "public/styles/",
		"js": "public/scripts/",
		"images": "public/images/",
		"fonts": "public/fonts/"
	},
	"temp": {
		"jade": "temp/jade/",
		"stylus": "temp/stylus/",
		"coffee": "temp/coffee/"
	}
};

// custom tasks.
///////////////////////////////////////////////////////////////////////////////////////////////

// =html
	gulp.task('html', ['jade'], function(){
		return gulp.src(paths.dev.html + "*.html")
			.pipe(plumber())
			.pipe(minifyHTML({
				empty: true,
				conditionals: true,
				spare:true
			}))
			.pipe(gulp.dest(paths.production.html))
			.pipe(connect.reload());
	});

// =jade
	gulp.task('jade', function(){
		return gulp.src(paths.dev.jade + "**/*.jade")
			.pipe(plumber())
			.pipe(jade({ pretty: true }))
			.pipe(gulp.dest(paths.dev.html))
			.pipe(gulp.dest(paths.temp.jade));
	});

// =bower
	gulp.task('bower', ['jade'], function(){
		var assets = useref.assets();
		return gulp.src(paths.dev.html + "*.html")
			.pipe(plumber())
			.pipe(wiredep({
				directory: paths.dev.vendor
			}))
			.pipe(assets)
			.pipe(assets.restore())
			.pipe(useref())
			.pipe(minifyHTML({
				empty: true,
				conditionals: true,
				spare:true
			}))
			.pipe(gulp.dest(paths.production.html))
			.pipe(connect.reload());
	});

// =css
	gulp.task('css', ['stylust'], function(){
		return gulp.src([paths.dev.css + "**/*.css", paths.temp.stylus + "**/*.css"])
			.pipe(plumber())
			.pipe(concatCss("bundle.css"))
			.pipe(prefixer({
				browsers: ['last 15 versions'],
				cascade: true
			}))
			.pipe(gulp.dest(paths.production.css))
			.pipe(rename({ suffix: ".min" }))
			.pipe(minifyCSS(""))
			.pipe(gulp.dest(paths.production.css))
			.pipe(connect.reload());
	});

// =stylus
	gulp.task('stylust', function(){
		return gulp.src(paths.dev.stylus + "**/*.styl")
			.pipe(plumber())
			.pipe(stylus())
			.pipe(gulp.dest(paths.temp.stylus));
	});

// =javascript
	gulp.task("javascr", ['coffee'], function(){
		return gulp.src([paths.dev.js + "**/*.js", paths.temp.coffee + "**/*.js"])
			.pipe(plumber())
			.pipe(concatJs("bundle.js", {newLine: ';'}))
			.pipe(gulp.dest(paths.production.js))
			.pipe(uglify())
			.pipe(rename({ suffix: ".min" }))
			.pipe(gulp.dest(paths.production.js))
			.pipe(connect.reload());
	});

// =coffee
	gulp.task("coffee", function(){
		return gulp.src(paths.dev.coffee + "**/*.coffee")
			.pipe(plumber())
			.pipe(coffee())
			.pipe(gulp.dest(paths.temp.coffee));
	});

// =images
	gulp.task("image", function(){
		return gulp.src(paths.dev.images + "**/*")
			.pipe(plumber())
			.pipe(newer("dist/imgs"))
			.pipe(imagemin({
				optimizationLevel: 5,
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant({
					quality: "65-80"
				})]
			}))
			.pipe(gulp.dest(paths.production.images));
	});

// =fonts
	gulp.task("fonts", function(){
		return gulp.src(paths.dev.fonts + "**/*!(.mdt)")
			.pipe(plumber())
			.pipe(newer(paths.production.fonts))
			.pipe(gulp.dest(paths.production.fonts));
	});

// =connect
	gulp.task('connect', function() {
		connect.server({
			root: paths.production.html,
			port: 9000,
			livereload: true
		});
	});

// =watch
	gulp.task('watch', function(){
		gulp.watch(paths.dev.css + "**/*.css", ["css"]);
		gulp.watch(paths.dev.stylus + "**/*.styl", ["css"]);
		gulp.watch(paths.dev.html + "*.html", ["html"]);
		gulp.watch(paths.dev.jade + "**/*.jade", ["html"]);
		gulp.watch("bower.json", ["bower"]);
		gulp.watch(paths.dev.js + "**/*.js", ["javascr"]);
		gulp.watch(paths.dev.coffee + "**/*.coffee", ["javascr"]);
		gulp.watch(paths.dev.images + "**/*", ["image"]);
		gulp.watch(paths.dev.fonts + "**/*", ["fonts"]);
	});

// =default
		gulp.task('default', ['bower', 'css', 'javascr', 'image', 'fonts', 'connect', 'watch']);
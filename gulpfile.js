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
	clean = require('gulp-clean'),
	merge = require('merge-stream'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	gulpFilter = require('gulp-filter'),
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
		"coffee": "temp/coffee/",
		"build": {
			"css": "temp/.building/css/",
			"js": "temp/.building/js/"
		}
	}
};

// custom tasks.
///////////////////////////////////////////////////////////////////////////////////////////////

// =html
	gulp.task('html', ['jade'], function(){
		var assets = useref.assets();
		return gulp.src(paths.dev.html + "*.html")
			.pipe(plumber())
			.pipe(newer(paths.production.html))
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

// =jade
	gulp.task('jade', function(){
		return gulp.src(paths.dev.jade + "*.jade")
			.pipe(plumber())
			.pipe(newer({
				dest: paths.temp.jade,
				ext: ".html"
			}))
			.pipe(jade({
				pretty: true
			}))
			.pipe(gulp.dest(paths.dev.html))
			.pipe(gulp.dest(paths.temp.jade));
	});

// =bower
	gulp.task('bower', function(){
		return gulp.src(paths.dev.html + "*.html")
			.pipe(plumber())
			.pipe(wiredep({
				directory: paths.dev.vendor
			}))
			.pipe(gulp.dest(paths.dev.html));
	});

// =clean_css
	gulp.task('clean_css', ['css'], function(){
		gulp.src(paths.temp.build.css, { read: false })
			.pipe(clean());
	});

// =css
	gulp.task('css', ['stylust'], function(){
			return merge(
				gulp.src(paths.dev.css + "**/*.css"),
				gulp.src(paths.temp.stylus + "**/*.css"))
			.pipe(plumber())
			.pipe(gulp.dest(paths.temp.build.css))
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
		return gulp.src(paths.dev.stylus + "*.styl")
			.pipe(plumber())
			.pipe(newer({
				dest: paths.temp.stylus,
				ext: ".css"
			}))
			.pipe(stylus())
			.pipe(gulp.dest(paths.temp.stylus));
	});

// =clean_js
	gulp.task('clean_js', ['javascr'], function(){
		gulp.src(paths.temp.build.js, { read: false })
			.pipe(clean());
	});

// =javascript
	gulp.task("javascr", ['coffee'], function(){
		return merge(
				gulp.src(paths.dev.js + "**/*.js"),
				gulp.src(paths.temp.build.coffee + "**/*.coffee"))
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
		return gulp.src(paths.dev.coffee + "*.coffee")
			.pipe(plumber())
			.pipe(newer({
				dest: paths.temp.coffee,
				ext: ".js"
			}))
			.pipe(coffee())
			.pipe(gulp.dest(paths.temp.coffee));
	});

// =images
	gulp.task("image", function(){
		return gulp.src(paths.dev.images + "**/*")
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
		return gulp.src(paths.dev.fonts + "/**")
			.pipe(gulp.dest(paths.production.fonts));
	});

// =connect
	gulp.task('connect', function() {
		connect.server({
			root: paths.production.html,
			port: 1337,
			livereload: true
		});
	});

// =watch
	gulp.task('watch', function(){
		gulp.watch(paths.dev.css + "**/*.css", ["clean_css"]);
		gulp.watch(paths.dev.stylus + "**/*.styl", ["clean_css"]);
		gulp.watch(paths.dev.html + "*.html", ["html"]);
		gulp.watch(paths.dev.jade + "**/*.jade", ["html"]);
		gulp.watch("bower.json", ["bower", "html"]);
		gulp.watch(paths.dev.js + "**/*.js", ["clean_js"]);
		gulp.watch(paths.dev.coffee + "**/*.coffee", ["clean_js"]);
		gulp.watch(paths.dev.images + "**/*", ["image"]);
		gulp.watch(paths.dev.fonts + "**", ["fonts"]);
	});

// =default
		gulp.task('default', ['bower', 'html', 'clean_css', 'clean_js', 'image', 'fonts', 'connect', 'watch']);
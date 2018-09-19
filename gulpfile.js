'use strict'

let
	project =     require('./package.json'),
	gulp =        require('gulp'),
	tube =        require('gulp-pipe'),
	rename =      require('gulp-rename'),
	watch =       require('gulp-watch'),
	plumber =     require('gulp-plumber'),
	minifyJS =    require('gulp-babel-minify'),
	cleanCSS =    require('gulp-clean-css'),
	pug =         require('gulp-pug')

let sass = {
	compile:  require('gulp-sass'),
	watch:    require('gulp-watch-sass'),
	vars:     require('gulp-sass-vars')
}

let paths = {
	html: {
		dev: ['source/pug/**/*.pug', '!source/pug/inc/**/*.pug'],
		prod: 'build/'
	},
	js: {
		dev: 'source/js/**/*.js',
		prod: 'build/code/js/',
		kamina: 'node_modules/kamina-js/dist/*.min.js',
	},
	css: {
		dev: 'source/scss/**/*.scss',
		prod: 'build/code/css/'
	}
}

gulp.task('pug', () => tube([
	watch(paths.html.dev, { ignoreInitial: false }),
	plumber(),
	pug({ locals: { VERSION: project.version }}),
	gulp.dest(paths.html.prod)
]))

gulp.task('get-kamina', () => tube([
	gulp.src(paths.js.kamina),
	gulp.dest(paths.js.prod)
]))

gulp.task('minify-js', () => tube([
	watch(paths.js.dev, { ignoreInitial: false }),
	plumber(),
	minifyJS(),
	rename({suffix: '.min'}),
	gulp.dest(paths.js.prod)
]))

let scssTubes = [
	plumber(),
	sass.vars({ VERSION: project.version }),
	sass.compile({outputStyle: 'compressed'}),
	cleanCSS(),
	rename({suffix: '.min'}),
	gulp.dest(paths.css.prod)
]

gulp.task('scss:build', () => tube(
	[gulp.src(paths.css.dev)].concat(scssTubes)
))

gulp.task('scss:dev', () => tube(
	[sass.watch(paths.css.dev)].concat(scssTubes)
))

gulp.task('default', ['pug', 'get-kamina', 'minify-js', 'scss:dev'])

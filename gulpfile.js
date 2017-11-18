'use strict'

let
	project =     require('./package.json'),
	gulp =        require('gulp'),
	rename =      require('gulp-rename'),
	watch =       require('gulp-watch'),
	watch_sass =  require('gulp-watch-sass'),
	plumber =     require('gulp-plumber'),
	composer =    require('gulp-uglify/composer'),
	uglifyjs =    require('uglify-es'),
	sass =        require('gulp-sass'),
	sass_vars =   require('gulp-sass-variables'),
	csso =        require('gulp-csso'),
	pug =         require('gulp-pug')

let minify = composer(uglifyjs, console)

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

gulp.task('pug', () => gulp.src(paths.html.dev)
	.pipe(plumber())
	.pipe(watch(paths.html.dev))
  .pipe(pug({ locals: { VERSION: project.version } }))
	.pipe(gulp.dest(paths.html.prod))
)

gulp.task('get-kamina', () => gulp.src(paths.js.kamina)
	.pipe(gulp.dest(paths.js.prod))
)

gulp.task('minify-js', () => gulp.src(paths.js.dev)
	.pipe(plumber())
	.pipe(watch(paths.js.dev))
	.pipe(minify({}))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.js.prod))
)

gulp.task('scss', () => watch_sass(paths.css.dev)
	//gulp.src(paths.css.dev)
	.pipe(plumber())
	.pipe(sass_vars({ $VERSION: project.version }))
	.pipe(sass({outputStyle: 'compressed'}))
	.pipe(csso())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.css.prod))
)

gulp.task('default', gulp.parallel('pug', 'get-kamina', 'minify-js', 'scss'))

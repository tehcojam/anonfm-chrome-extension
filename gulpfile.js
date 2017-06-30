'use strict'

let
	gulp =      require('gulp'),
	bom =       require('gulp-bom'),
	rename =    require('gulp-rename'),
	watch =     require('gulp-watch'),
	plumber =   require('gulp-plumber'),
	composer =  require('gulp-uglify/composer'),
	uglifyjs =  require('uglify-es'),
	sass =      require('gulp-sass'),
	csso =      require('gulp-csso')

let minify = composer(uglifyjs, console)

let paths = {
	'js': {
		'dev': 'code/source/js/**/*.js',
		'prod': 'code/js/'
	},
	'kamina': 'node_modules/kamina-js/dist/*.min.js',
	'css': {
		'dev': 'code/source/scss/**/*.scss',
		'prod': 'code/css/'
	}
}

gulp.task('get-kamina', () => gulp.src(paths.kamina)
	.pipe(bom())
	.pipe(gulp.dest(paths.js.prod))
)

gulp.task('minify-js', () => gulp.src(paths.js.dev)
	.pipe(plumber())
	.pipe(watch(paths.js.dev))
	.pipe(minify({}))
	.pipe(rename({suffix: '.min'}))
	.pipe(bom())
	.pipe(gulp.dest(paths.js.prod))
)

gulp.task('scss', () => gulp.src(paths.css.dev)
	.pipe(plumber())
	.pipe(watch(paths.css.dev))
	.pipe(sass({outputStyle: 'compressed'}))
	.pipe(csso())
	.pipe(rename({suffix: '.min'}))
	.pipe(bom())
	.pipe(gulp.dest(paths.css.prod))
)

gulp.task('default', ['get-kamina', 'minify-js', 'scss'])
gulp.task('build', ['default'])

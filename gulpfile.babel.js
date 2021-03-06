import gulp from 'gulp';
import mocha from 'gulp-mocha';
import nodemon from 'gulp-nodemon';
import eslint from 'gulp-eslint';
import exit from 'gulp-exit';
import {} from 'babel-core/register';
import {} from 'babel-polyfill';

gulp.task('lint', () => {
	return gulp.src(['src/**/*.js'])
		.pipe(eslint({ useEslintrc: true }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('default', ['lint'], () => {
	nodemon({
		script: 'index.js',
		ext: 'js',
		env: { 'NODE_ENV': 'development' },
		execMap: {
			js: 'babel-node'
		}
	});
});

gulp.task('test', () => {
	return gulp
		.src('test/**/*.js')
		.pipe(mocha())
		.pipe(exit());
});

# gulp-ttf2eot [![NPM version](https://badge.fury.io/js/gulp-ttf2eot.png)](https://npmjs.org/package/gulp-ttf2eot) [![Build status](https://secure.travis-ci.org/nfroidure/gulp-ttf2eot.png)](https://travis-ci.org/nfroidure/gulp-ttf2eot)
> Create a EOT font from a TTF font with [Gulp](http://gulpjs.com/).

## Usage

First, install `gulp-ttf2eot` as a development dependency:

```shell
npm install --save-dev gulp-ttf2eot
```

Then, add it to your `gulpfile.js`:

```javascript
var ttf2eot = require('gulp-ttf2eot');

gulp.task('ttf2eot', function(){
  gulp.src(['fonts/*.ttf'])
    .pipe(ttf2eot())
    .pipe(gulp.dest('fonts/'));
});
```

## API

### ttf2eot(options)

#### options.ignoreExt
Type: `Boolean`
Default value: `false`

Set to true to also convert files that doesn't have the .ttf extension.

#### options.clone
Type: `Boolean`
Default value: `false`

Set to true to clone the file before converting him so that it will output the
 original file too.

### Contributing / Issues

Please submit TTF to EOT related issues to the
 [ttf2eot project](https://github.com/fontello/ttf2eot)
 on wich gulp-ttf2eot is built.

This repository issues is only for gulp and gulp tasks related issues.

You may want to contribute to this project, pull requests are welcome if you
 accept to publish under the MIT licence.

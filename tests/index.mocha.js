'use strict';

var gulp = require('gulp')
  , assert = require('assert')
  , es = require('event-stream')
  , fs = require('fs')
  , ttf2eot = require(__dirname + '/../src/index.js')
  , Stream = require('stream')
  , gutil = require('gulp-util')
;

// Erasing date to get an invariant created and modified font date
// See: https://github.com/fontello/ttf2eot/blob/c6de4bd45d50afc6217e150dbc69f1cd3280f8fe/lib/sfnt.js#L19
Date = (function(d) {
  function Date() {
    d.call(this, 3600);
  }
  Date.now = d.now;
  return Date;
})(Date);

describe('gulp-ttf2eot conversion', function() {
  var filename = __dirname + '/fixtures/iconsfont';
  var eot = fs.readFileSync(filename + '.eot');

  describe('with null contents', function() {

    it('should let null files pass through', function(done) {

        var s = ttf2eot()
          , n = 0;
        s.pipe(es.through(function(file) {
            assert.equal(file.path,'bibabelula.foo');
            assert.equal(file.contents, null);
            n++;
          }, function() {
            assert.equal(n,1);
            done();
          }));
        s.write(new gutil.File({
          path: 'bibabelula.foo',
          contents: null
        }));
        s.end();

    });

  });

  describe('in buffer mode', function() {
    it('should work', function(done) {

        var n = 0;
        gulp.src(filename + '.ttf')
          .pipe(ttf2eot())
          // Uncomment to regenerate the test files if changes in the ttf2eot lib
          // .pipe(gulp.dest(__dirname + '/fixtures/'))
          .pipe(es.through(function(file) {
            assert.equal(file.path, filename + '.eot');
            assert.equal(file.contents.length, eot.length);
            assert.equal(file.contents.toString('utf-8'), eot.toString('utf-8'));
            n++;
          }, function() {
            assert.equal(n,1);
            done();
          }));

    });

    it('should work with the clone option', function(done) {

        var n = 0;
        gulp.src(filename + '.ttf', {buffer: true})
          .pipe(ttf2eot({clone: true}))
          .pipe(es.through(function(file) {
            if(file.path === filename + '.eot') {
              assert.equal(file.contents.length, eot.length);
              assert.equal(file.contents.toString('utf-8'), eot.toString('utf-8'));
            } else {
              assert.equal(file.path, filename + '.ttf');
              assert.equal(file.contents.toString('utf-8'),
                fs.readFileSync(filename + '.ttf','utf-8'));
            }
            n++;
          }, function() {
            assert.equal(n,2);
            done();
          }));

    });

    it('should let non-ttf files pass through', function(done) {

        var s = ttf2eot()
          , n = 0;
        s.pipe(es.through(function(file) {
            assert.equal(file.path,'bibabelula.foo');
            assert.equal(file.contents.toString('utf-8'), 'ohyeah');
            n++;
          }, function() {
            assert.equal(n,1);
            done();
          }));
        s.write(new gutil.File({
          path: 'bibabelula.foo',
          contents: new Buffer('ohyeah')
        }));
        s.end();

    });

  });


  describe('in stream mode', function() {
    it('should work', function(done) {

        var n = 0;
        gulp.src(filename + '.ttf', {buffer: false})
          .pipe(ttf2eot())
          .pipe(es.through(function(file) {
            assert.equal(file.path, filename + '.eot');
            // Get the buffer to compare results
            file.contents.pipe(es.wait(function(err, data) {
              assert.equal(data.length, eot.toString('utf-8').length);
              assert.equal(data, eot.toString('utf-8'));
            }));
            n++;
          }, function() {
            assert.equal(n,1);
            done();
          }));

    });

    it('should work with the clone option', function(done) {

        var n = 0;
        gulp.src(filename + '.ttf', {buffer: false})
          .pipe(ttf2eot({clone: true}))
          .pipe(es.through(function(file) {
            if(file.path === filename + '.eot') {
              file.contents.pipe(es.wait(function(err, data) {
                assert.equal(data.length, eot.toString('utf-8').length);
                assert.equal(data, eot.toString('utf-8'));
              }));
            } else {
              assert.equal(file.path, filename + '.ttf');
              file.contents.pipe(es.wait(function(err, data) {
                assert.equal(data, fs.readFileSync(filename + '.ttf','utf-8'));
              }));
            }
            n++;
          }, function() {
            assert.equal(n,2);
            done();
          }));

    });

    it('should let non-ttf files pass through', function(done) {

        var s = ttf2eot()
          , n = 0;
        s.pipe(es.through(function(file) {
            assert.equal(file.path,'bibabelula.foo', {buffer: false});
            assert(file.contents instanceof Stream.PassThrough);
            n++;
          }, function() {
            assert.equal(n,1);
            done();
          }));
        s.write(new gutil.File({
          path: 'bibabelula.foo',
          contents: new Stream.PassThrough()
        }));
        s.end();

    });
  });

});

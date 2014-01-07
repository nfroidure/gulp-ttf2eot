var PassThrough = require('stream').PassThrough
  , gutil = require('gulp-util')
  , BufferStreams = require('bufferstreams')
  , ttf2eot = require('ttf2eot')
;

const PLUGIN_NAME = 'gulp-ttf2eot';

// File level transform function
function ttf2eotTransform(opt) {
  // Return a callback function handling the buffered content
  return function(err, buf, cb) {

    // Handle any error
    if(err) {
      cb(new gutil.PluginError(PLUGIN_NAME, err, {showStack: true}));
    }

    // Use the buffered content
      try {
        buf = new Buffer(ttf2eot(new Uint8Array(buf)).buffer);
        cb(null, buf);
      } catch(err) {
        cb(new gutil.PluginError(PLUGIN_NAME, err, {showStack: true}));
      }

  };
}

// Plugin function
function ttf2eotGulp() {

  var stream = new PassThrough({objectMode: true});

  stream.on('data', function(file) {
    if(file.isNull()) return;
  
    file.path = gutil.replaceExtension(file.path, ".eot");

    // Buffers
    if(file.isBuffer()) {
      try {
        file.contents = new Buffer(ttf2eot(
          new Uint8Array(file.contents)
        ).buffer);
      } catch(err) {
        stream.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {
          showStack: true
        }));
      }

    // Streams
    } else {
      file.contents = file.contents.pipe(new BufferStreams(ttf2eotTransform()));
    }

  });

  return stream;

};

// Export the file level transform function for other plugins usage
ttf2eotGulp.fileTransform = ttf2eotTransform;

// Export the plugin main function
module.exports = ttf2eotGulp;


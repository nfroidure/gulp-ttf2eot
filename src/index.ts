import { extname } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { BufferStream } from 'bufferstreams';
import type Vinyl from 'vinyl';
import ttf2eot from 'ttf2eot';
import PluginError from 'plugin-error';
import replaceExtension from 'replace-ext';
import cloneable from 'cloneable-readable';

export type GulpTTF2EOTOptions = {
  ignoreExt?: boolean;
  clone?: boolean;
};

const PLUGIN_NAME = 'gulp-ttf2eot';

// File level transform function
function ttf2eotTransform() {
  // Return a callback function handling the buffered content
  return function ttf2eotTransformCb(
    err: Error | null,
    buf: Buffer,
    cb: (err: Error | null, buf?: Buffer) => void,
  ) {
    // Handle any error
    if (err) {
      return cb(new PluginError(PLUGIN_NAME, err, { showStack: true }));
    }

    // Use the buffered content
    try {
      buf = Buffer.from(ttf2eot(new Uint8Array(buf)));
      return cb(null, buf);
    } catch (err2) {
      return cb(
        new PluginError(PLUGIN_NAME, err2 as Error, { showStack: true }),
      );
    }
  };
}

// Plugin function
function ttf2eotGulp(options?: GulpTTF2EOTOptions) {
  const stream = new Transform({ objectMode: true });

  options = options || {};
  options.ignoreExt = options.ignoreExt || false;
  options.clone = options.clone || false;

  stream._transform = function ttf2eotTransformStream(file: Vinyl, _, done) {
    // When null just pass through
    if (file.isNull() || file.isDirectory()) {
      stream.push(file);
      done();
      return;
    }

    // If the ext doesn't match, pass it through
    if (!options.ignoreExt && '.ttf' !== extname(file.path)) {
      stream.push(file);
      done();
      return;
    }

    if (options.clone) {
      stream.push(file.clone());
    }

    file.path = replaceExtension(file.path, '.eot');

    // Buffers
    if (file.isBuffer()) {
      try {
        file.contents = Buffer.from(ttf2eot(new Uint8Array(file.contents)));
      } catch (err) {
        stream.emit(
          'error',
          new PluginError(PLUGIN_NAME, err as Error, {
            showStack: true,
          }),
        );
      }

      // Streams
    } else {
      file.contents = cloneable(
        (file.contents as Readable).pipe(new BufferStream(ttf2eotTransform())),
      );
    }

    stream.push(file);
    done();
  };

  return stream;
}

// Export the file level transform function for other plugins usage
ttf2eotGulp.fileTransform = ttf2eotTransform;

// Export the plugin main function
export default ttf2eotGulp;

import { describe, test, expect } from '@jest/globals';
import { Readable, PassThrough } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import gulp from 'gulp';
import Vinyl from 'vinyl';
import StreamTest from 'streamtest';
import ttf2eot from '../index.js';

const filename = join('src', 'tests', 'fixtures', 'iconsfont');
const eot = await readFile(filename + '.eot');

describe('gulp-ttf2eot conversion', () => {
  describe('with null contents', () => {
    test('should let null files pass through', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      StreamTest.fromObjects([
        new Vinyl({
          path: 'bibabelula.foo',
          contents: null,
        }),
      ])
        .pipe(ttf2eot())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain('bibabelula.foo');
      expect(objs[0].contents).toEqual(null);
    });
  });

  describe('in buffer mode', () => {
    test('should work', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulp
        .src(filename + '.ttf', {
          buffer: true,
          encoding: false,
          removeBOM: false,
        })
        .pipe(ttf2eot())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain(filename + '.eot');
      expect(objs[0].contents).toEqual(eot);
    });

    test('should work with the clone option', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulp
        .src(filename + '.ttf', {
          buffer: true,
          encoding: false,
          removeBOM: false,
        })
        .pipe(ttf2eot({ clone: true }))
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(2);
      expect(objs[0].path).toContain(filename + '.ttf');
      expect(objs[0].contents).toEqual(await readFile(filename + '.ttf'));
      expect(objs[1].path).toContain(filename + '.eot');
      expect(objs[1].contents).toEqual(eot);
    });

    test('should let non-ttf files pass through', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      StreamTest.fromObjects([
        new Vinyl({
          path: 'bibabelula.foo',
          contents: Buffer.from('ohyeah'),
        }),
      ])
        .pipe(ttf2eot())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain('bibabelula.foo');
      expect((objs[0].contents as Buffer).toString('utf-8')).toEqual('ohyeah');
    });
  });

  describe('in stream mode', () => {
    test('should work', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      gulp
        .src(filename + '.ttf', {
          buffer: false,
          encoding: false,
          removeBOM: false,
        })
        .pipe(ttf2eot())
        .pipe(stream);

      const objs = await result;
      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain(filename + '.eot');
      (objs[0].contents as Readable).pipe(contentStream1);
      expect(Buffer.concat(await contentResult1)).toEqual(eot);
    });

    test('should work with the clone option', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();
      const [contentStream2, contentResult2] = StreamTest.toChunks();

      gulp
        .src(filename + '.ttf', {
          buffer: false,
          encoding: false,
          removeBOM: false,
        })
        .pipe(ttf2eot({ clone: true }))
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(2);
      expect(objs[0].path).toContain(filename + '.ttf');
      expect(objs[1].path).toContain(filename + '.eot');
      (objs[0].contents as Readable).pipe(contentStream1);
      expect(Buffer.concat(await contentResult1)).toEqual(
        await readFile(filename + '.ttf'),
      );
      (objs[1].contents as Readable).pipe(contentStream2);
      expect(Buffer.concat(await contentResult2)).toEqual(eot);
    });

    test('should let non-ttf files pass through', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      StreamTest.fromObjects([
        new Vinyl({
          path: 'bibabelula.foo',
          contents: new PassThrough(),
        }),
      ])
        .pipe(ttf2eot())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain('bibabelula.foo');
      expect(objs[0].contents instanceof Readable).toBeTruthy();
    });
  });
});

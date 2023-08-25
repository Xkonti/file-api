import {expect, test} from 'bun:test';
import {dir1path, emptyFilePath, illegalPaths, loremFilePath} from '../testing/testingUtils.test';
import {isPathValid} from './pathUtils';

test('should return true when path is valid', () => {
  const validPaths = [
    'a',
    'a/b',
    'a/b/c',
    'a/b/c/d.png',
    './',
    './a',
    './a/b.jpg',
    loremFilePath,
    emptyFilePath,
    dir1path,
  ];

  for (const validPath of validPaths) {
    expect(isPathValid(validPath)).toBe(true);
  }
});

test('should return false when path is null', () => {
  expect(isPathValid(null)).toBe(false);
});

test('should return false when path is undefined', () => {
  expect(isPathValid(undefined)).toBe(false);
});

test('should return false when path is invalid', () => {
  for (const illegalPath of illegalPaths) {
    expect(isPathValid(illegalPath)).toBe(false);
  }
});

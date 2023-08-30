import {beforeEach, describe, expect, test} from 'bun:test';
import {isPathValid, validateRelativePath} from './pathUtils';
import {getConfig, setConfig} from './config';
import assert from 'assert';
import {join} from 'path';
import {illegalPaths} from '../testing/constants';

beforeEach(() => {
  // Update config
  setConfig({
    apiKey: 'test',
    dataDir: './',
  });
});

describe('isPathValid', () => {
  test('should return true when path is valid', () => {
    const validPaths = ['a', 'a/b', 'a/b/c', 'a/b/c/d.png', './', './a', './a/b.jpg'];

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
});

describe('validateRelativePath', () => {
  test('should return an error when path is null', () => {
    expect(validateRelativePath(null).isErr()).toBe(true);
  });

  test('should return an error when path is undefined', () => {
    expect(validateRelativePath(undefined).isErr()).toBe(true);
  });

  test('should return an error when path is invalid', () => {
    for (const illegalPath of illegalPaths) {
      expect(validateRelativePath(illegalPath).isErr()).toBe(true);
    }
  });

  test('should return a path data object when path is valid', () => {
    const validPaths = ['a', 'a/b', 'a/b/c', 'a/b/c/d.png', './', './a', './a/b.jpg'];

    for (const validPath of validPaths) {
      const result = validateRelativePath(validPath);
      expect(result.isOk()).toBe(true);
      assert(result.isOk());
      const {relativePath, absolutePath} = result.value;
      expect(relativePath).toBe(validPath);
      expect(absolutePath).toBe(join(getConfig().dataDir, validPath));
    }
  });
});

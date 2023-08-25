import {describe, expect, test} from 'bun:test';
import {
  dir1path,
  emptyFilePath,
  loremFileContents,
  loremFilePath,
  pathToNowhere,
} from '../testing/testingUtils.test';
import {getFile} from './fileUtils';

describe('getFile()', () => {
  test('should return a file reference if the file is found', async () => {
    const file = await getFile(loremFilePath);
    expect(file).not.toBeNull();
    expect(file?.size).toBe(loremFileContents.length);
    const contents = await file?.text();
    expect(contents).toBe(loremFileContents);
  });

  test('should return null if the file is not found', async () => {
    const file = await getFile(pathToNowhere);
    expect(file).toBeNull();
  });

  test('should return null if the path is not pointing to a file', async () => {
    const file = await getFile(dir1path);
    expect(file).toBeNull();
  });

  test('should return a file even if empty', async () => {
    const file = await getFile(emptyFilePath);
    expect(file).not.toBeNull();
    expect(file?.size).toBe(0);
    const contents = await file?.text();
    expect(contents).toBe('');
  });
});

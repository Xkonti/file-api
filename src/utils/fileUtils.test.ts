import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import {getFile} from './fileUtils';
import {createTestFileSystem, destroyTestFileSystem} from '../testing/testFileSystem';
import {fs1Files, fs1TestDirectoryContents, testDirectory} from '../testing/constants';

describe('getFile()', () => {
  const files = fs1Files;
  const filesList = Object.values(files);
  const testDirectoryContents = fs1TestDirectoryContents;

  beforeEach(async () => {
    await createTestFileSystem(testDirectoryContents);
  });

  afterEach(async () => {
    await destroyTestFileSystem();
  });

  test('should return a file reference if the file is found', async () => {
    for (const fileDef of filesList) {
      const file = await getFile(fileDef.absolutePath);
      expect(file).not.toBeNull();
      expect(file?.size).toBe(fileDef.contents.length);
      const contents = await file?.text();
      expect(contents).toBe(fileDef.contents);
    }
  });

  test('should return null if the file is not found', async () => {
    const file = await getFile('path/to/nowhere');
    expect(await getFile('/path/to/nowhere')).toBeNull();
    expect(await getFile('error.log')).toBeNull();
  });

  test('should return null if the path is not pointing to a file', async () => {
    expect(await getFile('/TerryPratchett')).toBeNull();
    expect(await getFile('TerryPratchett')).toBeNull();
    expect(await getFile('/')).toBeNull();
    expect(await getFile('FrankHerbert')).toBeNull();
    expect(await getFile('/FrankHerbert')).toBeNull();
  });

  test('should return a file even if empty', async () => {
    const file = await getFile(files.emptiness.absolutePath);
    expect(file).not.toBeNull();
    expect(file?.size).toBe(0);
    const contents = await file?.text();
    expect(contents).toBe('');
  });
});

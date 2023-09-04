import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import {getFile, writeFile} from './fileUtils';
import {createTestFileSystem, destroyTestFileSystem} from '../testing/testFileSystem';
import {fs1Files, fs1TestDirectoryContents, testDirectory} from '../testing/constants';
import {join} from 'path';
import assert from 'assert';
import {getPermutations} from '../testing/testingUtils.test';

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

describe('writeFile()', () => {
  const files = fs1Files;
  const filesList = Object.values(files);
  const testDirectoryContents = fs1TestDirectoryContents;

  beforeEach(async () => {
    await createTestFileSystem(testDirectoryContents);
  });

  afterEach(async () => {
    await destroyTestFileSystem();
  });

  test.each(
    getPermutations(
      [
        {
          absolutePath: join(testDirectory, '/.newFile.txt'),
          contents: 'This is a new file.',
        },
        {
          absolutePath: join(testDirectory, 'TerryPratchett/no-extension-file'),
          contents: '123654789987654321',
        },
      ],
      [false, true],
    ),
  )('should write a new file to the file system', async (fileToWrite, overwrite) => {
    const result = await writeFile(
      fileToWrite.absolutePath,
      new Blob([fileToWrite.contents], {type: 'text/plain'}),
      overwrite,
    );
    expect(result.isOk()).toBe(true);
    assert(result.isOk());
    expect(result.value).toBe(true);
    const file = await getFile(fileToWrite.absolutePath);
    expect(file).not.toBeNull();
    expect(file?.size).toBe(fileToWrite.contents.length);
    const contents = await file?.text();
    expect(contents).toBe(fileToWrite.contents);
  });

  test.each(getPermutations(filesList))(
    'should fail to overwrite a file if not forced',
    async fileToWrite => {
      const result = await writeFile(
        fileToWrite.absolutePath,
        new Blob(['bunch of nothing'], {type: 'text / plain'}),
        false,
      );
      expect(result.isErr()).toBe(true);

      // Check if the file is still intact
      const file = await getFile(fileToWrite.absolutePath);
      expect(file).not.toBeNull();
      expect(file?.size).toBe(fileToWrite.contents.length);
      const contents = await file?.text();
      expect(contents).toBe(fileToWrite.contents);
    },
  );

  test.each(getPermutations(filesList))('should overwrite a file if forced', async fileToWrite => {
    const newContents = 'bunch of nothing';
    const result = await writeFile(
      fileToWrite.absolutePath,
      new Blob([newContents], {type: 'text / plain'}),
      true, // <- overwrite
    );
    expect(result.isOk()).toBe(true);
    assert(result.isOk());
    expect(result.value).toBe(true);
    const file = await getFile(fileToWrite.absolutePath);
    expect(file).not.toBeNull();
    expect(file?.size).toBe(newContents.length);
    const contents = await file?.text();
    expect(contents).toBe(newContents);
  });

  test.each(
    getPermutations([join(testDirectory, 'TerryPratchett'), join(testDirectory, 'FrankHerbert')]),
  )('should refuse to write the same file as a directory name', async directory => {
    const result1 = await writeFile(
      directory,
      new Blob(['bunch of nothing'], {type: 'text / plain'}),
      false,
    );
    expect(result1.isErr()).toBe(true);
    // Check it's still a directory
    const file1 = await getFile(directory);
    expect(file1).toBeNull();
    // With overwrite
    const result2 = await writeFile(
      directory,
      new Blob(['bunch of nothing'], {type: 'text / plain'}),
      true,
    );
    expect(result2.isErr()).toBe(true);
    // Check it's still a directory
    const file2 = await getFile(directory);
    expect(file2).toBeNull();
  });

  test.each(
    getPermutations(
      [
        {
          absolutePath: join(testDirectory, '/.newFile.txt'),
          contents: 'This is a new file.',
        },
        {
          absolutePath: join(testDirectory, 'TerryPratchett/no-extension-file'),
          contents: '123654789987654321',
        },
      ],
      [false, true],
    ),
  )('should create the directory if it does not exist', async (fileToWrite, overwrite) => {
    const result = await writeFile(
      fileToWrite.absolutePath,
      new Blob([fileToWrite.contents], {type: 'text/plain'}),
      overwrite,
    );
    expect(result.isOk()).toBe(true);
    assert(result.isOk());
    expect(result.value).toBe(true);
    const file = await getFile(fileToWrite.absolutePath);
    expect(file).not.toBeNull();
    expect(file?.size).toBe(fileToWrite.contents.length);
    const contents = await file?.text();
    expect(contents).toBe(fileToWrite.contents);
  });

  test.each(
    getPermutations(
      [
        {
          absolutePath: join(testDirectory, 'empty/string.txt'),
          contents: new Blob([''], {type: 'text/plain'}),
        },
        {
          absolutePath: join(testDirectory, 'nil/null/nic/nothing/nada.jpg'),
          contents: new Blob(),
        },
      ],
      [false, true],
    ),
  )('should not allow creating empty files', async (fileToWrite, overwrite) => {
    const result = await writeFile(fileToWrite.absolutePath, fileToWrite.contents, overwrite);
    expect(result.isErr()).toBe(true);
    // Check if the file is not created
    const file = await getFile(fileToWrite.absolutePath);
    expect(file).toBeNull();
  });
});

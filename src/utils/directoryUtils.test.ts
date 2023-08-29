import {describe, expect, test} from 'bun:test';
import {
  DirectoryEntry,
  checkIfDirectoryExists,
  flattenFiles,
  listSorterByPath,
  listSorterByType,
  readDirectoryContents,
} from './directoryUtils';
import {
  getFakeTree,
  loremFileName,
  testingDirectoryPath,
  testingDirectoryRelativePath,
  testingDirectoryTreeDepth1,
  testingDirectoryTreeDepth2,
  testingDirectoryTreeDepth3,
} from '../testing/testingUtils.test';
import {
  FileSystemConstructionEntry,
  createTestFileSystem,
  destroyTestFileSystem,
  testDirectory,
} from '../testing/testFileSystem';
import {setConfig} from './config';
import {join} from 'path';

describe('readDirectoryContents()', () => {
  test('should return proper depth 1 tree', async () => {
    const actualTree = (await readDirectoryContents(
      testingDirectoryPath,
      testingDirectoryRelativePath,
      1,
    )) as DirectoryEntry[];
    // Flatten and sort to make sure the contents are the same
    const actualList = flattenFiles(actualTree, false).sort(listSorterByPath);
    const expectedList = flattenFiles(testingDirectoryTreeDepth1, false).sort(listSorterByPath);
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualList).toEqual(expectedList);
  });
  test('should return proper depth 2 tree', async () => {
    const actualTree = (await readDirectoryContents(
      testingDirectoryPath,
      testingDirectoryRelativePath,
      2,
    )) as DirectoryEntry[];
    // Flatten and sort to make sure the contents are the same
    const actualList = flattenFiles(actualTree, false).sort(listSorterByPath);
    const expectedList = flattenFiles(testingDirectoryTreeDepth2, false).sort(listSorterByPath);
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualList).toEqual(expectedList);
  });
  test('should return proper depth 3 tree', async () => {
    const actualTree = (await readDirectoryContents(
      testingDirectoryPath,
      testingDirectoryRelativePath,
      3,
    )) as DirectoryEntry[];
    // Flatten and sort to make sure the contents are the same
    const actualList = flattenFiles(actualTree, false).sort(listSorterByPath);
    const expectedList = flattenFiles(testingDirectoryTreeDepth3, false).sort(listSorterByPath);
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualList).toEqual(expectedList);
  });
  test('should return "no-path" when invalid path', async () => {
    const actualTree = await readDirectoryContents(`${testingDirectoryPath}/invalid/path`, '/', 1);
    expect(actualTree).toBe('no-path');
  });
  test('should return "no-dir" when path to file', async () => {
    const actualTree = await readDirectoryContents(
      `${testingDirectoryPath}/${loremFileName}`,
      '/',
      1,
    );
    expect(actualTree).toBe('no-dir');
  });
});

describe('flattenFiles()', () => {
  test('including directories should return a list of only files', () => {
    const {tree, flatList} = getFakeTree('', 3, 5, 5);
    flatList.sort(listSorterByPath);
    if (tree === undefined) throw new Error('Tree is undefined - testing data is broken');
    const flattenedFiles = flattenFiles(tree, false).sort(listSorterByPath);
    expect(flattenedFiles).toStrictEqual(flatList);
  });

  test('excluding directories should return a list of files/dirs', () => {
    const {tree, flatListNoDirs} = getFakeTree('', 3, 5, 5);
    flatListNoDirs.sort(listSorterByPath);
    if (tree === undefined) throw new Error('Tree is undefined - testing data is broken');
    const flattenedFiles = flattenFiles(tree, true).sort(listSorterByPath);
    expect(flattenedFiles).toStrictEqual(flatListNoDirs);
  });
});

describe('listSorters', () => {
  test('listSorterByType - should sort directories before files', () => {
    const entries: DirectoryEntry[] = [
      {name: 'file1.txt', type: 'file', fullPath: '/file1.txt'},
      {name: 'dir1/file2.txt', type: 'file', fullPath: '/dir1/file2.txt'},
      {name: 'dir1', type: 'dir', fullPath: '/dir1'},
      {name: 'dir2/file3.txt', type: 'file', fullPath: '/dir2/file3.txt'},
      {name: 'dir2', type: 'dir', fullPath: '/dir2'},
    ];
    const sortedEntries = entries.sort(listSorterByType);
    expect(sortedEntries).toEqual([
      {name: 'dir1', type: 'dir', fullPath: '/dir1'},
      {name: 'dir2', type: 'dir', fullPath: '/dir2'},
      {name: 'dir1/file2.txt', type: 'file', fullPath: '/dir1/file2.txt'},
      {name: 'dir2/file3.txt', type: 'file', fullPath: '/dir2/file3.txt'},
      {name: 'file1.txt', type: 'file', fullPath: '/file1.txt'},
    ]);
  });
  test('listSorterByPath - should sort purely by path', () => {
    const entries: DirectoryEntry[] = [
      {name: 'file1.txt', type: 'file', fullPath: '/file1.txt'},
      {name: 'dir1/file2.txt', type: 'file', fullPath: '/dir1/file2.txt'},
      {name: 'dir1', type: 'dir', fullPath: '/dir1'},
      {name: 'dir2/file3.txt', type: 'file', fullPath: '/dir2/file3.txt'},
      {name: 'dir2', type: 'dir', fullPath: '/dir2'},
    ];
    const sortedEntries = entries.sort(listSorterByPath);
    expect(sortedEntries).toEqual([
      {name: 'dir1', type: 'dir', fullPath: '/dir1'},
      {name: 'dir1/file2.txt', type: 'file', fullPath: '/dir1/file2.txt'},
      {name: 'dir2', type: 'dir', fullPath: '/dir2'},
      {name: 'dir2/file3.txt', type: 'file', fullPath: '/dir2/file3.txt'},
      {name: 'file1.txt', type: 'file', fullPath: '/file1.txt'},
    ]);
  });
});

describe('checkIfDirectoryExists()', () => {
  const testDirectoryContents: FileSystemConstructionEntry = {
    dir1: {
      dir2: {},
    },
    'file1.txt': 'hello',
    dir3: {
      'file2.txt': 'there',
    },
  };

  test('should return true when directory exists', async () => {
    await createTestFileSystem(testDirectoryContents);
    try {
      expect(await checkIfDirectoryExists(testDirectory)).toBe(true);
      expect(await checkIfDirectoryExists(join(testDirectory, 'dir1'))).toBe(true);
      expect(await checkIfDirectoryExists(join(testDirectory, 'dir1/dir2'))).toBe(true);
      expect(await checkIfDirectoryExists(join(testDirectory, 'dir3'))).toBe(true);
    } finally {
      await destroyTestFileSystem();
    }
  });

  test('should return false when directory does not exist', async () => {
    await createTestFileSystem(testDirectoryContents);
    try {
      expect(await checkIfDirectoryExists(join(testDirectory, 'dir10'))).toBe(false);
      expect(await checkIfDirectoryExists(join(testDirectory, 'hello'))).toBe(false);
      expect(await checkIfDirectoryExists(join(testDirectory, 'nothing/here'))).toBe(false);
    } finally {
      await destroyTestFileSystem();
    }
  });

  test('should return false when pointing to a file', async () => {
    await createTestFileSystem(testDirectoryContents);
    try {
      expect(await checkIfDirectoryExists(join(testDirectory, 'file1.txt'))).toBe(false);
      expect(await checkIfDirectoryExists(join(testDirectory, 'dir3/file2.txt'))).toBe(false);
    } finally {
      await destroyTestFileSystem();
    }
  });
});

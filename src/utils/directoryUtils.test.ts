import {describe, expect, test} from 'bun:test';
import {
  DirectoryEntry,
  flattenFiles,
  listSorterByPath,
  listSorterByType,
  readDirectoryContents,
} from './directoryUtils';
import {
  getFakeTree,
  testingDirectoryPath,
  testingDirectoryRelativePath,
  testingDirectoryTreeDepth1,
  testingDirectoryTreeDepth2,
  testingDirectoryTreeDepth3,
} from './testingUtils.test';

describe('readDirectoryContents()', () => {
  test('should return proper depth 1 tree', async () => {
    const actualTree = await readDirectoryContents(
      testingDirectoryPath,
      testingDirectoryRelativePath,
      1,
    );
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualTree).toEqual(testingDirectoryTreeDepth1);
  });
  test('should return proper depth 2 tree', async () => {
    const actualTree = await readDirectoryContents(
      testingDirectoryPath,
      testingDirectoryRelativePath,
      2,
    );
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualTree).toEqual(testingDirectoryTreeDepth2);
  });
  test('should return proper depth 3 tree', async () => {
    const actualTree = await readDirectoryContents(
      testingDirectoryPath,
      testingDirectoryRelativePath,
      3,
    );
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualTree).toEqual(testingDirectoryTreeDepth3);
  });
  test('should return "no-path" when invalid path', async () => {
    const actualTree = await readDirectoryContents(`${testingDirectoryPath}/invalid/path`, '/', 1);
    expect(actualTree).toBe('no-path');
  });
  test('should return "no-dir" when path to file', async () => {
    const actualTree = await readDirectoryContents(`${testingDirectoryPath}/file1.empty`, '/', 1);
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

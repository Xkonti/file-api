import {describe, expect, test} from 'bun:test';
import {flattenFiles, listSorterByPath, readDirectoryContents} from './directoryUtils';
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

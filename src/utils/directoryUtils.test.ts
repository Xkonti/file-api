import {describe, expect, test} from 'bun:test';
import {flattenFiles, listSorterByPath} from './directoryUtils';
import {getFakeTree} from './testingUtils.test';

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

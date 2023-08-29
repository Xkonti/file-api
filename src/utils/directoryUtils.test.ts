import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import {
  DirectoryEntry,
  checkIfDirectoryExists,
  createDirectory,
  flattenFiles,
  listSorterByPath,
  listSorterByType,
  readDirectoryContents,
} from './directoryUtils';
import {getFakeTree} from '../testing/testingUtils.test';
import {
  FileSystemConstructionEntry,
  createTestFileSystem,
  destroyTestFileSystem,
  generateDirectoryEntryCollections,
  testDirectory,
} from '../testing/testFileSystem';
import {join} from 'path';

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

  beforeEach(async () => {
    await createTestFileSystem(testDirectoryContents);
  });

  afterEach(async () => {
    await destroyTestFileSystem();
  });

  test('should return true when directory exists', async () => {
    expect(await checkIfDirectoryExists(testDirectory)).toBe(true);
    expect(await checkIfDirectoryExists(join(testDirectory, 'dir1'))).toBe(true);
    expect(await checkIfDirectoryExists(join(testDirectory, 'dir1/dir2'))).toBe(true);
    expect(await checkIfDirectoryExists(join(testDirectory, 'dir3'))).toBe(true);
  });

  test('should return false when directory does not exist', async () => {
    expect(await checkIfDirectoryExists(join(testDirectory, 'dir10'))).toBe(false);
    expect(await checkIfDirectoryExists(join(testDirectory, 'hello'))).toBe(false);
    expect(await checkIfDirectoryExists(join(testDirectory, 'nothing/here'))).toBe(false);
  });

  test('should return false when pointing to a file', async () => {
    expect(await checkIfDirectoryExists(join(testDirectory, 'file1.txt'))).toBe(false);
    expect(await checkIfDirectoryExists(join(testDirectory, 'dir3/file2.txt'))).toBe(false);
  });
});

describe('createDirectory()', () => {
  const testDirectoryContents: FileSystemConstructionEntry = {
    dir1: {
      file: 'hello',
      dir2: {
        beep: 'boop',
      },
    },
  };

  beforeEach(async () => {
    await createTestFileSystem(testDirectoryContents);
  });

  afterEach(async () => {
    await destroyTestFileSystem();
  });

  test('should properly create a directory when parent exists', async () => {
    const newDir1 = join(testDirectory, 'newDir');
    expect(await checkIfDirectoryExists(newDir1)).toBe(false);
    expect(await createDirectory(newDir1)).toBe(true);
    expect(await checkIfDirectoryExists(newDir1)).toBe(true);

    const newDir2 = join(testDirectory, 'dir1/somedir');
    expect(await checkIfDirectoryExists(newDir2)).toBe(false);
    expect(await createDirectory(newDir2)).toBe(true);
    expect(await checkIfDirectoryExists(newDir2)).toBe(true);

    const newDir3 = join(testDirectory, 'dir1/dir2/notafile.txt');
    expect(await checkIfDirectoryExists(newDir3)).toBe(false);
    expect(await createDirectory(newDir3)).toBe(true);
    expect(await checkIfDirectoryExists(newDir3)).toBe(true);
  });

  test("should properly create a directory when parent doesn't exists", async () => {
    const newDir1 = join(testDirectory, 'newDir/newDir2');
    expect(await checkIfDirectoryExists(newDir1)).toBe(false);
    expect(await createDirectory(newDir1)).toBe(true);
    expect(await checkIfDirectoryExists(newDir1)).toBe(true);

    const newDir2 = join(testDirectory, 'dir1/somedir/yetanotherdir');
    expect(await checkIfDirectoryExists(newDir2)).toBe(false);
    expect(await createDirectory(newDir2)).toBe(true);
    expect(await checkIfDirectoryExists(newDir2)).toBe(true);

    const newDir3 = join(testDirectory, 'dir1/dir2/notafile.txt/anotherdir/again/again/again/ugh');
    expect(await checkIfDirectoryExists(newDir3)).toBe(false);
    expect(await createDirectory(newDir3)).toBe(true);
    expect(await checkIfDirectoryExists(newDir3)).toBe(true);

    const newDir4 = join(testDirectory, 'dir3/beep/boop');
    expect(await checkIfDirectoryExists(newDir4)).toBe(false);
    expect(await createDirectory(newDir4)).toBe(true);
    expect(await checkIfDirectoryExists(newDir4)).toBe(true);
  });

  test('should return true when directory already exists', async () => {
    const newDir1 = join(testDirectory, '/');
    expect(await checkIfDirectoryExists(newDir1)).toBe(true);
    expect(await createDirectory(newDir1)).toBe(true);
    expect(await checkIfDirectoryExists(newDir1)).toBe(true);
    const newDir2 = join(testDirectory, 'dir1');
    expect(await checkIfDirectoryExists(newDir2)).toBe(true);
    expect(await createDirectory(newDir2)).toBe(true);
    expect(await checkIfDirectoryExists(newDir2)).toBe(true);
    const newDir3 = join(testDirectory, 'dir1/dir2');
    expect(await checkIfDirectoryExists(newDir3)).toBe(true);
    expect(await createDirectory(newDir3)).toBe(true);
    expect(await checkIfDirectoryExists(newDir3)).toBe(true);
  });

  test('should return false when target is a file', async () => {
    const newDir1 = join(testDirectory, '/dir1/file');
    expect(await checkIfDirectoryExists(newDir1)).toBe(false);
    expect(await createDirectory(newDir1)).toBe(false);
    expect(await checkIfDirectoryExists(newDir1)).toBe(false);
    const newDir2 = join(testDirectory, '/dir1/dir2/beep');
    expect(await checkIfDirectoryExists(newDir2)).toBe(false);
    expect(await createDirectory(newDir2)).toBe(false);
    expect(await checkIfDirectoryExists(newDir2)).toBe(false);
  });
});

describe('readDirectoryContents()', () => {
  const testDirectoryContents: FileSystemConstructionEntry = {
    dir1: {
      'file3.empty': '',
    },
    dir2: {
      dir3: {
        'file4.empty': '',
      },
    },
    'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'file2.empty': '',
  };

  const depth3 = generateDirectoryEntryCollections('/', {
    dir1: {
      'file3.empty': '',
    },
    dir2: {
      dir3: {
        'file4.empty': '',
      },
    },
    'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'file2.empty': '',
  } as FileSystemConstructionEntry);

  const depth2 = generateDirectoryEntryCollections('/', {
    dir1: {
      'file3.empty': '',
    },
    dir2: {
      dir3: {},
    },
    'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'file2.empty': '',
  } as FileSystemConstructionEntry);

  const depth1 = generateDirectoryEntryCollections('/', {
    dir1: {},
    dir2: {},
    'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'file2.empty': '',
  } as FileSystemConstructionEntry);

  beforeEach(async () => {
    await createTestFileSystem(testDirectoryContents);
  });

  afterEach(async () => {
    await destroyTestFileSystem();
  });

  test('should return proper depth 1 tree', async () => {
    const actualTree = (await readDirectoryContents(testDirectory, '/', 1)) as DirectoryEntry[];
    // Flatten and sort to make sure the contents are the same
    const actualList = flattenFiles(actualTree, false).sort(listSorterByPath);
    const expectedList = flattenFiles(depth1.tree, false).sort(listSorterByPath);
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualList).toEqual(expectedList);
  });

  test('should return proper depth 2 tree', async () => {
    const actualTree = (await readDirectoryContents(testDirectory, '/', 2)) as DirectoryEntry[];
    // Flatten and sort to make sure the contents are the same
    const actualList = flattenFiles(actualTree, false).sort(listSorterByPath);
    const expectedList = flattenFiles(depth2.tree, false).sort(listSorterByPath);
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualList).toEqual(expectedList);
  });

  test('should return proper depth 3 tree', async () => {
    const actualTree = (await readDirectoryContents(testDirectory, '/', 3)) as DirectoryEntry[];
    // Flatten and sort to make sure the contents are the same
    const actualList = flattenFiles(actualTree, false).sort(listSorterByPath);
    const expectedList = flattenFiles(depth3.tree, false).sort(listSorterByPath);
    // Use only toEqual() as we don't care about the contents to be undefined. It isn't serialized to JSON.
    expect(actualList).toEqual(expectedList);
  });

  test('should return "no-path" when invalid path', async () => {
    const actualTree = await readDirectoryContents(join(testDirectory, '/invalid/path'), '/', 1);
    expect(actualTree).toBe('no-path');
  });

  test('should return "no-dir" when path to file', async () => {
    const actualTree = await readDirectoryContents(join(testDirectory, 'file1.lorem'), '/', 1);
    expect(actualTree).toBe('no-dir');
  });
});

describe('flattenFiles()', () => {
  test('including directories should return a list of only files', () => {
    const {tree, flatList} = generateDirectoryEntryCollections('/', getFakeTree(3, 5, 5));
    flatList.sort(listSorterByPath);
    if (tree === undefined) throw new Error('Tree is undefined - testing data is broken');
    const flattenedFiles = flattenFiles(tree, false).sort(listSorterByPath);
    expect(flattenedFiles).toStrictEqual(flatList);
  });

  test('excluding directories should return a list of files/dirs', () => {
    const {tree, flatList} = generateDirectoryEntryCollections('/', getFakeTree(3, 5, 5));
    const flatListNoDirs = flatList.filter(entry => entry.type === 'file');
    flatListNoDirs.sort(listSorterByPath);
    if (tree === undefined) throw new Error('Tree is undefined - testing data is broken');
    const flattenedFiles = flattenFiles(tree, true).sort(listSorterByPath);
    expect(flattenedFiles).toStrictEqual(flatListNoDirs);
  });

  test('should return an empty list when tree is empty', () => {
    const flattenedFiles = flattenFiles([], false);
    expect(flattenedFiles).toStrictEqual([]);
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

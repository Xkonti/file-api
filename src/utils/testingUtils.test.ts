import {DirectoryEntry, flattenFiles, listSorterByPath} from './directoryUtils';

let fakeTreeEntryId = 0;

/**
 * Generates a fake file/drectory tree.
 * @param parentPath The path of the parent directory - should be '/' for the root directory
 * @param maxDepth The maximum depth of the tree
 * @param requiredFiles The number of files that must be generated in the root directory
 * @param requiredDirs The number of directories that must be generated in the root directory
 * @returns Returns an object containing the tree, a flat list of all entries, and a flat list of all files
 */
export function getFakeTree(
  parentPath: string,
  maxDepth: number,
  requiredFiles: number = 0,
  requiredDirs: number = 0,
): {
  tree: DirectoryEntry[] | undefined;
  flatList: DirectoryEntry[];
  flatListNoDirs: DirectoryEntry[];
} {
  // If ran out of depth, return empty results
  if (maxDepth === 0) return {tree: [], flatList: [], flatListNoDirs: []};

  const tree: DirectoryEntry[] = [];
  let flatList: DirectoryEntry[] = [];
  let flatListNoDirs: DirectoryEntry[] = [];

  if (requiredFiles === 0) {
    requiredFiles = Math.floor(Math.random() * 4);
  }

  if (requiredDirs === 0) {
    requiredDirs = Math.floor(Math.random() * 3);
  }

  // Run a loop to generate the required number of files/dirs
  let hitsLeft = requiredFiles + requiredDirs;
  while (hitsLeft > 0) {
    // Get random 'dir' or 'file'
    const type = Math.random() > 0.5 ? 'dir' : 'file';

    // Skip if we don't need any more entries of this type
    if (type === 'dir' && requiredDirs === 0) continue;
    if (type === 'file' && requiredFiles === 0) continue;

    // Get name
    const id = fakeTreeEntryId++;
    const extension = type === 'file' ? '.txt' : '';
    const name = `${type}-${id}${extension}`;

    // Get fullPath
    parentPath = parentPath.endsWith('/') ? parentPath : `${parentPath}/`;
    const fullPath = `${parentPath}${name}`;

    // Generate contents
    const contents =
      type === 'dir'
        ? getFakeTree(fullPath, maxDepth - 1)
        : {tree: [], flatList: [], flatListNoDirs: []};

    // Create the entry
    let entry: DirectoryEntry = {
      name,
      fullPath,
      type,
      contents: contents.tree,
    };

    const entryNoContents: DirectoryEntry = {
      name,
      fullPath,
      type,
    };

    if (type === 'file') entry = entryNoContents;

    // Add the entry to the tree and the lists
    tree.push(entry);
    flatList = [...flatList, entryNoContents, ...contents.flatList];
    if (type === 'file') flatListNoDirs.push(entryNoContents);
    flatListNoDirs = [...flatListNoDirs, ...contents.flatListNoDirs];

    // Decrement required files/dirs
    if (type === 'file') requiredFiles--;
    else requiredDirs--;

    // Decrement hits left
    hitsLeft--;
  }

  return {tree, flatList, flatListNoDirs};
}

export const testingDirectoryPath = './testdir';
export const testingDirectoryRelativePath = '/testdir';

export const testingDirectoryTreeDepth1: DirectoryEntry[] = [
  {
    name: 'file1.empty',
    fullPath: '/testdir/file1.empty',
    type: 'file',
  },
  {
    name: 'file2.empty',
    fullPath: '/testdir/file2.empty',
    type: 'file',
  },
  {
    name: 'dir2',
    fullPath: '/testdir/dir2',
    type: 'dir',
  },
  {
    name: 'dir1',
    fullPath: '/testdir/dir1',
    type: 'dir',
  },
];

export const testingDirectoryTreeDepth2: DirectoryEntry[] = [
  {
    name: 'file1.empty',
    fullPath: '/testdir/file1.empty',
    type: 'file',
  },
  {
    name: 'file2.empty',
    fullPath: '/testdir/file2.empty',
    type: 'file',
  },
  {
    name: 'dir2',
    fullPath: '/testdir/dir2',
    type: 'dir',
    contents: [
      {
        name: 'dir3',
        fullPath: '/testdir/dir2/dir3',
        type: 'dir',
      },
    ],
  },
  {
    name: 'dir1',
    fullPath: '/testdir/dir1',
    type: 'dir',
    contents: [
      {
        name: 'file3.empty',
        fullPath: '/testdir/dir1/file3.empty',
        type: 'file',
      },
    ],
  },
];

export const testingDirectoryTreeDepth3: DirectoryEntry[] = [
  {
    name: 'file1.empty',
    fullPath: '/testdir/file1.empty',
    type: 'file',
  },
  {
    name: 'file2.empty',
    fullPath: '/testdir/file2.empty',
    type: 'file',
  },
  {
    name: 'dir2',
    fullPath: '/testdir/dir2',
    type: 'dir',
    contents: [
      {
        name: 'dir3',
        fullPath: '/testdir/dir2/dir3',
        type: 'dir',
        contents: [
          {
            name: 'file4.empty',
            fullPath: '/testdir/dir2/dir3/file4.empty',
            type: 'file',
          },
        ],
      },
    ],
  },
  {
    name: 'dir1',
    fullPath: '/testdir/dir1',
    type: 'dir',
    contents: [
      {
        name: 'file3.empty',
        fullPath: '/testdir/dir1/file3.empty',
        type: 'file',
      },
    ],
  },
];

/**
 * Prepares a file/dirs tree for comparison by flattening it and sorting it by path.
 */
export function prepTreeForComparison(tree: DirectoryEntry[], excludeDirs: boolean) {
  return flattenFiles(tree, excludeDirs).sort(listSorterByPath);
}

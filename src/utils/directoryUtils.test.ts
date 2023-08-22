import {expect, test} from 'bun:test';
import {DirectoryEntry, flattenFiles} from './directoryUtils';

let fakeTreeEntryId = 0;

function getFakeTree(
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

function sortEntryList(list: DirectoryEntry[]): DirectoryEntry[] {
  return list.sort((a, b) => {
    if (a.fullPath < b.fullPath) return -1;
    if (a.fullPath > b.fullPath) return 1;
    return 0;
  });
}

test('Flattening a directory including directories should return only files', () => {
  let {tree, flatList} = getFakeTree('', 3, 5, 3);
  flatList = sortEntryList(flatList);
  console.log(flatList);
  if (tree === undefined) throw new Error('Tree is undefined - testing data is broken');
  const flattenedFiles = sortEntryList(flattenFiles(tree, false));
  expect(flattenedFiles).toStrictEqual(flatList);
});

test('Flattening a directory excluding directories should return only files', () => {
  let {tree, flatListNoDirs} = getFakeTree('', 3, 5, 3);
  flatListNoDirs = sortEntryList(flatListNoDirs);
  console.log(flatListNoDirs);
  if (tree === undefined) throw new Error('Tree is undefined - testing data is broken');
  const flattenedFiles = sortEntryList(flattenFiles(tree, true));
  expect(flattenedFiles).toStrictEqual(flatListNoDirs);
});

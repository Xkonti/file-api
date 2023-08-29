import {DirectoryEntry, flattenFiles, listSorterByPath} from '../utils/directoryUtils';
import {FileSystemConstructionEntry} from './testFileSystem';

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
  maxDepth: number,
  requiredFiles: number = 0,
  requiredDirs: number = 0,
): FileSystemConstructionEntry {
  // If ran out of depth, return empty results
  if (maxDepth === 0) return {};

  const tree: FileSystemConstructionEntry = {};

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

    // Generate contents
    const contents = type === 'dir' ? getFakeTree(maxDepth - 1) : {};
    if (type === 'file') tree[name] = `Contents of file ${name}`;
    else tree[name] = contents;

    // Decrement required files/dirs
    if (type === 'file') requiredFiles--;
    else requiredDirs--;

    // Decrement hits left
    hitsLeft--;
  }

  return tree;
}

export const illegalPaths = ['..', '../..', '/hello/../world/../..', './..', './../there.jpg'];

export const testingDirectoryPath = './testdir';
export const testingDirectoryRelativePath = '/testdir';

export const pathToNowhere = `${testingDirectoryPath}/invalid/path`;
export const loremFileName = 'file1.lorem';
export const loremFilePath = `${testingDirectoryPath}/${loremFileName}`;
export const loremFileContents =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
export const emptyFileName = 'file2.empty';
export const emptyFilePath = `${testingDirectoryPath}/${emptyFileName}`;
export const dir1Name = 'dir1';
export const dir1path = `${testingDirectoryPath}/${dir1Name}`;

import {join} from 'path';
import {mkdir, readdir, stat} from 'fs/promises';
import {Dirent} from 'fs';

export type DirectoryEntry = {
  name: string;
  fullPath: string;
  type: 'dir' | 'file';
  contents?: DirectoryEntry[];
};

/**
 * Checks if a directory exists.
 * @param directoryPath Path to the directory.
 */
export async function checkIfDirectoryExists(directoryPath: PathLike): Promise<boolean> {
  try {
    const stats = await stat(directoryPath);
    return stats.isDirectory();
  } catch (err) {
    if ((err as {code: string}).code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
}

/**
 * Creates a directory at the specified path. If the directory already exists, it does nothing.
 * @param directoryPath Path to the directory to be created.
 */
export async function createDirectory(directoryPath: PathLike): Promise<boolean> {
  // Check if the path is pointing to a file
  try {
    const stats = await stat(directoryPath);
    if (stats.isFile()) {
      return false;
    }
  } catch (err) {
    // Just continue if the file does not exist
  }

  const success = await mkdir(directoryPath, {recursive: true});
  return success != null;
}

/**
 * Reads the contents of a directory and returns a list of directory entries in a tree structure.
 * @param directoryPath Path to the directory to read
 * @param relativePath Relative path to the directory from the root of the data directory that the server is serving. This is used to generate the full path of the directory entries.
 * @param depth Depth to read the directory to. 1 means only the contents of the directory itself, 2 means the contents of the directory and the contents of the directories inside the directory, etc.
 * @returns Returns a list of directory entries, or a string if there was an error
 */
export async function readDirectoryContents(
  directoryPath: string,
  relativePath: string,
  depth: number,
): Promise<DirectoryEntry[] | string> {
  let rawEntries: Dirent[] = [];

  try {
    rawEntries = await readdir(directoryPath, {withFileTypes: true});
  } catch (error) {
    const message = (error as {message: string}).message.toLowerCase();
    console.error('Error when getting directory contents: ', message);
    if (message.includes('no such file or directory')) {
      return 'no-path';
    } else if (message.includes('not a directory')) {
      return 'no-dir';
    }
    return `error: ${message}`;
  }

  const entries: DirectoryEntry[] = [];

  for (const entry of rawEntries) {
    const isDirectory = entry.isDirectory();
    const fullPath = join(relativePath, entry.name);

    // If the entry is a directory and we are not at the maximum depth
    // then we need to recursively read the contents of the directory
    let contents: DirectoryEntry[] | string = [];
    if (isDirectory && depth > 1) {
      contents = await readDirectoryContents(join(directoryPath, entry.name), fullPath, depth - 1);
      // If contents are of type string, then we have an error
      if (typeof contents === 'string') {
        return contents;
      }
    }

    entries.push({
      name: entry.name,
      fullPath: join(relativePath, entry.name),
      type: isDirectory ? 'dir' : 'file',
      contents: isDirectory ? contents : undefined,
    });
  }

  return entries;
}

/**
 * Flattens a list of directory entries into a list of files only.
 * @param entries List of directory & file entries
 * @returns Returns a list of file entries
 */
export function flattenFiles(entries: DirectoryEntry[], excludeDirs: boolean): DirectoryEntry[] {
  return entries.reduce((acc: DirectoryEntry[], curr: DirectoryEntry) => {
    if (curr.type === 'file') {
      return [...acc, curr];
    } else if (curr.type === 'dir' && curr.contents != null) {
      if (!excludeDirs) {
        const currentNoContents = {
          name: curr.name,
          fullPath: curr.fullPath,
          type: curr.type,
        };
        return [...acc, currentNoContents, ...flattenFiles(curr.contents, excludeDirs)];
      }
      return [...acc, ...flattenFiles(curr.contents, excludeDirs)];
    }
    return acc;
  }, []);
}

/**
 * Sorts a list of file/directory entries. Directories are sorted first, files are sorted second by full path.
 */
export function listSorterByType(a: DirectoryEntry, b: DirectoryEntry): number {
  // Directories first
  if (a.type === 'dir' && b.type === 'file') return -1;
  if (a.type === 'file' && b.type === 'dir') return 1;

  // Then sort by full path
  return listSorterByPath(a, b);
}

/**
 * Sorts a list of file/directory entries. Everything is sorted by full path.
 */
export function listSorterByPath(a: DirectoryEntry, b: DirectoryEntry): number {
  // Then sort by full path
  if (a.fullPath < b.fullPath) return -1;
  if (a.fullPath > b.fullPath) return 1;
  return 0;
}

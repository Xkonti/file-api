import {exists, mkdir} from 'fs/promises';
import {rimraf} from 'rimraf';
import {setConfig} from '../utils/config';
import {join} from 'path';
import {DirectoryEntry} from '../utils/directoryUtils';

export const testDirectory = './testdata';
export type FileSystemConstructionEntry = {
  [key: string]: string | FileSystemConstructionEntry;
};

/**
 * Creates a test file system with the specified contents.
 * @param contents A list of files and directories to create inside the test file system.
 */
export async function createTestFileSystem(contents: FileSystemConstructionEntry) {
  setConfig({
    apiKey: 'test',
    dataDir: testDirectory,
  });

  // If the test directory already exists, delete it and all its contents
  if (await exists(testDirectory)) {
    if (!rimraf(testDirectory)) {
      throw new Error('Could not delete the testdata directory');
    }
  }

  // Create the test directory
  await createDirectory(testDirectory);

  // Create the contents
  await createContents(testDirectory, contents);
}

export async function destroyTestFileSystem() {
  await deleteTestDirectory();
}

export function generateDirectoryEntryCollections(
  parentDirectory: string,
  contents: FileSystemConstructionEntry,
) {
  const tree: DirectoryEntry[] = [];
  let flatList: DirectoryEntry[] = [];

  for (const [name, value] of Object.entries(contents)) {
    const fullPath = join(parentDirectory, name);

    if (typeof value === 'string') {
      const entry = {
        name,
        fullPath,
        type: 'file',
      } as DirectoryEntry;
      tree.push(entry);
      flatList.push(entry);
    } else {
      const subContents = generateDirectoryEntryCollections(
        fullPath,
        value as FileSystemConstructionEntry,
      );

      tree.push({
        name,
        fullPath,
        type: 'dir',
        contents: subContents.tree ?? [],
      });

      flatList = [
        ...flatList,
        {
          name,
          fullPath,
          type: 'dir',
        },
        ...subContents.flatList,
      ];
    }
  }

  return {tree, flatList};
}

async function deleteTestDirectory() {
  if (await exists(testDirectory)) {
    if (!rimraf(testDirectory)) {
      throw new Error('Could not delete the testdata directory');
    }
  }
}

/**
 * Creates the contents of a directory.
 * @param parentDirectory The directory to create the contents in
 * @param contents The contents to create. This is a list of files and directories to create inside the root directory.
 */
async function createContents(parentDirectory: string, contents: FileSystemConstructionEntry) {
  for (const [name, value] of Object.entries(contents)) {
    const fullPath = join(parentDirectory, name);

    if (typeof value === 'string') {
      await createFile(fullPath, value);
    } else {
      await createDirectory(fullPath);
      await createContents(fullPath, value as FileSystemConstructionEntry);
    }
  }
}

/**
 * Creates a file at the specified path with the specified contents.
 * @param path The path of the file to create
 * @param contents The contents of the file
 */
async function createFile(path: string, contents: string) {
  await Bun.write(path, contents);
}

async function createDirectory(path: string) {
  await mkdir(path, {recursive: true});
}

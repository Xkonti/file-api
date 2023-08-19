import { join } from "path";
import { readdir } from "fs/promises";
import { Dirent } from "fs";

export type DirectoryEntry = {
    name: string,
    fullPath: string,
    type: 'dir' | 'file',
    contents?: DirectoryEntry[],
}

/**
 * Reads the contents of a directory and returns a list of directory entries in a tree structure.
 * @param directoryPath Path to the directory to read
 * @param relativePath Relative path to the directory from the root of the data directory that the server is serving
 * @param depth Depth to read the directory to. 1 means only the contents of the directory itself, 2 means the contents of the directory and the contents of the directories inside the directory, etc.
 * @returns Returns a list of directory entries, or a string if there was an error
 */
export async function readDirectoryContents(directoryPath: string, relativePath: string, depth: number): Promise<DirectoryEntry[] | string> {

    let rawEntries: Dirent[] = [];

    try {
        rawEntries = await readdir(directoryPath, { withFileTypes: true });
    } catch (error: { message: string }) {
        console.error('Error when getting directory contents: ', error.message);
        if (error.message.toLowerCase().includes('no such file or directory')) {
            return 'no-path';
        }
        return `error: ${error.message}`;
    }

    const entries: DirectoryEntry[] = [];

    for (const entry of rawEntries) {
        const isDirectory = entry.isDirectory();
        const fullPath = join(relativePath, entry.name);

        // If the entry is a directory and we are not at the maximum depth
        // then we need to recursively read the contents of the directory
        let contents = undefined;
        if (isDirectory && depth > 1) {
            contents = await readDirectoryContents(join(directoryPath, entry.name), fullPath, depth - 1);
            // If contents are of type string, then we have an error
            if (typeof contents === 'string') {
                return contents;
            }
        };

        entries.push({
            name: entry.name,
            fullPath: join(relativePath, entry.name),
            type: isDirectory ? 'dir' : 'file',
            contents,
        });
    }

    return entries;
}

/**
 * Flattens a list of directory entries into a list of files only.
 * @param entries List of directory & file entries
 * @returns Returns a list of file entries
 */
export function flattenFiles(entries: DirectoryEntry[]): DirectoryEntry[] {
    return entries.reduce((acc: DirectoryEntry[], curr: DirectoryEntry) => {
        if (curr.type === 'file') {
            return [...acc, curr];
        } else if (curr.type === 'dir' && curr.contents) {
            return [...acc, ...flattenFiles(curr.contents)];
        }
        return acc;
    }, []);
};
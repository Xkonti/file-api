import {join} from 'path';
import {flattenFiles, readDirectoryContents} from '../../utils/directoryUtils';
import Elysia from 'elysia';
import {getConfig} from '../../utils/config';

export function addGetListEndpoint(app: Elysia) {
  return app.get('list', async ({query, set}) => {
    const relativePath = query.path ? (query.path as string) : null;

    // TODO: Add proper checks for path validity
    if (relativePath == null || relativePath.includes('..')) {
      set.status = 400;
      return 'You must provide a valid path to a directory';
    }

    const includeDirectories = query.dirs === 'true';
    const depth = query.depth === undefined ? 1 : parseInt(query.depth as string);
    const directoryPath = join(getConfig().dataDir, relativePath);

    const entries = await readDirectoryContents(directoryPath, relativePath, depth);

    // Handle the occurrence of an error
    if (typeof entries === 'string') {
      if (entries === 'no-path') {
        set.status = 404;
        return 'Path not found';
      } else if (entries === 'no-dir') {
        set.status = 400;
        return 'Path is not a directory';
      }

      set.status = 500;
      return 'An unknown error occurred';
    }

    // If we are not including directories, then we need to filter them out
    // We still need to include the contents of the directories though
    let result = entries;
    if (!includeDirectories) {
      result = flattenFiles(entries, true);
    }

    return result;
  });
}

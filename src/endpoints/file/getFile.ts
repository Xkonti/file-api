import Elysia from 'elysia';
import {isPathValid} from '../../utils/pathUtils';
import {getConfig} from '../../utils/config';
import {join} from 'path';
import {getFile} from '../../utils/fileUtils';

export function addGetFileEndpoint(app: Elysia) {
  return app.get('file', async ({query, set}) => {
    // Verify that the path is valid
    let relativePath = query.path ? (query.path as string) : null;
    if (!isPathValid(relativePath)) {
      set.status = 400;
      return 'You must provide a valid path to a directory';
    }
    relativePath = relativePath as string;

    // Get the full path to the file
    const filePath = join(getConfig().dataDir, relativePath);

    // Get the file and verify that it exists
    const fileResult = await getFile(filePath);
    if (typeof fileResult === 'string') {
      if (fileResult === 'not-found') {
        set.status = 404;
        return 'The file you requested was not found';
      }
      if (fileResult === 'not-file') {
        set.status = 400;
        return 'The path you provided is not a file';
      }
      set.status = 500;
      return fileResult;
    }

    // There is a file, so return it
    try {
      const file = fileResult;
      const response = new Response(file);
      return response;
    } catch (error) {
      // Not sure what could go wrong here, but just in case
      set.status = 500;
      return {
        message: 'There was an error when handling your file',
        error: error,
      };
    }
  });
}

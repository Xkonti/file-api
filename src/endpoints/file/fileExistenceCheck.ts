import Elysia from 'elysia';
import {isPathValid} from '../../utils/pathUtils';
import {getConfig} from '../../utils/config';
import {join} from 'path';
import {getFile} from '../../utils/fileUtils';
import { STATUS_CODES } from 'http';

export function fileExistenceCheckEndpoint(app: Elysia) {
  return app.get('file/exists', async ({query, set}) => {
    // Verify that the path is valid
    let relativePath = query.path ? (query.path as string) : null;
    if (!isPathValid(relativePath)) {
      set.status = 400;
      return 'You must provide a valid path to the file';
    }
    relativePath = relativePath as string;

    // Get the full path to the file
    const filePath = join(getConfig().dataDir, relativePath);

    try {
      // Get the file
      const file = await getFile(filePath);
      if (file === null) {
        set.status = 404;
        return 'File does not exist';
      }
      set.status = 204;
      return '';
    } catch (error) {
      set.status = 500;
      return 'There was an error when fetching your file';
    }
  });
}

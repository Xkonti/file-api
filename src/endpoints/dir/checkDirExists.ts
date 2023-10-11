import Elysia from 'elysia';
import {isPathValid} from '../../utils/pathUtils';
import {getConfig} from '../../utils/config';
import {join} from 'path';
import {checkIfDirectoryExists} from '../../utils/directoryUtils';
import {dirNotExistsMsg, provideValidPathDirMsg} from '../../constants/commonResponses';

export function addCheckDirExistsEndpoint(app: Elysia) {
  return app.get('dir/exists', async ({query, set}) => {
    // Verify that the path is valid
    let relativePath = query.path ? (query.path as string) : null;
    if (!isPathValid(relativePath)) {
      set.status = 400;
      return 'You must provide a valid path to the directory';
    }
    relativePath = relativePath as string;

    // Get the full path to the directory
    const dirPath = join(getConfig().dataDir, relativePath);

    try {
      // Get the directory
      const dir = await checkIfDirectoryExists(dirPath);
      if (dir === false) {
        set.status = 404;
        return dirNotExistsMsg;
      }
      set.status = 204;
      return '';
    } catch (error) {
      set.status = 400;
      return provideValidPathDirMsg;
    }
  });
}

import Elysia from 'elysia';
import {validateRelativePath} from '../../utils/pathUtils';
import {getConfig} from '../../utils/config';
import {join} from 'path';
import {checkIfDirectoryExists} from '../../utils/directoryUtils';
import {dirNotExistsMsg, provideValidPathDirMsg} from '../../constants/commonResponses';

export function addCheckDirExistsEndpoint(app: Elysia) {
  return app.get('dir/exists', async ({query, set}) => {
    // Verify that the path is valid
    const dirPathValidationResult = await validateRelativePath(query.path);
    if (dirPathValidationResult.isErr()) {
      set.status = 400;
      return provideValidPathDirMsg;
    }
    const {relativePath} = dirPathValidationResult.value;

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

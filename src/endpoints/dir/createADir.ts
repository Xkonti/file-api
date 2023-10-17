import Elysia from 'elysia';
import {validateRelativePath} from '../../utils/pathUtils';
import {checkIfDirectoryExists} from '../../utils/directoryUtils';
import {dirNotExistsMsg, provideValidPathDirMsg} from '../../constants/commonResponses';

export function createADirEndpoint(app: Elysia) {
  return app.get('dir', async ({query, set}) => {
    // Verify that the path is valid
    // const dirPathValidationResult = await validateRelativePath(query.path);
    // if (dirPathValidationResult.isErr()) {
    //   set.status = 400;
    //   return provideValidPathDirMsg;
    // }

    // Get the full path to the directory

    // const {absolutePath} = dirPathValidationResult.value;

    try {
      // Get the directory
      // const dir = await checkIfDirectoryExists(absolutePath);
      // if (dir === false) {
      //   set.status = 404;
      //   return dirNotExistsMsg;
      // }
      // set.status = 204;
      // return '';
    } catch (error) {
      // set.status = 400;
      // return provideValidPathDirMsg;
    }
  });
}

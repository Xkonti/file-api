import Elysia from 'elysia';
import {mkdir} from 'fs/promises';
import {validateRelativePath} from '../../utils/pathUtils';
import {checkIfDirectoryExists} from '../../utils/directoryUtils';
import {dirAlreadyExistingMsg, provideValidPathDirMsg} from '../../constants/commonResponses';

async function createDirectory(path: string) {
  await mkdir(path, {recursive: true});
}

export function createADirEndpoint(app: Elysia) {
  return app.post('dir', async ({query, set}) => {
    // Verify that the path is valid
    const dirPathValidationResult = await validateRelativePath(query.path);
    if (dirPathValidationResult.isErr()) {
      set.status = 400;
      return provideValidPathDirMsg;
    }

    // Get the full path to the directory
    const {absolutePath, relativePath} = dirPathValidationResult.value;

    try {
      // Get the directory
      const dir = await checkIfDirectoryExists(absolutePath);

      // Abort if dir exists
      if (dir === true) {
        set.status = 409;
        return dirAlreadyExistingMsg;
      }

      // Create the directory(ies)
      await createDirectory(`${relativePath}`);
      set.status = 204;
      return '';
    } catch (error) {
      set.status = 400;
      return provideValidPathDirMsg;
    }
  });
}

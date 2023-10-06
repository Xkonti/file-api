import Elysia from 'elysia';
import { isPathValid } from '../../utils/pathUtils';
import { getConfig } from '../../utils/config';
import { join } from 'path';
import { getFile, writeFile } from '../../utils/fileUtils';
import { fileAlreadyExistsMsg } from '../../constants/commonResponses'


export function addCopyFileEndpoint(app: Elysia) {
  return app.get('file/copy', async ({ query, set }) => {

    // Verify that the SOURCE file path is valid
    let relativeSourcePath = query.source ? (query.source as string) : null;

    // Get the DESTINATION file path
    let relativeDestinationPath = query.destination ? (query.destination as string) : null;

    let overwrite = false;

    if (query.overwrite) {
      if (query.overwrite === "true")
        overwrite = true;
      else if (query.overwrite === "false")
        overwrite = false;
      else {
        set.status = 400;
        return 'Overwrite must be one of "true" and "false"';
      }
    }


    if (!isPathValid(relativeSourcePath)) {
      set.status = 400;
      return 'Source file path is invalid';
    }

    if (!isPathValid(relativeDestinationPath)) {
      set.status = 400;
      return 'Relative destination path is invalid';
    }

    relativeSourcePath = relativeSourcePath as string;

    relativeDestinationPath = relativeDestinationPath as string;

    // Get the full path to the SOURCE file
    const sourceFilePath = join(getConfig().dataDir, relativeSourcePath);

    // Get the full path to the DESTINATION file
    const destinationFilePath = join(getConfig().dataDir, relativeDestinationPath);

    var file = null;
    try {
      // Get source file
      file = await getFile(sourceFilePath);
      if (file === null) {
        set.status = 404;
        return 'Source file does not exist or is a directory';
      }
    } catch (error) {
      set.status = 500;
      return "There was an error when reading the source file";
    }
    const fileWriteResult = await writeFile(destinationFilePath, file, overwrite);
    if (fileWriteResult.isOk()) {
      return Response(null, { status: 204 });
    }
    else {
      if (fileWriteResult.error == fileAlreadyExistsMsg) {
        set.status = 409;
        return "File exists and overwrite is not set";
      }
      else {
        set.status = 500;
        return `An error occurred while copying the file ${fileWriteResult.error}`;
      }
    }
  });
}

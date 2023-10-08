import Elysia from 'elysia';
import { validateRelativePath } from '../../utils/pathUtils';
import { copyFile } from '../../utils/fileUtils';
import {
  invalidOverwriteFlagMsg,
  invalidSourcePathMsg,
  invalidDestinationPathMsg,
  sourceFileDoesNotExistOrIsADirectoryMsg,
  destinationFileExistsAndOverwriteIsNotSetMsg
} from '../../constants/commonResponses'

export function addCopyFileEndpoint(app: Elysia) {
  return app.post('file/copy', async ({ query, set }) => {

    // Verify that the SOURCE file path is valid
    let relativeSourcePath = query.source ? (query.source as string) : "";

    // Get the DESTINATION file path
    let relativeDestinationPath = query.destination ? (query.destination as string) : "";

    let overwrite = false;
    if (query.overwrite) {
      if (query.overwrite === "true")
        overwrite = true;
      else if (query.overwrite === "false")
        overwrite = false;
      else {
        set.status = 400;
        return invalidOverwriteFlagMsg;
      }
    }

    const sourcePathValidationResult = validateRelativePath(relativeSourcePath);
    if (sourcePathValidationResult.isErr()) {
      set.status = 400;
      return invalidSourcePathMsg;
    }
    const absoluteSourcePath = sourcePathValidationResult.value.absolutePath;

    const destinationPathValidationResult = validateRelativePath(relativeDestinationPath);
    if (destinationPathValidationResult.isErr()) {
      set.status = 400;
      return invalidDestinationPathMsg;
    }
    const absoluteDestinationPath = destinationPathValidationResult.value.absolutePath;
    

    let copyResult = await copyFile(absoluteSourcePath, absoluteDestinationPath, overwrite);
    if (copyResult.isOk()) {
      return Response("", { status: 204 });
    }
    else {
      switch (copyResult.error) {
        case sourceFileDoesNotExistOrIsADirectoryMsg: {
          set.status = 404;
          break;
        }
        case destinationFileExistsAndOverwriteIsNotSetMsg: {
          set.status = 409;
          break;
        }
        default: {
          set.status = 500;
          break;
        }
      }
      return copyResult.error;
    }
  });
}

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

    const sourcePathValidationResult = validateRelativePath(query.source);
    if (sourcePathValidationResult.isErr()) {
      set.status = 400;
      return invalidSourcePathMsg;
    }
    const sourcePath = sourcePathValidationResult.value;

    const destinationPathValidationResult = validateRelativePath(query.destination);
    if (destinationPathValidationResult.isErr()) {
      set.status = 400;
      return invalidDestinationPathMsg;
    }
    const destinationPath = destinationPathValidationResult.value;

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

    let copyResult = await copyFile(
      sourcePath.absolutePath,
      destinationPath.absolutePath,
      overwrite);

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

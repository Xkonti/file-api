import Elysia from 'elysia';
import {
  deleteErrorMsg,
  fileDeleteSuccessMsg,
  noSuchFileOrDirectoryMsg,
  operationNotPermittedMsg,
} from '../../constants/commonResponses';
import {deleteFile} from '../../utils/fileUtils';
import {validateRelativePath} from '../../utils/pathUtils';

export function addDeleteFileEndpoint(app: Elysia) {
  return app.delete('file', async ({query, set}) => {
    // Verify and process the relative path
    const pathValidationResult = validateRelativePath(query.path);
    if (pathValidationResult.isErr()) {
      set.status = 400;
      return pathValidationResult.error;
    }
    const {absolutePath} = pathValidationResult.value;

    const test = await deleteFile(absolutePath);

    if (test.isOk()) {
      set.status = 204;
      return fileDeleteSuccessMsg;
    }

    // Handle errors
    switch (test.error) {
      case operationNotPermittedMsg:
        set.status = 404;
        break;
      case noSuchFileOrDirectoryMsg:
        set.status = 400;
        break;
      default:
        set.status = 500;
        return deleteErrorMsg;
    }
    return test.error;
  });
}

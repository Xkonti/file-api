import Elysia from 'elysia';
import {validateRelativePath} from '../../utils/pathUtils';
import {getFile, writeFile} from '../../utils/fileUtils';
import {
  fileEmptyMsg,
  fileAlreadyExistsMsg,
  fileUploadSuccessMsg,
  unsupportedContentTypeMsg,
  uploadErrorMsg,
  fileMustNotEmptyMsg,
} from '../../constants/commonResponses';
import {Result, ok, err} from 'neverthrow';

/**
 * Add the endpoint for uploading a file.
 */
export function addUploadFileEndpoint(app: Elysia) {
  return app.post('file', async ({body, headers, query, set}) => {
    // Verify and process the relative path
    const pathValidationResult = validateRelativePath(query.path);
    if (pathValidationResult.isErr()) {
      set.status = 400;
      return pathValidationResult.error;
    }
    const {absolutePath} = pathValidationResult.value;

    // Check if the file should be overwritten if one exists already
    const overwrite = (query.overwrite ?? 'false') === 'true';

    // Check if file exists
    const existingFile = await getFile(absolutePath);
    if (existingFile && !overwrite) {
      set.status = 409;
      return fileAlreadyExistsMsg;
    }

    // Get file contents
    const contentType = getMediaType(headers);
    const fileContentsResult = getFileContents(contentType, body);
    if (fileContentsResult.isErr()) {
      if (fileContentsResult.error === unsupportedContentTypeMsg) {
        set.status = 415;
      } else {
        set.status = 400;
      }
      return fileContentsResult.error;
    }

    // Write the file
    const writeResult = await writeFile(absolutePath, fileContentsResult.value, overwrite);

    if (writeResult.isOk()) {
      set.status = 201;
      return fileUploadSuccessMsg;
    }

    // Handle errors
    switch (writeResult.error) {
      case fileAlreadyExistsMsg:
        set.status = 409;
        break;
      case fileMustNotEmptyMsg:
        set.status = 400;
        break;
      case unsupportedContentTypeMsg:
        set.status = 415;
        break;
      default:
        set.status = 500;
        return uploadErrorMsg;
    }
    return writeResult.error;
  });
}

/**
 * Get the media type from the headers (content-type header).
 * @param headers The headers of the request
 * @returns The core content type of the request or an empty string if it is not set.
 */
function getMediaType(headers: Record<string, string | null>): string {
  // Default to invalid content type to prevent mishaps
  return headers['content-type']?.split(';')[0].trim().toLowerCase() ?? '';
}

/**
 * Get the file contents from the request body depending on the content type
 * @param contentType The content type of the request
 * @param body The request body
 * @returns The contents of the file or an error message
 */
function getFileContents(contentType: string, body: unknown): Result<Blob, string> {
  let fileContents: Blob;
  switch (contentType) {
    // Binary stream
    case 'application/octet-stream':
      fileContents = body as Blob;
      break;

    // Form data
    case 'multipart/form-data': {
      fileContents = (body as Record<string, any>).file as Blob;
      break;
    }

    // Unsupported content type
    default:
      return err(unsupportedContentTypeMsg);
  }

  // Check if the file is empty
  if (fileContents.size === 0) {
    return err(fileEmptyMsg);
  }

  return ok(fileContents);
}

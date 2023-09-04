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
  unsupportedBinaryDataTypeMsg,
  invalidFileFormatInFormDataMsg,
  noFileFieldInFormDataMsg,
  invalidFormDataStructure,
} from '../../constants/commonResponses';
import {Result, ok, err} from 'neverthrow';

/**
 * Add the endpoint for uploading a file.
 */
export function addUploadFileEndpoint(app: Elysia) {
  return app.post(
    'file',
    async ({body, headers, query, set}) => {
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
      const fileContentsResult = await getFileContents(contentType, body);
      if (fileContentsResult.isErr()) {
        switch (fileContentsResult.error) {
          case unsupportedContentTypeMsg:
            set.status = 415;
            break;
          case unsupportedBinaryDataTypeMsg:
          case invalidFileFormatInFormDataMsg:
            set.status = 422;
            break;
          default:
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
    },
    {
      // Add custom parser for application/json data
      // We don't want Elysia.js to parse it automatically as JSON.
      parse: async ({request, headers}) => {
        const contentType = getMediaType(headers);

        if (contentType === 'application/json') {
          return await request.text();
        }
      },
    },
  );
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
async function getFileContents(contentType: string, body: unknown): Promise<Result<Blob, string>> {
  let fileContents: Blob;
  switch (contentType) {
    // Binary stream
    case 'application/octet-stream': {
      if (body instanceof Blob) {
        fileContents = body;
      } else if (body instanceof ArrayBuffer) {
        fileContents = new Blob([body]);
      } else if (body instanceof Uint8Array) {
        fileContents = new Blob([body.buffer]);
      } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
        // Node.js Buffer
        fileContents = new Blob([body]);
      } else {
        return err(unsupportedBinaryDataTypeMsg);
      }
      break;
    }

    // Form data
    case 'multipart/form-data': {
      if (typeof body === 'object' && body !== null) {
        if ('file' in body) {
          const potentialFile = body.file;
          if (potentialFile instanceof Blob) {
            fileContents = potentialFile;
          } else if (potentialFile instanceof Buffer) {
            fileContents = new Blob([potentialFile]);
          } else if (
            potentialFile &&
            typeof potentialFile === 'object' &&
            'stream' in potentialFile &&
            potentialFile.stream &&
            typeof potentialFile.stream === 'object' &&
            'pipe' in potentialFile.stream &&
            typeof potentialFile.stream.pipe === 'function'
          ) {
            return err('Streams are not supported yet');
          } else {
            return err(invalidFileFormatInFormDataMsg);
          }
        } else {
          return err(noFileFieldInFormDataMsg);
        }
      } else {
        return err(invalidFormDataStructure);
      }
      break;
    }

    // Unsupported content type
    default:
      return err(unsupportedContentTypeMsg);
  }

  // Check if the file is empty
  if (fileContents.size == null || fileContents.size === 0) {
    return err(fileEmptyMsg);
  }

  return ok(fileContents);
}

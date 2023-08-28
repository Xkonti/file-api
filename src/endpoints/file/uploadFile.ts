import Elysia from 'elysia';
import {isPathValid} from '../../utils/pathUtils';
import {getConfig} from '../../utils/config';
import {join} from 'path';
import {getFile} from '../../utils/fileUtils';
import {fileEmpty, getStaticError, isStaticError} from '../../constants/errorCodes';
import {
  fileAlreadyExists,
  fileUploadSuccess,
  provideValidPath,
  unsupportedContentType,
  uploadError,
} from '../../constants/commonResponses';

export function addUploadFileEndpoint(app: Elysia) {
  return app.post('file', async ({body, headers, query, set}) => {
    // Verify the path
    if (!query.path || typeof query.path !== 'string' || !isPathValid(query.path)) {
      set.status = 400;
      return provideValidPath;
    }

    // Get the full path to the file
    const relativePath = query.path;
    const filePath = join(getConfig().dataDir, relativePath);

    // Check if the file should be overwritten if one exists already
    const overwrite = (query.overwrite ?? 'false') === 'true';

    // Check if file exists
    const existingFile = await getFile(filePath);
    if (existingFile && !overwrite) {
      set.status = 409;
      return fileAlreadyExists;
    }

    // Write the file
    try {
      // Default to invalid content type to prevent mishaps
      const contentType = headers['content-type']?.split(';')[0] ?? '';

      switch (contentType) {
        // Binary stream
        case 'application/octet-stream':
          await writeFile(filePath, body as Blob);
          break;

        // Form data
        case 'multipart/form-data':
          const fileContents = (body as Record<string, any>).file as Blob;
          await writeFile(filePath, fileContents);
          break;

        // Unsupported content type
        default:
          set.status = 400;
          return unsupportedContentType;
      }

      // Success
      set.status = 201;
      return fileUploadSuccess;

      // Handle errors
    } catch (error) {
      set.status = 500;
      if (error instanceof Error) {
        // If the file is empty, return a 400
        if (isStaticError(error, fileEmpty)) {
          set.status = 400;
          return error.message;
        }

        return `${uploadError}: ${error.message}`;
      }
      return uploadError;
    }
  });
}

async function writeFile(filePath: string, fileContents: Blob) {
  if (fileContents.size === 0) {
    throw getStaticError(fileEmpty);
  }
  await Bun.write(filePath, fileContents);
}

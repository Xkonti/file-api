import Elysia, {t} from 'elysia';
import {isPathValid} from '../../utils/pathUtils';
import {getConfig} from '../../utils/config';
import {join} from 'path';
import {getFile} from '../../utils/fileUtils';

export function addUploadFileEndpoint(app: Elysia) {
  return app.post(
    'file',
    async ({body: {file}, query, set}) => {
      // Verify that the path is valid
      let relativePath = query.path ? (query.path as string) : null;
      if (!isPathValid(relativePath)) {
        set.status = 400;
        return 'You must provide a valid path to a file';
      }
      relativePath = relativePath as string;

      // Get the full path to the file
      const filePath = join(getConfig().dataDir, relativePath);

      const overwrite = (query.overwrite ?? 'false') === 'true';

      // Check if the file already exists
      const existingFile = await getFile(filePath);
      if (existingFile && !overwrite) {
        set.status = 409;
        return 'The file already exists';
      }

      // Write the file
      try {
        await Bun.write(filePath, file); // This overrites the file if it already exists
        set.status = 201;
        return 'File uploaded successfully';
      } catch (error) {
        set.status = 500;
        if (error instanceof Error) {
          return 'There was an error when uploading your file: ' + error.message;
        }
        return 'There was an error when uploading your file';
      }
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    },
  );
}

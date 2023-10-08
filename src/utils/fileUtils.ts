import {BunFile} from 'bun';
import Bun from 'bun';
import {Result, err, ok} from 'neverthrow';
import {
  destinationFileExistsAndOverwriteIsNotSetMsg,
  dirCreateFailMsg,
  fileAlreadyExistsMsg,
  fileMustNotEmptyMsg,
  sourceFileDoesNotExistOrIsADirectoryMsg,
  unknownErrorMsg,
} from '../constants/commonResponses';
import {dirname} from 'path';
import {checkIfDirectoryExists, createDirectory} from './directoryUtils';

/**
 * Gets a file from the specified path.
 * @param path The path to the file.
 * @returns Returns the file if it exists, or null if it does not.
 */
export async function getFile(path: string): Promise<BunFile | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return null;
  }
  return file;
}

/**
 * Writes a file to the specified path. Creates the directory if it does not exist.
 * @param absolutePath The absolute path to the file to write.
 * @param contents The contents of the file. Can't be empty.
 * @param overwrite Whether to overwrite the file if it already exists.
 * @returns Returns true if the file was written successfully, or a string if there was an error.
 */
export async function writeFile(
  absolutePath: string,
  contents: Blob,
  overwrite: boolean,
): Promise<Result<boolean, string>> {
  // Check if contents is empty
  if (contents.size == null || contents.size === 0) {
    return err(fileMustNotEmptyMsg);
  }

  // Check if file exists
  const existingFile = await getFile(absolutePath);
  if (existingFile && !overwrite) {
    return err(fileAlreadyExistsMsg);
  }

  try {
    // Create the directory if it does not exist
    const directoryPath = dirname(absolutePath);
    if (!(await checkIfDirectoryExists(directoryPath)) && !(await createDirectory(directoryPath))) {
      return err(dirCreateFailMsg);
    }
    // Write the file
    await Bun.write(absolutePath, contents);
    return ok(true);
  } catch (error) {
    if (error instanceof Error) {
      return err(error.message);
    }
    return err(unknownErrorMsg);
  }
}

/**
 * Copies the file specified by {@link absoluteSourcePath} 
 * to the path specified by {@link absoluteDestinationPath}. 
 * Creates the directories specified by {@link absoluteDestinationPath}
 * if they do not exist.
 * @param absoluteSourcePath The absolute path to the source file.
 * @param absoluteDestinationPath The absolute path to the destination file.
 * @param overwrite Whether to overwrite the file at the destination
 *                  path if there is one already.
 * @returns Returns true if the file was written successfully, 
 *          or an error message string if there was an error.
 */
export async function copyFile(
  absoluteSourcePath: string,
  absoluteDestinationPath: string,
  overwrite: boolean
) : Promise<Result<boolean, string>> {
  let sourceFile = null;
    try {

      // Get source file
      sourceFile = await getFile(absoluteSourcePath);

      if (sourceFile === null) 
        return err(sourceFileDoesNotExistOrIsADirectoryMsg);
      
    } catch (error) {
      return err(`An error occurred while reading the source file (detail: ${error})`);
    }

    const fileWriteResult = await writeFile(absoluteDestinationPath, sourceFile, overwrite);
    if (fileWriteResult.isOk()) {
      return ok(true);
    }
    else {
      if (fileWriteResult.error == fileAlreadyExistsMsg) {
        return err(destinationFileExistsAndOverwriteIsNotSetMsg);
      }
      else {
        return err(`An error occurred while copying the file (detail: ${fileWriteResult.error})`);
      }
    }
}
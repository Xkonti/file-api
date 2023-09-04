import {Result, err, ok} from 'neverthrow';
import {provideValidPathMsg} from '../constants/commonResponses';
import {join} from 'path';
import {getConfig} from './config';

export type PathData = {
  relativePath: string;
  absolutePath: string;
};

export function isPathValid(path: string | null | undefined | unknown) {
  // TODO: Add proper checks for path validity
  if (!path || typeof path !== 'string') {
    return false;
  }
  return path != null && !path.includes('..');
}

export function validateRelativePath(
  path: string | null | undefined | unknown,
): Result<PathData, string> {
  // Verify the path
  if (!isPathValid(path)) {
    return err(provideValidPathMsg);
  }

  // Get the full path to the file
  const relativePath = path as string;
  const absolutePath = join(getConfig().dataDir, relativePath);
  return ok({relativePath, absolutePath});
}

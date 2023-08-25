import {BunFile} from 'bun';
import {stat} from 'fs/promises';
import Bun from 'bun';
import {Stats} from 'fs';

export type FileError = {
  code: 'not-file' | 'not-found' | 'unknown-error';
  message?: string;
};

export async function getFileStats(path: string): Promise<Stats | FileError> {
  try {
    const fileStat = await stat(path);
    if (!fileStat.isFile()) {
      return {code: 'not-file'} as FileError;
    }
    return fileStat;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'ENOENT') {
        return {code: 'not-found'} as FileError;
      }
      return {
        code: 'unknown-error',
        message: error.message,
      } as FileError;
    }
    return {code: 'unknown-error'} as FileError;
  }
}

export async function getFile(path: string): Promise<BunFile | FileError> {
  const stats = await getFileStats(path);

  // If it's FileError - return the error
  // TODO: Make it more elegant with rusty-result-ts
  if (typeof stats === 'object' && 'code' in stats) {
    return stats;
  }

  // Otherwise, return the file
  return Bun.file(path);
}

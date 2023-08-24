import {BunFile} from 'bun';
import {stat} from 'fs/promises';
import Bun from 'bun';

export async function getFile(path: string): Promise<BunFile | string> {
  try {
    const fileStat = await stat(path);
    if (!fileStat.isFile()) {
      return 'not-file';
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'ENOENT') {
        return 'not-found';
      }
      return 'unknown error: ' + error.message;
    }
    return 'unknown error';
  }

  return Bun.file(path);
}

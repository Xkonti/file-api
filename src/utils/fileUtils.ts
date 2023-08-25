import {BunFile} from 'bun';
import Bun from 'bun';

export async function getFile(path: string): Promise<BunFile | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return null;
  }
  return file;
}

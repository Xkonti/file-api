export function isPathValid(path: string | null | undefined) {
  // TODO: Add proper checks for path validity
  return path != null && !path.includes('..');
}

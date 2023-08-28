export type ErrorCode = {
  code: string;
  message: string;
};

export function getStaticError(code: ErrorCode): Error {
  const error = new Error(code.message);
  error.cause = code;
  return error;
}

export function isStaticError(error: Error | unknown, code: ErrorCode): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.cause === code;
}

export const fileEmpty = {
  code: 'file-empty',
  message: 'The file is empty',
};

// Success
export const fileUploadSuccessMsg = 'File uploaded successfully';

// Bad requests

export const dirNotExistsMsg = 'The directory does not exist';
export const fileAlreadyExistsMsg = 'The file already exists';
export const fileEmptyMsg = 'The file is empty';
export const fileMustNotEmptyMsg = 'File contents cannot be empty';
export const provideValidPathMsg = 'You must provide a valid path to a file';
export const unsupportedContentTypeMsg = 'Unsupported content type';
export const unsupportedBinaryDataTypeMsg = 'Unsupported binary data type';
export const invalidFileFormatInFormDataMsg = 'Invalid file format in form data';
export const noFileFieldInFormDataMsg = 'No file field in form data';
export const invalidFormDataStructure = 'Invalid structure for multipart/form-data';
export const invalidOverwriteFlagMsg = 'Parameter "overwrite" must be either "true" or "false"';

// For operations involving a source and a destination
// such as copy and move
export const invalidSourcePathMsg = 'Invalid source file path';
export const invalidDestinationPathMsg = 'Invalid destination file path';
export const sourceFileDoesNotExistOrIsADirectoryMsg = 'Source file does not exist or is a directory';
export const destinationFileExistsAndOverwriteIsNotSetMsg = 'Destination file exists and overwrite is not set';

// Internal server errors
export const dirCreateFailMsg = 'Could not create directory';
export const unknownErrorMsg = 'An unknown error occurred';
export const uploadErrorMsg = 'An error occurred while uploading the file';

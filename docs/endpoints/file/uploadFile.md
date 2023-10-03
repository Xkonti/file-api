# `POST /file` - Upload a file

You can upload a specific file by using the `POST /file` endpoint with the following query parameters:

- `path` - the destination path of the file to upload (remember to url-encode it)
- `overwrite` - whether to overwrite the file if it already exists (default: `false`)

All the parent directories of the destination path will be created automatically if they do not exist.

The file contents should be sent in the request body in one of the following ways:

- `multipart/form-data` - the file contents should be sent as a `file` field
- `application/octet-stream` - the file contents should be sent as the request body

Possible responses:

- `201` - the file was uploaded successfully
- `400` - the request was malformed in some way:
  - the `path` parameter is missing
  - the `path` parameter is pointing to a directory
  - the file contents are missing
- `415` - unsupported content type
- `422` - unrecognized file contents format

## Examples

- `curl --request POST --url 'http://localhost:3000/file?path=%2FExpenses%202022.xlsx' --header 'Content-Type: application/octet-stream' --data-binary @/path/to/file` - upload the `Expenses 2022.xlsx` file (`%2FExpenses%202022.xlsx` is the encoded `/Expenses 2022.xlsx`)

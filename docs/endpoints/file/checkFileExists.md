# `GET /file/exists` - Check if file exists

You can check if a specific file exists by using the `GET /file/exists` endpoint with the following query parameters:

- `path` - the path of the file to check (remember to url-encode it)

Possible responses:

- `204` - the file exists
- `404` - the file does not exist
- `400` - the request was malformed in some way:
  - the `path` parameter is missing
  - the `path` parameter is pointing to a directory

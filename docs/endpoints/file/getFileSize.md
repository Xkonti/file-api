# `GET /file/size` - Get file size

You can get the size of a specific file by using the `GET /file/size` endpoint with the following query parameters:

- `path` - the path of the file to check (remember to url-encode it)

Possible responses:

- `200` - the file exists and the size is returned in the response body
- `404` - the file does not exist
- `400` - the request was malformed in some way:
  - the `path` parameter is missing
  - the `path` parameter is pointing to a directory

Response body with file size in bytes:

```json
{
  "size": 123456
}
```

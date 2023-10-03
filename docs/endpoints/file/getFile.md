# `GET /file` - Download a file

You can download a specific file by using the `GET /file` endpoint with the following query parameters:

- `path` - the path of the file to download (remember to url-encode it)

If the file does not exist or a path is pointing to a directory, a `404 Not Found` response will be returned.

<details>
  <summary>Examples [click to expand]</summary>

- `curl --request GET --url 'http://localhost:3000/file?path=%2FExpenses%202022.xlsx'` - download the `Expenses 2022.xlsx` file (`%2FExpenses%202022.xlsx` is the encoded `/Expenses 2022.xlsx`)
</details>

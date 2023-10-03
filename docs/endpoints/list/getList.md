# `GET /list` - List files and directories

You can list files and/or directories by using the `GET /list` endpoint with the following query parameters:

- `path` - the path of the directory to list (remember to url-encode it)
- `dirs` - whether to include directories or not (default: `false`). If directories are listed their contents will be nested.
- `depth` - how deep to list directories. The default `1` will list only files and directories within the specified directory - no contents of subdirectories will be listed.

## Examples

- `curl --request GET --url 'http://localhost:3000/list?path=%2F'` - list only files in the root directory (`%2F` is the encoded `/`):
  ```json
  [
    {
      "name": "Expenses 2022.xlsx",
      "fullPath": "/Expenses 2022.xlsx",
      "type": "file"
    }
  ]
  ```
- `curl --request GET --url 'http://localhost:3000/list?path=%2F&dirs=true'` - list files and directories in the root directory (`%2F` is the encoded `/`):

  ```json
  [
    {
      "name": "repos",
      "fullPath": "/repos",
      "type": "dir"
    },
    {
      "name": "Expenses 2022.xlsx",
      "fullPath": "/Expenses 2022.xlsx",
      "type": "file"
    }
  ]
  ```

- `curl --request GET --url 'http://localhost:3000/list?path=%2F&dirs=true&depth=2'` - list files and directories in the root directory. Additionally increase depth to `2` so that the contents of the `repos` directory are listed:
  ```json
  [
    {
      "name": "repos",
      "fullPath": "/repos",
      "type": "dir",
      "contents": [
        {
          "name": "rusty-result-ts",
          "fullPath": "/repos/rusty-result-ts",
          "type": "dir"
        },
        {
          "name": "vue-smart-routes",
          "fullPath": "/repos/vue-smart-routes",
          "type": "dir"
        },
        {
          "name": "todo.md",
          "fullPath": "/repos/todo.md",
          "type": "file"
        },
        {
          "name": "clean-node-package-typescript",
          "fullPath": "/repos/clean-node-package-typescript",
          "type": "dir"
        },
        {
          "name": "notes.md",
          "fullPath": "/repos/notes.md",
          "type": "file"
        }
      ]
    },
    {
      "name": "Expenses 2022.xlsx",
      "fullPath": "/Expenses 2022.xlsx",
      "type": "file"
    }
  ]
  ```
- `curl --request GET --url 'http://localhost:3000/list?path=%2F&dirs=true&depth=2'` - list **only files** in the root directory. Additionally increase depth to `2` so that the contents of the `repos` directory are listed. This will present all the files as a flat list:
  ```json
  [
    {
      "name": "todo.md",
      "fullPath": "/repos/todo.md",
      "type": "file"
    },
    {
      "name": "notes.md",
      "fullPath": "/repos/notes.md",
      "type": "file"
    },
    {
      "name": "Expenses 2022.xlsx",
      "fullPath": "/Expenses 2022.xlsx",
      "type": "file"
    }
  ]
  ```
- `curl --request GET --url 'http://localhost:3000/list?path=repos%2Frusty-result.ts&dirs=true'` - list files and directories in the `repos/rusty-result.ts` directory. Additionally increase depth to `2` so that the contents of the `repos` directory are listed:
  ```json
  [
    {
      "name": "repos",
      "fullPath": "/repos",
      "type": "dir",
      "contents": [
        {
          "name": "rusty-result-ts",
          "fullPath": "/repos/rusty-result-ts",
          "type": "dir"
        },
        {
          "name": "vue-smart-routes",
          "fullPath": "/repos/vue-smart-routes",
          "type": "dir"
        },
        {
          "name": "todo.md",
          "fullPath": "/repos/todo.md",
          "type": "file"
        },
        {
          "name": "clean-node-package-typescript",
          "fullPath": "/repos/clean-node-package-typescript",
          "type": "dir"
        },
        {
          "name": "notes.md",
          "fullPath": "/repos/notes.md",
          "type": "file"
        }
      ]
    },
    {
      "name": "Expenses 2022.xlsx",
      "fullPath": "/Expenses 2022.xlsx",
      "type": "file"
    }
  ]
  ```
  </details>

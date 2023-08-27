# File API

A simple RESTful API that allows you to manipulate files and directories.

> [!WARNING]
> This project is in early development stage.

> [!IMPORTANT]
> 💀 There are no robust protections against malicious users. This API is intended to be used as an internal API for simple projects. Usage of a service mesh that encrypts traffic between services is recommended.

# Usage

## Running in Docker

The easiest way to run the File API is to use the Docker image. The image is available on [Docker Hub](https://hub.docker.com/r/xkonti/file-api):

```bash
docker run -d \
  -p 3210:3000 \
  -e API_KEY=YOUR_API_KEY \
  -v /your/directory/to/mount:/data:rw \
  xkonti/file-api:latest
```

Available configuration options:

- Internal port: `3000`
- Mount point for the directory to be managed via API: `/data`
- `API_KEY` environment variable: the API key to use for authentication

## Authentication

An API key must be configured in order to use the API. The API key can be configured using the `API_KEY` environment variable. Please use something that is base64 encoded so that it can be used in HTTP headers and URL query.

Each HTTP request will be first checked for API key. If the API key is not provided, the request will be rejected with a `401 Unauthorized` response. The API key can be provided in two ways:

- HTTP header: `api-key` - example: `curl --request GET --url 'http://localhost:3000/list?path=%2F' --header 'apikey: YOUR_API_KEY'`
- Query parameter: `apikey` - example: `curl --request GET --url 'http://localhost:3000/list?path=%2F&apikey=YOUR_API_KEY'`

## API

### List files and directories in a directory

You can list files and/or directories by using the `/list` endpoint with the following parameters:

- `path` - the path of the directory to list (remember to encode it)
- `dirs` - whether to include directories or not (default: `false`). If directories are listed their contents will be nested.
- `depth` - how deep to list directories. The default `1` will list only files and directories within the specified directory - no contents of subdirectories will be listed.

<details>
  <summary>Examples [click to expand]</summary>

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

### Download a file

You can download a specific file by using the `/file` endpoint with the following parameters:

- `path` - the path of the file to download (remember to encode it)

If the file does not exist or a path is pointing to a directory, a `404 Not Found` response will be returned.

<details>
  <summary>Examples [click to expand]</summary>

- `curl --request GET --url 'http://localhost:3000/file?path=%2FExpenses%202022.xlsx'` - download the `Expenses 2022.xlsx` file (`%2FExpenses%202022.xlsx` is the encoded `/Expenses 2022.xlsx`)
</details>

## Roadmap

### Directories

- [x] List files and directories in a directory: `GET /list`
- [ ] Check if a directory exists: `GET /dir/exists`
- [ ] Create a directory: `POST /dir`
- [ ] Delete a directory: `DELETE /dir`
- [ ] Rename a directory: : `POST /dir/rename`
- [ ] Move a directory: `POST /dir/move`
- [ ] Copy a directory: `POST /dir/copy`

### Files

- [ ] Check if a file exists: `GET /file/exists`
- [x] Download a file: `GET /file`
- [ ] Upload a file: `POST /file`
- [ ] Delete a file: `DELETE /file`
- [ ] Create an empty file: `POST /file?touch=true`
- [ ] Rename a file: `POST /file/rename`
- [ ] Move a file: `POST /file/move`
- [ ] Copy a file: `POST /file/copy`
- [ ] Get file metadata: `GET /file/meta`
- [ ] Get file size: `GET /file/size`

### Permissions

- [x] API key authentication
- [ ] Protect paths with API keys
- [ ] Protect operation categories with API keys
  - [ ] Listing files and directories
  - [ ] Downloading files
  - [ ] Uploading/copying files & creating directories
  - [ ] Deleting/moving/renaming files & directories

### Deployment

- [x] Docker image on Docker Hub
- [ ] Docker image on GitHub Container Registry
- [ ] CI/CD pipeline using GitHub Actions and Dagger

## Stack

- Runtime and bundler: [Bun](https://bun.sh/)
- API framework: [Elysia.js](https://elysiajs.com/)

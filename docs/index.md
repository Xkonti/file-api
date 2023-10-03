# File API documentation

A simple RESTful API that allows you to manipulate files and directories.

> [!WARNING]
> This project is in early development stage.

> [!IMPORTANT]
> 💀 There are no robust protections against malicious users. This API is intended to be used as an internal API for simple projects. Usage of a service mesh that encrypts traffic between services is recommended.

## Setup

- [Running a Docker container](setup/docker.md)
- [API key](setup/apiKey.md)

## Endpoints

- Enumerate
  - [`GET /list` - List files and directories](endpoints/list/getList.md)
- Files
  - [`GET /file` - Download a file](endpoints/file/getFile.md)
  - [`POST /file` - Upload a file](endpoints/file/uploadFile.md)
  - [`GET /file/exists` - Check if a file exists](endpoints/file/checkFileExists.md)
  - [`GET /file/size` - Get the size of a file](endpoints/file/getFileSize.md)

## Roadmap

## Roadmap

### Directories

- [x] List files and directories in a directory as a flat list: `GET /list`
- [ ] List files and directories in a directory as a tree: `GET /tree`
- [ ] Check if a directory exists: `GET /dir/exists`
- [ ] Create a directory: `POST /dir`
- [ ] Delete a directory: `DELETE /dir`
- [ ] Rename a directory: : `POST /dir/rename`
- [ ] Move a directory: `POST /dir/move`
- [ ] Copy a directory: `POST /dir/copy`

### Files

- [x] Check if a file exists: `GET /file/exists`
- [x] Download a file: `GET /file`
- [x] Upload a file: `POST /file`
- [ ] Delete a file: `DELETE /file`
- [ ] Create an empty file: `POST /file/touch`
- [ ] Rename a file: `POST /file/rename`
- [ ] Move a file: `POST /file/move`
- [ ] Copy a file: `POST /file/copy`
- [ ] Get file metadata: `GET /file/meta`
- [x] Get file size: `GET /file/size`

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

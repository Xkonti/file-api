# file-api
A simple RESTful API that allows you to manipulate files and directories.

⚠️ This project is in early development stage.

💀 There are no robust protections against malicious users. This API is intended to be used as an internal API for simple projects. Usage of a service mesh that encrypts traffic between services is recommended.

## Roadmap

### Directories

- [x] List files and directories in a directory
- [ ] Check if a directory exists
- [ ] Create a directory
- [ ] Delete a directory
- [ ] Rename a directory
- [ ] Move a directory
- [ ] Copy a directory

### Files

- [ ] Check if a file exists
- [ ] Download a file
- [ ] Upload a file
- [ ] Delete a file
- [ ] Create an empty file
- [ ] Rename a file
- [ ] Move a file
- [ ] Copy a file
- [ ] Get file metadata

### Permissions

- [x] API key authentication
- [ ] Protect paths with API keys
- [ ] Protect operation categories with API keys
    - [ ] Listing files and directories
    - [ ] Downloading files
    - [ ] Uploading/copying files & creating directories
    - [ ] Deleting/moving/renaming files & directories

### Deployment

- [ ] Docker image on Docker Hub
- [ ] Docker image on GitHub Container Registry
- [ ] CI/CD pipeline using GitHub Actions and Dagger

## Stack

- Runtime: Bun
- Bundler: Bun
- API framework: Elysia.js
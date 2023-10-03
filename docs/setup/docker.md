# Running a Docker container

The File API is designed to run as a docker container. The image is available on [Docker Hub](https://hub.docker.com/r/xkonti/file-api).

## Configuration options:

- Internal port: `3000`
- Mount point for the directory to be managed via API: `/data`
- `API_KEY` environment variable: the API key to use for authentication

## Docker `run`

```bash
docker run -d \
  -p 3210:3000 \
  -e API_KEY=YOUR_API_KEY \
  -v /your/directory/to/mount:/data:rw \
  xkonti/file-api:latest
```

## Docker compose

```yaml
version: '3'

services:
  fileapi:
    image: xkonti/file-api:latest
    container_name: file-api
    restart: always
    ports:
      - 3210:3000
    volumes:
      - /your/directory/to/mount:/data:rw
    environment:
      API_KEY: YOUR_API_KEY
```

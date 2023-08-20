#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# Extract version number from package.json
version=$(grep '"version":' package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

# Get individual components of the version
major=$(echo $version | cut -d '.' -f 1)
minor=$(echo $version | cut -d '.' -f 2)
patch=$(echo $version | cut -d '.' -f 3)

# Build Docker images with different tags
docker build --pull -t xkonti/file-api:${major}.${minor}.${patch} .
docker build --pull -t xkonti/file-api:${major}.${minor} .
docker build --pull -t xkonti/file-api:${major} .
docker build --pull -t xkonti/file-api:latest .

# Publish Docker images to Docker Hub
docker push xkonti/file-api:${major}.${minor}.${patch}
docker push xkonti/file-api:${major}.${minor}
docker push xkonti/file-api:${major}
docker push xkonti/file-api:latest
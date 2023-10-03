import {afterEach, beforeEach, expect, test} from 'bun:test';
import {buildApp} from '../../app';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {fs1Files, fs1TestDirectoryContents, illegalPaths} from '../../testing/constants';
import {createTestFileSystem, destroyTestFileSystem} from '../../testing/testFileSystem';

function buildFileRequest(path: string | null) {
  let url = new UrlBuilder('http://localhost/file/exists');
  if (path != null) {
    url.setParam('path', path);
  }
  const requestBuilder = new RequestBuilder(url).setMethod('GET');
  return requestBuilder.build();
}

// App instance
let app: ReturnType<typeof buildApp>;

const files = fs1Files;
const filesList = Object.values(files);
const testDirectoryContents = fs1TestDirectoryContents;

beforeEach(async () => {
  await createTestFileSystem(testDirectoryContents);
  app = buildApp();
});

afterEach(async () => {
  await destroyTestFileSystem();
});

test('should return HTTP Status 204 if the file is found', async () => {
  for (const fileDef of filesList) {
    const request = buildFileRequest(fileDef.relativePath);
    const response = await app.handle(request);
    expect(response.status).toBe(204);
  }
});

test('should return a 404 if the file is not found', async () => {
  const filePath = `/path/to/nowhere`;
  const request = buildFileRequest(filePath);
  const response = await app.handle(request);
  expect(response.status).toBe(404);
});

test('should return a 404 if the path is not a file', async () => {
  const filePath = `/TerryPratchett`;
  const request = buildFileRequest(filePath);
  const response = await app.handle(request);
  expect(response.status).toBe(404);
});

test('should return 400 when no path is provided', async () => {
  // Empty string
  let request = buildFileRequest('');
  let response = await app.handle(request);
  expect(response.status).toBe(400);

  // The `path` param is not provided at all
  request = buildFileRequest(null);
  response = await app.handle(request);
  expect(response.status).toBe(400);
});

test('should return a 400 when illegal path', async () => {
  for (const illegalPath of illegalPaths) {
    const request = buildFileRequest(illegalPath);
    const response = await app.handle(request);
    expect(response.status).toBe(400);
  }
});
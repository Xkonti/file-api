import {beforeEach, expect, test} from 'bun:test';
import {buildApp} from '../../app';
import {setConfig} from '../../utils/config';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {
  dir1Name,
  emptyFileName,
  illegalPaths,
  loremFileContents,
  loremFileName,
  pathToNowhere,
  testingDirectoryRelativePath,
} from '../../testing/testingUtils.test';

function buildFileRequest(path: string | null) {
  let url = new UrlBuilder('http://localhost/file');
  if (path != null) {
    url.setParam('path', path);
  }
  const requestBuilder = new RequestBuilder(url).setMethod('GET');
  return requestBuilder.build();
}

// App instance
let app: ReturnType<typeof buildApp>;

beforeEach(() => {
  // Update config
  setConfig({
    apiKey: 'test',
    dataDir: './',
  });

  // Create app
  app = buildApp();
});

// TODO: Should return a 200 if the file is found
test('should return file contents if the file is found', async () => {
  const filePath = `${testingDirectoryRelativePath}/${loremFileName}`;
  const request = buildFileRequest(filePath);
  const response = await app.handle(request);
  expect(response.status).toBe(200);
  const bodyAsText = await response.text();
  expect(bodyAsText).toBe(loremFileContents);
});

test('should return a 404 if the file is not found', async () => {
  const filePath = `${testingDirectoryRelativePath}/${pathToNowhere}`;
  const request = buildFileRequest(filePath);
  const response = await app.handle(request);
  expect(response.status).toBe(404);
});

test('should return a 404 if the path is not a file', async () => {
  const filePath = `${testingDirectoryRelativePath}/${dir1Name}`;
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

// TODO: Should return a 200 if the file is empty
test('should return a 200 if the file is empty', async () => {
  const filePath = `${testingDirectoryRelativePath}/${emptyFileName}`;
  const request = buildFileRequest(filePath);
  const response = await app.handle(request);
  expect(response.status).toBe(200);
  const bodyAsText = await response.text();
  expect(bodyAsText).toBe('');
});

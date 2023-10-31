import {afterEach, beforeEach, expect, test} from 'bun:test';
import {buildApp} from '../../app';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {createTestFileSystem, destroyTestFileSystem} from '../../testing/testFileSystem';
import {fs1Files, fs1TestDirectoryContents, illegalPaths, testDirectory} from '../../testing/constants';
import {getFile} from '../../utils/fileUtils';
import {checkIfDirectoryExists} from '../../utils/directoryUtils';
import {join} from 'path';

function buildDeleteRequest(path: string | null) {
  let url = new UrlBuilder('http://localhost/file');
  if (path != null) {
    url.setParam('path', path);
  }
  return new RequestBuilder(url).setMethod('DELETE').build();
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
  await new Promise(resolve => setTimeout(resolve, 1));
});

test('should delete the file if it exists', async () => {
  for (const fileDef of filesList) {
    const request = buildDeleteRequest(fileDef.relativePath);
    const response = await app.handle(request);
    const absolutePath = fileDef.absolutePath;
    const file = await getFile(absolutePath);
    expect(file).toBeNull();
    expect(response.status).toBe(204);
  }
});

test('should return a 400 if the path is empty', async () => {
  const request = buildDeleteRequest(null);
  const response = await app.handle(request);
  expect(response.status).toBe(400);
});

test('should return a 400 if the path is invalid', async () => {
  for (const illegalPath of illegalPaths) {
    const request = buildDeleteRequest(illegalPath);
    const response = await app.handle(request);
    expect(response.status).toBe(400);
  }
});

test('should return a 404 if the file does not exist', async () => {
  const request = buildDeleteRequest('/path/to/strange-file.txt');
  const response = await app.handle(request);
  expect(response.status).toBe(404);
});

test('should return a 404 if the path is not a file', async () => {
  const request = buildDeleteRequest('/TerryPratchett');
  const response = await app.handle(request);
  expect(response.status).toBe(404);

  const filePath = join(testDirectory, 'TerryPratchett');
  const directory = await checkIfDirectoryExists(filePath);
  expect(directory).toBe(true);
});

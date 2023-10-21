import {afterEach, beforeEach, expect, test} from 'bun:test';
import {buildApp} from '../../app';

import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {fs1TestDirectoryContents, testDirectory} from '../../testing/constants';
import {createTestFileSystem, destroyTestFileSystem} from '../../testing/testFileSystem';

function buildDirRequest(path: string | null) {
  let url = new UrlBuilder('http://localhost/dir');
  if (path != null) {
    url.setParam('path', path);
  }
  const requestBuilder = new RequestBuilder(url).setMethod('POST');
  return requestBuilder.build();
}

// App instance
let app: ReturnType<typeof buildApp>;

const directories = fs1TestDirectoryContents;
// const directoriesList = Object.keys(directories).filter(directory => !directory.includes('.'));
const newDirectoriesList = ['ArthurCClarke', 'ArthurCClarke/2001-a-space-odyssey'];
const testDirectoryContents = fs1TestDirectoryContents;

beforeEach(async () => {
  await createTestFileSystem(testDirectoryContents);
  app = buildApp();
});

// afterEach(async () => {
//   await destroyTestFileSystem();
// });

test('should return HTTP Status 204 if the directory is successfully created', async () => {
  for (const directory of newDirectoriesList) {
    // const request = buildDirRequest(`${testDirectory}/${directory}`);
    const request = buildDirRequest(`./testdata/${directory}`);
    const response = await app.handle(request);
    expect(response.status).toBe(204);
  }
});

// test('should return a 404 if the directory is not found', async () => {
//   const dirPath = `/path/to/nowhere`;
//   const request = buildDirRequest(dirPath);
//   const response = await app.handle(request);
//   expect(response.status).toBe(404);
// });

// test('should return 400 when no dir is provided', async () => {
//   // Empty string
//   let request = buildDirRequest('');
//   let response = await app.handle(request);
//   expect(response.status).toBe(400);

//   // The `path` param is not provided at all
//   request = buildDirRequest(null);
//   response = await app.handle(request);
//   expect(response.status).toBe(400);
// });

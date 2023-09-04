import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import {buildApp} from '../../app';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {createTestFileSystem, destroyTestFileSystem} from '../../testing/testFileSystem';
import {illegalPaths, testDirectory} from '../../testing/constants';
import {getPermutations} from '../../testing/testingUtils.test';
import {getFile} from '../../utils/fileUtils';
import {join} from 'path';

const example1Content = 'This is an example file.';
const example1ContentAsBlob = new Blob([example1Content], {type: 'text/plain'});

// Example 2 is a bit longer. It's the same as example 1, but repeated 2000 times.
const example2Content = example1Content.repeat(2000);
const example2ContentAsBlob = new Blob([example2Content], {type: 'text/plain'});

function buildUploadRequest(
  path: string | null,
  overwrite: boolean | null,
  content: string | Blob | null,
  transferMethod: 'form-data' | 'raw',
  contentTypeOverride?: string,
) {
  let url = new UrlBuilder('http://localhost/file');
  if (path != null) {
    url.setParam('path', path);
  }
  if (overwrite != null) {
    url.setParam('overwrite', overwrite ? 'true' : 'false');
  }
  const requestBuilder = new RequestBuilder(url).setMethod('POST');

  // If transferMethod is 'form-data', send the content as a multipart/form-data request.
  if (transferMethod === 'form-data') {
    const formData = new FormData();
    if (content != null) {
      formData.append('file', content);
    }
    requestBuilder.setBody(formData);
  }

  // Otherwise, send the content as raw text.
  else if (transferMethod === 'raw') {
    if (content != null) {
      requestBuilder.setBody(content);
    }
    requestBuilder.setHeader('Content-Type', 'application/octet-stream');
  }

  if (contentTypeOverride != null) {
    requestBuilder.setHeader('Content-Type', contentTypeOverride);
  }

  return requestBuilder.build();
}

// App instance
let app: ReturnType<typeof buildApp>;

const defaultContents = 'This is an example file.';

beforeEach(async () => {
  await createTestFileSystem({
    '/existing.txt': defaultContents,
    exdir1: {
      'anotherExisting.jpg': defaultContents,
    },
    exdir2: {
      exists: defaultContents,
    },
  });
  app = buildApp();
});

afterEach(async () => {
  await destroyTestFileSystem();
});

describe.only('Upload file', () => {
  test.each(getPermutations(['', null], [false, true], ['form-data', 'raw']))(
    'should return 400 when path is empty',
    async (path, override, transferMethod) => {
      let request = buildUploadRequest(
        path,
        override,
        example1ContentAsBlob,
        transferMethod as 'form-data' | 'raw',
      );
      let response = await app.handle(request);
      expect(response.status).toBe(400);
    },
  );

  test.each(
    getPermutations(
      illegalPaths as string[],
      [false, true],
      [example1ContentAsBlob, example2ContentAsBlob],
      ['form-data', 'raw'],
    ),
  )(
    'should return 400 when path is invalid',
    async (illegalPath, override, content, transferMethod) => {
      let request = buildUploadRequest(
        illegalPath,
        override,
        content,
        transferMethod as 'form-data' | 'raw',
      );
      let response = await app.handle(request);
      expect(response.status).toBe(400);
    },
  );

  test.each(
    getPermutations(
      ['/file1.txt', '/dir1/file2.txt'],
      [false, true],
      ['', new Blob(undefined, {type: 'text/plain'})],
      ['form-data', 'raw'],
    ),
  )(
    'should return 400 when trying to upload empty file',
    async (path, override, content, transferMethod) => {
      let request = buildUploadRequest(
        path,
        override,
        content,
        transferMethod as 'form-data' | 'raw',
      );
      let response = await app.handle(request);
      expect(response.status).toBe(400);
    },
  );

  test.each(
    getPermutations(
      ['/existing.txt', 'exdir1/anotherExisting.jpg', '/exdir2/exists'],
      [example1ContentAsBlob, example2ContentAsBlob],
      ['form-data', 'raw'],
    ),
  )(
    'should return 409 when trying to upload a file that already exists and overwrite is false',
    async (path, content, transferMethod) => {
      let request = buildUploadRequest(path, false, content, transferMethod as 'form-data' | 'raw');
      let response = await app.handle(request);
      expect(response.status).toBe(409);

      // Make sure the file contents are not changed
      const absolutePath = join(testDirectory, path);
      const file = await getFile(absolutePath);
      expect(file).not.toBeNull();
      expect(file?.size).toBe(defaultContents.length);
      const fileContents = await file?.text();
      expect(fileContents).toBe(defaultContents);
    },
  );

  // Should return 201 when trying to upload a file that already exists and overwrite is true.
  test.each(
    getPermutations(
      ['/existing.txt', 'exdir1/anotherExisting.jpg', '/exdir2/exists'],
      [example1ContentAsBlob, example2ContentAsBlob],
      ['form-data', 'raw'],
    ),
  )(
    'should return 201 when trying to upload a file that already exists and overwrite is true',
    async (path, content, transferMethod) => {
      let request = buildUploadRequest(path, true, content, transferMethod as 'form-data' | 'raw');
      let response = await app.handle(request);
      console.log(
        'Path:',
        path,
        'Transfer method:',
        transferMethod,
        'Status:',
        response.status,
        'Body:',
        await response.text(),
      );
      expect(response.status).toBe(201);
      const absolutePath = join(testDirectory, path);
      const file = await getFile(absolutePath);
      expect(file).not.toBeNull();
      const expectedTextContents = content instanceof Blob ? await content.text() : content;
      expect(file?.size).toBe(expectedTextContents.length);
      const fileContents = await file?.text();
      expect(fileContents).toBe(expectedTextContents);
    },
  );

  // Should return 201 when uploading a file that does not exist.
  // The content of the file should be the same as the content of the request.

  // Should create a directory when uploading a file to a path that does not exist.

  // Should return 415 when uploading a file with an unsupported content type.
});

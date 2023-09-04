import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import {buildApp} from '../../app';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {createTestFileSystem, destroyTestFileSystem} from '../../testing/testFileSystem';
import {illegalPaths} from '../../testing/constants';
import {getPermutations} from '../../testing/testingUtils.test';

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

  return requestBuilder.build();
}

// App instance
let app: ReturnType<typeof buildApp>;

beforeEach(async () => {
  await createTestFileSystem({});
  app = buildApp();
});

afterEach(async () => {
  await destroyTestFileSystem();
});

describe('Upload file', () => {
  test.each(getPermutations(['', null], [false, true], ['form-data', 'raw']))(
    'should return 400 when path is empty',
    async (path, override, transferMethod) => {
      let request = buildUploadRequest(
        path as string | null,
        override as boolean,
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
        illegalPath as string,
        override as boolean,
        content as string | Blob | null,
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
        path as string,
        override as boolean,
        content as string | Blob | null,
        transferMethod as 'form-data' | 'raw',
      );
      let response = await app.handle(request);
      expect(response.status).toBe(400);
    },
  );
});

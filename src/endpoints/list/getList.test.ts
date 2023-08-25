import {describe, expect, test, beforeEach} from 'bun:test';
import {buildApp} from '../../app';
import {setConfig} from '../../utils/config';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {
  illegalPaths,
  loremFileName,
  prepTreeForComparison,
  testingDirectoryPath,
  testingDirectoryRelativePath,
  testingDirectoryTreeDepth1,
  testingDirectoryTreeDepth2,
  testingDirectoryTreeDepth3,
} from '../../testing/testingUtils.test';
import {DirectoryEntry} from '../../utils/directoryUtils';

function buildListRequest(
  path: string,
  dirs: boolean | undefined,
  depth: number | undefined,
  noAuth = false,
) {
  const url = new UrlBuilder('http://localhost/list').setParam('path', path);

  if (dirs != null) {
    url.setParam('dirs', dirs ? 'true' : 'false');
  }

  if (depth != null) {
    url.setParam('depth', depth.toString());
  }

  const requestBuilder = new RequestBuilder(url).setMethod('GET');

  if (noAuth) {
    requestBuilder.excludeApiKey();
  }

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

describe('getList()', async () => {
  test('should return proper depth 1 tree', async () => {
    const request = buildListRequest(testingDirectoryRelativePath, true, 1);
    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as DirectoryEntry[];
    const receivedTree = prepTreeForComparison(body, false);
    const expectedTree = prepTreeForComparison(testingDirectoryTreeDepth1, false);

    expect(receivedTree).toEqual(expectedTree);
  });

  test('should return proper depth 2 tree', async () => {
    const request = buildListRequest(testingDirectoryRelativePath, true, 2);
    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as DirectoryEntry[];
    const receivedTree = prepTreeForComparison(body, false);
    const expectedTree = prepTreeForComparison(testingDirectoryTreeDepth2, false);

    expect(receivedTree).toEqual(expectedTree);
  });

  test('should return proper depth 3 tree', async () => {
    const request = buildListRequest(testingDirectoryRelativePath, true, 3);
    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as DirectoryEntry[];
    const receivedTree = prepTreeForComparison(body, false);
    const expectedTree = prepTreeForComparison(testingDirectoryTreeDepth3, false);

    expect(receivedTree).toEqual(expectedTree);
  });

  // TODO: Move to separate API key tests
  test('should return 401 when no API key', async () => {
    const request = buildListRequest(testingDirectoryPath, true, 1, true);
    const response = await app.handle(request);
    expect(response.status).toBe(401);
  });

  test('should return 400 when no path provided', async () => {
    const request = buildListRequest('', true, 1);
    const response = await app.handle(request);
    expect(response.status).toBe(400);
  });

  test('should return 400 when illegal path', async () => {
    for (const illegalPath of illegalPaths) {
      const request = buildListRequest(illegalPath, true, 1);
      const response = await app.handle(request);
      expect(response.status).toBe(400);
    }
  });

  test('should return 400 when path is not a directory', async () => {
    const request = buildListRequest(`${testingDirectoryPath}/${loremFileName}`, true, 1);
    const response = await app.handle(request);
    expect(response.status).toBe(400);
  });

  test('should return 404 when path not found', async () => {
    const request = buildListRequest('this/path/does/not/exist', true, 1);
    const response = await app.handle(request);
    expect(response.status).toBe(404);
  });
});

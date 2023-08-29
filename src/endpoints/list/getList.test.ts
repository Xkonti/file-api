import {describe, expect, test, beforeEach, afterEach} from 'bun:test';
import {buildApp} from '../../app';
import {RequestBuilder} from '../../utils/requestBuilder';
import {UrlBuilder} from '../../utils/urlBuilder';
import {illegalPaths} from '../../testing/testingUtils.test';
import {DirectoryEntry, flattenFiles, listSorterByPath} from '../../utils/directoryUtils';
import {
  FileSystemConstructionEntry,
  createTestFileSystem,
  destroyTestFileSystem,
  generateDirectoryEntryCollections,
} from '../../testing/testFileSystem';

const testDirectoryContents: FileSystemConstructionEntry = {
  dir1: {
    'file3.empty': '',
  },
  dir2: {
    dir3: {
      'file4.empty': '',
    },
  },
  'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'file2.empty': '',
};

const depth3 = generateDirectoryEntryCollections('/', {
  dir1: {
    'file3.empty': '',
  },
  dir2: {
    dir3: {
      'file4.empty': '',
    },
  },
  'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'file2.empty': '',
} as FileSystemConstructionEntry);

const depth2 = generateDirectoryEntryCollections('/', {
  dir1: {
    'file3.empty': '',
  },
  dir2: {
    dir3: {},
  },
  'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'file2.empty': '',
} as FileSystemConstructionEntry);

const depth1 = generateDirectoryEntryCollections('/', {
  dir1: {},
  dir2: {},
  'file1.lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'file2.empty': '',
} as FileSystemConstructionEntry);

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

/**
 * Prepares a file/dirs tree for comparison by flattening it and sorting it by path.
 */
export function prepTreeForComparison(tree: DirectoryEntry[], excludeDirs: boolean) {
  return flattenFiles(tree, excludeDirs).sort(listSorterByPath);
}

// App instance
let app: ReturnType<typeof buildApp>;

beforeEach(async () => {
  await createTestFileSystem(testDirectoryContents);
  app = buildApp();
});

afterEach(async () => {
  await destroyTestFileSystem();
});

describe('getList()', async () => {
  test('should return proper depth 1 tree', async () => {
    const request = buildListRequest('/', true, 1);
    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as DirectoryEntry[];
    const receivedTree = prepTreeForComparison(body, false);
    const expectedTree = prepTreeForComparison(depth1.tree, false);

    expect(receivedTree).toEqual(expectedTree);
  });

  test('should return proper depth 2 tree', async () => {
    const request = buildListRequest('/', true, 2);
    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as DirectoryEntry[];
    const receivedTree = prepTreeForComparison(body, false);
    const expectedTree = prepTreeForComparison(depth2.tree, false);

    expect(receivedTree).toEqual(expectedTree);
  });

  test('should return proper depth 3 tree', async () => {
    const request = buildListRequest('/', true, 3);
    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = (await response.json()) as DirectoryEntry[];
    const receivedTree = prepTreeForComparison(body, false);
    const expectedTree = prepTreeForComparison(depth3.tree, false);

    expect(receivedTree).toEqual(expectedTree);
  });

  // TODO: Move to separate API key tests
  test('should return 401 when no API key', async () => {
    const request = buildListRequest('/', true, 1, true);
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
    const request = buildListRequest('file1.lorem', true, 1);
    const response = await app.handle(request);
    expect(response.status).toBe(400);
  });

  test('should return 404 when path not found', async () => {
    const request = buildListRequest('this/path/does/not/exist', true, 1);
    const response = await app.handle(request);
    expect(response.status).toBe(404);
  });
});

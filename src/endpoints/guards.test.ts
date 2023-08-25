import {beforeEach, describe, expect, test} from 'bun:test';
import {getConfig, setConfig} from '../utils/config';
import {buildApp} from '../app';
import {RequestBuilder} from '../utils/requestBuilder';

function buildRequest(
  url: string,
  method: string,
  headerKey: string | null,
  querykey: string | null,
) {
  let requestBuilder = new RequestBuilder(url).setMethod(method).excludeApiKey();
  if (headerKey !== null) {
    requestBuilder.setHeader('apikey', headerKey);
  }
  if (querykey !== null) {
    requestBuilder.getUrl().setParam('apikey', querykey);
  }
  return requestBuilder.build();
}

// App instance
let app: ReturnType<typeof buildApp>;

beforeEach(() => {
  // Update config
  setConfig({
    apiKey: 'testUniqueKey',
    dataDir: './',
  });

  // Create app
  app = buildApp();
});

const safeGetEndpoints = [
  'http://localhost/file',
  'http://localhost/list',
  'http://localhost/health',
  'http://localhost',
];

const safePostEndpoints = ['http://localhost/health', 'http://localhost'];

const notExistingEndpoints = ['http://localhost/abra/cadabra', 'http://localhost/12345'];

describe('API key guard', () => {
  test('should return a 401 if no API key', async () => {
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', null, null)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', null, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', null, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', null, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', null, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', null, null)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).toBe(401);
    }
  });

  test('should return a 401 if an invalid API key via headers', async () => {
    const invalidKey = 'invalidKey';
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', invalidKey, null)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', invalidKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', invalidKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', invalidKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', invalidKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', invalidKey, null)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).toBe(401);
    }
  });

  test('should return a 401 if an invalid API key via query', async () => {
    const invalidKey = 'invalidKey';
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', null, invalidKey)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', null, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', null, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', null, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', null, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', null, invalidKey)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).toBe(401);
    }
  });

  test('should allow access if a valid API key via headers', async () => {
    const validKey = getConfig().apiKey;
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', validKey, null)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', validKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', validKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', validKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', validKey, null)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', validKey, null)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).not.toBe(401);
    }
  });

  test('should allow access if a valid API key via query', async () => {
    const validKey = getConfig().apiKey;
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', null, validKey)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', null, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', null, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', null, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', null, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', null, validKey)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).not.toBe(401);
    }
  });

  test('should prioritize API keys via headers', async () => {
    const validKey = getConfig().apiKey;
    const invalidKey = 'totallyBad';
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', validKey, invalidKey)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', validKey, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', validKey, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', validKey, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', validKey, invalidKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', validKey, invalidKey)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).not.toBe(401);
    }
  });

  test('should ignore query if invalid in headers', async () => {
    const validKey = getConfig().apiKey;
    const invalidKey = 'totallyBad';
    const testSet = [
      ...safeGetEndpoints.map(path => buildRequest(path, 'GET', invalidKey, validKey)),
      ...safePostEndpoints.map(path => buildRequest(path, 'POST', invalidKey, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'GET', invalidKey, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'POST', invalidKey, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'PUT', invalidKey, validKey)),
      ...notExistingEndpoints.map(path => buildRequest(path, 'DELETE', invalidKey, validKey)),
    ];
    for (const request of testSet) {
      const response = await app.handle(request);
      expect(response.status).toBe(401);
    }
  });
});

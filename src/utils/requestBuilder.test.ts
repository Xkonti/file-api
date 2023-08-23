import {describe, expect, test} from 'bun:test';
import {RequestBuilder} from './requestBuilder';
import {UrlBuilder} from './urlBuilder';
import {getConfig, setConfig} from './config';
import {get} from 'http';

describe('RequestBuilder', async () => {
  test('should throw error when URL is invalid', () => {
    const urls = [
      '',
      '://example.com',
      'example.com',
      '/',
      '/hello.png',
      'https//bread',
      '&@9fn23*(%102=)0903\nadjw29',
    ];
    for (const url of urls) {
      expect(() => new RequestBuilder(url)).toThrow();
    }
  });

  test('should build proper GET request when proper URL', () => {
    // Trailing slashes should be after the domain, but not after the path
    const urls = [
      ['http://example.com', 'http://example.com/'],
      ['http://localhost/', 'http://localhost/'],
      ['https://localhost:8080', 'https://localhost:8080/'],
      [
        'ftp://something.somewhere.kind.of.far.away/',
        'ftp://something.somewhere.kind.of.far.away/',
      ],
      ['http://example.com/with/path', 'http://example.com/with/path'],
      [
        'http://example.com/with/path/and?query=string',
        'http://example.com/with/path/and?query=string',
      ],
      [new URL('http://example.com/with/path'), 'http://example.com/with/path'],
      [
        new URL('http://example.com/with/path/and?query=string'),
        'http://example.com/with/path/and?query=string',
      ],
      [new UrlBuilder('http://example.com'), 'http://example.com/'],
      [
        new UrlBuilder('http://localhost:3000/').setParam('query', 'string'),
        'http://localhost:3000/?query=string',
      ],
    ];

    for (const urlPair of urls) {
      const builder = new RequestBuilder(urlPair[0]);
      const request = builder.build();
      expect(request.method).toBe('GET');
      expect(request.url).toBe(urlPair[1]);
    }
  });

  test('should allow setting method', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    for (const method of methods) {
      const builder = new RequestBuilder('http://example.com').setMethod(method);
      const request = builder.build();
      expect(request.method).toBe(method);
    }
  });

  test('should allow replacing url', () => {
    const urls = [
      'http://example.com/',
      'http://example.com/with/path',
      'ftp://localhost:12345/root?hidden=true',
    ];
    for (const url of urls) {
      const builder = new RequestBuilder('http://wrong.site').setUrl(url);
      const request = builder.build();
      expect(request.url).toBe(url);
    }
  });

  test('should allow setting headers', () => {
    const headers = [
      ['Content-Type', 'application/json'],
      ['Accept', 'application/json'],
      ['X-Test', 'test'],
      ['X-Test', 'test2'],
    ];

    // Single header
    for (const header of headers) {
      const builder = new RequestBuilder('http://example.com').setHeader(header[0], header[1]);
      const request = builder.build();
      expect(request.headers.get(header[0])).toBe(header[1]);
    }

    // Multiple headers
    for (const header of headers) {
      const builder = new RequestBuilder('http://example.com')
        .setHeader(header[0], header[1])
        .setHeader('dummy-header', 'silly value');
      const request = builder.build();
      expect(request.headers.get(header[0])).toBe(header[1]);
      expect(request.headers.get('dummy-header')).toBe('silly value');
    }
  });

  test('should allow overwriting headers', () => {
    const builder = new RequestBuilder('http://example.com')
      .setHeader('X-Test', 'test')
      .setHeader('X-Test', 'test2');
    const request = builder.build();
    expect(request.headers.get('X-Test')).toBe('test2');
  });

  test('should automatically include apikey header', () => {
    setConfig({
      ...getConfig(),
      apiKey: 'test',
    });
    const builder = new RequestBuilder('http://example.com');
    const request = builder.build();
    expect(request.headers.get('apikey')).toBe(getConfig().apiKey);
  });

  test('should allow excluding apikey header', () => {
    const builder = new RequestBuilder('http://example.com').excludeApiKey();
    const request = builder.build();
    expect(request.headers.get('apikey')).toBeNull();
  });

  test('should allow modifying url', () => {
    const builder = new RequestBuilder('http://example.com/with/path');
    builder.getUrl().setParam('query', 'string');
    const request = builder.build();
    expect(request.url).toBe('http://example.com/with/path?query=string');
  });
});

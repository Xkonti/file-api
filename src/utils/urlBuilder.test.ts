import {describe, expect, test} from 'bun:test';
import {UrlBuilder} from './urlBuilder';

describe('UrlBuilder', () => {
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
      if (url.includes('wrong')) {
        console.log('The url that should be wrong:', new URL(url));
      }
      expect(() => new UrlBuilder(url)).toThrow();
    }
  });

  test('should build proper URL when proper URL', () => {
    const urls = [
      ['http://example.com', 'http://example.com/'],
      ['http://localhost/', 'http://localhost/'],
      ['https://localhost:8080', 'https://localhost:8080/'],
      [
        'ftp://something.somewhere.kind.of.far.away/',
        'ftp://something.somewhere.kind.of.far.away/',
      ],
      ['http://example.com/with/path', 'http://example.com/with/path'],
    ];

    for (const urlPair of urls) {
      const builder = new UrlBuilder(urlPair[0]);
      const built = builder.build();
      expect(built).toBe(urlPair[1]);
    }
  });

  test('should build proper URL when URL has query params', () => {
    const urls = [
      ['http://example.com?query=string', 'http://example.com/?query=string'],
      ['http://example.com/?query=string', 'http://example.com/?query=string'],
      ['http://example.com/with/path?query=string', 'http://example.com/with/path?query=string'],
      [
        'http://example.com/with/path/?query=string&another=one',
        'http://example.com/with/path/?query=string&another=one',
      ],
    ];

    for (const urlPair of urls) {
      const builder = new UrlBuilder(urlPair[0]);
      const built = builder.build();
      expect(built).toBe(urlPair[1]);
    }
  });

  test('should allow adding query params', () => {
    let builder = new UrlBuilder('http://example.com').setParam('param', 'value');
    expect(builder.build()).toBe('http://example.com/?param=value');
    builder = new UrlBuilder('http://example.com/with/path')
      .setParam('param', 'value')
      .setParam('param2', 'value2');
    expect(builder.build()).toBe('http://example.com/with/path?param=value&param2=value2');
  });

  test('should automatically encode param values', () => {
    const builder = new UrlBuilder('http://example.com/with')
      .setParam('param', 'val&ue')
      .setParam('param2', 'value=12');
    expect(builder.build()).toBe('http://example.com/with?param=val%26ue&param2=value%3D12');
  });
});

import {describe, expect, test} from 'bun:test';
import {getConfig, reloadConfig, setConfig} from './config';

test('config should be loaded from environment variables', () => {
  // Clear environment variables
  process.env.API_KEY = undefined;
  process.env.DATA_DIR = undefined;

  // Reload config
  reloadConfig();

  // Verify config
  expect(getConfig().apiKey).toBe(undefined);
  expect(getConfig().dataDir).toBe(undefined);

  // Set environment variables
  process.env.API_KEY = 'hello';
  process.env.DATA_DIR = '/world';

  // Reload config
  reloadConfig();

  // Verify config
  expect(getConfig().apiKey).toBe('hello');
  expect(getConfig().dataDir).toBe('/world');
});

test('config can be set manually with setConfig()', () => {
  // Clear environment variables
  process.env.API_KEY = undefined;
  process.env.DATA_DIR = undefined;

  // Reload config
  reloadConfig();

  // Verify config
  expect(getConfig().apiKey).toBe(undefined);
  expect(getConfig().dataDir).toBe(undefined);

  // Set config
  setConfig({
    apiKey: 'hi',
    dataDir: '/there',
  });

  // Verify config
  expect(getConfig().apiKey).toBe('hi');
  expect(getConfig().dataDir).toBe('/there');
});

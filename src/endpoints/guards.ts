import Elysia from 'elysia';
import {getConfig} from '../utils/config';

/**
 * Verifies that every request has a valid API key
 */
export function addApiKeyGuard(app: Elysia) {
  return app.onRequest(({request}) => {
    let apiKey = request.headers.get('apikey');
    if (apiKey == null) {
      apiKey = new URL(request.url).searchParams.get('apikey');
    }
    if (apiKey !== getConfig().apiKey) {
      throw new Error('unauthorized');
    }
  });
}

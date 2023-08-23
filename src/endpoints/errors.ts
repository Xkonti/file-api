import Elysia from 'elysia';

/**
 * Adds handling for the app-specific errors
 */
export function addErrorHandling(app: Elysia) {
  return app.onError(({error, set}) => {
    if (error.message === 'unauthorized') {
      set.status = 401;
      return 'Unauthorized';
    }
  });
}

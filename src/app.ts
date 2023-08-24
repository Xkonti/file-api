import Elysia from 'elysia';
import {addGetListEndpoint} from './endpoints/list/getList';
import {addApiKeyGuard} from './endpoints/guards';
import {addErrorHandling} from './endpoints/errors';
import {addGetFileEndpoint} from './endpoints/file/getFile';

export function buildApp() {
  let app = new Elysia();
  addErrorHandling(app);

  // Guards
  addApiKeyGuard(app);

  // Endpoints
  addGetListEndpoint(app);
  addGetFileEndpoint(app);
  return app;
}

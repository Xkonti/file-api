import Elysia from 'elysia';
import {addGetListEndpoint} from './endpoints/list/getList';
import {addApiKeyGuard} from './endpoints/guards';
import {addErrorHandling} from './endpoints/errors';
import {addGetFileEndpoint} from './endpoints/file/getFile';
import {addUploadFileEndpoint} from './endpoints/file/uploadFile';
import {addCheckFileExistsEndpoint} from './endpoints/file/checkFileExists';
import {addGetFileSizeEndpoint} from './endpoints/file/getFileSize';
import {addCheckDirExistsEndpoint} from './endpoints/dir/checkDirExists';

export function buildApp() {
  let app = new Elysia();
  addErrorHandling(app);

  // Guards
  addApiKeyGuard(app);

  // Endpoints
  addGetListEndpoint(app);
  addGetFileEndpoint(app);
  addGetFileSizeEndpoint(app);
  addUploadFileEndpoint(app);
  addCheckFileExistsEndpoint(app);
  addCheckDirExistsEndpoint(app);
  return app;
}

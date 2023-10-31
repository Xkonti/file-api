import Elysia from 'elysia';
import {addGetListEndpoint} from './endpoints/list/getList';
import {addApiKeyGuard} from './endpoints/guards';
import {addErrorHandling} from './endpoints/errors';
import {addCheckDirExistsEndpoint} from './endpoints/dir/checkDirExists';
import {createDirEndpoint} from './endpoints/dir/createDir';
import {addCheckFileExistsEndpoint} from './endpoints/file/checkFileExists';
import {addDeleteFileEndpoint} from './endpoints/file/deleteFile';
import {addGetFileEndpoint} from './endpoints/file/getFile';
import {addGetFileSizeEndpoint} from './endpoints/file/getFileSize';
import {addUploadFileEndpoint} from './endpoints/file/uploadFile';

export function buildApp() {
  let app = new Elysia();
  addErrorHandling(app);

  // Guards
  addApiKeyGuard(app);

  // Endpoints
  addCheckDirExistsEndpoint(app);
  addCheckFileExistsEndpoint(app);
  createDirEndpoint(app);
  addDeleteFileEndpoint(app);
  addGetFileEndpoint(app);
  addGetFileSizeEndpoint(app);
  addGetListEndpoint(app);
  addUploadFileEndpoint(app);

  return app;
}

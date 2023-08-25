import {buildApp} from './app';

const app = buildApp().listen(3000);

console.log(`File API is running at ${app.server?.hostname}:${app.server?.port}`);

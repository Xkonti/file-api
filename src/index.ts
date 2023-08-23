import {buildApp} from './app';

const app = buildApp().listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

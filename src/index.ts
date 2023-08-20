import { Elysia } from "elysia";
import { join } from "path";
import { flattenFiles, readDirectoryContents } from "./utils/directoryUtils";

const app = new Elysia()
    // Verify API key before handling any requests
    .onRequest(({ request }) => {
        let apiKey = request.headers.get('apikey');
        if (apiKey == null) {
            apiKey = new URL(request.url).searchParams.get('apikey');
        }
        if (apiKey !== process.env.API_KEY) {
            throw new Error('unauthorized');
        }
    })

    // Handle the unauthorized error
    .onError(({ error, set }) => {
        if (error.message === 'unauthorized') {
            set.status = 401;
            return 'Unauthorized';
        }
    })

    .get("list", async ({ query, set }) => {
        const relativePath = query.path ? query.path as string : null;

        // TODO: Add proper checks for path validity
        if (relativePath == null || relativePath.includes('..')) {
            set.status = 400;
            return "You must provide a valid path to a directory";
        }

        const includeDirectories = query.dirs === 'true';
        const depth = query.depth === undefined ? 1 : parseInt(query.depth as string);
        const directoryPath = join(process.env.DATA_DIR as string, relativePath);
      
        const entries = await readDirectoryContents(directoryPath, relativePath, depth);

        // Handle the occurrence of an error
        if (typeof entries === 'string') {
            if (entries === 'no-path') {
                set.status = 400;
                return "You must provide a valid path to a directory";
            }

            set.status = 500;
            return 'An unknown error occurred';
        }


        // If we are not including directories, then we need to filter them out
        // We still need to include the contents of the directories though
        let result = entries;
        if (!includeDirectories) {
            result = flattenFiles(entries);
        }

        return result;
    })

    .listen(3000);


console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

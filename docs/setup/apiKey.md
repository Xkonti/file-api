# API Key

An API key must be configured in order to use the API. The API key can be configured using the `API_KEY` environment variable. Please use something that is base64 encoded so that it can be used in HTTP headers and URL query.

Each HTTP request will be first checked for API key. If the API key is not provided, the request will be rejected with a `401 Unauthorized` response. The API key can be provided in two ways:

- HTTP header: `api-key` - example: `curl --request GET --url 'http://localhost:3000/list?path=%2F' --header 'apikey: YOUR_API_KEY'`
- Query parameter: `apikey` - example: `curl --request GET --url 'http://localhost:3000/list?path=%2F&apikey=YOUR_API_KEY'`

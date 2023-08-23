/**
 * A utility class for building URLs that allows joining multiple path segments and specifying query parameters.
 */
export class UrlBuilder {
  url: URL;
  query: Record<string, {value: string; encoded: boolean}> = {};

  constructor(url: string | URL) {
    this.url = typeof url === 'string' ? new URL(url) : url;
  }

  /**
   * Adds a query parameter to the URL.
   * @param key A string representing the query parameter key.
   * @param value A string representing the query parameter value.
   */
  setParam(key: string, value: string) {
    this.url.searchParams.set(key, value);
    return this;
  }

  /**
   * Builds the final URL using the current state of the builder.
   * @returns The built URL as a string.
   */
  build() {
    return this.url.href;
  }
}

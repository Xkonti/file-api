import {getConfig} from './config';
import {UrlBuilder} from './urlBuilder';

export class RequestBuilder {
  private headers: Headers = new Headers();
  private method: RequestInit['method'] = 'GET';
  private urlBuilder: UrlBuilder;
  private apiKeyHeader = true;
  private body: BodyInit | null = null;

  constructor(url: string | URL | UrlBuilder) {
    if (typeof url === 'string' || url instanceof URL) {
      this.urlBuilder = new UrlBuilder(url);
    } else {
      this.urlBuilder = url;
    }
  }

  /**
   * Sets the request method.
   */
  setMethod(method: RequestInit['method']) {
    this.method = method;
    return this;
  }

  /**
   * Sets the request URL.
   * @param url A string representing the URL to set, or a `UrlBuilder` instance.
   */
  setUrl(url: string | UrlBuilder) {
    if (typeof url === 'string') {
      this.urlBuilder = new UrlBuilder(url);
    } else {
      this.urlBuilder = url;
    }
    return this;
  }

  /**
   * Adds an HTTP header.
   */
  setHeader(key: string, value: string) {
    this.headers.set(key, value);
    return this;
  }

  /**
   * Sets the request body.
   */
  setBody(body: BodyInit) {
    this.body = body;
    return this;
  }

  /**
   * Out out the `apikey` header.
   */
  excludeApiKey() {
    this.apiKeyHeader = false;
    return this;
  }

  /**
   * Gets the current URL builder so that it can be manipulated.
   * @returns The current URL builder.
   */
  getUrl() {
    if (this.urlBuilder === null) throw new Error('URL not set');
    return this.urlBuilder;
  }

  /**
   * Builds the request using the current state of the builder.
   */
  build() {
    let url = this.urlBuilder.build();
    const request = new Request(url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    });

    if (this.apiKeyHeader) {
      request.headers.set('apikey', getConfig().apiKey);
    }

    return request;
  }
}

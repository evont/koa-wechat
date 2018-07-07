const request = require('request');

function buildRequestPromise(req, options) {
  return new Promise((resolve, reject) => {
    req(options, (err, response, body) => {
      if (err) reject(err);
      resolve({ response, body });
    });
  });
}

/**
 * 请求客户端
 * @class
 * @example
 *
 * // 创建基于某个域名的客户端
 * let client = new HttpClient({ baseUrl: 'http://domain.com' });
 *
 * // 执行该域名的请求，options 与 request 库相同，url 为相对路径
 * let {response, body} = yield client.request({ url: '/relative/path' });
 *
 * // 如果为公司内部接口调用，可以加个适配器，优雅处理常见异常
 * let body = yield client.request(options).then(HttpClient.responseAdapter);
 *
 * // 也可以直接使用
 * let {response, body} = yield HttpClient.request({ url: '/absolute/path' });
 */
class HttpClient {
  /**
   * 执行请求
   * @param options - 调用 request(options)
   * @returns {Promise} request Promise
   */
  static request(options) {
    return buildRequestPromise(request, options);
  }

  static getJar(url, cookies) {
    const j = request.jar();
    cookies.forEach((cookie) => {
      j.setCookie(request.cookie(cookie), url);
    });
    return j;
  }

  static responseAdapter({ response, body }) {
    if (response.statusCode < 400) return body;
    if (response.statusCode === 404) return null;
    // logger.warn({req: response.request, res: response}, response.request.uri.path);
    throw new Error('远程服务器异常');
  }
}

module.exports = HttpClient;

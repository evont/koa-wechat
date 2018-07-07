
const crypto = require('crypto');
const HttpClient = require('./httpClient');

const config = {
  appid: '',
  appsecret: '',
  miniGameMap: { // 小程序对应appid & appsecret，应存放在数据库中
    app: {
      appid: '',
      appsecret: '',
    },
  },
};
const { appid, appsecret, miniGameMap } = config;

let jsApiTicket = '';

/**
 * 微信封装工具类
 * @class wechat
 * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
 */
class wechat {
  static getAppId() {
    return appid;
  }

  static getJsApiTicket() {
    return jsApiTicket;
  }

  /**
     * 返回一个随机字符串，用于防止重放攻击
     */
  static getNonceStr() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 16; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
       * 当前的时间戳
       */
  static getTimestamp() {
    return (`${new Date().valueOf()}`).slice(0, -3);
  }

  /**
     * 待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式拼接，并使用sha1加密
     * @static
     * @param {String} jsApiTicket - 用于调用微信JS接口的临时票据
     * @param {String} noncestr - 随机字符串
     * @param {String} timestamp - 时间戳
     * @param {String} url - 当前网页的URL，不包含#及其后面部分
     */
  static getSign(apiTicket, noncestr, timestamp, url) {
    const sortData = `jsapi_ticket=${apiTicket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
    return crypto.createHash('sha1').update(sortData).digest('hex');
  }

  /**
     * 获取微信授权页面
     * @param {String} gamename - 微信页面名
     * @param {Object} context - Koa 上下文
     */
  static getWechatAuthURL(gamename, context) {
    const redirectURL = encodeURIComponent(`${context.protocol}://${context.host}/wechat/middle.html`);
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectURL}&response_type=code&scope=snsapi_userinfo&state=${gamename}#wechat_redirect `;
  }

  /**
     * 请求获取微信凭证(accessToken)
     */
  static fetchAccessTokenRequest() {
    const reqUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
    return HttpClient.request(reqUrl).then(HttpClient.responseAdapter);
  }

  /**
     * 请求获取微信卡券信息，根据缓存的accessToken进行获取
     */
  static fetchJsApiTicket(accessToken) {
    const reqUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    return HttpClient.request(reqUrl).then(HttpClient.responseAdapter);
  }

  /**
     * 先请求获取微信凭证，再以此获取卡券信息，并缓存api ticket
     * 同时请求，只缓存api ticket，暂不考虑缓存access_token
     */
  static fetchTicket() {
    return wechat.fetchAccessTokenRequest().then((res) => {
      const result = JSON.parse(res);
      let accessToken = '';
      if (result.access_token) {
        accessToken = result.access_token;
      }
      return wechat.fetchJsApiTicket(accessToken);
    }).then((res) => {
      const result = JSON.parse(res);
      if (result.ticket) {
        jsApiTicket = result.ticket;
      }
      setTimeout(() => {
        wechat.fetchTicket();
      }, 60 * 60 * 1000);
      return result.ticket;
    });
  }

  /**
     * 获取微信配置信息
     * @param {String} clientUrl - 客户端链接，用于拼装签名地址
     * @returns {Object} JsApiData - 微信配置信息
     */
  static async getJsApiData(clientUrl) {
    const noncestr = wechat.getNonceStr();
    const timestamp = wechat.getTimestamp();
    let apiTicket = wechat.getJsApiTicket();
    apiTicket = jsApiTicket === '' ? await wechat.fetchTicket() : jsApiTicket;
    const signature = wechat.getSign(apiTicket, noncestr, timestamp, clientUrl);
    const JsApiData = {
      appId: wechat.getAppId(), // 公众号的唯一标识
      nonceStr: noncestr, // 生成签名的随机串
      timestamp, // 生成签名的时间戳
      signature, // 签名
      url: clientUrl, // 请求的地址
    };
    return JsApiData;
  }

  /**
   * 获取小程序（小游戏） session_key 和 openid 等
   * @param {string} code 临时登录凭证
   * @param {string} appName 应用名
   */
  static getMiniLoginData(code, appName) {
    const gameInfo = miniGameMap[appName];
    let result = {
      errcode: 40029,
      errMsg: '无效的应用信息',
    };

    if (gameInfo) {
      const miniappid = gameInfo.appid;
      const miniappsecret = gameInfo.appsecret;
      const reqUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${miniappid}&secret=${miniappsecret}&js_code=${code}&grant_type=authorization_code`;
      result = HttpClient.request(reqUrl).then(HttpClient.responseAdapter);
    }

    return result;
  }
}

module.exports = wechat;

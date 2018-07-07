const wechat = require('../util/wechat');

wechat.fetchTicket();

module.exports = {
  /**
   * 获取微信配置信息
   */
  async getConfig(ctx) {
    const { url } = ctx.query; // 页面地址
    const data = await wechat.getJsApiData(decodeURIComponent(url));
    ctx.body = data;
  },
  /**
   * 获取小程序用户appid
   */
  async minilogin(ctx) {
    const { code, appName } = ctx.query; // code: 用户登录凭证, appName: 小程序名称
    const data = await wechat.getMiniLoginData(code, appName);
    ctx.body = data;
  },
};

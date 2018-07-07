module.exports = class util {
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
};

const Router = require('koa-router');
const ctrl = require('./ctrl');

module.exports = (app) => {
  const router = new Router();

  router.get('/wechat/getConfig.action', ctrl.wechat.getConfig);
  router.get('/wechat/mini/login.action', ctrl.wechat.minilogin);

  app.use(router.routes());
};

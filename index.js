const Koa = require('koa');
const route = require('./route');

const port = process.env.PORT || 8088;

const app = new Koa()
route(app);

app.listen(port, () => {
  console.log(`${'application running at http://127.0.0.1:'}${port}`);
});

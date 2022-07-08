const Http = require('http');
const app = require('./app');
const db = require('./models');
const webSocket = require('./dist/modules/socket');

const port = process.env.PORT;

const http = Http.createServer(app);

webSocket(http);

db.sequelize
  .sync({ force: false, logging: false })
  .then(() => console.log('🟢 db 연결 성공'))
  .catch(console.error);

http.listen(port, () => {
  console.log('🟢 서버 연결');
});
// test

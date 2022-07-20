const Http = require('http');
const Https = require('https');
const app = require('./app');
const db = require('./models');
const webSocket = require('./dist/modules/socket');

const port = process.env.PORT;

const http = Http.createServer(app);
const https = Https.createServer(options, app).listen(443);

webSocket(https);

db.sequelize
  .sync({ force: false, logging: false })
  .then(() => console.log('🟢 db 연결 성공'))
  .catch(console.error);

http.listen(port, () => {
  console.log('🟢 서버 연결');
});

const { createServer } = require('http');
const SocketIO = require('socket.io');
const Client = require('socket.io-client');

require('dotenv').config();

describe('my socket project', () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = SocketIO(httpServer);
    httpServer.listen(() => {
      const port = process.env.PORT;
      clientSocket = new Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  //   test('should work', (done) => {
  //     clientSocket.on('hello', (arg) => {
  //       expect(arg).toBe('world');
  //       done();
  //     });
  //     serverSocket.emit('hello', 'world');
  //   });

  test('should work (with ack)', () => {
    io.on('connection', (socket) => {
      serverSocket = socket;
      serverSocket.on('message', (data) => {
        expect(data).toBe({
          type: 'message',
          name: undefined,
          message: data.message,
          time: data.time,
        });
      });
    });

    clientSocket.emit('message', { message: '안녕', time: '2022-07-07' });
  });
});

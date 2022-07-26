const { Server } = require('socket.io');

class Socket {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
      },
    });
    this.io.on('connection', (socket) => {
      console.log('연결됐습니다!');
      let { name, room } = socket;
      const checkCounts = (room) => this.io.sockets.adapter.rooms.get(room)?.size || 0;
      socket.emit('search', {
        rooms: [
          ...new Set(
            [...this.io.sockets.adapter.sids.values()].map((data) => [...data][1])
          ),
        ],
      });

      // io.sockets.adapter.sids를 하면 map으로 websocket에 들어온 socket id와 참가한 방이 나온다.
      // Map은 key, value 형식이므로 value()로 접근해 id와 room에 접근
      // 1번쨰 인덱스에 내가 참가한 방이 나오므로 map을 돌면서 첫번쨰 인덱스만 다 가지고 온다. Set으로 중복 데이터를 없앤다

      socket.on('newUser', (data) => {
        name = data.name;
        room = data.room;

        if (checkCounts(room) >= 2) {
          return socket.emit('roomfull');
        }
        socket.join(room);
        this.io.to(room).emit('me', socket.id);
        this.io.to(room).emit('update', {
          type: 'connect',
          name,
          count: checkCounts(room),
        });
        console.log(`${name}님이 참가했습니다. (총 ${checkCounts(room)}명)`);
      });

      socket.on('message', (data) => {
        socket.to(room).emit('update', {
          type: 'message',
          nick: data.nick,
          message: data.message,
          time: data.time,
          count: checkCounts(room),
        });
        console.log(`${data.nick} : ${data.message} (총 ${checkCounts(room)}명)`);
      });

      // disconnect됐을 때 나가기가 있는데 바로 반영이 안돼서 채팅방 나가기 버튼을 누르면 room에서 내보내도록 설정
      socket.on('leaveRoom', () => {
        socket.leave(room);
        this.io.to(room).emit('update', {
          type: 'leavRoom',
          name,
          count: checkCounts(room),
        });
      });

      // 화상채팅

      socket.emit('me', socket.id);

      socket.on('callUser', (data) => {
        this.io.to(data.userToCall).emit('callUser', {
          signal: data.signalData, //sdp
          from: data.from,
          name: data.name,
        });
      });

      socket.on('answerCall', (data) => {
        this.io.to(data.to).emit('callAccepted', data.signal);
      });

      socket.on('disconnect', () => {
        socket.broadcast.emit('callEnded');
        socket.leave(room);
        this.io.to(room).emit('update', {
          type: 'disconnect',
          name,
          count: socketInstance.checkCounts(room),
        });
        console.log(`${name}님이 나갔습니다. (총 ${socketInstance.checkCounts(room)}명)`);
      });
    });
  }
}

let socket;
function initSocket(server) {
  if (!socket) {
    socket = new Socket(server);
  }
}

function getSocketIO() {
  if (!socket) {
    throw new Error('소켓 연결 안됨!');
  }
  return socket.io;
}

module.exports = { initSocket, getSocketIO };

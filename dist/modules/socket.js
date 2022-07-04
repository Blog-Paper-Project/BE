const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server, {
    cors: {
      origin: '*',
    },
  });

  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;

  io.on('connection', (socket) => {
    console.log('연결됐습니다.', socket.id, socket.rooms);

    let roomID;
    let nickname;
    socket.on('join-room', (payload) => {
      console.log(payload);
      roomID = payload.roomId;
      nickname = payload.nick;
      console.log(rooms.get(roomID)?.size === 1);
      if (rooms.get(roomID)?.size === 2) {
        return io.to(roomID).emit('fail-join');
      } else {
        socket.join(roomID);
      }
      console.log(rooms.get(roomID)?.size);
      io.to(roomID).emit('user-connected', nickname, socket.rooms);
    });

    socket.on('message', (data) => {
      socket.to(roomID).emit('message', data, nickname);
      console.log(socket.rooms);
    });

    socket.on('disconnect', () => {
      console.log('클라이언트 접속 해제', socket.id);
      socket.leave(roomID);
      socket.to(roomID).emit('leave', `${nickname}님이 퇴장했습니다.`);
    });
  });
};

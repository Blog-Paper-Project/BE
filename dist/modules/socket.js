const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server, {
    cors: {
      origin: '*',
    },
  });

  const checkCounts = (room) => io.sockets.adapter.rooms.get(room)?.size || 0;

  io.on('connection', (socket) => {
    console.log('연결됐습니다!!');
    let { name, room } = socket;
    socket.emit('me', socket.id); // 화상채팅
    socket.emit('search', {
      rooms: [
        ...new Set([...io.sockets.adapter.sids.values()].map((data) => [...data][1])),
      ],
    });

    socket.on('newUser', (data) => {
      name = data.name;
      room = data.room;
      if (checkCounts(room) >= 2) {
        return io.emit('roomfull');
      }
      socket.join(room);

      console.log([
        ...new Set([...io.sockets.adapter.sids.values()].map((data) => [...data][1])),
      ]);

      io.to(room).emit('update', {
        type: 'connect',
        name,
        count: checkCounts(room),
      });
      console.log(`${name}님이 참가했습니다. (총 ${checkCounts(room)}명)`);
    });

    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit('callUser', { signal: signalData, from, name });
    }); // 화상채팅

    socket.on('answerCall', (data) => {
      io.to(data.to).emit('callAccepted', data.signal);
    }); // 화상채팅

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

    socket.on('disconnect', () => {
      socket.leave(room);
      socket.broadcast.emit('callEnded'); // 화상채팅
      io.to(room).emit('update', {
        type: 'disconnect',
        name,
        count: checkCounts(room),
      });
      console.log(`${name}님이 나갔습니다. (총 ${checkCounts(room)}명)`);
    });
  });
};

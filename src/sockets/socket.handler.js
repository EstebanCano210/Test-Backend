const usuariosConectados = new Map();

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      usuariosConectados.set(userId, socket.id);
    }

    socket.on('disconnect', () => {
      for (const [uid, sid] of usuariosConectados.entries()) {
        if (sid === socket.id) usuariosConectados.delete(uid);
      }
    });
  });

  io.enviarNotificacion = (userId, data) => {
    const socketId = usuariosConectados.get(userId);
    if (socketId) {
      io.to(socketId).emit('notificacion', data);
    }
  };
};

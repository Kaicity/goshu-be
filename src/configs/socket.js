const { Server } = require('socket.io');

let io;

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_PORT || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Ví dụ: Nhận sự kiện từ client
    socket.on('newEmployee', (data) => {
      console.log('📦 New employee received from client:', data);
      socket.broadcast.emit('employeeAdded', data);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

module.exports = { setupSocket, getIO };

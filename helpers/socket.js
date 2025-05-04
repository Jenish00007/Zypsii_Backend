const socketIO = require('socket.io');
const { server } = require('../socket/socket');

const io = socketIO(server, {
  cors: {
    origin: process.env.ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
  });
});

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

module.exports = { io, getReceiverSocketId }; 
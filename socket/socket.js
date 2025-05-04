const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Use CORS as middleware for Express
app.use(cors({
    origin: process.env.ORIGINS, // Or use process.env.CLIENT_URL
    credentials: true,
}));

const io = new Server(server, {
    cors: {
        origin: process.env.ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Map to store user IDs and their socket IDs
const userSocketMap = {};

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // When a user connects, store their socket ID
    socket.on('setup', (userId) => {
        userSocketMap[userId] = socket.id;
        console.log('User connected:', userId, 'Socket ID:', socket.id);
    });

    // When a user disconnects, remove their socket ID
    socket.on('disconnect', () => {
        const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
        if (userId) {
            delete userSocketMap[userId];
            console.log('User disconnected:', userId);
        }
    });
});

// Function to get socket ID of a user
const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
};

module.exports = { io, app, server, getReceiverSocketId };

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

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
});

module.exports = { io, app, server };
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');
const path = require('path');
const app = express();
const cors = require('cors');
const { logger } = require('../utils/logger');
require('dotenv').config();


const server = http.createServer(app);
const io = socketIo(server);
// local imports
const { connectDB } = require('../dataSource/dbConnections');
const { globalErrors, routeNotFound } = require('../helpers/errorHandlers');

const LOG_ID = 'server/app';

// pre-routes
logger.info(LOG_ID, '~~~ setting up middlewares for app ~~~');
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), '/public')));

connectDB();
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('join', (room) => {
        socket.join(room.userId);
        console.log(`User joined room: ${room}`);
        socket.emit('roomjoined', { message: 'room created', roomId: room.userId });
    });
    socket.on('getuserLocation', (data) => {
        console.log('Message received: ', data);
        socket.to(data.userId).emit('sendcheck', { success: true, message: 'user location fetched successfully.', userId: data.userId || 'ajshlasd' });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// routes
require('../routes')(app);

//  error
app.use(routeNotFound);
app.use(globalErrors);

exports.app = server;

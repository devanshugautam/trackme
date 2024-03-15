/* eslint-disable no-undef */
const { userModel } = require('../dbModel');

/**
 * configuration of sockets
 *
 * @param {string} io the socket server instance
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('join', (room) => {
            const data = JSON.parse(room);
            socket.join(data.userId);
            console.log(`User joined room: ${data.userId}`);
            socket.emit('roomjoined', { message: 'room created', roomId: data.userId });
        });
        socket.on('getuserLocation', async (data) => {
            const info = JSON.parse(data);
            console.log('Message received: ', info);
            const update = await userModel.findOneAndUpdate({ _id: info.userId }, { latitude: info.lat, longitude: info.long, coordinates: [info.long, info.lat] }, { new: true });
            if (update) {
                console.log('updated user', update);
                io.to(info.userId).emit('sendcheck', { success: true, message: 'user location fetched successfully.', userId: info.userId || 'ajshlasd' });
            }
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
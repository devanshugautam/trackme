//  Local import
const { userModel, userOverSpeedModel } = require('../dbModel');
const { getSpeedLimit } = require('./speedLimit');
const { query } = require('../utils/mongodbQuery');
/**
 * configuration of sockets
 * Set up socket.io connection
 *
 * @param {string} io the socket server instance
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Join a room based on user ID
        socket.on('join', (room) => {
            const data = JSON.parse(room);
            socket.join(data.userId);
            console.log(`User joined room: ${data.userId}`);
            socket.emit('roomjoined', { message: 'room created', roomId: data.userId });
        });

        // Receive user location data
        socket.on('getuserLocation', async (data) => {
            const info = JSON.parse(data);
            console.log('Message received: ', info);

            // Update user location in the database
            const update = await userModel.findOneAndUpdate(
                { _id: info.userId },
                { latitude: info.lat, longitude: info.long, coordinates: [info.long, info.lat] },
                { new: true }
            );

            // Get the speed limit for the location
            const findSpeedLimit = await getSpeedLimit();

            // Emit over-speed alert if speed exceeds the limit
            if (findSpeedLimit.success && info.speed > findSpeedLimit.data.speedLimit) {
                await query.create(userOverSpeedModel, {
                    speed: info.speed,
                    longitude: info.long,
                    latitude: info.lat,
                    coordinates: [info.long, info.lat],
                    userId: info.userId,
                    vehicleType: findSpeedLimit.data.vehicleType,
                    laneType: findSpeedLimit.data.laneType,
                    speedLimit: findSpeedLimit.data.speedLimit,
                    speedLimitId: findSpeedLimit.data._id
                });
                io.to(info.userId).emit('overSpeed', {
                    success: true,
                    message: `Over-speed alert: Vehicle exceeded the speed limit of ${findSpeedLimit.data.speedLimit} km/h. Current speed: ${info.speed} km/h.`,
                    userId: info.userId
                });
            }

            // Emit success message for location update
            if (update) {
                // console.log('updated user', update);
                io.to(info.userId).emit('sendcheck', { success: true, message: 'user location fetched successfully.', userId: info.userId || 'ajshlasd' });
            }
        });

        socket.on('reportAccident', (data) => {
            console.log('data>>>>>>>>>>>>>', data);
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

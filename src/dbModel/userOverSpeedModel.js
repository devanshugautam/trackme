const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;


/**
 * @typedef {object} UserOverSpeed
 * @property {string} userId - The ID of the user.
 * @property {number} speed - The speed of the vehicle.
 * @property {string} vehicleType - The type of the vehicle.
 * @property {string} laneType - The type of the lane.
 * @property {Array<number>} coordinates - Array of coordinates.
 * @property {string} latitude - The latitude coordinate.
 * @property {string} longitude - The longitude coordinate.
 * @property {number} speedLimit - The speed limit that has exceed.
 * @property {string} speedLimitId - The speed limit id.
 * @property {boolean} isDeleted - Indicates if the record is deleted or not.
 * @property {Date} createdAt - The date and time when the record was created.
 * @property {Date} updatedAt - The date and time when the record was last updated.
 */

/**
 * Represents a schema for tracking user overspeed events.
 */
const userOverSpeed = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User'
        },
        speed: {
            type: Number,
            required: true
        },
        vehicleType: {
            type: String,
            required: true
        },
        laneType: {
            type: String,
            required: true
        },
        coordinates: {
            type: Array,
            default: []
        },
        latitude: {
            type: String,
            default: ''
        },
        longitude: {
            type: String,
            default: ''
        },
        speedLimit: {
            type: Number,
            required: true
        },
        speedLimitId: {
            type: Types.ObjectId,
            ref: 'speedLimit'
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = model('userOverSpeed', userOverSpeed);
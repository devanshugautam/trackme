const mongoose = require('mongoose');
const { Schema, model } = mongoose;


/**
 * @typedef {object} speedLimit
 * @property {string} speedLimit - The spped limit of vehicle in KMPH.
 * @property {string} vehicleType - The type of vehicle.
 * @property {string} laneType - The type of lane.
 * @property {boolean} isActive - Indicates if the user is active or not.
 * @property {boolean} isDeleted - Indicates if the user is deleted or not.
 * @property {Date} createdAt - The date and time when the user was created.
 * @property {Date} updatedAt - The date and time when the user was last updated.
 */

/**
 * Mongoose schema for speed limit.
 * 
 * @type {mongoose.Schema<speedLimit>}
 */
const speedLimit = new Schema(
    {
        speedLimit: {
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
        isActive: {
            type: Boolean,
            default: true
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

module.exports = model('speedLimit', speedLimit);
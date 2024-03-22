const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

/**
 * Mongoose schema for User Accident Report.
 */
const AccidentReport = new Schema(
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
            default: null
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

module.exports = model('accidentReport', AccidentReport);
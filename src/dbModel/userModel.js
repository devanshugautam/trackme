const mongoose = require('mongoose');
const { Schema, model } = mongoose;


/**
 * @typedef {object} User
 * @property {string} fname - The first name of the user.
 * @property {string} lname - The last name of the user.
 * @property {string} username - The username of the user.
 * @property {string} address - The address of the user.
 * @property {string} image - The image URL of the user.
 * @property {string} email - The email address of the user.
 * @property {string} mobile - The mobile number of the user.
 * @property {Array<string>} sosNumber - Array of emergency contact numbers.
 * @property {string} mobileCode - The country code for the mobile number.
 * @property {string} password - The password of the user.
 * @property {string} token - The authentication token of the user.
 * @property {boolean} isActive - Indicates if the user is active or not.
 * @property {boolean} isDeleted - Indicates if the user is deleted or not.
 * @property {Date} createdAt - The date and time when the user was created.
 * @property {Date} updatedAt - The date and time when the user was last updated.
 */

/**
 * Mongoose schema for user.
 * 
 * @type {mongoose.Schema<User>}
 */
const userSchema = new Schema(
    {
        fname: {
            type: String,
            required: true
        },
        lname: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        mobile: {
            type: String,
            default: ''
        },
        sosNumber: {
            type: Array,
            default: []
        },
        mobileCode: {
            type: String,
            default: '+91'
        },
        password: {
            type: String,
            required: true
        },
        token: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        coordinates: {
            type: Array,
            default: []
        },
        latitude: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            default: 'user'
        },
        longitude: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = model('User', userSchema);
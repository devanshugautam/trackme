const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { userService } = require('../services');
const { userValidators: { registerUser, login, getAllUser,editUser } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const router = express.Router();

const LOG_ID = 'routes/user';

/**
 * Route for user login.
 */
router.post('/login', validate(login), async (req, res) => {
    try {
        const result = await userService.login(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for user registration.
 */
router.post('/register', validate(registerUser), async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during registration: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Get all users according to organisation.
 */
router.get('/getall', jwtVerify, validate(getAllUser), async (req, res) => {
    try {
        const result = await userService.getAllUsers(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during fetching all user: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for edit user profile.
 */
router.post('/edit', jwtVerify, validate(editUser), async (req, res) => {
    try {
        const result = await userService.editUser(req.auth._id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during registration: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;
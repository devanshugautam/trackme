const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { speedLimitService } = require('../services');
const { speedLimitValidators: { create, edit, getAll } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const router = express.Router();

const LOG_ID = 'routes/speedLimit';

/**
 * Route for creating speed limit.
 */
router.post('/create', jwtVerify, validate(create), async (req, res) => {
    try {
        const result = await speedLimitService.create(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during creating speed limit: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Get all users according to organisation.
 */
router.get('/getall', jwtVerify, validate(getAll), async (req, res) => {
    try {
        const result = await speedLimitService.getAll(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during fetching all speed limit: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for edit user profile.
 */
router.post('/edit/:id', jwtVerify, validate(edit), async (req, res) => {
    try {
        const result = await speedLimitService.edit(req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during editing speed limit: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Get all users according to organisation.
 */
router.get('/get/:id?', jwtVerify, validate(getAll), async (req, res) => {
    try {
        const result = await speedLimitService.getSpeedLimit(req.params?.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during fetching all speed limit: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;
const express = require('express');
require('pkginfo')(module, 'name', 'version');
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const router = express.Router();
const { handleResponse, handleErrorResponse } = require('../helpers/response');


const LOG_ID = 'routes/heartBeat';
const pkgInfo = module.exports;

/**
 * Handle heartbeat requests to check the project's status.
 *
 * @param {object} res - The response object.
 * @returns {void}
 */
router.get('/heartbeat', async (req, res) => {
    try {
        // Log heartbeat trigger
        logger.info(LOG_ID, `heartBeat triggered ...`);
        // Send a response indicating the project is working fine
        const response = { message: '💗 Project Working fine !!', projectName: pkgInfo.name };
        handleResponse(res, statusCode.OK, response);
    } catch (err) {
        // Log error and send an error response if an exception occurs
        logger.error(LOG_ID, `Error Occurred while getting data from heartbeat: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});



module.exports = router;
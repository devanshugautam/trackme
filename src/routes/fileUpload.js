const express = require('express');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { jwtVerify } = require('../middleware/auth');
const { upload } = require('../utils/multer');
const router = express.Router();

const LOG_ID = 'routes/fileUpload';

/**
 * Route for file upload.
 */
router.post('/file', jwtVerify, upload.single('file'), async (req, res) => {
    try {
        console.log('>>>>>>>>>>', req.file);
        // const result = await userService.login(req.body);
        if (Object.keys(req.file).length > 0) {
            return handleResponse(res, statusCode.OK, { success: true, message: 'File uploaded successfully.', data: { fileName: req.file.filename, url: `${process.env.BACKEND_URL}${req.file.filename}` } });
        }
        return handleResponse(res, statusCode.BAD_REQUEST, { success: false, message: 'Error while uploading file', data: {} });
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during uploading a file : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;
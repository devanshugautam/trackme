// Local Import
const { speedLimitModal } = require('../dbModel');
const { speedLimitDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/speedLimit';

/**
 * Creating speed limit
 *
 * @param {object} body - req.body.
 * @returns {object} - An object with the results.
 */
exports.create = async (body) => {
    try {
        const findVehicalType = await query.findOne(speedLimitModal, { vehicleType: body.vehicleType, laneType: body.laneType, isDeleted: false }, { _id: 1 });
        if (findVehicalType) {
            return {
                success: false,
                message: 'Vehicel type already exist for the provied lane type.'
            };
        }
        const createSpeedLimit = await query.create(speedLimitModal, body);
        if (createSpeedLimit) {
            return {
                success: true,
                message: 'Speed limit created successfully.',
                data: createSpeedLimit
            };
        }
    } catch (error) {
        console.log(error);
        logger.error(LOG_ID, `Error occurred during creating speed limit: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 *  Read operation - Get all speed limit
 * 
 * @param {object} queryParam - optional query params
 * @returns {object} - An object
 */
exports.getAll = async (queryParam) => {
    try {
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder } = queryParam;
        let obj = {};
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;

        const speedLimitListCount = await query.find(speedLimitModal, obj, { _id: 1 });
        const totalPages = Math.ceil(speedLimitListCount.length / perPage);
        const speedLimit = await query.aggregation(speedLimitModal, speedLimitDao.getAllSpeedLimitPipeline({ page: +page, perPage: +perPage, isActive, sortBy, sortOrder }));
        return {
            success: true,
            message: 'Speed limit fetched successfully!',
            data: {
                speedLimit,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: speedLimitListCount.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all speed limit: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit speed liimit
 * 
 * @param {string} speedLimitId - req params
 * @param {object} updatedData - req body
 * @returns {object} - An object
 */
exports.edit = async (speedLimitId, updatedData) => {
    try {
        const update = await speedLimitModal.findOneAndUpdate({ _id: speedLimitId }, updatedData, { new: true });
        if (update) {
            return {
                success: true,
                message: 'Speed limit updated successfully.',
                data: update
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred while editing speed limit: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};

/**
 *  Read operation - Get speed limit
 * 
 * @param {string} id - req params
 * @returns {object} - An object
 */
exports.getSpeedLimit = async (id) => {
    try {
        let obj = { isDeleted: false };
        if (id) obj['_id'] = id;
        else {
            obj['laneType'] = 'Expressway with Access Control';
            obj['vehicleType'] = 'M1 category vehicles';
        }
        const findOne = await query.findOne(speedLimitModal, obj);
        if (findOne) {
            return {
                success: true,
                message: 'Speed limit fetched successfully.',
                data: findOne
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all speed limit: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

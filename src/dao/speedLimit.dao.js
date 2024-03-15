// const mongoose = require('mongoose');

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @typedef {object} GetAllSpeedLimitOptions
 * @property {string} isActive - Filter based on their activation status. Pass 'true' or 'false'.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of to display per page.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated list of speed limit.
 *
 * @param {GetAllSpeedLimitOptions} options - Options to customize the speed limit retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated list of speed limit.
 */
exports.getAllSpeedLimitPipeline = ({ isActive, page, perPage, sortBy, sortOrder }) => {
    let arr = [
        {
            $match: {
                isDeleted: false
            }
        },
        {
            $sort: {
                // 'updatedAt': -1
            }
        },
        {
            $skip: (page - 1) * perPage
        },
        {
            $limit: perPage
        }
    ];

    if (isActive) {
        arr[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }
    if (sortBy && sortOrder) {
        // delete arr[1]['$sort']['updatedAt'];
        arr[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        arr[1]['$sort']['updatedAt'] = -1;
        // arr.splice(1, 1);
    }
    // console.log('>>>>>>>>>>>>>>>>>>>>>>', JSON.stringify(arr));
    return arr;
};
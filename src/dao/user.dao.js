const mongoose = require('mongoose');

/**
 * Generate an aggregation pipeline to fetch a user's profile.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.userProfilePipeline = (userId) => [
    {
        $match: {
            _id: new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $project: {
            password: 0, // Excluding the 'password' field from the result
            token: 0
        }
    }
];

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @typedef {object} GetAllUsersOptions
 * @property {string} orgId - The organization's unique identifier.
 * @property {string} isActive - Filter users based on their activation status. Pass 'true' or 'false'.
 * @property {string} isRole - Filter users based on their role. Pass 'true' to filter by role.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of users to display per page.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @param {GetAllUsersOptions} options - Options to customize the user retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated list of users.
 */
exports.getAllUsersPipeline = ({ isActive, page, perPage, sortBy, sortOrder }) => {
    let arr = [
        {
            $match: {
                isDeleted: false,
                role: 'user'
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
        },
        {
            $project: {
                password: 0, // Excluding the 'password' field from the result
                token: 0
            }
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


/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @typedef {object} GetOverSpeedOFUsersOptions
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of users to display per page.
 * @property {string} sortBy - Filter users based on their sorting field.
 * @property {string} sortOrder - Filter users based on their sorting order.
 * @property {string} userId - Filter users based on their id.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users ovevr speed.
 *
 * @param {GetOverSpeedOFUsersOptions} options - Options to customize the user retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated list of users.
 */
exports.getOverSpeedOFUsersPipeline = ({ page, perPage, sortBy, sortOrder, userId }) => {
    let pipeline = [
        {
            $sort: {
                updatedAt: -1
            }
        },
        {
            $facet: {
                data: [
                    {
                        $skip: (page - 1) * perPage
                    },
                    {
                        $limit: perPage
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        fname: 1,
                                        lname: 1,
                                        image: 1,
                                        email: 1,
                                        username: 1,
                                        coordinates: 1,
                                        latitude: 1,
                                        longitude: 1,
                                        role: 1
                                    }
                                }
                            ],
                            as: 'userInfo'
                        }
                    },
                    {
                        $unwind: {
                            path: '$userInfo',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ],
                count: [
                    {
                        $count: 'totalCount'
                    }
                ]
            }
        },
        {
            $unwind: '$count'
        },
        {
            $addFields: {
                count: '$count.totalCount'
            }
        }
    ];

    if (sortBy && sortOrder) {
        pipeline[0]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        pipeline[0]['$sort']['updatedAt'] = -1;
    }
    if (userId) {
        pipeline.unshift({
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    return pipeline;
};
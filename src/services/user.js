const bcrypt = require('bcryptjs');

// Local Import
const { userModel, userOverSpeedModel } = require('../dbModel');
const { userDao } = require('../dao');
const { generateAuthToken } = require('../utils/tokenGenerator');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/userService';

/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object} reqBody - The request body containing `email` and `password`.
 * @param {string} adminAccess - The request headers containing `x-admin-access`.
 * @returns {object} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Object): User data if authentication is successful.
 *   - `token` (string): JWT token if authentication is successful.
 */
exports.login = async (reqBody, adminAccess) => {
    try {
        const { value, password, type } = reqBody;
        const findUser = await query.findOne(userModel, { [type]: value, isDeleted: false }, { _id: 1, password: 1, role: 1 });
        if (!findUser) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        if (findUser.role != 'admin' && adminAccess) {
            return {
                success: true,
                message: 'You are not authorized'
            };
        }
        const isPasswordValid = await bcrypt.compare(password, findUser.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
        // console.log('findUser', findUser);
        const { data: userData } = await this.uesrProfile({ userId: findUser._id });
        // Generate a JWT token for the user.
        const token = generateAuthToken({
            userId: findUser._id,
            fname: userData.fname,
            lname: userData.lname,
            email: userData.email,
            username: userData.username,
            role: userData.role
        });
        if (!userData.image) userData.image = process.env.DUMMY_IMAGE;
        await userModel.updateOne({ _id: findUser._id }, { token });
        return {
            success: true,
            message: 'You have successfully logged in to your account',
            data: userData,
            token
        };
    } catch (error) {
        console.log(error);
        logger.error(LOG_ID, `Error occurred during login: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Registers a new user with the provided user data.
 *
 * @param {object} body - The user data to be registered.
 * @returns {object} - An object with registration results:
 *   - `success` (boolean): Indicates whether the registration was successful.
 *   - `message` (string): A message describing the result of the registration.
 *   - `data` (Object): Registered user data if registration is successful.
 */
exports.registerUser = async (body) => {
    try {
        const checkUniqueEmail = await query.findOne(userModel, { email: body.email });
        if (checkUniqueEmail) return {
            success: false,
            message: 'This email is already taken. Please choose a different one.',
            data: { email: body.email }
        };

        const salt = bcrypt.genSaltSync(10);
        body.password = await bcrypt.hashSync(body.password, salt);
        body.username = `TrackMe-${body.email.split('@')[0]}-${Date.now().toString().slice(-4)}`;
        // body.role ='user';
        const insertUser = await query.create(userModel, body);
        if (insertUser) {
            delete insertUser._doc.password;
            return {
                success: true,
                message: `user created successfully.`,
                data: insertUser
            };
        } else {
            return {
                success: false,
                message: 'Error while creating user.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during registerUser: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Finds profile of a user.
 *
 * @param {object} params - Parameters containing 'userId'.
 * @param {string} params.userId - The ID of the user to fetched his/her profile.
 * @returns {object} - An object with the results, including user details.
 */
exports.uesrProfile = async ({ userId }) => {
    try {
        const findUser = await query.aggregation(userModel, userDao.userProfilePipeline(userId));
        // console.log('findUser', findUser);
        if (findUser.length == 0) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        return {
            success: true,
            message: `Profile of ${findUser[0].name} fetched successfully.`,
            data: findUser[0]
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching user profile (uesrProfile): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 *  Read operation - Get all users
 * 
 * @param {object} queryParam - optional query params
 * @returns {object} - An object
 */
exports.getAllUsers = async (queryParam) => {
    try {
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder } = queryParam;
        let obj = {};
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;

        const userListCount = await query.find(userModel, obj, { _id: 1 });
        const totalPages = Math.ceil(userListCount.length / perPage);
        const userList = await query.aggregation(userModel, userDao.getAllUsersPipeline({ page: +page, perPage: +perPage, isActive, sortBy, sortOrder }));
        return {
            success: true,
            message: 'User fetched successfully!',
            data: {
                userList,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: userListCount.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all users: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit user profile
 * 
 * @param {string} userId - req params
 * @param {object} updatedData - req body
 * @returns {object} - An object
 */
exports.editUser = async (userId, updatedData) => {
    try {
        if (updatedData.email) {
            const checkUniqueEmail = await query.findOne(userModel, { _id: { $ne: userId }, email: updatedData.email });
            if (checkUniqueEmail) return {
                success: false,
                message: 'This email is already taken. Please choose a different one.'
            };
        }
        // Update the user's information
        const updateUser = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true });
        if (updateUser) {
            delete updateUser._doc.password;
            delete updateUser._doc.token;
            if (!updateUser._doc.image) updateUser._doc.image = process.env.DUMMY_IMAGE;
            return {
                success: true,
                message: 'user profile updated successfully.',
                data: updateUser
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred while editing user profile: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};

/**
 * Get All user over speed
 * 
 * @param {object} auth - req auth
 * @param {string} userId - req params
 * @param {object} queryParam - optional query params
 * @returns {object} - An object
 */
exports.getOverSpeedOFUsers = async (auth, userId, queryParam) => {
    try {
        if (auth.role != 'admin' && (!userId || userId != auth.userId)) {
            return {
                success: false,
                message: 'You are not authorized for this action.'
            };
        }
        const { page = 1, perPage = 7, sortBy, sortOrder } = queryParam;
        const userOverSpeedList = await query.aggregation(userOverSpeedModel, userDao.getOverSpeedOFUsersPipeline({ page: +page, perPage: +perPage, sortBy, sortOrder, userId }));
        const totalPages = Math.ceil(userOverSpeedList[0].count / perPage);
        return {
            success: true,
            message: 'User over speed fetched successfully!',
            data: {
                userOverSpeedList: userOverSpeedList[0].data,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: userOverSpeedList[0].count,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while fetching user over speeds: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};

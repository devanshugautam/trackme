const bcrypt = require('bcryptjs');

// Local Import
const { userModel } = require('../dbModel');
const { userDao } = require('../dao');
const { generateAuthToken } = require('../utils/tokenGenerator');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/userService';

/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object} reqBody - The request body containing `email` and `password`.
 * @returns {object} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Object): User data if authentication is successful.
 *   - `token` (string): JWT token if authentication is successful.
 */
exports.login = async (reqBody) => {
    try {
        const { value, password, type } = reqBody;
        const findUser = await query.findOne(userModel, { [type]: value, isDeleted: false }, { _id: 1, password: 1 });
        if (!findUser) {
            return {
                success: false,
                message: 'User not found'
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
            username: userData.username
        });

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

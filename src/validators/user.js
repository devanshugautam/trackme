const { Joi } = require('express-validation');

exports.registerUser = {
    body: Joi.object({
        fname: Joi.string().required(),
        lname: Joi.string().required(),
        email: Joi.string().required(),
        address: Joi.string().required(),
        password: Joi.string().required(),
        sosNumber: Joi.array().items(Joi.string().required()).optional(),
        mobile: Joi.string().optional(),
        mobileCode: Joi.string().optional(),
        image: Joi.string().optional()
    })
};

exports.login = {
    body: Joi.object({
        value: Joi.string().required(),
        password: Joi.string().required(),
        type: Joi.string().required()
    })
};

exports.getAllUser = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()
    })
};

exports.editUser = {
    body: Joi.object({
        fname: Joi.string().optional(),
        lname: Joi.string().optional(),
        email: Joi.string().optional(),
        address: Joi.string().optional(),
        sosNumber: Joi.array().items(Joi.string().required()).optional(),
        mobile: Joi.string().optional(),
        mobileCode: Joi.string().optional(),
        image: Joi.string().optional()
    })
};
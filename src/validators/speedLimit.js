const { Joi } = require('express-validation');

exports.create = {
    body: Joi.object({
        vehicleType: Joi.string().required(),
        laneType: Joi.string().required(),
        speedLimit: Joi.number().required()
    })
};

exports.getAll = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()
    })
};

exports.edit = {
    body: Joi.object({
        speedLimit: Joi.number().required()
    })
};
const { apiV1Prefix } = require('../../config/default.json');

/**
 * configuration of all routes
 *
 * @param {app} app the express server instance
 */
module.exports = (app) => {
    app.use(apiV1Prefix, require('./heartBeat'));
    app.use(`${apiV1Prefix}/user`, require('./user'));
};
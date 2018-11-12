'use strict';

const request = require('superagent');

const getSwaggerInfo = endpoint =>
    request
        .get(endpoint)
        .then(({ body }) =>
            Promise.resolve({
                title: body.info.title,
                version: body.info.version,
                paths: body.paths,
                definitions: body.definitions,
            })
        )
        .catch(err => Promise.reject(err));

module.exports = getSwaggerInfo;

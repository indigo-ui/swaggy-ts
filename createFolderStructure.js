'use strict';

const fs = require('fs');

const createFolderStructure = path => {
    try {
        fs.mkdirSync(path, { recursive: true });
    } catch (err) {
        // swallow if dir exists
        if (!err.code === 'EEXIST') {
            throw err;
        }
    }
};

module.exports = createFolderStructure;

'use strict';

const getFilePathAndName = (key = '') => {
    let path = key.split('/').pop().replace(/\[.*\]/, '').split('.');
    const name = path.pop();
    path = path.join('/');

    return { path, name };
};

module.exports = getFilePathAndName;

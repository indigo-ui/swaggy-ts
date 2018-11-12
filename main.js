'use strict';

const getSwaggerInfo = require('./getSwaggerInfo');
const makeDefinitionInterfaces = require('./makeDefinitionInterfaces');
const makeEndpointClasses = require('./makeEndpointClasses');

const args = process.argv.slice(2);

getSwaggerInfo(args[0])
    .then(res => {
        makeDefinitionInterfaces(res);
        makeEndpointClasses(res);
    })
    .catch(err => console.error(err));

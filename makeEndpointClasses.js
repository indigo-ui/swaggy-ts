 'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const createFolderStructure = require('./createFolderStructure');
const getFilePathAndName = require('./getFilePathAndName');

const makeEnpointInterfaces = ({ title, version, paths }) => {
    const root = `./apis/${title}/${version}/endpoints`;

    _.forEach(paths, (endpoint, key) => {
        let endpointPath = key.split('/');
        const enpointName = endpointPath.pop();

        endpointPath = `${root}/${endpointPath.join('/')}`;
        createFolderStructure(endpointPath);

        let classes = '';
        const dependencies = [];

        _.forEach(endpoint, (methodDefinition, method) => {
            // schema is grouped by status
            // currently just supporting 1 status (first in list)
            const status = _.find(methodDefinition.responses, status => Number(status) !== NaN);
            let schema = _.get(status, ['schema', '$ref'], _.get(status, ['schema', 'type'], 'null'));

            if (schema.match('/definitions/')) {
                const { path: definitionPath, name: definitionName } = getFilePathAndName(schema);
                schema = definitionName;
                if (!_.find(dependencies, { definitionPath, definitionName })) {
                    dependencies.push({ definitionPath, definitionName });
                }
            }
            const methodUpper = method[0].toUpperCase() + method.slice(1);
            classes += `export class ${methodUpper} {\n`
                + '    status: number;\n'
                + `    contentType: '${methodDefinition.produces.join('\' | \'')}';\n`
                + `    body: ${schema};\n`
                + '}\n\n'
        })
        let dependenciesString = dependencies.reduce((acc, { definitionPath, definitionName }) =>
            (`${acc}import ${definitionName} from '${path.relative(endpointPath, `./apis/${title}/${version}/definitions/${definitionPath}/${definitionName}`)}';\n`), '')
            .replace(/\\/g, '/'); // normalize path on Windows
        dependenciesString = dependenciesString ? `${dependenciesString}\n` : '';
        fs.writeFile(`${endpointPath}/${enpointName}.ts`, `${dependenciesString}${classes}`, err => {
            if (err) {
                throw err;
            } else {
                console.log(`Created: ${endpointPath}/${enpointName}.ts`)
            }
        });
    });
};

module.exports = makeEnpointInterfaces;

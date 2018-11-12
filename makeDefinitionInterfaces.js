'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const createFolderStructure = require('./createFolderStructure');
const getFilePathAndName = require('./getFilePathAndName');

const _readProperties = (name, properties, root, folderPath) => {
    let dependencies = [];
    let propertiesString = '';

    const _readPropertyType = (property) => {
        if (property['$ref']) {
            const dependency = getFilePathAndName(property['$ref']);
            if (!_.find(dependencies, dependency) && dependency.name !== name) {
                dependencies.push(dependency);
            }
            return dependency;
        }

        if (property.enum) {
            return `'${property.enum.join('\' | \'')}'`;
        }

        if (property.type === 'array') {
            const propertyType = _readPropertyType(property.items);
            return `Array<${_.get(propertyType, 'name', propertyType)}>`;
        }

        if (property.type === 'integer') {
            return 'number';
        }

        if (property.type === 'object') {

        }

        return property.type;
    };

    _.forEach(properties, (property, key) => {
        const propertyType = _readPropertyType(property);
        propertiesString += `    ${key}?: ${_.get(propertyType, 'name', propertyType)};\n`;
    });

    let dependenciesString = dependencies
        .reduce((acc, { name, path: depPath }) =>
            `${acc}import ${name} from '${path.relative(folderPath, `${root}/${depPath}/${name}`)}';\n`, '')
        .replace(/\\/g, '/') // normalize path on Windows
        .replace(/'([a-zA-Z]+)'/g, (match, p1) => `'./${p1}'`); // add "./" before file name for same dir
    dependenciesString = dependenciesString ? `${dependenciesString}\n` : '';

    return {
        dependencies: dependenciesString,
        properties: propertiesString,
    }
}

const makeDefinitionInterfaces = ({ title, version, definitions }) => {
    const root = `./apis/${title}/${version}/definitions`;

    _.forEach(definitions, (definition, key) => {
        const { path, name } = getFilePathAndName(key);
        const folderPath = `${root}/${path}`;
        const filePath = `${folderPath}/${name}.ts`;
        createFolderStructure(`${root}/${path}`);
        const { dependencies, properties } = _readProperties(name, definition.properties, root, folderPath);
        fs.writeFile(filePath, `${dependencies}interface ${name} {\n` + properties + '}\n\n' + `export default ${name};\n`, err => {
            if (err) {
                throw err;
            } else {
                console.log(`Created: ${filePath}`);
            }
        });
    });
};

module.exports = makeDefinitionInterfaces;

var _ = require('../../lodash.js');

function dataKeyIsUnique(newKey, tableData) {
    return Object.keys(tableData[0]).every(function(tableDataItemKey) {
        return tableDataItemKey !== newKey;
    });
}

function getHeaderNames(tableData, headerKey) {
    return _.uniq(
        tableData.map(function(tableDataItem) {
            return tableDataItem[headerKey];
        })
    );
}

function headerValueIsUnique(newValue, headerKey, tableData) {
    return tableData.every(function(tableDataItem) {
        return tableDataItem[headerKey] !== newValue;
    });
}

exports.dataKeyIsUnique = dataKeyIsUnique;
exports.getHeaderNames = getHeaderNames;
exports.headerValueIsUnique = headerValueIsUnique;

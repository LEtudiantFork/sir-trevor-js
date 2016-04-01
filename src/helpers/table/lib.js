import * as _ from '../../lodash.js';

export function dataKeyIsUnique(key, data) {
    return Object.keys(data[0]).every(item => item !== key);
}

export function getHeaderNames(data, key) {
    return _.uniq(data.map(item => item[key]));
}

export function headerValueIsUnique(value, key, data) {
    return data.every(item => item[key] !== value);
}

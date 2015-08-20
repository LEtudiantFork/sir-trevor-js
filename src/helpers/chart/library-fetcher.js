var $script = require('scriptjs')

var state = 'not-loaded';

var chartLibs = [
    'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/d3plus/1.8.0/d3plus.min.js'
];

function fetchChartLibs() {
    return new Promise(function(resolve, reject) {
        if (state === 'not-loaded') {
            state = 'loading';

            $script(chartLibs, function() {
                state = 'loaded';
                resolve();
            });
        }
        else if (state === 'loaded') {
            resolve();
        }
    });
}

module.exports = fetchChartLibs;

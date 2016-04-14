import $script from 'scriptjs';

const chartLibs = [
    'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/d3plus/1.9.2/d3plus.min.js'
];

let fetchChartPromise;

export default () => {
    fetchChartPromise = fetchChartPromise || new Promise(resolve => {
        $script.order(chartLibs, () => resolve());
    });

    return fetchChartPromise;
};

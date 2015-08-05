/*
  Chart Block
*/

var _     = require('../lodash.js');
var Block = require('../block');
var Chart = require('../helpers/chart/index.js');

var chooseableConfig = {
    'name': 'chartType',
    'options': [
        {
            'icon': 'pie',
            'title': 'Camembert',
            'value': 'pie'
        },
        {
            'icon': 'bar',
            'title': 'Barre',
            'value': 'bar'
        }
    ]
};

var barData = [
    { year: '1991', name:'cake', value: 15 },
    { year: '1991', name:'fruit', value: 10 },
    { year: '1991', name:'gamma', value: 5 },
    { year: '1992', name:'cake', value: 20 },
    { year: '1992', name:'fruit', value: 10 },
    { year: '1992', name:'gamma', value: undefined },
    { year: '1993', name:'cake', value: 30 },
    { year: '1993', name:'fruit', value: 40 },
    { year: '1993', name:'gamma', value: 20 }
];

var pieData = [
    { value: 100, name: 'alpha' },
    { value: 70, name: 'beta' },
    { value: 40, name: 'gamma' },
    { value: 15, name: 'delta' },
    { value: 5, name: 'epsilon' },
    { value: 1, name: 'zeta' }
];

function onChoose(choices) {
    var block = this;
    var chartType = choices.chartType;

    if (chartType === 'pie') {
        block.chartBuilder = Chart.create({
            type: chartType,
            data: pieData,
            rowKey: 'name',
            valueKey: 'value',
            columnKey: 'value'
        });
    }
    else {
        block.chartBuilder = Chart.create({
            type: chartType,
            data: barData,
            rowKey: 'name',
            valueKey: 'value',
            columnKey: 'year'
        });
    }

    block.$editor.append(block.chartBuilder.$elem);
}

module.exports = Block.extend({

    chooseable: true,

    type: 'Chart',

    title: function() {
        return 'Chart';
    },

    editorHTML: '<div class="st-block__chart"></div>',

    icon_name: 'chartpie',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            // create chart from old data
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});

/*
  Chart Block
*/

var _     = require('../lodash.js');
var Block = require('../block');
var Chart = require('../helpers/chart/index.js');
var utils = require('../utils.js');

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

function onChoose(choices) {
    var block = this;
    var chartType = choices.chartType;

    if (chartType === 'pie') {
        block.chart = Chart.create({
            type: chartType
        });
    }
    else {
        block.chart = Chart.create({
            type: chartType
        });
    }

    block.$editor.append(block.chart.$elem);
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
            this.chart = Chart.create(data);
        }
    },

    _serializeData: function() {
        utils.log('toData for ' + this.blockID);

        if (this.chart) {
            return this.chart.getData();
        }

        return {};
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});

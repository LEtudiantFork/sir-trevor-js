/*
  Chart Block
*/

var _            = require('../lodash.js');
var Block        = require('../block');
var TableBuilder = require('../helpers/table-builder.class.js');
var ChartBuilder = require('../helpers/chart-builder.class.js');

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

    block.chartBuilder = new ChartBuilder({
        chartType: chartType
    });

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

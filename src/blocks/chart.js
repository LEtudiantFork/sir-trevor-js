/*
  Chart Block
*/

var _             = require('../lodash.js');
var Block         = require('../block');
var Chart         = require('../helpers/chart/index.js');
var ChartLibFetch = require('../helpers/chart/library-fetcher.js');
var utils         = require('../utils.js');
var i18n          = require('../i18n-stub.js');

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

module.exports = Block.extend({

    chooseable: true,

    type: 'Chart',

    title: function() {
        return i18n.t('blocks:chart:title');
    },

    editorHTML: '<div class="st-block__chart"></div>',

    icon_name: 'chartpie',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            ChartLibFetch().then(() => {
                this.chart = Chart.create(data);
                this.editor.appendChild(this.chart.$elem[0]);
            })
            .catch(function(err) {
                console.error(err);
            });
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
            this.createChoices(chooseableConfig, (choices) =>{
                var chartType = choices.chartType;

                ChartLibFetch().then(() => {
                    if (chartType === 'pie') {
                        this.chart = Chart.create({
                            type: chartType
                        });
                    }
                    else {
                        this.chart = Chart.create({
                            type: chartType
                        });
                    }

                    this.editor.appendChild(this.chart.$elem[0]);
                })
                .catch(function(err) {
                    console.error(err);
                });
            });
        }
    }
});

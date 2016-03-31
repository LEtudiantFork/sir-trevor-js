/*
  Chart Block
*/

import * as _        from '../lodash.js';
import Block         from '../block';
import Chart         from '../helpers/chart/index.js';
import { fetchChartLibs } from '../helpers/chart/library-fetcher.js';
import utils         from '../utils.js';

const chooseableConfig = {
    name: 'chartType',
    options: [
        {
            title: 'Barre',
            icon: 'bar-chart',
            value: 'bar'
        }, {
            title: 'Camembert',
            icon: 'pie-chart',
            value: 'pie'
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

    icon_name: 'pie-chart',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            fetchChartLibs().then(() => {
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
                const type = choices.chartType;

                fetchChartLibs().then(() => {
                    this.chart = Chart.create({ type });

                    this.editor.appendChild(this.chart.$elem[0]);
                })
                .catch(function(err) {
                    console.error(err);
                });
            });
        }
    }
});

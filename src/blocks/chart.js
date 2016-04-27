/*
  Chart Block
*/

import * as _        from '../lodash.js';
import Block         from '../block';
import Chart         from '../helpers/chart/index.js';
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

    title: () => i18n.t('blocks:chart:title'),

    editorHTML: '<div class="st-block__chart"></div>',

    icon_name: 'pie-chart',

    loadData(data) {
        this.chart = Chart.create(data);
        this.editor.appendChild(this.chart.$elem[0]);
    },

    _serializeData() {
        utils.log(`toData for ${this.blockID}`);

        if (this.chart) {
            return this.chart.getData();
        }

        return {};
    },

    onBlockRender() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, choice => {
                this.chart = Chart.create({ type: choice.chartType });
                this.editor.appendChild(this.chart.$elem[0]);
            });
        }
    }
});

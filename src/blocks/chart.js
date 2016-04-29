/*
    Chart Block
*/

import * as _        from '../lodash';
import Block         from '../block';
import Chart         from '../helpers/chart';
import utils         from '../utils';

const CHOOSEABLE = [
    {
        title: 'Barre',
        icon: 'bar-chart',
        name: 'Bar',
        type: 'bar'
    },
    {
        title: 'Camembert',
        icon: 'pie-chart',
        name: 'Pie',
        type: 'pie'
    }
];

export default Block.extend({

    type: 'Chart',

    title: () => i18n.t('blocks:chart:title'),

    editorHTML: '<div class="st-block__chart"></div>',

    'icon_name': 'pie-chart',

    chooseable: true,

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
        if (_.isEmpty(this.getBlockData())) {
            this.createChoices(CHOOSEABLE, choice => {
                this.chart = Chart.create({ type: choice.type });
                this.editor.appendChild(this.chart.$elem[0]);
            });
        }
    }
});

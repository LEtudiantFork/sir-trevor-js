/*
    Illustrated Block
*/

import Block from '../block';
import Chart from '../helpers/chart';
import utils from '../utils';
import { isEmpty } from '../lodash';

export default Block.extend({

    type: 'chartbar',

    title: () => 'Barres',

    editorHTML: '<div class="st-block--chart"></div>',

    'icon_name': 'bar-chart',

    toolbarEnabled: false,

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
        if (isEmpty(this.getBlockData())) {
            this.chart = Chart.create({ type: 'bar' });
            this.editor.appendChild(this.chart.$elem[0]);
        }
    }
});

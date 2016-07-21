/*
    Illustrated Block
*/

import Block from '../block';
import Chart from '../helpers/chart';
import utils from '../utils';
import { isEmpty } from '../lodash';

export default Block.extend({

    type: 'chartpie',

    title: () => 'Pie',

    editorHTML: '<div class="st-block--chart"></div>',

    'icon_name': 'pie-chart',

    toolbarEnabled: false,

    loadData(data) {
        this.chart = Chart.create(data);
        this.editor.appendChild(this.chart.$elem[0]);
    },

    _serializeData() {
        utils.log(`toData for %c${this.blockID}`, utils.logBold);

        if (this.chart) {
            return this.chart.getData();
        }

        return {};
    },

    onBlockRender() {
        if (isEmpty(this.getBlockData())) {
            this.chart = Chart.create({ type: 'pie' });
            this.editor.appendChild(this.chart.$elem[0]);
        }
    }
});
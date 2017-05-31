/*
    Illustrated Block
*/

import Block from '../block';
import Chart from '../helpers/chart/index';
import utils from '../utils';
import { isEmpty } from '../lodash';

export default Block.extend({

    type: 'chartbar',

    title: () => 'Barres',

    editorHTML: '<div class="st-block--chart"></div>',

    'icon_name': 'bar-chart',

    toolbarEnabled: false,

    countable: false,

    loadData(data) {
        this.chart = Chart.create(data);
        this.editor.appendChild(this.chart.$elem[0]);
    },

    _serializeData() {
        utils.log(`toData for %c${this.blockID}`, utils.logBold);

        var data = {};

        if (this.chart) {
            data = this.chart.getData();
        }

        // Add any inputs to the data attr
        var matcher = [
          'input:not(.st-paste-block):not(.st-control-block)',
          'textarea:not(.st-paste-block)',
          'select:not(.st-paste-block)',
          'button:not(.st-paste-block):not(.st-control-block)'
        ].join(",");
        if (this.$(matcher).length > 0) {
          Array.prototype.forEach.call(this.$(matcher), function(input) {
            if (input.getAttribute('name')) {
              data[input.getAttribute('name')] = input.value;
            }
          });
        }

        var keys = Object.keys(data);
        if (_.isEmpty(data) || (keys[0] === 'anchor' && keys.length === 1)) {
            data = {};
        }

        return data;
    },

    onBlockRender() {
        var data = this.getBlockData();
        var keys = Object.keys(data);
        if (isEmpty(data) || (keys[0] === 'anchor' && keys.length === 1)) {
            this.chart = Chart.create({ type: 'bar' });
            this.editor.appendChild(this.chart.$elem[0]);
        }
    }
});

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

    countable: false,

    loadData(data) {
      //Reset les datas si on nous renvoie un mauvais json. 
        if(data.type == undefined) {
          data.type = 'pie'
        };

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
            this.chart = Chart.create({ type: 'pie' });
            this.editor.appendChild(this.chart.$elem[0]);
        }
    }
});

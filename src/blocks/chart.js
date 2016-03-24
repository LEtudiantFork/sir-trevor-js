'use strict';

const _   = require('../lodash');
const Block = require('../block');

const chooseableConfig = {
    name: 'subBlockType',
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

    type: 'chart',

    title() { return i18n.t('blocks:chart:title'); },

    chooseable: true,

    icon_name: 'pie-chart',

    toolbarEnabled: true,
    formatBarEnabled: false,

    loadData(data){
        console.log(data);
    },

    onBlockRender() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, choices => {
                console.log('The following things were chosen ', choices);
            });
        }
    }
});

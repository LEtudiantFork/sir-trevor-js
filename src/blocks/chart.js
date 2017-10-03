/*
    Chart Block
*/
import Block from '../block';

const CHOOSEABLE = [
    {
        title: 'Histogramme',
        icon: 'bar-chart',
        type: 'chartBar'
    },
    {
        title: 'Camembert',
        icon: 'pie-chart',
        type: 'chartPie'
    }
];

export default Block.extend({

    type: 'Chart',

    title: () => i18n.t('blocks:chart:title'),

    editorHTML: '<div class="st-block--chart"></div>',

    'icon_name': 'pie-chart',

    chooseable: true,

    countable: false,

    specialchar: false,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
            this.mediator.trigger('block:replace', this.el, choice.type);
        });
    }
});

/*
    Illustrated Block
*/

import Block from '../block';


const CHOOSEABLE = [
    {
        title: i18n.t('blocks:illustratedValue:title'),
        icon: 'illustrated-value',
        type: 'illustratedValue'
    },
    {
        title: i18n.t('blocks:illustratedLeft:title'),
        icon: 'illustrated-value',
        type: 'IllustratedimageLeft',
        block: 'Illustratedimage',
        position: 'left'
    },
    {
        title: i18n.t('blocks:illustratedRight:title'),
        icon: 'illustrated-value',
        type: 'IllustratedimageRight',
        block: 'Illustratedimage',
        position: 'right'
    }
];


export default Block.extend({

    type: 'illustrated',

    title: () => i18n.t('blocks:illustrated:title'),

    editorHTML: '<div class="st-block--illustrated"></div>',

    'icon_name': 'illustrated-value',

    chooseable: true,

    onBlockRender() {
        this.createChoices(CHOOSEABLE, choice => {
            const { type, block, position } = choice;
            this.mediator.trigger('block:replace', this.el, block || type, { position });
        });
    }
});

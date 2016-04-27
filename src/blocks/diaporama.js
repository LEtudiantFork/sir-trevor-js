import * as _ from '../lodash';
import Dom    from '../packages/dom';
import Block  from '../block';
import Slider from '../helpers/slider.class';

const template = `
    <figure>
        <img src="<%= file %>" />
    </figure>
    <input type="text" name="legend" value="<%= legend %>" />
`;

module.exports = Block.extend({

    type: 'diaporama',

    toolbarEnabled: false,

    title: () => i18n.t('blocks:diaporama:title'),

    icon_name: 'Diaporama',

    loadData(data){
        const imageElem = Dom.createElement('div', {
            'class': 'st-block--diaporama'
        });

        imageElem.innerHTML = _.template(template)(data);

        this.inner.appendChild(imageElem);

        // this.slider = Slider.create(params.sliderConfig);
    },

    onBlockRender() {}
});

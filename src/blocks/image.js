import * as _ from '../lodash';
import Dom    from '../packages/dom';
import Block  from '../block';

const template = `
    <figure>
        <img src="<%= file %>" />
    </figure>
    <input type="text" name="legend" value="<%= legend %>" />
`;

module.exports = Block.extend({

    type: 'image',

    toolbarEnabled: false,

    title: () => i18n.t('blocks:image:title'),

    icon_name: 'Image',

    loadData(data){
        const imageElem = Dom.createElement('div', {
            'class': 'st-block--image'
        });

        imageElem.innerHTML = _.template(template)(data);

        this.inner.appendChild(imageElem);
    },

    onBlockRender() {}
});

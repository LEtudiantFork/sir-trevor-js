'use strict';

const _     = require('../lodash');
const Dom   = require('../packages/dom');
const Block = require('../block');

const template = `
    <figure>
        <img src="<%= file %>" />
    </figure>
    <input type="text" name="legend" value="<%= legend %>" />
`;

module.exports = Block.extend({

    type: 'image',

    toolbarEnabled: false,

    title() { return i18n.t('blocks:image:title'); },

    icon_name: 'Image',

    loadData(data){
        if (data) {
            let renderedContent = _.template(template)(data);

            let imageElem = Dom.createElement('div', {
                'class': 'st-block--image'
            });

            imageElem.innerHTML = renderedContent;

            this.inner.appendChild(imageElem);
        }
    },

    onBlockRender() {
    }
});

/*
{
  "id": 961133,
  "legend": "Robin est étudiant en 5e année à Sciences po Lille.",
  "file": "http://static.letudiant.fr/ETU_ETU/3/3/961133-photo-1-original.jpg",
  "thumbnail": "http://static.letudiant.fr/ETU_ETU/3/3/961133-photo-1-90x90.jpg",
  "copyright": "Delphine Dauvergne",
  "format_ids": [
    177
  ]
}
*/

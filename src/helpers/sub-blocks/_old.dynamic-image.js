// var _             = require('../../../lodash.js');
// var $             = require('etudiant-mod-dom').default;
// var EventBus      = require('../../../event-bus.js');
// var fieldHelper   = require('../../../helpers/field.js');

// var smallTemplate = [
//     '<figure class="st-sub-block-image" data-etu-zoom="">',
//         '<img src="<%= thumbnail %>" />',
//     '</figure>',
//     '<span>légende : <%= legend %></span>',
//     '<span>&copy; <%= copyright %></span>'
// ].join('\n');

// var largeTemplate = [
//     '<figure class="st-sub-block-image">',
//         '<%= img %>',
//     '</figure>',
//     '<%= formatsField %>',
//     '<%= legendField %>',
//     '<%= linkField %>',
//     '<%= alignField %>',
//     '<span>&copy; <%= copyright %></span>'
// ].join('\n');

// var inBlockTemplate = [
//     '<%= img %>',
//     '<figcaption><%= legend %></figcaption>',
//     '<div class="st-sub-block-dynamic-image-edit-area">',
//         '<button type="button" data-edit class="st-icon" data-icon="image"></button>',
//         '<button type="button" data-delete class="st-icon" data-icon="bin"></button>',
//     '</div>'
// ].join('\n');

// function hasFormatString(formatString, formats) {
//     return formats.some(function(formatItem) {
//         return formatItem.label === formatString;
//     });
// }

// function getImageMarkup() {
//     return `<img alt=" ${ this.content.legend } " src=" ${ this.getFormattedSrc(this.content.activeFormat) } " />`;
// }

// function init() {
//     this.smallTemplate = smallTemplate;
//     this.largeTemplate = largeTemplate;

//     this.content.align = this.content.align || 'right';

//     if (this.content.formats.length === 1) {
//         this.content.activeFormat = this.content.formats[0];
//     }
// }

// var dynamicImagePrototype = {

//     getSaveData: function() {
//         return {
//             activeFormat: this.content.activeFormat,
//             align: this.content.align,
//             id: this.id,
//             legend: this.content.legend,
//             link: this.content.link
//         };
//     },

//     getFormattedSrc: function(formatString) {
//         if (hasFormatString(formatString, this.content.formats)) {
//             return this.content.file.replace('original', formatString);
//         }

//         return this.content.file;
//     },

//     prepareSmallMarkup: function() {
//         return _.template(smallTemplate, this.content, { imports: { '_': _ } });
//     },

//     postRenderSmall: function() {
//         if (!this.hasRenderedSmall) {
//             this.hasRenderedSmall = true;

//             this.$elem.on('click', 'select', (e) => {
//                 if (this.renderedAs === 'small') {
//                     e.stopPropagation();
//                 }
//             });

//             this.$elem.on('change', 'select', (e) => {
//                 if (this.renderedAs === 'small') {
//                     e.stopPropagation();

//                     this.content.activeFormat = e.currentTarget.value;


//                 }
//             });
//         }
//     },

//     prepareLargeMarkup: function() {
//         var formatOptions = this.content.formats.map((formatItem) => {
//             return {
//                 value: formatItem.label,
//                 label: formatItem.label,
//                 selected: this.content.activeFormat === formatItem.label
//             };
//         });

//         var alignField = fieldHelper.build({
//             type: 'select',
//             name: 'align',
//             label: 'Position',
//             options: [
//                 {
//                     value: 'left',
//                     label: 'A gauche du texte',
//                     selected: this.content.align === 'left' ? 'selected' : ''
//                 },
//                 {
//                     value: 'right',
//                     label: 'A droite du texte',
//                     selected: this.content.align === 'right' ? 'selected' : ''
//                 }
//             ]
//         });

//         var formatsField = fieldHelper.build({
//             type: 'select',
//             name: 'format',
//             label: 'Format',
//             options: formatOptions
//         });

//         var legendField = fieldHelper.build({
//             type: 'text',
//             name: 'legend',
//             label: 'Legend',
//             value: this.content.legend
//         });

//         var linkField;

//         if (this.content.link) {
//              linkField = fieldHelper.build({
//                 type: 'text',
//                 name: 'link',
//                 label: 'Lien',
//                 value: this.content.link
//             });
//         }
//         else {
//             linkField = fieldHelper.build({
//                 type: 'text',
//                 name: 'link',
//                 label: 'Lien',
//                 placeholder: 'Veuillez saisir un lien'
//             });
//         }

//         var toRender = Object.assign({}, this.content, {
//             alignField: alignField,
//             formatsField: formatsField,
//             legendField: legendField,
//             linkField: linkField,
//             img: getImageMarkup.call(this)
//         });

//         return _.template(largeTemplate, toRender, { imports: { '_': _ } });
//     },

//     postRenderLarge: function() {
//         if (!this.hasRenderedLarge) {
//             this.hasRenderedLarge = true;

//             this.$elem.on('change', 'select[name="align"]', (e) => {
//                 this.content.align = e.currentTarget.value;
//             });

//             this.$elem.on('change', 'select[name="format"]', (e) => {
//                 this.content.activeFormat = e.currentTarget.value;

//                 this.$elem[0].querySelector('img').outerHTML = getImageMarkup.call(this);
//             });

//             this.$elem.on('keyup', 'input[name="legend"]', (e) => {
//                 this.content.legend = e.currentTarget.value;
//             });

//             this.$elem.on('keyup', 'input[name="link"]', (e) => {
//                 this.content.link = e.currentTarget.value;
//             });
//         }
//     },

//     // unlike renderSmall/Large this makes a new element every time
//     renderInBlock: function() {
//         var $elem = $(`<figure contenteditable="false" data-sub-block-id=" ${ this.id } "></figure>`);

//         $elem.addClass('st-sub-block-dynamic-image u-align-' + this.content.align);

//         var img;

//         if (this.content.link && this.content.link !== '') {
//             img = `<a href=" ${ this.content.link } " target="_blank"> ${ getImageMarkup.call(this) } <a>`;
//         }
//         else {
//             img = getImageMarkup.call(this);
//         }

//         $elem.html(
//             _.template(inBlockTemplate, {
//                 legend: this.content.legend,
//                 img: img
//             })
//         );

//         return $elem[0];
//     },

//     replaceRenderedInBlock: function(container) {
//         container.querySelector(`[data-sub-block-id=" ${ this.id } "]`).outerHTML = this.renderInBlock().outerHTML;
//     }
// };

// module.exports = {
//     init: init,
//     prototype: dynamicImagePrototype
// };

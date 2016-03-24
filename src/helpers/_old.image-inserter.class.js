// var $                 = require('etudiant-mod-dom').default;
// var eventablejs       = require('eventablejs');
// var fieldHelper       = require('./field.js');
// var imageFilterHelper = require('./image-filter.js');
// var Modal             = require('etudiant-mod-modal');
// var SubBlockSearch    = require('./sub-block-search.class.js');
// var subBlockManager   = require('../sub_blocks/manager.js');
// var xhr               = require('etudiant-mod-xhr').default;

// var imageInserterPrototype = {
//     editImage: function(dynamicImage, shouldReplace) {
//         if (this.searchModal.isOpened) {
//             this.searchModal.hide();
//         }

//         // create a container for the second 'view' of the image inserter - the image editor
//         this.$imageEditor = $('<div class="image-inserter image-inserter-edit"></div>');

//         // append image and submit button
//         this.$imageEditor.append(dynamicImage.renderLarge());

//         this.editorModal.show();

//         this.editorModal.appendToContentArea(this.$imageEditor);

//         this.editorModal.once('hidden', () => {
//             if (shouldReplace) {
//                 this.trigger('replace', dynamicImage);
//             }
//             else {
//                 this.trigger('selected', dynamicImage);
//             }
//         });
//     },

//     openSearch: function() {
//         if (this.editorModal.isOpened) {
//             this.editorModal.hide();
//         }

//         this.searchModal.show();

//         this.searchModal.appendToContentArea(this.$imageSearchContainer);

//         this.subBlockSearch.refreshDimensions();
//     }
// };

// module.exports = {
//     init: function(params) {
//         // return promise to initialise
//         return imageFilterHelper.getFilterData({
//             apiUrl: params.apiUrl,
//             application: params.application,
//             accessToken: params.accessToken
//         })
//         .then(function(filterData) {
//             var imageInserterInstance = Object.assign({}, imageInserterPrototype, eventablejs);

//             imageInserterInstance.id = Date.now();

//             imageInserterInstance.apiUrl = params.apiUrl;
//             imageInserterInstance.accessToken = params.accessToken;
//             imageInserterInstance.application = params.application;
//             imageInserterInstance.filterData = filterData;
//             imageInserterInstance.subBlockType = 'dynamicImage';

//             // initialise the modal
//             imageInserterInstance.searchModal = Modal.create({
//                 slug: 'image-inserter',
//                 animation: 'fade',
//                 theme: 'pandora'
//             });

//             imageInserterInstance.searchModal.render({
//                 header: 'Choisissez un service',
//                 content: ''
//             });

//             imageInserterInstance.editorModal = Modal.create({
//                 slug: 'image-inserter',
//                 animation: 'fade',
//                 theme: 'pandora'
//             });

//             imageInserterInstance.editorModal.render({
//                 header: 'Editer l\'image',
//                 content: '',
//                 footer: {
//                     ok: 'OK'
//                 }
//             });

//             // create a wrapper element for our filterbar and slider
//             imageInserterInstance.$imageSearchContainer = $('<div class="image-inserter image-inserter-search"></div>');

//             // @todo: need to put this in i18n
//             var filterConfig = {
//                 accessToken: imageInserterInstance.accessToken,
//                 application: imageInserterInstance.application,
//                 container: imageInserterInstance.$imageSearchContainer,
//                 fields: [
//                     {
//                         type: 'search',
//                         name: 'query',
//                         placeholder: 'Rechercher'
//                     }, {
//                         type: 'select',
//                         name: 'category',
//                         label: 'Catégories',
//                         placeholder: 'Sélectionnez une catégorie',
//                         options: fieldHelper.addNullOptionToArray(imageInserterInstance.filterData.categories, 'Aucune catégorie')
//                     }, {
//                         type: 'select',
//                         name: 'format',
//                         label: 'Formats',
//                         placeholder: 'Sélectionnez un format',
//                         options: fieldHelper.addNullOptionToArray(imageInserterInstance.filterData.formats, 'Aucun format')
//                     }
//                 ],
//                 limit: 20,
//                 type: 'image',
//                 url: imageInserterInstance.apiUrl + '/edt/media'
//             };

//             var sliderConfig = {
//                 controls: {
//                     next: 'Next',
//                     prev: 'Prev'
//                 },
//                 itemsPerSlide: 3,
//                 increment: 1,
//                 container: imageInserterInstance.$imageSearchContainer
//             };

//             imageInserterInstance.subBlockSearch = new SubBlockSearch({
//                 application: imageInserterInstance.application,
//                 accessToken: imageInserterInstance.accessToken,
//                 apiUrl: imageInserterInstance.apiUrl,
//                 container: imageInserterInstance.$imageSearchContainer,
//                 filterConfig: filterConfig,
//                 sliderConfig: sliderConfig,
//                 subBlockType: imageInserterInstance.subBlockType,
//                 subBlockPreProcess: function(subBlockData) {
//                     return imageFilterHelper.prepareImageFormats(subBlockData, imageInserterInstance.filterData.formats);
//                 }
//             });

//             imageInserterInstance.subBlockSearch.on('ready', function() {
//                 imageInserterInstance.trigger('ready');
//             });

//             // once an image has been selected from search, we can go to editImage state
//             imageInserterInstance.subBlockSearch.on('selected', function(selectedDynamicImage) {
//                 imageInserterInstance.editImage(selectedDynamicImage);
//             });

//             return imageInserterInstance;
//         });
//     },

//     reinitialiseImages: function(params) {
//         var filterData;

//         return imageFilterHelper.getFilterData({
//             apiUrl: params.apiUrl,
//             application: params.application,
//             accessToken: params.accessToken
//         })
//         .then(function(fetchedFilterData) {
//             filterData = fetchedFilterData

//             return Promise.all(
//                 // populate an array of promises; each corresponding to a request for an image
//                 Object.keys(params.storedImages).map(function(dynamicImageId) {
//                     var retrievalUrl = params.apiUrl + '/edt/media/' + dynamicImageId;

//                     return xhr.get(retrievalUrl, {
//                         data: {
//                             access_token: params.accessToken
//                         }
//                     });
//                 })
//             )
//         })
//         .then(function(rawDynamicImageData) {
//             // add the formats property to each image with the human readable image formats eg '500x500'
//             return rawDynamicImageData.map(function(singleRawDynamicImageData) {
//                 return imageFilterHelper.prepareSingleImageFormat(singleRawDynamicImageData.content, filterData.formats);
//             });
//         })
//         .then(function(formattedDynamicImageData) {
//             var dynamicImages = formattedDynamicImageData.map(function(singleFormattedDynamicImageData) {

//                 // merge customised data with the data from the API (e.g. legend, align etc)
//                 singleFormattedDynamicImageData = Object.assign(singleFormattedDynamicImageData, params.storedImages[singleFormattedDynamicImageData.id]);

//                 return subBlockManager.buildSingle({
//                     accessToken: params.accessToken,
//                     apiUrl: params.apiUrl,
//                     application: params.application,
//                     content: singleFormattedDynamicImageData,
//                     parentID: params.blockID,
//                     type: 'dynamicImage'
//                 });
//             });

//             return dynamicImages;
//         })
//         .catch(function(err) {
//             console.error(err);
//         });
//     }
// };

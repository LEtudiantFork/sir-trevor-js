import SubBlock from './basic.js';

export default {
    getSubBlockByID(subBlockArray, id) {
        return subBlockArray.filter(subBlock => subBlock.id.toString() === id.toString()).shift();
    },

    renderMultiple(subBlocks) {
        return subBlocks.map(subBlock => subBlock.render());
    },

    buildSingle(params) {
        return SubBlock.create(params);
    },

    buildMultiple(params) {
        return params.contents.map(singleContent => this.buildSingle({
            content: singleContent,
            parentID: params.parentID,
            type: params.type
        }));
    }
};

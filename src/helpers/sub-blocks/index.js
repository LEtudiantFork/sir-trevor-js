import SubBlock from './basic.js';

export default {
    getSubBlockByID(subBlockArray, id) {
        return subBlockArray.filter(subBlock => {
            return subBlock.id.toString() === id.toString();
        })[0];
    },

    renderMultiple(subBlocks) {
        return subBlocks.map(subBlock => {
            return subBlock.render();
        });
    },

    buildSingle(params) {
        return SubBlock.create(params);
    },

    buildMultiple(params) {
        return params.contents.map(singleContent => {
            return this.buildSingle({
                content: singleContent,
                parentID: params.parentID,
                type: params.type
            });
        });
    }
};

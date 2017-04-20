'use strict';

const BLOCK_ADDITION_TOP_TEMPLATE = require("./block-addition-top");
// const BLOCK_ADDITION_TEMPLATE = require("./block-addition");
import BLOCK_ADDITION_TEMPLATE from "./block-addition";
const BLOCK_REPLACER_TEMPLATE = require("./block-replacer");

export default (editor_html) => {
  return `
    <div class='st-block__inner'>
      ${ editor_html }
    </div>
    ${ BLOCK_REPLACER_TEMPLATE() }
    ${ BLOCK_ADDITION_TOP_TEMPLATE() }
    ${ BLOCK_ADDITION_TEMPLATE() }
  `;
};

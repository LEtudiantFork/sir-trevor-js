'use strict';

// const BLOCK_ADDITION_TEMPLATE = require("./block-addition");
import BLOCK_ADDITION_TEMPLATE from "./block-addition";

export default () => {
  return `
    <div id="st_top" class="st-top-controls">
      ${BLOCK_ADDITION_TEMPLATE()}
    </div>
  `;
};

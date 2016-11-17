import config from '../config.js';

module.exports = ({ name, cmd, iconName }) => {
    return `
        <button class="st-format-btn st-format-btn--${ name }" data-cmd="${ cmd }">
            <svg role="img" class="st-icon">
                <use xlink:href="${ config.defaults.iconUrl }#icon-${ iconName }"/>
            </svg>
        </button>
    `;
};

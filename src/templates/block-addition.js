import config from '../config.js';

export default function () {
    return `
        <button class="st-block-addition" type="button">
            <span class="st-block-addition__button">
                <svg role="img" class="st-icon">
                    <use xlink:href="${ config.defaults.iconUrl }#icon-Add"/>
                </svg>
            </span>
        </button>
    `;
};

'use strict';

var drop_options = {
    html: `
        <div class="st-block__dropzone">
            <svg role="img" class="st-icon"><use xlink:href="#icon-<%= _.result(block, "icon_name") %>"/></svg>
            <p><%= i18n.t("general:drop", { block: "<span>" + _.result(block, "title") + "</span>" }) %>
            </p>
        </div>
    `,
    re_render_on_reorder: false
};

var paste_options = {
    html: `
        <input type="text"
        placeholder="<%= i18n.t("general:paste") %>"
        class="st-block__paste-input st-paste-block">
    `
};

var upload_options = {
    html: `
        <div class="st-block__upload-container">
            <input type="file" type="st-file-upload">
            <button class="st-upload-btn"><%= i18n.t("general:upload") %></button>
        </div>
    `
};

module.exports = {
    debug: true,
    scribeDebug: true,
    skipValidation: false,
    version: '0.6.0',
    language: 'fr',

    instances: [],

    defaults: {
        defaultType: false,
        spinner: {
            className: 'st-spinner',
            lines: 9,
            length: 8,
            width: 3,
            radius: 6,
            color: '#000',
            speed: 1.4,
            trail: 57,
            shadow: false,
            left: '50%',
            top: '50%'
        },
        Block: {
            drop_options: drop_options,
            paste_options: paste_options,
            upload_options: upload_options
        },
        blockLimit: 0,
        blockTypeLimits: {},
        required: [],
        uploadUrl: '/attachments',
        baseImageUrl: '/sir-trevor-uploads/',
        iconUrl: 'inc/icons.svg',
        errorsContainer: undefined,
        convertFromMarkdown: true,
        formatBar: {
            commands: [
                {
                    name: 'Bold',
                    title: 'bold',
                    iconName: 'fmt-bold',
                    cmd: 'bold',
                    keyCode: 66,
                    text : 'B'
                },
                {
                    name: 'Italic',
                    title: 'italic',
                    iconName: 'fmt-italic',
                    cmd: 'italic',
                    keyCode: 73,
                    text : 'i'
                },
                {
                    name: 'Link',
                    title: 'link',
                    iconName: 'fmt-link',
                    cmd: 'linkPrompt',
                    text : 'link'
                },
                {
                    name: 'Unlink',
                    title: 'unlink',
                    iconName: 'fmt-unlink',
                    cmd: 'unlink',
                    text : 'link'
                }
            ]
        },
        ajaxOptions: {
            headers: {}
        }
    }
};

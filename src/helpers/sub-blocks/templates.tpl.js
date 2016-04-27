import config from '../../config.js';

const iconLink = `<svg role="img" class="st-icon"><use xlink:href="${ config.defaults.iconUrl }#icon-fmt-link"/></svg>`;

export const diaporama = `
    <% if (data.thumbnail) { %>
    <figure class="st-sub-block-image">
        <img src="<%= data.thumbnail %>" />
    </figure>
    <% } %>
    <h3><%= data.legend %></h3>
    <a class="st-sub-block-link" href="<%= data.file %>" target="_blank">${iconLink}</a>
`;

export const image = `
    <figure class="st-sub-block-image">
        <img src="<%= data.thumbnail %>" />
    </figure>
    <h3><%= data.legend %></h3>
    <a class="st-sub-block-link" href="<%= data.file %>" target="_blank">${iconLink}</a>
`;

export const quiz = `
    <% if (data.thumbnail) { %>
    <figure class="st-sub-block-image">
        <img src="<%= data.thumbnail %>" />
    </figure>
    <% } %>
    <h3><%= data.title %></h3>
    <a class="st-sub-block-link" href="<%= data.url %>" target="_blank">${iconLink}</a>
    <span class="st-sub-block-site"><%= data.site %></span>
`;

export const poll = `
    <% if (data.thumbnail) { %>
    <figure class="st-sub-block-image">
        <img src="<%= data.thumbnail %>" />
    </figure>
    <% } %>
    <h3><%= data.title %></h3>
    <a class="st-sub-block-link" href="<%= data.url %>" target="_blank">${iconLink}</a>
    <span class="st-sub-block-site"><%= data.site %></span>
`;

export const personality = `
    <% if (data.thumbnail) { %>
    <figure class="st-sub-block-image">
        <img src="<%= data.thumbnail %>" />
    </figure>
    <% } %>
    <h3><%= data.title %></h3>
    <a class="st-sub-block-link" href="<%= data.url %>" target="_blank">${iconLink}</a>
    <span class="st-sub-block-site"><%= data.site %></span>
`;

export const video = `
    <figure class="st-sub-block-image">
        <img src="<%= data.thumbnail %>" />
    </figure>
    <h3><%= data.legend %></h3>
    <a class="st-sub-block-link" href="<%= data.file %>" target="_blank">${iconLink}</a>
`;

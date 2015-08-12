var $ = require('jquery');
var _ = require('../../lodash.js');
var eventablejs = require('eventablejs');

var template = [
    '<img src="<%= icon %>">',
    '<span><%= title %></span>',
    '<a href="<%= link.href %>"><%= link.text %></a>'
].join('\n');

var serviceItemPrototype = {
    render: function() {
        this.$elem.html(_.template(template, this));

        return this.$elem;
    }
};

module.exports = {
    create: function(params) {
        var instance = Object.assign({}, serviceItemPrototype, eventablejs, params);

        instance.$elem = $('<div class="st-block-service"></div>');

        instance.$elem.on('click', function() {
            instance.trigger('selected', instance);
        });

        instance.render();

        return instance;
    }
}

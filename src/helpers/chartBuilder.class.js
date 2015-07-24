var d3     = require('d3');
var d3plus = require('d3plus');

var sizes = {
    max: 999,
    min: 1
}

var informationsTemplate = [
    '<div class="title">',
        '<input type="texte" placeholder="' + i18n.t('blocks:chart:title') + '" name="chart-name">',
    '</div>',

    '<div class="size">',
        '<label for="chart-width">' + i18n.t('blocks:chart:width') + '</label> <input type="number" min="' + sizes.min + '" max="' + sizes.max + '" value="936" name="chart-width">',
        '<label for="chart-height">' + i18n.t('blocks:chart:height') + '</label> <input type="number"  value="326" name="chart-height">',
    '</div>'

].join('\n');

var pieFormat = [
    '<div class="numbered">',
        '<label for="numbered-select">' + i18n.t('blocks:chart:mode') + '</label> ',
        '<select class="numbered-select" name="numbered-select">',
            '<option value="text">Texte</option>',
            '<option value="number">Chiffre</option>',
        '</select>',
    '</div>'
].join('\n');

function getChartInformationsFields(chartBuilder) {
    return {
        $title: chartBuilder.$informations.find('[name="chart-name"]'),
        $width: chartBuilder.$informations.find('[name="chart-width"]'),
        $height: chartBuilder.$informations.find('[name="chart-height"]'),
        $xBar: chartBuilder.$informations.find('[name="chart-xBar"]'),
        $yBar: chartBuilder.$informations.find('[name="chart-yBar"]')
    };
}

function getChartInformationsFieldsValues(fields) {
    return {
        title: fields.$title.val(),
        width: parseInt(fields.$width.val()),
        height: parseInt(fields.$height.val()),
        xBar: fields.$xBar.val() !== undefined ? fields.$xBar.val() : 'Ligne',
        yBar: fields.$yBar.val() !== undefined ? fields.$yBar.val() : 'Colonne'
    };
}

function getChartValues(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    var values = getChartInformationsFieldsValues(fields);

    Object.assign(chartBuilder.block.blockStorage.data, values);
    return values;
}

function updateValues(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    var storedDatas = chartBuilder.block.blockStorage.data;

    if (storedDatas.title) {
        fields.$title.val(storedDatas.title);
    }

    if (storedDatas.width) {
        fields.$width.val(storedDatas.width);
    }

    if (storedDatas.height) {
        fields.$height.val(storedDatas.height);
    }
    if (storedDatas.xBar) {
        fields.$xBar.val(storedDatas.xBar);
    }
    if (storedDatas.yBar) {
        fields.$yBar.val(storedDatas.yBar);
    }

}

function saveValue(chartBuilder, valueName) {
    var fields = getChartInformationsFields(chartBuilder);
    var values = getChartInformationsFieldsValues(fields);
    chartBuilder.block.blockStorage.data[valueName] = values[valueName];
}

function bindListenersToFields(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    fields.$title.on('change', function(){
        saveValue(chartBuilder, 'title');
    });

    fields.$width.on('change', function() {
        var sizes = getChartValues(chartBuilder);
        chartBuilder.resizeX(sizes);
    });

    fields.$height.on('change', function() {
        var sizes = getChartValues(chartBuilder);
        chartBuilder.resizeY(sizes);
    });

    fields.$xBar.on('change', function() {
        saveValue(chartBuilder, 'xBar');
        chartBuilder.changeXaxis();
        chartBuilder.shape.draw();
    });

    fields.$yBar.on('change', function() {
        saveValue(chartBuilder, 'yBar');
        chartBuilder.changeYaxis();
        chartBuilder.shape.draw();
    });
}

var Chart = function(params) {
    this.init(params);
};

Chart.prototype = {
    init: function(parameters) {
        this.block = parameters.block;
        this.$inner = parameters.block.$inner;

        this.blockType = parameters.type;
        this.display = parameters.block.blockStorage.data.display;
        this.parameters = parameters;
        this.shape = d3plus.viz()
        .container('#' + parameters.block.blockID + ' .' + parameters.$elem.attr('class'))
        .data(parameters.data)
        .type(parameters.type)

        .dev(false);

        if (parameters.type === 'bar') {
            this.shape.id({
                    value: 'name'
                });
            if (this.block.blockStorage.data.xBar === undefined) {
                 this.shape.x({
                value: 'column',
                label: 'Abscisse'
            });
            }
            else {
                this.changeXaxis();

            }

            if (this.block.blockStorage.data.yBar === undefined) {
                this.shape.y({
                    value: 'value',
                    label: 'ordonée'
                });
            }
            else {
                this.changeYaxis();
            }
        }

        if (parameters.type === 'pie') {
            this.shape.size('value');

            if (this.display === 'number') {
                this.shape.id({
                    value: [ 'name', 'value' ],
                    grouping: false
                });
                this.shape.text('value');
                this.shape.tooltip(false);
            }
            else {
                this.shape.id('value');
                this.shape.text('name');
                this.shape.tooltip(false);
            }
        }
        var that = this;
        this.block.$el.find('.numbered-select').on('change', function() {
            var display = this.value;
            that.redraw(display);
            that.block.blockStorage.data.display = display;
        });
    },

    resizeX: function(size) {
        this.shape.width(size.width);
        this.shape.draw();
    },

    resizeY: function(size) {
        this.shape.height(size.height);
        this.shape.draw();
    },

    render: function() {
        this.$informations = this.$inner.find('.st__chart-informations');

        if (this.$informations.children().length === 0) {
            if (this.blockType === 'bar') {
                var chartParams = [
                '<div class="title">',
                    '<input type="texte" placeholder="' + i18n.t('blocks:chart:xTitle') + '" name="chart-xBar">',
                '</div>',
                '<div class="title">',
                    '<input type="texte" placeholder="' + i18n.t('blocks:chart:yTitle') + '" name="chart-yBar">',
                '</div>' ].join('\n');
                var barInformationsTemplate = informationsTemplate + chartParams;
                this.$informations.append(barInformationsTemplate);
            }
            else {
                this.$informations.append(informationsTemplate);
            }
            updateValues(this);

            if (this.blockType === 'pie') {
                this.$informations.append(pieFormat);

                var that = this;
                if (this.display !== undefined) {
                    this.$informations.find('.numbered-select').val(this.display);
                    this.redraw(this.display);
                }
                this.$informations.find('.numbered-select').on('change', function() {
                    var display = this.value;
                    that.display = display;
                    that.redraw(display);
                    that.block.blockStorage.data.display = display;
                });
            }
        }
        bindListenersToFields(this);
        this.shape.draw();
    },

    changeXaxis: function() {
        this.shape.x({
            value: 'column',
            label: this.block.blockStorage.data.xBar
        });
    },

    changeYaxis: function() {
        this.shape.y({
            value: 'value',
            label: this.block.blockStorage.data.yBar
        });
    },

    redraw: function() {
        if (this.display === 'number') {
            this.shape.id({
                value: [ 'name', 'value' ],
                grouping: false
            });
            this.shape.text('value');
            this.shape.tooltip(false);
        }
        else if (this.display === 'text') {
            this.shape.id('value');
            this.shape.text('name');
            this.shape.tooltip(false);
        }

        this.shape.draw();
    },
    destroy: function() {
        this.shape = undefined;
    }
};

module.exports = Chart;

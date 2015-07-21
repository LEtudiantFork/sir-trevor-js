var d3     = require('d3');
var d3plus = require('d3plus');

//Object used to fix the input type number range
var sizes = {
    max: 999,
    min: 1
}
//HTML for the top informations on the chart
var informationsTemplate = [
    '<div class="title">',
        '<input type="texte" placeholder="' + i18n.t('blocks:chart:title') + '" name="chart-name">',
    '</div>',

    '<div class="size">',
        '<label for="chart-width">' + i18n.t('blocks:chart:width') + '</label> <input type="number" min="' + sizes.min + '" max="' + sizes.max + '" value="936" name="chart-width">',
        '<label for="chart-height">' + i18n.t('blocks:chart:height') + '</label> <input type="number"  value="326" name="chart-height">',
    '</div>'

].join('\n');
//HTML only for the pie  chart
var pieFormat = [
    '<div class="numbered">',
        '<label for="numbered-select">' + i18n.t('blocks:chart:mode') + '</label> ',
        '<select class="numbered-select" name="numbered-select">',
            '<option value="text">Texte</option>',
            '<option value="number">Chiffre</option>',
        '</select>',
    '</div>'
].join('\n');

/**
 * Parse the chartbuilder.$information, then return an object representing all fields.
 * @return {object}              All scoped fields
 */
function getChartInformationsFields(chartBuilder) {
    return {
        $title: chartBuilder.$informations.find('[name="chart-name"]'),
        $width: chartBuilder.$informations.find('[name="chart-width"]'),
        $height: chartBuilder.$informations.find('[name="chart-height"]'),
        $xBar: chartBuilder.$informations.find('[name="chart-xBar"]'),
        $yBar: chartBuilder.$informations.find('[name="chart-yBar"]')
    };
}
/**
 * take an object with all the fields and return an object containing all the values
 */
function getChartInformationsFieldsValues(fields) {
    return {
        title: fields.$title.val(),
        width: parseInt(fields.$width.val()),
        height: parseInt(fields.$height.val()),
        xBar: fields.$xBar.val() !== undefined ? fields.$xBar.val() : 'Ligne',
        yBar: fields.$yBar.val() !== undefined ? fields.$yBar.val() : 'Colonne'
    };
}
/**
 * Use getChartInformationsFields & getChartInformationsFieldsValues
 * to retrieve and save informations in our block;
 */
function getChartValues(chartBuilder) {
    var fields = getChartInformationsFields(chartBuilder);
    var values = getChartInformationsFieldsValues(fields);

    Object.assign(chartBuilder.block.blockStorage.data, values);
    return values;
}
/**
 * Use getChartInformationsFields to fill the html with chartbuilder stored datas
 *
 */
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
/**
 * Save one value in chart block;
 */
function saveValue(chartBuilder, valueName) {
    var fields = getChartInformationsFields(chartBuilder);
    var values = getChartInformationsFieldsValues(fields);
    chartBuilder.block.blockStorage.data[valueName] = values[valueName];
}

/**
 * Bind listeners on every information fiel
 *
 */
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
        .data(parameters.data) //Array of data formated for d3plus
        .type(parameters.type)  //define chaty type

        .dev(false); //D3plus logs, really usefull wen something break

        if (parameters.type === 'bar') {
            //bar specific configurations.
            this.shape.id({
                    value: 'name'
                });
            //D3plus configuration for X-axis
            if (this.block.blockStorage.data.xBar === undefined) {
                this.shape.x({
                value: 'column',
                label: 'Abscisse'
            });
            }
            else {
                this.changeXaxis();

            }

            //D3plus configuration for Y-axis
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
            //pie specific configurations.

            this.shape.size('value');

            if (this.display === 'number') {
                this.shape.id({
                    value: [ 'name', 'value' ], //prevent pie chart to collapse when same value apear.
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
        //Put a listenner on display select
        this.block.$el.find('.numbered-select').on('change', function() {
            //get the display value
            var display = this.value;
            //redraw the chart
            that.redraw(display);
            //update the bloc display property
            that.block.blockStorage.data.display = display;
        });
    },
    /**
     * Called when the width value is changed
     */
    resizeX: function(size) {
        this.shape.width(size.width);
        this.shape.draw();
    },

    /**
     * Called when the height value is changed
     */
    resizeY: function(size) {
        this.shape.height(size.height);
        this.shape.draw();
    },

    render: function() {
        //scope the chart informations;
        this.$informations = this.$inner.find('.st__chart-informations');
        //true when we load for the first time our chart
        if (this.$informations.children().length === 0) {
            if (this.blockType === 'bar') {
                //Put bar chart specific fields
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
                //Non modified template , will be used in all new chart type
                this.$informations.append(informationsTemplate);
            }
            updateValues(this);

            if (this.blockType === 'pie') {
                //add pie specific HTML
                this.$informations.append(pieFormat);

                var that = this;
                if (this.display !== undefined) {
                    this.$informations.find('.numbered-select').val(this.display);
                    this.redraw(this.display);
                }

                this.$informations.find('.numbered-select').on('change', function() {
                    var display = this.value;
                    that.display = display; //update the chartbuilder instance display
                    that.redraw(display);
                    that.block.blockStorage.data.display = display; //update the sir trevor chartbuilder display field
                });
            }
        }
        bindListenersToFields(this);
        this.shape.draw();
    },

    /**
     * Used when X-axis name have been declared
     */
    changeXaxis: function() {
        this.shape.x({
            value: 'column',
            label: this.block.blockStorage.data.xBar
        });
    },

    /**
     * Used when Y-axis name have been declared
     */
    changeYaxis: function() {
        this.shape.y({
            value: 'value',
            label: this.block.blockStorage.data.yBar
        });
    },
    /**
     * check the actual display then redraw the chart
     */
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
    /**
     * remove the D3plus object
     */
    destroy: function() {
        this.shape = undefined;
    }
};

module.exports = Chart;

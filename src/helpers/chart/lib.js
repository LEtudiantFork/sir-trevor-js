function registerShowHide(chart) {
    chart.on('show', function() {
        chart.$chartArea.show();
    });

    chart.on('hide', function() {
        chart.$chartArea.hide();
    });
}

exports.registerShowHide = registerShowHide;

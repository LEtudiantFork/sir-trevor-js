var d3     = require('d3');
var d3plus = require('d3plus');

/* * /
var data = [
    { value: 100, name: "alpha" },
    { value: 70, name: "beta" },
    { value: 40, name: "gamma" },
    { value: 15, name: "delta" },
    { value: 5, name: "epsilon" },
    { value: 1, name: "zeta "}
];

d3plus.viz()
.container('#viz')
.data(data)
.type('pie')
.id('name')
.size('value')
.draw();
/**/

/* * /
var data = [
    { year: 1991, name:"alpha", value: 15 },
    { year: 1991, name:"beta", value: 10 },
    { year: 1991, name:"gamma", value: 5 },
    { year: 1991, name:"delta", value: 50 },
    { year: 1992, name:"alpha", value: 20 },
    { year: 1992, name:"beta", value: 10 },
    { year: 1992, name:"gamma", value: 10 },
    { year: 1992, name:"delta", value: 43 },
    { year: 1993, name:"alpha", value: 30 },
    { year: 1993, name:"beta", value: 40 },
    { year: 1993, name:"gamma", value: 20 },
    { year: 1993, name:"delta", value: 17 },
    { year: 1994, name:"alpha", value: 60 },
    { year: 1994, name:"beta", value: 60 },
    { year: 1994, name:"gamma", value: 25 },
    { year: 1994, name:"delta", value: 3 2}
];

var visualization = d3plus.viz()
.container('#viz')
.data(data)
.type('bar')
.id('name')
.x('year')
.y('value')
.draw();
/**/

var ChartBuilder = function(params) {

};

ChartBuilder.prototype = {};

module.exports = ChartBuilder;

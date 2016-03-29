#!/usr/bin/env node

var browserify          = require('browserify');
var browserifyDerequire = require('browserify-derequire');
var fs                  = require('fs');
var replace             = require('replace');

// break the UMD declaration so deamdify doesn't get confused
replace({
    regex: 'typeof define === \'function\' && define.amd',
    replacement: 'false',
    paths: [ './node_modules/html-janitor/src/html-janitor.js' ]
});

// create a browserify bundle with derequire plugin
var bundler = browserify(
    __dirname + '/src/scribe.js',
    {
        standalone: 'scribeBuild',
        plugin: [ browserifyDerequire ]
    }
);

// run deamdify globally
bundler.transform({
  global: true
}, 'deamdify');

// write bundle to file
bundler.bundle()
.pipe(fs.createWriteStream(__dirname + '/src/scribe.build.js'));

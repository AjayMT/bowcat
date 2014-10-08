#!/usr/bin/env node

/* global require, module */

var path = require('path');
var fs = require('fs');

var _ = require('lodash');

var opts = require('minimist')(process.argv.slice(2));

if (opts.help) {
  console.log('Usage: bowcat <input-dir> -o <output-dir>');
  process.exit(0);
}

var inputDir = path.resolve(opts._[0]);
var outputDir = opts.o || path.join('.', 'build');
outputDir = path.resolve(outputDir);

var pkgs = fs.readdirSync(path.join(inputDir, 'bower_components'));

pkgs = _.map(pkgs, function (p) {
  return path.join(inputDir, 'bower_components', p);
});

function concatPackages (packages, outDir) {
  if (! outDir) outDir = path.join('.', 'build');

  var files = [];

  _.each(packages, function (package, i, l) {
    var packageFiles = fs.readdirSync(package);

    files = files.concat(_.map(packageFiles, function (f) {
      return path.join(package, f);
    }));
  });

  var concatJS = '';
  var concatCSS = '';

  _.each(files, function (filepath, i, l) {
    if (filepath.indexOf('json') !== -1) return;

    var contents = fs.readFileSync(filepath, { encoding: 'utf-8' }) + '\n';

    if (filepath.indexOf('js') === (filepath.length - 2))
      concatJS += contents;
    else if (filepath.indexOf('css') === (filepath.length - 3))
      concatCSS += contents;
  });

  if (concatJS !== '' || concatCSS !== '')
    fs.mkdirSync(outDir);

  if (concatJS !== '')
    fs.writeFileSync(path.join(outDir, 'build.js'), concatJS);

  if (concatCSS !== '')
    fs.writeFileSync(path.join(outDir, 'build.css'), concatJS);
}

module.exports.concatPackages = concatPackages;

if (require.main === module)
  concatPackages(pkgs, outputDir);

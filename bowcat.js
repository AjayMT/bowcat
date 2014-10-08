#!/usr/bin/env node

/* global require, module */

var path = require('path');
var fs = require('fs');

var _ = require('lodash');

var opts = require('minimist')(process.argv.slice(2));

if (opts.help) {
  console.log('Usage: bowcat [<input-dir>] [-o <output-dir>]');
  process.exit(0);
}

var inputDir = path.resolve(opts._[0]) || '.';
var outputDir = opts.o || path.join('.', 'build');
outputDir = path.resolve(outputDir);

var pkgs = fs.readdirSync(path.join(inputDir, 'bower_components'));

pkgs = _.map(pkgs, function (p) {
  return path.join(inputDir, 'bower_components', p);
});

var concatedPkgs = [];

function concatPackage (package, outDir) {
  var bowerJSON = JSON.parse(fs.readFileSync(path.join(package, 'bower.json')));
  var deps = bowerJSON.dependencies || {};

  _.each(Object.keys(deps), function (pkg, i, l) {
    var components = package.split(path.sep);
    var pkgpath = components.slice(components.length - 1).join(path.sep);
    concatPackage(path.join(pkgpath, pkg));
  });

  if (_.contains(concatedPkgs, path.basename(package))) return;

  var files = fs.readdirSync(package);
  files = _.map(files, function (f) {
    return path.join(package, f);
  });

  var concatJS = '', concatCSS = '';

  _.each(files, function (filepath, i, l) {
    var contents = fs.readFileSync(filepath) + '\n';

    if (filepath.indexOf('js') === (filepath.length - 2))
      concatJS += contents;
    else if (filepath.indexOf('css') === (filepath.length - 3))
      concatCSS += contents;
  });

  if (concatJS !== '')
    fs.writeFileSync(path.join(outDir, 'build.js'), concatJS);

  if (concatCSS !== '')
    fs.writeFileSync(path.join(outDir, 'build.css'), concatCSS);

  concatedPkgs.push(path.basename(package));
}

function concatPackages (packages, outDir) {
  if (! outDir) outDir = path.join('.', 'build');

  fs.mkdirSync(outDir);

  _.each(packages, function (package, i, l) {
    concatPackage(package, outDir);
  });
}

module.exports.concatPackages = concatPackages;

if (require.main === module)
  concatPackages(pkgs, outputDir);

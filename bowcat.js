#!/usr/bin/env node

/* global require, module */

// require()s
var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var rimraf = require('rimraf');

var opts = require('minimist')(process.argv.slice(2));

// opt parsing
if (opts.help) {
  console.log('Usage: bowcat [<input-dir>] [-o <output-dir>] [--min | -m]');
  process.exit(0);
}

var includeMins = opts.min || opts.m;
var inputDir = opts._[0] || '.';
var outputDir = opts.o || path.join('.', 'build');

inputDir = path.resolve(inputDir);
outputDir = path.resolve(outputDir);

var pkgs = fs.readdirSync(path.join(inputDir, 'bower_components'));

pkgs = _.map(pkgs, function (p) {
  return path.join(inputDir, 'bower_components', p);
});

var concatedPkgs = [];

// constructFileList: create a list of files to concat for a particular
// package. 'dir' is the path to the package, 'mains' is the 'main' field
// in the package's bower.json, 'minified' is whether or not to include
// minified files
function constructFileList (dir, mains, minified) {
  var files = fs.readdirSync(dir);

  files = _.map(files, function (f) {
    return path.join(dir, f);
  });

  _.each(files, function (f, i, l) {
    if (fs.statSync(f).isDirectory())
      files = files.concat(constructFileList(f, mains, minified));
  });

  files = _.filter(files, function (f) {
    if (fs.statSync(f).isDirectory()) return false;

    var fname = path.basename(f).split('.').slice(0, -1).join('.');

    var include = _.some(mains, function (m) {
      m = path.basename(m).split('.').slice(0, -1).join('.');
      return m === fname;
    });

    if (typeof mains === 'string') {
      var mainsName = path.basename(mains).split('.').slice(0, -1).join('.');
      include = (mainsName === fname);
    }

    if (minified)
      include = f.indexOf('.min.js') === (f.length - 7)
             || f.indexOf('.min.css') === (f.length - 8);

    return include;
  });

  return files;
}

// concatPackage: concatenate a single package. 'package' is the full path to
// the package directory, 'outDir' is the output directory, 'minified'
// is whether or not to include minified files
function concatPackage (package, outDir, minified) {
  if (_.contains(concatedPkgs, path.basename(package))) return;

  var bowerJSON = JSON.parse(fs.readFileSync(path.join(package, 'bower.json')));
  var deps = bowerJSON.dependencies || {};
  var mains = bowerJSON.main || [];

  concatedPkgs.push(path.basename(package));

  _.each(Object.keys(deps), function (pkg, i, l) {
    var components = package.split(path.sep);
    var pkgpath = components.slice(0, -1).join(path.sep);

    concatPackage(path.join(pkgpath, pkg), outDir, minified);
  });

  var files = constructFileList(package, mains, minified);
  var concatJS = '', concatCSS = '';

  _.each(files, function (filepath, i, l) {
    var contents = fs.readFileSync(filepath) + '\n';
    var ext = filepath.split('.')[filepath.split('.').length - 1];

    if (ext === 'js')
      concatJS += contents;
    else if (ext === 'css')
      concatCSS += contents;
  });

  if (concatJS !== '')
    fs.appendFileSync(path.join(outDir, 'build.js'), concatJS);

  if (concatCSS !== '')
    fs.appendFileSync(path.join(outDir, 'build.css'), concatCSS);
}

// concatPackages: concatenate a list of packages ('packages'). 'outDir'
// is the output directory, 'minified' is whether or not to include
// minified files.
function concatPackages (packages, outDir, minified) {
  if (! outDir) outDir = path.join('.', 'build');

  if (fs.existsSync(outDir)) rimraf.sync(outDir);
  fs.mkdirSync(outDir);

  _.each(packages, function (package, i, l) {
    concatPackage(package, outDir, minified);
  });
}

module.exports = {
  concatPackage: concatPackage,
  concatPackages: concatPackages,
  constructFileList: constructFileList
};

if (require.main === module)
  concatPackages(pkgs, outputDir, includeMins);

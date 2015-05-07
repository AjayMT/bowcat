#!/usr/bin/env node

/* global require, module */

// require()s
var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var rimraf = require('rimraf');
var json = require('bower-json');
var bowerDirectory = require('bower-directory');
var debug = require('debug')('bowcat');

var opts = require('minimist')(process.argv.slice(2));

var usage = 'Usage: bowcat [<input-dir>] [-o <output-dir>] [--min | -m]\n\n'
          + 'Quickly concatenate bower dependencies.\n\n'
          + 'Options:\n'
          + '  -o <output-dir>  Where to write the concatenated dependencies to\n'
          + '  --min, -m        Include only minified files [default: false]\n'

// opt parsing
if (opts.help) {
  process.stdout.write(usage);
  process.exit(0);
}

var includeMins = opts.min || opts.m;
var inputDir = opts._[0] || '.';
var outputDir = opts.o || path.join('.', 'build');

inputDir = bowerDirectory.sync({ cwd: path.resolve(inputDir) });

outputDir = path.resolve(outputDir);

var pkgs = fs.readdirSync(inputDir);

pkgs = _.map(pkgs, function (p) {
  return path.join(inputDir, p);
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
function concatPackage (pack, outDir, minified) {
  if (_.contains(concatedPkgs, path.basename(pack))) return;

  var bowerFile = 'bower.json';

  if (! fs.existsSync(path.join(pack, bowerFile)))
    bowerFile = '.bower.json';

  var regularJSON = JSON.parse(
    fs.readFileSync(path.join(pack, bowerFile))
  );
  var bowerJSON = json.normalize(regularJSON);
  var deps = bowerJSON.dependencies || {};
  var mains = bowerJSON.main || [];

  concatedPkgs.push(path.basename(pack));

  _.each(Object.keys(deps), function (pkg, i, l) {
    var components = pack.split(path.sep);
    var pkgpath = components.slice(0, -1).join(path.sep);

    concatPackage(path.join(pkgpath, pkg), outDir, minified);
  });

  debug('concatenating package ' + path.basename(pack) + '...');

  var files = constructFileList(pack, mains, minified);
  var concatJS = '', concatCSS = '';

  _.each(files, function (filepath, i, l) {
    var contents = fs.readFileSync(filepath) + '\n';
    var ext = filepath.split('.')[filepath.split('.').length - 1];

    if (ext === 'js' || ext === 'css')
      debug('including file ' + filepath + '...');

    if (ext === 'js')
      concatJS += contents;
    else if (ext === 'css')
      concatCSS += contents;
  });

  if (concatJS !== '' || concatCSS !== '')
    debug('writing files...');

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

  _.each(packages, function (pack, i, l) {
    concatPackage(pack, outDir, minified);
  });
}

module.exports = {
  concatPackage: concatPackage,
  concatPackages: concatPackages,
  constructFileList: constructFileList
};

if (require.main === module)
  concatPackages(pkgs, outputDir, includeMins);


/* global require */

var path = require('path');
var fs = require('fs');

var should = require('should');
var exec = require('exec');
var rimraf = require('rimraf');

var bowcat = path.join(__dirname, '..', 'bowcat.js');
var buildPath = path.join(__dirname, 'build');

exec([bowcat, __dirname, '-o', buildPath], function (err, out, code) {
  var jsPath = path.join(buildPath, 'build.js');
  var cssPath = path.join(buildPath, 'build.css');

  var buildjs = fs.readFileSync(jsPath, { encoding: 'utf-8' });
  var buildcss = fs.readFileSync(cssPath, { encoding: 'utf-8' });

  buildjs.indexOf('// foo.js').should.be.above(buildjs.indexOf('// bar.js'));
  buildcss.indexOf('/* foo.css */')
  .should.be.above(buildcss.indexOf('/* bar.css */'));

  rimraf.sync(buildPath);
});

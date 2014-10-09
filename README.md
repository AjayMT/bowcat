
# bowcat
[![Build Status](https://travis-ci.org/AjayMT/bowcat.svg)](https://travis-ci.org/AjayMT/bowcat)

Quickly concatenate your project's bower dependencies. Like [grunt-bower-concat](http://npmjs.org/grunt-bower-concat) but without the weight and complexity of grunt.

## Installation
```sh
$ npm install -g bowcat
```

## Usage
```
bowcat [<input-dir>] [-o <output-dir>] [--min | -m]
```

`input-dir` is the directory containing the 'bower_components' folder. Defaults to '.'.

`ouput-dir` is the directory to which the concatenated files will be written. Defaults to './build'.

`--min` or `-m` makes bowcat include only minified files (by default, it only includes files listed in the packages' 'main' fields). Defaults to false.

## API
### bowcat.concatPackage(package, outDir, minified)
Concatenate a single package. 'package' is the full path to the package, 'outDir' is the output directory, 'minified' is whether or not to include only minified files.

### bowcat.concatPackages(packages, outDir, minified)
Concatenate a list of packages. 'packages' is the list of full paths of packages to concatenate, 'outDir' is the output directory, 'minified' is whether to include only minified files.

### bowcat.constructFileList(dir, mains, minified)
Construct a list of files to concatenate for a specific package. 'dir' is the path to the package, 'mains' is the contents of the 'main' field in the package's bower.json, 'minified' is whether or not to include only minified files.

## Logging
bowcat uses [debug](http://npmjs.org/debug) by TJ Holowaychuk for logging. To turn on logging:

```sh
$ export DEBUG="bowcat"
```

## License
MIT License. See `./LICENSE` for details.

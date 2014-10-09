
# bowcat
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

`--min` or `-m` makes bowcat include minified (by default, it only includes files listed in the packages' 'main' fields). Defaults to false.

## License
MIT License.

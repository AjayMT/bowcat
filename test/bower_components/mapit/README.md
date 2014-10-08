
# mapit
[![](https://travis-ci.org/AjayMT/mapit.js.svg?branch=master)](http://travis-ci.org/AjayMT/mapit.js)

Are you tired of doing this?

```javascript
var app = express();

app.set('abc', 'xyz');
app.set('foo', true);
app.set('bar', {});
```

With mapit, you can do this:

```javascript
var app = express();
var mapit = require('mapit');

app.mapit(app.set, {
  'abc': 'xyz',
  'foo': true,
  'bar': {}
});
```

It works with anything:

```javascript
app.mapit(app.get, {
  '/': function (req, res) {
    res.send('hello');
  },
  '/hello': function (req, res) {
    res.send('world');
  }
});
```

You can even use it like this:

```javascript
// It doesn't have to be app.mapit
mapit(app.set, {
  'abc': 'xyz'
}, app);
```

**Note**: express was just an example. mapit works everywhere.

## Installation
### node
Install with npm:

```sh
$ npm install --save mapit
```

### browser
[bower](http://bower.io):

```sh
$ bower install --save mapit
```

Or just put `mapit.js` in a `script` tag.

## License
MIT License. See `./LICENSE` for details.


# linkit
[![Build Status](https://travis-ci.org/AjayMT/linkit.js.svg)](https://travis-ci.org/AjayMT/linkit.js)

Method chaining is nice. Wouldn't it be nicer if it were everywhere?

With linkit, you can chain methods everywhere!

Turn this:

```javascript
var app = express();

app.set('foo', 'bar');
app.set('abc', true);
app.set('baz', {});
```

into this:

```javascript
var app = express();
var linkit = require('linkit');

linkit(app)
.set('foo', 'bar')
.set('abc', true)
.set('baz', {});
```

Or even this:

```javascript
// It can be app.linkit() instead of linkit(app)
app.linkit()
.set('foo', 'bar')
.set('abc', true)
.set('baz', {});
```

linkit won't affect methods that return things:

```javascript
// contents is still set to whatever fs.readFileSync returns
var contents = fs.linkit()
                 .readFile(someStuffHere)
                 .readFileSync(someOtherStuffHere);
```

linkit allows you to set and get properties normally:

```javascript
foo.linkit()
.readFile(bar)
.writeFile(bar)
.abc = 'xyz'; // this will work fine
```

linkit doesn't change the actual object's methods:

```javascript
app.linkit()
.set('foo', 'bar')
.listen(3000);

app.set('hello', 'world'); // regular, non-method-chainable app.set
```

Use linkit with [mapit](http://github.com/AjayMT/mapit.js) for even more sugar-coating:

```javascript
var app = express();
var linkit = require('linkit');
var mapit = require('mapit');

app.linkit()
.mapit(app.set, {
  'foo': 'bar',
  'baz': true
})
.mapit(app.get, {
  '/': function (req, res) {
    res.send('hello');
  },
  '/hello': function (req, res) {
    res.send('world');
  }
})
.listen(3000);
```

## Installation
### node

```sh
$ npm install --save linkit
```

### browser
Install it with [bower](http://bower.io):

```sh
$ bower install --save linkit
```

Or get `linkit.js` and put it in a `script` tag.

## License
MIT License. See `./LICENSE`.

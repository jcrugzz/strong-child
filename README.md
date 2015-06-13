# strong-child

A module that exposes a duplex stream interface for communicating with
[`strong-parent`][strong-parent]. This creates
a simple way to receive a stream of data from the parent process via the
filesystem and send it back up to the parent in the same way.

## install

```sh
npm i strong-child
```

## Usage

See [`strong-parent`] for the parent process usage. Below is how you would
create a child process.

```js
var strongChild = require('strong-child');
var jsonStream = require('json-stream');
var someExpensiveObjectTransform = require('./transform');

var duplex = strongChild();

//
// Receive some newline delimited JSON, transform it and send it back to the
// parent
//
duplex
  .pipe(jsonStream())
  .pipe(someExpensiveObjectTransform())
  .pipe(duplex);


```

## Tests

Tests found in [`strong-parent`][strong-parent]

## License
MIT

[strong-parent]: https://github.com/jcrugzz/strong-parent

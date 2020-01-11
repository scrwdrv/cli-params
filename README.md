# cli-params
 cli-params is a simple module that helps your CLI tool parse command line arguments and build parameters format to test if cmd is valid


## Installation

```sh
npm i cli-params
```

## Usage
cli-params works on both regular package and globally installed one.
```sh
# node
node index.js --p1 --p2 hello
# global
your-cli-tool --p1 --p2 hello
```
```js
import cliParams from 'cli-params';

console.log(cliParams());
// output: { 'p1': true, 'p2': 'hello' }
```
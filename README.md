# cli-params
 cli-params is a simple module that helps your CLI tool parse command line arguments and build parameters format to test if cmd is valid


## Installation

```sh
npm i cli-params
```

## Usage
cli-params works on both regular package and globally installed one.

### Simple Method
```sh
# node
node index.js --p1 --p2 hello
# global
your-cli-tool --p1 --p2 hello
```
```js
import cliParams from 'cli-params';

console.log(cliParams());
```
```json
{ "p1": true, "p2": "hello" }
```
---
### Prebuilt Format
```sh
node index.js -d -i 50 --id scrwdrv --bonus 12.0
```
```js
console.log(cliParams([
    {
        param: 'debug',
        type: 'boolean', // true or false, no given value will be treated as `true`
        optional: true, // boolean is optional by default, no param means `false`
        alias: 'd'
    },
    {
        param: 'interval',
        type: 'int', // no floating point is allowed
        alias: 'i'
    },
    {
        param: 'id',
        type: 'string'
    },
    {
        param: 'bonus',
        type: 'float', // allow both int and float
        optional: false // which is default
    }
]));
```
```json
{ "debug": true, "interval": 50, "id": "scrwdrv", "bonus": 12 }
```
---
### Trailing Param (Target)
Parameter with no name and located at the end of command line will be treated as `Target`. Every cmd can only have one target and need to be named beforehand.

```sh
node index.js -r 50 https://google.com
```
```js
console.log(cliParams([
    {
        param: 'rate',
        type: 'int',
        alias: 'r'
    }
], 'url'));
```
```json
{ "url": "https://google.com", "rate": 50 }
```
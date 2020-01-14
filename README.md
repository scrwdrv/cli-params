# cli-params
 cli-params is a simple module that helps your CLI tool parse command line arguments and build parameters format to test if cmd is valid


## Installation

```sh
npm i cli-params
```

## Usage
cli-params works on both regular package and globally installed one.

### Simple Method
Dead simple, use it on the fly.
```sh
# node
node index.js --p1 --p2 hello
# global
your-cli-tool --p1 --p2 hello
```
```js
import CLIParams from 'cli-params';

new CLIParams().exec((err, params) => {
    if (err) return console.log(err);
    console.log(params);
});
```
```json
{ "p1": true, "p2": "hello" }
```
---
### Prebuilt Format
Use `add` method to add format(s).
```sh
node index.js -d -i --id scrwdrv --bonus 12.0
```
```js
const cliParams = new CLIParams();

cliParams.add({
    params: [
        {
            param: 'debug',
            type: 'boolean', // true or false, no given value will be treated as `true`
            optional: true, // boolean is optional by default, no param means `false`
            alias: 'd'
        },
        {
            param: 'interval',
            type: 'int', // no floating point is allowed,
            default: 50, // default value when value is not given
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
    ]
}, (err) => {
    if (err) return console.log(err);
    cliParams.exec((err, params) => {
        if (err) return console.log(err);
        console.log(params);
    });
});
```
```json
{ "debug": true, "interval": 50, "id": "scrwdrv", "bonus": 12 }
```
#### Types for Param
- int 
- float
- string
- boolean
- array-of-int     (not available for [Target](#target))
- array-of-float   (not available for [Target](#target))
- array-of-string  (not available for [Target](#target))
- array-of-boolean (not available for [Target](#target))

### Mutiple Formats
You can pass formats in an array, by array index order, formats will be used to parse given parameters and callback the first successfully parsed one.
```sh
node index.js -h
```
```js
cliParams.add([
    {
        params: [
            {
                param: 'input',
                type: 'string',
                alias: 'i'
            },
            {
                param: 'password',
                type: 'string',
                optional: true,
                alias: 'p'
            }
        ],
        id: 'regular' // id is not optional when multiple formats are submitted
    },
    {
        params: {
            param: 'help',
            type: 'boolean',
            alias: 'h'
        },
        id: 'help' // id is not optional when multiple formats are submitted
    },
    {
        params: {
            param: 'version',
            type: 'boolean',
            alias: 'v'
        },
        id: 'version' // id is not optional when multiple formats are submitted
    }
]).exec((err, params, id) => {
    if (err) return console.log(err);
    console.log(id);
    // output: help
    console.log(params);
});

```
```json
{ "help": true }
```


### Array of ...
Passing multiple values with space as separator to a single parameter.
```sh
node index.js -i 1 2 3 4 5 -s google yahoo myTarget 
```
```js
new CLIParams().add({
    params: [
        {
            param: 'intArr',
            type: 'array-of-int',
            alias: 'i'
        }, {
            param: 'stringArr',
            type: 'array-of-string',
            alias: 's'
        }
    ],
    target: {
        param: 'target',
        type: 'string'
    }
}).exec(async (err, params) => {
    if (err) return console.log(err);
    console.log(params);
});
```
```json
{ "target": "myTarget", "intArr": [ 1, 2, 3, 4, 5 ], "stringArr": [ "google", "yahoo" ] }
```

### <span id="target">Trailing Param (Target)</a>
Parameter with no name and located at the end of command line will be treated as `Target`. Every cmd can only have one target and need to be named beforehand.

```sh
node index.js -r 50 https://google.com
```
```js
cliParams.add({
    params:
    {
        param: 'rate',
        type: 'int',
        alias: 'r'
    },
    target: {
        param: 'url',
        type: 'string',
        optional: false // which is default
    }
}, (err) => {
    if (err) return console.log(err);
    cliParams.exec((err, params) => {
        if (err) return console.log(err);
        console.log(params);
    });
});
```
```json
{ "url": "https://google.com", "rate": 50 }
```
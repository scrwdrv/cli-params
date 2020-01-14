"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CLIParams {
    constructor() {
        this.args = process.argv.slice(2);
        this.formats = {};
    }
    add(paramFormats, cb) {
        if (!cb)
            cb = () => { };
        if (Array.isArray(paramFormats)) {
            for (let i = paramFormats.length; i--;)
                if (!paramFormats[i].id)
                    return cb(`ID is NOT optional when submitting multiple formats`);
        }
        else {
            paramFormats = [paramFormats];
            if (Object.keys(this.formats).length)
                if (!paramFormats[0].id)
                    return cb(`ID is NOT optional when submitting multiple formats`);
        }
        for (let i = 0, l = paramFormats.length; i < l; i++) {
            if (!paramFormats[i].id)
                paramFormats[i].id = 'default';
            if (this.formats[paramFormats[i].id])
                return cb(`Duplicate ID: ${paramFormats[i].id}`);
            if (!Array.isArray(paramFormats[i].params))
                paramFormats[i].params = [paramFormats[i].params];
            this.formats[paramFormats[i].id] = {
                params: paramFormats[i].params,
                target: paramFormats[i].target
            };
        }
        cb();
    }
    exec(cb) {
        const ids = Object.keys(this.formats), parse = (i = 0) => {
            const id = ids[i], args = [...this.args], next = (err) => {
                if (err)
                    if (i === ids.length - 1)
                        cb(err, null, id);
                    else
                        parse(i + 1);
                else
                    cb(null, result, id);
            };
            let result = {};
            if (this.formats[id].target) {
                const val = args.pop();
                if (!val)
                    if (!this.formats[id].target.optional)
                        cb(`No target is found`);
                    else
                        result[this.formats[id].target.param] = null;
                else {
                    const err = parseType(this.formats[id].target.type, this.formats[id].target.param, val);
                    if (err)
                        return next(err);
                }
            }
            for (let i = 0; i < args.length; i++) {
                let index = -1;
                for (let j = this.formats[id].params.length; j--;)
                    if ('--' + this.formats[id].params[j].param === args[i] || '-' + this.formats[id].params[j].alias === args[i]) {
                        index = j;
                        break;
                    }
                if (index === -1)
                    return next(`Unknown parameter: ${args[i]}`);
                if (!args[i + 1] || /^-/.test(args[i + 1]))
                    if (this.formats[id].params[index].default)
                        result[this.formats[id].params[index].param] = this.formats[id].params[index].default;
                    else if (this.formats[id].params[index].type === 'boolean')
                        result[this.formats[id].params[index].param] = true;
                    else
                        return next(`Invalid value for parameter: ${this.formats[id].params[index].param}`);
                else {
                    const err = parseType(this.formats[id].params[index].type, this.formats[id].params[index].param, args[i + 1]);
                    if (err)
                        return next(err);
                    else
                        i++;
                }
            }
            for (let i = this.formats[id].params.length; i--;)
                if (result[this.formats[id].params[i].param] === undefined)
                    if (!this.formats[id].params[i].optional)
                        return next(`Missing required parameter: ${this.formats[id].params[i].param}`);
                    else
                        result[this.formats[id].params[i].param] = null;
            next();
            function parseType(type, param, val) {
                switch (type) {
                    case 'boolean':
                        if (!/^true|false$/i.test(val))
                            return `Invalid value for ${param}[${type}]: ${val}`;
                        result[param] = val.toLowerCase() === 'true' ? true : false;
                        break;
                    case 'string':
                        if (!val)
                            return `No value for ${param}[${type}]`;
                        result[param] = val;
                        break;
                    case 'int':
                        if (!/^\d+$/.test(val))
                            return `Invalid value for ${param}[${type}]: ${val}`;
                        result[param] = parseInt(val);
                        break;
                    case 'float':
                        if (!/^\d+(\.\d+)?$/.test(val))
                            return `Invalid value for ${param}[${type}]: ${val}`;
                        result[param] = parseFloat(val);
                        break;
                    default:
                        return `Unknown type: ${type}`;
                }
                return null;
            }
        };
        if (!ids.length) {
            const args = [...this.args];
            let result = {};
            for (let i = 0; i < args.length; i++)
                if (/^--.+$/.test(args[i])) {
                    const param = args[i].slice(2);
                    if (!args[i + 1])
                        result[param] = true;
                    else if (/^-/.test(args[i + 1]))
                        result[param] = true;
                    else {
                        result[param] = args[i + 1];
                        i++;
                    }
                }
                else
                    return cb(`Unknown parameter: ${args[i]}`);
            cb(null, result);
        }
        else
            parse();
    }
}
exports.default = CLIParams;
//# sourceMappingURL=index.js.map
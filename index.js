"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cliParams(format, target) {
    let args = process.argv.slice(2), result = {};
    if (target) {
        const val = args.pop();
        if (!val)
            if (!target.optional)
                throw `No target is found`;
            else
                result[target.param] = null;
        else
            parseType(target.type, target.param, val);
    }
    for (let i = 0; i < args.length; i++) {
        if (format) {
            let index = -1;
            for (let j = format.length; j--;)
                if ('--' + format[j].param === args[i] || '-' + format[j].alias === args[i]) {
                    index = j;
                    break;
                }
            if (index === -1)
                throw `Unknown parameter: ${args[i]}`;
            if (!args[i + 1] || /^-/.test(args[i + 1]))
                if (format[index].default)
                    result[format[index].param] = format[index].default;
                else if (format[index].type === 'boolean')
                    result[format[index].param] = true;
                else
                    throw `Invalid value for parameter: ${format[index].param}`;
            else
                parseType(format[index].type, format[index].param, args[i + 1]), i++;
        }
        else if (/^--.+$/.test(args[i])) {
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
            throw `Unknown parameter: ${args[i]}`;
    }
    if (format)
        for (let i = format.length; i--;)
            if (result[format[i].param] === undefined)
                if (!format[i].optional)
                    throw `Missing required parameter: ${format[i].param}`;
                else
                    result[format[i].param] = null;
    return result;
    function parseType(type, param, val) {
        switch (type) {
            case 'boolean':
                if (!/^true|false$/i.test(val))
                    throw `Invalid value for ${param}[${type}]: ${val}`;
                result[param] = val.toLowerCase() === 'true' ? true : false;
                break;
            case 'string':
                result[param] = val;
                break;
            case 'int':
                if (!/^\d+$/.test(val))
                    throw `Invalid value for ${param}[${type}]: ${val}`;
                result[param] = parseInt(val);
                break;
            case 'float':
                if (!/^\d+(\.\d+)?$/.test(val))
                    throw `Invalid value for ${param}[${type}]: ${val}`;
                result[param] = parseFloat(val);
                break;
            default:
                throw `Unknown type: ${type}`;
        }
    }
}
exports.default = cliParams;
//# sourceMappingURL=index.js.map
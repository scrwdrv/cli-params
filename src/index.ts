type ParamsFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
    alias?: string;
    default?: any;
}[];

export default function cliParams(format?: ParamsFormat, target?: string): {
    [param: string]: any;
} {
    let args = process.argv.slice(2),
        result = {}

    if (target) {
        const val = args.pop();
        if (!val) throw `No target is found`;
        result[target] = val;
    }

    for (let i = 0; i < args.length; i++) {
        if (format) {
            let index = -1;

            for (let j = format.length; j--;)
                if ('--' + format[j].param === args[i] || '-' + format[j].alias === args[i]) {
                    index = j;
                    break;
                }

            if (index === -1) throw `Unknown parameter: ${args[i]}`;

            if (!args[i + 1] || /^-/.test(args[i + 1]))
                if (format[index].default) result[format[index].param] = format[index].default;
                else if (format[index].type === 'boolean') result[format[index].param] = true;
                else throw `Invalid value for parameter: ${format[index].param}`;
            else switch (format[index].type) {
                case 'boolean':
                    if (!/^true|false$/i.test(args[i + 1])) throw `Invalid value for ${format[index].param}[${format[index].type}]: ${args[i + 1]}`;
                    result[format[index].param] = args[i + 1].toLowerCase() === 'true' ? true : false;
                    i++;
                    break;
                case 'string':
                    result[format[index].param] = args[i + 1];
                    i++;
                    break;
                case 'int':
                    if (!/^\d+$/.test(args[i + 1])) throw `Invalid value for ${format[index].param}[${format[index].type}]: ${args[i + 1]}`;
                    result[format[index].param] = parseInt(args[i + 1]);
                    i++;
                    break;
                case 'float':
                    if (!/^\d+(\.\d+)?$/.test(args[i + 1])) throw `Invalid value for ${format[index].param}[${format[index].type}]: ${args[i + 1]}`;
                    result[format[index].param] = parseFloat(args[i + 1]);
                    i++;
                    break;
                default:
                    throw `Unknown type: ${format[index].type}`;
            }

        } else
            if (/^--.+$/.test(args[i])) {
                const param = args[i].slice(2);
                if (!args[i + 1]) result[param] = true;
                else
                    if (/^-/.test(args[i + 1])) result[param] = true;
                    else {
                        result[param] = args[i + 1];
                        i++;
                    }
            } else throw `Unknown parameter: ${args[i]}`;
    }

    if (format)
        for (let i = format.length; i--;)
            if (result[format[i].param] === undefined)
                if (!format[i].optional) throw `Missing required parameter: ${format[i].param}`;
                else result[format[i].param] = format[i].default === undefined ? null : format[i].default;

    return result;
}
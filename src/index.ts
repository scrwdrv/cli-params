type ParamsFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
    alias?: string;
}[];

export default function cliParams(format?: ParamsFormat): {
    [param: string]: boolean | string | number;
} {
    const args = process.argv.slice(2);

    let result = {}

    for (let i = 0; i < args.length; i++) {
        if (format) {
            let index = -1;

            for (let j = format.length; j--;)
                if ('--' + format[j].param === args[i] || '-' + format[j].alias === args[i]) {
                    index = j;
                    break;
                }

            if (index === -1) throw `Unknown parameter: ${args[i]}`;

            if (!args[i + 1])
                if (format[index].type === 'boolean') result[format[index].param] = true;
                else throw `Invaild value for parameter: ${format[index].param}`;
            else {
                if (/^-/.test(args[i + 1]))
                    if (format[index].type === 'boolean') result[format[index].param] = true;
                    else throw `Invaild value for parameter: ${format[index].param}`;
                else switch (format[index].type) {
                    case 'boolean':
                        if (!/^true|false$/i.test(args[i + 1])) throw `Invaild value for ${format[index].param}[${format[index].type}]: ${args[i + 1]}`;
                        result[format[index].param] = args[i + 1].toLowerCase() === 'true' ? true : false;
                        i++;
                        break;
                    case 'string':
                        result[format[index].param] = args[i + 1];
                        i++;
                        break;
                    case 'int':
                        if (!/^\d+$/.test(args[i + 1])) throw `Invaild value for ${format[index].param}[${format[index].type}]: ${args[i + 1]}`;
                        result[format[index].param] = parseInt(args[i + 1]);
                        i++;
                        break;
                    case 'float':
                        if (/^\d+(\.\d+)?$/.test(args[i + 1])) throw `Invaild value for ${format[index].param}[${format[index].type}]: ${args[i + 1]}`;
                        result[format[index].param] = parseFloat(args[i + 1]);
                        i++;
                        break;
                }
            }
        } else
            if (/^--.+$/.test(args[i]))
                if (!args[i + 1]) result[args[i]] = true;
                else
                    if (/^-/.test(args[i + 1])) result[args[i]] = true;
                    else {
                        result[args[i]] = args[i + 1];
                        i++;
                    }
            else throw `Unknown parameter: ${args[i]}`;
    }

    if (format)
        for (let i = format.length; i--;)
            if (!format[i].optional && result[format[i].param] === undefined) throw `Missing required parameter: ${format[i].param}`;

    return result;
}
type ParamFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float' | 'array-of-boolean' | 'array-of-string' | 'array-of-int' | 'array-of-float';
    optional?: boolean;
    alias?: string;
    default?: any;
};

type TargetFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
};

type ParamFormats = {
    id?: string;
    params: ParamFormat | ParamFormat[]
    target?: TargetFormat
};

export default class CLIParams {
    private args = process.argv.slice(2);
    private formats: {
        [id: string]: {
            params: ParamFormat[];
            target?: TargetFormat
        }
    } = {};


    add(paramFormats: ParamFormats[] | ParamFormats, cb?: (err?: string) => void) {
        if (!cb) cb = () => { };
        if (Array.isArray(paramFormats)) {
            for (let i = paramFormats.length; i--;)
                if (!paramFormats[i].id) {
                    cb(`ID is NOT optional when submitting multiple formats`)
                    return this;
                };
        } else {
            paramFormats = [paramFormats];
            if (Object.keys(this.formats).length)
                if (!paramFormats[0].id) {
                    cb(`ID is NOT optional when submitting multiple formats`);
                    return this;
                }
        }

        for (let i = 0, l = paramFormats.length; i < l; i++) {
            if (!paramFormats[i].id) paramFormats[i].id = 'default';
            if (this.formats[paramFormats[i].id]) {
                cb(`Duplicate ID: ${paramFormats[i].id}`);
                return this;
            }
            if (!Array.isArray(paramFormats[i].params))
                paramFormats[i].params = [paramFormats[i].params as ParamFormat];
            this.formats[paramFormats[i].id] = {
                params: paramFormats[i].params as ParamFormat[],
                target: paramFormats[i].target
            };
        }

        cb();
        return this;
    }

    exec(cb: (err: string, params?: { [param: string]: any }, id?: string) => void) {
        const ids = Object.keys(this.formats),
            parse = (i = 0) => {
                const id = ids[i],
                    args = [...this.args],
                    next = (err?: string) => {
                        if (err)
                            if (i === ids.length - 1) cb(err, null, id);
                            else parse(i + 1);
                        else cb(null, result, id);
                    };
                let result = {};

                if (this.formats[id].target) {
                    const val = args.pop();
                    if (!val)
                        if (!this.formats[id].target.optional) cb(`No target is found`);
                        else result[this.formats[id].target.param] = null;
                    else {
                        const err = parseType(this.formats[id].target.type, this.formats[id].target.param, val);
                        if (err) return next(err);
                    }
                }

                for (let i = 0; i < args.length; i++) {
                    let index = -1;

                    for (let j = this.formats[id].params.length; j--;)
                        if ('--' + this.formats[id].params[j].param === args[i] || '-' + this.formats[id].params[j].alias === args[i]) {
                            index = j;
                            break;
                        }

                    if (index === -1) return next(`Unknown parameter: ${args[i]}`);

                    const isArray = /^array-of-/.test(this.formats[id].params[index].type);

                    if (!args[i + 1] || /^-/.test(args[i + 1]))
                        if (this.formats[id].params[index].default) result[this.formats[id].params[index].param] = this.formats[id].params[index].default;
                        else if (this.formats[id].params[index].type === 'boolean') result[this.formats[id].params[index].param] = true;
                        else return next(`Invalid value for parameter: ${this.formats[id].params[index].param}`);
                    else if (isArray) for (let j = i + 1; j < args.length; j++) {
                        if (/^-/.test(args[j])) break;
                        const err = parseType(this.formats[id].params[index].type, this.formats[id].params[index].param, args[j], true)
                        if (err) return next(err);
                        else i++
                    } else {
                        const err = parseType(this.formats[id].params[index].type, this.formats[id].params[index].param, args[i + 1])
                        if (err) return next(err);
                        else i++
                    }
                }

                for (let i = this.formats[id].params.length; i--;)
                    if (result[this.formats[id].params[i].param] === undefined)
                        if (!this.formats[id].params[i].optional) return next(`Missing required parameter: ${this.formats[id].params[i].param}`);
                        else result[this.formats[id].params[i].param] = null;

                next();

                function parseType(type: string, param: string, val: string, isArray = false): string | void {
                    if (isArray) {
                        type = type.slice(9);
                        if (!result[param]) result[param] = [];
                    }

                    switch (type) {
                        case 'boolean':
                            if (!/^(?:true|false)$/i.test(val)) return `Invalid value for ${param}[${type}]: ${val}`;
                            const boo = val.toLowerCase() === 'true' ? true : false;
                            if (isArray) result[param].push(boo);
                            else result[param] = boo;
                            break;
                        case 'string':
                            if (!val) return `No value for ${param}[${type}]`;
                            if (isArray) result[param].push(val);
                            else result[param] = val;
                            break;
                        case 'int':
                            if (!/^\d+$/.test(val)) return `Invalid value for ${param}[${type}]: ${val}`;
                            const int = parseInt(val);
                            if (isArray) result[param].push(int);
                            else result[param] = int;
                            break;
                        case 'float':
                            if (!/^\d+(\.\d+)?$/.test(val)) return `Invalid value for ${param}[${type}]: ${val}`;
                            const float = parseFloat(val);
                            if (isArray) result[param].push(float);
                            else result[param] = float;
                            break;
                        default:
                            return `Unknown type: ${type}`;
                    }
                    return null;
                }
            }

        if (!ids.length) {
            const args = [...this.args];
            let result = {};

            for (let i = 0; i < args.length; i++)
                if (/^--.+$/.test(args[i])) {
                    const param = args[i].slice(2);
                    if (!args[i + 1]) result[param] = true;
                    else for (let j = i + 1; j < args.length; j++) {
                        if (/^-/.test(args[j])) {
                            if (!result[param]) result[param] = true;
                            break;
                        } else {
                            if (!result[param]) result[param] = args[j];
                            else if (Array.isArray(result[param])) result[param].push(args[j])
                            else result[param] = [result[param], args[j]];
                            i++;
                        }
                    }
                } else return cb(`Unknown parameter: ${args[i]}`);

            cb(null, result);
        } else parse();
    }
}
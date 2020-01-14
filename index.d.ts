declare type ParamFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
    alias?: string;
    default?: any;
};
declare type TargetFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
};
declare type ParamFormats = {
    id?: string;
    params: ParamFormat | ParamFormat[];
    target?: TargetFormat;
};
export default class CLIParams {
    private args;
    private formats;
    add(paramFormats: ParamFormats[] | ParamFormats, cb?: (err?: string) => void): void;
    exec(cb: (err: string, params?: {
        [param: string]: any;
    }, id?: string) => void): void;
}
export {};

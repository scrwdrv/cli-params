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
export default function cliParams(format?: ParamFormat[], target?: TargetFormat): {
    [param: string]: any;
};
export {};

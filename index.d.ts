declare type ParamsFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
    alias?: string;
    default?: any;
}[];
export default function cliParams(format?: ParamsFormat, target?: string): {
    [param: string]: any;
};
export {};

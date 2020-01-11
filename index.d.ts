declare type ParamsFormat = {
    param: string;
    type: 'boolean' | 'string' | 'int' | 'float';
    optional?: boolean;
    alias?: string;
}[];
export default function cliParams(format?: ParamsFormat): {
    [param: string]: boolean | string | number;
};
export {};

export * from './Main';
export declare type DepType = {
    type: string;
    version: string;
    enforce: boolean;
};
export declare type Deps = {
    [name: string]: DepType;
};
export declare type JSONOpt = {
    timeout?: number;
    cbKey?: string;
    cbVal?: string;
};
export declare function DynamicRequire(name: string, baseUrl: string, hashed: boolean): Promise<any>;

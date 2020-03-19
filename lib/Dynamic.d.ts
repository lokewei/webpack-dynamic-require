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
export default class DynamicRequire {
    baseUrl: string;
    jsonpUrl: string;
    hashed: boolean;
    scriptId: string;
    styleId: string;
    jsPrefix?: string;
    cssPrefix?: string;
    mainFile: string;
    uninstall: () => void;
    constructor({ baseUrl, hashed, jsPrefix, cssPrefix, mainFile }: {
        baseUrl: string;
        hashed?: boolean;
        jsPrefix?: string;
        cssPrefix?: string;
        mainFile?: string;
    });
    genHash(value: string): string;
    require(name: string): Promise<any>;
}

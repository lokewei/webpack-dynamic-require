declare class MurmurHash3 {
  hash:(str: string) => MurmurHash3;
  result:() => number;
}

declare module 'imurmurhash' {
  export = MurmurHash3;
}
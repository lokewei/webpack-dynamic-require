interface $loadcss {
  loadCSS: (paths:string | string[]) => void;
}

declare module 'fg-loadcss' {
  const $loadcss: $loadcss;
  export = $loadcss;
}
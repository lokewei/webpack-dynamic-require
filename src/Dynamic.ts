import Scriptjs from 'scriptjs';
import { loadCSS } from 'fg-loadcss';
import camelCase from 'camelcase';
// import { Require, ParseModuleData } from './Main';
export * from './Main';

declare var window: Window, global: any;
var g = typeof window != "undefined" ? window : global;

export type DepType = {
  type: string;
  version: string;
  enforce: boolean;
};

export type Deps = {
  [name: string]: DepType;
}

export type JSONOpt = {
  timeout?: number;
  cbKey?: string;
  cbVal?: string;
}


const jsonp = (url: string, opt: JSONOpt = {}, fn?: Function) => {

  if (typeof opt === 'function') {
    fn = opt
    opt = {}
  }

  let { timeout = null, cbKey = 'callback', cbVal = 'fengyu' } = opt
  let timer: number;

  if (cbVal === 'fengyu') {
    cbVal += Date.now()
  }

  let s = ''
  s += `&${cbKey}=${cbVal}`

  s = s.slice(1)

  url += (~url.indexOf('?') ? '&' : '?') + s

  var script = document.createElement('script')

  var remove = () => {
    timer && clearTimeout(timer)
    document.head.removeChild(script)
    g[cbVal] = undefined
  }

  script.src = url


  if (fn !== undefined && typeof fn === 'function') {
    g[cbVal] = (data: any) => {
      fn(data)
      remove()
    }

    document.head.appendChild(script)
    return
  }

  return new Promise((resolve: (arg0: any) => void, reject: (arg0: Error) => void) => {
    // 请求超时
    if (timeout) {
      timer = setTimeout(() => {
        reject(new Error('jsonp request timeout'))
        remove()
      }, timeout)
    }
    // 正常
    g[cbVal] = (...args: any) => {
      resolve(args);
      remove()
    }

    document.head.appendChild(script)
  })
}

function getBlurVersion(version:string) {
  return version.split('.').map((v, i) => i > 0 ? 'x' : v).join('.');
}
// const _require_ = g.webpackData;
// g.webpackData = function(moduleId: any) {
//   const module = _require_.m[moduleId] as Function;
//   if (!module) {
//     console.warn(moduleId, 'can not be founded, check chunk is completion');
//     return;
//   }
//   return _require_.call(this, moduleId);
// }
// Object.assign(g.webpackData, _require_);

export function DynamicRequire(name: string, baseUrl: string, matcher: Function | RegExp) {
  if (!name || !baseUrl) {
    throw new Error('DynamicRequire name and baseUrl paramters must setted');
    return;
  }
  const jsonpCallback = camelCase(name.replace(/@/g, '$')).replace(/\//g, '_');
  const jsonpUrl = `${baseUrl}/jsonpmodules.js`;
  return jsonp(jsonpUrl, {
    cbVal: jsonpCallback
  }).then(function(args) {
    const modules: string[] = args[0];
    const entry: string = args[1];
    const entryModuleName = `${name}/${entry}`;
    if (g.webpackData.c[entryModuleName]) {
      return Promise.resolve(g.webpackData.c[entryModuleName]);
    }
    const componentChunks = 'vendor.js,component.js';
    const componentCss = 'component.css';
    const needComboChunk: string[] = [];
    const needComboCssChunk: string[] = [];
    modules.forEach(([moduleName, chunkName, isCss]) => {
      const module = g.webpackData.c[moduleName];
      // 如果module不存在，放到module对应的chunk到combo信息里
      if (!module && needComboChunk.indexOf(chunkName) === -1) {
        needComboChunk.push(chunkName);
      }
      if (!module && isCss && needComboCssChunk.indexOf(chunkName) === -1) {
        needComboCssChunk.push(chunkName);
      }
    });
    // 先加载css
    if (needComboCssChunk && needComboCssChunk.length) {
      const comboCssChunks = needComboCssChunk.map(chunkName => `deps/${chunkName}.css`).join();
      const comboCssUrl = `${baseUrl}/??${componentCss},${comboCssChunks}`;
      loadCSS(comboCssUrl);
    }
    if (needComboChunk && needComboChunk.length) {
      const comboChunks = needComboChunk.map(chunkName => `deps/${chunkName}.js`).join();
      const comboUrl = `${baseUrl}/??${componentChunks},${comboChunks}`;
      return new Promise((resolve, reject) => {
        Scriptjs(comboUrl, () => {
          try {
            console.log('load combo js done', name);
            const module = g.webpackData(entryModuleName);
            resolve(module.a || module);
          } catch(e) {
            reject(e);
          }
        });
      });
    }
  }).catch(function(error: any) {
    console.warn('load remote error');
    throw error
  })
}
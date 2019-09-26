import Scriptjs from 'scriptjs';
import { loadCSS } from 'fg-loadcss';
import camelCase from 'camelcase';
import MurmurHash3 from 'imurmurhash';
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

/*! onloadCSS. (onload callback for loadCSS) [c]2017 Filament Group, Inc. MIT License */
/* global navigator */
/* exported onloadCSS */
function onloadCSS(ss: any, callback?: () => void) {
  let called: boolean | undefined;
  function newcb() {
    if (!called && callback) {
      called = true;
      callback.call(ss);
    }
  }
  if (ss.addEventListener) {
    ss.addEventListener("load", newcb);
  }
  if (ss.attachEvent) {
    ss.attachEvent("onload", newcb);
  }

  // This code is for browsers that don’t support onload
  // No support for onload (it'll bind but never fire):
  //	* Android 4.3 (Samsung Galaxy S4, Browserstack)
  //	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
  //	* Android 2.3 (Pantech Burst P9070)

  // Weak inference targets Android < 4.4
  if ("isApplicationInstalled" in navigator && "onloadcssdefined" in ss) {
    ss.onloadcssdefined(newcb);
  }
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

function getBlurVersion(version: string) {
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

export function DynamicRequire(name: string, baseUrl: string, hashed: boolean) {
  if (!name || !baseUrl) {
    throw new Error('DynamicRequire name and baseUrl paramters must setted');
  }
  const jsonpCallback = camelCase(name.replace(/@/g, '$')).replace(/\//g, '_');
  const jsonpUrl = `${baseUrl}/jsonpmodules.js`;
  const scriptId = `${name}_js`;
  const styleId = `${name}_css`;
  const uninstallFn = `${name}_uninstall`;
  // @ts-ignore
  window[uninstallFn] = () => {
    const jse = document.getElementById(scriptId);
    const csse = document.getElementById(styleId);
    jse && jse.remove();
    csse && csse.remove();
  }
  return jsonp(jsonpUrl, {
    cbVal: jsonpCallback
  }).then(function (args) {
    const modules: string[] = args[0];
    const entry: string = args[1];
    let entryModuleName = `${name}/${entry}`;
    if (hashed) {
      const hashState = new MurmurHash3();
      hashState.hash(entryModuleName);
      entryModuleName = hashState.result().toString(16).substr(0, 6);
    }
    if (g.webpackData.c[entryModuleName]) {
      // if webpack enable hmr above return { children, exports, hot ...}
      const module = g.webpackData(entryModuleName);
      return Promise.resolve(module.a || module);
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
    let ssPromise;
    const comboCssChunks = needComboCssChunk.map(chunkName => `deps/${chunkName}.css`);
    comboCssChunks.unshift(componentCss);
    const comboCssUrl = `${baseUrl}/??${comboCssChunks.join()}`;
    const ss = loadCSS(comboCssUrl);
    // @ts-ignore
    ss && ss.setAttribute('id', styleId);
    ssPromise = new Promise((resolve, reject) => {
      onloadCSS(ss, () => {
        resolve();
      });
      setTimeout(reject, 5000);
    });

    // 并行加载js
    let jsPromise;
    const comboChunks = needComboChunk.map(chunkName => `deps/${chunkName}.js`)
    comboChunks.unshift(componentChunks); // 补上必须的组件资源
    const comboUrl = `${baseUrl}/??${comboChunks.join()}`;
    jsPromise = new Promise((resolve, reject) => {
      Scriptjs(comboUrl, () => {
        try {
          console.log('load combo js done', name);
          const module = g.webpackData(entryModuleName);
          resolve(module.a || module);
        } catch (e) {
          reject(e);
        }
      });
    });
    return Promise.all([ssPromise, jsPromise]).then(([ss, module]) => {
      return module;
    }).catch(e => {
      console.warn('bootload module error', e);
    })
  }).catch(function (error: any) {
    console.warn('load remote error');
    throw error
  })
}
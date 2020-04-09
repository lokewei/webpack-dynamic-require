import Scriptjs from 'scriptjs';
import camelCase from 'camelcase';
import MurmurHash3 from 'imurmurhash';
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

function loadCSS(url: string) {
  const cssRoot = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;

  cssRoot.appendChild(link);

  return new Promise<HTMLLinkElement>((resolve, reject) => {
    link.addEventListener('error', () => {
      reject(`load css error: ${url}`);
    });
    link.addEventListener('load', () => resolve(link));
  });

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


function loadComponentCss(baseUrl: string, mainFile: string, styleId: string, needComboCssChunk: string[], cssPrefix: string, vendorCss?: boolean) {
  const componentCss = `${cssPrefix}${mainFile}.css`;
  const comboCssChunks = needComboCssChunk.map(chunkName => `${cssPrefix}deps/${chunkName}.css`);
  comboCssChunks.unshift(componentCss);
  if (vendorCss) {
    comboCssChunks.unshift(`${cssPrefix}vendor.css`)
  }
  const comboCssUrl = `${baseUrl}/??${comboCssChunks.join()}`;


  return loadCSS(comboCssUrl).then(link => {
    link && link.setAttribute('id', styleId);
  });
}

export default class DynamicRequire {

  baseUrl: string;
  jsonpUrl: string;
  hashed: boolean;
  scriptId: string;
  styleId: string;
  jsPrefix?: string;
  cssPrefix?: string;
  vendorCss?: boolean;
  mainFile: string;
  uninstall: () => void;

  constructor({ baseUrl, hashed, jsPrefix, cssPrefix, mainFile }: { baseUrl: string, hashed?: boolean, jsPrefix?: string, cssPrefix?: string, mainFile?: string }) {
    if (!baseUrl) {
      throw new Error('DynamicRequire baseUrl paramters must setted');
    }
    const jsonpUrl = `${baseUrl}/jsonpmodules.js`;
    const hashId = this.genHash(baseUrl);
    this.scriptId = `${hashId}_js`;
    this.styleId = `${hashId}_css`;
    const unInstallFn = () => {
      const jse = document.getElementById(this.scriptId);
      const csse = document.getElementById(this.styleId);
      jse && jse.remove();
      csse && csse.remove();
    };

    this.baseUrl = baseUrl;
    this.jsonpUrl = jsonpUrl;
    this.hashed = hashed;
    this.jsPrefix = jsPrefix;
    this.cssPrefix = cssPrefix;
    this.mainFile = mainFile || 'index';
    this.uninstall = unInstallFn;
  }

  genHash(value: string) {
    const hashState = new MurmurHash3();
    hashState.hash(value);
    return hashState.result().toString(16).substr(0, 6);
  }

  require(name: string) {
    const { baseUrl, jsonpUrl, hashed, jsPrefix = '', cssPrefix = '', vendorCss,  mainFile, styleId } = this;
    const jsonpCallback = camelCase(name.replace(/@/g, '$')).replace(/\//g, '_');

    return jsonp(jsonpUrl, {
      cbVal: jsonpCallback
    }).then((args) => {
      const modules: string[] = args[0];
      const entry: string = args[1];
      let entryModuleName = `${name}/${entry}`;
      const componentChunks = `${jsPrefix}vendor.js,${jsPrefix}${mainFile}.js`;
      const needComboCssChunk: string[] = [];
      const needComboChunk: string[] = [];

      if (hashed) {
        entryModuleName = this.genHash(entryModuleName);
      }

      modules.forEach(([moduleName, chunkName, isCss]) => {
        const module = g.webpackData.c[moduleName];
        // 如果module不存在，放到module对应的chunk到combo信息里
        if (!module && needComboChunk.indexOf(chunkName) === -1) {
          needComboChunk.push(chunkName);
        }
        if (isCss && needComboCssChunk.indexOf(chunkName) === -1) {
          needComboCssChunk.push(chunkName);
        }
      });
  
      // 已经加载过了的逻辑
      if (g.webpackData.c[entryModuleName]) {
        // if webpack enable hmr above return { children, exports, hot ...}
        const module = g.webpackData(entryModuleName);
        const csse = document.getElementById(styleId);
        // 样式已经卸载，重新加载出来
        if (!csse) {
          return loadComponentCss(baseUrl, mainFile, styleId, needComboCssChunk, cssPrefix, vendorCss).then(() => {
            return module.a || module;
          });
        } else {
          return Promise.resolve(module.a || module);
        }
      }
  
      // 新加载逻辑
      // 加载css
      const ssPromise = loadComponentCss(baseUrl, mainFile, styleId, needComboCssChunk, cssPrefix);
      // 并行加载js
      let jsPromise;
      const comboChunks = needComboChunk.map(chunkName => `${jsPrefix}deps/${chunkName}.js`)
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
    });
  }
}


"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  DynamicRequire: true
};
exports.DynamicRequire = DynamicRequire;

var _scriptjs = _interopRequireDefault(require("scriptjs"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _imurmurhash = _interopRequireDefault(require("imurmurhash"));

var _Main = require("./Main");

Object.keys(_Main).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Main[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var g = typeof window != "undefined" ? window : global;

function loadCSS(url) {
  var cssRoot = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  cssRoot.appendChild(link);
  return new Promise(function (resolve, reject) {
    link.addEventListener('error', function () {
      reject("load css error: ".concat(url));
    });
    link.addEventListener('load', function () {
      return resolve(link);
    });
  });
}

var jsonp = function jsonp(url) {
  var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var fn = arguments.length > 2 ? arguments[2] : undefined;

  if (typeof opt === 'function') {
    fn = opt;
    opt = {};
  }

  var _opt = opt,
      _opt$timeout = _opt.timeout,
      timeout = _opt$timeout === void 0 ? null : _opt$timeout,
      _opt$cbKey = _opt.cbKey,
      cbKey = _opt$cbKey === void 0 ? 'callback' : _opt$cbKey,
      _opt$cbVal = _opt.cbVal,
      cbVal = _opt$cbVal === void 0 ? 'fengyu' : _opt$cbVal;
  var timer;

  if (cbVal === 'fengyu') {
    cbVal += Date.now();
  }

  var s = '';
  s += "&".concat(cbKey, "=").concat(cbVal);
  s = s.slice(1);
  url += (~url.indexOf('?') ? '&' : '?') + s;
  var script = document.createElement('script');

  var remove = function remove() {
    timer && clearTimeout(timer);
    document.head.removeChild(script);
    g[cbVal] = undefined;
  };

  script.src = url;

  if (fn !== undefined && typeof fn === 'function') {
    g[cbVal] = function (data) {
      fn(data);
      remove();
    };

    document.head.appendChild(script);
    return;
  }

  return new Promise(function (resolve, reject) {
    // 请求超时
    if (timeout) {
      timer = setTimeout(function () {
        reject(new Error('jsonp request timeout'));
        remove();
      }, timeout);
    } // 正常


    g[cbVal] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      resolve(args);
      remove();
    };

    document.head.appendChild(script);
  });
};

function getBlurVersion(version) {
  return version.split('.').map(function (v, i) {
    return i > 0 ? 'x' : v;
  }).join('.');
} // const _require_ = g.webpackData;
// g.webpackData = function(moduleId: any) {
//   const module = _require_.m[moduleId] as Function;
//   if (!module) {
//     console.warn(moduleId, 'can not be founded, check chunk is completion');
//     return;
//   }
//   return _require_.call(this, moduleId);
// }
// Object.assign(g.webpackData, _require_);


function loadComponentCss(baseUrl, styleId, needComboCssChunk) {
  var componentCss = 'component.css';
  var comboCssChunks = needComboCssChunk.map(function (chunkName) {
    return "deps/".concat(chunkName, ".css");
  });
  comboCssChunks.unshift(componentCss);
  var comboCssUrl = "".concat(baseUrl, "/??").concat(comboCssChunks.join());
  return loadCSS(comboCssUrl).then(function (link) {
    link && link.setAttribute('id', styleId);
  });
}

function DynamicRequire(name, baseUrl, hashed) {
  if (!name || !baseUrl) {
    throw new Error('DynamicRequire name and baseUrl paramters must setted');
  }

  var jsonpCallback = (0, _camelcase["default"])(name.replace(/@/g, '$')).replace(/\//g, '_');
  var jsonpUrl = "".concat(baseUrl, "/jsonpmodules.js");
  var scriptId = "".concat(name, "_js");
  var styleId = "".concat(name, "_css");
  var uninstallFn = "".concat(name, "_uninstall"); // @ts-ignore

  window[uninstallFn] = function () {
    var jse = document.getElementById(scriptId);
    var csse = document.getElementById(styleId);
    jse && jse.remove();
    csse && csse.remove();
  };

  return jsonp(jsonpUrl, {
    cbVal: jsonpCallback
  }).then(function (args) {
    var modules = args[0];
    var entry = args[1];
    var entryModuleName = "".concat(name, "/").concat(entry);
    var componentChunks = 'vendor.js,component.js';
    var needComboCssChunk = [];
    var needComboChunk = [];

    if (hashed) {
      var hashState = new _imurmurhash["default"]();
      hashState.hash(entryModuleName);
      entryModuleName = hashState.result().toString(16).substr(0, 6);
    }

    modules.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 3),
          moduleName = _ref2[0],
          chunkName = _ref2[1],
          isCss = _ref2[2];

      var module = g.webpackData.c[moduleName]; // 如果module不存在，放到module对应的chunk到combo信息里

      if (!module && needComboChunk.indexOf(chunkName) === -1) {
        needComboChunk.push(chunkName);
      }

      if (isCss && needComboCssChunk.indexOf(chunkName) === -1) {
        needComboCssChunk.push(chunkName);
      }
    }); // 已经加载过了的逻辑

    if (g.webpackData.c[entryModuleName]) {
      // if webpack enable hmr above return { children, exports, hot ...}
      var module = g.webpackData(entryModuleName);
      var csse = document.getElementById(styleId); // 样式已经卸载，重新加载出来

      if (!csse) {
        return loadComponentCss(baseUrl, styleId, needComboCssChunk).then(function () {
          return module.a || module;
        });
      } else {
        return Promise.resolve(module.a || module);
      }
    } // 新加载逻辑
    // 加载css


    var ssPromise = loadComponentCss(baseUrl, styleId, needComboCssChunk); // 并行加载js

    var jsPromise;
    var comboChunks = needComboChunk.map(function (chunkName) {
      return "deps/".concat(chunkName, ".js");
    });
    comboChunks.unshift(componentChunks); // 补上必须的组件资源

    var comboUrl = "".concat(baseUrl, "/??").concat(comboChunks.join());
    jsPromise = new Promise(function (resolve, reject) {
      (0, _scriptjs["default"])(comboUrl, function () {
        try {
          console.log('load combo js done', name);

          var _module = g.webpackData(entryModuleName);

          resolve(_module.a || _module);
        } catch (e) {
          reject(e);
        }
      });
    });
    return Promise.all([ssPromise, jsPromise]).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          ss = _ref4[0],
          module = _ref4[1];

      return module;
    })["catch"](function (e) {
      console.warn('bootload module error', e);
    });
  })["catch"](function (error) {
    console.warn('load remote error');
    throw error;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJsb2FkQ1NTIiwidXJsIiwiY3NzUm9vdCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsaW5rIiwiY3JlYXRlRWxlbWVudCIsInJlbCIsImhyZWYiLCJhcHBlbmRDaGlsZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImpzb25wIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwic2V0VGltZW91dCIsIkVycm9yIiwiYXJncyIsImdldEJsdXJWZXJzaW9uIiwidmVyc2lvbiIsInNwbGl0IiwibWFwIiwidiIsImkiLCJqb2luIiwibG9hZENvbXBvbmVudENzcyIsImJhc2VVcmwiLCJzdHlsZUlkIiwibmVlZENvbWJvQ3NzQ2h1bmsiLCJjb21wb25lbnRDc3MiLCJjb21ib0Nzc0NodW5rcyIsImNodW5rTmFtZSIsInVuc2hpZnQiLCJjb21ib0Nzc1VybCIsInRoZW4iLCJzZXRBdHRyaWJ1dGUiLCJEeW5hbWljUmVxdWlyZSIsIm5hbWUiLCJoYXNoZWQiLCJqc29ucENhbGxiYWNrIiwicmVwbGFjZSIsImpzb25wVXJsIiwic2NyaXB0SWQiLCJ1bmluc3RhbGxGbiIsImpzZSIsImdldEVsZW1lbnRCeUlkIiwiY3NzZSIsIm1vZHVsZXMiLCJlbnRyeSIsImVudHJ5TW9kdWxlTmFtZSIsImNvbXBvbmVudENodW5rcyIsIm5lZWRDb21ib0NodW5rIiwiaGFzaFN0YXRlIiwiTXVybXVySGFzaDMiLCJoYXNoIiwicmVzdWx0IiwidG9TdHJpbmciLCJzdWJzdHIiLCJmb3JFYWNoIiwibW9kdWxlTmFtZSIsImlzQ3NzIiwibW9kdWxlIiwid2VicGFja0RhdGEiLCJjIiwicHVzaCIsImEiLCJzc1Byb21pc2UiLCJqc1Byb21pc2UiLCJjb21ib0NodW5rcyIsImNvbWJvVXJsIiwiY29uc29sZSIsImxvZyIsImUiLCJhbGwiLCJzcyIsIndhcm4iLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7QUFHQSxJQUFJQSxDQUFDLEdBQUcsT0FBT0MsTUFBUCxJQUFpQixXQUFqQixHQUErQkEsTUFBL0IsR0FBd0NDLE1BQWhEOztBQWtCQSxTQUFTQyxPQUFULENBQWlCQyxHQUFqQixFQUE4QjtBQUM1QixNQUFNQyxPQUFPLEdBQUdDLFFBQVEsQ0FBQ0Msb0JBQVQsQ0FBOEIsTUFBOUIsRUFBc0MsQ0FBdEMsQ0FBaEI7QUFDQSxNQUFNQyxJQUFJLEdBQUdGLFFBQVEsQ0FBQ0csYUFBVCxDQUF1QixNQUF2QixDQUFiO0FBQ0FELEVBQUFBLElBQUksQ0FBQ0UsR0FBTCxHQUFXLFlBQVg7QUFDQUYsRUFBQUEsSUFBSSxDQUFDRyxJQUFMLEdBQVlQLEdBQVo7QUFFQUMsRUFBQUEsT0FBTyxDQUFDTyxXQUFSLENBQW9CSixJQUFwQjtBQUVBLFNBQU8sSUFBSUssT0FBSixDQUE2QixVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdkRQLElBQUFBLElBQUksQ0FBQ1EsZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsWUFBTTtBQUNuQ0QsTUFBQUEsTUFBTSwyQkFBb0JYLEdBQXBCLEVBQU47QUFDRCxLQUZEO0FBR0FJLElBQUFBLElBQUksQ0FBQ1EsZ0JBQUwsQ0FBc0IsTUFBdEIsRUFBOEI7QUFBQSxhQUFNRixPQUFPLENBQUNOLElBQUQsQ0FBYjtBQUFBLEtBQTlCO0FBQ0QsR0FMTSxDQUFQO0FBT0Q7O0FBR0QsSUFBTVMsS0FBSyxHQUFH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QUFZOztBQUNoRSxhQUFPQSxNQUFQO0FBQ0QsS0FGTSxXQUVFLFVBQUFXLENBQUMsRUFBSTtBQUNaRixNQUFBQSxPQUFPLENBQUNLLElBQVIsQ0FBYSx1QkFBYixFQUFzQ0gsQ0FBdEM7QUFDRCxLQUpNLENBQVA7QUFLRCxHQWxFTSxXQWtFRSxVQUFVSSxLQUFWLEVBQXNCO0FBQzdCTixJQUFBQSxPQUFPLENBQUNLLElBQVIsQ0FBYSxtQkFBYjtBQUNBLFVBQU1DLEtBQU47QUFDRCxHQXJFTSxDQUFQO0FBc0VEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjcmlwdGpzIGZyb20gJ3NjcmlwdGpzJztcbmltcG9ydCBjYW1lbENhc2UgZnJvbSAnY2FtZWxjYXNlJztcbmltcG9ydCBNdXJtdXJIYXNoMyBmcm9tICdpbXVybXVyaGFzaCc7XG4vLyBpbXBvcnQgeyBSZXF1aXJlLCBQYXJzZU1vZHVsZURhdGEgfSBmcm9tICcuL01haW4nO1xuZXhwb3J0ICogZnJvbSAnLi9NYWluJztcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5cbmV4cG9ydCB0eXBlIERlcFR5cGUgPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBlbmZvcmNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRGVwcyA9IHtcbiAgW25hbWU6IHN0cmluZ106IERlcFR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIEpTT05PcHQgPSB7XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIGNiS2V5Pzogc3RyaW5nO1xuICBjYlZhbD86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gbG9hZENTUyh1cmw6IHN0cmluZykge1xuICBjb25zdCBjc3NSb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gIGxpbmsuaHJlZiA9IHVybDtcblxuICBjc3NSb290LmFwcGVuZENoaWxkKGxpbmspO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTxIVE1MTGlua0VsZW1lbnQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgcmVqZWN0KGBsb2FkIGNzcyBlcnJvcjogJHt1cmx9YCk7XG4gICAgfSk7XG4gICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gcmVzb2x2ZShsaW5rKSk7XG4gIH0pO1xuXG59XG5cblxuY29uc3QganNvbnAgPSAodXJsOiBzdHJpbmcsIG9wdDogSlNPTk9wdCA9IHt9LCBmbj86IEZ1bmN0aW9uKSA9PiB7XG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IG9wdFxuICAgIG9wdCA9IHt9XG4gIH1cblxuICBsZXQgeyB0aW1lb3V0ID0gbnVsbCwgY2JLZXkgPSAnY2FsbGJhY2snLCBjYlZhbCA9ICdmZW5neXUnIH0gPSBvcHRcbiAgbGV0IHRpbWVyOiBudW1iZXI7XG5cbiAgaWYgKGNiVmFsID09PSAnZmVuZ3l1Jykge1xuICAgIGNiVmFsICs9IERhdGUubm93KClcbiAgfVxuXG4gIGxldCBzID0gJydcbiAgcyArPSBgJiR7Y2JLZXl9PSR7Y2JWYWx9YFxuXG4gIHMgPSBzLnNsaWNlKDEpXG5cbiAgdXJsICs9ICh+dXJsLmluZGV4T2YoJz8nKSA/ICcmJyA6ICc/JykgKyBzXG5cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG5cbiAgdmFyIHJlbW92ZSA9ICgpID0+IHtcbiAgICB0aW1lciAmJiBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZChzY3JpcHQpXG4gICAgZ1tjYlZhbF0gPSB1bmRlZmluZWRcbiAgfVxuXG4gIHNjcmlwdC5zcmMgPSB1cmxcblxuXG4gIGlmIChmbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGdbY2JWYWxdID0gKGRhdGE6IGFueSkgPT4ge1xuICAgICAgZm4oZGF0YSlcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gICAgcmV0dXJuXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IChhcmcwOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKGFyZzA6IEVycm9yKSA9PiB2b2lkKSA9PiB7XG4gICAgLy8g6K+35rGC6LaF5pe2XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2pzb25wIHJlcXVlc3QgdGltZW91dCcpKVxuICAgICAgICByZW1vdmUoKVxuICAgICAgfSwgdGltZW91dClcbiAgICB9XG4gICAgLy8g5q2j5bi4XG4gICAgZ1tjYlZhbF0gPSAoLi4uYXJnczogYW55KSA9PiB7XG4gICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0Qmx1clZlcnNpb24odmVyc2lvbjogc3RyaW5nKSB7XG4gIHJldHVybiB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKCh2LCBpKSA9PiBpID4gMCA/ICd4JyA6IHYpLmpvaW4oJy4nKTtcbn1cbi8vIGNvbnN0IF9yZXF1aXJlXyA9IGcud2VicGFja0RhdGE7XG4vLyBnLndlYnBhY2tEYXRhID0gZnVuY3Rpb24obW9kdWxlSWQ6IGFueSkge1xuLy8gICBjb25zdCBtb2R1bGUgPSBfcmVxdWlyZV8ubVttb2R1bGVJZF0gYXMgRnVuY3Rpb247XG4vLyAgIGlmICghbW9kdWxlKSB7XG4vLyAgICAgY29uc29sZS53YXJuKG1vZHVsZUlkLCAnY2FuIG5vdCBiZSBmb3VuZGVkLCBjaGVjayBjaHVuayBpcyBjb21wbGV0aW9uJyk7XG4vLyAgICAgcmV0dXJuO1xuLy8gICB9XG4vLyAgIHJldHVybiBfcmVxdWlyZV8uY2FsbCh0aGlzLCBtb2R1bGVJZCk7XG4vLyB9XG4vLyBPYmplY3QuYXNzaWduKGcud2VicGFja0RhdGEsIF9yZXF1aXJlXyk7XG5cblxuZnVuY3Rpb24gbG9hZENvbXBvbmVudENzcyhiYXNlVXJsOiBzdHJpbmcsIHN0eWxlSWQ6IHN0cmluZywgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGNvbXBvbmVudENzcyA9ICdjb21wb25lbnQuY3NzJztcbiAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKTtcbiAgY29tYm9Dc3NDaHVua3MudW5zaGlmdChjb21wb25lbnRDc3MpO1xuICBjb25zdCBjb21ib0Nzc1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21ib0Nzc0NodW5rcy5qb2luKCl9YDtcblxuXG4gIHJldHVybiBsb2FkQ1NTKGNvbWJvQ3NzVXJsKS50aGVuKGxpbmsgPT4ge1xuICAgIGxpbmsgJiYgbGluay5zZXRBdHRyaWJ1dGUoJ2lkJywgc3R5bGVJZCk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRHluYW1pY1JlcXVpcmUobmFtZTogc3RyaW5nLCBiYXNlVXJsOiBzdHJpbmcsIGhhc2hlZDogYm9vbGVhbikge1xuICBpZiAoIW5hbWUgfHwgIWJhc2VVcmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0R5bmFtaWNSZXF1aXJlIG5hbWUgYW5kIGJhc2VVcmwgcGFyYW10ZXJzIG11c3Qgc2V0dGVkJyk7XG4gIH1cbiAgY29uc3QganNvbnBDYWxsYmFjayA9IGNhbWVsQ2FzZShuYW1lLnJlcGxhY2UoL0AvZywgJyQnKSkucmVwbGFjZSgvXFwvL2csICdfJyk7XG4gIGNvbnN0IGpzb25wVXJsID0gYCR7YmFzZVVybH0vanNvbnBtb2R1bGVzLmpzYDtcbiAgY29uc3Qgc2NyaXB0SWQgPSBgJHtuYW1lfV9qc2A7XG4gIGNvbnN0IHN0eWxlSWQgPSBgJHtuYW1lfV9jc3NgO1xuICBjb25zdCB1bmluc3RhbGxGbiA9IGAke25hbWV9X3VuaW5zdGFsbGA7XG4gIC8vIEB0cy1pZ25vcmVcbiAgd2luZG93W3VuaW5zdGFsbEZuXSA9ICgpID0+IHtcbiAgICBjb25zdCBqc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY3JpcHRJZCk7XG4gICAgY29uc3QgY3NzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0eWxlSWQpO1xuICAgIGpzZSAmJiBqc2UucmVtb3ZlKCk7XG4gICAgY3NzZSAmJiBjc3NlLnJlbW92ZSgpO1xuICB9XG4gIHJldHVybiBqc29ucChqc29ucFVybCwge1xuICAgIGNiVmFsOiBqc29ucENhbGxiYWNrXG4gIH0pLnRoZW4oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICBjb25zdCBtb2R1bGVzOiBzdHJpbmdbXSA9IGFyZ3NbMF07XG4gICAgY29uc3QgZW50cnk6IHN0cmluZyA9IGFyZ3NbMV07XG4gICAgbGV0IGVudHJ5TW9kdWxlTmFtZSA9IGAke25hbWV9LyR7ZW50cnl9YDtcbiAgICBjb25zdCBjb21wb25lbnRDaHVua3MgPSAndmVuZG9yLmpzLGNvbXBvbmVudC5qcyc7XG4gICAgY29uc3QgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbmVlZENvbWJvQ2h1bms6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAoaGFzaGVkKSB7XG4gICAgICBjb25zdCBoYXNoU3RhdGUgPSBuZXcgTXVybXVySGFzaDMoKTtcbiAgICAgIGhhc2hTdGF0ZS5oYXNoKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICBlbnRyeU1vZHVsZU5hbWUgPSBoYXNoU3RhdGUucmVzdWx0KCkudG9TdHJpbmcoMTYpLnN1YnN0cigwLCA2KTtcbiAgICB9XG5cbiAgICBtb2R1bGVzLmZvckVhY2goKFttb2R1bGVOYW1lLCBjaHVua05hbWUsIGlzQ3NzXSkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YS5jW21vZHVsZU5hbWVdO1xuICAgICAgLy8g5aaC5p6cbW9kdWxl5LiN5a2Y5Zyo77yM5pS+5YiwbW9kdWxl5a+55bqU55qEY2h1bmvliLBjb21ib+S/oeaBr+mHjFxuICAgICAgaWYgKCFtb2R1bGUgJiYgbmVlZENvbWJvQ2h1bmsuaW5kZXhPZihjaHVua05hbWUpID09PSAtMSkge1xuICAgICAgICBuZWVkQ29tYm9DaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNDc3MgJiYgbmVlZENvbWJvQ3NzQ2h1bmsuaW5kZXhPZihjaHVua05hbWUpID09PSAtMSkge1xuICAgICAgICBuZWVkQ29tYm9Dc3NDaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDlt7Lnu4/liqDovb3ov4fkuobnmoTpgLvovpFcbiAgICBpZiAoZy53ZWJwYWNrRGF0YS5jW2VudHJ5TW9kdWxlTmFtZV0pIHtcbiAgICAgIC8vIGlmIHdlYnBhY2sgZW5hYmxlIGhtciBhYm92ZSByZXR1cm4geyBjaGlsZHJlbiwgZXhwb3J0cywgaG90IC4uLn1cbiAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgIGNvbnN0IGNzc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdHlsZUlkKTtcbiAgICAgIC8vIOagt+W8j+W3sue7j+WNuOi9ve+8jOmHjeaWsOWKoOi9veWHuuadpVxuICAgICAgaWYgKCFjc3NlKSB7XG4gICAgICAgIHJldHVybiBsb2FkQ29tcG9uZW50Q3NzKGJhc2VVcmwsIHN0eWxlSWQsIG5lZWRDb21ib0Nzc0NodW5rKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbW9kdWxlLmEgfHwgbW9kdWxlO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobW9kdWxlLmEgfHwgbW9kdWxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmlrDliqDovb3pgLvovpFcbiAgICAvLyDliqDovb1jc3NcbiAgICBjb25zdCBzc1Byb21pc2UgPSBsb2FkQ29tcG9uZW50Q3NzKGJhc2VVcmwsIHN0eWxlSWQsIG5lZWRDb21ib0Nzc0NodW5rKTtcbiAgICAvLyDlubbooYzliqDovb1qc1xuICAgIGxldCBqc1Byb21pc2U7XG4gICAgY29uc3QgY29tYm9DaHVua3MgPSBuZWVkQ29tYm9DaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5qc2ApXG4gICAgY29tYm9DaHVua3MudW5zaGlmdChjb21wb25lbnRDaHVua3MpOyAvLyDooaXkuIrlv4XpobvnmoTnu4Tku7botYTmupBcbiAgICBjb25zdCBjb21ib1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21ib0NodW5rcy5qb2luKCl9YDtcbiAgICBqc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBTY3JpcHRqcyhjb21ib1VybCwgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIGNvbWJvIGpzIGRvbmUnLCBuYW1lKTtcbiAgICAgICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICAgICAgcmVzb2x2ZShtb2R1bGUuYSB8fCBtb2R1bGUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3NzUHJvbWlzZSwganNQcm9taXNlXSkudGhlbigoW3NzLCBtb2R1bGVdKSA9PiB7XG4gICAgICByZXR1cm4gbW9kdWxlO1xuICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgY29uc29sZS53YXJuKCdib290bG9hZCBtb2R1bGUgZXJyb3InLCBlKTtcbiAgICB9KVxuICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUud2FybignbG9hZCByZW1vdGUgZXJyb3InKTtcbiAgICB0aHJvdyBlcnJvclxuICB9KVxufSJdfQ==
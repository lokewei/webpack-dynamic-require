"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  DynamicRequire: true
};
exports.DynamicRequire = DynamicRequire;

var _scriptjs = _interopRequireDefault(require("scriptjs"));

var _fgLoadcss = require("fg-loadcss");

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

/*! onloadCSS. (onload callback for loadCSS) [c]2017 Filament Group, Inc. MIT License */

/* global navigator */

/* exported onloadCSS */
function onloadCSS(ss, callback) {
  var called;

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
  } // This code is for browsers that don’t support onload
  // No support for onload (it'll bind but never fire):
  //	* Android 4.3 (Samsung Galaxy S4, Browserstack)
  //	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
  //	* Android 2.3 (Pantech Burst P9070)
  // Weak inference targets Android < 4.4


  if ("isApplicationInstalled" in navigator && "onloadcssdefined" in ss) {
    ss.onloadcssdefined(newcb);
  }
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
  var ss = (0, _fgLoadcss.loadCSS)(comboCssUrl); // @ts-ignore

  ss && ss.setAttribute('id', styleId);
  return new Promise(function (resolve, reject) {
    onloadCSS(ss, function () {
      resolve();
    });
    setTimeout(reject, 5000);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJvbmxvYWRDU1MiLCJzcyIsImNhbGxiYWNrIiwiY2FsbGVkIiwibmV3Y2IiLCJjYWxsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwibmF2aWdhdG9yIiwib25sb2FkY3NzZGVmaW5lZCIsImpzb25wIiwidXJsIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwiYXBwZW5kQ2hpbGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJFcnJvciIsImFyZ3MiLCJnZXRCbHVyVmVyc2lvbiIsInZlcnNpb24iLCJzcGxpdCIsIm1hcCIsInYiLCJpIiwiam9pbiIsImxvYWRDb21wb25lbnRDc3MiLCJiYXNlVXJsIiwic3R5bGVJZCIsIm5lZWRDb21ib0Nzc0NodW5rIiwiY29tcG9uZW50Q3NzIiwiY29tYm9Dc3NDaHVua3MiLCJjaHVua05hbWUiLCJ1bnNoaWZ0IiwiY29tYm9Dc3NVcmwiLCJzZXRBdHRyaWJ1dGUiLCJEeW5hbWljUmVxdWlyZSIsIm5hbWUiLCJoYXNoZWQiLCJqc29ucENhbGxiYWNrIiwicmVwbGFjZSIsImpzb25wVXJsIiwic2NyaXB0SWQiLCJ1bmluc3RhbGxGbiIsImpzZSIsImdldEVsZW1lbnRCeUlkIiwiY3NzZSIsInRoZW4iLCJtb2R1bGVzIiwiZW50cnkiLCJlbnRyeU1vZHVsZU5hbWUiLCJjb21wb25lbnRDaHVua3MiLCJuZWVkQ29tYm9DaHVuayIsImhhc2hTdGF0ZSIsIk11cm11ckhhc2gzIiwiaGFzaCIsInJlc3VsdCIsInRvU3RyaW5nIiwic3Vic3RyIiwiZm9yRWFjaCIsIm1vZHVsZU5hbWUiLCJpc0NzcyIsIm1vZHVsZSIsIndlYnBhY2tEYXRhIiwiYyIsInB1c2giLCJhIiwic3NQcm9taXNlIiwianNQcm9taXNlIiwiY29tYm9DaHVua3MiLCJjb21ib1VybCIsImNvbnNvbGUiLCJsb2ciLCJlIiwiYWxsIiwid2FybiIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztBQUdBLElBQUlBLENBQUMsR0FBRyxPQUFPQyxNQUFQLElBQWlCLFdBQWpCLEdBQStCQSxNQUEvQixHQUF3Q0MsTUFBaEQ7O0FBa0JBOztBQUNBOztBQUNBO0FBQ0EsU0FBU0MsU0FBVCxDQUFtQkMsRUFBbkIsRUFBNEJDLFFBQTVCLEVBQW1EO0FBQ2pELE1BQUlDLE1BQUo7O0FBQ0EsV0FBU0MsS0FBVCxHQUFpQjtBQUNmLFFBQUksQ0FBQ0QsTUFBRCxJQUFXRCxRQUFmLEVBQXlCO0FBQ3ZCQyxNQUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNBRCxNQUFBQSxRQUFRLENBQUNHLElBQVQsQ0FBY0osRUFBZDtBQUNEO0FBQ0Y7O0FBQ0QsTUFBSUEsRUFBRSxDQUFDSyxnQkFBUCxFQUF5QjtBQUN2QkwsSUFBQUEsRUFBRSxDQUFDSyxnQkFBSCxDQUFvQixNQUFwQixFQUE0QkYsS0FBNUI7QUFDRDs7QUFDRCxNQUFJSCxFQUFFLENBQUNNLFdBQVAsRUFBb0I7QUFDbEJOLElBQUFBLEVBQUUsQ0FBQ00sV0FBSCxDQUFlLFFBQWYsRUFBeUJILEtBQXpCO0FBQ0QsR0FiZ0QsQ0FlakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFDQSxNQUFJLDRCQUE0QkksU0FBNUIsSUFBeUMsc0JBQXNCUCxFQUFuRSxFQUF1RTtBQUNyRUEsSUFBQUEsRUFBRSxDQUFDUSxnQkFBSCxDQUFv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VUFBQUEsTUFBTSxDQUFDMEQsQ0FBRCxDQUFOO0FBQ0Q7QUFDRixPQVJEO0FBU0QsS0FWVyxDQUFaO0FBV0EsV0FBTzVELE9BQU8sQ0FBQzZELEdBQVIsQ0FBWSxDQUFDUCxTQUFELEVBQVlDLFNBQVosQ0FBWixFQUFvQ3JCLElBQXBDLENBQXlDLGlCQUFrQjtBQUFBO0FBQUEsVUFBaEJuRSxFQUFnQjtBQUFBLFVBQVprRixNQUFZOztBQUNoRSxhQUFPQSxNQUFQO0FBQ0QsS0FGTSxXQUVFLFVBQUFXLENBQUMsRUFBSTtBQUNaRixNQUFBQSxPQUFPLENBQUNJLElBQVIsQ0FBYSx1QkFBYixFQUFzQ0YsQ0FBdEM7QUFDRCxLQUpNLENBQVA7QUFLRCxHQWxFTSxXQWtFRSxVQUFVRyxLQUFWLEVBQXNCO0FBQzdCTCxJQUFBQSxPQUFPLENBQUNJLElBQVIsQ0FBYSxtQkFBYjtBQUNBLFVBQU1DLEtBQU47QUFDRCxHQXJFTSxDQUFQO0FBc0VEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjcmlwdGpzIGZyb20gJ3NjcmlwdGpzJztcbmltcG9ydCB7IGxvYWRDU1MgfSBmcm9tICdmZy1sb2FkY3NzJztcbmltcG9ydCBjYW1lbENhc2UgZnJvbSAnY2FtZWxjYXNlJztcbmltcG9ydCBNdXJtdXJIYXNoMyBmcm9tICdpbXVybXVyaGFzaCc7XG4vLyBpbXBvcnQgeyBSZXF1aXJlLCBQYXJzZU1vZHVsZURhdGEgfSBmcm9tICcuL01haW4nO1xuZXhwb3J0ICogZnJvbSAnLi9NYWluJztcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5cbmV4cG9ydCB0eXBlIERlcFR5cGUgPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBlbmZvcmNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRGVwcyA9IHtcbiAgW25hbWU6IHN0cmluZ106IERlcFR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIEpTT05PcHQgPSB7XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIGNiS2V5Pzogc3RyaW5nO1xuICBjYlZhbD86IHN0cmluZztcbn1cblxuLyohIG9ubG9hZENTUy4gKG9ubG9hZCBjYWxsYmFjayBmb3IgbG9hZENTUykgW2NdMjAxNyBGaWxhbWVudCBHcm91cCwgSW5jLiBNSVQgTGljZW5zZSAqL1xuLyogZ2xvYmFsIG5hdmlnYXRvciAqL1xuLyogZXhwb3J0ZWQgb25sb2FkQ1NTICovXG5mdW5jdGlvbiBvbmxvYWRDU1Moc3M6IGFueSwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gIGxldCBjYWxsZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGZ1bmN0aW9uIG5ld2NiKCkge1xuICAgIGlmICghY2FsbGVkICYmIGNhbGxiYWNrKSB7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2suY2FsbChzcyk7XG4gICAgfVxuICB9XG4gIGlmIChzcy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgc3MuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbmV3Y2IpO1xuICB9XG4gIGlmIChzcy5hdHRhY2hFdmVudCkge1xuICAgIHNzLmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIG5ld2NiKTtcbiAgfVxuXG4gIC8vIFRoaXMgY29kZSBpcyBmb3IgYnJvd3NlcnMgdGhhdCBkb27igJl0IHN1cHBvcnQgb25sb2FkXG4gIC8vIE5vIHN1cHBvcnQgZm9yIG9ubG9hZCAoaXQnbGwgYmluZCBidXQgbmV2ZXIgZmlyZSk6XG4gIC8vXHQqIEFuZHJvaWQgNC4zIChTYW1zdW5nIEdhbGF4eSBTNCwgQnJvd3NlcnN0YWNrKVxuICAvL1x0KiBBbmRyb2lkIDQuMiBCcm93c2VyIChTYW1zdW5nIEdhbGF4eSBTSUlJIE1pbmkgR1QtSTgyMDBMKVxuICAvL1x0KiBBbmRyb2lkIDIuMyAoUGFudGVjaCBCdXJzdCBQOTA3MClcblxuICAvLyBXZWFrIGluZmVyZW5jZSB0YXJnZXRzIEFuZHJvaWQgPCA0LjRcbiAgaWYgKFwiaXNBcHBsaWNhdGlvbkluc3RhbGxlZFwiIGluIG5hdmlnYXRvciAmJiBcIm9ubG9hZGNzc2RlZmluZWRcIiBpbiBzcykge1xuICAgIHNzLm9ubG9hZGNzc2RlZmluZWQobmV3Y2IpO1xuICB9XG59XG5cblxuY29uc3QganNvbnAgPSAodXJsOiBzdHJpbmcsIG9wdDogSlNPTk9wdCA9IHt9LCBmbj86IEZ1bmN0aW9uKSA9PiB7XG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IG9wdFxuICAgIG9wdCA9IHt9XG4gIH1cblxuICBsZXQgeyB0aW1lb3V0ID0gbnVsbCwgY2JLZXkgPSAnY2FsbGJhY2snLCBjYlZhbCA9ICdmZW5neXUnIH0gPSBvcHRcbiAgbGV0IHRpbWVyOiBudW1iZXI7XG5cbiAgaWYgKGNiVmFsID09PSAnZmVuZ3l1Jykge1xuICAgIGNiVmFsICs9IERhdGUubm93KClcbiAgfVxuXG4gIGxldCBzID0gJydcbiAgcyArPSBgJiR7Y2JLZXl9PSR7Y2JWYWx9YFxuXG4gIHMgPSBzLnNsaWNlKDEpXG5cbiAgdXJsICs9ICh+dXJsLmluZGV4T2YoJz8nKSA/ICcmJyA6ICc/JykgKyBzXG5cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG5cbiAgdmFyIHJlbW92ZSA9ICgpID0+IHtcbiAgICB0aW1lciAmJiBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZChzY3JpcHQpXG4gICAgZ1tjYlZhbF0gPSB1bmRlZmluZWRcbiAgfVxuXG4gIHNjcmlwdC5zcmMgPSB1cmxcblxuXG4gIGlmIChmbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGdbY2JWYWxdID0gKGRhdGE6IGFueSkgPT4ge1xuICAgICAgZm4oZGF0YSlcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gICAgcmV0dXJuXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IChhcmcwOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKGFyZzA6IEVycm9yKSA9PiB2b2lkKSA9PiB7XG4gICAgLy8g6K+35rGC6LaF5pe2XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2pzb25wIHJlcXVlc3QgdGltZW91dCcpKVxuICAgICAgICByZW1vdmUoKVxuICAgICAgfSwgdGltZW91dClcbiAgICB9XG4gICAgLy8g5q2j5bi4XG4gICAgZ1tjYlZhbF0gPSAoLi4uYXJnczogYW55KSA9PiB7XG4gICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0Qmx1clZlcnNpb24odmVyc2lvbjogc3RyaW5nKSB7XG4gIHJldHVybiB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKCh2LCBpKSA9PiBpID4gMCA/ICd4JyA6IHYpLmpvaW4oJy4nKTtcbn1cbi8vIGNvbnN0IF9yZXF1aXJlXyA9IGcud2VicGFja0RhdGE7XG4vLyBnLndlYnBhY2tEYXRhID0gZnVuY3Rpb24obW9kdWxlSWQ6IGFueSkge1xuLy8gICBjb25zdCBtb2R1bGUgPSBfcmVxdWlyZV8ubVttb2R1bGVJZF0gYXMgRnVuY3Rpb247XG4vLyAgIGlmICghbW9kdWxlKSB7XG4vLyAgICAgY29uc29sZS53YXJuKG1vZHVsZUlkLCAnY2FuIG5vdCBiZSBmb3VuZGVkLCBjaGVjayBjaHVuayBpcyBjb21wbGV0aW9uJyk7XG4vLyAgICAgcmV0dXJuO1xuLy8gICB9XG4vLyAgIHJldHVybiBfcmVxdWlyZV8uY2FsbCh0aGlzLCBtb2R1bGVJZCk7XG4vLyB9XG4vLyBPYmplY3QuYXNzaWduKGcud2VicGFja0RhdGEsIF9yZXF1aXJlXyk7XG5cblxuZnVuY3Rpb24gbG9hZENvbXBvbmVudENzcyhiYXNlVXJsOiBzdHJpbmcsIHN0eWxlSWQ6IHN0cmluZywgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGNvbXBvbmVudENzcyA9ICdjb21wb25lbnQuY3NzJztcbiAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKTtcbiAgY29tYm9Dc3NDaHVua3MudW5zaGlmdChjb21wb25lbnRDc3MpO1xuICBjb25zdCBjb21ib0Nzc1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21ib0Nzc0NodW5rcy5qb2luKCl9YDtcblxuXG4gIGNvbnN0IHNzID0gbG9hZENTUyhjb21ib0Nzc1VybCk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgc3MgJiYgc3Muc2V0QXR0cmlidXRlKCdpZCcsIHN0eWxlSWQpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIG9ubG9hZENTUyhzcywgKCkgPT4ge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICAgIHNldFRpbWVvdXQocmVqZWN0LCA1MDAwKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEeW5hbWljUmVxdWlyZShuYW1lOiBzdHJpbmcsIGJhc2VVcmw6IHN0cmluZywgaGFzaGVkOiBib29sZWFuKSB7XG4gIGlmICghbmFtZSB8fCAhYmFzZVVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRHluYW1pY1JlcXVpcmUgbmFtZSBhbmQgYmFzZVVybCBwYXJhbXRlcnMgbXVzdCBzZXR0ZWQnKTtcbiAgfVxuICBjb25zdCBqc29ucENhbGxiYWNrID0gY2FtZWxDYXNlKG5hbWUucmVwbGFjZSgvQC9nLCAnJCcpKS5yZXBsYWNlKC9cXC8vZywgJ18nKTtcbiAgY29uc3QganNvbnBVcmwgPSBgJHtiYXNlVXJsfS9qc29ucG1vZHVsZXMuanNgO1xuICBjb25zdCBzY3JpcHRJZCA9IGAke25hbWV9X2pzYDtcbiAgY29uc3Qgc3R5bGVJZCA9IGAke25hbWV9X2Nzc2A7XG4gIGNvbnN0IHVuaW5zdGFsbEZuID0gYCR7bmFtZX1fdW5pbnN0YWxsYDtcbiAgLy8gQHRzLWlnbm9yZVxuICB3aW5kb3dbdW5pbnN0YWxsRm5dID0gKCkgPT4ge1xuICAgIGNvbnN0IGpzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmlwdElkKTtcbiAgICBjb25zdCBjc3NlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3R5bGVJZCk7XG4gICAganNlICYmIGpzZS5yZW1vdmUoKTtcbiAgICBjc3NlICYmIGNzc2UucmVtb3ZlKCk7XG4gIH1cbiAgcmV0dXJuIGpzb25wKGpzb25wVXJsLCB7XG4gICAgY2JWYWw6IGpzb25wQ2FsbGJhY2tcbiAgfSkudGhlbihmdW5jdGlvbiAoYXJncykge1xuICAgIGNvbnN0IG1vZHVsZXM6IHN0cmluZ1tdID0gYXJnc1swXTtcbiAgICBjb25zdCBlbnRyeTogc3RyaW5nID0gYXJnc1sxXTtcbiAgICBsZXQgZW50cnlNb2R1bGVOYW1lID0gYCR7bmFtZX0vJHtlbnRyeX1gO1xuICAgIGNvbnN0IGNvbXBvbmVudENodW5rcyA9ICd2ZW5kb3IuanMsY29tcG9uZW50LmpzJztcbiAgICBjb25zdCBuZWVkQ29tYm9Dc3NDaHVuazogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBuZWVkQ29tYm9DaHVuazogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmIChoYXNoZWQpIHtcbiAgICAgIGNvbnN0IGhhc2hTdGF0ZSA9IG5ldyBNdXJtdXJIYXNoMygpO1xuICAgICAgaGFzaFN0YXRlLmhhc2goZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgIGVudHJ5TW9kdWxlTmFtZSA9IGhhc2hTdGF0ZS5yZXN1bHQoKS50b1N0cmluZygxNikuc3Vic3RyKDAsIDYpO1xuICAgIH1cblxuICAgIG1vZHVsZXMuZm9yRWFjaCgoW21vZHVsZU5hbWUsIGNodW5rTmFtZSwgaXNDc3NdKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhLmNbbW9kdWxlTmFtZV07XG4gICAgICAvLyDlpoLmnpxtb2R1bGXkuI3lrZjlnKjvvIzmlL7liLBtb2R1bGXlr7nlupTnmoRjaHVua+WIsGNvbWJv5L+h5oGv6YeMXG4gICAgICBpZiAoIW1vZHVsZSAmJiBuZWVkQ29tYm9DaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgIG5lZWRDb21ib0NodW5rLnB1c2goY2h1bmtOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0NzcyAmJiBuZWVkQ29tYm9Dc3NDaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgIG5lZWRDb21ib0Nzc0NodW5rLnB1c2goY2h1bmtOYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIOW3sue7j+WKoOi9vei/h+S6hueahOmAu+i+kVxuICAgIGlmIChnLndlYnBhY2tEYXRhLmNbZW50cnlNb2R1bGVOYW1lXSkge1xuICAgICAgLy8gaWYgd2VicGFjayBlbmFibGUgaG1yIGFib3ZlIHJldHVybiB7IGNoaWxkcmVuLCBleHBvcnRzLCBob3QgLi4ufVxuICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YShlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgY29uc3QgY3NzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0eWxlSWQpO1xuICAgICAgLy8g5qC35byP5bey57uP5Y246L2977yM6YeN5paw5Yqg6L295Ye65p2lXG4gICAgICBpZiAoIWNzc2UpIHtcbiAgICAgICAgcmV0dXJuIGxvYWRDb21wb25lbnRDc3MoYmFzZVVybCwgc3R5bGVJZCwgbmVlZENvbWJvQ3NzQ2h1bmspLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtb2R1bGUuYSB8fCBtb2R1bGU7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShtb2R1bGUuYSB8fCBtb2R1bGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaWsOWKoOi9vemAu+i+kVxuICAgIC8vIOWKoOi9vWNzc1xuICAgIGNvbnN0IHNzUHJvbWlzZSA9IGxvYWRDb21wb25lbnRDc3MoYmFzZVVybCwgc3R5bGVJZCwgbmVlZENvbWJvQ3NzQ2h1bmspO1xuICAgIC8vIOW5tuihjOWKoOi9vWpzXG4gICAgbGV0IGpzUHJvbWlzZTtcbiAgICBjb25zdCBjb21ib0NodW5rcyA9IG5lZWRDb21ib0NodW5rLm1hcChjaHVua05hbWUgPT4gYGRlcHMvJHtjaHVua05hbWV9LmpzYClcbiAgICBjb21ib0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENodW5rcyk7IC8vIOihpeS4iuW/hemhu+eahOe7hOS7tui1hOa6kFxuICAgIGNvbnN0IGNvbWJvVXJsID0gYCR7YmFzZVVybH0vPz8ke2NvbWJvQ2h1bmtzLmpvaW4oKX1gO1xuICAgIGpzUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIFNjcmlwdGpzKGNvbWJvVXJsLCAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2xvYWQgY29tYm8ganMgZG9uZScsIG5hbWUpO1xuICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgICAgICByZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbc3NQcm9taXNlLCBqc1Byb21pc2VdKS50aGVuKChbc3MsIG1vZHVsZV0pID0+IHtcbiAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ2Jvb3Rsb2FkIG1vZHVsZSBlcnJvcicsIGUpO1xuICAgIH0pXG4gIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS53YXJuKCdsb2FkIHJlbW90ZSBlcnJvcicpO1xuICAgIHRocm93IGVycm9yXG4gIH0pXG59Il19
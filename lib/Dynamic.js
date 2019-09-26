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

    if (hashed) {
      var hashState = new _imurmurhash["default"]();
      hashState.hash(entryModuleName);
      entryModuleName = hashState.result().toString(16).substr(0, 6);
    }

    if (g.webpackData.c[entryModuleName]) {
      // if webpack enable hmr above return { children, exports, hot ...}
      var module = g.webpackData(entryModuleName);
      return Promise.resolve(module.a || module);
    }

    var componentChunks = 'vendor.js,component.js';
    var componentCss = 'component.css';
    var needComboChunk = [];
    var needComboCssChunk = [];
    modules.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 3),
          moduleName = _ref2[0],
          chunkName = _ref2[1],
          isCss = _ref2[2];

      var module = g.webpackData.c[moduleName]; // 如果module不存在，放到module对应的chunk到combo信息里

      if (!module && needComboChunk.indexOf(chunkName) === -1) {
        needComboChunk.push(chunkName);
      }

      if (!module && isCss && needComboCssChunk.indexOf(chunkName) === -1) {
        needComboCssChunk.push(chunkName);
      }
    }); // 先加载css

    var ssPromise;
    var comboCssChunks = needComboCssChunk.map(function (chunkName) {
      return "deps/".concat(chunkName, ".css");
    });
    comboCssChunks.unshift(componentCss);
    var comboCssUrl = "".concat(baseUrl, "/??").concat(comboCssChunks.join());
    var ss = (0, _fgLoadcss.loadCSS)(comboCssUrl); // @ts-ignore

    ss && ss.setAttribute('id', styleId);
    ssPromise = new Promise(function (resolve, reject) {
      onloadCSS(ss, function () {
        resolve();
      });
      setTimeout(reject, 5000);
    }); // 并行加载js

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJvbmxvYWRDU1MiLCJzcyIsImNhbGxiYWNrIiwiY2FsbGVkIiwibmV3Y2IiLCJjYWxsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwibmF2aWdhdG9yIiwib25sb2FkY3NzZGVmaW5lZCIsImpzb25wIiwidXJsIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwiYXBwZW5kQ2hpbGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJFcnJvciIsImFyZ3MiLCJnZXRCbHVyVmVyc2lvbiIsInZlcnNpb24iLCJzcGxpdCIsIm1hcCIsInYiLCJpIiwiam9pbiIsIkR5bmFtaWNSZXF1aXJlIiwibmFtZSIsImJhc2VVcmwiLCJoYXNoZWQiLCJqc29ucENhbGxiYWNrIiwicmVwbGFjZSIsImpzb25wVXJsIiwic2NyaXB0SWQiLCJzdHlsZUlkIiwidW5pbnN0YWxsRm4iLCJqc2UiLCJnZXRFbGVtZW50QnlJZCIsImNzc2UiLCJ0aGVuIiwibW9kdWxlcyIsImVudHJ5IiwiZW50cnlNb2R1bGVOYW1lIiwiaGFzaFN0YXRlIiwiTXVybXVySGFzaDMiLCJoYXNoIiwicmVzdWx0IiwidG9TdHJpbmciLCJzdWJzdHIiLCJ3ZWJwYWNrRGF0YSIsImMiLCJtb2R1bGUiLCJhIiwiY29tcG9uZW50Q2h1bmtzIiwiY29tcG9uZW50Q3NzIiwibmVlZENvbWJvQ2h1bmsiLCJuZWVkQ29tYm9Dc3NDaHVuayIsImZvckVhY2giLCJtb2R1bGVOYW1lIiwiY2h1bmtOYW1lIiwiaXNDc3MiLCJwdXNoIiwic3NQcm9taXNlIiwiY29tYm9Dc3NDaHVua3MiLCJ1bnNoaWZ0IiwiY29tYm9Dc3NVcmwiLCJzZXRBdHRyaWJ1dGUiLCJqc1Byb21pc2UiLCJjb21ib0NodW5rcyIsImNvbWJvVXJsIiwiY29uc29sZSIsImxvZyIsImUiLCJhbGwiLCJ3YXJuIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0FBR0EsSUFBSUEsQ0FBQyxHQUFHLE9BQU9DLE1BQVAsSUFBaUIsV0FBakIsR0FBK0JBLE1BQS9CLEdBQXdDQyxNQUFoRDs7QUFrQkE7O0FBQ0E7O0FBQ0E7QUFDQSxTQUFTQyxTQUFULENBQW1CQyxFQUFuQixFQUE0QkMsUUFBNUIsRUFBbUQ7QUFDakQsTUFBSUMsTUFBSjs7QUFDQSxXQUFTQyxLQUFULEdBQWlCO0FBQ2YsUUFBSSxDQUFDRCxNQUFELElBQVdELFFBQWYsRUFBeUI7QUFDdkJDLE1BQUFBLE1BQU0sR0FBRyxJQUFUO0FBQ0FELE1BQUFBLFFBQVEsQ0FBQ0csSUFBVCxDQUFjSixFQUFkO0FBQ0Q7QUFDRjs7QUFDRCxNQUFJQSxFQUFFLENBQUNLLGdCQUFQLEVBQXlCO0FBQ3ZCTCxJQUFBQSxFQUFFLENBQUNLLGdCQUFILENBQW9CLE1BQXBCLEVBQTRCRixLQUE1QjtBQUNEOztBQUNELE1BQUlILEVBQUUsQ0FBQ00sV0FBUCxFQUFvQjtBQUNsQk4sSUFBQUEsRUFBRSxDQUFDTSxXQUFILENBQWUsUUFBZixFQUF5QkgsS0FBekI7QUFDRCxHQWJnRCxDQWVqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7OztBQUNBLE1BQUksNEJBQTRCSSxTQUE1QixJQUF5QyxzQkFBc0JQLEVBQW5FLEVBQXVFO0FBQ3JFQSxJQUFBQSxFQUFFLENBQUNRLGdCQUFILENBQW9CTCxLQUFwQjtBQUNEO0FBQ0Y7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QXRFTSxDQUFQO0FBdUVEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjcmlwdGpzIGZyb20gJ3NjcmlwdGpzJztcbmltcG9ydCB7IGxvYWRDU1MgfSBmcm9tICdmZy1sb2FkY3NzJztcbmltcG9ydCBjYW1lbENhc2UgZnJvbSAnY2FtZWxjYXNlJztcbmltcG9ydCBNdXJtdXJIYXNoMyBmcm9tICdpbXVybXVyaGFzaCc7XG4vLyBpbXBvcnQgeyBSZXF1aXJlLCBQYXJzZU1vZHVsZURhdGEgfSBmcm9tICcuL01haW4nO1xuZXhwb3J0ICogZnJvbSAnLi9NYWluJztcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5cbmV4cG9ydCB0eXBlIERlcFR5cGUgPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBlbmZvcmNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRGVwcyA9IHtcbiAgW25hbWU6IHN0cmluZ106IERlcFR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIEpTT05PcHQgPSB7XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIGNiS2V5Pzogc3RyaW5nO1xuICBjYlZhbD86IHN0cmluZztcbn1cblxuLyohIG9ubG9hZENTUy4gKG9ubG9hZCBjYWxsYmFjayBmb3IgbG9hZENTUykgW2NdMjAxNyBGaWxhbWVudCBHcm91cCwgSW5jLiBNSVQgTGljZW5zZSAqL1xuLyogZ2xvYmFsIG5hdmlnYXRvciAqL1xuLyogZXhwb3J0ZWQgb25sb2FkQ1NTICovXG5mdW5jdGlvbiBvbmxvYWRDU1Moc3M6IGFueSwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gIGxldCBjYWxsZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gIGZ1bmN0aW9uIG5ld2NiKCkge1xuICAgIGlmICghY2FsbGVkICYmIGNhbGxiYWNrKSB7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2suY2FsbChzcyk7XG4gICAgfVxuICB9XG4gIGlmIChzcy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgc3MuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbmV3Y2IpO1xuICB9XG4gIGlmIChzcy5hdHRhY2hFdmVudCkge1xuICAgIHNzLmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIG5ld2NiKTtcbiAgfVxuXG4gIC8vIFRoaXMgY29kZSBpcyBmb3IgYnJvd3NlcnMgdGhhdCBkb27igJl0IHN1cHBvcnQgb25sb2FkXG4gIC8vIE5vIHN1cHBvcnQgZm9yIG9ubG9hZCAoaXQnbGwgYmluZCBidXQgbmV2ZXIgZmlyZSk6XG4gIC8vXHQqIEFuZHJvaWQgNC4zIChTYW1zdW5nIEdhbGF4eSBTNCwgQnJvd3NlcnN0YWNrKVxuICAvL1x0KiBBbmRyb2lkIDQuMiBCcm93c2VyIChTYW1zdW5nIEdhbGF4eSBTSUlJIE1pbmkgR1QtSTgyMDBMKVxuICAvL1x0KiBBbmRyb2lkIDIuMyAoUGFudGVjaCBCdXJzdCBQOTA3MClcblxuICAvLyBXZWFrIGluZmVyZW5jZSB0YXJnZXRzIEFuZHJvaWQgPCA0LjRcbiAgaWYgKFwiaXNBcHBsaWNhdGlvbkluc3RhbGxlZFwiIGluIG5hdmlnYXRvciAmJiBcIm9ubG9hZGNzc2RlZmluZWRcIiBpbiBzcykge1xuICAgIHNzLm9ubG9hZGNzc2RlZmluZWQobmV3Y2IpO1xuICB9XG59XG5cblxuY29uc3QganNvbnAgPSAodXJsOiBzdHJpbmcsIG9wdDogSlNPTk9wdCA9IHt9LCBmbj86IEZ1bmN0aW9uKSA9PiB7XG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IG9wdFxuICAgIG9wdCA9IHt9XG4gIH1cblxuICBsZXQgeyB0aW1lb3V0ID0gbnVsbCwgY2JLZXkgPSAnY2FsbGJhY2snLCBjYlZhbCA9ICdmZW5neXUnIH0gPSBvcHRcbiAgbGV0IHRpbWVyOiBudW1iZXI7XG5cbiAgaWYgKGNiVmFsID09PSAnZmVuZ3l1Jykge1xuICAgIGNiVmFsICs9IERhdGUubm93KClcbiAgfVxuXG4gIGxldCBzID0gJydcbiAgcyArPSBgJiR7Y2JLZXl9PSR7Y2JWYWx9YFxuXG4gIHMgPSBzLnNsaWNlKDEpXG5cbiAgdXJsICs9ICh+dXJsLmluZGV4T2YoJz8nKSA/ICcmJyA6ICc/JykgKyBzXG5cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG5cbiAgdmFyIHJlbW92ZSA9ICgpID0+IHtcbiAgICB0aW1lciAmJiBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZChzY3JpcHQpXG4gICAgZ1tjYlZhbF0gPSB1bmRlZmluZWRcbiAgfVxuXG4gIHNjcmlwdC5zcmMgPSB1cmxcblxuXG4gIGlmIChmbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGdbY2JWYWxdID0gKGRhdGE6IGFueSkgPT4ge1xuICAgICAgZm4oZGF0YSlcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gICAgcmV0dXJuXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IChhcmcwOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKGFyZzA6IEVycm9yKSA9PiB2b2lkKSA9PiB7XG4gICAgLy8g6K+35rGC6LaF5pe2XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2pzb25wIHJlcXVlc3QgdGltZW91dCcpKVxuICAgICAgICByZW1vdmUoKVxuICAgICAgfSwgdGltZW91dClcbiAgICB9XG4gICAgLy8g5q2j5bi4XG4gICAgZ1tjYlZhbF0gPSAoLi4uYXJnczogYW55KSA9PiB7XG4gICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0Qmx1clZlcnNpb24odmVyc2lvbjogc3RyaW5nKSB7XG4gIHJldHVybiB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKCh2LCBpKSA9PiBpID4gMCA/ICd4JyA6IHYpLmpvaW4oJy4nKTtcbn1cbi8vIGNvbnN0IF9yZXF1aXJlXyA9IGcud2VicGFja0RhdGE7XG4vLyBnLndlYnBhY2tEYXRhID0gZnVuY3Rpb24obW9kdWxlSWQ6IGFueSkge1xuLy8gICBjb25zdCBtb2R1bGUgPSBfcmVxdWlyZV8ubVttb2R1bGVJZF0gYXMgRnVuY3Rpb247XG4vLyAgIGlmICghbW9kdWxlKSB7XG4vLyAgICAgY29uc29sZS53YXJuKG1vZHVsZUlkLCAnY2FuIG5vdCBiZSBmb3VuZGVkLCBjaGVjayBjaHVuayBpcyBjb21wbGV0aW9uJyk7XG4vLyAgICAgcmV0dXJuO1xuLy8gICB9XG4vLyAgIHJldHVybiBfcmVxdWlyZV8uY2FsbCh0aGlzLCBtb2R1bGVJZCk7XG4vLyB9XG4vLyBPYmplY3QuYXNzaWduKGcud2VicGFja0RhdGEsIF9yZXF1aXJlXyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBEeW5hbWljUmVxdWlyZShuYW1lOiBzdHJpbmcsIGJhc2VVcmw6IHN0cmluZywgaGFzaGVkOiBib29sZWFuKSB7XG4gIGlmICghbmFtZSB8fCAhYmFzZVVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRHluYW1pY1JlcXVpcmUgbmFtZSBhbmQgYmFzZVVybCBwYXJhbXRlcnMgbXVzdCBzZXR0ZWQnKTtcbiAgfVxuICBjb25zdCBqc29ucENhbGxiYWNrID0gY2FtZWxDYXNlKG5hbWUucmVwbGFjZSgvQC9nLCAnJCcpKS5yZXBsYWNlKC9cXC8vZywgJ18nKTtcbiAgY29uc3QganNvbnBVcmwgPSBgJHtiYXNlVXJsfS9qc29ucG1vZHVsZXMuanNgO1xuICBjb25zdCBzY3JpcHRJZCA9IGAke25hbWV9X2pzYDtcbiAgY29uc3Qgc3R5bGVJZCA9IGAke25hbWV9X2Nzc2A7XG4gIGNvbnN0IHVuaW5zdGFsbEZuID0gYCR7bmFtZX1fdW5pbnN0YWxsYDtcbiAgLy8gQHRzLWlnbm9yZVxuICB3aW5kb3dbdW5pbnN0YWxsRm5dID0gKCkgPT4ge1xuICAgIGNvbnN0IGpzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmlwdElkKTtcbiAgICBjb25zdCBjc3NlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3R5bGVJZCk7XG4gICAganNlICYmIGpzZS5yZW1vdmUoKTtcbiAgICBjc3NlICYmIGNzc2UucmVtb3ZlKCk7XG4gIH1cbiAgcmV0dXJuIGpzb25wKGpzb25wVXJsLCB7XG4gICAgY2JWYWw6IGpzb25wQ2FsbGJhY2tcbiAgfSkudGhlbihmdW5jdGlvbiAoYXJncykge1xuICAgIGNvbnN0IG1vZHVsZXM6IHN0cmluZ1tdID0gYXJnc1swXTtcbiAgICBjb25zdCBlbnRyeTogc3RyaW5nID0gYXJnc1sxXTtcbiAgICBsZXQgZW50cnlNb2R1bGVOYW1lID0gYCR7bmFtZX0vJHtlbnRyeX1gO1xuICAgIGlmIChoYXNoZWQpIHtcbiAgICAgIGNvbnN0IGhhc2hTdGF0ZSA9IG5ldyBNdXJtdXJIYXNoMygpO1xuICAgICAgaGFzaFN0YXRlLmhhc2goZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgIGVudHJ5TW9kdWxlTmFtZSA9IGhhc2hTdGF0ZS5yZXN1bHQoKS50b1N0cmluZygxNikuc3Vic3RyKDAsIDYpO1xuICAgIH1cbiAgICBpZiAoZy53ZWJwYWNrRGF0YS5jW2VudHJ5TW9kdWxlTmFtZV0pIHtcbiAgICAgIC8vIGlmIHdlYnBhY2sgZW5hYmxlIGhtciBhYm92ZSByZXR1cm4geyBjaGlsZHJlbiwgZXhwb3J0cywgaG90IC4uLn1cbiAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobW9kdWxlLmEgfHwgbW9kdWxlKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wb25lbnRDaHVua3MgPSAndmVuZG9yLmpzLGNvbXBvbmVudC5qcyc7XG4gICAgY29uc3QgY29tcG9uZW50Q3NzID0gJ2NvbXBvbmVudC5jc3MnO1xuICAgIGNvbnN0IG5lZWRDb21ib0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IG5lZWRDb21ib0Nzc0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgIG1vZHVsZXMuZm9yRWFjaCgoW21vZHVsZU5hbWUsIGNodW5rTmFtZSwgaXNDc3NdKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhLmNbbW9kdWxlTmFtZV07XG4gICAgICAvLyDlpoLmnpxtb2R1bGXkuI3lrZjlnKjvvIzmlL7liLBtb2R1bGXlr7nlupTnmoRjaHVua+WIsGNvbWJv5L+h5oGv6YeMXG4gICAgICBpZiAoIW1vZHVsZSAmJiBuZWVkQ29tYm9DaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgIG5lZWRDb21ib0NodW5rLnB1c2goY2h1bmtOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmICghbW9kdWxlICYmIGlzQ3NzICYmIG5lZWRDb21ib0Nzc0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgbmVlZENvbWJvQ3NzQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIOWFiOWKoOi9vWNzc1xuICAgIGxldCBzc1Byb21pc2U7XG4gICAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKTtcbiAgICBjb21ib0Nzc0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENzcyk7XG4gICAgY29uc3QgY29tYm9Dc3NVcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tYm9Dc3NDaHVua3Muam9pbigpfWA7XG4gICAgY29uc3Qgc3MgPSBsb2FkQ1NTKGNvbWJvQ3NzVXJsKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgc3MgJiYgc3Muc2V0QXR0cmlidXRlKCdpZCcsIHN0eWxlSWQpO1xuICAgIHNzUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG9ubG9hZENTUyhzcywgKCkgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICAgIHNldFRpbWVvdXQocmVqZWN0LCA1MDAwKTtcbiAgICB9KTtcblxuICAgIC8vIOW5tuihjOWKoOi9vWpzXG4gICAgbGV0IGpzUHJvbWlzZTtcbiAgICBjb25zdCBjb21ib0NodW5rcyA9IG5lZWRDb21ib0NodW5rLm1hcChjaHVua05hbWUgPT4gYGRlcHMvJHtjaHVua05hbWV9LmpzYClcbiAgICBjb21ib0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENodW5rcyk7IC8vIOihpeS4iuW/hemhu+eahOe7hOS7tui1hOa6kFxuICAgIGNvbnN0IGNvbWJvVXJsID0gYCR7YmFzZVVybH0vPz8ke2NvbWJvQ2h1bmtzLmpvaW4oKX1gO1xuICAgIGpzUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIFNjcmlwdGpzKGNvbWJvVXJsLCAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2xvYWQgY29tYm8ganMgZG9uZScsIG5hbWUpO1xuICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgICAgICByZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbc3NQcm9taXNlLCBqc1Byb21pc2VdKS50aGVuKChbc3MsIG1vZHVsZV0pID0+IHtcbiAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ2Jvb3Rsb2FkIG1vZHVsZSBlcnJvcicsIGUpO1xuICAgIH0pXG4gIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS53YXJuKCdsb2FkIHJlbW90ZSBlcnJvcicpO1xuICAgIHRocm93IGVycm9yXG4gIH0pXG59Il19
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

      if (!module && isCss && needComboCssChunk.indexOf(chunkName) === -1) {
        needComboCssChunk.push(chunkName);
      }
    }); // 已经加载过了的逻辑

    if (g.webpackData.c[entryModuleName]) {
      // if webpack enable hmr above return { children, exports, hot ...}
      var module = g.webpackData(entryModuleName);
      var csse = document.getElementById(styleId); // 样式已经卸载，重新加载出来

      if (!csse) {
        loadComponentCss(baseUrl, styleId, needComboCssChunk);
      }

      return Promise.resolve(module.a || module);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJvbmxvYWRDU1MiLCJzcyIsImNhbGxiYWNrIiwiY2FsbGVkIiwibmV3Y2IiLCJjYWxsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwibmF2aWdhdG9yIiwib25sb2FkY3NzZGVmaW5lZCIsImpzb25wIiwidXJsIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwiYXBwZW5kQ2hpbGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJFcnJvciIsImFyZ3MiLCJnZXRCbHVyVmVyc2lvbiIsInZlcnNpb24iLCJzcGxpdCIsIm1hcCIsInYiLCJpIiwiam9pbiIsImxvYWRDb21wb25lbnRDc3MiLCJiYXNlVXJsIiwic3R5bGVJZCIsIm5lZWRDb21ib0Nzc0NodW5rIiwiY29tcG9uZW50Q3NzIiwiY29tYm9Dc3NDaHVua3MiLCJjaHVua05hbWUiLCJ1bnNoaWZ0IiwiY29tYm9Dc3NVcmwiLCJzZXRBdHRyaWJ1dGUiLCJEeW5hbWljUmVxdWlyZSIsIm5hbWUiLCJoYXNoZWQiLCJqc29ucENhbGxiYWNrIiwicmVwbGFjZSIsImpzb25wVXJsIiwic2NyaXB0SWQiLCJ1bmluc3RhbGxGbiIsImpzZSIsImdldEVsZW1lbnRCeUlkIiwiY3NzZSIsInRoZW4iLCJtb2R1bGVzIiwiZW50cnkiLCJlbnRyeU1vZHVsZU5hbWUiLCJjb21wb25lbnRDaHVua3MiLCJuZWVkQ29tYm9DaHVuayIsImhhc2hTdGF0ZSIsIk11cm11ckhhc2gzIiwiaGFzaCIsInJlc3VsdCIsInRvU3RyaW5nIiwic3Vic3RyIiwiZm9yRWFjaCIsIm1vZHVsZU5hbWUiLCJpc0NzcyIsIm1vZHVsZSIsIndlYnBhY2tEYXRhIiwiYyIsInB1c2giLCJhIiwic3NQcm9taXNlIiwianNQcm9taXNlIiwiY29tYm9DaHVua3MiLCJjb21ib1VybCIsImNvbnNvbGUiLCJsb2ciLCJlIiwiYWxsIiwid2FybiIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztBQUdBLElBQUlBLENBQUMsR0FBRyxPQUFPQyxNQUFQLElBQWlCLFdBQWpCLEdBQStCQSxNQUEvQixHQUF3Q0MsTUFBaEQ7O0FBa0JBOztBQUNBOztBQUNBO0FBQ0EsU0FBU0MsU0FBVCxDQUFtQkMsRUFBbkIsRUFBNEJDLFFBQTVCLEVBQW1EO0FBQ2pELE1BQUlDLE1BQUo7O0FBQ0EsV0FBU0MsS0FBVCxHQUFpQjtBQUNmLFFBQUksQ0FBQ0QsTUFBRCxJQUFXRCxRQUFmLEVBQXlCO0FBQ3ZCQyxNQUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNBRCxNQUFBQSxRQUFRLENBQUNHLElBQVQsQ0FBY0osRUFBZDtBQUNEO0FBQ0Y7O0FBQ0QsTUFBSUEsRUFBRSxDQUFDSyxnQkFBUCxFQUF5QjtBQUN2QkwsSUFBQUEsRUFBRSxDQUFDSyxnQkFBSCxDQUFvQixNQUFwQixFQUE0QkYsS0FBNUI7QUFDRDs7QUFDRCxNQUFJSCxFQUFFLENBQUNNLFdBQVAsRUFBb0I7QUFDbEJOLElBQUFBLEVBQUUsQ0FBQ00sV0FBSCxDQUFlLFFBQWYsRUFBeUJILEtBQXpCO0FBQ0QsR0FiZ0QsQ0FlakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFDQSxNQUFJLDRCQUE0QkksU0FBNUIsSUFBeUMsc0JBQXNCUCxFQUFuRSxFQUF1RTtBQUNyRUEsSUFBQUEsRUFBRSxDQUFDUSxnQkFBSCxDQUFv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QUM2RCxHQUFSLENBQVksQ0FBQ1AsU0FBRCxFQUFZQyxTQUFaLENBQVosRUFBb0NyQixJQUFwQyxDQUF5QyxpQkFBa0I7QUFBQTtBQUFBLFVBQWhCbkUsRUFBZ0I7QUFBQSxVQUFaa0YsTUFBWTs7QUFDaEUsYUFBT0EsTUFBUDtBQUNELEtBRk0sV0FFRSxVQUFBVyxDQUFDLEVBQUk7QUFDWkYsTUFBQUEsT0FBTyxDQUFDSSxJQUFSLENBQWEsdUJBQWIsRUFBc0NGLENBQXRDO0FBQ0QsS0FKTSxDQUFQO0FBS0QsR0EvRE0sV0ErREUsVUFBVUcsS0FBVixFQUFzQjtBQUM3QkwsSUFBQUEsT0FBTyxDQUFDSSxJQUFSLENBQWEsbUJBQWI7QUFDQSxVQUFNQyxLQUFOO0FBQ0QsR0FsRU0sQ0FBUDtBQW1FRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY3JpcHRqcyBmcm9tICdzY3JpcHRqcyc7XG5pbXBvcnQgeyBsb2FkQ1NTIH0gZnJvbSAnZmctbG9hZGNzcyc7XG5pbXBvcnQgY2FtZWxDYXNlIGZyb20gJ2NhbWVsY2FzZSc7XG5pbXBvcnQgTXVybXVySGFzaDMgZnJvbSAnaW11cm11cmhhc2gnO1xuLy8gaW1wb3J0IHsgUmVxdWlyZSwgUGFyc2VNb2R1bGVEYXRhIH0gZnJvbSAnLi9NYWluJztcbmV4cG9ydCAqIGZyb20gJy4vTWFpbic7XG5cbmRlY2xhcmUgdmFyIHdpbmRvdzogV2luZG93LCBnbG9iYWw6IGFueTtcbnZhciBnID0gdHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsO1xuXG5leHBvcnQgdHlwZSBEZXBUeXBlID0ge1xuICB0eXBlOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZztcbiAgZW5mb3JjZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIERlcHMgPSB7XG4gIFtuYW1lOiBzdHJpbmddOiBEZXBUeXBlO1xufVxuXG5leHBvcnQgdHlwZSBKU09OT3B0ID0ge1xuICB0aW1lb3V0PzogbnVtYmVyO1xuICBjYktleT86IHN0cmluZztcbiAgY2JWYWw/OiBzdHJpbmc7XG59XG5cbi8qISBvbmxvYWRDU1MuIChvbmxvYWQgY2FsbGJhY2sgZm9yIGxvYWRDU1MpIFtjXTIwMTcgRmlsYW1lbnQgR3JvdXAsIEluYy4gTUlUIExpY2Vuc2UgKi9cbi8qIGdsb2JhbCBuYXZpZ2F0b3IgKi9cbi8qIGV4cG9ydGVkIG9ubG9hZENTUyAqL1xuZnVuY3Rpb24gb25sb2FkQ1NTKHNzOiBhbnksIGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xuICBsZXQgY2FsbGVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICBmdW5jdGlvbiBuZXdjYigpIHtcbiAgICBpZiAoIWNhbGxlZCAmJiBjYWxsYmFjaykge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIGNhbGxiYWNrLmNhbGwoc3MpO1xuICAgIH1cbiAgfVxuICBpZiAoc3MuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHNzLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG5ld2NiKTtcbiAgfVxuICBpZiAoc3MuYXR0YWNoRXZlbnQpIHtcbiAgICBzcy5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBuZXdjYik7XG4gIH1cblxuICAvLyBUaGlzIGNvZGUgaXMgZm9yIGJyb3dzZXJzIHRoYXQgZG9u4oCZdCBzdXBwb3J0IG9ubG9hZFxuICAvLyBObyBzdXBwb3J0IGZvciBvbmxvYWQgKGl0J2xsIGJpbmQgYnV0IG5ldmVyIGZpcmUpOlxuICAvL1x0KiBBbmRyb2lkIDQuMyAoU2Ftc3VuZyBHYWxheHkgUzQsIEJyb3dzZXJzdGFjaylcbiAgLy9cdCogQW5kcm9pZCA0LjIgQnJvd3NlciAoU2Ftc3VuZyBHYWxheHkgU0lJSSBNaW5pIEdULUk4MjAwTClcbiAgLy9cdCogQW5kcm9pZCAyLjMgKFBhbnRlY2ggQnVyc3QgUDkwNzApXG5cbiAgLy8gV2VhayBpbmZlcmVuY2UgdGFyZ2V0cyBBbmRyb2lkIDwgNC40XG4gIGlmIChcImlzQXBwbGljYXRpb25JbnN0YWxsZWRcIiBpbiBuYXZpZ2F0b3IgJiYgXCJvbmxvYWRjc3NkZWZpbmVkXCIgaW4gc3MpIHtcbiAgICBzcy5vbmxvYWRjc3NkZWZpbmVkKG5ld2NiKTtcbiAgfVxufVxuXG5cbmNvbnN0IGpzb25wID0gKHVybDogc3RyaW5nLCBvcHQ6IEpTT05PcHQgPSB7fSwgZm4/OiBGdW5jdGlvbikgPT4ge1xuXG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG5cbiAgbGV0IHsgdGltZW91dCA9IG51bGwsIGNiS2V5ID0gJ2NhbGxiYWNrJywgY2JWYWwgPSAnZmVuZ3l1JyB9ID0gb3B0XG4gIGxldCB0aW1lcjogbnVtYmVyO1xuXG4gIGlmIChjYlZhbCA9PT0gJ2Zlbmd5dScpIHtcbiAgICBjYlZhbCArPSBEYXRlLm5vdygpXG4gIH1cblxuICBsZXQgcyA9ICcnXG4gIHMgKz0gYCYke2NiS2V5fT0ke2NiVmFsfWBcblxuICBzID0gcy5zbGljZSgxKVxuXG4gIHVybCArPSAofnVybC5pbmRleE9mKCc/JykgPyAnJicgOiAnPycpICsgc1xuXG4gIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuXG4gIHZhciByZW1vdmUgPSAoKSA9PiB7XG4gICAgdGltZXIgJiYgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQoc2NyaXB0KVxuICAgIGdbY2JWYWxdID0gdW5kZWZpbmVkXG4gIH1cblxuICBzY3JpcHQuc3JjID0gdXJsXG5cblxuICBpZiAoZm4gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBnW2NiVmFsXSA9IChkYXRhOiBhbnkpID0+IHtcbiAgICAgIGZuKGRhdGEpXG4gICAgICByZW1vdmUoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICAgIHJldHVyblxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiAoYXJnMDogYW55KSA9PiB2b2lkLCByZWplY3Q6IChhcmcwOiBFcnJvcikgPT4gdm9pZCkgPT4ge1xuICAgIC8vIOivt+axgui2heaXtlxuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdqc29ucCByZXF1ZXN0IHRpbWVvdXQnKSlcbiAgICAgICAgcmVtb3ZlKClcbiAgICAgIH0sIHRpbWVvdXQpXG4gICAgfVxuICAgIC8vIOato+W4uFxuICAgIGdbY2JWYWxdID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldEJsdXJWZXJzaW9uKHZlcnNpb246IHN0cmluZykge1xuICByZXR1cm4gdmVyc2lvbi5zcGxpdCgnLicpLm1hcCgodiwgaSkgPT4gaSA+IDAgPyAneCcgOiB2KS5qb2luKCcuJyk7XG59XG4vLyBjb25zdCBfcmVxdWlyZV8gPSBnLndlYnBhY2tEYXRhO1xuLy8gZy53ZWJwYWNrRGF0YSA9IGZ1bmN0aW9uKG1vZHVsZUlkOiBhbnkpIHtcbi8vICAgY29uc3QgbW9kdWxlID0gX3JlcXVpcmVfLm1bbW9kdWxlSWRdIGFzIEZ1bmN0aW9uO1xuLy8gICBpZiAoIW1vZHVsZSkge1xuLy8gICAgIGNvbnNvbGUud2Fybihtb2R1bGVJZCwgJ2NhbiBub3QgYmUgZm91bmRlZCwgY2hlY2sgY2h1bmsgaXMgY29tcGxldGlvbicpO1xuLy8gICAgIHJldHVybjtcbi8vICAgfVxuLy8gICByZXR1cm4gX3JlcXVpcmVfLmNhbGwodGhpcywgbW9kdWxlSWQpO1xuLy8gfVxuLy8gT2JqZWN0LmFzc2lnbihnLndlYnBhY2tEYXRhLCBfcmVxdWlyZV8pO1xuXG5cbmZ1bmN0aW9uIGxvYWRDb21wb25lbnRDc3MoYmFzZVVybDogc3RyaW5nLCBzdHlsZUlkOiBzdHJpbmcsIG5lZWRDb21ib0Nzc0NodW5rOiBzdHJpbmdbXSkge1xuICBjb25zdCBjb21wb25lbnRDc3MgPSAnY29tcG9uZW50LmNzcyc7XG4gIGNvbnN0IGNvbWJvQ3NzQ2h1bmtzID0gbmVlZENvbWJvQ3NzQ2h1bmsubWFwKGNodW5rTmFtZSA9PiBgZGVwcy8ke2NodW5rTmFtZX0uY3NzYCk7XG4gIGNvbWJvQ3NzQ2h1bmtzLnVuc2hpZnQoY29tcG9uZW50Q3NzKTtcbiAgY29uc3QgY29tYm9Dc3NVcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tYm9Dc3NDaHVua3Muam9pbigpfWA7XG5cblxuICBjb25zdCBzcyA9IGxvYWRDU1MoY29tYm9Dc3NVcmwpO1xuICAvLyBAdHMtaWdub3JlXG4gIHNzICYmIHNzLnNldEF0dHJpYnV0ZSgnaWQnLCBzdHlsZUlkKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBvbmxvYWRDU1Moc3MsICgpID0+IHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBzZXRUaW1lb3V0KHJlamVjdCwgNTAwMCk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRHluYW1pY1JlcXVpcmUobmFtZTogc3RyaW5nLCBiYXNlVXJsOiBzdHJpbmcsIGhhc2hlZDogYm9vbGVhbikge1xuICBpZiAoIW5hbWUgfHwgIWJhc2VVcmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0R5bmFtaWNSZXF1aXJlIG5hbWUgYW5kIGJhc2VVcmwgcGFyYW10ZXJzIG11c3Qgc2V0dGVkJyk7XG4gIH1cbiAgY29uc3QganNvbnBDYWxsYmFjayA9IGNhbWVsQ2FzZShuYW1lLnJlcGxhY2UoL0AvZywgJyQnKSkucmVwbGFjZSgvXFwvL2csICdfJyk7XG4gIGNvbnN0IGpzb25wVXJsID0gYCR7YmFzZVVybH0vanNvbnBtb2R1bGVzLmpzYDtcbiAgY29uc3Qgc2NyaXB0SWQgPSBgJHtuYW1lfV9qc2A7XG4gIGNvbnN0IHN0eWxlSWQgPSBgJHtuYW1lfV9jc3NgO1xuICBjb25zdCB1bmluc3RhbGxGbiA9IGAke25hbWV9X3VuaW5zdGFsbGA7XG4gIC8vIEB0cy1pZ25vcmVcbiAgd2luZG93W3VuaW5zdGFsbEZuXSA9ICgpID0+IHtcbiAgICBjb25zdCBqc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY3JpcHRJZCk7XG4gICAgY29uc3QgY3NzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0eWxlSWQpO1xuICAgIGpzZSAmJiBqc2UucmVtb3ZlKCk7XG4gICAgY3NzZSAmJiBjc3NlLnJlbW92ZSgpO1xuICB9XG4gIHJldHVybiBqc29ucChqc29ucFVybCwge1xuICAgIGNiVmFsOiBqc29ucENhbGxiYWNrXG4gIH0pLnRoZW4oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICBjb25zdCBtb2R1bGVzOiBzdHJpbmdbXSA9IGFyZ3NbMF07XG4gICAgY29uc3QgZW50cnk6IHN0cmluZyA9IGFyZ3NbMV07XG4gICAgbGV0IGVudHJ5TW9kdWxlTmFtZSA9IGAke25hbWV9LyR7ZW50cnl9YDtcbiAgICBjb25zdCBjb21wb25lbnRDaHVua3MgPSAndmVuZG9yLmpzLGNvbXBvbmVudC5qcyc7XG4gICAgY29uc3QgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbmVlZENvbWJvQ2h1bms6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAoaGFzaGVkKSB7XG4gICAgICBjb25zdCBoYXNoU3RhdGUgPSBuZXcgTXVybXVySGFzaDMoKTtcbiAgICAgIGhhc2hTdGF0ZS5oYXNoKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICBlbnRyeU1vZHVsZU5hbWUgPSBoYXNoU3RhdGUucmVzdWx0KCkudG9TdHJpbmcoMTYpLnN1YnN0cigwLCA2KTtcbiAgICB9XG5cbiAgICBtb2R1bGVzLmZvckVhY2goKFttb2R1bGVOYW1lLCBjaHVua05hbWUsIGlzQ3NzXSkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YS5jW21vZHVsZU5hbWVdO1xuICAgICAgLy8g5aaC5p6cbW9kdWxl5LiN5a2Y5Zyo77yM5pS+5YiwbW9kdWxl5a+55bqU55qEY2h1bmvliLBjb21ib+S/oeaBr+mHjFxuICAgICAgaWYgKCFtb2R1bGUgJiYgbmVlZENvbWJvQ2h1bmsuaW5kZXhPZihjaHVua05hbWUpID09PSAtMSkge1xuICAgICAgICBuZWVkQ29tYm9DaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAoIW1vZHVsZSAmJiBpc0NzcyAmJiBuZWVkQ29tYm9Dc3NDaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgIG5lZWRDb21ib0Nzc0NodW5rLnB1c2goY2h1bmtOYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIOW3sue7j+WKoOi9vei/h+S6hueahOmAu+i+kVxuICAgIGlmIChnLndlYnBhY2tEYXRhLmNbZW50cnlNb2R1bGVOYW1lXSkge1xuICAgICAgLy8gaWYgd2VicGFjayBlbmFibGUgaG1yIGFib3ZlIHJldHVybiB7IGNoaWxkcmVuLCBleHBvcnRzLCBob3QgLi4ufVxuICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YShlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgY29uc3QgY3NzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0eWxlSWQpO1xuICAgICAgLy8g5qC35byP5bey57uP5Y246L2977yM6YeN5paw5Yqg6L295Ye65p2lXG4gICAgICBpZiAoIWNzc2UpIHtcbiAgICAgICAgbG9hZENvbXBvbmVudENzcyhiYXNlVXJsLCBzdHlsZUlkLCBuZWVkQ29tYm9Dc3NDaHVuayk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgfVxuXG4gICAgLy8g5paw5Yqg6L296YC76L6RXG4gICAgLy8g5Yqg6L29Y3NzXG4gICAgY29uc3Qgc3NQcm9taXNlID0gbG9hZENvbXBvbmVudENzcyhiYXNlVXJsLCBzdHlsZUlkLCBuZWVkQ29tYm9Dc3NDaHVuayk7XG4gICAgLy8g5bm26KGM5Yqg6L29anNcbiAgICBsZXQganNQcm9taXNlO1xuICAgIGNvbnN0IGNvbWJvQ2h1bmtzID0gbmVlZENvbWJvQ2h1bmsubWFwKGNodW5rTmFtZSA9PiBgZGVwcy8ke2NodW5rTmFtZX0uanNgKVxuICAgIGNvbWJvQ2h1bmtzLnVuc2hpZnQoY29tcG9uZW50Q2h1bmtzKTsgLy8g6KGl5LiK5b+F6aG755qE57uE5Lu26LWE5rqQXG4gICAgY29uc3QgY29tYm9VcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tYm9DaHVua3Muam9pbigpfWA7XG4gICAganNQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgU2NyaXB0anMoY29tYm9VcmwsICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZCBjb21ibyBqcyBkb25lJywgbmFtZSk7XG4gICAgICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YShlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgICAgIHJlc29sdmUobW9kdWxlLmEgfHwgbW9kdWxlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtzc1Byb21pc2UsIGpzUHJvbWlzZV0pLnRoZW4oKFtzcywgbW9kdWxlXSkgPT4ge1xuICAgICAgcmV0dXJuIG1vZHVsZTtcbiAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignYm9vdGxvYWQgbW9kdWxlIGVycm9yJywgZSk7XG4gICAgfSlcbiAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLndhcm4oJ2xvYWQgcmVtb3RlIGVycm9yJyk7XG4gICAgdGhyb3cgZXJyb3JcbiAgfSlcbn0iXX0=
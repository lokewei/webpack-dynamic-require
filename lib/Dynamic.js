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
    var ss = (0, _fgLoadcss.loadCSS)(comboCssUrl);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJvbmxvYWRDU1MiLCJzcyIsImNhbGxiYWNrIiwiY2FsbGVkIiwibmV3Y2IiLCJjYWxsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwibmF2aWdhdG9yIiwib25sb2FkY3NzZGVmaW5lZCIsImpzb25wIiwidXJsIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwiYXBwZW5kQ2hpbGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJFcnJvciIsImFyZ3MiLCJnZXRCbHVyVmVyc2lvbiIsInZlcnNpb24iLCJzcGxpdCIsIm1hcCIsInYiLCJpIiwiam9pbiIsIkR5bmFtaWNSZXF1aXJlIiwibmFtZSIsImJhc2VVcmwiLCJoYXNoZWQiLCJqc29ucENhbGxiYWNrIiwicmVwbGFjZSIsImpzb25wVXJsIiwidGhlbiIsIm1vZHVsZXMiLCJlbnRyeSIsImVudHJ5TW9kdWxlTmFtZSIsImhhc2hTdGF0ZSIsIk11cm11ckhhc2gzIiwiaGFzaCIsInJlc3VsdCIsInRvU3RyaW5nIiwic3Vic3RyIiwid2VicGFja0RhdGEiLCJjIiwibW9kdWxlIiwiYSIsImNvbXBvbmVudENodW5rcyIsImNvbXBvbmVudENzcyIsIm5lZWRDb21ib0NodW5rIiwibmVlZENvbWJvQ3NzQ2h1bmsiLCJmb3JFYWNoIiwibW9kdWxlTmFtZSIsImNodW5rTmFtZSIsImlzQ3NzIiwicHVzaCIsInNzUHJvbWlzZSIsImNvbWJvQ3NzQ2h1bmtzIiwidW5zaGlmdCIsImNvbWJvQ3NzVXJsIiwianNQcm9taXNlIiwiY29tYm9DaHVua3MiLCJjb21ib1VybCIsImNvbnNvbGUiLCJsb2ciLCJlIiwiYWxsIiwid2FybiIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztBQUdBLElBQUlBLENBQUMsR0FBRyxPQUFPQyxNQUFQLElBQWlCLFdBQWpCLEdBQStCQSxNQUEvQixHQUF3Q0MsTUFBaEQ7O0FBa0JBOztBQUNBOztBQUNBO0FBQ0EsU0FBU0MsU0FBVCxDQUFtQkMsRUFBbkIsRUFBNEJDLFFBQTVCLEVBQW1EO0FBQ2pELE1BQUlDLE1BQUo7O0FBQ0EsV0FBU0MsS0FBVCxHQUFpQjtBQUNmLFFBQUksQ0FBQ0QsTUFBRCxJQUFXRCxRQUFmLEVBQXlCO0FBQ3ZCQyxNQUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNBRCxNQUFBQSxRQUFRLENBQUNHLElBQVQsQ0FBY0osRUFBZDtBQUNEO0FBQ0Y7O0FBQ0QsTUFBSUEsRUFBRSxDQUFDSyxnQkFBUCxFQUF5QjtBQUN2QkwsSUFBQUEsRUFBRSxDQUFDSyxnQkFBSCxDQUFvQixNQUFwQixFQUE0QkYsS0FBNUI7QUFDRDs7QUFDRCxNQUFJSCxFQUFFLENBQUNNLFdBQVAsRUFBb0I7QUFDbEJOLElBQUFBLEVBQUUsQ0FBQ00sV0FBSCxDQUFlLFFBQWYsRUFBeUJILEtBQXpCO0FBQ0QsR0FiZ0QsQ0FlakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7QUFDQSxNQUFJLDRCQUE0QkksU0FBNUIsSUFBeUMsc0JBQXNCUCxFQUFuRSxFQUF1RTtBQUNyRUEsSUFBQUEsRUFBRSxDQUFDUSxnQkFBSCxDQUFvQkwsS0FBcEI7QUFDRDtBQUNGOztBQUdELElBQU1NLEtBQUssR0FBRyxTQUFSQSxLQUFRLENBQUNDLEdBQUQsRUFBbUQ7QUFBQSxNQUFyQ0MsR0FBcUMsdUVBQXRCLEVBQXNC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U0QsS0FWVyxDQUFaO0FBV0EsV0FBT3BELE9BQU8sQ0FBQ3FELEdBQVIsQ0FBWSxDQUFDVixTQUFELEVBQVlJLFNBQVosQ0FBWixFQUFvQzNCLElBQXBDLENBQXlDLGlCQUFrQjtBQUFBO0FBQUEsVUFBaEJyRCxFQUFnQjtBQUFBLFVBQVppRSxNQUFZOztBQUNoRSxhQUFPQSxNQUFQO0FBQ0QsS0FGTSxXQUVFLFVBQUFvQixDQUFDLEVBQUk7QUFDWkYsTUFBQUEsT0FBTyxDQUFDSSxJQUFSLENBQWEsdUJBQWIsRUFBc0NGLENBQXRDO0FBQ0QsS0FKTSxDQUFQO0FBS0QsR0FqRU0sV0FpRUUsVUFBVUcsS0FBVixFQUFzQjtBQUM3QkwsSUFBQUEsT0FBTyxDQUFDSSxJQUFSLENBQWEsbUJBQWI7QUFDQSxVQUFNQyxLQUFOO0FBQ0QsR0FwRU0sQ0FBUDtBQXFFRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY3JpcHRqcyBmcm9tICdzY3JpcHRqcyc7XG5pbXBvcnQgeyBsb2FkQ1NTIH0gZnJvbSAnZmctbG9hZGNzcyc7XG5pbXBvcnQgY2FtZWxDYXNlIGZyb20gJ2NhbWVsY2FzZSc7XG5pbXBvcnQgTXVybXVySGFzaDMgZnJvbSAnaW11cm11cmhhc2gnO1xuLy8gaW1wb3J0IHsgUmVxdWlyZSwgUGFyc2VNb2R1bGVEYXRhIH0gZnJvbSAnLi9NYWluJztcbmV4cG9ydCAqIGZyb20gJy4vTWFpbic7XG5cbmRlY2xhcmUgdmFyIHdpbmRvdzogV2luZG93LCBnbG9iYWw6IGFueTtcbnZhciBnID0gdHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsO1xuXG5leHBvcnQgdHlwZSBEZXBUeXBlID0ge1xuICB0eXBlOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZztcbiAgZW5mb3JjZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIERlcHMgPSB7XG4gIFtuYW1lOiBzdHJpbmddOiBEZXBUeXBlO1xufVxuXG5leHBvcnQgdHlwZSBKU09OT3B0ID0ge1xuICB0aW1lb3V0PzogbnVtYmVyO1xuICBjYktleT86IHN0cmluZztcbiAgY2JWYWw/OiBzdHJpbmc7XG59XG5cbi8qISBvbmxvYWRDU1MuIChvbmxvYWQgY2FsbGJhY2sgZm9yIGxvYWRDU1MpIFtjXTIwMTcgRmlsYW1lbnQgR3JvdXAsIEluYy4gTUlUIExpY2Vuc2UgKi9cbi8qIGdsb2JhbCBuYXZpZ2F0b3IgKi9cbi8qIGV4cG9ydGVkIG9ubG9hZENTUyAqL1xuZnVuY3Rpb24gb25sb2FkQ1NTKHNzOiBhbnksIGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xuICBsZXQgY2FsbGVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICBmdW5jdGlvbiBuZXdjYigpIHtcbiAgICBpZiAoIWNhbGxlZCAmJiBjYWxsYmFjaykge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIGNhbGxiYWNrLmNhbGwoc3MpO1xuICAgIH1cbiAgfVxuICBpZiAoc3MuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHNzLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIG5ld2NiKTtcbiAgfVxuICBpZiAoc3MuYXR0YWNoRXZlbnQpIHtcbiAgICBzcy5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBuZXdjYik7XG4gIH1cblxuICAvLyBUaGlzIGNvZGUgaXMgZm9yIGJyb3dzZXJzIHRoYXQgZG9u4oCZdCBzdXBwb3J0IG9ubG9hZFxuICAvLyBObyBzdXBwb3J0IGZvciBvbmxvYWQgKGl0J2xsIGJpbmQgYnV0IG5ldmVyIGZpcmUpOlxuICAvL1x0KiBBbmRyb2lkIDQuMyAoU2Ftc3VuZyBHYWxheHkgUzQsIEJyb3dzZXJzdGFjaylcbiAgLy9cdCogQW5kcm9pZCA0LjIgQnJvd3NlciAoU2Ftc3VuZyBHYWxheHkgU0lJSSBNaW5pIEdULUk4MjAwTClcbiAgLy9cdCogQW5kcm9pZCAyLjMgKFBhbnRlY2ggQnVyc3QgUDkwNzApXG5cbiAgLy8gV2VhayBpbmZlcmVuY2UgdGFyZ2V0cyBBbmRyb2lkIDwgNC40XG4gIGlmIChcImlzQXBwbGljYXRpb25JbnN0YWxsZWRcIiBpbiBuYXZpZ2F0b3IgJiYgXCJvbmxvYWRjc3NkZWZpbmVkXCIgaW4gc3MpIHtcbiAgICBzcy5vbmxvYWRjc3NkZWZpbmVkKG5ld2NiKTtcbiAgfVxufVxuXG5cbmNvbnN0IGpzb25wID0gKHVybDogc3RyaW5nLCBvcHQ6IEpTT05PcHQgPSB7fSwgZm4/OiBGdW5jdGlvbikgPT4ge1xuXG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG5cbiAgbGV0IHsgdGltZW91dCA9IG51bGwsIGNiS2V5ID0gJ2NhbGxiYWNrJywgY2JWYWwgPSAnZmVuZ3l1JyB9ID0gb3B0XG4gIGxldCB0aW1lcjogbnVtYmVyO1xuXG4gIGlmIChjYlZhbCA9PT0gJ2Zlbmd5dScpIHtcbiAgICBjYlZhbCArPSBEYXRlLm5vdygpXG4gIH1cblxuICBsZXQgcyA9ICcnXG4gIHMgKz0gYCYke2NiS2V5fT0ke2NiVmFsfWBcblxuICBzID0gcy5zbGljZSgxKVxuXG4gIHVybCArPSAofnVybC5pbmRleE9mKCc/JykgPyAnJicgOiAnPycpICsgc1xuXG4gIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuXG4gIHZhciByZW1vdmUgPSAoKSA9PiB7XG4gICAgdGltZXIgJiYgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQoc2NyaXB0KVxuICAgIGdbY2JWYWxdID0gdW5kZWZpbmVkXG4gIH1cblxuICBzY3JpcHQuc3JjID0gdXJsXG5cblxuICBpZiAoZm4gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBnW2NiVmFsXSA9IChkYXRhOiBhbnkpID0+IHtcbiAgICAgIGZuKGRhdGEpXG4gICAgICByZW1vdmUoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICAgIHJldHVyblxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiAoYXJnMDogYW55KSA9PiB2b2lkLCByZWplY3Q6IChhcmcwOiBFcnJvcikgPT4gdm9pZCkgPT4ge1xuICAgIC8vIOivt+axgui2heaXtlxuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdqc29ucCByZXF1ZXN0IHRpbWVvdXQnKSlcbiAgICAgICAgcmVtb3ZlKClcbiAgICAgIH0sIHRpbWVvdXQpXG4gICAgfVxuICAgIC8vIOato+W4uFxuICAgIGdbY2JWYWxdID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldEJsdXJWZXJzaW9uKHZlcnNpb246IHN0cmluZykge1xuICByZXR1cm4gdmVyc2lvbi5zcGxpdCgnLicpLm1hcCgodiwgaSkgPT4gaSA+IDAgPyAneCcgOiB2KS5qb2luKCcuJyk7XG59XG4vLyBjb25zdCBfcmVxdWlyZV8gPSBnLndlYnBhY2tEYXRhO1xuLy8gZy53ZWJwYWNrRGF0YSA9IGZ1bmN0aW9uKG1vZHVsZUlkOiBhbnkpIHtcbi8vICAgY29uc3QgbW9kdWxlID0gX3JlcXVpcmVfLm1bbW9kdWxlSWRdIGFzIEZ1bmN0aW9uO1xuLy8gICBpZiAoIW1vZHVsZSkge1xuLy8gICAgIGNvbnNvbGUud2Fybihtb2R1bGVJZCwgJ2NhbiBub3QgYmUgZm91bmRlZCwgY2hlY2sgY2h1bmsgaXMgY29tcGxldGlvbicpO1xuLy8gICAgIHJldHVybjtcbi8vICAgfVxuLy8gICByZXR1cm4gX3JlcXVpcmVfLmNhbGwodGhpcywgbW9kdWxlSWQpO1xuLy8gfVxuLy8gT2JqZWN0LmFzc2lnbihnLndlYnBhY2tEYXRhLCBfcmVxdWlyZV8pO1xuXG5leHBvcnQgZnVuY3Rpb24gRHluYW1pY1JlcXVpcmUobmFtZTogc3RyaW5nLCBiYXNlVXJsOiBzdHJpbmcsIGhhc2hlZDogYm9vbGVhbikge1xuICBpZiAoIW5hbWUgfHwgIWJhc2VVcmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0R5bmFtaWNSZXF1aXJlIG5hbWUgYW5kIGJhc2VVcmwgcGFyYW10ZXJzIG11c3Qgc2V0dGVkJyk7XG4gIH1cbiAgY29uc3QganNvbnBDYWxsYmFjayA9IGNhbWVsQ2FzZShuYW1lLnJlcGxhY2UoL0AvZywgJyQnKSkucmVwbGFjZSgvXFwvL2csICdfJyk7XG4gIGNvbnN0IGpzb25wVXJsID0gYCR7YmFzZVVybH0vanNvbnBtb2R1bGVzLmpzYDtcbiAgcmV0dXJuIGpzb25wKGpzb25wVXJsLCB7XG4gICAgY2JWYWw6IGpzb25wQ2FsbGJhY2tcbiAgfSkudGhlbihmdW5jdGlvbiAoYXJncykge1xuICAgIGNvbnN0IG1vZHVsZXM6IHN0cmluZ1tdID0gYXJnc1swXTtcbiAgICBjb25zdCBlbnRyeTogc3RyaW5nID0gYXJnc1sxXTtcbiAgICBsZXQgZW50cnlNb2R1bGVOYW1lID0gYCR7bmFtZX0vJHtlbnRyeX1gO1xuICAgIGlmIChoYXNoZWQpIHtcbiAgICAgIGNvbnN0IGhhc2hTdGF0ZSA9IG5ldyBNdXJtdXJIYXNoMygpO1xuICAgICAgaGFzaFN0YXRlLmhhc2goZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgIGVudHJ5TW9kdWxlTmFtZSA9IGhhc2hTdGF0ZS5yZXN1bHQoKS50b1N0cmluZygxNikuc3Vic3RyKDAsIDYpO1xuICAgIH1cbiAgICBpZiAoZy53ZWJwYWNrRGF0YS5jW2VudHJ5TW9kdWxlTmFtZV0pIHtcbiAgICAgIC8vIGlmIHdlYnBhY2sgZW5hYmxlIGhtciBhYm92ZSByZXR1cm4geyBjaGlsZHJlbiwgZXhwb3J0cywgaG90IC4uLn1cbiAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobW9kdWxlLmEgfHwgbW9kdWxlKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wb25lbnRDaHVua3MgPSAndmVuZG9yLmpzLGNvbXBvbmVudC5qcyc7XG4gICAgY29uc3QgY29tcG9uZW50Q3NzID0gJ2NvbXBvbmVudC5jc3MnO1xuICAgIGNvbnN0IG5lZWRDb21ib0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IG5lZWRDb21ib0Nzc0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgIG1vZHVsZXMuZm9yRWFjaCgoW21vZHVsZU5hbWUsIGNodW5rTmFtZSwgaXNDc3NdKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhLmNbbW9kdWxlTmFtZV07XG4gICAgICAvLyDlpoLmnpxtb2R1bGXkuI3lrZjlnKjvvIzmlL7liLBtb2R1bGXlr7nlupTnmoRjaHVua+WIsGNvbWJv5L+h5oGv6YeMXG4gICAgICBpZiAoIW1vZHVsZSAmJiBuZWVkQ29tYm9DaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgIG5lZWRDb21ib0NodW5rLnB1c2goY2h1bmtOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmICghbW9kdWxlICYmIGlzQ3NzICYmIG5lZWRDb21ib0Nzc0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgbmVlZENvbWJvQ3NzQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIOWFiOWKoOi9vWNzc1xuICAgIGxldCBzc1Byb21pc2U7XG4gICAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKTtcbiAgICBjb21ib0Nzc0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENzcyk7XG4gICAgY29uc3QgY29tYm9Dc3NVcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tYm9Dc3NDaHVua3Muam9pbigpfWA7XG4gICAgY29uc3Qgc3MgPSBsb2FkQ1NTKGNvbWJvQ3NzVXJsKTtcbiAgICBzc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBvbmxvYWRDU1Moc3MsICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSk7XG4gICAgICBzZXRUaW1lb3V0KHJlamVjdCwgNTAwMCk7XG4gICAgfSk7XG5cbiAgICAvLyDlubbooYzliqDovb1qc1xuICAgIGxldCBqc1Byb21pc2U7XG4gICAgY29uc3QgY29tYm9DaHVua3MgPSBuZWVkQ29tYm9DaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5qc2ApXG4gICAgY29tYm9DaHVua3MudW5zaGlmdChjb21wb25lbnRDaHVua3MpOyAvLyDooaXkuIrlv4XpobvnmoTnu4Tku7botYTmupBcbiAgICBjb25zdCBjb21ib1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21ib0NodW5rcy5qb2luKCl9YDtcbiAgICBqc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBTY3JpcHRqcyhjb21ib1VybCwgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIGNvbWJvIGpzIGRvbmUnLCBuYW1lKTtcbiAgICAgICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICAgICAgcmVzb2x2ZShtb2R1bGUuYSB8fCBtb2R1bGUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3NzUHJvbWlzZSwganNQcm9taXNlXSkudGhlbigoW3NzLCBtb2R1bGVdKSA9PiB7XG4gICAgICByZXR1cm4gbW9kdWxlO1xuICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgY29uc29sZS53YXJuKCdib290bG9hZCBtb2R1bGUgZXJyb3InLCBlKTtcbiAgICB9KVxuICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUud2FybignbG9hZCByZW1vdGUgZXJyb3InKTtcbiAgICB0aHJvdyBlcnJvclxuICB9KVxufSJdfQ==
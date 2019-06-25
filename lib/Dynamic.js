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

    if (needComboCssChunk && needComboCssChunk.length) {
      var comboCssChunks = needComboCssChunk.map(function (chunkName) {
        return "deps/".concat(chunkName, ".css");
      }).join();
      var comboCssUrl = "".concat(baseUrl, "/??").concat(componentCss, ",").concat(comboCssChunks);
      (0, _fgLoadcss.loadCSS)(comboCssUrl);
    }

    if (needComboChunk && needComboChunk.length) {
      var comboChunks = needComboChunk.map(function (chunkName) {
        return "deps/".concat(chunkName, ".js");
      }).join();
      var comboUrl = "".concat(baseUrl, "/??").concat(componentChunks, ",").concat(comboChunks);
      return new Promise(function (resolve, reject) {
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
    }
  })["catch"](function (error) {
    console.warn('load remote error');
    throw error;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJqc29ucCIsInVybCIsIm9wdCIsImZuIiwidGltZW91dCIsImNiS2V5IiwiY2JWYWwiLCJ0aW1lciIsIkRhdGUiLCJub3ciLCJzIiwic2xpY2UiLCJpbmRleE9mIiwic2NyaXB0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicmVtb3ZlIiwiY2xlYXJUaW1lb3V0IiwiaGVhZCIsInJlbW92ZUNoaWxkIiwidW5kZWZpbmVkIiwic3JjIiwiZGF0YSIsImFwcGVuZENoaWxkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJhcmdzIiwiZ2V0Qmx1clZlcnNpb24iLCJ2ZXJzaW9uIiwic3BsaXQiLCJtYXAiLCJ2IiwiaSIsImpvaW4iLCJEeW5hbWljUmVxdWlyZSIsIm5hbWUiLCJiYXNlVXJsIiwiaGFzaGVkIiwianNvbnBDYWxsYmFjayIsInJlcGxhY2UiLCJqc29ucFVybCIsInRoZW4iLCJtb2R1bGVzIiwiZW50cnkiLCJlbnRyeU1vZHVsZU5hbWUiLCJoYXNoU3RhdGUiLCJNdXJtdXJIYXNoMyIsImhhc2giLCJyZXN1bHQiLCJ0b1N0cmluZyIsInN1YnN0ciIsIndlYnBhY2tEYXRhIiwiYyIsIm1vZHVsZSIsImEiLCJjb21wb25lbnRDaHVua3MiLCJjb21wb25lbnRDc3MiLCJuZWVkQ29tYm9DaHVuayIsIm5lZWRDb21ib0Nzc0NodW5rIiwiZm9yRWFjaCIsIm1vZHVsZU5hbWUiLCJjaHVua05hbWUiLCJpc0NzcyIsInB1c2giLCJsZW5ndGgiLCJjb21ib0Nzc0NodW5rcyIsImNvbWJvQ3NzVXJsIiwiY29tYm9DaHVua3MiLCJjb21ib1VybCIsImNvbnNvbGUiLCJsb2ciLCJlIiwiZXJyb3IiLCJ3YXJuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQUE7QUFB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LElBQUFBLE9BQU8sQ0FBQ0ksSUFBUixDQUFhLG1CQUFiO0FBQ0EsVUFBTUQsS0FBTjtBQUNELEdBdERNLENBQVA7QUF1REQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2NyaXB0anMgZnJvbSAnc2NyaXB0anMnO1xuaW1wb3J0IHsgbG9hZENTUyB9IGZyb20gJ2ZnLWxvYWRjc3MnO1xuaW1wb3J0IGNhbWVsQ2FzZSBmcm9tICdjYW1lbGNhc2UnO1xuaW1wb3J0IE11cm11ckhhc2gzIGZyb20gJ2ltdXJtdXJoYXNoJztcbi8vIGltcG9ydCB7IFJlcXVpcmUsIFBhcnNlTW9kdWxlRGF0YSB9IGZyb20gJy4vTWFpbic7XG5leHBvcnQgKiBmcm9tICcuL01haW4nO1xuXG5kZWNsYXJlIHZhciB3aW5kb3c6IFdpbmRvdywgZ2xvYmFsOiBhbnk7XG52YXIgZyA9IHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbDtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IHtcbiAgdHlwZTogc3RyaW5nO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGVuZm9yY2U6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBEZXBzID0ge1xuICBbbmFtZTogc3RyaW5nXTogRGVwVHlwZTtcbn1cblxuZXhwb3J0IHR5cGUgSlNPTk9wdCA9IHtcbiAgdGltZW91dD86IG51bWJlcjtcbiAgY2JLZXk/OiBzdHJpbmc7XG4gIGNiVmFsPzogc3RyaW5nO1xufVxuXG5cbmNvbnN0IGpzb25wID0gKHVybDogc3RyaW5nLCBvcHQ6IEpTT05PcHQgPSB7fSwgZm4/OiBGdW5jdGlvbikgPT4ge1xuXG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG5cbiAgbGV0IHsgdGltZW91dCA9IG51bGwsIGNiS2V5ID0gJ2NhbGxiYWNrJywgY2JWYWwgPSAnZmVuZ3l1JyB9ID0gb3B0XG4gIGxldCB0aW1lcjogbnVtYmVyO1xuXG4gIGlmIChjYlZhbCA9PT0gJ2Zlbmd5dScpIHtcbiAgICBjYlZhbCArPSBEYXRlLm5vdygpXG4gIH1cblxuICBsZXQgcyA9ICcnXG4gIHMgKz0gYCYke2NiS2V5fT0ke2NiVmFsfWBcblxuICBzID0gcy5zbGljZSgxKVxuXG4gIHVybCArPSAofnVybC5pbmRleE9mKCc/JykgPyAnJicgOiAnPycpICsgc1xuXG4gIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuXG4gIHZhciByZW1vdmUgPSAoKSA9PiB7XG4gICAgdGltZXIgJiYgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQoc2NyaXB0KVxuICAgIGdbY2JWYWxdID0gdW5kZWZpbmVkXG4gIH1cblxuICBzY3JpcHQuc3JjID0gdXJsXG5cblxuICBpZiAoZm4gIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBnW2NiVmFsXSA9IChkYXRhOiBhbnkpID0+IHtcbiAgICAgIGZuKGRhdGEpXG4gICAgICByZW1vdmUoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICAgIHJldHVyblxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiAoYXJnMDogYW55KSA9PiB2b2lkLCByZWplY3Q6IChhcmcwOiBFcnJvcikgPT4gdm9pZCkgPT4ge1xuICAgIC8vIOivt+axgui2heaXtlxuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdqc29ucCByZXF1ZXN0IHRpbWVvdXQnKSlcbiAgICAgICAgcmVtb3ZlKClcbiAgICAgIH0sIHRpbWVvdXQpXG4gICAgfVxuICAgIC8vIOato+W4uFxuICAgIGdbY2JWYWxdID0gKC4uLmFyZ3M6IGFueSkgPT4ge1xuICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldEJsdXJWZXJzaW9uKHZlcnNpb246c3RyaW5nKSB7XG4gIHJldHVybiB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKCh2LCBpKSA9PiBpID4gMCA/ICd4JyA6IHYpLmpvaW4oJy4nKTtcbn1cbi8vIGNvbnN0IF9yZXF1aXJlXyA9IGcud2VicGFja0RhdGE7XG4vLyBnLndlYnBhY2tEYXRhID0gZnVuY3Rpb24obW9kdWxlSWQ6IGFueSkge1xuLy8gICBjb25zdCBtb2R1bGUgPSBfcmVxdWlyZV8ubVttb2R1bGVJZF0gYXMgRnVuY3Rpb247XG4vLyAgIGlmICghbW9kdWxlKSB7XG4vLyAgICAgY29uc29sZS53YXJuKG1vZHVsZUlkLCAnY2FuIG5vdCBiZSBmb3VuZGVkLCBjaGVjayBjaHVuayBpcyBjb21wbGV0aW9uJyk7XG4vLyAgICAgcmV0dXJuO1xuLy8gICB9XG4vLyAgIHJldHVybiBfcmVxdWlyZV8uY2FsbCh0aGlzLCBtb2R1bGVJZCk7XG4vLyB9XG4vLyBPYmplY3QuYXNzaWduKGcud2VicGFja0RhdGEsIF9yZXF1aXJlXyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBEeW5hbWljUmVxdWlyZShuYW1lOiBzdHJpbmcsIGJhc2VVcmw6IHN0cmluZywgaGFzaGVkOiBib29sZWFuKSB7XG4gIGlmICghbmFtZSB8fCAhYmFzZVVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRHluYW1pY1JlcXVpcmUgbmFtZSBhbmQgYmFzZVVybCBwYXJhbXRlcnMgbXVzdCBzZXR0ZWQnKTtcbiAgfVxuICBjb25zdCBqc29ucENhbGxiYWNrID0gY2FtZWxDYXNlKG5hbWUucmVwbGFjZSgvQC9nLCAnJCcpKS5yZXBsYWNlKC9cXC8vZywgJ18nKTtcbiAgY29uc3QganNvbnBVcmwgPSBgJHtiYXNlVXJsfS9qc29ucG1vZHVsZXMuanNgO1xuICByZXR1cm4ganNvbnAoanNvbnBVcmwsIHtcbiAgICBjYlZhbDoganNvbnBDYWxsYmFja1xuICB9KS50aGVuKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBjb25zdCBtb2R1bGVzOiBzdHJpbmdbXSA9IGFyZ3NbMF07XG4gICAgY29uc3QgZW50cnk6IHN0cmluZyA9IGFyZ3NbMV07XG4gICAgbGV0IGVudHJ5TW9kdWxlTmFtZSA9IGAke25hbWV9LyR7ZW50cnl9YDtcbiAgICBpZiAoaGFzaGVkKSB7XG4gICAgICBjb25zdCBoYXNoU3RhdGUgPSBuZXcgTXVybXVySGFzaDMoKTtcbiAgICAgIGhhc2hTdGF0ZS5oYXNoKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICBlbnRyeU1vZHVsZU5hbWUgPSBoYXNoU3RhdGUucmVzdWx0KCkudG9TdHJpbmcoMTYpLnN1YnN0cigwLCA2KTtcbiAgICB9XG4gICAgaWYgKGcud2VicGFja0RhdGEuY1tlbnRyeU1vZHVsZU5hbWVdKSB7XG4gICAgICAvLyBpZiB3ZWJwYWNrIGVuYWJsZSBobXIgYWJvdmUgcmV0dXJuIHsgY2hpbGRyZW4sIGV4cG9ydHMsIGhvdCAuLi59XG4gICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgfVxuICAgIGNvbnN0IGNvbXBvbmVudENodW5rcyA9ICd2ZW5kb3IuanMsY29tcG9uZW50LmpzJztcbiAgICBjb25zdCBjb21wb25lbnRDc3MgPSAnY29tcG9uZW50LmNzcyc7XG4gICAgY29uc3QgbmVlZENvbWJvQ2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgbW9kdWxlcy5mb3JFYWNoKChbbW9kdWxlTmFtZSwgY2h1bmtOYW1lLCBpc0Nzc10pID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEuY1ttb2R1bGVOYW1lXTtcbiAgICAgIC8vIOWmguaenG1vZHVsZeS4jeWtmOWcqO+8jOaUvuWIsG1vZHVsZeWvueW6lOeahGNodW5r5YiwY29tYm/kv6Hmga/ph4xcbiAgICAgIGlmICghbW9kdWxlICYmIG5lZWRDb21ib0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgbmVlZENvbWJvQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgfVxuICAgICAgaWYgKCFtb2R1bGUgJiYgaXNDc3MgJiYgbmVlZENvbWJvQ3NzQ2h1bmsuaW5kZXhPZihjaHVua05hbWUpID09PSAtMSkge1xuICAgICAgICBuZWVkQ29tYm9Dc3NDaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8g5YWI5Yqg6L29Y3NzXG4gICAgaWYgKG5lZWRDb21ib0Nzc0NodW5rICYmIG5lZWRDb21ib0Nzc0NodW5rLmxlbmd0aCkge1xuICAgICAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKS5qb2luKCk7XG4gICAgICBjb25zdCBjb21ib0Nzc1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21wb25lbnRDc3N9LCR7Y29tYm9Dc3NDaHVua3N9YDtcbiAgICAgIGxvYWRDU1MoY29tYm9Dc3NVcmwpO1xuICAgIH1cbiAgICBpZiAobmVlZENvbWJvQ2h1bmsgJiYgbmVlZENvbWJvQ2h1bmsubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjb21ib0NodW5rcyA9IG5lZWRDb21ib0NodW5rLm1hcChjaHVua05hbWUgPT4gYGRlcHMvJHtjaHVua05hbWV9LmpzYCkuam9pbigpO1xuICAgICAgY29uc3QgY29tYm9VcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tcG9uZW50Q2h1bmtzfSwke2NvbWJvQ2h1bmtzfWA7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBTY3JpcHRqcyhjb21ib1VybCwgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZCBjb21ibyBqcyBkb25lJywgbmFtZSk7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICAgICAgICByZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUud2FybignbG9hZCByZW1vdGUgZXJyb3InKTtcbiAgICB0aHJvdyBlcnJvclxuICB9KVxufSJdfQ==
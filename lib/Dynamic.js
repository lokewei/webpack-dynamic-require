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
      return Promise.resolve(g.webpackData.c[entryModuleName]);
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
            var module = g.webpackData(entryModuleName);
            resolve(module.a || module);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJqc29ucCIsInVybCIsIm9wdCIsImZuIiwidGltZW91dCIsImNiS2V5IiwiY2JWYWwiLCJ0aW1lciIsIkRhdGUiLCJub3ciLCJzIiwic2xpY2UiLCJpbmRleE9mIiwic2NyaXB0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicmVtb3ZlIiwiY2xlYXJUaW1lb3V0IiwiaGVhZCIsInJlbW92ZUNoaWxkIiwidW5kZWZpbmVkIiwic3JjIiwiZGF0YSIsImFwcGVuZENoaWxkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJhcmdzIiwiZ2V0Qmx1clZlcnNpb24iLCJ2ZXJzaW9uIiwic3BsaXQiLCJtYXAiLCJ2IiwiaSIsImpvaW4iLCJEeW5hbWljUmVxdWlyZSIsIm5hbWUiLCJiYXNlVXJsIiwiaGFzaGVkIiwianNvbnBDYWxsYmFjayIsInJlcGxhY2UiLCJqc29ucFVybCIsInRoZW4iLCJtb2R1bGVzIiwiZW50cnkiLCJlbnRyeU1vZHVsZU5hbWUiLCJoYXNoU3RhdGUiLCJNdXJtdXJIYXNoMyIsImhhc2giLCJyZXN1bHQiLCJ0b1N0cmluZyIsInN1YnN0ciIsIndlYnBhY2tEYXRhIiwiYyIsImNvbXBvbmVudENodW5rcyIsImNvbXBvbmVudENzcyIsIm5lZWRDb21ib0NodW5rIiwibmVlZENvbWJvQ3NzQ2h1bmsiLCJmb3JFYWNoIiwibW9kdWxlTmFtZSIsImNodW5rTmFtZSIsImlzQ3NzIiwibW9kdWxlIiwicHVzaCIsImxlbmd0aCIsImNvbWJvQ3NzQ2h1bmtzIiwiY29tYm9Dc3NVcmwiLCJjb21ib0NodW5rcyIsImNvbWJvVXJsIiwiY29uc29sZSIsImxvZyIsImEiLCJlIiwiZXJyb3IiLCJ3YXJuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQUE7QUFB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QU47QUFDRCxHQXBETSxDQUFQO0FBcUREIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjcmlwdGpzIGZyb20gJ3NjcmlwdGpzJztcbmltcG9ydCB7IGxvYWRDU1MgfSBmcm9tICdmZy1sb2FkY3NzJztcbmltcG9ydCBjYW1lbENhc2UgZnJvbSAnY2FtZWxjYXNlJztcbmltcG9ydCBNdXJtdXJIYXNoMyBmcm9tICdpbXVybXVyaGFzaCc7XG4vLyBpbXBvcnQgeyBSZXF1aXJlLCBQYXJzZU1vZHVsZURhdGEgfSBmcm9tICcuL01haW4nO1xuZXhwb3J0ICogZnJvbSAnLi9NYWluJztcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5cbmV4cG9ydCB0eXBlIERlcFR5cGUgPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBlbmZvcmNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRGVwcyA9IHtcbiAgW25hbWU6IHN0cmluZ106IERlcFR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIEpTT05PcHQgPSB7XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIGNiS2V5Pzogc3RyaW5nO1xuICBjYlZhbD86IHN0cmluZztcbn1cblxuXG5jb25zdCBqc29ucCA9ICh1cmw6IHN0cmluZywgb3B0OiBKU09OT3B0ID0ge30sIGZuPzogRnVuY3Rpb24pID0+IHtcblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gb3B0XG4gICAgb3B0ID0ge31cbiAgfVxuXG4gIGxldCB7IHRpbWVvdXQgPSBudWxsLCBjYktleSA9ICdjYWxsYmFjaycsIGNiVmFsID0gJ2Zlbmd5dScgfSA9IG9wdFxuICBsZXQgdGltZXI6IG51bWJlcjtcblxuICBpZiAoY2JWYWwgPT09ICdmZW5neXUnKSB7XG4gICAgY2JWYWwgKz0gRGF0ZS5ub3coKVxuICB9XG5cbiAgbGV0IHMgPSAnJ1xuICBzICs9IGAmJHtjYktleX09JHtjYlZhbH1gXG5cbiAgcyA9IHMuc2xpY2UoMSlcblxuICB1cmwgKz0gKH51cmwuaW5kZXhPZignPycpID8gJyYnIDogJz8nKSArIHNcblxuICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcblxuICB2YXIgcmVtb3ZlID0gKCkgPT4ge1xuICAgIHRpbWVyICYmIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHNjcmlwdClcbiAgICBnW2NiVmFsXSA9IHVuZGVmaW5lZFxuICB9XG5cbiAgc2NyaXB0LnNyYyA9IHVybFxuXG5cbiAgaWYgKGZuICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZ1tjYlZhbF0gPSAoZGF0YTogYW55KSA9PiB7XG4gICAgICBmbihkYXRhKVxuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgICByZXR1cm5cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogKGFyZzA6IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAoYXJnMDogRXJyb3IpID0+IHZvaWQpID0+IHtcbiAgICAvLyDor7fmsYLotoXml7ZcbiAgICBpZiAodGltZW91dCkge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignanNvbnAgcmVxdWVzdCB0aW1lb3V0JykpXG4gICAgICAgIHJlbW92ZSgpXG4gICAgICB9LCB0aW1lb3V0KVxuICAgIH1cbiAgICAvLyDmraPluLhcbiAgICBnW2NiVmFsXSA9ICguLi5hcmdzOiBhbnkpID0+IHtcbiAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICByZW1vdmUoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5mdW5jdGlvbiBnZXRCbHVyVmVyc2lvbih2ZXJzaW9uOnN0cmluZykge1xuICByZXR1cm4gdmVyc2lvbi5zcGxpdCgnLicpLm1hcCgodiwgaSkgPT4gaSA+IDAgPyAneCcgOiB2KS5qb2luKCcuJyk7XG59XG4vLyBjb25zdCBfcmVxdWlyZV8gPSBnLndlYnBhY2tEYXRhO1xuLy8gZy53ZWJwYWNrRGF0YSA9IGZ1bmN0aW9uKG1vZHVsZUlkOiBhbnkpIHtcbi8vICAgY29uc3QgbW9kdWxlID0gX3JlcXVpcmVfLm1bbW9kdWxlSWRdIGFzIEZ1bmN0aW9uO1xuLy8gICBpZiAoIW1vZHVsZSkge1xuLy8gICAgIGNvbnNvbGUud2Fybihtb2R1bGVJZCwgJ2NhbiBub3QgYmUgZm91bmRlZCwgY2hlY2sgY2h1bmsgaXMgY29tcGxldGlvbicpO1xuLy8gICAgIHJldHVybjtcbi8vICAgfVxuLy8gICByZXR1cm4gX3JlcXVpcmVfLmNhbGwodGhpcywgbW9kdWxlSWQpO1xuLy8gfVxuLy8gT2JqZWN0LmFzc2lnbihnLndlYnBhY2tEYXRhLCBfcmVxdWlyZV8pO1xuXG5leHBvcnQgZnVuY3Rpb24gRHluYW1pY1JlcXVpcmUobmFtZTogc3RyaW5nLCBiYXNlVXJsOiBzdHJpbmcsIGhhc2hlZDogYm9vbGVhbikge1xuICBpZiAoIW5hbWUgfHwgIWJhc2VVcmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0R5bmFtaWNSZXF1aXJlIG5hbWUgYW5kIGJhc2VVcmwgcGFyYW10ZXJzIG11c3Qgc2V0dGVkJyk7XG4gIH1cbiAgY29uc3QganNvbnBDYWxsYmFjayA9IGNhbWVsQ2FzZShuYW1lLnJlcGxhY2UoL0AvZywgJyQnKSkucmVwbGFjZSgvXFwvL2csICdfJyk7XG4gIGNvbnN0IGpzb25wVXJsID0gYCR7YmFzZVVybH0vanNvbnBtb2R1bGVzLmpzYDtcbiAgcmV0dXJuIGpzb25wKGpzb25wVXJsLCB7XG4gICAgY2JWYWw6IGpzb25wQ2FsbGJhY2tcbiAgfSkudGhlbihmdW5jdGlvbihhcmdzKSB7XG4gICAgY29uc3QgbW9kdWxlczogc3RyaW5nW10gPSBhcmdzWzBdO1xuICAgIGNvbnN0IGVudHJ5OiBzdHJpbmcgPSBhcmdzWzFdO1xuICAgIGxldCBlbnRyeU1vZHVsZU5hbWUgPSBgJHtuYW1lfS8ke2VudHJ5fWA7XG4gICAgaWYgKGhhc2hlZCkge1xuICAgICAgY29uc3QgaGFzaFN0YXRlID0gbmV3IE11cm11ckhhc2gzKCk7XG4gICAgICBoYXNoU3RhdGUuaGFzaChlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgZW50cnlNb2R1bGVOYW1lID0gaGFzaFN0YXRlLnJlc3VsdCgpLnRvU3RyaW5nKDE2KS5zdWJzdHIoMCwgNik7XG4gICAgfVxuICAgIGlmIChnLndlYnBhY2tEYXRhLmNbZW50cnlNb2R1bGVOYW1lXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShnLndlYnBhY2tEYXRhLmNbZW50cnlNb2R1bGVOYW1lXSk7XG4gICAgfVxuICAgIGNvbnN0IGNvbXBvbmVudENodW5rcyA9ICd2ZW5kb3IuanMsY29tcG9uZW50LmpzJztcbiAgICBjb25zdCBjb21wb25lbnRDc3MgPSAnY29tcG9uZW50LmNzcyc7XG4gICAgY29uc3QgbmVlZENvbWJvQ2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgbW9kdWxlcy5mb3JFYWNoKChbbW9kdWxlTmFtZSwgY2h1bmtOYW1lLCBpc0Nzc10pID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEuY1ttb2R1bGVOYW1lXTtcbiAgICAgIC8vIOWmguaenG1vZHVsZeS4jeWtmOWcqO+8jOaUvuWIsG1vZHVsZeWvueW6lOeahGNodW5r5YiwY29tYm/kv6Hmga/ph4xcbiAgICAgIGlmICghbW9kdWxlICYmIG5lZWRDb21ib0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgbmVlZENvbWJvQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgfVxuICAgICAgaWYgKCFtb2R1bGUgJiYgaXNDc3MgJiYgbmVlZENvbWJvQ3NzQ2h1bmsuaW5kZXhPZihjaHVua05hbWUpID09PSAtMSkge1xuICAgICAgICBuZWVkQ29tYm9Dc3NDaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8g5YWI5Yqg6L29Y3NzXG4gICAgaWYgKG5lZWRDb21ib0Nzc0NodW5rICYmIG5lZWRDb21ib0Nzc0NodW5rLmxlbmd0aCkge1xuICAgICAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKS5qb2luKCk7XG4gICAgICBjb25zdCBjb21ib0Nzc1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21wb25lbnRDc3N9LCR7Y29tYm9Dc3NDaHVua3N9YDtcbiAgICAgIGxvYWRDU1MoY29tYm9Dc3NVcmwpO1xuICAgIH1cbiAgICBpZiAobmVlZENvbWJvQ2h1bmsgJiYgbmVlZENvbWJvQ2h1bmsubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjb21ib0NodW5rcyA9IG5lZWRDb21ib0NodW5rLm1hcChjaHVua05hbWUgPT4gYGRlcHMvJHtjaHVua05hbWV9LmpzYCkuam9pbigpO1xuICAgICAgY29uc3QgY29tYm9VcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tcG9uZW50Q2h1bmtzfSwke2NvbWJvQ2h1bmtzfWA7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBTY3JpcHRqcyhjb21ib1VybCwgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZCBjb21ibyBqcyBkb25lJywgbmFtZSk7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICAgICAgICByZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUud2FybignbG9hZCByZW1vdGUgZXJyb3InKTtcbiAgICB0aHJvdyBlcnJvclxuICB9KVxufSJdfQ==
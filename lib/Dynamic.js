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
}

var _require_ = g.webpackData;

g.webpackData = function (moduleId) {
  var module = _require_.m[moduleId];

  if (!module) {
    console.warn(moduleId, 'can not be founded, check chunk is completion');
    return;
  }

  return _require_.call(this, moduleId);
};

Object.assign(g.webpackData, _require_);

function DynamicRequire(name, baseUrl, matcher) {
  if (!name || !baseUrl) {
    throw new Error('DynamicRequire name and baseUrl paramters must setted');
    return;
  }

  var jsonpCallback = (0, _camelcase["default"])(name.replace(/@/g, '$')).replace(/\//g, '_');
  var jsonpUrl = "".concat(baseUrl, "/jsonpmodules.js");
  return jsonp(jsonpUrl, {
    cbVal: jsonpCallback
  }).then(function (args) {
    var modules = args[0];
    var entry = args[1];
    var entryModuleName = "".concat(name, "/").concat(entry);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJqc29ucCIsInVybCIsIm9wdCIsImZuIiwidGltZW91dCIsImNiS2V5IiwiY2JWYWwiLCJ0aW1lciIsIkRhdGUiLCJub3ciLCJzIiwic2xpY2UiLCJpbmRleE9mIiwic2NyaXB0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicmVtb3ZlIiwiY2xlYXJUaW1lb3V0IiwiaGVhZCIsInJlbW92ZUNoaWxkIiwidW5kZWZpbmVkIiwic3JjIiwiZGF0YSIsImFwcGVuZENoaWxkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJhcmdzIiwiZ2V0Qmx1clZlcnNpb24iLCJ2ZXJzaW9uIiwic3BsaXQiLCJtYXAiLCJ2IiwiaSIsImpvaW4iLCJfcmVxdWlyZV8iLCJ3ZWJwYWNrRGF0YSIsIm1vZHVsZUlkIiwibW9kdWxlIiwibSIsImNvbnNvbGUiLCJ3YXJuIiwiY2FsbCIsIk9iamVjdCIsImFzc2lnbiIsIkR5bmFtaWNSZXF1aXJlIiwibmFtZSIsImJhc2VVcmwiLCJtYXRjaGVyIiwianNvbnBDYWxsYmFjayIsInJlcGxhY2UiLCJqc29ucFVybCIsInRoZW4iLCJtb2R1bGVzIiwiZW50cnkiLCJlbnRyeU1vZHVsZU5hbWUiLCJjIiwiY29tcG9uZW50Q2h1bmtzIiwiY29tcG9uZW50Q3NzIiwibmVlZENvbWJvQ2h1bmsiLCJuZWVkQ29tYm9Dc3NDaHVuayIsImZvckVhY2giLCJtb2R1bGVOYW1lIiwiY2h1bmtOYW1lIiwiaXNDc3MiLCJwdXNoIiwibGVuZ3RoIiwiY29tYm9Dc3NDaHVua3MiLCJjb21ib0Nzc1VybCIsImNvbWJvQ2h1bmtzIiwiY29tYm9VcmwiLCJsb2ciLCJhIiwiZSIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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LENBQVA7QUFXRDtBQUNGLEdBNUNNLFdBNENFLFVBQVNDLEtBQVQsRUFBcUI7QUFDNUJsQyxJQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxtQkFBYjtBQUNBLFVBQU1pQyxLQUFOO0FBQ0QsR0EvQ00sQ0FBUDtBQWdERCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY3JpcHRqcyBmcm9tICdzY3JpcHRqcyc7XG5pbXBvcnQgeyBsb2FkQ1NTIH0gZnJvbSAnZmctbG9hZGNzcyc7XG5pbXBvcnQgY2FtZWxDYXNlIGZyb20gJ2NhbWVsY2FzZSc7XG4vLyBpbXBvcnQgeyBSZXF1aXJlLCBQYXJzZU1vZHVsZURhdGEgfSBmcm9tICcuL01haW4nO1xuZXhwb3J0ICogZnJvbSAnLi9NYWluJztcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5cbmV4cG9ydCB0eXBlIERlcFR5cGUgPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBlbmZvcmNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRGVwcyA9IHtcbiAgW25hbWU6IHN0cmluZ106IERlcFR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIEpTT05PcHQgPSB7XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIGNiS2V5Pzogc3RyaW5nO1xuICBjYlZhbD86IHN0cmluZztcbn1cblxuXG5jb25zdCBqc29ucCA9ICh1cmw6IHN0cmluZywgb3B0OiBKU09OT3B0ID0ge30sIGZuPzogRnVuY3Rpb24pID0+IHtcblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gb3B0XG4gICAgb3B0ID0ge31cbiAgfVxuXG4gIGxldCB7IHRpbWVvdXQgPSBudWxsLCBjYktleSA9ICdjYWxsYmFjaycsIGNiVmFsID0gJ2Zlbmd5dScgfSA9IG9wdFxuICBsZXQgdGltZXI6IG51bWJlcjtcblxuICBpZiAoY2JWYWwgPT09ICdmZW5neXUnKSB7XG4gICAgY2JWYWwgKz0gRGF0ZS5ub3coKVxuICB9XG5cbiAgbGV0IHMgPSAnJ1xuICBzICs9IGAmJHtjYktleX09JHtjYlZhbH1gXG5cbiAgcyA9IHMuc2xpY2UoMSlcblxuICB1cmwgKz0gKH51cmwuaW5kZXhPZignPycpID8gJyYnIDogJz8nKSArIHNcblxuICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcblxuICB2YXIgcmVtb3ZlID0gKCkgPT4ge1xuICAgIHRpbWVyICYmIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHNjcmlwdClcbiAgICBnW2NiVmFsXSA9IHVuZGVmaW5lZFxuICB9XG5cbiAgc2NyaXB0LnNyYyA9IHVybFxuXG5cbiAgaWYgKGZuICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZ1tjYlZhbF0gPSAoZGF0YTogYW55KSA9PiB7XG4gICAgICBmbihkYXRhKVxuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgICByZXR1cm5cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogKGFyZzA6IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAoYXJnMDogRXJyb3IpID0+IHZvaWQpID0+IHtcbiAgICAvLyDor7fmsYLotoXml7ZcbiAgICBpZiAodGltZW91dCkge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignanNvbnAgcmVxdWVzdCB0aW1lb3V0JykpXG4gICAgICAgIHJlbW92ZSgpXG4gICAgICB9LCB0aW1lb3V0KVxuICAgIH1cbiAgICAvLyDmraPluLhcbiAgICBnW2NiVmFsXSA9ICguLi5hcmdzOiBhbnkpID0+IHtcbiAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICByZW1vdmUoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5mdW5jdGlvbiBnZXRCbHVyVmVyc2lvbih2ZXJzaW9uOnN0cmluZykge1xuICByZXR1cm4gdmVyc2lvbi5zcGxpdCgnLicpLm1hcCgodiwgaSkgPT4gaSA+IDAgPyAneCcgOiB2KS5qb2luKCcuJyk7XG59XG5jb25zdCBfcmVxdWlyZV8gPSBnLndlYnBhY2tEYXRhO1xuZy53ZWJwYWNrRGF0YSA9IGZ1bmN0aW9uKG1vZHVsZUlkOiBhbnkpIHtcbiAgY29uc3QgbW9kdWxlID0gX3JlcXVpcmVfLm1bbW9kdWxlSWRdIGFzIEZ1bmN0aW9uO1xuICBpZiAoIW1vZHVsZSkge1xuICAgIGNvbnNvbGUud2Fybihtb2R1bGVJZCwgJ2NhbiBub3QgYmUgZm91bmRlZCwgY2hlY2sgY2h1bmsgaXMgY29tcGxldGlvbicpO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gX3JlcXVpcmVfLmNhbGwodGhpcywgbW9kdWxlSWQpO1xufVxuT2JqZWN0LmFzc2lnbihnLndlYnBhY2tEYXRhLCBfcmVxdWlyZV8pO1xuXG5leHBvcnQgZnVuY3Rpb24gRHluYW1pY1JlcXVpcmUobmFtZTogc3RyaW5nLCBiYXNlVXJsOiBzdHJpbmcsIG1hdGNoZXI6IEZ1bmN0aW9uIHwgUmVnRXhwKSB7XG4gIGlmICghbmFtZSB8fCAhYmFzZVVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRHluYW1pY1JlcXVpcmUgbmFtZSBhbmQgYmFzZVVybCBwYXJhbXRlcnMgbXVzdCBzZXR0ZWQnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QganNvbnBDYWxsYmFjayA9IGNhbWVsQ2FzZShuYW1lLnJlcGxhY2UoL0AvZywgJyQnKSkucmVwbGFjZSgvXFwvL2csICdfJyk7XG4gIGNvbnN0IGpzb25wVXJsID0gYCR7YmFzZVVybH0vanNvbnBtb2R1bGVzLmpzYDtcbiAgcmV0dXJuIGpzb25wKGpzb25wVXJsLCB7XG4gICAgY2JWYWw6IGpzb25wQ2FsbGJhY2tcbiAgfSkudGhlbihmdW5jdGlvbihhcmdzKSB7XG4gICAgY29uc3QgbW9kdWxlczogc3RyaW5nW10gPSBhcmdzWzBdO1xuICAgIGNvbnN0IGVudHJ5OiBzdHJpbmcgPSBhcmdzWzFdO1xuICAgIGNvbnN0IGVudHJ5TW9kdWxlTmFtZSA9IGAke25hbWV9LyR7ZW50cnl9YDtcbiAgICBpZiAoZy53ZWJwYWNrRGF0YS5jW2VudHJ5TW9kdWxlTmFtZV0pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZy53ZWJwYWNrRGF0YS5jW2VudHJ5TW9kdWxlTmFtZV0pO1xuICAgIH1cbiAgICBjb25zdCBjb21wb25lbnRDaHVua3MgPSAndmVuZG9yLmpzLGNvbXBvbmVudC5qcyc7XG4gICAgY29uc3QgY29tcG9uZW50Q3NzID0gJ2NvbXBvbmVudC5jc3MnO1xuICAgIGNvbnN0IG5lZWRDb21ib0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IG5lZWRDb21ib0Nzc0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgIG1vZHVsZXMuZm9yRWFjaCgoW21vZHVsZU5hbWUsIGNodW5rTmFtZSwgaXNDc3NdKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGUgPSBnLndlYnBhY2tEYXRhLmNbbW9kdWxlTmFtZV07XG4gICAgICAvLyDlpoLmnpxtb2R1bGXkuI3lrZjlnKjvvIzmlL7liLBtb2R1bGXlr7nlupTnmoRjaHVua+WIsGNvbWJv5L+h5oGv6YeMXG4gICAgICBpZiAoIW1vZHVsZSAmJiBuZWVkQ29tYm9DaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgIG5lZWRDb21ib0NodW5rLnB1c2goY2h1bmtOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmICghbW9kdWxlICYmIGlzQ3NzICYmIG5lZWRDb21ib0Nzc0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgbmVlZENvbWJvQ3NzQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIOWFiOWKoOi9vWNzc1xuICAgIGlmIChuZWVkQ29tYm9Dc3NDaHVuayAmJiBuZWVkQ29tYm9Dc3NDaHVuay5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNvbWJvQ3NzQ2h1bmtzID0gbmVlZENvbWJvQ3NzQ2h1bmsubWFwKGNodW5rTmFtZSA9PiBgZGVwcy8ke2NodW5rTmFtZX0uY3NzYCkuam9pbigpO1xuICAgICAgY29uc3QgY29tYm9Dc3NVcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tcG9uZW50Q3NzfSwke2NvbWJvQ3NzQ2h1bmtzfWA7XG4gICAgICBsb2FkQ1NTKGNvbWJvQ3NzVXJsKTtcbiAgICB9XG4gICAgaWYgKG5lZWRDb21ib0NodW5rICYmIG5lZWRDb21ib0NodW5rLmxlbmd0aCkge1xuICAgICAgY29uc3QgY29tYm9DaHVua3MgPSBuZWVkQ29tYm9DaHVuay5tYXAoY2h1bmtOYW1lID0+IGBkZXBzLyR7Y2h1bmtOYW1lfS5qc2ApLmpvaW4oKTtcbiAgICAgIGNvbnN0IGNvbWJvVXJsID0gYCR7YmFzZVVybH0vPz8ke2NvbXBvbmVudENodW5rc30sJHtjb21ib0NodW5rc31gO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgU2NyaXB0anMoY29tYm9VcmwsICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWQgY29tYm8ganMgZG9uZScsIG5hbWUpO1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YShlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgICAgICAgcmVzb2x2ZShtb2R1bGUuYSB8fCBtb2R1bGUpO1xuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLndhcm4oJ2xvYWQgcmVtb3RlIGVycm9yJyk7XG4gICAgdGhyb3cgZXJyb3JcbiAgfSlcbn0iXX0=
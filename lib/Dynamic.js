"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {};
exports["default"] = void 0;

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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


function loadComponentCss(baseUrl, mainFile, styleId, needComboCssChunk, cssPrefix) {
  var componentCss = "".concat(cssPrefix).concat(mainFile, ".css");
  var comboCssChunks = needComboCssChunk.map(function (chunkName) {
    return "".concat(cssPrefix, "deps/").concat(chunkName, ".css");
  });
  comboCssChunks.unshift(componentCss);
  var comboCssUrl = "".concat(baseUrl, "/??").concat(comboCssChunks.join());
  return loadCSS(comboCssUrl).then(function (link) {
    link && link.setAttribute('id', styleId);
  });
}

var DynamicRequire =
/*#__PURE__*/
function () {
  function DynamicRequire(_ref) {
    var _this = this;

    var baseUrl = _ref.baseUrl,
        hashed = _ref.hashed,
        jsPrefix = _ref.jsPrefix,
        cssPrefix = _ref.cssPrefix,
        mainFile = _ref.mainFile;

    _classCallCheck(this, DynamicRequire);

    _defineProperty(this, "baseUrl", void 0);

    _defineProperty(this, "jsonpUrl", void 0);

    _defineProperty(this, "hashed", void 0);

    _defineProperty(this, "scriptId", void 0);

    _defineProperty(this, "styleId", void 0);

    _defineProperty(this, "jsPrefix", void 0);

    _defineProperty(this, "cssPrefix", void 0);

    _defineProperty(this, "mainFile", void 0);

    _defineProperty(this, "uninstall", void 0);

    if (!baseUrl) {
      throw new Error('DynamicRequire baseUrl paramters must setted');
    }

    var jsonpUrl = "".concat(baseUrl, "/jsonpmodules.js");
    var hashId = this.genHash(baseUrl);
    this.scriptId = "".concat(hashId, "_js");
    this.styleId = "".concat(hashId, "_css");

    var unInstallFn = function unInstallFn() {
      var jse = document.getElementById(_this.scriptId);
      var csse = document.getElementById(_this.styleId);
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

  _createClass(DynamicRequire, [{
    key: "genHash",
    value: function genHash(value) {
      var hashState = new _imurmurhash["default"]();
      hashState.hash(value);
      return hashState.result().toString(16).substr(0, 6);
    }
  }, {
    key: "require",
    value: function require(name) {
      var _this2 = this;

      var baseUrl = this.baseUrl,
          jsonpUrl = this.jsonpUrl,
          hashed = this.hashed,
          _this$jsPrefix = this.jsPrefix,
          jsPrefix = _this$jsPrefix === void 0 ? '' : _this$jsPrefix,
          _this$cssPrefix = this.cssPrefix,
          cssPrefix = _this$cssPrefix === void 0 ? '' : _this$cssPrefix,
          mainFile = this.mainFile,
          styleId = this.styleId;
      var jsonpCallback = (0, _camelcase["default"])(name.replace(/@/g, '$')).replace(/\//g, '_');
      return jsonp(jsonpUrl, {
        cbVal: jsonpCallback
      }).then(function (args) {
        var modules = args[0];
        var entry = args[1];
        var entryModuleName = "".concat(name, "/").concat(entry);
        var componentChunks = "".concat(jsPrefix, "vendor.js,").concat(jsPrefix).concat(mainFile, ".js");
        var needComboCssChunk = [];
        var needComboChunk = [];

        if (hashed) {
          entryModuleName = _this2.genHash(entryModuleName);
        }

        modules.forEach(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 3),
              moduleName = _ref3[0],
              chunkName = _ref3[1],
              isCss = _ref3[2];

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
            return loadComponentCss(baseUrl, mainFile, styleId, needComboCssChunk, cssPrefix).then(function () {
              return module.a || module;
            });
          } else {
            return Promise.resolve(module.a || module);
          }
        } // 新加载逻辑
        // 加载css


        var ssPromise = loadComponentCss(baseUrl, mainFile, styleId, needComboCssChunk, cssPrefix); // 并行加载js

        var jsPromise;
        var comboChunks = needComboChunk.map(function (chunkName) {
          return "".concat(jsPrefix, "deps/").concat(chunkName, ".js");
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
        return Promise.all([ssPromise, jsPromise]).then(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
              ss = _ref5[0],
              module = _ref5[1];

          return module;
        })["catch"](function (e) {
          console.warn('bootload module error', e);
        });
      })["catch"](function (error) {
        console.warn('load remote error');
        throw error;
      });
    }
  }]);

  return DynamicRequire;
}();

exports["default"] = DynamicRequire;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJsb2FkQ1NTIiwidXJsIiwiY3NzUm9vdCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsaW5rIiwiY3JlYXRlRWxlbWVudCIsInJlbCIsImhyZWYiLCJhcHBlbmRDaGlsZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImpzb25wIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwic2V0VGltZW91dCIsIkVycm9yIiwiYXJncyIsImdldEJsdXJWZXJzaW9uIiwidmVyc2lvbiIsInNwbGl0IiwibWFwIiwidiIsImkiLCJqb2luIiwibG9hZENvbXBvbmVudENzcyIsImJhc2VVcmwiLCJtYWluRmlsZSIsInN0eWxlSWQiLCJuZWVkQ29tYm9Dc3NDaHVuayIsImNzc1ByZWZpeCIsImNvbXBvbmVudENzcyIsImNvbWJvQ3NzQ2h1bmtzIiwiY2h1bmtOYW1lIiwidW5zaGlmdCIsImNvbWJvQ3NzVXJsIiwidGhlbiIsInNldEF0dHJpYnV0ZSIsIkR5bmFtaWNSZXF1aXJlIiwiaGFzaGVkIiwianNQcmVmaXgiLCJqc29ucFVybCIsImhhc2hJZCIsImdlbkhhc2giLCJzY3JpcHRJZCIsInVuSW5zdGFsbEZuIiwianNlIiwiZ2V0RWxlbWVudEJ5SWQiLCJjc3NlIiwidW5pbnN0YWxsIiwidmFsdWUiLCJoYXNoU3RhdGUiLCJNdXJtdXJIYXNoMyIsImhhc2giLCJyZXN1bHQiLCJ0b1N0cmluZyIsInN1YnN0ciIsIm5hbWUiLCJqc29ucENhbGxiYWNrIiwicmVwbGFjZSIsIm1vZHVsZXMiLCJlbnRyeSIsImVudHJ5TW9kdWxlTmFtZSIsImNvbXBvbmVudENodW5rcyIsIm5lZWRDb21ib0NodW5rIiwiZm9yRWFjaCIsIm1vZHVsZU5hbWUiLCJpc0NzcyIsIm1vZHVsZSIsIndlYnBhY2tEYXRhIiwiYyIsInB1c2giLCJhIiwic3NQcm9taXNlIiwianNQcm9taXNlIiwiY29tYm9DaHVua3MiLCJjb21ib1VybCIsImNvbnNvbGUiLCJsb2ciLCJlIiwiYWxsIiwic3MiLCJ3YXJuIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsSUFBSUEsQ0FBQyxHQUFHLE9BQU9DLE1BQVAsSUFBaUIsV0FBakIsR0FBK0JBLE1BQS9CLEdBQXdDQyxNQUFoRDs7QUFrQkEsU0FBU0MsT0FBVCxDQUFpQkMsR0FBakIsRUFBOEI7QUFDNUIsTUFBTUMsT0FBTyxHQUFHQyxRQUFRLENBQUNDLG9CQUFULENBQThCLE1BQTlCLEVBQXNDLENBQXRDLENBQWhCO0FBQ0EsTUFBTUMsSUFBSSxHQUFHRixRQUFRLENBQUNHLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBYjtBQUNBRCxFQUFBQSxJQUFJLENBQUNFLEdBQUwsR0FBVyxZQUFYO0FBQ0FGLEVBQUFBLElBQUksQ0FBQ0csSUFBTCxHQUFZUCxHQUFaO0FBRUFDLEVBQUFBLE9BQU8sQ0FBQ08sV0FBUixDQUFvQkosSUFBcEI7QUFFQSxTQUFPLElBQUlLLE9BQUosQ0FBNkIsVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3ZEUCxJQUFBQSxJQUFJLENBQUNRLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCLFlBQU07QUFDbkNELE1BQUFBLE1BQU0sMkJBQW9CWCxHQUFwQixFQUFOO0FBQ0QsS0FGRDtBQUdBSSxJQUFBQSxJQUFJLENBQUNRLGdCQUFMLENBQXNCLE1BQXRCLEVBQThCO0FBQUEs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Q0YsV0FSRDtBQVNELFNBVlcsQ0FBWjtBQVdBLGVBQU94RixPQUFPLENBQUN5RixHQUFSLENBQVksQ0FBQ1AsU0FBRCxFQUFZQyxTQUFaLENBQVosRUFBb0N0QyxJQUFwQyxDQUF5QyxpQkFBa0I7QUFBQTtBQUFBLGNBQWhCNkMsRUFBZ0I7QUFBQSxjQUFaYixNQUFZOztBQUNoRSxpQkFBT0EsTUFBUDtBQUNELFNBRk0sV0FFRSxVQUFBVyxDQUFDLEVBQUk7QUFDWkYsVUFBQUEsT0FBTyxDQUFDSyxJQUFSLENBQWEsdUJBQWIsRUFBc0NILENBQXRDO0FBQ0QsU0FKTSxDQUFQO0FBS0QsT0FoRU0sV0FnRUUsVUFBVUksS0FBVixFQUFzQjtBQUM3Qk4sUUFBQUEsT0FBTyxDQUFDSyxJQUFSLENBQWEsbUJBQWI7QUFDQSxjQUFNQyxLQUFOO0FBQ0QsT0FuRU0sQ0FBUDtBQW9FRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY3JpcHRqcyBmcm9tICdzY3JpcHRqcyc7XG5pbXBvcnQgY2FtZWxDYXNlIGZyb20gJ2NhbWVsY2FzZSc7XG5pbXBvcnQgTXVybXVySGFzaDMgZnJvbSAnaW11cm11cmhhc2gnO1xuZXhwb3J0ICogZnJvbSAnLi9NYWluJztcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5cbmV4cG9ydCB0eXBlIERlcFR5cGUgPSB7XG4gIHR5cGU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBlbmZvcmNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRGVwcyA9IHtcbiAgW25hbWU6IHN0cmluZ106IERlcFR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIEpTT05PcHQgPSB7XG4gIHRpbWVvdXQ/OiBudW1iZXI7XG4gIGNiS2V5Pzogc3RyaW5nO1xuICBjYlZhbD86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gbG9hZENTUyh1cmw6IHN0cmluZykge1xuICBjb25zdCBjc3NSb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gIGxpbmsuaHJlZiA9IHVybDtcblxuICBjc3NSb290LmFwcGVuZENoaWxkKGxpbmspO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTxIVE1MTGlua0VsZW1lbnQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgcmVqZWN0KGBsb2FkIGNzcyBlcnJvcjogJHt1cmx9YCk7XG4gICAgfSk7XG4gICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gcmVzb2x2ZShsaW5rKSk7XG4gIH0pO1xuXG59XG5cblxuY29uc3QganNvbnAgPSAodXJsOiBzdHJpbmcsIG9wdDogSlNPTk9wdCA9IHt9LCBmbj86IEZ1bmN0aW9uKSA9PiB7XG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IG9wdFxuICAgIG9wdCA9IHt9XG4gIH1cblxuICBsZXQgeyB0aW1lb3V0ID0gbnVsbCwgY2JLZXkgPSAnY2FsbGJhY2snLCBjYlZhbCA9ICdmZW5neXUnIH0gPSBvcHRcbiAgbGV0IHRpbWVyOiBudW1iZXI7XG5cbiAgaWYgKGNiVmFsID09PSAnZmVuZ3l1Jykge1xuICAgIGNiVmFsICs9IERhdGUubm93KClcbiAgfVxuXG4gIGxldCBzID0gJydcbiAgcyArPSBgJiR7Y2JLZXl9PSR7Y2JWYWx9YFxuXG4gIHMgPSBzLnNsaWNlKDEpXG5cbiAgdXJsICs9ICh+dXJsLmluZGV4T2YoJz8nKSA/ICcmJyA6ICc/JykgKyBzXG5cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG5cbiAgdmFyIHJlbW92ZSA9ICgpID0+IHtcbiAgICB0aW1lciAmJiBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZChzY3JpcHQpXG4gICAgZ1tjYlZhbF0gPSB1bmRlZmluZWRcbiAgfVxuXG4gIHNjcmlwdC5zcmMgPSB1cmxcblxuXG4gIGlmIChmbiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGdbY2JWYWxdID0gKGRhdGE6IGFueSkgPT4ge1xuICAgICAgZm4oZGF0YSlcbiAgICAgIHJlbW92ZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gICAgcmV0dXJuXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IChhcmcwOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKGFyZzA6IEVycm9yKSA9PiB2b2lkKSA9PiB7XG4gICAgLy8g6K+35rGC6LaF5pe2XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2pzb25wIHJlcXVlc3QgdGltZW91dCcpKVxuICAgICAgICByZW1vdmUoKVxuICAgICAgfSwgdGltZW91dClcbiAgICB9XG4gICAgLy8g5q2j5bi4XG4gICAgZ1tjYlZhbF0gPSAoLi4uYXJnczogYW55KSA9PiB7XG4gICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0Qmx1clZlcnNpb24odmVyc2lvbjogc3RyaW5nKSB7XG4gIHJldHVybiB2ZXJzaW9uLnNwbGl0KCcuJykubWFwKCh2LCBpKSA9PiBpID4gMCA/ICd4JyA6IHYpLmpvaW4oJy4nKTtcbn1cbi8vIGNvbnN0IF9yZXF1aXJlXyA9IGcud2VicGFja0RhdGE7XG4vLyBnLndlYnBhY2tEYXRhID0gZnVuY3Rpb24obW9kdWxlSWQ6IGFueSkge1xuLy8gICBjb25zdCBtb2R1bGUgPSBfcmVxdWlyZV8ubVttb2R1bGVJZF0gYXMgRnVuY3Rpb247XG4vLyAgIGlmICghbW9kdWxlKSB7XG4vLyAgICAgY29uc29sZS53YXJuKG1vZHVsZUlkLCAnY2FuIG5vdCBiZSBmb3VuZGVkLCBjaGVjayBjaHVuayBpcyBjb21wbGV0aW9uJyk7XG4vLyAgICAgcmV0dXJuO1xuLy8gICB9XG4vLyAgIHJldHVybiBfcmVxdWlyZV8uY2FsbCh0aGlzLCBtb2R1bGVJZCk7XG4vLyB9XG4vLyBPYmplY3QuYXNzaWduKGcud2VicGFja0RhdGEsIF9yZXF1aXJlXyk7XG5cblxuZnVuY3Rpb24gbG9hZENvbXBvbmVudENzcyhiYXNlVXJsOiBzdHJpbmcsIG1haW5GaWxlOiBzdHJpbmcsIHN0eWxlSWQ6IHN0cmluZywgbmVlZENvbWJvQ3NzQ2h1bms6IHN0cmluZ1tdLCBjc3NQcmVmaXg6IHN0cmluZykge1xuICBjb25zdCBjb21wb25lbnRDc3MgPSBgJHtjc3NQcmVmaXh9JHttYWluRmlsZX0uY3NzYDtcbiAgY29uc3QgY29tYm9Dc3NDaHVua3MgPSBuZWVkQ29tYm9Dc3NDaHVuay5tYXAoY2h1bmtOYW1lID0+IGAke2Nzc1ByZWZpeH1kZXBzLyR7Y2h1bmtOYW1lfS5jc3NgKTtcbiAgY29tYm9Dc3NDaHVua3MudW5zaGlmdChjb21wb25lbnRDc3MpO1xuICBjb25zdCBjb21ib0Nzc1VybCA9IGAke2Jhc2VVcmx9Lz8/JHtjb21ib0Nzc0NodW5rcy5qb2luKCl9YDtcblxuXG4gIHJldHVybiBsb2FkQ1NTKGNvbWJvQ3NzVXJsKS50aGVuKGxpbmsgPT4ge1xuICAgIGxpbmsgJiYgbGluay5zZXRBdHRyaWJ1dGUoJ2lkJywgc3R5bGVJZCk7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEeW5hbWljUmVxdWlyZSB7XG5cbiAgYmFzZVVybDogc3RyaW5nO1xuICBqc29ucFVybDogc3RyaW5nO1xuICBoYXNoZWQ6IGJvb2xlYW47XG4gIHNjcmlwdElkOiBzdHJpbmc7XG4gIHN0eWxlSWQ6IHN0cmluZztcbiAganNQcmVmaXg/OiBzdHJpbmc7XG4gIGNzc1ByZWZpeD86IHN0cmluZztcbiAgbWFpbkZpbGU6IHN0cmluZztcbiAgdW5pbnN0YWxsOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHsgYmFzZVVybCwgaGFzaGVkLCBqc1ByZWZpeCwgY3NzUHJlZml4LCBtYWluRmlsZSB9OiB7IGJhc2VVcmw6IHN0cmluZywgaGFzaGVkPzogYm9vbGVhbiwganNQcmVmaXg/OiBzdHJpbmcsIGNzc1ByZWZpeD86IHN0cmluZywgbWFpbkZpbGU/OiBzdHJpbmcgfSkge1xuICAgIGlmICghYmFzZVVybCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEeW5hbWljUmVxdWlyZSBiYXNlVXJsIHBhcmFtdGVycyBtdXN0IHNldHRlZCcpO1xuICAgIH1cbiAgICBjb25zdCBqc29ucFVybCA9IGAke2Jhc2VVcmx9L2pzb25wbW9kdWxlcy5qc2A7XG4gICAgY29uc3QgaGFzaElkID0gdGhpcy5nZW5IYXNoKGJhc2VVcmwpO1xuICAgIHRoaXMuc2NyaXB0SWQgPSBgJHtoYXNoSWR9X2pzYDtcbiAgICB0aGlzLnN0eWxlSWQgPSBgJHtoYXNoSWR9X2Nzc2A7XG4gICAgY29uc3QgdW5JbnN0YWxsRm4gPSAoKSA9PiB7XG4gICAgICBjb25zdCBqc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNjcmlwdElkKTtcbiAgICAgIGNvbnN0IGNzc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnN0eWxlSWQpO1xuICAgICAganNlICYmIGpzZS5yZW1vdmUoKTtcbiAgICAgIGNzc2UgJiYgY3NzZS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcbiAgICB0aGlzLmpzb25wVXJsID0ganNvbnBVcmw7XG4gICAgdGhpcy5oYXNoZWQgPSBoYXNoZWQ7XG4gICAgdGhpcy5qc1ByZWZpeCA9IGpzUHJlZml4O1xuICAgIHRoaXMuY3NzUHJlZml4ID0gY3NzUHJlZml4O1xuICAgIHRoaXMubWFpbkZpbGUgPSBtYWluRmlsZSB8fCAnaW5kZXgnO1xuICAgIHRoaXMudW5pbnN0YWxsID0gdW5JbnN0YWxsRm47XG4gIH1cblxuICBnZW5IYXNoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBoYXNoU3RhdGUgPSBuZXcgTXVybXVySGFzaDMoKTtcbiAgICBoYXNoU3RhdGUuaGFzaCh2YWx1ZSk7XG4gICAgcmV0dXJuIGhhc2hTdGF0ZS5yZXN1bHQoKS50b1N0cmluZygxNikuc3Vic3RyKDAsIDYpO1xuICB9XG5cbiAgcmVxdWlyZShuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7IGJhc2VVcmwsIGpzb25wVXJsLCBoYXNoZWQsIGpzUHJlZml4ID0gJycsIGNzc1ByZWZpeCA9ICcnLCBtYWluRmlsZSwgc3R5bGVJZCB9ID0gdGhpcztcbiAgICBjb25zdCBqc29ucENhbGxiYWNrID0gY2FtZWxDYXNlKG5hbWUucmVwbGFjZSgvQC9nLCAnJCcpKS5yZXBsYWNlKC9cXC8vZywgJ18nKTtcblxuICAgIHJldHVybiBqc29ucChqc29ucFVybCwge1xuICAgICAgY2JWYWw6IGpzb25wQ2FsbGJhY2tcbiAgICB9KS50aGVuKChhcmdzKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVzOiBzdHJpbmdbXSA9IGFyZ3NbMF07XG4gICAgICBjb25zdCBlbnRyeTogc3RyaW5nID0gYXJnc1sxXTtcbiAgICAgIGxldCBlbnRyeU1vZHVsZU5hbWUgPSBgJHtuYW1lfS8ke2VudHJ5fWA7XG4gICAgICBjb25zdCBjb21wb25lbnRDaHVua3MgPSBgJHtqc1ByZWZpeH12ZW5kb3IuanMsJHtqc1ByZWZpeH0ke21haW5GaWxlfS5qc2A7XG4gICAgICBjb25zdCBuZWVkQ29tYm9Dc3NDaHVuazogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IG5lZWRDb21ib0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBpZiAoaGFzaGVkKSB7XG4gICAgICAgIGVudHJ5TW9kdWxlTmFtZSA9IHRoaXMuZ2VuSGFzaChlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgfVxuICBcbiAgICAgIG1vZHVsZXMuZm9yRWFjaCgoW21vZHVsZU5hbWUsIGNodW5rTmFtZSwgaXNDc3NdKSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEuY1ttb2R1bGVOYW1lXTtcbiAgICAgICAgLy8g5aaC5p6cbW9kdWxl5LiN5a2Y5Zyo77yM5pS+5YiwbW9kdWxl5a+55bqU55qEY2h1bmvliLBjb21ib+S/oeaBr+mHjFxuICAgICAgICBpZiAoIW1vZHVsZSAmJiBuZWVkQ29tYm9DaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgbmVlZENvbWJvQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NzcyAmJiBuZWVkQ29tYm9Dc3NDaHVuay5pbmRleE9mKGNodW5rTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgbmVlZENvbWJvQ3NzQ2h1bmsucHVzaChjaHVua05hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgXG4gICAgICAvLyDlt7Lnu4/liqDovb3ov4fkuobnmoTpgLvovpFcbiAgICAgIGlmIChnLndlYnBhY2tEYXRhLmNbZW50cnlNb2R1bGVOYW1lXSkge1xuICAgICAgICAvLyBpZiB3ZWJwYWNrIGVuYWJsZSBobXIgYWJvdmUgcmV0dXJuIHsgY2hpbGRyZW4sIGV4cG9ydHMsIGhvdCAuLi59XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgICAgY29uc3QgY3NzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0eWxlSWQpO1xuICAgICAgICAvLyDmoLflvI/lt7Lnu4/ljbjovb3vvIzph43mlrDliqDovb3lh7rmnaVcbiAgICAgICAgaWYgKCFjc3NlKSB7XG4gICAgICAgICAgcmV0dXJuIGxvYWRDb21wb25lbnRDc3MoYmFzZVVybCwgbWFpbkZpbGUsIHN0eWxlSWQsIG5lZWRDb21ib0Nzc0NodW5rLCBjc3NQcmVmaXgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1vZHVsZS5hIHx8IG1vZHVsZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1vZHVsZS5hIHx8IG1vZHVsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgXG4gICAgICAvLyDmlrDliqDovb3pgLvovpFcbiAgICAgIC8vIOWKoOi9vWNzc1xuICAgICAgY29uc3Qgc3NQcm9taXNlID0gbG9hZENvbXBvbmVudENzcyhiYXNlVXJsLCBtYWluRmlsZSwgc3R5bGVJZCwgbmVlZENvbWJvQ3NzQ2h1bmssIGNzc1ByZWZpeCk7XG4gICAgICAvLyDlubbooYzliqDovb1qc1xuICAgICAgbGV0IGpzUHJvbWlzZTtcbiAgICAgIGNvbnN0IGNvbWJvQ2h1bmtzID0gbmVlZENvbWJvQ2h1bmsubWFwKGNodW5rTmFtZSA9PiBgJHtqc1ByZWZpeH1kZXBzLyR7Y2h1bmtOYW1lfS5qc2ApXG4gICAgICBjb21ib0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENodW5rcyk7IC8vIOihpeS4iuW/hemhu+eahOe7hOS7tui1hOa6kFxuICAgICAgY29uc3QgY29tYm9VcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tYm9DaHVua3Muam9pbigpfWA7XG4gICAgICBqc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIFNjcmlwdGpzKGNvbWJvVXJsLCAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIGNvbWJvIGpzIGRvbmUnLCBuYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgICAgICAgIHJlc29sdmUobW9kdWxlLmEgfHwgbW9kdWxlKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtzc1Byb21pc2UsIGpzUHJvbWlzZV0pLnRoZW4oKFtzcywgbW9kdWxlXSkgPT4ge1xuICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybignYm9vdGxvYWQgbW9kdWxlIGVycm9yJywgZSk7XG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2xvYWQgcmVtb3RlIGVycm9yJyk7XG4gICAgICB0aHJvdyBlcnJvclxuICAgIH0pO1xuICB9XG59XG5cbiJdfQ==
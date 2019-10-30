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


function loadComponentCss(baseUrl, styleId, needComboCssChunk, cssPrefix) {
  var componentCss = "".concat(cssPrefix, "index.css");
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
        cssPrefix = _ref.cssPrefix;

    _classCallCheck(this, DynamicRequire);

    _defineProperty(this, "baseUrl", void 0);

    _defineProperty(this, "jsonpUrl", void 0);

    _defineProperty(this, "hashed", void 0);

    _defineProperty(this, "scriptId", void 0);

    _defineProperty(this, "styleId", void 0);

    _defineProperty(this, "jsPrefix", void 0);

    _defineProperty(this, "cssPrefix", void 0);

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
          styleId = this.styleId;
      var jsonpCallback = (0, _camelcase["default"])(name.replace(/@/g, '$')).replace(/\//g, '_');
      return jsonp(jsonpUrl, {
        cbVal: jsonpCallback
      }).then(function (args) {
        var modules = args[0];
        var entry = args[1];
        var entryModuleName = "".concat(name, "/").concat(entry);
        var componentChunks = "".concat(jsPrefix, "vendor.js,").concat(jsPrefix, "index.js");
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
            return loadComponentCss(baseUrl, styleId, needComboCssChunk, cssPrefix).then(function () {
              return module.a || module;
            });
          } else {
            return Promise.resolve(module.a || module);
          }
        } // 新加载逻辑
        // 加载css


        var ssPromise = loadComponentCss(baseUrl, styleId, needComboCssChunk, cssPrefix); // 并行加载js

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EeW5hbWljLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJsb2FkQ1NTIiwidXJsIiwiY3NzUm9vdCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsaW5rIiwiY3JlYXRlRWxlbWVudCIsInJlbCIsImhyZWYiLCJhcHBlbmRDaGlsZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImpzb25wIiwib3B0IiwiZm4iLCJ0aW1lb3V0IiwiY2JLZXkiLCJjYlZhbCIsInRpbWVyIiwiRGF0ZSIsIm5vdyIsInMiLCJzbGljZSIsImluZGV4T2YiLCJzY3JpcHQiLCJyZW1vdmUiLCJjbGVhclRpbWVvdXQiLCJoZWFkIiwicmVtb3ZlQ2hpbGQiLCJ1bmRlZmluZWQiLCJzcmMiLCJkYXRhIiwic2V0VGltZW91dCIsIkVycm9yIiwiYXJncyIsImdldEJsdXJWZXJzaW9uIiwidmVyc2lvbiIsInNwbGl0IiwibWFwIiwidiIsImkiLCJqb2luIiwibG9hZENvbXBvbmVudENzcyIsImJhc2VVcmwiLCJzdHlsZUlkIiwibmVlZENvbWJvQ3NzQ2h1bmsiLCJjc3NQcmVmaXgiLCJjb21wb25lbnRDc3MiLCJjb21ib0Nzc0NodW5rcyIsImNodW5rTmFtZSIsInVuc2hpZnQiLCJjb21ib0Nzc1VybCIsInRoZW4iLCJzZXRBdHRyaWJ1dGUiLCJEeW5hbWljUmVxdWlyZSIsImhhc2hlZCIsImpzUHJlZml4IiwianNvbnBVcmwiLCJoYXNoSWQiLCJnZW5IYXNoIiwic2NyaXB0SWQiLCJ1bkluc3RhbGxGbiIsImpzZSIsImdldEVsZW1lbnRCeUlkIiwiY3NzZSIsInVuaW5zdGFsbCIsInZhbHVlIiwiaGFzaFN0YXRlIiwiTXVybXVySGFzaDMiLCJoYXNoIiwicmVzdWx0IiwidG9TdHJpbmciLCJzdWJzdHIiLCJuYW1lIiwianNvbnBDYWxsYmFjayIsInJlcGxhY2UiLCJtb2R1bGVzIiwiZW50cnkiLCJlbnRyeU1vZHVsZU5hbWUiLCJjb21wb25lbnRDaHVua3MiLCJuZWVkQ29tYm9DaHVuayIsImZvckVhY2giLCJtb2R1bGVOYW1lIiwiaXNDc3MiLCJtb2R1bGUiLCJ3ZWJwYWNrRGF0YSIsImMiLCJwdXNoIiwiYSIsInNzUHJvbWlzZSIsImpzUHJvbWlzZSIsImNvbWJvQ2h1bmtzIiwiY29tYm9VcmwiLCJjb25zb2xlIiwibG9nIiwiZSIsImFsbCIsInNzIiwid2FybiIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQUlBLENBQUMsR0FBRyxPQUFPQyxNQUFQLElBQWlCLFdBQWpCLEdBQStCQSxNQUEvQixHQUF3Q0MsTUFBaEQ7O0FBa0JBLFNBQVNDLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQThCO0FBQzVCLE1BQU1DLE9BQU8sR0FBR0MsUUFBUSxDQUFDQyxvQkFBVCxDQUE4QixNQUE5QixFQUFzQyxDQUF0QyxDQUFoQjtBQUNBLE1BQU1DLElBQUksR0FBR0YsUUFBUSxDQUFDRyxhQUFULENBQXVCLE1BQXZCLENBQWI7QUFDQUQsRUFBQUEsSUFBSSxDQUFDRSxHQUFMLEdBQVcsWUFBWDtBQUNBRixFQUFBQSxJQUFJLENBQUNHLElBQUwsR0FBWVAsR0FBWjtBQUVBQyxFQUFBQSxPQUFPLENBQUNPLFdBQVIsQ0FBb0JKLElBQXBCO0FBRUEsU0FBTyxJQUFJSyxPQUFKLENBQTZCLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN2RFAsSUFBQUEsSUFBSSxDQUFDUSxnQkFBTCxDQUFzQixPQUF0QixFQUErQixZQUFNO0FBQ25DRCxNQUFBQSxNQUFNLDJCQUFvQlgsR0FBcEIsRUFBTjtBQUNELEtBRkQ7QUFHQUksSUFBQUEsSUFBSSxDQUFDUSxnQkFBTCxDQUFzQixNQUF0QixFQUE4QjtBQUFBLGFBQU1GLE9BQU8sQ0FBQ04sSUFBRCxDQUFiO0FBQUEsS0FBOUI7QUFDRCxHQUxNLENBQVA7QUFPRDs7QUFHRCxJQUFNUyxLQUFLLEdBQUcsU0FBUkEsS0FBUSxDQUFDYixHQUFELEVBQW1EO0FBQUEsTUFBckNjLEdBQXFDLHVFQUF0QixFQUFzQjtBQUFBLE1BQWxCQyxFQUFrQjs7QUFFL0QsTUFBSSxPQUFPRCxHQUFQLEtBQWUsVUFBbkIsRUFBK0I7QUFDN0JDLElBQUFBLEVBQUUsR0FBR0QsR0FBTDtBQUNBQSxJQUFBQSxHQUFHLEdBQUcsRUFBTjtBQUNEOztBQUw4RCxhQU9BQSxHQVBBO0FBQUEsMEJBT3pERSxPQVB5RDtBQUFBLE1BT3pEQSxPQVB5RCw2QkFPL0MsSUFQK0M7QUFBQSx3QkFPekNDLEtBUHlDO0FBQUEsTUFPekNBLEtBUHlDLDJCQU9qQyxVQVBpQztBQUFBLHdCQU9yQkMsS0FQcUI7QUFBQSxNQU9yQkEsS0FQcUIsMkJBT2IsUUFQYTtBQVEvRCxNQUFJQyxLQUFKOztBQUVBLE1BQUlELEtBQUssS0FBSyxRQUFkLEVBQXdCO0FBQ3RCQSxJQUFBQSxLQUFLLElBQUlFLElBQUksQ0FBQ0MsR0FBTCxFQUFUO0FBQ0Q7O0FBRUQsTUFBSUMsQ0FBQyxHQUFHLEVBQVI7QUFDQUEsRUFBQUEsQ0FBQyxlQUFRTCxLQUFSLGNBQWlCQyxLQUFqQixDQUFEO0FBRUFJLEVBQUFBLENBQUMsR0FBR0EsQ0FBQyxDQUFDQyxLQUFGLENBQVEsQ0FBUixDQUFKO0FBRUF2QixFQUFBQSxHQUFHLElBQUksQ0FBQyxDQUFDQSxHQUFHLENBQUN3QixPQUFKLENBQVksR0FBWixDQUFELEdBQW9CLEdBQXBCLEdBQTBCLEdBQTNCLElBQWtDRixDQUF6QztBQUVBLE1BQUlHLE1BQU0sR0FBR3ZCLFFBQVEsQ0FBQ0csYUFBVCxDQUF1QixRQUF2QixDQUFiOztBQUVBLE1BQUlxQixNQUFNLEdBQUcsU0FBVEEsTUFBUyxHQUFNO0FBQ2pCUCxJQUFBQSxLQUFLLElBQUlRLFlBQVksQ0FBQ1IsS0FBRCxDQUFyQjtBQUNBakIsSUFBQUEsUUFBUSxDQUFDMEIsSUFBVCxDQUFjQyxXQUFkLENBQTBCSixNQUExQjtBQUNBN0IsSUFBQUEsQ0FBQyxDQUFDc0IsS0FBRCxDQUFELEdBQVdZLFNBQVg7QUFDRCxHQUpEOztBQU1BTCxFQUFBQSxNQUFNLENBQUNNLEdBQVAsR0FBYS9CLEdBQWI7O0FBR0EsTUFBSWUsRUFBRSxLQUFLZSxTQUFQLElBQW9CLE9BQU9mLEVBQVAsS0FBYyxVQUF0QyxFQUFrRDtBQUNoRG5CLElBQUFBLENBQUMsQ0FBQ3NCLEtBQUQsQ0FBRCxHQUFXLFVBQUNjLElBQUQsRUFBZTtBQUN4QmpCLE1BQUFBLEVBQUUsQ0FBQ2lCLElBQUQsQ0FBRjtBQUNBTixNQUFBQSxNQUFNO0FBQ1AsS0FIRDs7QUFLQXhCLElBQUFBLFFBQVEsQ0FBQzBCLElBQVQsQ0FBY3BCLFdBQWQsQ0FBMEJpQixNQUExQjtBQUNBO0FBQ0Q7O0FBRUQsU0FBTyxJQUFJaEIsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBK0JDLE1BQS9CLEVBQWlFO0FBQ2xGO0FBQ0EsUUFBSUssT0FBSixFQUFhO0FBQ1hHLE1BQUFBLEtBQUssR0FBR2MsVUFBVSxDQUFDLFlBQU07QUFDdkJ0QixRQUFBQSxNQUFNLENBQUMsSUFBSXVCLEtBQUosQ0FBVSx1QkFBVixDQUFELENBQU47QUFDQVIsUUFBQUEsTUFBTTtBQUNQLE9BSGlCLEVBR2ZWLE9BSGUsQ0FBbEI7QUFJRCxLQVBpRixDQVFsRjs7O0FBQ0FwQixJQUFBQSxDQUFDLENBQUNzQixLQUFELENBQUQsR0FBVyxZQUFrQjtBQUFBLHdDQUFkaUIsSUFBYztBQUFkQSxRQUFBQSxJQUFjO0FBQUE7O0FBQzNCekIsTUFBQUEsT0FBTyxDQUFDeUIsSUFBRCxDQUFQO0FBQ0FULE1BQUFBLE1BQU07QUFDUCxLQUhEOztBQUtBeEIsSUFBQUEsUUFBUSxDQUFDMEIsSUFBVCxDQUFjcEIsV0FBZCxDQUEwQmlCLE1BQTFCO0FBQ0QsR0FmTSxDQUFQO0FBZ0JELENBMUREOztBQTREQSxTQUFTVyxjQUFULENBQXdCQyxPQUF4QixFQUF5QztBQUN2QyxTQUFPQSxPQUFPLENBQUNDLEtBQVIsQ0FBYyxHQUFkLEVBQW1CQyxHQUFuQixDQUF1QixVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxXQUFVQSxDQUFDLEdBQUcsQ0FBSixHQUFRLEdBQVIsR0FBY0QsQ0FBeEI7QUFBQSxHQUF2QixFQUFrREUsSUFBbEQsQ0FBdUQsR0FBdkQsQ0FBUDtBQUNELEMsQ0FDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0EsU0FBU0MsZ0JBQVQsQ0FBMEJDLE9BQTFCLEVBQTJDQyxPQUEzQyxFQUE0REMsaUJBQTVELEVBQXlGQyxTQUF6RixFQUE0RztBQUMxRyxNQUFNQyxZQUFZLGFBQU1ELFNBQU4sY0FBbEI7QUFDQSxNQUFNRSxjQUFjLEdBQUdILGlCQUFpQixDQUFDUCxHQUFsQixDQUFzQixVQUFBVyxTQUFTO0FBQUEscUJBQU9ILFNBQVAsa0JBQXdCRyxTQUF4QjtBQUFBLEdBQS9CLENBQXZCO0FBQ0FELEVBQUFBLGNBQWMsQ0FBQ0UsT0FBZixDQUF1QkgsWUFBdkI7QUFDQSxNQUFNSSxXQUFXLGFBQU1SLE9BQU4sZ0JBQW1CSyxjQUFjLENBQUNQLElBQWYsRUFBbkIsQ0FBakI7QUFHQSxTQUFPM0MsT0FBTyxDQUFDcUQsV0FBRCxDQUFQLENBQXFCQyxJQUFyQixDQUEwQixVQUFBakQsSUFBSSxFQUFJO0FBQ3ZDQSxJQUFBQSxJQUFJLElBQUlBLElBQUksQ0FBQ2tELFlBQUwsQ0FBa0IsSUFBbEIsRUFBd0JULE9BQXhCLENBQVI7QUFDRCxHQUZNLENBQVA7QUFHRDs7SUFFb0JVLGM7OztBQVduQixnQ0FBb0k7QUFBQTs7QUFBQSxRQUF0SFgsT0FBc0gsUUFBdEhBLE9BQXNIO0FBQUEsUUFBN0dZLE1BQTZHLFFBQTdHQSxNQUE2RztBQUFBLFFBQXJHQyxRQUFxRyxRQUFyR0EsUUFBcUc7QUFBQSxRQUEzRlYsU0FBMkYsUUFBM0ZBLFNBQTJGOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUNsSSxRQUFJLENBQUNILE9BQUwsRUFBYztBQUNaLFlBQU0sSUFBSVYsS0FBSixDQUFVLDhDQUFWLENBQU47QUFDRDs7QUFDRCxRQUFNd0IsUUFBUSxhQUFNZCxPQUFOLHFCQUFkO0FBQ0EsUUFBTWUsTUFBTSxHQUFHLEtBQUtDLE9BQUwsQ0FBYWhCLE9BQWIsQ0FBZjtBQUNBLFNBQUtpQixRQUFMLGFBQW1CRixNQUFuQjtBQUNBLFNBQUtkLE9BQUwsYUFBa0JjLE1BQWxCOztBQUNBLFFBQU1HLFdBQVcsR0FBRyxTQUFkQSxXQUFjLEdBQU07QUFDeEIsVUFBTUMsR0FBRyxHQUFHN0QsUUFBUSxDQUFDOEQsY0FBVCxDQUF3QixLQUFJLENBQUNILFFBQTdCLENBQVo7QUFDQSxVQUFNSSxJQUFJLEdBQUcvRCxRQUFRLENBQUM4RCxjQUFULENBQXdCLEtBQUksQ0FBQ25CLE9BQTdCLENBQWI7QUFDQWtCLE1BQUFBLEdBQUcsSUFBSUEsR0FBRyxDQUFDckMsTUFBSixFQUFQO0FBQ0F1QyxNQUFBQSxJQUFJLElBQUlBLElBQUksQ0FBQ3ZDLE1BQUwsRUFBUjtBQUNELEtBTEQ7O0FBT0EsU0FBS2tCLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtjLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS0YsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLVixTQUFMLEdBQWlCQSxTQUFqQjtBQUNBLFNBQUttQixTQUFMLEdBQWlCSixXQUFqQjtBQUNEOzs7OzRCQUVPSyxLLEVBQWU7QUFDckIsVUFBTUMsU0FBUyxHQUFHLElBQUlDLHVCQUFKLEVBQWxCO0FBQ0FELE1BQUFBLFNBQVMsQ0FBQ0UsSUFBVixDQUFlSCxLQUFmO0FBQ0EsYUFBT0MsU0FBUyxDQUFDRyxNQUFWLEdBQW1CQyxRQUFuQixDQUE0QixFQUE1QixFQUFnQ0MsTUFBaEMsQ0FBdUMsQ0FBdkMsRUFBMEMsQ0FBMUMsQ0FBUDtBQUNEOzs7NEJBRU9DLEksRUFBYztBQUFBOztBQUFBLFVBQ1o5QixPQURZLEdBQzBELElBRDFELENBQ1pBLE9BRFk7QUFBQSxVQUNIYyxRQURHLEdBQzBELElBRDFELENBQ0hBLFFBREc7QUFBQSxVQUNPRixNQURQLEdBQzBELElBRDFELENBQ09BLE1BRFA7QUFBQSwyQkFDMEQsSUFEMUQsQ0FDZUMsUUFEZjtBQUFBLFVBQ2VBLFFBRGYsK0JBQzBCLEVBRDFCO0FBQUEsNEJBQzBELElBRDFELENBQzhCVixTQUQ5QjtBQUFBLFVBQzhCQSxTQUQ5QixnQ0FDMEMsRUFEMUM7QUFBQSxVQUM4Q0YsT0FEOUMsR0FDMEQsSUFEMUQsQ0FDOENBLE9BRDlDO0FBRXBCLFVBQU04QixhQUFhLEdBQUcsMkJBQVVELElBQUksQ0FBQ0UsT0FBTCxDQUFhLElBQWIsRUFBbUIsR0FBbkIsQ0FBVixFQUFtQ0EsT0FBbkMsQ0FBMkMsS0FBM0MsRUFBa0QsR0FBbEQsQ0FBdEI7QUFFQSxhQUFPL0QsS0FBSyxDQUFDNkMsUUFBRCxFQUFXO0FBQ3JCeEMsUUFBQUEsS0FBSyxFQUFFeUQ7QUFEYyxPQUFYLENBQUwsQ0FFSnRCLElBRkksQ0FFQyxVQUFDbEIsSUFBRCxFQUFVO0FBQ2hCLFlBQU0wQyxPQUFpQixHQUFHMUMsSUFBSSxDQUFDLENBQUQsQ0FBOUI7QUFDQSxZQUFNMkMsS0FBYSxHQUFHM0MsSUFBSSxDQUFDLENBQUQsQ0FBMUI7QUFDQSxZQUFJNEMsZUFBZSxhQUFNTCxJQUFOLGNBQWNJLEtBQWQsQ0FBbkI7QUFDQSxZQUFNRSxlQUFlLGFBQU12QixRQUFOLHVCQUEyQkEsUUFBM0IsYUFBckI7QUFDQSxZQUFNWCxpQkFBMkIsR0FBRyxFQUFwQztBQUNBLFlBQU1tQyxjQUF3QixHQUFHLEVBQWpDOztBQUVBLFlBQUl6QixNQUFKLEVBQVk7QUFDVnVCLFVBQUFBLGVBQWUsR0FBRyxNQUFJLENBQUNuQixPQUFMLENBQWFtQixlQUFiLENBQWxCO0FBQ0Q7O0FBRURGLFFBQUFBLE9BQU8sQ0FBQ0ssT0FBUixDQUFnQixpQkFBb0M7QUFBQTtBQUFBLGNBQWxDQyxVQUFrQztBQUFBLGNBQXRCakMsU0FBc0I7QUFBQSxjQUFYa0MsS0FBVzs7QUFDbEQsY0FBTUMsTUFBTSxHQUFHekYsQ0FBQyxDQUFDMEYsV0FBRixDQUFjQyxDQUFkLENBQWdCSixVQUFoQixDQUFmLENBRGtELENBRWxEOztBQUNBLGNBQUksQ0FBQ0UsTUFBRCxJQUFXSixjQUFjLENBQUN6RCxPQUFmLENBQXVCMEIsU0FBdkIsTUFBc0MsQ0FBQyxDQUF0RCxFQUF5RDtBQUN2RCtCLFlBQUFBLGNBQWMsQ0FBQ08sSUFBZixDQUFvQnRDLFNBQXBCO0FBQ0Q7O0FBQ0QsY0FBSWtDLEtBQUssSUFBSXRDLGlCQUFpQixDQUFDdEIsT0FBbEIsQ0FBMEIwQixTQUExQixNQUF5QyxDQUFDLENBQXZELEVBQTBEO0FBQ3hESixZQUFBQSxpQkFBaUIsQ0FBQzBDLElBQWxCLENBQXVCdEMsU0FBdkI7QUFDRDtBQUNGLFNBVEQsRUFaZ0IsQ0F1QmhCOztBQUNBLFlBQUl0RCxDQUFDLENBQUMwRixXQUFGLENBQWNDLENBQWQsQ0FBZ0JSLGVBQWhCLENBQUosRUFBc0M7QUFDcEM7QUFDQSxjQUFNTSxNQUFNLEdBQUd6RixDQUFDLENBQUMwRixXQUFGLENBQWNQLGVBQWQsQ0FBZjtBQUNBLGNBQU1kLElBQUksR0FBRy9ELFFBQVEsQ0FBQzhELGNBQVQsQ0FBd0JuQixPQUF4QixDQUFiLENBSG9DLENBSXBDOztBQUNBLGNBQUksQ0FBQ29CLElBQUwsRUFBVztBQUNULG1CQUFPdEIsZ0JBQWdCLENBQUNDLE9BQUQsRUFBVUMsT0FBVixFQUFtQkMsaUJBQW5CLEVBQXNDQyxTQUF0QyxDQUFoQixDQUFpRU0sSUFBakUsQ0FBc0UsWUFBTTtBQUNqRixxQkFBT2dDLE1BQU0sQ0FBQ0ksQ0FBUCxJQUFZSixNQUFuQjtBQUNELGFBRk0sQ0FBUDtBQUdELFdBSkQsTUFJTztBQUNMLG1CQUFPNUUsT0FBTyxDQUFDQyxPQUFSLENBQWdCMkUsTUFBTSxDQUFDSSxDQUFQLElBQVlKLE1BQTVCLENBQVA7QUFDRDtBQUNGLFNBcENlLENBc0NoQjtBQUNBOzs7QUFDQSxZQUFNSyxTQUFTLEdBQUcvQyxnQkFBZ0IsQ0FBQ0MsT0FBRCxFQUFVQyxPQUFWLEVBQW1CQyxpQkFBbkIsRUFBc0NDLFNBQXRDLENBQWxDLENBeENnQixDQXlDaEI7O0FBQ0EsWUFBSTRDLFNBQUo7QUFDQSxZQUFNQyxXQUFXLEdBQUdYLGNBQWMsQ0FBQzFDLEdBQWYsQ0FBbUIsVUFBQVcsU0FBUztBQUFBLDJCQUFPTyxRQUFQLGtCQUF1QlAsU0FBdkI7QUFBQSxTQUE1QixDQUFwQjtBQUNBMEMsUUFBQUEsV0FBVyxDQUFDekMsT0FBWixDQUFvQjZCLGVBQXBCLEVBNUNnQixDQTRDc0I7O0FBQ3RDLFlBQU1hLFFBQVEsYUFBTWpELE9BQU4sZ0JBQW1CZ0QsV0FBVyxDQUFDbEQsSUFBWixFQUFuQixDQUFkO0FBQ0FpRCxRQUFBQSxTQUFTLEdBQUcsSUFBSWxGLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDM0Msb0NBQVNrRixRQUFULEVBQW1CLFlBQU07QUFDdkIsZ0JBQUk7QUFDRkMsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksb0JBQVosRUFBa0NyQixJQUFsQzs7QUFDQSxrQkFBTVcsT0FBTSxHQUFHekYsQ0FBQyxDQUFDMEYsV0FBRixDQUFjUCxlQUFkLENBQWY7O0FBQ0FyRSxjQUFBQSxPQUFPLENBQUMyRSxPQUFNLENBQUNJLENBQVAsSUFBWUosT0FBYixDQUFQO0FBQ0QsYUFKRCxDQUlFLE9BQU9XLENBQVAsRUFBVTtBQUNWckYsY0FBQUEsTUFBTSxDQUFDcUYsQ0FBRCxDQUFOO0FBQ0Q7QUFDRixXQVJEO0FBU0QsU0FWVyxDQUFaO0FBV0EsZUFBT3ZGLE9BQU8sQ0FBQ3dGLEdBQVIsQ0FBWSxDQUFDUCxTQUFELEVBQVlDLFNBQVosQ0FBWixFQUFvQ3RDLElBQXBDLENBQXlDLGlCQUFrQjtBQUFBO0FBQUEsY0FBaEI2QyxFQUFnQjtBQUFBLGNBQVpiLE1BQVk7O0FBQ2hFLGlCQUFPQSxNQUFQO0FBQ0QsU0FGTSxXQUVFLFVBQUFXLENBQUMsRUFBSTtBQUNaRixVQUFBQSxPQUFPLENBQUNLLElBQVIsQ0FBYSx1QkFBYixFQUFzQ0gsQ0FBdEM7QUFDRCxTQUpNLENBQVA7QUFLRCxPQWhFTSxXQWdFRSxVQUFVSSxLQUFWLEVBQXNCO0FBQzdCTixRQUFBQSxPQUFPLENBQUNLLElBQVIsQ0FBYSxtQkFBYjtBQUNBLGNBQU1DLEtBQU47QUFDRCxPQW5FTSxDQUFQO0FBb0VEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjcmlwdGpzIGZyb20gJ3NjcmlwdGpzJztcbmltcG9ydCBjYW1lbENhc2UgZnJvbSAnY2FtZWxjYXNlJztcbmltcG9ydCBNdXJtdXJIYXNoMyBmcm9tICdpbXVybXVyaGFzaCc7XG5leHBvcnQgKiBmcm9tICcuL01haW4nO1xuXG5kZWNsYXJlIHZhciB3aW5kb3c6IFdpbmRvdywgZ2xvYmFsOiBhbnk7XG52YXIgZyA9IHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbDtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IHtcbiAgdHlwZTogc3RyaW5nO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGVuZm9yY2U6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBEZXBzID0ge1xuICBbbmFtZTogc3RyaW5nXTogRGVwVHlwZTtcbn1cblxuZXhwb3J0IHR5cGUgSlNPTk9wdCA9IHtcbiAgdGltZW91dD86IG51bWJlcjtcbiAgY2JLZXk/OiBzdHJpbmc7XG4gIGNiVmFsPzogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBsb2FkQ1NTKHVybDogc3RyaW5nKSB7XG4gIGNvbnN0IGNzc1Jvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgbGluay5ocmVmID0gdXJsO1xuXG4gIGNzc1Jvb3QuYXBwZW5kQ2hpbGQobGluayk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlPEhUTUxMaW5rRWxlbWVudD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiB7XG4gICAgICByZWplY3QoYGxvYWQgY3NzIGVycm9yOiAke3VybH1gKTtcbiAgICB9KTtcbiAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiByZXNvbHZlKGxpbmspKTtcbiAgfSk7XG5cbn1cblxuXG5jb25zdCBqc29ucCA9ICh1cmw6IHN0cmluZywgb3B0OiBKU09OT3B0ID0ge30sIGZuPzogRnVuY3Rpb24pID0+IHtcblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gb3B0XG4gICAgb3B0ID0ge31cbiAgfVxuXG4gIGxldCB7IHRpbWVvdXQgPSBudWxsLCBjYktleSA9ICdjYWxsYmFjaycsIGNiVmFsID0gJ2Zlbmd5dScgfSA9IG9wdFxuICBsZXQgdGltZXI6IG51bWJlcjtcblxuICBpZiAoY2JWYWwgPT09ICdmZW5neXUnKSB7XG4gICAgY2JWYWwgKz0gRGF0ZS5ub3coKVxuICB9XG5cbiAgbGV0IHMgPSAnJ1xuICBzICs9IGAmJHtjYktleX09JHtjYlZhbH1gXG5cbiAgcyA9IHMuc2xpY2UoMSlcblxuICB1cmwgKz0gKH51cmwuaW5kZXhPZignPycpID8gJyYnIDogJz8nKSArIHNcblxuICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcblxuICB2YXIgcmVtb3ZlID0gKCkgPT4ge1xuICAgIHRpbWVyICYmIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHNjcmlwdClcbiAgICBnW2NiVmFsXSA9IHVuZGVmaW5lZFxuICB9XG5cbiAgc2NyaXB0LnNyYyA9IHVybFxuXG5cbiAgaWYgKGZuICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZ1tjYlZhbF0gPSAoZGF0YTogYW55KSA9PiB7XG4gICAgICBmbihkYXRhKVxuICAgICAgcmVtb3ZlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgICByZXR1cm5cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogKGFyZzA6IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAoYXJnMDogRXJyb3IpID0+IHZvaWQpID0+IHtcbiAgICAvLyDor7fmsYLotoXml7ZcbiAgICBpZiAodGltZW91dCkge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignanNvbnAgcmVxdWVzdCB0aW1lb3V0JykpXG4gICAgICAgIHJlbW92ZSgpXG4gICAgICB9LCB0aW1lb3V0KVxuICAgIH1cbiAgICAvLyDmraPluLhcbiAgICBnW2NiVmFsXSA9ICguLi5hcmdzOiBhbnkpID0+IHtcbiAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICByZW1vdmUoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5mdW5jdGlvbiBnZXRCbHVyVmVyc2lvbih2ZXJzaW9uOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHZlcnNpb24uc3BsaXQoJy4nKS5tYXAoKHYsIGkpID0+IGkgPiAwID8gJ3gnIDogdikuam9pbignLicpO1xufVxuLy8gY29uc3QgX3JlcXVpcmVfID0gZy53ZWJwYWNrRGF0YTtcbi8vIGcud2VicGFja0RhdGEgPSBmdW5jdGlvbihtb2R1bGVJZDogYW55KSB7XG4vLyAgIGNvbnN0IG1vZHVsZSA9IF9yZXF1aXJlXy5tW21vZHVsZUlkXSBhcyBGdW5jdGlvbjtcbi8vICAgaWYgKCFtb2R1bGUpIHtcbi8vICAgICBjb25zb2xlLndhcm4obW9kdWxlSWQsICdjYW4gbm90IGJlIGZvdW5kZWQsIGNoZWNrIGNodW5rIGlzIGNvbXBsZXRpb24nKTtcbi8vICAgICByZXR1cm47XG4vLyAgIH1cbi8vICAgcmV0dXJuIF9yZXF1aXJlXy5jYWxsKHRoaXMsIG1vZHVsZUlkKTtcbi8vIH1cbi8vIE9iamVjdC5hc3NpZ24oZy53ZWJwYWNrRGF0YSwgX3JlcXVpcmVfKTtcblxuXG5mdW5jdGlvbiBsb2FkQ29tcG9uZW50Q3NzKGJhc2VVcmw6IHN0cmluZywgc3R5bGVJZDogc3RyaW5nLCBuZWVkQ29tYm9Dc3NDaHVuazogc3RyaW5nW10sIGNzc1ByZWZpeDogc3RyaW5nKSB7XG4gIGNvbnN0IGNvbXBvbmVudENzcyA9IGAke2Nzc1ByZWZpeH1pbmRleC5jc3NgO1xuICBjb25zdCBjb21ib0Nzc0NodW5rcyA9IG5lZWRDb21ib0Nzc0NodW5rLm1hcChjaHVua05hbWUgPT4gYCR7Y3NzUHJlZml4fWRlcHMvJHtjaHVua05hbWV9LmNzc2ApO1xuICBjb21ib0Nzc0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENzcyk7XG4gIGNvbnN0IGNvbWJvQ3NzVXJsID0gYCR7YmFzZVVybH0vPz8ke2NvbWJvQ3NzQ2h1bmtzLmpvaW4oKX1gO1xuXG5cbiAgcmV0dXJuIGxvYWRDU1MoY29tYm9Dc3NVcmwpLnRoZW4obGluayA9PiB7XG4gICAgbGluayAmJiBsaW5rLnNldEF0dHJpYnV0ZSgnaWQnLCBzdHlsZUlkKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIER5bmFtaWNSZXF1aXJlIHtcblxuICBiYXNlVXJsOiBzdHJpbmc7XG4gIGpzb25wVXJsOiBzdHJpbmc7XG4gIGhhc2hlZDogYm9vbGVhbjtcbiAgc2NyaXB0SWQ6IHN0cmluZztcbiAgc3R5bGVJZDogc3RyaW5nO1xuICBqc1ByZWZpeD86IHN0cmluZztcbiAgY3NzUHJlZml4Pzogc3RyaW5nO1xuICB1bmluc3RhbGw6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoeyBiYXNlVXJsLCBoYXNoZWQsIGpzUHJlZml4LCBjc3NQcmVmaXggfTogeyBiYXNlVXJsOiBzdHJpbmcsIGhhc2hlZD86IGJvb2xlYW4sIGpzUHJlZml4Pzogc3RyaW5nLCBjc3NQcmVmaXg/OiBzdHJpbmcgfSkge1xuICAgIGlmICghYmFzZVVybCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEeW5hbWljUmVxdWlyZSBiYXNlVXJsIHBhcmFtdGVycyBtdXN0IHNldHRlZCcpO1xuICAgIH1cbiAgICBjb25zdCBqc29ucFVybCA9IGAke2Jhc2VVcmx9L2pzb25wbW9kdWxlcy5qc2A7XG4gICAgY29uc3QgaGFzaElkID0gdGhpcy5nZW5IYXNoKGJhc2VVcmwpO1xuICAgIHRoaXMuc2NyaXB0SWQgPSBgJHtoYXNoSWR9X2pzYDtcbiAgICB0aGlzLnN0eWxlSWQgPSBgJHtoYXNoSWR9X2Nzc2A7XG4gICAgY29uc3QgdW5JbnN0YWxsRm4gPSAoKSA9PiB7XG4gICAgICBjb25zdCBqc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNjcmlwdElkKTtcbiAgICAgIGNvbnN0IGNzc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnN0eWxlSWQpO1xuICAgICAganNlICYmIGpzZS5yZW1vdmUoKTtcbiAgICAgIGNzc2UgJiYgY3NzZS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcbiAgICB0aGlzLmpzb25wVXJsID0ganNvbnBVcmw7XG4gICAgdGhpcy5oYXNoZWQgPSBoYXNoZWQ7XG4gICAgdGhpcy5qc1ByZWZpeCA9IGpzUHJlZml4O1xuICAgIHRoaXMuY3NzUHJlZml4ID0gY3NzUHJlZml4O1xuICAgIHRoaXMudW5pbnN0YWxsID0gdW5JbnN0YWxsRm47XG4gIH1cblxuICBnZW5IYXNoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBoYXNoU3RhdGUgPSBuZXcgTXVybXVySGFzaDMoKTtcbiAgICBoYXNoU3RhdGUuaGFzaCh2YWx1ZSk7XG4gICAgcmV0dXJuIGhhc2hTdGF0ZS5yZXN1bHQoKS50b1N0cmluZygxNikuc3Vic3RyKDAsIDYpO1xuICB9XG5cbiAgcmVxdWlyZShuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7IGJhc2VVcmwsIGpzb25wVXJsLCBoYXNoZWQsIGpzUHJlZml4ID0gJycsIGNzc1ByZWZpeCA9ICcnLCBzdHlsZUlkIH0gPSB0aGlzO1xuICAgIGNvbnN0IGpzb25wQ2FsbGJhY2sgPSBjYW1lbENhc2UobmFtZS5yZXBsYWNlKC9AL2csICckJykpLnJlcGxhY2UoL1xcLy9nLCAnXycpO1xuXG4gICAgcmV0dXJuIGpzb25wKGpzb25wVXJsLCB7XG4gICAgICBjYlZhbDoganNvbnBDYWxsYmFja1xuICAgIH0pLnRoZW4oKGFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZXM6IHN0cmluZ1tdID0gYXJnc1swXTtcbiAgICAgIGNvbnN0IGVudHJ5OiBzdHJpbmcgPSBhcmdzWzFdO1xuICAgICAgbGV0IGVudHJ5TW9kdWxlTmFtZSA9IGAke25hbWV9LyR7ZW50cnl9YDtcbiAgICAgIGNvbnN0IGNvbXBvbmVudENodW5rcyA9IGAke2pzUHJlZml4fXZlbmRvci5qcywke2pzUHJlZml4fWluZGV4LmpzYDtcbiAgICAgIGNvbnN0IG5lZWRDb21ib0Nzc0NodW5rOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgbmVlZENvbWJvQ2h1bms6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIGlmIChoYXNoZWQpIHtcbiAgICAgICAgZW50cnlNb2R1bGVOYW1lID0gdGhpcy5nZW5IYXNoKGVudHJ5TW9kdWxlTmFtZSk7XG4gICAgICB9XG4gIFxuICAgICAgbW9kdWxlcy5mb3JFYWNoKChbbW9kdWxlTmFtZSwgY2h1bmtOYW1lLCBpc0Nzc10pID0+IHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YS5jW21vZHVsZU5hbWVdO1xuICAgICAgICAvLyDlpoLmnpxtb2R1bGXkuI3lrZjlnKjvvIzmlL7liLBtb2R1bGXlr7nlupTnmoRjaHVua+WIsGNvbWJv5L+h5oGv6YeMXG4gICAgICAgIGlmICghbW9kdWxlICYmIG5lZWRDb21ib0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICBuZWVkQ29tYm9DaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ3NzICYmIG5lZWRDb21ib0Nzc0NodW5rLmluZGV4T2YoY2h1bmtOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICBuZWVkQ29tYm9Dc3NDaHVuay5wdXNoKGNodW5rTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICBcbiAgICAgIC8vIOW3sue7j+WKoOi9vei/h+S6hueahOmAu+i+kVxuICAgICAgaWYgKGcud2VicGFja0RhdGEuY1tlbnRyeU1vZHVsZU5hbWVdKSB7XG4gICAgICAgIC8vIGlmIHdlYnBhY2sgZW5hYmxlIGhtciBhYm92ZSByZXR1cm4geyBjaGlsZHJlbiwgZXhwb3J0cywgaG90IC4uLn1cbiAgICAgICAgY29uc3QgbW9kdWxlID0gZy53ZWJwYWNrRGF0YShlbnRyeU1vZHVsZU5hbWUpO1xuICAgICAgICBjb25zdCBjc3NlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3R5bGVJZCk7XG4gICAgICAgIC8vIOagt+W8j+W3sue7j+WNuOi9ve+8jOmHjeaWsOWKoOi9veWHuuadpVxuICAgICAgICBpZiAoIWNzc2UpIHtcbiAgICAgICAgICByZXR1cm4gbG9hZENvbXBvbmVudENzcyhiYXNlVXJsLCBzdHlsZUlkLCBuZWVkQ29tYm9Dc3NDaHVuaywgY3NzUHJlZml4KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtb2R1bGUuYSB8fCBtb2R1bGU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShtb2R1bGUuYSB8fCBtb2R1bGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gIFxuICAgICAgLy8g5paw5Yqg6L296YC76L6RXG4gICAgICAvLyDliqDovb1jc3NcbiAgICAgIGNvbnN0IHNzUHJvbWlzZSA9IGxvYWRDb21wb25lbnRDc3MoYmFzZVVybCwgc3R5bGVJZCwgbmVlZENvbWJvQ3NzQ2h1bmssIGNzc1ByZWZpeCk7XG4gICAgICAvLyDlubbooYzliqDovb1qc1xuICAgICAgbGV0IGpzUHJvbWlzZTtcbiAgICAgIGNvbnN0IGNvbWJvQ2h1bmtzID0gbmVlZENvbWJvQ2h1bmsubWFwKGNodW5rTmFtZSA9PiBgJHtqc1ByZWZpeH1kZXBzLyR7Y2h1bmtOYW1lfS5qc2ApXG4gICAgICBjb21ib0NodW5rcy51bnNoaWZ0KGNvbXBvbmVudENodW5rcyk7IC8vIOihpeS4iuW/hemhu+eahOe7hOS7tui1hOa6kFxuICAgICAgY29uc3QgY29tYm9VcmwgPSBgJHtiYXNlVXJsfS8/PyR7Y29tYm9DaHVua3Muam9pbigpfWA7XG4gICAgICBqc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIFNjcmlwdGpzKGNvbWJvVXJsLCAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsb2FkIGNvbWJvIGpzIGRvbmUnLCBuYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGcud2VicGFja0RhdGEoZW50cnlNb2R1bGVOYW1lKTtcbiAgICAgICAgICAgIHJlc29sdmUobW9kdWxlLmEgfHwgbW9kdWxlKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtzc1Byb21pc2UsIGpzUHJvbWlzZV0pLnRoZW4oKFtzcywgbW9kdWxlXSkgPT4ge1xuICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybignYm9vdGxvYWQgbW9kdWxlIGVycm9yJywgZSk7XG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2xvYWQgcmVtb3RlIGVycm9yJyk7XG4gICAgICB0aHJvdyBlcnJvclxuICAgIH0pO1xuICB9XG59XG5cbiJdfQ==
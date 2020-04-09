"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParseModuleData = ParseModuleData;
exports.GetIDForModule = GetIDForModule;
exports.Require = Require;
Object.defineProperty(exports, "GetModuleNameFromPath", {
  enumerable: true,
  get: function get() {
    return _Utils.GetModuleNameFromPath;
  }
});
Object.defineProperty(exports, "GetModuleNameFromVarName", {
  enumerable: true,
  get: function get() {
    return _Utils.GetModuleNameFromVarName;
  }
});
exports.moduleNames = exports.moduleIDs = exports.allModulesText = void 0;

var _Utils = require("./Utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var g = typeof window != "undefined" ? window : global;

function MakeGlobal(props) {
  for (var _key in props) {
    g[_key] = props[_key];
  }
}

// if webpack-data was not explicitly specified prior to library import, try to find the data
if (g.webpackData == null) {
  // if included using `module: "src/Main.ts"`, we can access webpack-data directly
  if (typeof __webpack_require__ != "undefined" && (__webpack_require__.m.length > 2 || Object.keys(__webpack_require__.m).length > 2)) {
    g.webpackData = __webpack_require__; // webpack3 don't hava r function

    if (!__webpack_require__.r) {
      // define __esModule on exports
      __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
          });
        }

        Object.defineProperty(exports, '__esModule', {
          value: true
        });
      };
    }
  } // else, try to access it using webpackJsonp (the function only seems to be available if CommonsChunkPlugin is used)
  else if (g.webpackJsonp) {
      var webpackVersion = g.webpackJsonp.length == 2 ? 1 : 2;

      if (webpackVersion == 1) {
        g.webpackJsonp([], {
          0: function _(module, exports, __webpack_require__) {
            g.webpackData = __webpack_require__;
          }
        });
      } else {
        g.webpackJsonp([], {
          123456: function _(module, exports, __webpack_require__) {
            g.webpackData = __webpack_require__;
          }
        }, [123456]);
      }
    } // else, give up and throw error
    else {
        throw new Error("window.webpackData must be set for webpack-runtime-require to function.".concat("\n", "You can do so either by setting it directly (to __webpack_require__), or by making window.webpackJsonp available. (eg. using CommonsChunkPlugin)"));
      }
}

var allModulesText;
exports.allModulesText = allModulesText;
var moduleIDs = {};
exports.moduleIDs = moduleIDs;
var moduleNames = {};
exports.moduleNames = moduleNames;

function ParseModuleData() {
  var forceRefresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  if (allModulesText != null && !forceRefresh) return;
  var moduleWrapperFuncs = Object.keys(g.webpackData.m).map(function (moduleID) {
    return g.webpackData.m[moduleID];
  });
  exports.allModulesText = allModulesText = moduleWrapperFuncs.map(function (a) {
    return a.toString();
  }).join("\n\n\n").replace(/\\"/g, "\""); // these are examples of before and after webpack's transformation: (based on which the 1st regex below finds path-comments)
  // 		require("react-redux-firebase") => var _reactReduxFirebase = __webpack_require__(/*! react-redux-firebase */ 100);
  // 		require("./Source/MyComponent") => var _MyComponent = __webpack_require__(/*! ./Source/MyComponent */ 200);
  //let requiresWithPathCommentsRegex = /__webpack_require__\(\/\*! ((?:.(?!\*))+) \*\/ (["'0-9a-zA-Z\/.-]+)\)/g;
  //let requiresWithPathCommentsRegex = /__webpack_require__\(\/\*! ((?:.(?!\*))+) \*\/ ["']?([^"'\)]+)["']?\)/g;

  var requiresWithPathCommentsRegex = /__webpack_require__\(\/\*! (.+?) \*\/ ["']?([^"'\)]+?)["']?\)/g; // these are examples of before and after webpack's transformation: (based on which the 2nd regex below finds paths)
  // 		require("jquery") => __webpack_require__("jquery")
  //let requiresWithPathsRegex = /__webpack_require__\([^")]*"(.+?)"\)/g;

  var requiresWithPathsRegex = /__webpack_require__\("(.+?)"\)/g; // only process plain requires-with-paths (ie. ignore ones that also have path-comments)
  // if requires have path-info embedded, use that (set using [webpackConfig.output.pathinfo: true])

  if (allModulesText.match(requiresWithPathCommentsRegex)) {
    for (var match; match = requiresWithPathCommentsRegex.exec(allModulesText);) {
      var _match = match,
          _match2 = _slicedToArray(_match, 3),
          _ = _match2[0],
          path = _match2[1],
          idStr = _match2[2];

      AddModuleEntry(idStr, (0, _Utils.GetModuleNameFromPath)(path));
    }
  } // if requires themselves are by-path, use that (set using [config.mode: "development"] or [config.optimization.namedModules: true])


  if (allModulesText.match(requiresWithPathsRegex)) {
    for (var _match3; _match3 = requiresWithPathsRegex.exec(allModulesText);) {
      var _match4 = _match3,
          _match5 = _slicedToArray(_match4, 2),
          _2 = _match5[0],
          _path = _match5[1];

      AddModuleEntry(_path, (0, _Utils.GetModuleNameFromPath)(_path));
    }
  } // else, infer it from the var-names of the imports


  if (!allModulesText.match(requiresWithPathsRegex) && !allModulesText.match(requiresWithPathCommentsRegex)) {
    // these are examples of before and after webpack's transformation: (which the regex below finds the var-name of)
    // 		require("react-redux-firebase") => var _reactReduxFirebase = __webpack_require__(100);
    // 		require("./Source/MyComponent") => var _MyComponent = __webpack_require__(200);
    var regex = /var ([a-zA-Z_]+) = __webpack_require__\(([0-9]+)\)/g;

    for (var _match6; _match6 = regex.exec(allModulesText);) {
      var _match7 = _match6,
          _match8 = _slicedToArray(_match7, 3),
          _3 = _match8[0],
          varName = _match8[1],
          _idStr = _match8[2];

      AddModuleEntry(parseInt(_idStr), (0, _Utils.GetModuleNameFromVarName)(varName));
    }
  }

  MakeGlobal({
    allModulesText: allModulesText,
    moduleIDs: moduleIDs,
    moduleNames: moduleNames
  });
}

var moduleCache = {};

function AddModuleEntry(moduleID, moduleName) {
  moduleIDs[moduleName] = moduleID;
  moduleNames[moduleID] = moduleName; // replace certain characters with underscores, so the module-entries can show in console auto-complete

  var moduleName_simple = moduleName.replace(/-/g, "_"); // make sure we add the module under a unique name

  while (moduleName_simple in moduleCache) {
    moduleName_simple += "_";
  } // add the module onto the Require function


  moduleCache[moduleName_simple] = GetModuleExports(moduleID);
}

function GetModuleExports(moduleID) {
  return g.webpackData.c[moduleID] ? g.webpackData.c[moduleID].exports : "[failed to retrieve module exports]";
}

MakeGlobal({
  GetIDForModule: GetIDForModule
});

function GetIDForModule(name) {
  ParseModuleData();
  return moduleIDs[name];
}

MakeGlobal({
  Require: Require
});

function Require(name) {
  if (name === undefined) return void ParseModuleData();
  var id = GetIDForModule(name);
  if (id == null) return "[could not find the given module]";
  return GetModuleExports(id);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJNYWtlR2xvYmFsIiwicHJvcHMiLCJrZXkiLCJ3ZWJwYWNrRGF0YSIsIl9fd2VicGFja19yZXF1aXJlX18iLCJtIiwibGVuZ3RoIiwiT2JqZWN0Iiwia2V5cyIsInIiLCJleHBvcnRzIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid2VicGFja0pzb25wIiwid2VicGFja1ZlcnNpb24iLCJtb2R1bGUiLCJFcnJvciIsImFsbE1vZHVsZXNUZXh0IiwibW9kdWxlSURzIiwibW9kdWxlTmFtZXMiLCJQYXJzZU1vZHVsZURhdGEiLCJmb3JjZVJlZnJlc2giLCJtb2R1bGVXcmFwcGVyRnVuY3MiLCJtYXAiLCJtb2R1bGVJRCIsImEiLCJ0b1N0cmluZyIsImpvaW4iLCJyZXBsYWNlIiwicmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXgiLCJyZXF1aXJlc1dpdGhQYXRoc1JlZ2V4IiwibWF0Y2giLCJleGVjIiwiXyIsInBhdGgiLCJpZFN0ciIsIkFkZE1vZHVsZUVudHJ5IiwicmVnZXgiLCJ2YXJOYW1lIiwicGFyc2VJbnQiLCJtb2R1bGVDYWNoZSIsIm1vZHVsZU5hbWUiLCJtb2R1bGVOYW1lX3NpbXBsZSIsIkdldE1vZHVsZUV4cG9ydHMiLCJjIiwiR2V0SURGb3JNb2R1bGUiLCJuYW1lIiwiUmVxdWlyZSIsInVuZGVmaW5lZCIsImlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7O0FBSUEsSUFBSUEsQ0FBQyxHQUFHLE9BQU9DLE1BQVAsSUFBaUIsV0FBakIsR0FBK0JBLE1BQS9CLEdBQXdDQyxNQUFoRDs7QUFDQSxTQUFTQyxVQUFULENBQW9CQyxLQUFwQixFQUFnQztBQUMvQixPQUFLLElBQUlDLElBQVQsSUFBZ0JELEtBQWhCO0FBQ0NKLElBQUFBLENBQUMsQ0FBQ0ssSUFB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LENBQUNNLFdBQUYsQ0FBYzJDLENBQWQsQ0FBZ0JwQixRQUFoQixFQUEwQmhCLE9BQXRELEdBQWdFLHFDQUF2RTtBQUNBOztBQUVEVixVQUFVLENBQUM7QUFBRStDLEVBQUFBLGNBQWMsRUFBZEE7QUFBRixDQUFELENBQVY7O0FBQ08sU0FBU0EsY0FBVCxDQUF3QkMsSUFBeEIsRUFBc0M7QUFDNUMxQixFQUFBQSxlQUFlO0FBQ2YsU0FBT0YsU0FBUyxDQUFDNEIsSUFBRCxDQUFoQjtBQUNBOztBQUVEaEQsVUFBVSxDQUFDO0FBQUVpRCxFQUFBQSxPQUFPLEVBQVBBO0FBQUYsQ0FBRCxDQUFWOztBQUNPLFNBQVNBLE9BQVQsQ0FBaUJELElBQWpCLEVBQStCO0FBQ3JDLE1BQUlBLElBQUksS0FBS0UsU0FBYixFQUNDLE9BQU8sS0FBSzVCLGVBQWUsRUFBM0I7QUFFRCxNQUFJNkIsRUFBRSxHQUFHSixjQUFjLENBQUNDLElBQUQsQ0FBdkI7QUFDQSxNQUFJRyxFQUFFLElBQUksSUFBVixFQUFnQixPQUFPLG1DQUFQO0FBQ2hCLFNBQU9OLGdCQUFnQixDQUFDTSxFQUFELENBQXZCO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHZXRNb2R1bGVOYW1lRnJvbVBhdGgsIEdldE1vZHVsZU5hbWVGcm9tVmFyTmFtZSB9IGZyb20gXCIuL1V0aWxzXCI7XG5leHBvcnQgeyBHZXRNb2R1bGVOYW1lRnJvbVBhdGgsIEdldE1vZHVsZU5hbWVGcm9tVmFyTmFtZSB9O1xuXG5kZWNsYXJlIHZhciB3aW5kb3c6IFdpbmRvdywgZ2xvYmFsOiBhbnk7XG52YXIgZyA9IHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbDtcbmZ1bmN0aW9uIE1ha2VHbG9iYWwocHJvcHM6IGFueSkge1xuXHRmb3IgKGxldCBrZXkgaW4gcHJvcHMpXG5cdFx0Z1trZXldID0gcHJvcHNba2V5XTtcbn1cblxuZGVjbGFyZSB2YXIgX193ZWJwYWNrX3JlcXVpcmVfXzogYW55O1xuLy8gaWYgd2VicGFjay1kYXRhIHdhcyBub3QgZXhwbGljaXRseSBzcGVjaWZpZWQgcHJpb3IgdG8gbGlicmFyeSBpbXBvcnQsIHRyeSB0byBmaW5kIHRoZSBkYXRhXG5pZiAoZy53ZWJwYWNrRGF0YSA9PSBudWxsKSB7XG5cdC8vIGlmIGluY2x1ZGVkIHVzaW5nIGBtb2R1bGU6IFwic3JjL01haW4udHNcImAsIHdlIGNhbiBhY2Nlc3Mgd2VicGFjay1kYXRhIGRpcmVjdGx5XG5cdGlmICh0eXBlb2YgX193ZWJwYWNrX3JlcXVpcmVfXyAhPSBcInVuZGVmaW5lZFwiICYmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm0ubGVuZ3RoID4gMiB8fCBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLm0pLmxlbmd0aCA+IDIpKSB7XG5cdFx0Zy53ZWJwYWNrRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX187XG5cdFx0Ly8gd2VicGFjazMgZG9uJ3QgaGF2YSByIGZ1bmN0aW9uXG5cdGlmICghX193ZWJwYWNrX3JlcXVpcmVfXy5yKSB7XG5cdFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuXHRcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uIChleHBvcnRzOiBhbnkpIHtcblx0XHRcdGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdFx0XHR9XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXHRcdH07XG5cdH1cblx0fVxuXHQvLyBlbHNlLCB0cnkgdG8gYWNjZXNzIGl0IHVzaW5nIHdlYnBhY2tKc29ucCAodGhlIGZ1bmN0aW9uIG9ubHkgc2VlbXMgdG8gYmUgYXZhaWxhYmxlIGlmIENvbW1vbnNDaHVua1BsdWdpbiBpcyB1c2VkKVxuXHRlbHNlIGlmIChnLndlYnBhY2tKc29ucCkge1xuXHRcdGxldCB3ZWJwYWNrVmVyc2lvbiA9IGcud2VicGFja0pzb25wLmxlbmd0aCA9PSAyID8gMSA6IDI7XG5cdFx0aWYgKHdlYnBhY2tWZXJzaW9uID09IDEpIHtcblx0XHRcdGcud2VicGFja0pzb25wKFtdLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0MDogZnVuY3Rpb24gKG1vZHVsZTogYW55LCBleHBvcnRzOiBhbnksIF9fd2VicGFja19yZXF1aXJlX186IGFueSkge1xuXHRcdFx0XHRcdFx0Zy53ZWJwYWNrRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX187XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnLndlYnBhY2tKc29ucChbXSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdDEyMzQ1NjogZnVuY3Rpb24gKG1vZHVsZTogYW55LCBleHBvcnRzOiBhbnksIF9fd2VicGFja19yZXF1aXJlX186IGFueSkge1xuXHRcdFx0XHRcdFx0Zy53ZWJwYWNrRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX187XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRbMTIzNDU2XVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblx0Ly8gZWxzZSwgZ2l2ZSB1cCBhbmQgdGhyb3cgZXJyb3Jcblx0ZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGB3aW5kb3cud2VicGFja0RhdGEgbXVzdCBiZSBzZXQgZm9yIHdlYnBhY2stcnVudGltZS1yZXF1aXJlIHRvIGZ1bmN0aW9uLiR7XCJcXG5cIlxuXHRcdFx0fVlvdSBjYW4gZG8gc28gZWl0aGVyIGJ5IHNldHRpbmcgaXQgZGlyZWN0bHkgKHRvIF9fd2VicGFja19yZXF1aXJlX18pLCBvciBieSBtYWtpbmcgd2luZG93LndlYnBhY2tKc29ucCBhdmFpbGFibGUuIChlZy4gdXNpbmcgQ29tbW9uc0NodW5rUGx1Z2luKWApO1xuXHR9XG5cbn1cblxuZXhwb3J0IHZhciBhbGxNb2R1bGVzVGV4dDogc3RyaW5nO1xuZXhwb3J0IHZhciBtb2R1bGVJRHMgPSB7fSBhcyB7IFtrZXk6IHN0cmluZ106IG51bWJlciB8IHN0cmluZyB9O1xuZXhwb3J0IHZhciBtb2R1bGVOYW1lcyA9IHt9IGFzIHsgW2tleTogbnVtYmVyXTogc3RyaW5nO1trZXk6IHN0cmluZ106IHN0cmluZzsgfTtcbmV4cG9ydCBmdW5jdGlvbiBQYXJzZU1vZHVsZURhdGEoZm9yY2VSZWZyZXNoID0gZmFsc2UpIHtcblx0aWYgKGFsbE1vZHVsZXNUZXh0ICE9IG51bGwgJiYgIWZvcmNlUmVmcmVzaCkgcmV0dXJuO1xuXG5cdGxldCBtb2R1bGVXcmFwcGVyRnVuY3MgPSBPYmplY3Qua2V5cyhnLndlYnBhY2tEYXRhLm0pLm1hcChtb2R1bGVJRCA9PiBnLndlYnBhY2tEYXRhLm1bbW9kdWxlSURdKTtcblx0YWxsTW9kdWxlc1RleHQgPSBtb2R1bGVXcmFwcGVyRnVuY3MubWFwKGEgPT4gYS50b1N0cmluZygpKS5qb2luKFwiXFxuXFxuXFxuXCIpLnJlcGxhY2UoL1xcXFxcIi9nLCBgXCJgKTtcblxuXHQvLyB0aGVzZSBhcmUgZXhhbXBsZXMgb2YgYmVmb3JlIGFuZCBhZnRlciB3ZWJwYWNrJ3MgdHJhbnNmb3JtYXRpb246IChiYXNlZCBvbiB3aGljaCB0aGUgMXN0IHJlZ2V4IGJlbG93IGZpbmRzIHBhdGgtY29tbWVudHMpXG5cdC8vIFx0XHRyZXF1aXJlKFwicmVhY3QtcmVkdXgtZmlyZWJhc2VcIikgPT4gdmFyIF9yZWFjdFJlZHV4RmlyZWJhc2UgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISByZWFjdC1yZWR1eC1maXJlYmFzZSAqLyAxMDApO1xuXHQvLyBcdFx0cmVxdWlyZShcIi4vU291cmNlL015Q29tcG9uZW50XCIpID0+IHZhciBfTXlDb21wb25lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL1NvdXJjZS9NeUNvbXBvbmVudCAqLyAyMDApO1xuXHQvL2xldCByZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoXFwvXFwqISAoKD86Lig/IVxcKikpKykgXFwqXFwvIChbXCInMC05YS16QS1aXFwvLi1dKylcXCkvZztcblx0Ly9sZXQgcmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXggPSAvX193ZWJwYWNrX3JlcXVpcmVfX1xcKFxcL1xcKiEgKCg/Oi4oPyFcXCopKSspIFxcKlxcLyBbXCInXT8oW15cIidcXCldKylbXCInXT9cXCkvZztcblx0bGV0IHJlcXVpcmVzV2l0aFBhdGhDb21tZW50c1JlZ2V4ID0gL19fd2VicGFja19yZXF1aXJlX19cXChcXC9cXCohICguKz8pIFxcKlxcLyBbXCInXT8oW15cIidcXCldKz8pW1wiJ10/XFwpL2c7XG5cdC8vIHRoZXNlIGFyZSBleGFtcGxlcyBvZiBiZWZvcmUgYW5kIGFmdGVyIHdlYnBhY2sncyB0cmFuc2Zvcm1hdGlvbjogKGJhc2VkIG9uIHdoaWNoIHRoZSAybmQgcmVnZXggYmVsb3cgZmluZHMgcGF0aHMpXG5cdC8vIFx0XHRyZXF1aXJlKFwianF1ZXJ5XCIpID0+IF9fd2VicGFja19yZXF1aXJlX18oXCJqcXVlcnlcIilcblx0Ly9sZXQgcmVxdWlyZXNXaXRoUGF0aHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoW15cIildKlwiKC4rPylcIlxcKS9nO1xuXHRsZXQgcmVxdWlyZXNXaXRoUGF0aHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoXCIoLis/KVwiXFwpL2c7IC8vIG9ubHkgcHJvY2VzcyBwbGFpbiByZXF1aXJlcy13aXRoLXBhdGhzIChpZS4gaWdub3JlIG9uZXMgdGhhdCBhbHNvIGhhdmUgcGF0aC1jb21tZW50cylcblxuXHQvLyBpZiByZXF1aXJlcyBoYXZlIHBhdGgtaW5mbyBlbWJlZGRlZCwgdXNlIHRoYXQgKHNldCB1c2luZyBbd2VicGFja0NvbmZpZy5vdXRwdXQucGF0aGluZm86IHRydWVdKVxuXHRpZiAoYWxsTW9kdWxlc1RleHQubWF0Y2gocmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXgpKSB7XG5cdFx0Zm9yIChsZXQgbWF0Y2g7IG1hdGNoID0gcmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXguZXhlYyhhbGxNb2R1bGVzVGV4dCk7KSB7XG5cdFx0XHRsZXQgW18sIHBhdGgsIGlkU3RyXSA9IG1hdGNoO1xuXHRcdFx0QWRkTW9kdWxlRW50cnkoaWRTdHIsIEdldE1vZHVsZU5hbWVGcm9tUGF0aChwYXRoKSk7XG5cdFx0fVxuXHR9XG5cdC8vIGlmIHJlcXVpcmVzIHRoZW1zZWx2ZXMgYXJlIGJ5LXBhdGgsIHVzZSB0aGF0IChzZXQgdXNpbmcgW2NvbmZpZy5tb2RlOiBcImRldmVsb3BtZW50XCJdIG9yIFtjb25maWcub3B0aW1pemF0aW9uLm5hbWVkTW9kdWxlczogdHJ1ZV0pXG5cdGlmIChhbGxNb2R1bGVzVGV4dC5tYXRjaChyZXF1aXJlc1dpdGhQYXRoc1JlZ2V4KSkge1xuXHRcdGZvciAobGV0IG1hdGNoOyBtYXRjaCA9IHJlcXVpcmVzV2l0aFBhdGhzUmVnZXguZXhlYyhhbGxNb2R1bGVzVGV4dCk7KSB7XG5cdFx0XHRsZXQgW18sIHBhdGhdID0gbWF0Y2g7XG5cdFx0XHRBZGRNb2R1bGVFbnRyeShwYXRoLCBHZXRNb2R1bGVOYW1lRnJvbVBhdGgocGF0aCkpO1xuXHRcdH1cblx0fVxuXHQvLyBlbHNlLCBpbmZlciBpdCBmcm9tIHRoZSB2YXItbmFtZXMgb2YgdGhlIGltcG9ydHNcblx0aWYgKCFhbGxNb2R1bGVzVGV4dC5tYXRjaChyZXF1aXJlc1dpdGhQYXRoc1JlZ2V4KSAmJiAhYWxsTW9kdWxlc1RleHQubWF0Y2gocmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXgpKSB7XG5cdFx0Ly8gdGhlc2UgYXJlIGV4YW1wbGVzIG9mIGJlZm9yZSBhbmQgYWZ0ZXIgd2VicGFjaydzIHRyYW5zZm9ybWF0aW9uOiAod2hpY2ggdGhlIHJlZ2V4IGJlbG93IGZpbmRzIHRoZSB2YXItbmFtZSBvZilcblx0XHQvLyBcdFx0cmVxdWlyZShcInJlYWN0LXJlZHV4LWZpcmViYXNlXCIpID0+IHZhciBfcmVhY3RSZWR1eEZpcmViYXNlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMDApO1xuXHRcdC8vIFx0XHRyZXF1aXJlKFwiLi9Tb3VyY2UvTXlDb21wb25lbnRcIikgPT4gdmFyIF9NeUNvbXBvbmVudCA9IF9fd2VicGFja19yZXF1aXJlX18oMjAwKTtcblx0XHRsZXQgcmVnZXggPSAvdmFyIChbYS16QS1aX10rKSA9IF9fd2VicGFja19yZXF1aXJlX19cXCgoWzAtOV0rKVxcKS9nO1xuXHRcdGZvciAobGV0IG1hdGNoOyBtYXRjaCA9IHJlZ2V4LmV4ZWMoYWxsTW9kdWxlc1RleHQpOykge1xuXHRcdFx0bGV0IFtfLCB2YXJOYW1lLCBpZFN0cl0gPSBtYXRjaDtcblx0XHRcdEFkZE1vZHVsZUVudHJ5KHBhcnNlSW50KGlkU3RyKSwgR2V0TW9kdWxlTmFtZUZyb21WYXJOYW1lKHZhck5hbWUpKTtcblx0XHR9XG5cdH1cblxuXHRNYWtlR2xvYmFsKHsgYWxsTW9kdWxlc1RleHQsIG1vZHVsZUlEcywgbW9kdWxlTmFtZXMgfSk7XG59XG5cbmNvbnN0IG1vZHVsZUNhY2hlOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge1xufTtcblxuZnVuY3Rpb24gQWRkTW9kdWxlRW50cnkobW9kdWxlSUQ6IHN0cmluZyB8IG51bWJlciwgbW9kdWxlTmFtZTogc3RyaW5nKSB7XG5cdG1vZHVsZUlEc1ttb2R1bGVOYW1lXSA9IG1vZHVsZUlEO1xuXHRtb2R1bGVOYW1lc1ttb2R1bGVJRF0gPSBtb2R1bGVOYW1lO1xuXG5cdC8vIHJlcGxhY2UgY2VydGFpbiBjaGFyYWN0ZXJzIHdpdGggdW5kZXJzY29yZXMsIHNvIHRoZSBtb2R1bGUtZW50cmllcyBjYW4gc2hvdyBpbiBjb25zb2xlIGF1dG8tY29tcGxldGVcblx0bGV0IG1vZHVsZU5hbWVfc2ltcGxlID0gbW9kdWxlTmFtZS5yZXBsYWNlKC8tL2csIFwiX1wiKTtcblx0Ly8gbWFrZSBzdXJlIHdlIGFkZCB0aGUgbW9kdWxlIHVuZGVyIGEgdW5pcXVlIG5hbWVcblx0d2hpbGUgKG1vZHVsZU5hbWVfc2ltcGxlIGluIG1vZHVsZUNhY2hlKSBtb2R1bGVOYW1lX3NpbXBsZSArPSBgX2A7XG5cdC8vIGFkZCB0aGUgbW9kdWxlIG9udG8gdGhlIFJlcXVpcmUgZnVuY3Rpb25cblx0bW9kdWxlQ2FjaGVbbW9kdWxlTmFtZV9zaW1wbGVdID0gR2V0TW9kdWxlRXhwb3J0cyhtb2R1bGVJRCk7XG59XG5mdW5jdGlvbiBHZXRNb2R1bGVFeHBvcnRzKG1vZHVsZUlEOiBudW1iZXIgfCBzdHJpbmcpIHtcblx0cmV0dXJuIGcud2VicGFja0RhdGEuY1ttb2R1bGVJRF0gPyBnLndlYnBhY2tEYXRhLmNbbW9kdWxlSURdLmV4cG9ydHMgOiBcIltmYWlsZWQgdG8gcmV0cmlldmUgbW9kdWxlIGV4cG9ydHNdXCI7XG59XG5cbk1ha2VHbG9iYWwoeyBHZXRJREZvck1vZHVsZSB9KTtcbmV4cG9ydCBmdW5jdGlvbiBHZXRJREZvck1vZHVsZShuYW1lOiBzdHJpbmcpIHtcblx0UGFyc2VNb2R1bGVEYXRhKCk7XG5cdHJldHVybiBtb2R1bGVJRHNbbmFtZV07XG59XG5cbk1ha2VHbG9iYWwoeyBSZXF1aXJlIH0pO1xuZXhwb3J0IGZ1bmN0aW9uIFJlcXVpcmUobmFtZTogc3RyaW5nKSB7XG5cdGlmIChuYW1lID09PSB1bmRlZmluZWQpXG5cdFx0cmV0dXJuIHZvaWQgUGFyc2VNb2R1bGVEYXRhKCk7XG5cblx0bGV0IGlkID0gR2V0SURGb3JNb2R1bGUobmFtZSk7XG5cdGlmIChpZCA9PSBudWxsKSByZXR1cm4gXCJbY291bGQgbm90IGZpbmQgdGhlIGdpdmVuIG1vZHVsZV1cIjtcblx0cmV0dXJuIEdldE1vZHVsZUV4cG9ydHMoaWQpO1xufSJdfQ==
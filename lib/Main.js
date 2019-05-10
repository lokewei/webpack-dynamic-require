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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

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
    g.webpackData = __webpack_require__;
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
          _ = _match5[0],
          path = _match5[1];

      AddModuleEntry(path, (0, _Utils.GetModuleNameFromPath)(path));
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
          _ = _match8[0],
          varName = _match8[1],
          idStr = _match8[2];

      AddModuleEntry(parseInt(idStr), (0, _Utils.GetModuleNameFromVarName)(varName));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJNYWtlR2xvYmFsIiwicHJvcHMiLCJrZXkiLCJ3ZWJwYWNrRGF0YSIsIl9fd2VicGFja19yZXF1aXJlX18iLCJtIiwibGVuZ3RoIiwiT2JqZWN0Iiwia2V5cyIsIndlYnBhY2tKc29ucCIsIndlYnBhY2tWZXJzaW9uIiwibW9kdWxlIiwiZXhwb3J0cyIsIkVycm9yIiwiYWxsTW9kdWxlc1RleHQiLCJtb2R1bGVJRHMiLCJtb2R1bGVOYW1lcyIsIlBhcnNlTW9kdWxlRGF0YSIsImZvcmNlUmVmcmVzaCIsIm1vZHVsZVdyYXBwZXJGdW5jcyIsIm1hcCIsIm1vZHVsZUlEIiwiYSIsInRvU3RyaW5nIiwiam9pbiIsInJlcGxhY2UiLCJyZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleCIsInJlcXVpcmVzV2l0aFBhdGhzUmVnZXgiLCJtYXRjaCIsImV4ZWMiLCJfIiwicGF0aCIsImlkU3RyIiwiQWRkTW9kdWxlRW50cnkiLCJyZWdleCIsInZhck5hbWUiLCJwYXJzZUludCIsIm1vZHVsZUNhY2hlIiwibW9kdWxlTmFtZSIsIm1vZHVsZU5hbWVfc2ltcGxlIiwiR2V0TW9kdWxlRXhwb3J0cyIsImMiLCJHZXRJREZvck1vZHVsZSIsIm5hbWUiLCJSZXF1aXJlIiwidW5kZWZpbmVkIiwiaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7OztBQUlBLElBQUlBLENBQUMsR0FBRyxPQUFPQyxNQUFQLElBQWlCLFdBQWpCLEdBQStCQSxNQUEvQixHQUF3Q0MsTUFBaEQ7O0FBQ0EsU0FBU0MsVUFBVCxDQUFvQkMsS0FBcEIsRUFBZ0M7QUFDL0IsT0FBSyxJQUFJQyxJQUFULElBQWdCRCxLQUFoQjtBQUNDSixJQUFBQSxDQUFDLENBQUNLLElBQUQsQ0FBRCxHQUFTRCxLQUFLLENBQUNDLElBQUQsQ0FBZDtBQUREO0FBRUE7O0FBR0Q7QUFDQSxJ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U0FBT04sZ0JBQWdCLENBQUNNLEVBQUQsQ0FBdkI7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7R2V0TW9kdWxlTmFtZUZyb21QYXRoLCBHZXRNb2R1bGVOYW1lRnJvbVZhck5hbWV9IGZyb20gXCIuL1V0aWxzXCI7XG5leHBvcnQge0dldE1vZHVsZU5hbWVGcm9tUGF0aCwgR2V0TW9kdWxlTmFtZUZyb21WYXJOYW1lfTtcblxuZGVjbGFyZSB2YXIgd2luZG93OiBXaW5kb3csIGdsb2JhbDogYW55O1xudmFyIGcgPSB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWw7XG5mdW5jdGlvbiBNYWtlR2xvYmFsKHByb3BzOiBhbnkpIHtcblx0Zm9yIChsZXQga2V5IGluIHByb3BzKVxuXHRcdGdba2V5XSA9IHByb3BzW2tleV07XG59XG5cbmRlY2xhcmUgdmFyIF9fd2VicGFja19yZXF1aXJlX18gOiBhbnk7XG4vLyBpZiB3ZWJwYWNrLWRhdGEgd2FzIG5vdCBleHBsaWNpdGx5IHNwZWNpZmllZCBwcmlvciB0byBsaWJyYXJ5IGltcG9ydCwgdHJ5IHRvIGZpbmQgdGhlIGRhdGFcbmlmIChnLndlYnBhY2tEYXRhID09IG51bGwpIHtcblx0Ly8gaWYgaW5jbHVkZWQgdXNpbmcgYG1vZHVsZTogXCJzcmMvTWFpbi50c1wiYCwgd2UgY2FuIGFjY2VzcyB3ZWJwYWNrLWRhdGEgZGlyZWN0bHlcblx0aWYgKHR5cGVvZiBfX3dlYnBhY2tfcmVxdWlyZV9fICE9IFwidW5kZWZpbmVkXCIgJiYgKF9fd2VicGFja19yZXF1aXJlX18ubS5sZW5ndGggPiAyIHx8IE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18ubSkubGVuZ3RoID4gMikpIHtcblx0XHRnLndlYnBhY2tEYXRhID0gX193ZWJwYWNrX3JlcXVpcmVfXztcblx0fVxuXHQvLyBlbHNlLCB0cnkgdG8gYWNjZXNzIGl0IHVzaW5nIHdlYnBhY2tKc29ucCAodGhlIGZ1bmN0aW9uIG9ubHkgc2VlbXMgdG8gYmUgYXZhaWxhYmxlIGlmIENvbW1vbnNDaHVua1BsdWdpbiBpcyB1c2VkKVxuXHRlbHNlIGlmIChnLndlYnBhY2tKc29ucCkge1xuXHRcdGxldCB3ZWJwYWNrVmVyc2lvbiA9IGcud2VicGFja0pzb25wLmxlbmd0aCA9PSAyID8gMSA6IDI7XG5cdFx0aWYgKHdlYnBhY2tWZXJzaW9uID09IDEpIHtcblx0XHRcdGcud2VicGFja0pzb25wKFtdLFxuXHRcdFx0XHR7MDogZnVuY3Rpb24obW9kdWxlOiBhbnksIGV4cG9ydHM6IGFueSwgX193ZWJwYWNrX3JlcXVpcmVfXzogYW55KSB7XG5cdFx0XHRcdFx0Zy53ZWJwYWNrRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX187XG5cdFx0XHRcdH19XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRnLndlYnBhY2tKc29ucChbXSxcblx0XHRcdFx0ezEyMzQ1NjogZnVuY3Rpb24obW9kdWxlOiBhbnksIGV4cG9ydHM6IGFueSwgX193ZWJwYWNrX3JlcXVpcmVfXzogYW55KSB7XG5cdFx0XHRcdFx0Zy53ZWJwYWNrRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX187XG5cdFx0XHRcdH19LFxuXHRcdFx0XHRbMTIzNDU2XVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblx0Ly8gZWxzZSwgZ2l2ZSB1cCBhbmQgdGhyb3cgZXJyb3Jcblx0ZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGB3aW5kb3cud2VicGFja0RhdGEgbXVzdCBiZSBzZXQgZm9yIHdlYnBhY2stcnVudGltZS1yZXF1aXJlIHRvIGZ1bmN0aW9uLiR7XCJcXG5cIlxuXHRcdFx0fVlvdSBjYW4gZG8gc28gZWl0aGVyIGJ5IHNldHRpbmcgaXQgZGlyZWN0bHkgKHRvIF9fd2VicGFja19yZXF1aXJlX18pLCBvciBieSBtYWtpbmcgd2luZG93LndlYnBhY2tKc29ucCBhdmFpbGFibGUuIChlZy4gdXNpbmcgQ29tbW9uc0NodW5rUGx1Z2luKWApO1xuXHR9XG59XG5cbmV4cG9ydCB2YXIgYWxsTW9kdWxlc1RleHQ6IHN0cmluZztcbmV4cG9ydCB2YXIgbW9kdWxlSURzID0ge30gYXMge1trZXk6IHN0cmluZ106IG51bWJlciB8IHN0cmluZ307XG5leHBvcnQgdmFyIG1vZHVsZU5hbWVzID0ge30gYXMge1trZXk6IG51bWJlcl06IHN0cmluZzsgW2tleTogc3RyaW5nXTogc3RyaW5nO307XG5leHBvcnQgZnVuY3Rpb24gUGFyc2VNb2R1bGVEYXRhKGZvcmNlUmVmcmVzaCA9IGZhbHNlKSB7XG5cdGlmIChhbGxNb2R1bGVzVGV4dCAhPSBudWxsICYmICFmb3JjZVJlZnJlc2gpIHJldHVybjtcblxuXHRsZXQgbW9kdWxlV3JhcHBlckZ1bmNzID0gT2JqZWN0LmtleXMoZy53ZWJwYWNrRGF0YS5tKS5tYXAobW9kdWxlSUQ9Pmcud2VicGFja0RhdGEubVttb2R1bGVJRF0pO1xuXHRhbGxNb2R1bGVzVGV4dCA9IG1vZHVsZVdyYXBwZXJGdW5jcy5tYXAoYT0+YS50b1N0cmluZygpKS5qb2luKFwiXFxuXFxuXFxuXCIpLnJlcGxhY2UoL1xcXFxcIi9nLCBgXCJgKTtcblxuXHQvLyB0aGVzZSBhcmUgZXhhbXBsZXMgb2YgYmVmb3JlIGFuZCBhZnRlciB3ZWJwYWNrJ3MgdHJhbnNmb3JtYXRpb246IChiYXNlZCBvbiB3aGljaCB0aGUgMXN0IHJlZ2V4IGJlbG93IGZpbmRzIHBhdGgtY29tbWVudHMpXG5cdC8vIFx0XHRyZXF1aXJlKFwicmVhY3QtcmVkdXgtZmlyZWJhc2VcIikgPT4gdmFyIF9yZWFjdFJlZHV4RmlyZWJhc2UgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISByZWFjdC1yZWR1eC1maXJlYmFzZSAqLyAxMDApO1xuXHQvLyBcdFx0cmVxdWlyZShcIi4vU291cmNlL015Q29tcG9uZW50XCIpID0+IHZhciBfTXlDb21wb25lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL1NvdXJjZS9NeUNvbXBvbmVudCAqLyAyMDApO1xuXHQvL2xldCByZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoXFwvXFwqISAoKD86Lig/IVxcKikpKykgXFwqXFwvIChbXCInMC05YS16QS1aXFwvLi1dKylcXCkvZztcblx0Ly9sZXQgcmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXggPSAvX193ZWJwYWNrX3JlcXVpcmVfX1xcKFxcL1xcKiEgKCg/Oi4oPyFcXCopKSspIFxcKlxcLyBbXCInXT8oW15cIidcXCldKylbXCInXT9cXCkvZztcblx0bGV0IHJlcXVpcmVzV2l0aFBhdGhDb21tZW50c1JlZ2V4ID0gL19fd2VicGFja19yZXF1aXJlX19cXChcXC9cXCohICguKz8pIFxcKlxcLyBbXCInXT8oW15cIidcXCldKz8pW1wiJ10/XFwpL2c7XG5cdC8vIHRoZXNlIGFyZSBleGFtcGxlcyBvZiBiZWZvcmUgYW5kIGFmdGVyIHdlYnBhY2sncyB0cmFuc2Zvcm1hdGlvbjogKGJhc2VkIG9uIHdoaWNoIHRoZSAybmQgcmVnZXggYmVsb3cgZmluZHMgcGF0aHMpXG5cdC8vIFx0XHRyZXF1aXJlKFwianF1ZXJ5XCIpID0+IF9fd2VicGFja19yZXF1aXJlX18oXCJqcXVlcnlcIilcblx0Ly9sZXQgcmVxdWlyZXNXaXRoUGF0aHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoW15cIildKlwiKC4rPylcIlxcKS9nO1xuXHRsZXQgcmVxdWlyZXNXaXRoUGF0aHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoXCIoLis/KVwiXFwpL2c7IC8vIG9ubHkgcHJvY2VzcyBwbGFpbiByZXF1aXJlcy13aXRoLXBhdGhzIChpZS4gaWdub3JlIG9uZXMgdGhhdCBhbHNvIGhhdmUgcGF0aC1jb21tZW50cylcblxuXHQvLyBpZiByZXF1aXJlcyBoYXZlIHBhdGgtaW5mbyBlbWJlZGRlZCwgdXNlIHRoYXQgKHNldCB1c2luZyBbd2VicGFja0NvbmZpZy5vdXRwdXQucGF0aGluZm86IHRydWVdKVxuXHRpZiAoYWxsTW9kdWxlc1RleHQubWF0Y2gocmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXgpKSB7XG5cdFx0Zm9yIChsZXQgbWF0Y2g7IG1hdGNoID0gcmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXguZXhlYyhhbGxNb2R1bGVzVGV4dCk7KSB7XG5cdFx0XHRsZXQgW18sIHBhdGgsIGlkU3RyXSA9IG1hdGNoO1xuXHRcdFx0QWRkTW9kdWxlRW50cnkoaWRTdHIsIEdldE1vZHVsZU5hbWVGcm9tUGF0aChwYXRoKSk7XG5cdFx0fVxuXHR9XG5cdC8vIGlmIHJlcXVpcmVzIHRoZW1zZWx2ZXMgYXJlIGJ5LXBhdGgsIHVzZSB0aGF0IChzZXQgdXNpbmcgW2NvbmZpZy5tb2RlOiBcImRldmVsb3BtZW50XCJdIG9yIFtjb25maWcub3B0aW1pemF0aW9uLm5hbWVkTW9kdWxlczogdHJ1ZV0pXG5cdGlmIChhbGxNb2R1bGVzVGV4dC5tYXRjaChyZXF1aXJlc1dpdGhQYXRoc1JlZ2V4KSkge1xuXHRcdGZvciAobGV0IG1hdGNoOyBtYXRjaCA9IHJlcXVpcmVzV2l0aFBhdGhzUmVnZXguZXhlYyhhbGxNb2R1bGVzVGV4dCk7KSB7XG5cdFx0XHRsZXQgW18sIHBhdGhdID0gbWF0Y2g7XG5cdFx0XHRBZGRNb2R1bGVFbnRyeShwYXRoLCBHZXRNb2R1bGVOYW1lRnJvbVBhdGgocGF0aCkpO1xuXHRcdH1cblx0fVxuXHQvLyBlbHNlLCBpbmZlciBpdCBmcm9tIHRoZSB2YXItbmFtZXMgb2YgdGhlIGltcG9ydHNcblx0aWYgKCFhbGxNb2R1bGVzVGV4dC5tYXRjaChyZXF1aXJlc1dpdGhQYXRoc1JlZ2V4KSAmJiAhYWxsTW9kdWxlc1RleHQubWF0Y2gocmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXgpKSB7XG5cdFx0Ly8gdGhlc2UgYXJlIGV4YW1wbGVzIG9mIGJlZm9yZSBhbmQgYWZ0ZXIgd2VicGFjaydzIHRyYW5zZm9ybWF0aW9uOiAod2hpY2ggdGhlIHJlZ2V4IGJlbG93IGZpbmRzIHRoZSB2YXItbmFtZSBvZilcblx0XHQvLyBcdFx0cmVxdWlyZShcInJlYWN0LXJlZHV4LWZpcmViYXNlXCIpID0+IHZhciBfcmVhY3RSZWR1eEZpcmViYXNlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMDApO1xuXHRcdC8vIFx0XHRyZXF1aXJlKFwiLi9Tb3VyY2UvTXlDb21wb25lbnRcIikgPT4gdmFyIF9NeUNvbXBvbmVudCA9IF9fd2VicGFja19yZXF1aXJlX18oMjAwKTtcblx0XHRsZXQgcmVnZXggPSAvdmFyIChbYS16QS1aX10rKSA9IF9fd2VicGFja19yZXF1aXJlX19cXCgoWzAtOV0rKVxcKS9nO1xuXHRcdGZvciAobGV0IG1hdGNoOyBtYXRjaCA9IHJlZ2V4LmV4ZWMoYWxsTW9kdWxlc1RleHQpOykge1xuXHRcdFx0bGV0IFtfLCB2YXJOYW1lLCBpZFN0cl0gPSBtYXRjaDtcblx0XHRcdEFkZE1vZHVsZUVudHJ5KHBhcnNlSW50KGlkU3RyKSwgR2V0TW9kdWxlTmFtZUZyb21WYXJOYW1lKHZhck5hbWUpKTtcblx0XHR9XG5cdH1cblxuXHRNYWtlR2xvYmFsKHthbGxNb2R1bGVzVGV4dCwgbW9kdWxlSURzLCBtb2R1bGVOYW1lc30pO1xufVxuXG5jb25zdCBtb2R1bGVDYWNoZSA6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge1xufTtcblxuZnVuY3Rpb24gQWRkTW9kdWxlRW50cnkobW9kdWxlSUQ6IHN0cmluZyB8IG51bWJlciwgbW9kdWxlTmFtZTogc3RyaW5nKSB7XG5cdG1vZHVsZUlEc1ttb2R1bGVOYW1lXSA9IG1vZHVsZUlEO1xuXHRtb2R1bGVOYW1lc1ttb2R1bGVJRF0gPSBtb2R1bGVOYW1lO1xuXG5cdC8vIHJlcGxhY2UgY2VydGFpbiBjaGFyYWN0ZXJzIHdpdGggdW5kZXJzY29yZXMsIHNvIHRoZSBtb2R1bGUtZW50cmllcyBjYW4gc2hvdyBpbiBjb25zb2xlIGF1dG8tY29tcGxldGVcblx0bGV0IG1vZHVsZU5hbWVfc2ltcGxlID0gbW9kdWxlTmFtZS5yZXBsYWNlKC8tL2csIFwiX1wiKTtcblx0Ly8gbWFrZSBzdXJlIHdlIGFkZCB0aGUgbW9kdWxlIHVuZGVyIGEgdW5pcXVlIG5hbWVcblx0d2hpbGUgKG1vZHVsZU5hbWVfc2ltcGxlIGluIG1vZHVsZUNhY2hlKSBtb2R1bGVOYW1lX3NpbXBsZSArPSBgX2A7XG5cdC8vIGFkZCB0aGUgbW9kdWxlIG9udG8gdGhlIFJlcXVpcmUgZnVuY3Rpb25cblx0bW9kdWxlQ2FjaGVbbW9kdWxlTmFtZV9zaW1wbGVdID0gR2V0TW9kdWxlRXhwb3J0cyhtb2R1bGVJRCk7XG59XG5mdW5jdGlvbiBHZXRNb2R1bGVFeHBvcnRzKG1vZHVsZUlEOiBudW1iZXIgfCBzdHJpbmcpIHtcblx0cmV0dXJuIGcud2VicGFja0RhdGEuY1ttb2R1bGVJRF0gPyBnLndlYnBhY2tEYXRhLmNbbW9kdWxlSURdLmV4cG9ydHMgOiBcIltmYWlsZWQgdG8gcmV0cmlldmUgbW9kdWxlIGV4cG9ydHNdXCI7XG59XG5cbk1ha2VHbG9iYWwoe0dldElERm9yTW9kdWxlfSk7XG5leHBvcnQgZnVuY3Rpb24gR2V0SURGb3JNb2R1bGUobmFtZTogc3RyaW5nKSB7XG5cdFBhcnNlTW9kdWxlRGF0YSgpO1xuXHRyZXR1cm4gbW9kdWxlSURzW25hbWVdO1xufVxuXG5NYWtlR2xvYmFsKHtSZXF1aXJlfSk7XG5leHBvcnQgZnVuY3Rpb24gUmVxdWlyZShuYW1lOiBzdHJpbmcpIHtcblx0aWYgKG5hbWUgPT09IHVuZGVmaW5lZClcblx0XHRyZXR1cm4gdm9pZCBQYXJzZU1vZHVsZURhdGEoKTtcblxuXHRsZXQgaWQgPSBHZXRJREZvck1vZHVsZShuYW1lKTtcblx0aWYgKGlkID09IG51bGwpIHJldHVybiBcIltjb3VsZCBub3QgZmluZCB0aGUgZ2l2ZW4gbW9kdWxlXVwiO1xuXHRyZXR1cm4gR2V0TW9kdWxlRXhwb3J0cyhpZCk7XG59Il19
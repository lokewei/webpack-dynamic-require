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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbImciLCJ3aW5kb3ciLCJnbG9iYWwiLCJNYWtlR2xvYmFsIiwicHJvcHMiLCJrZXkiLCJ3ZWJwYWNrRGF0YSIsIl9fd2VicGFja19yZXF1aXJlX18iLCJtIiwibGVuZ3RoIiwiT2JqZWN0Iiwia2V5cyIsInIiLCJleHBvcnRzIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid2VicGFja0pzb25wIiwid2VicGFja1ZlcnNpb24iLCJtb2R1bGUiLCJFcnJvciIsImFsbE1vZHVsZXNUZXh0IiwibW9kdWxlSURzIiwibW9kdWxlTmFtZXMiLCJQYXJzZU1vZHVsZURhdGEiLCJmb3JjZVJlZnJlc2giLCJtb2R1bGVXcmFwcGVyRnVuY3MiLCJtYXAiLCJtb2R1bGVJRCIsImEiLCJ0b1N0cmluZyIsImpvaW4iLCJyZXBsYWNlIiwicmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXgiLCJyZXF1aXJlc1dpdGhQYXRoc1JlZ2V4IiwibWF0Y2giLCJleGVjIiwiXyIsInBhdGgiLCJpZFN0ciIsIkFkZE1vZHVsZUVudHJ5IiwicmVnZXgiLCJ2YXJOYW1lIiwicGFyc2VJbnQiLCJtb2R1bGVDYWNoZSIsIm1vZHVsZU5hbWUiLCJtb2R1bGVOYW1lX3NpbXBsZSIsIkdldE1vZHVsZUV4cG9ydHMiLCJjIiwiR2V0SURGb3JNb2R1bGUiLCJuYW1lIiwiUmVxdWlyZSIsInVuZGVmaW5lZCIsImlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUFJQSxJQUFJQSxDQUFDLEdBQUcsT0FBT0MsTUFBUCxJQUFpQixXQUFqQixHQUErQkEsTUFBL0IsR0FBd0NDLE1BQWhEOztBQUNBLFNBQVNDLFVBQVQsQ0FBb0JDLEtBQXBCLEVBQWdDO0FBQy9CLE9BQUssSUFBSUMsSUFBVCxJQUFnQkQsS0FBaEI7QUFDQ0osSUFBQUEsQ0FBQyxDQUFDSyxJQUFELENB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Q00sV0FBRixDQUFjMkMsQ0FBZCxDQUFnQnBCLFFBQWhCLEVBQTBCaEIsT0FBdEQsR0FBZ0UscUNBQXZFO0FBQ0E7O0FBRURWLFVBQVUsQ0FBQztBQUFFK0MsRUFBQUEsY0FBYyxFQUFkQTtBQUFGLENBQUQsQ0FBVjs7QUFDTyxTQUFTQSxjQUFULENBQXdCQyxJQUF4QixFQUFzQztBQUM1QzFCLEVBQUFBLGVBQWU7QUFDZixTQUFPRixTQUFTLENBQUM0QixJQUFELENBQWhCO0FBQ0E7O0FBRURoRCxVQUFVLENBQUM7QUFBRWlELEVBQUFBLE9BQU8sRUFBUEE7QUFBRixDQUFELENBQVY7O0FBQ08sU0FBU0EsT0FBVCxDQUFpQkQsSUFBakIsRUFBK0I7QUFDckMsTUFBSUEsSUFBSSxLQUFLRSxTQUFiLEVBQ0MsT0FBTyxLQUFLNUIsZUFBZSxFQUEzQjtBQUVELE1BQUk2QixFQUFFLEdBQUdKLGNBQWMsQ0FBQ0MsSUFBRCxDQUF2QjtBQUNBLE1BQUlHLEVBQUUsSUFBSSxJQUFWLEVBQWdCLE9BQU8sbUNBQVA7QUFDaEIsU0FBT04sZ0JBQWdCLENBQUNNLEVBQUQsQ0FBdkI7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdldE1vZHVsZU5hbWVGcm9tUGF0aCwgR2V0TW9kdWxlTmFtZUZyb21WYXJOYW1lIH0gZnJvbSBcIi4vVXRpbHNcIjtcbmV4cG9ydCB7IEdldE1vZHVsZU5hbWVGcm9tUGF0aCwgR2V0TW9kdWxlTmFtZUZyb21WYXJOYW1lIH07XG5cbmRlY2xhcmUgdmFyIHdpbmRvdzogV2luZG93LCBnbG9iYWw6IGFueTtcbnZhciBnID0gdHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsO1xuZnVuY3Rpb24gTWFrZUdsb2JhbChwcm9wczogYW55KSB7XG5cdGZvciAobGV0IGtleSBpbiBwcm9wcylcblx0XHRnW2tleV0gPSBwcm9wc1trZXldO1xufVxuXG5kZWNsYXJlIHZhciBfX3dlYnBhY2tfcmVxdWlyZV9fOiBhbnk7XG4vLyBpZiB3ZWJwYWNrLWRhdGEgd2FzIG5vdCBleHBsaWNpdGx5IHNwZWNpZmllZCBwcmlvciB0byBsaWJyYXJ5IGltcG9ydCwgdHJ5IHRvIGZpbmQgdGhlIGRhdGFcbmlmIChnLndlYnBhY2tEYXRhID09IG51bGwpIHtcblx0Ly8gaWYgaW5jbHVkZWQgdXNpbmcgYG1vZHVsZTogXCJzcmMvTWFpbi50c1wiYCwgd2UgY2FuIGFjY2VzcyB3ZWJwYWNrLWRhdGEgZGlyZWN0bHlcblx0aWYgKHR5cGVvZiBfX3dlYnBhY2tfcmVxdWlyZV9fICE9IFwidW5kZWZpbmVkXCIgJiYgKF9fd2VicGFja19yZXF1aXJlX18ubS5sZW5ndGggPiAyIHx8IE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18ubSkubGVuZ3RoID4gMikpIHtcblx0XHRnLndlYnBhY2tEYXRhID0gX193ZWJwYWNrX3JlcXVpcmVfXztcblx0XHQvLyB3ZWJwYWNrMyBkb24ndCBoYXZhIHIgZnVuY3Rpb25cblx0aWYgKCFfX3dlYnBhY2tfcmVxdWlyZV9fLnIpIHtcblx0XHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5cdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24gKGV4cG9ydHM6IGFueSkge1xuXHRcdFx0aWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0XHRcdH1cblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cdFx0fTtcblx0fVxuXHR9XG5cdC8vIGVsc2UsIHRyeSB0byBhY2Nlc3MgaXQgdXNpbmcgd2VicGFja0pzb25wICh0aGUgZnVuY3Rpb24gb25seSBzZWVtcyB0byBiZSBhdmFpbGFibGUgaWYgQ29tbW9uc0NodW5rUGx1Z2luIGlzIHVzZWQpXG5cdGVsc2UgaWYgKGcud2VicGFja0pzb25wKSB7XG5cdFx0bGV0IHdlYnBhY2tWZXJzaW9uID0gZy53ZWJwYWNrSnNvbnAubGVuZ3RoID09IDIgPyAxIDogMjtcblx0XHRpZiAod2VicGFja1ZlcnNpb24gPT0gMSkge1xuXHRcdFx0Zy53ZWJwYWNrSnNvbnAoW10sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQwOiBmdW5jdGlvbiAobW9kdWxlOiBhbnksIGV4cG9ydHM6IGFueSwgX193ZWJwYWNrX3JlcXVpcmVfXzogYW55KSB7XG5cdFx0XHRcdFx0XHRnLndlYnBhY2tEYXRhID0gX193ZWJwYWNrX3JlcXVpcmVfXztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGcud2VicGFja0pzb25wKFtdLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0MTIzNDU2OiBmdW5jdGlvbiAobW9kdWxlOiBhbnksIGV4cG9ydHM6IGFueSwgX193ZWJwYWNrX3JlcXVpcmVfXzogYW55KSB7XG5cdFx0XHRcdFx0XHRnLndlYnBhY2tEYXRhID0gX193ZWJwYWNrX3JlcXVpcmVfXztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdFsxMjM0NTZdXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXHQvLyBlbHNlLCBnaXZlIHVwIGFuZCB0aHJvdyBlcnJvclxuXHRlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYHdpbmRvdy53ZWJwYWNrRGF0YSBtdXN0IGJlIHNldCBmb3Igd2VicGFjay1ydW50aW1lLXJlcXVpcmUgdG8gZnVuY3Rpb24uJHtcIlxcblwiXG5cdFx0XHR9WW91IGNhbiBkbyBzbyBlaXRoZXIgYnkgc2V0dGluZyBpdCBkaXJlY3RseSAodG8gX193ZWJwYWNrX3JlcXVpcmVfXyksIG9yIGJ5IG1ha2luZyB3aW5kb3cud2VicGFja0pzb25wIGF2YWlsYWJsZS4gKGVnLiB1c2luZyBDb21tb25zQ2h1bmtQbHVnaW4pYCk7XG5cdH1cblxufVxuXG5leHBvcnQgdmFyIGFsbE1vZHVsZXNUZXh0OiBzdHJpbmc7XG5leHBvcnQgdmFyIG1vZHVsZUlEcyA9IHt9IGFzIHsgW2tleTogc3RyaW5nXTogbnVtYmVyIHwgc3RyaW5nIH07XG5leHBvcnQgdmFyIG1vZHVsZU5hbWVzID0ge30gYXMgeyBba2V5OiBudW1iZXJdOiBzdHJpbmc7W2tleTogc3RyaW5nXTogc3RyaW5nOyB9O1xuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlTW9kdWxlRGF0YShmb3JjZVJlZnJlc2ggPSBmYWxzZSkge1xuXHRpZiAoYWxsTW9kdWxlc1RleHQgIT0gbnVsbCAmJiAhZm9yY2VSZWZyZXNoKSByZXR1cm47XG5cblx0bGV0IG1vZHVsZVdyYXBwZXJGdW5jcyA9IE9iamVjdC5rZXlzKGcud2VicGFja0RhdGEubSkubWFwKG1vZHVsZUlEID0+IGcud2VicGFja0RhdGEubVttb2R1bGVJRF0pO1xuXHRhbGxNb2R1bGVzVGV4dCA9IG1vZHVsZVdyYXBwZXJGdW5jcy5tYXAoYSA9PiBhLnRvU3RyaW5nKCkpLmpvaW4oXCJcXG5cXG5cXG5cIikucmVwbGFjZSgvXFxcXFwiL2csIGBcImApO1xuXG5cdC8vIHRoZXNlIGFyZSBleGFtcGxlcyBvZiBiZWZvcmUgYW5kIGFmdGVyIHdlYnBhY2sncyB0cmFuc2Zvcm1hdGlvbjogKGJhc2VkIG9uIHdoaWNoIHRoZSAxc3QgcmVnZXggYmVsb3cgZmluZHMgcGF0aC1jb21tZW50cylcblx0Ly8gXHRcdHJlcXVpcmUoXCJyZWFjdC1yZWR1eC1maXJlYmFzZVwiKSA9PiB2YXIgX3JlYWN0UmVkdXhGaXJlYmFzZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIHJlYWN0LXJlZHV4LWZpcmViYXNlICovIDEwMCk7XG5cdC8vIFx0XHRyZXF1aXJlKFwiLi9Tb3VyY2UvTXlDb21wb25lbnRcIikgPT4gdmFyIF9NeUNvbXBvbmVudCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vU291cmNlL015Q29tcG9uZW50ICovIDIwMCk7XG5cdC8vbGV0IHJlcXVpcmVzV2l0aFBhdGhDb21tZW50c1JlZ2V4ID0gL19fd2VicGFja19yZXF1aXJlX19cXChcXC9cXCohICgoPzouKD8hXFwqKSkrKSBcXCpcXC8gKFtcIicwLTlhLXpBLVpcXC8uLV0rKVxcKS9nO1xuXHQvL2xldCByZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleCA9IC9fX3dlYnBhY2tfcmVxdWlyZV9fXFwoXFwvXFwqISAoKD86Lig/IVxcKikpKykgXFwqXFwvIFtcIiddPyhbXlwiJ1xcKV0rKVtcIiddP1xcKS9nO1xuXHRsZXQgcmVxdWlyZXNXaXRoUGF0aENvbW1lbnRzUmVnZXggPSAvX193ZWJwYWNrX3JlcXVpcmVfX1xcKFxcL1xcKiEgKC4rPykgXFwqXFwvIFtcIiddPyhbXlwiJ1xcKV0rPylbXCInXT9cXCkvZztcblx0Ly8gdGhlc2UgYXJlIGV4YW1wbGVzIG9mIGJlZm9yZSBhbmQgYWZ0ZXIgd2VicGFjaydzIHRyYW5zZm9ybWF0aW9uOiAoYmFzZWQgb24gd2hpY2ggdGhlIDJuZCByZWdleCBiZWxvdyBmaW5kcyBwYXRocylcblx0Ly8gXHRcdHJlcXVpcmUoXCJqcXVlcnlcIikgPT4gX193ZWJwYWNrX3JlcXVpcmVfXyhcImpxdWVyeVwiKVxuXHQvL2xldCByZXF1aXJlc1dpdGhQYXRoc1JlZ2V4ID0gL19fd2VicGFja19yZXF1aXJlX19cXChbXlwiKV0qXCIoLis/KVwiXFwpL2c7XG5cdGxldCByZXF1aXJlc1dpdGhQYXRoc1JlZ2V4ID0gL19fd2VicGFja19yZXF1aXJlX19cXChcIiguKz8pXCJcXCkvZzsgLy8gb25seSBwcm9jZXNzIHBsYWluIHJlcXVpcmVzLXdpdGgtcGF0aHMgKGllLiBpZ25vcmUgb25lcyB0aGF0IGFsc28gaGF2ZSBwYXRoLWNvbW1lbnRzKVxuXG5cdC8vIGlmIHJlcXVpcmVzIGhhdmUgcGF0aC1pbmZvIGVtYmVkZGVkLCB1c2UgdGhhdCAoc2V0IHVzaW5nIFt3ZWJwYWNrQ29uZmlnLm91dHB1dC5wYXRoaW5mbzogdHJ1ZV0pXG5cdGlmIChhbGxNb2R1bGVzVGV4dC5tYXRjaChyZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleCkpIHtcblx0XHRmb3IgKGxldCBtYXRjaDsgbWF0Y2ggPSByZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleC5leGVjKGFsbE1vZHVsZXNUZXh0KTspIHtcblx0XHRcdGxldCBbXywgcGF0aCwgaWRTdHJdID0gbWF0Y2g7XG5cdFx0XHRBZGRNb2R1bGVFbnRyeShpZFN0ciwgR2V0TW9kdWxlTmFtZUZyb21QYXRoKHBhdGgpKTtcblx0XHR9XG5cdH1cblx0Ly8gaWYgcmVxdWlyZXMgdGhlbXNlbHZlcyBhcmUgYnktcGF0aCwgdXNlIHRoYXQgKHNldCB1c2luZyBbY29uZmlnLm1vZGU6IFwiZGV2ZWxvcG1lbnRcIl0gb3IgW2NvbmZpZy5vcHRpbWl6YXRpb24ubmFtZWRNb2R1bGVzOiB0cnVlXSlcblx0aWYgKGFsbE1vZHVsZXNUZXh0Lm1hdGNoKHJlcXVpcmVzV2l0aFBhdGhzUmVnZXgpKSB7XG5cdFx0Zm9yIChsZXQgbWF0Y2g7IG1hdGNoID0gcmVxdWlyZXNXaXRoUGF0aHNSZWdleC5leGVjKGFsbE1vZHVsZXNUZXh0KTspIHtcblx0XHRcdGxldCBbXywgcGF0aF0gPSBtYXRjaDtcblx0XHRcdEFkZE1vZHVsZUVudHJ5KHBhdGgsIEdldE1vZHVsZU5hbWVGcm9tUGF0aChwYXRoKSk7XG5cdFx0fVxuXHR9XG5cdC8vIGVsc2UsIGluZmVyIGl0IGZyb20gdGhlIHZhci1uYW1lcyBvZiB0aGUgaW1wb3J0c1xuXHRpZiAoIWFsbE1vZHVsZXNUZXh0Lm1hdGNoKHJlcXVpcmVzV2l0aFBhdGhzUmVnZXgpICYmICFhbGxNb2R1bGVzVGV4dC5tYXRjaChyZXF1aXJlc1dpdGhQYXRoQ29tbWVudHNSZWdleCkpIHtcblx0XHQvLyB0aGVzZSBhcmUgZXhhbXBsZXMgb2YgYmVmb3JlIGFuZCBhZnRlciB3ZWJwYWNrJ3MgdHJhbnNmb3JtYXRpb246ICh3aGljaCB0aGUgcmVnZXggYmVsb3cgZmluZHMgdGhlIHZhci1uYW1lIG9mKVxuXHRcdC8vIFx0XHRyZXF1aXJlKFwicmVhY3QtcmVkdXgtZmlyZWJhc2VcIikgPT4gdmFyIF9yZWFjdFJlZHV4RmlyZWJhc2UgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEwMCk7XG5cdFx0Ly8gXHRcdHJlcXVpcmUoXCIuL1NvdXJjZS9NeUNvbXBvbmVudFwiKSA9PiB2YXIgX015Q29tcG9uZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMDApO1xuXHRcdGxldCByZWdleCA9IC92YXIgKFthLXpBLVpfXSspID0gX193ZWJwYWNrX3JlcXVpcmVfX1xcKChbMC05XSspXFwpL2c7XG5cdFx0Zm9yIChsZXQgbWF0Y2g7IG1hdGNoID0gcmVnZXguZXhlYyhhbGxNb2R1bGVzVGV4dCk7KSB7XG5cdFx0XHRsZXQgW18sIHZhck5hbWUsIGlkU3RyXSA9IG1hdGNoO1xuXHRcdFx0QWRkTW9kdWxlRW50cnkocGFyc2VJbnQoaWRTdHIpLCBHZXRNb2R1bGVOYW1lRnJvbVZhck5hbWUodmFyTmFtZSkpO1xuXHRcdH1cblx0fVxuXG5cdE1ha2VHbG9iYWwoeyBhbGxNb2R1bGVzVGV4dCwgbW9kdWxlSURzLCBtb2R1bGVOYW1lcyB9KTtcbn1cblxuY29uc3QgbW9kdWxlQ2FjaGU6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7XG59O1xuXG5mdW5jdGlvbiBBZGRNb2R1bGVFbnRyeShtb2R1bGVJRDogc3RyaW5nIHwgbnVtYmVyLCBtb2R1bGVOYW1lOiBzdHJpbmcpIHtcblx0bW9kdWxlSURzW21vZHVsZU5hbWVdID0gbW9kdWxlSUQ7XG5cdG1vZHVsZU5hbWVzW21vZHVsZUlEXSA9IG1vZHVsZU5hbWU7XG5cblx0Ly8gcmVwbGFjZSBjZXJ0YWluIGNoYXJhY3RlcnMgd2l0aCB1bmRlcnNjb3Jlcywgc28gdGhlIG1vZHVsZS1lbnRyaWVzIGNhbiBzaG93IGluIGNvbnNvbGUgYXV0by1jb21wbGV0ZVxuXHRsZXQgbW9kdWxlTmFtZV9zaW1wbGUgPSBtb2R1bGVOYW1lLnJlcGxhY2UoLy0vZywgXCJfXCIpO1xuXHQvLyBtYWtlIHN1cmUgd2UgYWRkIHRoZSBtb2R1bGUgdW5kZXIgYSB1bmlxdWUgbmFtZVxuXHR3aGlsZSAobW9kdWxlTmFtZV9zaW1wbGUgaW4gbW9kdWxlQ2FjaGUpIG1vZHVsZU5hbWVfc2ltcGxlICs9IGBfYDtcblx0Ly8gYWRkIHRoZSBtb2R1bGUgb250byB0aGUgUmVxdWlyZSBmdW5jdGlvblxuXHRtb2R1bGVDYWNoZVttb2R1bGVOYW1lX3NpbXBsZV0gPSBHZXRNb2R1bGVFeHBvcnRzKG1vZHVsZUlEKTtcbn1cbmZ1bmN0aW9uIEdldE1vZHVsZUV4cG9ydHMobW9kdWxlSUQ6IG51bWJlciB8IHN0cmluZykge1xuXHRyZXR1cm4gZy53ZWJwYWNrRGF0YS5jW21vZHVsZUlEXSA/IGcud2VicGFja0RhdGEuY1ttb2R1bGVJRF0uZXhwb3J0cyA6IFwiW2ZhaWxlZCB0byByZXRyaWV2ZSBtb2R1bGUgZXhwb3J0c11cIjtcbn1cblxuTWFrZUdsb2JhbCh7IEdldElERm9yTW9kdWxlIH0pO1xuZXhwb3J0IGZ1bmN0aW9uIEdldElERm9yTW9kdWxlKG5hbWU6IHN0cmluZykge1xuXHRQYXJzZU1vZHVsZURhdGEoKTtcblx0cmV0dXJuIG1vZHVsZUlEc1tuYW1lXTtcbn1cblxuTWFrZUdsb2JhbCh7IFJlcXVpcmUgfSk7XG5leHBvcnQgZnVuY3Rpb24gUmVxdWlyZShuYW1lOiBzdHJpbmcpIHtcblx0aWYgKG5hbWUgPT09IHVuZGVmaW5lZClcblx0XHRyZXR1cm4gdm9pZCBQYXJzZU1vZHVsZURhdGEoKTtcblxuXHRsZXQgaWQgPSBHZXRJREZvck1vZHVsZShuYW1lKTtcblx0aWYgKGlkID09IG51bGwpIHJldHVybiBcIltjb3VsZCBub3QgZmluZCB0aGUgZ2l2ZW4gbW9kdWxlXVwiO1xuXHRyZXR1cm4gR2V0TW9kdWxlRXhwb3J0cyhpZCk7XG59Il19
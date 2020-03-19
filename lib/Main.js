"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
exports.GetModuleNameFromPath = Utils_1.GetModuleNameFromPath;
exports.GetModuleNameFromVarName = Utils_1.GetModuleNameFromVarName;
var g = typeof window != "undefined" ? window : global;
function MakeGlobal(props) {
    for (let key in props)
        g[key] = props[key];
}
// if webpack-data was not explicitly specified prior to library import, try to find the data
if (g.webpackData == null) {
    // if included using `module: "src/Main.ts"`, we can access webpack-data directly
    if (typeof __webpack_require__ != "undefined" && (__webpack_require__.m.length > 2 || Object.keys(__webpack_require__.m).length > 2)) {
        g.webpackData = __webpack_require__;
        // webpack3 don't hava r function
        if (!__webpack_require__.r) {
            // define __esModule on exports
            __webpack_require__.r = function (exports) {
                if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
                }
                Object.defineProperty(exports, '__esModule', { value: true });
            };
        }
    }
    // else, try to access it using webpackJsonp (the function only seems to be available if CommonsChunkPlugin is used)
    else if (g.webpackJsonp) {
        let webpackVersion = g.webpackJsonp.length == 2 ? 1 : 2;
        if (webpackVersion == 1) {
            g.webpackJsonp([], {
                0: function (module, exports, __webpack_require__) {
                    g.webpackData = __webpack_require__;
                }
            });
        }
        else {
            g.webpackJsonp([], {
                123456: function (module, exports, __webpack_require__) {
                    g.webpackData = __webpack_require__;
                }
            }, [123456]);
        }
    }
    // else, give up and throw error
    else {
        throw new Error(`window.webpackData must be set for webpack-runtime-require to function.${"\n"}You can do so either by setting it directly (to __webpack_require__), or by making window.webpackJsonp available. (eg. using CommonsChunkPlugin)`);
    }
}
exports.moduleIDs = {};
exports.moduleNames = {};
function ParseModuleData(forceRefresh = false) {
    if (exports.allModulesText != null && !forceRefresh)
        return;
    let moduleWrapperFuncs = Object.keys(g.webpackData.m).map(moduleID => g.webpackData.m[moduleID]);
    exports.allModulesText = moduleWrapperFuncs.map(a => a.toString()).join("\n\n\n").replace(/\\"/g, `"`);
    // these are examples of before and after webpack's transformation: (based on which the 1st regex below finds path-comments)
    // 		require("react-redux-firebase") => var _reactReduxFirebase = __webpack_require__(/*! react-redux-firebase */ 100);
    // 		require("./Source/MyComponent") => var _MyComponent = __webpack_require__(/*! ./Source/MyComponent */ 200);
    //let requiresWithPathCommentsRegex = /__webpack_require__\(\/\*! ((?:.(?!\*))+) \*\/ (["'0-9a-zA-Z\/.-]+)\)/g;
    //let requiresWithPathCommentsRegex = /__webpack_require__\(\/\*! ((?:.(?!\*))+) \*\/ ["']?([^"'\)]+)["']?\)/g;
    let requiresWithPathCommentsRegex = /__webpack_require__\(\/\*! (.+?) \*\/ ["']?([^"'\)]+?)["']?\)/g;
    // these are examples of before and after webpack's transformation: (based on which the 2nd regex below finds paths)
    // 		require("jquery") => __webpack_require__("jquery")
    //let requiresWithPathsRegex = /__webpack_require__\([^")]*"(.+?)"\)/g;
    let requiresWithPathsRegex = /__webpack_require__\("(.+?)"\)/g; // only process plain requires-with-paths (ie. ignore ones that also have path-comments)
    // if requires have path-info embedded, use that (set using [webpackConfig.output.pathinfo: true])
    if (exports.allModulesText.match(requiresWithPathCommentsRegex)) {
        for (let match; match = requiresWithPathCommentsRegex.exec(exports.allModulesText);) {
            let [_, path, idStr] = match;
            AddModuleEntry(idStr, Utils_1.GetModuleNameFromPath(path));
        }
    }
    // if requires themselves are by-path, use that (set using [config.mode: "development"] or [config.optimization.namedModules: true])
    if (exports.allModulesText.match(requiresWithPathsRegex)) {
        for (let match; match = requiresWithPathsRegex.exec(exports.allModulesText);) {
            let [_, path] = match;
            AddModuleEntry(path, Utils_1.GetModuleNameFromPath(path));
        }
    }
    // else, infer it from the var-names of the imports
    if (!exports.allModulesText.match(requiresWithPathsRegex) && !exports.allModulesText.match(requiresWithPathCommentsRegex)) {
        // these are examples of before and after webpack's transformation: (which the regex below finds the var-name of)
        // 		require("react-redux-firebase") => var _reactReduxFirebase = __webpack_require__(100);
        // 		require("./Source/MyComponent") => var _MyComponent = __webpack_require__(200);
        let regex = /var ([a-zA-Z_]+) = __webpack_require__\(([0-9]+)\)/g;
        for (let match; match = regex.exec(exports.allModulesText);) {
            let [_, varName, idStr] = match;
            AddModuleEntry(parseInt(idStr), Utils_1.GetModuleNameFromVarName(varName));
        }
    }
    MakeGlobal({ allModulesText: exports.allModulesText, moduleIDs: exports.moduleIDs, moduleNames: exports.moduleNames });
}
exports.ParseModuleData = ParseModuleData;
const moduleCache = {};
function AddModuleEntry(moduleID, moduleName) {
    exports.moduleIDs[moduleName] = moduleID;
    exports.moduleNames[moduleID] = moduleName;
    // replace certain characters with underscores, so the module-entries can show in console auto-complete
    let moduleName_simple = moduleName.replace(/-/g, "_");
    // make sure we add the module under a unique name
    while (moduleName_simple in moduleCache)
        moduleName_simple += `_`;
    // add the module onto the Require function
    moduleCache[moduleName_simple] = GetModuleExports(moduleID);
}
function GetModuleExports(moduleID) {
    return g.webpackData.c[moduleID] ? g.webpackData.c[moduleID].exports : "[failed to retrieve module exports]";
}
MakeGlobal({ GetIDForModule });
function GetIDForModule(name) {
    ParseModuleData();
    return exports.moduleIDs[name];
}
exports.GetIDForModule = GetIDForModule;
MakeGlobal({ Require });
function Require(name) {
    if (name === undefined)
        return void ParseModuleData();
    let id = GetIDForModule(name);
    if (id == null)
        return "[could not find the given module]";
    return GetModuleExports(id);
}
exports.Require = Require;

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetModuleNameFromPath = GetModuleNameFromPath;
exports.GetModuleNameFromVarName = GetModuleNameFromVarName;

function GetModuleNameFromPath(path) {
  var parts = path.split("/"); // last part might be empty, so find last part with content (path might end with /, if it's a folder-require -- which resolves to folder/index)

  var lastPartWithContent = parts[parts.length - 1] || parts[parts.length - 2];
  return lastPartWithContent.replace(/\.[^.]+/, ""); // remove extension
}

function GetModuleNameFromVarName(varName) {
  // these are examples of before and after the below transformation code:
  // 		_reactReduxFirebase => react-redux-firebase
  // 		_MyComponent => my-component
  // 		_MyComponent_New => my-component-new
  // 		_JSONHelper => json-helper
  var moduleName = varName.replace(/^_/g, "") // remove starting "_"
  .replace(new RegExp( // convert chars where:
  "([^_])" // is preceded by a non-underscore char
  + "[A-Z]" // is a capital-letter
  + "([^A-Z_])", // is followed by a non-capital-letter, non-underscore char
  "g"), function (str) {
    return str[0] + "-" + str[1] + str[2];
  } // to: "-" + char
  ).replace(/_/g, "-") // convert all "_" to "-"
  .toLowerCase(); // convert all letters to lowercase

  return moduleName;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9VdGlscy50cyJdLCJuYW1lcyI6WyJHZXRNb2R1bGVOYW1lRnJvbVBhdGgiLCJwYXRoIiwicGFydHMiLCJzcGxpdCIsImxhc3RQYXJ0V2l0aENvbnRlbnQiLCJsZW5ndGgiLCJyZXBsYWNlIiwiR2V0TW9kdWxlTmFtZUZyb21WYXJOYW1lIiwidmFyTmFtZSIsIm1vZHVsZU5hbWUiLCJSZWdFeHAiLCJzdHIiLCJ0b0xvd2VyQ2FzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBTyxTQUFTQSxxQkFBVCxDQUErQkMsSUFBL0IsRUFBNkM7QUFDbkQsTUFBSUMsS0FBSyxHQUFHRCxJQUFJLENBQUNFLEtBQUwsQ0FBVyxHQUFYLENBQVosQ0FEbUQsQ0FFbkQ7O0FBQ0EsTUFBSUMsbUJBQW1CLEdBQUdGLEtBQUssQ0FBQ0EsS0FBSyxDQUFDRyxNQUFOLEdBQWUsQ0FBaEIsQ0FBTCxJQUEyQkgsS0FBSyxDQUFDQSxLQUFLLENBQUNHLE1BQU4sR0FBZSxDQUFoQixDQUExRDtBQUNBLFNBQU9ELG1CQUFtQixDQUFDRSxPQUFwQixDQUE0QixTQUE1QixFQUF1QyxFQUF2QyxDQUFQLENBSm1ELENBSUE7QUFDbkQ7O0FBQ00sU0FBU0Msd0JBQVQsQ0FBa0NDLE9BQWxDLEVBQW1EO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFJQyxVQUFVLEdBQUdELE9BQU8sQ0FDdEJGLE9BRGUsQ0FDUCxLQURPLEVBQ0EsRUFEQSxFQUNJO0FBREosR0FFZkEsT0FGZSxDQUVQLElBQUlJLE1BQUosRUFBWTtBQUNsQixXQUFVO0FBQVYsSUFDQyxPQURELENBQ1U7QUFEVixJQUVDLFdBSEssRUFHUTtBQUNoQixLQUpRLENBRk8sRUFPZixVQUFBQyxHQUFHO0FBQUEsV0FBRUEsR0FBRyxDQUFDLENBQUQsQ0FBSCxHQUFTLEdBQVQsR0FBZUEsR0FBRyxDQUFDLENBQUQsQ0FBbEIsR0FBd0JBLEdBQUcsQ0FBQyxDQUFELENBQTdCO0FBQUEsR0FQWSxDQU9xQjtBQVByQixJQVNmTCxPQVRlLENBU1AsSUFUTyxFQVNELEdBVEMsRUFTSTtBQVRKLEdBVWZNLFdBVmUsRUFBakIsQ0FOeUQsQ0FnQnhDOztBQUNqQixTQUFPSCxVQUFQO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gR2V0TW9kdWxlTmFtZUZyb21QYXRoKHBhdGg6IHN0cmluZykge1xuXHRsZXQgcGFydHMgPSBwYXRoLnNwbGl0KFwiL1wiKTtcblx0Ly8gbGFzdCBwYXJ0IG1pZ2h0IGJlIGVtcHR5LCBzbyBmaW5kIGxhc3QgcGFydCB3aXRoIGNvbnRlbnQgKHBhdGggbWlnaHQgZW5kIHdpdGggLywgaWYgaXQncyBhIGZvbGRlci1yZXF1aXJlIC0tIHdoaWNoIHJlc29sdmVzIHRvIGZvbGRlci9pbmRleClcblx0bGV0IGxhc3RQYXJ0V2l0aENvbnRlbnQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSB8fCBwYXJ0c1twYXJ0cy5sZW5ndGggLSAyXTtcblx0cmV0dXJuIGxhc3RQYXJ0V2l0aENvbnRlbnQucmVwbGFjZSgvXFwuW14uXSsvLCBcIlwiKTsgLy8gcmVtb3ZlIGV4dGVuc2lvblxufVxuZXhwb3J0IGZ1bmN0aW9uIEdldE1vZHVsZU5hbWVGcm9tVmFyTmFtZSh2YXJOYW1lOiBzdHJpbmcpIHtcblx0Ly8gdGhlc2UgYXJlIGV4YW1wbGVzIG9mIGJlZm9yZSBhbmQgYWZ0ZXIgdGhlIGJlbG93IHRyYW5zZm9ybWF0aW9uIGNvZGU6XG5cdC8vIFx0XHRfcmVhY3RSZWR1eEZpcmViYXNlID0+IHJlYWN0LXJlZHV4LWZpcmViYXNlXG5cdC8vIFx0XHRfTXlDb21wb25lbnQgPT4gbXktY29tcG9uZW50XG5cdC8vIFx0XHRfTXlDb21wb25lbnRfTmV3ID0+IG15LWNvbXBvbmVudC1uZXdcblx0Ly8gXHRcdF9KU09OSGVscGVyID0+IGpzb24taGVscGVyXG5cdGxldCBtb2R1bGVOYW1lID0gdmFyTmFtZVxuXHRcdC5yZXBsYWNlKC9eXy9nLCBcIlwiKSAvLyByZW1vdmUgc3RhcnRpbmcgXCJfXCJcblx0XHQucmVwbGFjZShuZXcgUmVnRXhwKCAvLyBjb252ZXJ0IGNoYXJzIHdoZXJlOlxuXHRcdFx0XHRcdFwiKFteX10pXCJcdFx0Ly8gaXMgcHJlY2VkZWQgYnkgYSBub24tdW5kZXJzY29yZSBjaGFyXG5cdFx0XHRcdCsgXCJbQS1aXVwiXHRcdC8vIGlzIGEgY2FwaXRhbC1sZXR0ZXJcblx0XHRcdFx0KyBcIihbXkEtWl9dKVwiLFx0Ly8gaXMgZm9sbG93ZWQgYnkgYSBub24tY2FwaXRhbC1sZXR0ZXIsIG5vbi11bmRlcnNjb3JlIGNoYXJcblx0XHRcdFwiZ1wiKSxcblx0XHRcdHN0cj0+c3RyWzBdICsgXCItXCIgKyBzdHJbMV0gKyBzdHJbMl0gLy8gdG86IFwiLVwiICsgY2hhclxuXHRcdClcblx0XHQucmVwbGFjZSgvXy9nLCBcIi1cIikgLy8gY29udmVydCBhbGwgXCJfXCIgdG8gXCItXCJcblx0XHQudG9Mb3dlckNhc2UoKTsgLy8gY29udmVydCBhbGwgbGV0dGVycyB0byBsb3dlcmNhc2Vcblx0cmV0dXJuIG1vZHVsZU5hbWU7XG59Il19
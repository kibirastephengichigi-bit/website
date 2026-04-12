"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_lib_db_ts";
exports.ids = ["_rsc_lib_db_ts"];
exports.modules = {

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   db: () => (/* binding */ db),\n/* harmony export */   hasDatabaseUrl: () => (/* binding */ hasDatabaseUrl)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst hasDatabaseUrl = Boolean(process.env.DATABASE_URL);\nlet db = null;\n// Only initialize Prisma in Node.js runtime, not at edge\nif ( true && hasDatabaseUrl) {\n    if (!global.prisma) {\n        global.prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n            log:  true ? [\n                \"error\",\n                \"warn\"\n            ] : 0\n        });\n    }\n    db = global.prisma;\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUE4QztBQU12QyxNQUFNQyxpQkFBaUJDLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsWUFBWSxFQUFFO0FBRWhFLElBQUlDLEtBQTBCO0FBRTlCLHlEQUF5RDtBQUN6RCxJQUFJLEtBQTZCLElBQUlMLGdCQUFnQjtJQUNuRCxJQUFJLENBQUNNLE9BQU9DLE1BQU0sRUFBRTtRQUNsQkQsT0FBT0MsTUFBTSxHQUFHLElBQUlSLHdEQUFZQSxDQUFDO1lBQy9CUyxLQUFLTixLQUFzQyxHQUFHO2dCQUFDO2dCQUFTO2FBQU8sR0FBRyxDQUFTO1FBQzdFO0lBQ0Y7SUFDQUcsS0FBS0MsT0FBT0MsTUFBTTtBQUNwQjtBQUVjIiwic291cmNlcyI6WyIvd29ya3NwYWNlcy9TdGVwaGVuLUFzYXRzYS1XZWJzaXRlL2xpYi9kYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICB2YXIgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBjb25zdCBoYXNEYXRhYmFzZVVybCA9IEJvb2xlYW4ocHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKTtcblxubGV0IGRiOiBQcmlzbWFDbGllbnQgfCBudWxsID0gbnVsbDtcblxuLy8gT25seSBpbml0aWFsaXplIFByaXNtYSBpbiBOb2RlLmpzIHJ1bnRpbWUsIG5vdCBhdCBlZGdlXG5pZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiAmJiBoYXNEYXRhYmFzZVVybCkge1xuICBpZiAoIWdsb2JhbC5wcmlzbWEpIHtcbiAgICBnbG9iYWwucHJpc21hID0gbmV3IFByaXNtYUNsaWVudCh7XG4gICAgICBsb2c6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCIgPyBbXCJlcnJvclwiLCBcIndhcm5cIl0gOiBbXCJlcnJvclwiXSxcbiAgICB9KTtcbiAgfVxuICBkYiA9IGdsb2JhbC5wcmlzbWE7XG59XG5cbmV4cG9ydCB7IGRiIH07XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiaGFzRGF0YWJhc2VVcmwiLCJCb29sZWFuIiwicHJvY2VzcyIsImVudiIsIkRBVEFCQVNFX1VSTCIsImRiIiwiZ2xvYmFsIiwicHJpc21hIiwibG9nIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;
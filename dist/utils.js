'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var exists = exports.exists = function exists(v) {
  return typeof v !== 'undefined';
};

var round = exports.round = function round(x) {
  return +(Math.round(x * 1e2) + 'e-2');
};
//# sourceMappingURL=utils.js.map
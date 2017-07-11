'use strict';

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _cropit = require('./cropit');

var _cropit2 = _interopRequireDefault(_cropit);

var _constants = require('./constants');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var applyOnEach = function applyOnEach($el, callback) {
  return $el.each(function () {
    var cropit = _jquery2.default.data(this, _constants.PLUGIN_KEY);

    if (!cropit) {
      return;
    }
    callback(cropit);
  });
};

var callOnFirst = function callOnFirst($el, method, options) {
  var cropit = $el.first().data(_constants.PLUGIN_KEY);

  if (!cropit || !_jquery2.default.isFunction(cropit[method])) {
    return null;
  }
  return cropit[method](options);
};

var methods = {
  init: function init(options) {
    return this.each(function () {
      // Only instantiate once per element
      if (_jquery2.default.data(this, _constants.PLUGIN_KEY)) {
        return;
      }

      var cropit = new _cropit2.default(_jquery2.default, this, options);
      _jquery2.default.data(this, _constants.PLUGIN_KEY, cropit);
    });
  },
  destroy: function destroy() {
    return this.each(function () {
      _jquery2.default.removeData(this, _constants.PLUGIN_KEY);
    });
  },
  isZoomable: function isZoomable() {
    return callOnFirst(this, 'isZoomable');
  },
  export: function _export(options) {
    return callOnFirst(this, 'getCroppedImageData', options);
  }
};

var delegate = function delegate($el, fnName) {
  return applyOnEach($el, function (cropit) {
    cropit[fnName]();
  });
};

var prop = function prop($el, name, value) {
  if ((0, _utils.exists)(value)) {
    return applyOnEach($el, function (cropit) {
      cropit[name] = value;
    });
  } else {
    var cropit = $el.first().data(_constants.PLUGIN_KEY);
    return cropit[name];
  }
};

_jquery2.default.fn.cropit = function (method) {
  if (methods[method]) {
    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
  } else if (['imageState', 'imageSrc', 'offset', 'previewSize', 'imageSize', 'zoom', 'initialZoom', 'exportZoom', 'minZoom', 'maxZoom'].indexOf(method) >= 0) {
    return prop.apply(undefined, [this].concat(Array.prototype.slice.call(arguments)));
  } else if (['rotateCW', 'rotateCCW', 'disable', 'reenable'].indexOf(method) >= 0) {
    return delegate.apply(undefined, [this].concat(Array.prototype.slice.call(arguments)));
  } else {
    return methods.init.apply(this, arguments);
  }
};
//# sourceMappingURL=plugin.js.map
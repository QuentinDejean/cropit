'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Zoomer = function () {
  function Zoomer() {
    _classCallCheck(this, Zoomer);

    this.minZoom = this.maxZoom = 1;
  }

  _createClass(Zoomer, [{
    key: 'setup',
    value: function setup(_ref) {
      var imageSize = _ref.imageSize,
          previewSize = _ref.previewSize,
          exportZoom = _ref.exportZoom,
          maxZoom = _ref.maxZoom,
          minZoom = _ref.minZoom,
          smallImage = _ref.smallImage;

      var widthRatio = previewSize.width / imageSize.width;
      var heightRatio = previewSize.height / imageSize.height;

      if (minZoom === 'fit') {
        this.minZoom = Math.min(widthRatio, heightRatio);
      } else {
        this.minZoom = Math.max(widthRatio, heightRatio);
      }

      if (smallImage === 'allow') {
        this.minZoom = Math.min(this.minZoom, 1);
      }

      this.maxZoom = Math.max(this.minZoom, maxZoom / exportZoom);
    }
  }, {
    key: 'getZoom',
    value: function getZoom(sliderPos) {
      if (!this.minZoom || !this.maxZoom) {
        return null;
      }

      return sliderPos * (this.maxZoom - this.minZoom) + this.minZoom;
    }
  }, {
    key: 'getSliderPos',
    value: function getSliderPos(zoom) {
      if (!this.minZoom || !this.maxZoom) {
        return null;
      }

      if (this.minZoom === this.maxZoom) {
        return 0;
      } else {
        return (zoom - this.minZoom) / (this.maxZoom - this.minZoom);
      }
    }
  }, {
    key: 'isZoomable',
    value: function isZoomable() {
      if (!this.minZoom || !this.maxZoom) {
        return null;
      }

      return this.minZoom !== this.maxZoom;
    }
  }, {
    key: 'fixZoom',
    value: function fixZoom(zoom) {
      return Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }
  }]);

  return Zoomer;
}();

exports.default = Zoomer;
//# sourceMappingURL=zoomer.js.map
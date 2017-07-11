'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _zoomer = require('./zoomer');

var _zoomer2 = _interopRequireDefault(_zoomer);

var _constants = require('./constants');

var _options = require('./options');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cropit = function () {
  function Cropit(jQuery, element, options) {
    _classCallCheck(this, Cropit);

    this.$el = (0, _jquery2.default)(element);

    var defaults = (0, _options.loadDefaults)(this.$el);
    this.options = _jquery2.default.extend({}, defaults, options);

    this.init();
  }

  _createClass(Cropit, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.image = new Image();
      this.preImage = new Image();
      this.image.onload = this.onImageLoaded.bind(this);
      this.preImage.onload = this.onPreImageLoaded.bind(this);
      this.image.onerror = this.preImage.onerror = function () {
        _this.onImageError.call(_this, _constants.ERRORS.IMAGE_FAILED_TO_LOAD);
      };

      this.$preview = this.options.$preview.css('position', 'relative');
      this.$fileInput = this.options.$fileInput.attr({ accept: 'image/*' });
      this.$zoomSlider = this.options.$zoomSlider.attr({ min: 0, max: 1, step: 0.01 });

      this.previewSize = {
        width: this.options.width || this.$preview.innerWidth(),
        height: this.options.height || this.$preview.innerHeight()
      };

      this.$image = (0, _jquery2.default)('<img />').addClass(_constants.CLASS_NAMES.PREVIEW_IMAGE).attr('alt', '').css({
        transformOrigin: 'top left',
        webkitTransformOrigin: 'top left',
        willChange: 'transform'
      });
      this.$imageContainer = (0, _jquery2.default)('<div />').addClass(_constants.CLASS_NAMES.PREVIEW_IMAGE_CONTAINER).css({
        position: 'absolute',
        overflow: 'hidden',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      }).append(this.$image);
      this.$preview.append(this.$imageContainer);

      if (this.options.imageBackground) {
        if (_jquery2.default.isArray(this.options.imageBackgroundBorderWidth)) {
          this.bgBorderWidthArray = this.options.imageBackgroundBorderWidth;
        } else {
          this.bgBorderWidthArray = [0, 1, 2, 3].map(function () {
            return _this.options.imageBackgroundBorderWidth;
          });
        }

        this.$bg = (0, _jquery2.default)('<img />').addClass(_constants.CLASS_NAMES.PREVIEW_BACKGROUND).attr('alt', '').css({
          position: 'relative',
          left: this.bgBorderWidthArray[3],
          top: this.bgBorderWidthArray[0],
          transformOrigin: 'top left',
          webkitTransformOrigin: 'top left',
          willChange: 'transform'
        });
        this.$bgContainer = (0, _jquery2.default)('<div />').addClass(_constants.CLASS_NAMES.PREVIEW_BACKGROUND_CONTAINER).css({
          position: 'absolute',
          zIndex: 0,
          top: -this.bgBorderWidthArray[0],
          right: -this.bgBorderWidthArray[1],
          bottom: -this.bgBorderWidthArray[2],
          left: -this.bgBorderWidthArray[3]
        }).append(this.$bg);
        if (this.bgBorderWidthArray[0] > 0) {
          this.$bgContainer.css('overflow', 'hidden');
        }
        this.$preview.prepend(this.$bgContainer);
      }

      this.initialZoom = this.options.initialZoom;

      this.imageLoaded = false;

      this.moveContinue = false;

      this.zoomer = new _zoomer2.default();

      if (this.options.allowDragNDrop) {
        _jquery2.default.event.props.push('dataTransfer');
      }

      this.bindListeners();

      if (this.options.imageState && this.options.imageState.src) {
        this.loadImage(this.options.imageState.src);
      }
    }
  }, {
    key: 'bindListeners',
    value: function bindListeners() {
      this.$fileInput.on('change.cropit', this.onFileChange.bind(this));
      this.$imageContainer.on(_constants.EVENTS.PREVIEW, this.onPreviewEvent.bind(this));
      this.$zoomSlider.on(_constants.EVENTS.ZOOM_INPUT, this.onZoomSliderChange.bind(this));

      if (this.options.allowDragNDrop) {
        this.$imageContainer.on('dragover.cropit dragleave.cropit', this.onDragOver.bind(this));
        this.$imageContainer.on('drop.cropit', this.onDrop.bind(this));
      }
    }
  }, {
    key: 'unbindListeners',
    value: function unbindListeners() {
      this.$fileInput.off('change.cropit');
      this.$imageContainer.off(_constants.EVENTS.PREVIEW);
      this.$imageContainer.off('dragover.cropit dragleave.cropit drop.cropit');
      this.$zoomSlider.off(_constants.EVENTS.ZOOM_INPUT);
    }
  }, {
    key: 'onFileChange',
    value: function onFileChange(e) {
      this.options.onFileChange(e);

      if (this.$fileInput.get(0).files) {
        this.loadFile(this.$fileInput.get(0).files[0]);
      }
    }
  }, {
    key: 'loadFile',
    value: function loadFile(file) {
      var fileReader = new FileReader();
      if (file && file.type.match('image')) {
        fileReader.readAsDataURL(file);
        fileReader.onload = this.onFileReaderLoaded.bind(this);
        fileReader.onerror = this.onFileReaderError.bind(this);
      } else if (file) {
        this.onFileReaderError();
      }
    }
  }, {
    key: 'onFileReaderLoaded',
    value: function onFileReaderLoaded(e) {
      this.loadImage(e.target.result);
    }
  }, {
    key: 'onFileReaderError',
    value: function onFileReaderError() {
      this.options.onFileReaderError();
    }
  }, {
    key: 'onDragOver',
    value: function onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.$preview.toggleClass(_constants.CLASS_NAMES.DRAG_HOVERED, e.type === 'dragover');
    }
  }, {
    key: 'onDrop',
    value: function onDrop(e) {
      var _this2 = this;

      e.preventDefault();
      e.stopPropagation();

      var files = Array.prototype.slice.call(e.dataTransfer.files, 0);
      files.some(function (file) {
        if (!file.type.match('image')) {
          return false;
        }

        _this2.loadFile(file);
        return true;
      });

      this.$preview.removeClass(_constants.CLASS_NAMES.DRAG_HOVERED);
    }
  }, {
    key: 'loadImage',
    value: function loadImage(imageSrc) {
      var _this3 = this;

      if (!imageSrc) {
        return;
      }

      this.options.onImageLoading();
      this.setImageLoadingClass();

      if (imageSrc.indexOf('data') === 0) {
        this.preImage.src = imageSrc;
      } else {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
          if (e.target.status >= 300) {
            _this3.onImageError.call(_this3, _constants.ERRORS.IMAGE_FAILED_TO_LOAD);
            return;
          }

          _this3.loadFile(e.target.response);
        };
        xhr.open('GET', imageSrc);
        xhr.responseType = 'blob';
        xhr.send();
      }
    }
  }, {
    key: 'onPreImageLoaded',
    value: function onPreImageLoaded() {
      if (this.shouldRejectImage({
        imageWidth: this.preImage.width,
        imageHeight: this.preImage.height,
        previewSize: this.previewSize,
        maxZoom: this.options.maxZoom,
        exportZoom: this.options.exportZoom,
        smallImage: this.options.smallImage
      })) {
        this.onImageError(_constants.ERRORS.SMALL_IMAGE);
        if (this.image.src) {
          this.setImageLoadedClass();
        }
        return;
      }

      this.image.src = this.preImage.src;
    }
  }, {
    key: 'onImageLoaded',
    value: function onImageLoaded() {
      this.rotation = 0;
      this.setupZoomer(this.options.imageState && this.options.imageState.zoom || this._initialZoom);
      if (this.options.imageState && this.options.imageState.offset) {
        this.offset = this.options.imageState.offset;
      } else {
        this.centerImage();
      }

      this.options.imageState = {};

      this.$image.attr('src', this.image.src);
      if (this.options.imageBackground) {
        this.$bg.attr('src', this.image.src);
      }

      this.setImageLoadedClass();

      this.imageLoaded = true;

      this.options.onImageLoaded();
    }
  }, {
    key: 'onImageError',
    value: function onImageError() {
      this.options.onImageError.apply(this, arguments);
      this.removeImageLoadingClass();
    }
  }, {
    key: 'setImageLoadingClass',
    value: function setImageLoadingClass() {
      this.$preview.removeClass(_constants.CLASS_NAMES.IMAGE_LOADED).addClass(_constants.CLASS_NAMES.IMAGE_LOADING);
    }
  }, {
    key: 'setImageLoadedClass',
    value: function setImageLoadedClass() {
      this.$preview.removeClass(_constants.CLASS_NAMES.IMAGE_LOADING).addClass(_constants.CLASS_NAMES.IMAGE_LOADED);
    }
  }, {
    key: 'removeImageLoadingClass',
    value: function removeImageLoadingClass() {
      this.$preview.removeClass(_constants.CLASS_NAMES.IMAGE_LOADING);
    }
  }, {
    key: 'getEventPosition',
    value: function getEventPosition(e) {
      if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
        e = e.originalEvent.touches[0];
      }
      if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY };
      }
    }
  }, {
    key: 'onPreviewEvent',
    value: function onPreviewEvent(e) {
      if (!this.imageLoaded) {
        return;
      }

      this.moveContinue = false;
      this.$imageContainer.off(_constants.EVENTS.PREVIEW_MOVE);

      if (e.type === 'mousedown' || e.type === 'touchstart') {
        this.origin = this.getEventPosition(e);
        this.moveContinue = true;
        this.$imageContainer.on(_constants.EVENTS.PREVIEW_MOVE, this.onMove.bind(this));
      } else {
        (0, _jquery2.default)(document.body).focus();
      }

      e.stopPropagation();
      return false;
    }
  }, {
    key: 'onMove',
    value: function onMove(e) {
      var eventPosition = this.getEventPosition(e);

      if (this.moveContinue && eventPosition) {
        this.offset = {
          x: this.offset.x + eventPosition.x - this.origin.x,
          y: this.offset.y + eventPosition.y - this.origin.y
        };
      }

      this.origin = eventPosition;

      e.stopPropagation();
      return false;
    }
  }, {
    key: 'fixOffset',
    value: function fixOffset(offset) {
      if (!this.imageLoaded) {
        return offset;
      }

      var ret = { x: offset.x, y: offset.y };

      if (!this.options.freeMove) {
        if (this.imageWidth * this.zoom >= this.previewSize.width) {
          ret.x = Math.min(0, Math.max(ret.x, this.previewSize.width - this.imageWidth * this.zoom));
        } else {
          ret.x = Math.max(0, Math.min(ret.x, this.previewSize.width - this.imageWidth * this.zoom));
        }

        if (this.imageHeight * this.zoom >= this.previewSize.height) {
          ret.y = Math.min(0, Math.max(ret.y, this.previewSize.height - this.imageHeight * this.zoom));
        } else {
          ret.y = Math.max(0, Math.min(ret.y, this.previewSize.height - this.imageHeight * this.zoom));
        }
      }

      ret.x = (0, _utils.round)(ret.x);
      ret.y = (0, _utils.round)(ret.y);

      return ret;
    }
  }, {
    key: 'centerImage',
    value: function centerImage() {
      if (!this.image.width || !this.image.height || !this.zoom) {
        return;
      }

      this.offset = {
        x: (this.previewSize.width - this.imageWidth * this.zoom) / 2,
        y: (this.previewSize.height - this.imageHeight * this.zoom) / 2
      };
    }
  }, {
    key: 'onZoomSliderChange',
    value: function onZoomSliderChange() {
      if (!this.imageLoaded) {
        return;
      }

      this.zoomSliderPos = Number(this.$zoomSlider.val());
      var newZoom = this.zoomer.getZoom(this.zoomSliderPos);
      if (newZoom === this.zoom) {
        return;
      }
      this.zoom = newZoom;
    }
  }, {
    key: 'enableZoomSlider',
    value: function enableZoomSlider() {
      this.$zoomSlider.removeAttr('disabled');
      this.options.onZoomEnabled();
    }
  }, {
    key: 'disableZoomSlider',
    value: function disableZoomSlider() {
      this.$zoomSlider.attr('disabled', true);
      this.options.onZoomDisabled();
    }
  }, {
    key: 'setupZoomer',
    value: function setupZoomer(zoom) {
      this.zoomer.setup({
        imageSize: this.imageSize,
        previewSize: this.previewSize,
        exportZoom: this.options.exportZoom,
        maxZoom: this.options.maxZoom,
        minZoom: this.options.minZoom,
        smallImage: this.options.smallImage
      });
      this.zoom = (0, _utils.exists)(zoom) ? zoom : this._zoom;

      if (this.isZoomable()) {
        this.enableZoomSlider();
      } else {
        this.disableZoomSlider();
      }
    }
  }, {
    key: 'fixZoom',
    value: function fixZoom(zoom) {
      return this.zoomer.fixZoom(zoom);
    }
  }, {
    key: 'isZoomable',
    value: function isZoomable() {
      return this.zoomer.isZoomable();
    }
  }, {
    key: 'renderImage',
    value: function renderImage() {
      var transformation = '\n      translate(' + this.rotatedOffset.x + 'px, ' + this.rotatedOffset.y + 'px)\n      scale(' + this.zoom + ')\n      rotate(' + this.rotation + 'deg)';

      this.$image.css({
        transform: transformation,
        webkitTransform: transformation
      });
      if (this.options.imageBackground) {
        this.$bg.css({
          transform: transformation,
          webkitTransform: transformation
        });
      }
    }
  }, {
    key: 'rotateCW',
    value: function rotateCW() {
      if (this.shouldRejectImage({
        imageWidth: this.image.height,
        imageHeight: this.image.width,
        previewSize: this.previewSize,
        maxZoom: this.options.maxZoom,
        exportZoom: this.options.exportZoom,
        smallImage: this.options.smallImage
      })) {
        this.rotation = (this.rotation + 180) % 360;
      } else {
        this.rotation = (this.rotation + 90) % 360;
      }
    }
  }, {
    key: 'rotateCCW',
    value: function rotateCCW() {
      if (this.shouldRejectImage({
        imageWidth: this.image.height,
        imageHeight: this.image.width,
        previewSize: this.previewSize,
        maxZoom: this.options.maxZoom,
        exportZoom: this.options.exportZoom,
        smallImage: this.options.smallImage
      })) {
        this.rotation = (this.rotation + 180) % 360;
      } else {
        this.rotation = (this.rotation + 270) % 360;
      }
    }
  }, {
    key: 'shouldRejectImage',
    value: function shouldRejectImage(_ref) {
      var imageWidth = _ref.imageWidth,
          imageHeight = _ref.imageHeight,
          previewSize = _ref.previewSize,
          maxZoom = _ref.maxZoom,
          exportZoom = _ref.exportZoom,
          smallImage = _ref.smallImage;

      if (smallImage !== 'reject') {
        return false;
      }

      return imageWidth * maxZoom < previewSize.width * exportZoom || imageHeight * maxZoom < previewSize.height * exportZoom;
    }
  }, {
    key: 'getCroppedImageData',
    value: function getCroppedImageData(exportOptions) {
      if (!this.image.src) {
        return;
      }

      var exportDefaults = {
        type: 'image/png',
        quality: 0.75,
        originalSize: false,
        fillBg: '#fff'
      };
      exportOptions = _jquery2.default.extend({}, exportDefaults, exportOptions);

      var exportZoom = exportOptions.originalSize ? 1 / this.zoom : this.options.exportZoom;

      var zoomedSize = {
        width: this.zoom * exportZoom * this.image.width,
        height: this.zoom * exportZoom * this.image.height
      };

      var canvas = (0, _jquery2.default)('<canvas />').attr({
        width: this.previewSize.width * exportZoom,
        height: this.previewSize.height * exportZoom
      }).get(0);
      var canvasContext = canvas.getContext('2d');

      if (exportOptions.type === 'image/jpeg') {
        canvasContext.fillStyle = exportOptions.fillBg;
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      }

      canvasContext.translate(this.rotatedOffset.x * exportZoom, this.rotatedOffset.y * exportZoom);
      canvasContext.rotate(this.rotation * Math.PI / 180);
      canvasContext.drawImage(this.image, 0, 0, zoomedSize.width, zoomedSize.height);

      return canvas.toDataURL(exportOptions.type, exportOptions.quality);
    }
  }, {
    key: 'disable',
    value: function disable() {
      this.unbindListeners();
      this.disableZoomSlider();
      this.$el.addClass(_constants.CLASS_NAMES.DISABLED);
    }
  }, {
    key: 'reenable',
    value: function reenable() {
      this.bindListeners();
      this.enableZoomSlider();
      this.$el.removeClass(_constants.CLASS_NAMES.DISABLED);
    }
  }, {
    key: '$',
    value: function $(selector) {
      if (!this.$el) {
        return null;
      }
      return this.$el.find(selector);
    }
  }, {
    key: 'offset',
    set: function set(position) {
      if (!position || !(0, _utils.exists)(position.x) || !(0, _utils.exists)(position.y)) {
        return;
      }

      this._offset = this.fixOffset(position);
      this.renderImage();

      this.options.onOffsetChange(position);
    },
    get: function get() {
      return this._offset;
    }
  }, {
    key: 'zoom',
    set: function set(newZoom) {
      newZoom = this.fixZoom(newZoom);

      if (this.imageLoaded) {
        var oldZoom = this.zoom;

        var newX = this.previewSize.width / 2 - (this.previewSize.width / 2 - this.offset.x) * newZoom / oldZoom;
        var newY = this.previewSize.height / 2 - (this.previewSize.height / 2 - this.offset.y) * newZoom / oldZoom;

        this._zoom = newZoom;
        this.offset = { x: newX, y: newY }; // Triggers renderImage()
      } else {
        this._zoom = newZoom;
      }

      this.zoomSliderPos = this.zoomer.getSliderPos(this.zoom);
      this.$zoomSlider.val(this.zoomSliderPos);

      this.options.onZoomChange(newZoom);
    },
    get: function get() {
      return this._zoom;
    }
  }, {
    key: 'rotatedOffset',
    get: function get() {
      return {
        x: this.offset.x + (this.rotation === 90 ? this.image.height * this.zoom : 0) + (this.rotation === 180 ? this.image.width * this.zoom : 0),
        y: this.offset.y + (this.rotation === 180 ? this.image.height * this.zoom : 0) + (this.rotation === 270 ? this.image.width * this.zoom : 0)
      };
    }
  }, {
    key: 'rotation',
    set: function set(newRotation) {
      this._rotation = newRotation;

      if (this.imageLoaded) {
        // Change in image size may lead to change in zoom range
        this.setupZoomer();
      }
    },
    get: function get() {
      return this._rotation;
    }
  }, {
    key: 'imageState',
    get: function get() {
      return {
        src: this.image.src,
        offset: this.offset,
        zoom: this.zoom
      };
    }
  }, {
    key: 'imageSrc',
    get: function get() {
      return this.image.src;
    },
    set: function set(imageSrc) {
      this.loadImage(imageSrc);
    }
  }, {
    key: 'imageWidth',
    get: function get() {
      return this.rotation % 180 === 0 ? this.image.width : this.image.height;
    }
  }, {
    key: 'imageHeight',
    get: function get() {
      return this.rotation % 180 === 0 ? this.image.height : this.image.width;
    }
  }, {
    key: 'imageSize',
    get: function get() {
      return {
        width: this.imageWidth,
        height: this.imageHeight
      };
    }
  }, {
    key: 'initialZoom',
    get: function get() {
      return this.options.initialZoom;
    },
    set: function set(initialZoomOption) {
      this.options.initialZoom = initialZoomOption;
      if (initialZoomOption === 'min') {
        this._initialZoom = 0; // Will be fixed when image loads
      } else if (initialZoomOption === 'image') {
        this._initialZoom = 1;
      } else {
        this._initialZoom = 0;
      }
    }
  }, {
    key: 'exportZoom',
    get: function get() {
      return this.options.exportZoom;
    },
    set: function set(exportZoom) {
      this.options.exportZoom = exportZoom;
      this.setupZoomer();
    }
  }, {
    key: 'minZoom',
    get: function get() {
      return this.options.minZoom;
    },
    set: function set(minZoom) {
      this.options.minZoom = minZoom;
      this.setupZoomer();
    }
  }, {
    key: 'maxZoom',
    get: function get() {
      return this.options.maxZoom;
    },
    set: function set(maxZoom) {
      this.options.maxZoom = maxZoom;
      this.setupZoomer();
    }
  }, {
    key: 'previewSize',
    get: function get() {
      return this._previewSize;
    },
    set: function set(size) {
      if (!size || size.width <= 0 || size.height <= 0) {
        return;
      }

      this._previewSize = {
        width: size.width,
        height: size.height
      };
      this.$preview.innerWidth(this.previewSize.width).innerHeight(this.previewSize.height);

      if (this.imageLoaded) {
        this.setupZoomer();
      }
    }
  }]);

  return Cropit;
}();

exports.default = Cropit;
//# sourceMappingURL=cropit.js.map
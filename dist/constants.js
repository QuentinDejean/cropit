'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var PLUGIN_KEY = exports.PLUGIN_KEY = 'cropit';

var CLASS_NAMES = exports.CLASS_NAMES = {
  PREVIEW: 'cropit-preview',
  PREVIEW_IMAGE_CONTAINER: 'cropit-preview-image-container',
  PREVIEW_IMAGE: 'cropit-preview-image',
  PREVIEW_BACKGROUND_CONTAINER: 'cropit-preview-background-container',
  PREVIEW_BACKGROUND: 'cropit-preview-background',
  FILE_INPUT: 'cropit-image-input',
  ZOOM_SLIDER: 'cropit-image-zoom-input',

  DRAG_HOVERED: 'cropit-drag-hovered',
  IMAGE_LOADING: 'cropit-image-loading',
  IMAGE_LOADED: 'cropit-image-loaded',
  DISABLED: 'cropit-disabled'
};

var ERRORS = exports.ERRORS = {
  IMAGE_FAILED_TO_LOAD: { code: 0, message: 'Image failed to load.' },
  SMALL_IMAGE: { code: 1, message: 'Image is too small.' }
};

var eventName = function eventName(events) {
  return events.map(function (e) {
    return e + '.cropit';
  }).join(' ');
};
var EVENTS = exports.EVENTS = {
  PREVIEW: eventName(['mousedown', 'mouseup', 'mouseleave', 'touchstart', 'touchend', 'touchcancel', 'touchleave']),
  PREVIEW_MOVE: eventName(['mousemove', 'touchmove']),
  ZOOM_INPUT: eventName(['mousemove', 'touchmove', 'change'])
};
//# sourceMappingURL=constants.js.map
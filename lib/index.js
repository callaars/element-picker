"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var onClick = function (_) { };
var applyStyle = {};
var lastTarget = null;
var lastTargetStyle = {};
var reset = function () {
    document.body.style.cursor = 'auto';
    document.removeEventListener('click', onMouseClick, false);
    document.removeEventListener('mousemove', onMouseClick, false);
    removeTargetStyle();
    applyStyle = {};
    onClick = function (_) { };
    lastTarget = null;
    lastTargetStyle = {};
};
var removeTargetStyle = function () {
    if (lastTarget) {
        Object.keys(applyStyle).forEach(function (key) {
            lastTarget === null || lastTarget === void 0 ? true : delete lastTarget.style[key];
            if (lastTargetStyle[key]) {
                lastTarget.style[key] = lastTargetStyle[key];
            }
        });
    }
};
var applyTargetStyle = function (target) {
    Object.keys(applyStyle).forEach(function (key) {
        lastTargetStyle[key] = target.style[key];
        target.style[key] = applyStyle[key];
    });
};
var onMouseClick = function (event) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    onClick(event.target);
    reset();
};
var onMouseMove = function (event) {
    removeTargetStyle();
    lastTarget = event.target;
    applyTargetStyle(lastTarget);
};
var start = function (options) {
    reset();
    if (options.onClick) {
        onClick = options.onClick;
    }
    if (options.hoverStyle) {
        applyStyle = {};
    }
    document.body.style.cursor = 'pointer';
    document.addEventListener('click', onMouseClick, false);
    document.addEventListener('mousemove', onMouseMove, false);
};
exports.default = { start: start };

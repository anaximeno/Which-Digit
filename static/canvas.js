"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export const __esModule = true;
import { max, min } from "./common.js";
var Canvas = (function () {
    function Canvas(selector, canvasSize, ctxSize) {
        var _this = this;
        this.selector = selector;
        this.canvasSize = canvasSize;
        this.ctxSize = ctxSize;
        this.getCanvasElement = function () { return _this.canvasElement; };
        this.getCtxElement = function () { return _this.ctxElement; };
        this.getLastCtxPosition = function () { return _this.lastCtxPos; };
        this.setLastCtxPosition = function (position) {
            _this.lastCtxPos = position;
        };
        this.idealCanvasSize = function (paddingIncrement) {
            if (paddingIncrement === void 0) { paddingIncrement = 30; }
            var _a = _this.canvasSize, width = _a.width, height = _a.height;
            var maxSize = max(width, height);
            var innerW = window.innerWidth, outerW = window.outerWidth, o = __rest(window, ["innerWidth", "outerWidth"]);
            var betterWidth = min(innerW, outerW) || innerW;
            return betterWidth > (maxSize + paddingIncrement) ?
                maxSize : (betterWidth - paddingIncrement);
        };
        this.idealCtxSize = function () {
            var _a = _this.canvasSize, canvasW = _a.width, canvasH = _a.height;
            var maxCanvasSize = max(canvasW, canvasH);
            return (_this.idealCanvasSize() * _this.ctxSize) / maxCanvasSize;
        };
        this.setUpCtx = function (strokeStyle, fillStyle, lineJoin, lineCap) {
            if (strokeStyle === void 0) { strokeStyle = 'white'; }
            if (fillStyle === void 0) { fillStyle = 'white'; }
            if (lineJoin === void 0) { lineJoin = 'round'; }
            if (lineCap === void 0) { lineCap = 'round'; }
            _this.ctxElement.strokeStyle = strokeStyle;
            _this.ctxElement.fillStyle = fillStyle;
            _this.ctxElement.lineJoin = lineJoin;
            _this.ctxElement.lineCap = lineCap;
        };
        this.resize = function () {
            var canvasSize = _this.idealCanvasSize();
            var ctxSize = _this.idealCtxSize();
            _this.canvasElement.width = canvasSize;
            _this.canvasElement.height = canvasSize;
            _this.ctxElement.lineWidth = ctxSize;
            _this.setUpCtx();
        };
        this.setEvent = function (event) {
            _this.canvasElement.addEventListener(event.type, event.listener);
        };
        this.clear = function () {
            var limit = _this.canvasElement.width;
            _this.ctxElement.clearRect(0, 0, limit, limit);
        };
        this.lastCtxPos = { x: 0, y: 0 };
        this.drawing = false;
        this.canvasElement = document.getElementById(selector);
        this.ctxElement = this.canvasElement.getContext('2d');
    }
    return Canvas;
}());
const _Canvas = Canvas;
export { _Canvas as Canvas };
//# sourceMappingURL=canvas.js.map
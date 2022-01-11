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
        this.getCanvasElement = function () {
            return document.getElementById(_this.selector);
        };
        this.getCtxElement = function () {
            return _this.getCanvasElement().getContext('2d');
        };
        this.setLastCtxPosition = function (pos) {
            _this.lastCtxPos = pos;
        };
        this.getLastCtxPosition = function () {
            return _this.lastCtxPos;
        };
        this.canvasBetterSize = function (paddingIncrement) {
            if (paddingIncrement === void 0) { paddingIncrement = 30; }
            var _a = _this.canvasSize, width = _a.width, height = _a.height;
            var maxSize = (0, max)(width, height);
            var innerW = window.innerWidth, outerW = window.outerWidth, o = __rest(window, ["innerWidth", "outerWidth"]);
            var betterWidth = (0, min)(innerW, outerW) || innerW;
            return betterWidth > (maxSize + paddingIncrement) ?
                maxSize : (betterWidth - paddingIncrement);
        };
        this.ctxBetterSize = function () {
            var _a = _this.canvasSize, canvasW = _a.width, canvasH = _a.height;
            var maxCanvasSize = (0, max)(canvasW, canvasH);
            return (_this.canvasBetterSize() * _this.ctxSize) / maxCanvasSize;
        };
        this.setUpCtx = function (strokeStyle, fillStyle, lineJoin, lineCap) {
            if (strokeStyle === void 0) { strokeStyle = 'white'; }
            if (fillStyle === void 0) { fillStyle = 'white'; }
            if (lineJoin === void 0) { lineJoin = 'round'; }
            if (lineCap === void 0) { lineCap = 'round'; }
            _this.ctx.strokeStyle = strokeStyle;
            _this.ctx.fillStyle = fillStyle;
            _this.ctx.lineJoin = lineJoin;
            _this.ctx.lineCap = lineCap;
        };
        this.resize = function () {
            var canvasSize = _this.canvasBetterSize();
            var ctxSize = _this.ctxBetterSize();
            _this.canvas.width = canvasSize;
            _this.canvas.height = canvasSize;
            _this.ctx.lineWidth = ctxSize;
            _this.setUpCtx();
        };
        this.setEvent = function (type, listener) {
            _this.canvas.addEventListener(type, listener);
        };
        this.clear = function () {
            var canvasSize = _this.canvas.width;
            _this.ctx.clearRect(0, 0, canvasSize, canvasSize);
        };
        this.lastCtxPos = { x: 0, y: 0 };
        this.drawing = false;
        this.canvas = document.getElementById(selector);
        this.ctx = this.canvas.getContext('2d');
    }
    return Canvas;
}());
const _Canvas = Canvas;
export { _Canvas as Canvas };
//# sourceMappingURL=canvas.js.map
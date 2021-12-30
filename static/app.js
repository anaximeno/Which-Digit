"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export const __esModule = true;
import { sleep, max } from "./common.js";
;
var App = (function () {
    function App(logger, outLabel, canvas, eraseButton, model) {
        var _this = this;
        this.logger = logger;
        this.outLabel = outLabel;
        this.canvas = canvas;
        this.eraseButton = eraseButton;
        this.model = model;
        this.initializeCanvasEvents = function (sleepTimeOnMouseOut, sleepTimeOnMouseUp) {
            if (sleepTimeOnMouseOut === void 0) { sleepTimeOnMouseOut = 1500; }
            if (sleepTimeOnMouseUp === void 0) { sleepTimeOnMouseUp = 1350; }
            var _canvas = _this.canvas.getCanvasElement();
            var _ctx = _this.canvas.getCtxElement();
            _this.canvas.setEvent('mousedown', function (e) {
                e.preventDefault();
                if (_this.model.isLoaded() === false)
                    return;
                _this.canvas.drawing = true;
                _this.model.deactivateHalt();
                _this.model.lastDrawPredicted = false;
                _this.canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
            });
            _this.canvas.setEvent('mouseout', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var wasDrawing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            e.preventDefault();
                            wasDrawing = this.canvas.drawing;
                            this.canvas.drawing = false;
                            return [4, sleep(sleepTimeOnMouseOut)];
                        case 1:
                            _a.sent();
                            if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())
                                this.model.predict(150, false);
                            return [2];
                    }
                });
            }); });
            _this.canvas.setEvent('mousemove', function (e) {
                e.preventDefault();
                if (_this.canvas.drawing === false)
                    return;
                var _a = _this.canvas.getLastCtxPosition(), x = _a.x, y = _a.y;
                _ctx.beginPath();
                _ctx.moveTo(x, y);
                _ctx.lineTo(e.offsetX, e.offsetY);
                _ctx.stroke();
                _this.canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
            });
            _this.canvas.setEvent('mouseup', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var wasDrawing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            e.preventDefault();
                            wasDrawing = this.canvas.drawing;
                            this.canvas.drawing = false;
                            return [4, sleep(sleepTimeOnMouseUp)];
                        case 1:
                            _a.sent();
                            if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())
                                this.model.predict(150, false);
                            return [2];
                    }
                });
            }); });
            _this.canvas.setEvent('touchstart', function (e) {
                e.preventDefault();
                if (_this.model.isLoaded() === false)
                    return;
                _this.canvas.drawing = true;
                _this.model.lastDrawPredicted = false;
                _this.model.deactivateHalt();
                var clientRect = _canvas.getBoundingClientRect();
                var touch = e.touches[0];
                _this.canvas.setLastCtxPosition({
                    x: touch.pageX - clientRect.x,
                    y: touch.pageY - clientRect.y
                });
            });
            _this.canvas.setEvent('touchmove', function (e) {
                e.preventDefault();
                if (_this.canvas.drawing === false)
                    return;
                var clientRect = _canvas.getBoundingClientRect();
                var touch = e.touches[0];
                var _a = _this.canvas.getLastCtxPosition(), x = _a.x, y = _a.y;
                _ctx.beginPath();
                _ctx.moveTo(x, y);
                x = touch.pageX - clientRect.x;
                y = touch.pageY - clientRect.y;
                _ctx.lineTo(x, y);
                _ctx.stroke();
                _this.canvas.setLastCtxPosition({ x: x, y: y });
            });
            _this.canvas.setEvent('touchend', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var wasDrawing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            e.preventDefault();
                            wasDrawing = this.canvas.drawing;
                            this.canvas.drawing = false;
                            return [4, sleep(sleepTimeOnMouseUp)];
                        case 1:
                            _a.sent();
                            if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())
                                this.model.predict(150, false);
                            return [2];
                    }
                });
            }); });
        };
        this.resizeTheEntirePage = function (pageMarginIncrease) {
            if (pageMarginIncrease === void 0) { pageMarginIncrease = 300; }
            var innerH = window.innerHeight;
            var output = document.getElementById('output');
            var pipe = document.getElementById('pipeline');
            var main = document.getElementsByTagName('html')[0];
            var canvasSize = _this.canvas.canvasBetterSize();
            main.style.height = max(innerH, pageMarginIncrease + canvasSize).toString() + "px";
            output.style.width = canvasSize.toString() + "px";
            pipe.style.width = output.style.width;
            _this.canvas.resize();
        };
        this.run = function (definition) {
            if (definition) {
                _this.appDefinitions = definition;
            }
            _this.initializeCanvasEvents(_this.appDefinitions.sleepTimeOnMouseOut, _this.appDefinitions.sleepTimeOnMouseUp);
            _this.resizeTheEntirePage(_this.appDefinitions.pageMarginIncrease);
            _this.model.load();
            _this.eraseButton.setEvent('click', function () {
                _this.canvas.clear();
                if (_this.model.isLoaded() === true) {
                    _this.outLabel.defaultMessage();
                    _this.model.activateHalt();
                }
            });
            window.addEventListener('resize', function () {
                _this.resizeTheEntirePage();
                if (_this.model.isLoaded() === true) {
                    _this.outLabel.defaultMessage();
                }
            });
            _this.logger.writeLog('Running the Digit Recognition Web App!', false, false);
        };
        this.appDefinitions = {
            sleepTimeOnMouseOut: 1500,
            sleepTimeOnMouseUp: 1350,
            pageMarginIncrease: 300
        };
    }
    return App;
}());
const _App = App;
export { _App as App };
;
//# sourceMappingURL=app.js.map
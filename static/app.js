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
import { Canvas } from "./canvas.js";
import { Model } from "./model.js";
import { sleep, max } from "./common.js";
import { Logger, Button, OutputSection } from "./common.js";
var App = (function () {
    function App(settings) {
        this.settings = settings;
        this.log = Logger.getInstance();
        this.eraser = new Button('erase-btn', 'Clear', 'Please wait');
        this.out = new OutputSection('output', "<div id='output-text'>\n                Draw any digit between <strong>0</strong> to <strong>9</strong>\n            <div>");
        var _a = this.settings, canvasSettings = _a.canvasSettings, modelSettings = _a.modelSettings;
        var width = canvasSettings.canvasSize, ctxSize = canvasSettings.ctxSize;
        var height = width;
        this.canvas = new Canvas('draw-canvas', { width: width, height: height }, ctxSize);
        this.model = new Model(modelSettings, this.canvas, this.eraser, this.out);
    }
    App.prototype.initializeCanvasEvents = function (sleepTimeOnMouseOut, sleepTimeOnMouseUp) {
        var _this = this;
        if (sleepTimeOnMouseOut === void 0) { sleepTimeOnMouseOut = 1500; }
        if (sleepTimeOnMouseUp === void 0) { sleepTimeOnMouseUp = 1350; }
        var _canvas = this.canvas.getCanvasElement();
        var _ctx = this.canvas.getCtxElement();
        this.canvas.setEvent({
            type: 'mousedown',
            listener: function (e) {
                e.preventDefault();
                if (_this.model.isLoaded() === false)
                    return;
                _this.canvas.drawing = true;
                _this.model.deactivateHalt();
                _this.model.lastDrawPredicted = false;
                _this.canvas.setLastCtxPosition({
                    x: e.offsetX,
                    y: e.offsetY
                });
            }
        });
        this.canvas.setEvent({
            type: 'mouseout',
            listener: function (e) { return __awaiter(_this, void 0, void 0, function () {
                var wasDrawing, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            e.preventDefault();
                            wasDrawing = this.canvas.drawing;
                            this.canvas.drawing = false;
                            return [4, sleep(sleepTimeOnMouseOut)];
                        case 1:
                            _b.sent();
                            if (!(this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())) return [3, 3];
                            _a = this.showResults;
                            return [4, this.model.analyzeDrawing()];
                        case 2:
                            _a.apply(this, [_b.sent()]);
                            _b.label = 3;
                        case 3: return [2];
                    }
                });
            }); }
        });
        this.canvas.setEvent({
            type: 'mousemove',
            listener: function (e) {
                e.preventDefault();
                if (_this.canvas.drawing === false)
                    return;
                var _a = _this.canvas.getLastCtxPosition(), x = _a.x, y = _a.y;
                _ctx.beginPath();
                _ctx.moveTo(x, y);
                _ctx.lineTo(e.offsetX, e.offsetY);
                _ctx.stroke();
                _this.canvas.setLastCtxPosition({
                    x: e.offsetX,
                    y: e.offsetY
                });
            }
        });
        this.canvas.setEvent({
            type: 'mouseup',
            listener: function (e) { return __awaiter(_this, void 0, void 0, function () {
                var wasDrawing, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            e.preventDefault();
                            wasDrawing = this.canvas.drawing;
                            this.canvas.drawing = false;
                            return [4, sleep(sleepTimeOnMouseUp)];
                        case 1:
                            _b.sent();
                            if (!(this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())) return [3, 3];
                            _a = this.showResults;
                            return [4, this.model.analyzeDrawing()];
                        case 2:
                            _a.apply(this, [_b.sent()]);
                            _b.label = 3;
                        case 3: return [2];
                    }
                });
            }); }
        });
        this.canvas.setEvent({
            type: 'touchstart',
            listener: function (e) {
                e.preventDefault();
                if (_this.model.isLoaded() === false)
                    return;
                _this.canvas.drawing = true;
                _this.model.lastDrawPredicted = false;
                _this.model.deactivateHalt();
                var _a = _canvas.getBoundingClientRect(), Ux = _a.x, Uy = _a.y;
                var _b = e.touches[0], Tx = _b.pageX, Ty = _b.pageY;
                _this.canvas.setLastCtxPosition({ x: Tx - Ux, y: Ty - Uy });
            }
        });
        this.canvas.setEvent({
            type: 'touchmove',
            listener: function (e) {
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
            }
        });
        this.canvas.setEvent({
            type: 'touchend',
            listener: function (e) { return __awaiter(_this, void 0, void 0, function () {
                var wasDrawing, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            e.preventDefault();
                            wasDrawing = this.canvas.drawing;
                            this.canvas.drawing = false;
                            return [4, sleep(sleepTimeOnMouseUp)];
                        case 1:
                            _b.sent();
                            if (!(this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())) return [3, 3];
                            _a = this.showResults;
                            return [4, this.model.analyzeDrawing()];
                        case 2:
                            _a.apply(this, [_b.sent()]);
                            _b.label = 3;
                        case 3: return [2];
                    }
                });
            }); }
        });
    };
    App.prototype.showResults = function (prediction) {
        if (prediction !== undefined) {
            var name_1 = prediction.name, value = prediction.value, certainty = prediction.certainty, _ = __rest(prediction, ["name", "value", "certainty"]);
            var prob = Number((certainty * 100).toFixed(2));
            this.out.write("\n                <div id='output-text'>\n                    The number drawn is <strong>" + value + "</strong> (<strong>" + name_1 + "</strong>)\n                <div>");
            this.log.writeLog("Prediction: " + value + "  (certainty = " + prob + "%)");
        }
        else {
            this.log.writeLog('App.showResults: called without prediction to show.');
        }
    };
    App.prototype.resizeTheEntirePage = function (pageMarginIncrease) {
        if (pageMarginIncrease === void 0) { pageMarginIncrease = 300; }
        var innerH = window.innerHeight;
        var output = document.getElementById('output');
        var pipe = document.getElementById('pipeline');
        var main = document.getElementsByTagName('html')[0];
        var size = this.canvas.idealCanvasSize();
        var increasedSize = size + pageMarginIncrease;
        var maxValue = max(innerH, increasedSize);
        main.style.height = maxValue + "px";
        output.style.width = size + "px";
        pipe.style.width = output.style.width;
        this.canvas.resize();
    };
    App.prototype.run = function () {
        var _this = this;
        this.eraser.setEvent({
            type: 'click',
            listener: function () {
                _this.canvas.clear();
                _this.model.activateHalt(function () {
                    _this.log.writeLog("App: clear button clicked, canceled prediction!");
                });
                if (_this.model.isLoaded() === true) {
                    _this.out.defaultMessage();
                }
            }
        });
        window.addEventListener('resize', function () {
            _this.resizeTheEntirePage();
            if (_this.model.isLoaded() === true) {
                _this.out.defaultMessage();
            }
        });
        var _a = this.settings.mouseTimeSettings, onUp = _a.onUp, onOut = _a.onOut;
        this.initializeCanvasEvents(onOut, onUp);
        this.resizeTheEntirePage();
        this.model.load();
        this.log.writeLog('App: Running the Digit Recognition Web App!');
    };
    return App;
}());
const _App = App;
export { _App as App };
;
//# sourceMappingURL=app.js.map
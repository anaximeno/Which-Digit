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
import { sleep } from "./common.js";
var DigitNames = {
    0: 'Zero', 1: 'One',
    2: 'Two', 3: 'Three',
    4: 'Four', 5: 'Five',
    6: 'Six', 7: 'Seven',
    8: 'Eight', 9: 'Nine'
};
var Model = (function () {
    function Model(path, canvas, eraseButton, outputLabel, logger) {
        var _this = this;
        this.path = path;
        this.canvas = canvas;
        this.eraseButton = eraseButton;
        this.outputLabel = outputLabel;
        this.logger = logger;
        this.isLoaded = function () { return _this.modelWasLoaded; };
        this.load = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.eraseButton.disable();
                        _a = this;
                        return [4, tf.loadLayersModel(this.path)];
                    case 1:
                        _a.model = _b.sent();
                        this.modelWasLoaded = this.model !== undefined;
                        this.logger.writeLog(this.modelWasLoaded ?
                            "The model was loaded successfully!" :
                            "ERROR: The model was not Loaded, try to reload the page.");
                        if (this.modelWasLoaded === true) {
                            this.canvas.getCanvasElement().style.cursor = 'crosshair';
                            this.eraseButton.enable();
                            this.outputLabel.defaultMessage();
                        }
                        return [2];
                }
            });
        }); };
        this.predict = function (sleepTime, returnDraw) {
            if (sleepTime === void 0) { sleepTime = 150; }
            if (returnDraw === void 0) { returnDraw = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var _canvas, inputTensor, error_1, out, value, prediction, probability;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _canvas = this.canvas.getCanvasElement();
                            this.eraseButton.disable();
                            this.outputLabel.write("<-<-< Analyzing >->->");
                            inputTensor = tf.browser.fromPixels(_canvas)
                                .resizeBilinear(this.inputShape)
                                .mean(2)
                                .pad(this.paddingShape)
                                .expandDims()
                                .expandDims(3)
                                .toFloat()
                                .div(255.0);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            if (this.modelWasLoaded === false || this.canvas.drawing === true) {
                                throw Error(this.modelWasLoaded ?
                                    'Prediction canceled, model was not loaded yet!' :
                                    'Drawing already, prediction canceled!');
                            }
                            else if (inputTensor.sum().dataSync()[0] === 0) {
                                this.eraseButton.enable();
                                this.outputLabel.write("<div id='output-text'><strong>TIP</strong>:" +
                                    "Click and Hold to draw.<\div>");
                                throw Error('Canvas has no drawing, prediction canceled!');
                            }
                            if (!(this.checkLastDrawPredicted() === false)) return [3, 3];
                            return [4, sleep(this.checkFirstPrediction() ?
                                    Number((sleepTime / Math.PI).toFixed(0)) : sleepTime)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            if (this.checkHalt() === true) {
                                this.eraseButton.enable();
                                this.outputLabel.defaultMessage();
                                throw Error('Halt Received, prediction was canceled!');
                            }
                            return [3, 5];
                        case 4:
                            error_1 = _a.sent();
                            this.logger.writeLog(error_1);
                            return [2];
                        case 5:
                            tf.engine().startScope();
                            out = this.model.predict(inputTensor).dataSync();
                            value = tf.argMax(out).dataSync();
                            prediction = {
                                name: DigitNames[value],
                                certainty: tf.max(out).dataSync()[0],
                                value: value
                            };
                            if (returnDraw === true) {
                                prediction.draw = inputTensor.dataSync();
                            }
                            tf.engine().endScope();
                            probability = Number((prediction.certainty * 100).toFixed(2));
                            this.outputLabel.write("<div id='output-text'>The number drawn is <strong>" +
                                (prediction.value + "</strong> (<strong>" + prediction.name + "</strong>)<div>"));
                            this.logger.writeLog("Prediction: " + prediction.value + "  Certainty: " + probability + "%");
                            this.eraseButton.enable();
                            this.lastDrawPredicted = true;
                            this.predictions.push(prediction);
                            return [2, prediction];
                    }
                });
            });
        };
        this.activateHalt = function () {
            _this.halt = true;
        };
        this.deactivateHalt = function () {
            _this.halt = false;
        };
        this.checkHalt = function () {
            if (_this.halt === true) {
                _this.deactivateHalt();
                return true;
            }
            return false;
        };
        this.checkFirstPrediction = function () {
            if (_this.isFirstPrediction === true) {
                _this.isFirstPrediction = false;
                return true;
            }
            return false;
        };
        this.checkLastDrawPredicted = function () {
            if (_this.lastDrawPredicted === true) {
                _this.lastDrawPredicted = false;
                return true;
            }
            return false;
        };
        this.modelWasLoaded = false;
        this.halt = false;
        this.isFirstPrediction = true;
        this.lastDrawPredicted = true;
        var padding = 2;
        var inputSize = 36;
        var shapeSize = inputSize - 2 * padding;
        this.inputShape = [shapeSize, shapeSize];
        this.paddingShape = [
            [padding, padding],
            [padding, padding]
        ];
        this.predictions = [];
    }
    return Model;
}());
const _Model = Model;
export { _Model as Model };
;
//# sourceMappingURL=model.js.map
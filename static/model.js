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
                        _a._model = _b.sent();
                        this.modelWasLoaded = this._model !== undefined;
                        this.logger.writeLog('Model.load: ' + (this.modelWasLoaded ?
                            "The model was loaded successfully!" :
                            "Error: The model was not loaded, try to reload the page."));
                        if (this.modelWasLoaded === true) {
                            this.makePrediction(this.getInputTensor());
                            this.canvas.getCanvasElement().style.cursor = 'crosshair';
                            this.eraseButton.enable();
                            this.outputLabel.defaultMessage();
                        }
                        return [2];
                }
            });
        }); };
        this.getInputTensor = function () {
            return tf.browser
                .fromPixels(_this.canvas.getCanvasElement())
                .resizeBilinear(_this.inputShape)
                .mean(2)
                .pad(_this.paddingShape)
                .expandDims()
                .expandDims(3)
                .toFloat()
                .div(255.0);
        };
        this.analyzeDrawing = function (wait, returnDrawing, save) {
            if (wait === void 0) { wait = 150; }
            if (returnDrawing === void 0) { returnDrawing = false; }
            if (save === void 0) { save = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var inputTensor, prediction;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.outputLabel.write("<<< Analyzing your Drawings >>>");
                            this.eraseButton.disable();
                            inputTensor = this.getInputTensor();
                            if (this.modelWasLoaded === false || this.canvas.drawing === true) {
                                this.activateHalt(function () {
                                    _this.eraseButton.enable();
                                    _this.outputLabel.defaultMessage();
                                    _this.logger.writeLog('Model.analyzeDrawing: ' + (_this.modelWasLoaded ?
                                        'model was not loaded yet, prediction canceled!' :
                                        'user is drawing, prediction canceled!'));
                                });
                            }
                            else if (inputTensor.sum().dataSync()[0] === 0) {
                                this.activateHalt(function () {
                                    _this.eraseButton.enable();
                                    _this.outputLabel.write("<div id='output-text'><strong>TIP</strong>:" +
                                        "  Click and Hold to draw.<\div>");
                                    _this.logger.writeLog('Model.analyzeDrawing: canvas has no drawings, prediction canceled!');
                                });
                            }
                            if (!this.checkHalt()) return [3, 1];
                            return [2];
                        case 1: return [4, (0, sleep)(this.checkLastDrawPredicted() === false ? wait : 0)];
                        case 2:
                            _a.sent();
                            this.lastDrawPredicted = true;
                            prediction = this.makePrediction(inputTensor, returnDrawing);
                            if (save === true) {
                                this.predictions.push(prediction);
                            }
                            this.outputLabel.write("Analysis finished.");
                            this.eraseButton.enable();
                            return [2, prediction];
                    }
                });
            });
        };
        this.makePrediction = function (inputTensor, returnDrawing) {
            if (returnDrawing === void 0) { returnDrawing = false; }
            tf.engine().startScope();
            var outputTensor = _this._model.predict(inputTensor).dataSync();
            var predictedValue = tf.argMax(outputTensor).dataSync();
            var predictionValueName = DigitNames[predictedValue];
            var predictionCertainty = tf.max(outputTensor).dataSync();
            tf.engine().endScope();
            var prediction = {
                name: predictionValueName,
                value: predictedValue,
                certainty: predictionCertainty,
                userDrawing: returnDrawing ?
                    inputTensor : undefined
            };
            return prediction;
        };
        this.activateHalt = function (postHaltProcedure) {
            _this.halt = true;
            if (postHaltProcedure !== undefined) {
                _this.postHaltProcedure = postHaltProcedure;
            }
        };
        this.deactivateHalt = function () {
            _this.halt = false;
            _this.postHaltProcedure = undefined;
        };
        this.checkHalt = function () {
            var halt = _this.halt;
            if (halt === true) {
                if (_this.postHaltProcedure !== undefined) {
                    _this.postHaltProcedure();
                }
                _this.deactivateHalt();
            }
            return halt;
        };
        this.checkLastDrawPredicted = function () {
            var lastDrawPredicted = _this.lastDrawPredicted;
            if (lastDrawPredicted === true) {
                _this.lastDrawPredicted = false;
            }
            return lastDrawPredicted;
        };
        this.predictions = [];
        this.modelWasLoaded = false;
        this.halt = false;
        this.lastDrawPredicted = true;
        var padding = 2;
        var inputSize = 36;
        var shapeSize = inputSize - 2 * padding;
        this.inputShape = [shapeSize, shapeSize];
        this.paddingShape = [
            [padding, padding],
            [padding, padding]
        ];
    }
    return Model;
}());
const _Model = Model;
export { _Model as Model };
;
//# sourceMappingURL=model.js.map
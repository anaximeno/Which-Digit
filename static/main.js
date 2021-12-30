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
import { Logger, OutputLabel, Button, sleep, max } from "./common.js";
import { Canvas } from "./canvas.js";
var logger = new Logger(true);
var modelWasLoaded = false;
var haltPrediction = false;
var havePredictLastDraw = true;
var firstPrediction = true;
var model;
var outputLabelDefaultMsg = "<div id='output-text'>Draw any digit between <strong>"
    + "0</strong> to <strong>9</strong><\div>";
var outputLabel = new OutputLabel('output', outputLabelDefaultMsg);
var eraseButton = new Button('erase-btn', 'Erase', 'Wait');
var SHOW_DEBUG_LOGS = false;
var canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
var initializaCanvasEvents = function (sleepTimeOnMouseOut, sleepTimeOnMouseUp) {
    if (sleepTimeOnMouseOut === void 0) { sleepTimeOnMouseOut = 1500; }
    if (sleepTimeOnMouseUp === void 0) { sleepTimeOnMouseUp = 1350; }
    var _canvas = canvas.getCanvasElement();
    var _ctx = canvas.getCtxElement();
    canvas.setEvent('mousedown', function (e) {
        e.preventDefault();
        if (modelWasLoaded === false)
            return;
        canvas.drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
    });
    canvas.setEvent('mouseout', function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    wasDrawing = canvas.drawing;
                    canvas.drawing = false;
                    return [4, sleep(sleepTimeOnMouseOut)];
                case 1:
                    _a.sent();
                    if (modelWasLoaded && wasDrawing && !canvas.drawing && !checkHalt())
                        predictImage();
                    return [2];
            }
        });
    }); });
    canvas.setEvent('mousemove', function (e) {
        e.preventDefault();
        if (canvas.drawing === false)
            return;
        var _a = canvas.getLastCtxPosition(), x = _a.x, y = _a.y;
        _ctx.beginPath();
        _ctx.moveTo(x, y);
        _ctx.lineTo(e.offsetX, e.offsetY);
        _ctx.stroke();
        canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
    });
    canvas.setEvent('mouseup', function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    wasDrawing = canvas.drawing;
                    canvas.drawing = false;
                    return [4, sleep(sleepTimeOnMouseUp)];
                case 1:
                    _a.sent();
                    if (modelWasLoaded && wasDrawing && !canvas.drawing && !checkHalt())
                        predictImage();
                    return [2];
            }
        });
    }); });
    canvas.setEvent('touchstart', function (e) {
        e.preventDefault();
        if (modelWasLoaded === false)
            return;
        canvas.drawing = true;
        havePredictLastDraw = false;
        haltPrediction = false;
        var clientRect = _canvas.getBoundingClientRect();
        var touch = e.touches[0];
        canvas.setLastCtxPosition({
            x: touch.pageX - clientRect.x,
            y: touch.pageY - clientRect.y
        });
    });
    canvas.setEvent('touchmove', function (e) {
        e.preventDefault();
        if (canvas.drawing === false)
            return;
        var clientRect = _canvas.getBoundingClientRect();
        var touch = e.touches[0];
        var _a = canvas.getLastCtxPosition(), x = _a.x, y = _a.y;
        _ctx.beginPath();
        _ctx.moveTo(x, y);
        x = touch.pageX - clientRect.x;
        y = touch.pageY - clientRect.y;
        _ctx.lineTo(x, y);
        _ctx.stroke();
        canvas.setLastCtxPosition({ x: x, y: y });
    });
    canvas.setEvent('touchend', function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    wasDrawing = canvas.drawing;
                    canvas.drawing = false;
                    return [4, sleep(sleepTimeOnMouseUp)];
                case 1:
                    _a.sent();
                    if (modelWasLoaded && wasDrawing && !canvas.drawing && !checkHalt())
                        predictImage();
                    return [2];
            }
        });
    }); });
};
function resizeTheEntirePage(pageMarginIncrease) {
    if (pageMarginIncrease === void 0) { pageMarginIncrease = 300; }
    var innerH = window.innerHeight;
    var output = document.getElementById('output');
    var pipe = document.getElementById('pipeline');
    var main = document.getElementsByTagName('html')[0];
    var canvasSize = canvas.canvasBetterSize();
    main.style.height = max(innerH, pageMarginIncrease + canvasSize).toString() + "px";
    output.style.width = canvasSize.toString() + "px";
    pipe.style.width = output.style.width;
    canvas.resize();
}
function checkHalt() {
    if (haltPrediction === true) {
        haltPrediction = false;
        return true;
    }
    return false;
}
function isFirstPrediction() {
    if (firstPrediction === true) {
        firstPrediction = false;
        return true;
    }
    return false;
}
function checkLastDrawPredicted() {
    if (havePredictLastDraw === true) {
        havePredictLastDraw = false;
        return true;
    }
    return false;
}
function getDigitName(number) {
    return { 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
        5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine'
    }[number];
}
function loadDigitRecognizerModel(path) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = document.getElementById('draw-canvas');
                    eraseButton.write('Wait');
                    return [4, tf.loadLayersModel(path)];
                case 1:
                    model = _a.sent();
                    logger.writeLog("The model was loaded successfully!");
                    canvas.style.cursor = 'crosshair';
                    modelWasLoaded = true;
                    eraseButton.enable();
                    outputLabel.defaultMessage();
                    return [2];
            }
        });
    });
}
function predictImage(inputSize, padding, waitTime) {
    if (inputSize === void 0) { inputSize = 36; }
    if (padding === void 0) { padding = 5; }
    if (waitTime === void 0) { waitTime = 150; }
    return __awaiter(this, void 0, void 0, function () {
        var _canvas, inputShape, paddingShape, threeDotsSVG, InPut, error_1, output, prediction, prob, percentProb;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _canvas = canvas.getCanvasElement();
                    inputShape = [inputSize - 2 * padding, inputSize - 2 * padding];
                    paddingShape = [[padding, padding], [padding, padding]];
                    threeDotsSVG = ('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">' +
                        '<path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>' +
                        '</svg>');
                    eraseButton.disable();
                    outputLabel.write(threeDotsSVG);
                    InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
                        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    if (modelWasLoaded === false || canvas.drawing === true)
                        throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
                    else if (InPut.sum().dataSync()[0] === 0) {
                        eraseButton.enable();
                        outputLabel.write("<div id='output-text'><strong>TIP</strong>: Click and Hold to draw.<\div>");
                        throw Error('Canvas has no drawing, prediction canceled!');
                    }
                    if (!(checkLastDrawPredicted() === false)) return [3, 3];
                    return [4, (isFirstPrediction() ? sleep((Number((waitTime / 2).toFixed(0)))) : sleep(waitTime))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (checkHalt() === true) {
                        eraseButton.enable();
                        outputLabel.defaultMessage();
                        throw Error('Halt Received, prediction was canceled!');
                    }
                    return [3, 5];
                case 4:
                    error_1 = _a.sent();
                    logger.writeLog(error_1);
                    return [2, false];
                case 5:
                    tf.engine().startScope();
                    output = model.predict(InPut).dataSync();
                    prediction = tf.argMax(output).dataSync();
                    prob = tf.max(output).dataSync()[0];
                    percentProb = Number((prob * 100).toFixed(2));
                    tf.engine().endScope();
                    outputLabel.write("<div id='output-text'>The number drawn is <strong>" + prediction + "</strong> (<strong>" + getDigitName(prediction) + "</strong>)<div>");
                    logger.writeLog("Prediction: " + prediction + " ... Certainty: " + percentProb + "%", false);
                    eraseButton.enable();
                    havePredictLastDraw = true;
                    return [2];
            }
        });
    });
}
(function (welcomeMessage) {
    initializaCanvasEvents();
    resizeTheEntirePage();
    var _ctx = canvas.getCtxElement();
    var _canvas = canvas.getCanvasElement();
    eraseButton.setEvent('click', function () {
        canvas.clear();
        if (modelWasLoaded === true)
            outputLabel.defaultMessage();
        haltPrediction = true;
    });
    window.addEventListener('resize', function () {
        resizeTheEntirePage();
        if (modelWasLoaded === true)
            outputLabel.defaultMessage();
    });
    loadDigitRecognizerModel('./data/compiled/model.json');
    logger.writeLog("Logs " + (SHOW_DEBUG_LOGS ? 'enabled' : 'disabled') + ".", false, true);
    logger.writeLog(welcomeMessage, false, true);
})('Welcome to the Digit Recognition Web App!');
//# sourceMappingURL=main.js.map
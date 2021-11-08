var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
;
var lastCTXPos;
var modelWasLoaded;
var drawing;
var haltPrediction;
var havePredictLastDraw;
var firstPrediction;
var model;
lastCTXPos = { x: 0, y: 0 };
modelWasLoaded = false;
drawing = false;
haltPrediction = false;
havePredictLastDraw = false;
firstPrediction = true;
var SHOW_DEBUG_LOGS = false;
var SectionController = (function () {
    function SectionController(id, defaultMsg) {
        this.selector = id;
        this.element = document.getElementById(this.selector);
        this.defaultMessage = defaultMsg;
    }
    SectionController.prototype.print = function (message) {
        this.element.innerHTML = message;
    };
    SectionController.prototype.printDefaultMessage = function () {
        this.print(this.defaultMessage);
    };
    SectionController.setOpacity = function (id, value, title) {
        var element = document.getElementById(id);
        element.style.opacity = value.toString();
        element.title = title;
    };
    return SectionController;
}());
;
var ButtonController = (function (_super) {
    __extends(ButtonController, _super);
    function ButtonController(id, defaultMsg, disabledMsg) {
        var _this = _super.call(this, id, defaultMsg) || this;
        _this._btn_element = _this.element;
        _this._disabledMsg = disabledMsg;
        return _this;
    }
    ButtonController.prototype.enable = function () {
        this._btn_element.disabled = false;
        this.printDefaultMessage();
    };
    ButtonController.prototype.disable = function () {
        this._btn_element.disabled = true;
        this.print(this._disabledMsg);
    };
    ButtonController.prototype.setEvent = function (event, listener) {
        this._btn_element.addEventListener(event, listener);
    };
    return ButtonController;
}(SectionController));
var outSection = new SectionController('output', "<div id='output-text'>Draw any digit between <strong>0</strong> to <strong>9</strong><\div>");
var clearBtn = new ButtonController('clear-btn', 'Erase', 'Wait(<strong>...</strong>)');
function sleep(milisecs) {
    return new Promise(function (resolve) { return setTimeout(resolve, milisecs); });
}
function min() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length < 2)
        throw Error('At least 2 elements are required for calculating the minimum!');
    var minimun = args[0];
    for (var i = 1; i < args.length; ++i)
        minimun = minimun > args[i] ? args[i] : minimun;
    return minimun;
}
function max() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length < 2)
        throw Error('At least 2 elements are required for calculating the maximum!');
    var maximum = args[0];
    for (var i = 1; i < args.length; ++i)
        maximum = maximum < args[i] ? args[i] : maximum;
    return maximum;
}
function resizePage(canvas, pageAddSize) {
    if (canvas === void 0) { canvas = undefined; }
    if (pageAddSize === void 0) { pageAddSize = 300; }
    var output = document.getElementById('output');
    var pipe = document.getElementById('pipeline');
    var main = document.getElementsByTagName('html')[0];
    var innerH = window.innerHeight;
    main.style.height = max(innerH, pageAddSize + calculateNewCanvasSize()).toString() + "px";
    output.style.width = pipe.style.width = calculateNewCanvasSize().toString() + "px";
    resizeCanvas(canvas);
}
function calculateNewCanvasSize(maxSize, increaseSize) {
    if (maxSize === void 0) { maxSize = 400; }
    if (increaseSize === void 0) { increaseSize = 30; }
    var innerW = window.innerWidth;
    var outerW = window.outerWidth;
    var width = min(innerW, outerW) || innerW;
    return width > (maxSize + increaseSize) ? maxSize : (width - increaseSize);
}
function calculateNewCtxSize(maxCTXSize, maxCanvasSize) {
    if (maxCTXSize === void 0) { maxCTXSize = 22; }
    if (maxCanvasSize === void 0) { maxCanvasSize = 400; }
    return (calculateNewCanvasSize(maxCanvasSize) * maxCTXSize) / maxCanvasSize;
}
function resizeCanvas(canvas, maxCanvasSize, maxCTXSize) {
    if (canvas === void 0) { canvas = undefined; }
    if (maxCanvasSize === void 0) { maxCanvasSize = 400; }
    if (maxCTXSize === void 0) { maxCTXSize = 22; }
    var _canvas = canvas || document.getElementById('draw-canvas');
    var _ctx = _canvas.getContext('2d');
    _canvas.width = _canvas.height = calculateNewCanvasSize(maxCanvasSize);
    _ctx.lineWidth = calculateNewCtxSize(maxCTXSize, maxCanvasSize);
    _ctx.strokeStyle = 'white';
    _ctx.fillStyle = 'white';
    _ctx.lineJoin = 'round';
    _ctx.lineCap = 'round';
}
function checkHalt() {
    if (haltPrediction === true) {
        haltPrediction = false;
        return true;
    }
    return false;
}
function checkFirstPrediction() {
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
function writeLog(message, showTime, timeDiff) {
    if (showTime === void 0) { showTime = true; }
    if (timeDiff === void 0) { timeDiff = -1; }
    function addZero(time) {
        return time < 10 ? '0' + time.toString() : time.toString();
    }
    if (!SHOW_DEBUG_LOGS)
        return SHOW_DEBUG_LOGS;
    var date = new Date();
    var UTCHours = date.getUTCHours();
    var hour = addZero(UTCHours !== 0 || timeDiff >= 0 ? UTCHours + timeDiff : 24 + timeDiff);
    var minutes = addZero(date.getUTCMinutes());
    var seconds = addZero(date.getUTCSeconds());
    console.log(showTime ? hour + ":" + minutes + ":" + seconds + " - " + message : message);
    return SHOW_DEBUG_LOGS;
}
function getDigitName(number) {
    return { 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
        5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine'
    }[number];
}
function setCanvasEvents(canvas, sleepTimeOnMouseOut, sleepTimeOnMouseUp) {
    var _this = this;
    if (canvas === void 0) { canvas = undefined; }
    if (sleepTimeOnMouseOut === void 0) { sleepTimeOnMouseOut = 1500; }
    if (sleepTimeOnMouseUp === void 0) { sleepTimeOnMouseUp = 1350; }
    var _canvas = canvas || document.getElementById('draw-canvas');
    var ctx = _canvas.getContext('2d');
    _canvas.addEventListener('mousedown', function (e) {
        e.preventDefault();
        if (modelWasLoaded === false)
            return;
        drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        lastCTXPos = { x: e.offsetX, y: e.offsetY };
    });
    _canvas.addEventListener('mouseout', function (e) { return __awaiter(_this, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    wasDrawing = drawing;
                    drawing = false;
                    return [4, sleep(sleepTimeOnMouseOut)];
                case 1:
                    _a.sent();
                    if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
                        predictImage(_canvas);
                    return [2];
            }
        });
    }); });
    _canvas.addEventListener('mousemove', function (e) {
        e.preventDefault();
        if (drawing === false)
            return;
        ctx.beginPath();
        ctx.moveTo(lastCTXPos.x, lastCTXPos.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastCTXPos = { x: e.offsetX, y: e.offsetY };
    });
    _canvas.addEventListener('mouseup', function (e) { return __awaiter(_this, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    wasDrawing = drawing;
                    drawing = false;
                    return [4, sleep(sleepTimeOnMouseUp)];
                case 1:
                    _a.sent();
                    if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
                        predictImage(_canvas);
                    return [2];
            }
        });
    }); });
    _canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        if (modelWasLoaded === false)
            return;
        drawing = true;
        havePredictLastDraw = false;
        haltPrediction = false;
        var clientRect = _canvas.getBoundingClientRect();
        var touch = e.touches[0];
        lastCTXPos = {
            x: touch.pageX - clientRect.x,
            y: touch.pageY - clientRect.y
        };
    });
    _canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (drawing === false)
            return;
        var clientRect = _canvas.getBoundingClientRect();
        var touch = e.touches[0];
        var x = touch.pageX - clientRect.x;
        var y = touch.pageY - clientRect.y;
        ctx.beginPath();
        ctx.moveTo(lastCTXPos.x, lastCTXPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastCTXPos = { x: x, y: y };
    });
    _canvas.addEventListener('touchend', function (e) { return __awaiter(_this, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    wasDrawing = drawing;
                    drawing = false;
                    return [4, sleep(sleepTimeOnMouseUp)];
                case 1:
                    _a.sent();
                    if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
                        predictImage(_canvas);
                    return [2];
            }
        });
    }); });
}
function loadDigitRecognizerModel(path) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = document.getElementById('draw-canvas');
                    clearBtn.print('Wait(...)');
                    return [4, tf.loadLayersModel(path)];
                case 1:
                    model = _a.sent();
                    writeLog("The model was loaded successfully!");
                    canvas.style.cursor = 'crosshair';
                    modelWasLoaded = true;
                    clearBtn.enable();
                    outSection.printDefaultMessage();
                    return [2];
            }
        });
    });
}
function predictImage(canvas, inputSize, padding, waitTime) {
    if (canvas === void 0) { canvas = undefined; }
    if (inputSize === void 0) { inputSize = 36; }
    if (padding === void 0) { padding = 4; }
    if (waitTime === void 0) { waitTime = 150; }
    return __awaiter(this, void 0, void 0, function () {
        var inputShape, paddingShape, _canvas, InPut, error_1, output, prediction, probability;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputShape = [inputSize - 2 * padding, inputSize - 2 * padding];
                    paddingShape = [[padding, padding], [padding, padding]];
                    _canvas = canvas || document.getElementById('draw-canvas');
                    clearBtn.disable();
                    outSection.print("<div id='output-text'>Analyzing The Drawing(<strong>...</strong>)<\div>");
                    InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
                        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    if (modelWasLoaded === false || drawing === true)
                        throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
                    else if (InPut.sum().dataSync()[0] === 0) {
                        clearBtn.enable();
                        outSection.print("<div id='output-text'><strong>TIP</strong>: Click and Hold to draw.<\div>");
                        throw Error('Canvas has no drawing, prediction canceled!');
                    }
                    if (!(checkLastDrawPredicted() === false)) return [3, 3];
                    return [4, (checkFirstPrediction() ? sleep((Number((waitTime / 2).toFixed(0)))) : sleep(waitTime))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (checkHalt() === true) {
                        clearBtn.enable();
                        outSection.printDefaultMessage();
                        throw Error('Halt Received, prediction was canceled!');
                    }
                    return [3, 5];
                case 4:
                    error_1 = _a.sent();
                    writeLog(error_1);
                    return [2, false];
                case 5:
                    tf.engine().startScope();
                    output = model.predict(InPut).dataSync();
                    prediction = tf.argMax(output).dataSync();
                    probability = tf.max(output).dataSync()[0];
                    tf.engine().endScope();
                    outSection.print("<div id='output-text'>The number drawn is <strong>" + prediction + "</strong> (<strong>" + getDigitName(prediction) + "</strong>)<div>");
                    SectionController.setOpacity('output-text', probability, 'The opacity of the text represents the certainty of the prediction.');
                    writeLog("Prediction: " + prediction + " ... Certainty: " + (probability * 100).toFixed(2) + "%", false);
                    clearBtn.enable();
                    havePredictLastDraw = true;
                    return [2];
            }
        });
    });
}
(function (welcomeMessage) {
    var canvas = document.getElementById('draw-canvas');
    setCanvasEvents(canvas);
    resizePage(canvas);
    var ctx = canvas.getContext('2d');
    clearBtn.setEvent('click', function () {
        ctx.clearRect(0, 0, calculateNewCanvasSize(), calculateNewCanvasSize());
        if (modelWasLoaded === true)
            outSection.printDefaultMessage();
        SectionController.setOpacity('output-text', 1, '');
        haltPrediction = true;
    });
    window.addEventListener('resize', function () {
        resizePage(canvas);
        if (modelWasLoaded === true)
            outSection.printDefaultMessage();
        SectionController.setOpacity('output-text', 1, '');
    });
    loadDigitRecognizerModel('./data/compiled/model.json');
    console.log("Logs " + (SHOW_DEBUG_LOGS ? 'enabled' : 'disabled') + ".");
    writeLog(welcomeMessage);
})('Welcome to the Digit Recognition Web App!');
//# sourceMappingURL=main.js.map
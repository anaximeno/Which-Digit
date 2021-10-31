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
var SHOW_LOGS = true;
;
var modelWasLoaded = false;
var drawing = false;
var haltPrediction = false;
var havePredictLastDraw = false;
var lastPos = { x: 0, y: 0 };
var model;
var firstPrediction = true;
var OutputSectionController = (function () {
    function OutputSectionController(id, defaultMsg) {
        this.selector = id;
        this.element = document.getElementById(this.selector);
        this.defaultMessage = defaultMsg;
    }
    OutputSectionController.prototype.print = function (message) {
        this.element.innerHTML = message;
    };
    OutputSectionController.prototype.printDefaultMessage = function () {
        this.print(this.defaultMessage);
    };
    return OutputSectionController;
}());
;
var Out = new OutputSectionController('output', 'Draw any digit between <strong>0</strong> to <strong>9</strong>');
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
function resizeHTML(pageAddSize) {
    if (pageAddSize === void 0) { pageAddSize = 285; }
    var main = document.getElementsByTagName('html')[0];
    var innerH = window.innerHeight;
    main.style.height = max(innerH, pageAddSize + calculateNewCanvasSize()) + "px";
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
function enableButton(selector) {
    var button = document.getElementById(selector);
    button.disabled = false;
}
function disableButton(selector) {
    var button = document.getElementById(selector);
    button.disabled = true;
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
function writeLog(message, showTime) {
    if (showTime === void 0) { showTime = true; }
    if (!SHOW_LOGS)
        return false;
    var date = new Date();
    var standardrize = function (time) {
        return time < 10 ? '0' + time : time;
    };
    var hour = standardrize(date.getUTCHours() - 1);
    var minutes = standardrize(date.getUTCMinutes());
    var seconds = standardrize(date.getUTCSeconds());
    console.log(showTime ? hour + ":" + minutes + ":" + seconds + " - " + message : message);
    return true;
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
    if (sleepTimeOnMouseUp === void 0) { sleepTimeOnMouseUp = 1200; }
    var _canvas = canvas || document.getElementById('draw-canvas');
    var ctx = _canvas.getContext('2d');
    _canvas.addEventListener('mousedown', function (e) {
        if (modelWasLoaded === false)
            return;
        drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        lastPos = { x: e.offsetX, y: e.offsetY };
    });
    _canvas.addEventListener('mouseout', function () { return __awaiter(_this, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
        if (drawing === false)
            return;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastPos = { x: e.offsetX, y: e.offsetY };
    });
    _canvas.addEventListener('mouseup', function () { return __awaiter(_this, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
        var x = touch.pageX - clientRect.x;
        var y = touch.pageY - clientRect.y;
        lastPos = { x: x, y: y };
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
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPos = { x: x, y: y };
    });
    _canvas.addEventListener('touchend', function () { return __awaiter(_this, void 0, void 0, function () {
        var wasDrawing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
    if (path === void 0) { path = './data/compiled/model.json'; }
    return __awaiter(this, void 0, void 0, function () {
        var canvas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = document.getElementById('draw-canvas');
                    return [4, tf.loadLayersModel(path)];
                case 1:
                    model = _a.sent();
                    writeLog("The model was loaded successfully!");
                    canvas.style.cursor = 'crosshair';
                    modelWasLoaded = true;
                    enableButton('clear-btn');
                    Out.printDefaultMessage();
                    return [2];
            }
        });
    });
}
function predictImage(canvas, inputSize, padding, waitTime) {
    if (canvas === void 0) { canvas = undefined; }
    if (inputSize === void 0) { inputSize = 36; }
    if (padding === void 0) { padding = 3; }
    if (waitTime === void 0) { waitTime = 200; }
    return __awaiter(this, void 0, void 0, function () {
        var inputShape, paddingShape, _canvas, InPut, error_1, output, prediction, probability;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputShape = [inputSize - 2 * padding, inputSize - 2 * padding];
                    paddingShape = [[padding, padding], [padding, padding]];
                    _canvas = canvas || document.getElementById('draw-canvas');
                    InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
                        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    if (modelWasLoaded === false || drawing === true)
                        throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
                    else if (InPut.sum().dataSync()[0] === 0) {
                        Out.print('<strong>TIP</strong>: Click and Hold to draw.');
                        throw Error('Canvas has no drawing, prediction canceled!');
                    }
                    disableButton('clear-btn');
                    if (!(havePredictLastDraw === false)) return [3, 5];
                    Out.print('Analyzing The Drawing(<strong>...</strong>)');
                    if (!(firstPrediction === false)) return [3, 3];
                    return [4, sleep(waitTime)];
                case 2:
                    _a.sent();
                    return [3, 4];
                case 3:
                    firstPrediction = false;
                    _a.label = 4;
                case 4: return [3, 6];
                case 5:
                    havePredictLastDraw = false;
                    _a.label = 6;
                case 6:
                    if (checkHalt() === true) {
                        enableButton('clear-btn');
                        Out.printDefaultMessage();
                        throw Error('Halt Received, prediction was canceled!');
                    }
                    return [3, 8];
                case 7:
                    error_1 = _a.sent();
                    writeLog(error_1);
                    return [2, false];
                case 8:
                    tf.engine().startScope();
                    output = model.predict(InPut).dataSync();
                    prediction = tf.argMax(output).dataSync();
                    probability = tf.max(output).dataSync()[0];
                    Out.print("The number drawn is <strong>" + prediction + "</strong> (<strong>" + getDigitName(prediction) + "</strong>)");
                    tf.engine().endScope();
                    writeLog("Prediction: " + prediction + " ... Certainty: " + (parseFloat(probability.toPrecision(4)) * 100) + "%", false);
                    enableButton('clear-btn');
                    havePredictLastDraw = true;
                    return [2];
            }
        });
    });
}
(function (welcomeMessage) {
    resizeHTML();
    var canvas = document.getElementById('draw-canvas');
    var ctx = canvas.getContext('2d');
    setCanvasEvents(canvas);
    resizeCanvas(canvas);
    var clearBtn = document.getElementById('clear-btn');
    var output = document.getElementById('output');
    var pipe = document.getElementById('pipeline');
    var width = calculateNewCanvasSize() + "px";
    output.style.width = width;
    pipe.style.width = width;
    clearBtn.addEventListener('click', function () {
        ctx.clearRect(0, 0, calculateNewCanvasSize(), calculateNewCanvasSize());
        if (modelWasLoaded === true)
            Out.printDefaultMessage();
        haltPrediction = true;
    });
    window.addEventListener('resize', function () {
        width = calculateNewCanvasSize() + "px";
        output.style.width = width;
        pipe.style.width = width;
        resizeCanvas(canvas);
        resizeHTML();
        if (modelWasLoaded === true)
            Out.printDefaultMessage();
    });
    loadDigitRecognizerModel();
    console.log("Logs " + (SHOW_LOGS ? 'enabled' : 'disabled') + ".");
    writeLog(welcomeMessage);
})('Welcome to the Digit Recognition Web App!');
//# sourceMappingURL=main.js.map
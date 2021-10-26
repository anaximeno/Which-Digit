const SHOW_LOGS = true;
let modelWasLoaded = false;
let drawing = false;
let haltPrediction = false;
let havePredictLastDraw = false;
let lastPos = {x: 0, y: 0};
let model;


const OutSection = new class {
    constructor(id, defaultMsg) {
        this._element = document.getElementById(id);
        this._defaultMsg = defaultMsg;
    }
    print(message) {
        this._element.innerHTML = message;
    }
    printDefaultMessage() {
        this.print(this._defaultMsg)
    }
}('output', 'Draw any digit between <strong>0</strong> to <strong>9</strong>');


function sleep(milisecs) {
    // Stops the execution by 'milisecs' miliseconds.
    return new Promise(resolve => setTimeout(resolve, milisecs));
}


function min(...args)
{
    if (args.length < 2)
        throw Error('At least 2 elements are required for calculating the minimum!');
    let minimun = args[0];
    for (let i = 1 ; i < args.length ; ++i)
        minimun = minimun > args[i] ? args[i] : minimun;
    return minimun;
}


function max(...args)
{
    if (args.length < 2)
        throw Error('At least 2 elements are required for calculating the maximum!');
    let maximum = args[0];
    for (let i = 1 ; i < args.length ; ++i)
        maximum = maximum < args[i] ? args[i] : maximum;
    return maximum;
}


function resizeHTML(pageAddSize=285) {
    const main = document.getElementsByTagName('html')[0];
    const innerH = window.innerHeight;
    main.style.height = `${max(innerH, pageAddSize + calculateNewCanvasSize())}px`;
}


function calculateNewCanvasSize(maxSize=400, increaseSize=30) {
    const innerW = window.innerWidth;
    const outerW = window.outerWidth;
    const width = min(innerW, outerW) || innerW;
    return width > (maxSize + increaseSize) ? maxSize : (width - increaseSize);
}


function calculateNewCtxSize(maxCTXSize=22, maxCanvasSize=400) {
    return (calculateNewCanvasSize(maxCanvasSize, 30) * maxCTXSize) / maxCanvasSize;
}


function enableButton(selector) {
    document.getElementById(selector).disabled = false;
}


function disableButton(selector) {
    document.getElementById(selector).disabled = true;
}


function resizeCanvas(maxCanvasSize=400, maxCTXSize=22, canvas=undefined, ctx=undefined) {
    const _canvas = canvas || document.getElementById('draw-canvas');
    const _ctx = ctx || _canvas.getContext('2d');
    _canvas.width = _canvas.height = calculateNewCanvasSize(maxCanvasSize, 30);
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


function writeLog(message, showTime=true) {
    if (SHOW_LOGS === false)
        return false;
    const date = new Date();
    const time = `${(date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds())} - `;
    console.log(showTime ? time + message : message);
    return true;
}


function getDigitName(number) {
    return {0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
        5: 'Five', 6: 'Six',7: 'Seven', 8: 'Eight', 9: 'Nine'
    }[number];
}


function setCanvasEvents(canvas=undefined, sleepTimeOnMouseOut=1500, sleepTimeOnMouseUp=1200) {
    const _canvas = canvas || document.getElementById('draw-canvas');
    const ctx = _canvas.getContext('2d');

    _canvas.addEventListener('mousedown', (e) => {
        if (modelWasLoaded === false)
            return ;
        drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        lastPos = { x: e.offsetX, y: e.offsetY };
    });

    _canvas.addEventListener('mouseout', async () => {
        const wasDrawing = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseOut);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage();
    });

    _canvas.addEventListener('mousemove', (e) => {
        if (drawing === false)
            return ;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastPos = { x: e.offsetX, y: e.offsetY };
    });

    _canvas.addEventListener('mouseup', async () => {
        const wasDrawing = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage();
    });

    _canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (modelWasLoaded === false)
            return ;
        drawing = true;
        havePredictLastDraw = false;
        haltPrediction = false;
        const clientRect = _canvas.getBoundingClientRect();
        const touch = e.touches[0];
        let x = touch.pageX - clientRect.x;
        let y = touch.pageY - clientRect.y;
        lastPos = { x, y };
    });

    _canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (drawing === false)
            return ;
        const clientRect = _canvas.getBoundingClientRect();
        const touch = e.touches[0];
        let x = touch.pageX - clientRect.x;
        let y = touch.pageY - clientRect.y;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPos = { x, y };
    });

    _canvas.addEventListener('touchend', async () => {
        const wasDrawing = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage();
    });
}


async function loadDigitRecognizerModel(path='./data/compiled/model.json') {
    const canvas = document.getElementById('draw-canvas');
    model = await tf.loadLayersModel(path);
    writeLog("Info: The model was loaded successfully!");
    canvas.style.cursor = 'crosshair';
    modelWasLoaded = true;
    enableButton('clear-btn');
    OutSection.printDefaultMessage();
}


async function predictImage(inputSize=36, padding=1, waitTime=200, canvas=undefined)
{
    const inputShape = [inputSize - 2*padding, inputSize - 2*padding];
    const paddingShape = [[padding, padding], [padding, padding]]
    const _canvas = canvas || document.getElementById('draw-canvas');
    // Get the canvas image from pixels and apply some transformations to make it a good input to the model.
    // To resize the image, it can be used either `resizeBilinear` or `resizeNearestNeighbor` transforms.
    const InPut = tf.browser.fromPixels(_canvas).resizeBilinear(inputShape)
        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);

    try {
        if (modelWasLoaded === false || drawing === true)
            throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
        else if (InPut.sum().dataSync()[0] === 0) {
            // The condition above checks if the sum of all pixels on the canvas is equal to zero,
            // if true that means that nothing is drawn on the canvas.
            OutSection.print('<strong>TIP</strong>: Click and Hold to draw');
            throw Error('Canvas has no drawing, prediction canceled!');
        }

        disableButton('clear-btn');
        
        if (havePredictLastDraw === false) {
            OutSection.print('Analyzing The Drawing(<strong>...</strong>)');
            await sleep(waitTime);
        } else
            havePredictLastDraw = false;
        
        if (haltPrediction === true) {
            haltPrediction = false;
            enableButton('clear-btn');
            OutSection.printDefaultMessage();
            throw Error('Halt Received, prediction was canceled!');
        }
    } catch (error) {
        writeLog(error);
        return false;
    }

    tf.engine().startScope(); //Prevents high usage of gpu
    const softmax = model.predict(InPut).dataSync();
    const prediction = tf.argMax(softmax).dataSync();
    const probability = tf.max(softmax).dataSync()[0];
    OutSection.print(
        `The number drawn is <strong>${prediction}</strong> (<strong>${getDigitName(prediction)}</strong>)`
    );
    tf.engine().endScope(); //Prevents high usage of gpu

    writeLog(`Prediction: ${prediction} ... Certainty: ${(probability.toPrecision(4) * 100)}%`);
    enableButton('clear-btn');
    havePredictLastDraw = true;
}


/**
 * @info Running the Web Application
 */
(function () { resizeHTML(); resizeCanvas(); setCanvasEvents();
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clear-btn');
    const output = document.getElementById('output');
    const pipe = document.getElementById('pipeline');
    let width = `${calculateNewCanvasSize()}px`;
    output.style.width = width;
    pipe.style.width = width;

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, calculateNewCanvasSize(), calculateNewCanvasSize());
        if (modelWasLoaded === true)
            OutSection.printDefaultMessage();
        haltPrediction = true;
    });

    window.addEventListener('resize', () => {
        width = `${calculateNewCanvasSize()}px`;
        output.style.width = width;
        pipe.style.width = width;
        resizeCanvas(); resizeHTML();
        if (modelWasLoaded === true)
            OutSection.printDefaultMessage();
    });
    loadDigitRecognizerModel();
    writeLog('Welcome to the Digit Recognition Web App!');
})();

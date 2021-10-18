/** Global Constants */
const LOGS = false;
const PATH_TO_THE_MODEL = './data/compiled/model.json';
const IMAGE_SIZE = 34;
const IMAGE_PADDING_VALUE = 1;
const INPUT_SIZE = 36;

if (INPUT_SIZE !== IMAGE_SIZE + IMAGE_PADDING_VALUE*2) 
    throw Error('Shapes Mismatch!');

const PADDING = [[IMAGE_PADDING_VALUE, IMAGE_PADDING_VALUE], [IMAGE_PADDING_VALUE, IMAGE_PADDING_VALUE]];
const IMAGE_RESIZE_SHAPE = [IMAGE_SIZE, IMAGE_SIZE];
const INITIAL_MESSAGE = 'Draw any digit between <strong>0</strong> to <strong>9</strong>';
const MAX_CANVAS_SIZE = 400;
const MAX_CTX_SIZE = 22;
const CANVAS_RESIZE_SUBTRACT_VALUE = 30;
const CTX_SCALE_DIVISOR_VALUE = MAX_CANVAS_SIZE / MAX_CTX_SIZE;
const TIME_TO_WAIT_BEFORE_PREDICT_ON_STOP_DRAWING = 1300;
const TIME_TO_WAIT_BEFORE_PREDICT_ON_MOUSE_OUT = 1500;
const TIME_TO_WAIT_BEFORE_PREDICT_THE_IMAGE = 200;
const PAGE_RESIZE_ADD_VALUE = 285;
const GetNumberVoc = {
    0: 'Zero',
    1: 'One',
    2: 'Two',
    3: 'Three',
    4: 'Four',
    5: 'Five',
    6: 'Six',
    7: 'Seven',
    8: 'Eight',
    9: 'Nine'
}

/** Global Variables */
let model;
let isModelLoaded = false;
let lastPosition = { x: 0, y: 0 };
let drawing = false;
let stopPrediction = false;
let haveAlreadyPredicted = false;
let canvas;
let ctx;


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


function printOutput(msg = INITIAL_MESSAGE)
{
    const out = document.getElementById('predict-output');
    out.innerHTML = msg;
}


function resizePage()
{
    const main = document.getElementsByTagName('html')[0];
    main.style.height = `${max(window.innerHeight, PAGE_RESIZE_ADD_VALUE + getCanvasSize())}px`;
}


function getCanvasSize()
{
    // Prevents some errors when resizing the canvas
    const window_width = window.outerWidth > 0  ?
        min(window.innerWidth, window.outerWidth) : window.innerWidth;

    const width = window_width > (MAX_CANVAS_SIZE + CANVAS_RESIZE_SUBTRACT_VALUE) ?
        MAX_CANVAS_SIZE : (window_width - CANVAS_RESIZE_SUBTRACT_VALUE);

    return width;
}


function getCtxSize()
{
    return getCanvasSize() / CTX_SCALE_DIVISOR_VALUE;
}


function sleep(milisecs)
{
    // Stops the execution by 'milisecs' miliseconds.
    return new Promise(resolve => setTimeout(resolve, milisecs));
}


function resizeCanvas()
{
    // Get the canvas element
    const canvas = document.getElementById('draw-canvas');
    // Set the width and the height to the better possible size
    let size = getCanvasSize();
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = getCtxSize();
}


function prepareCanvas()
{
    // Get the canvas element
    const canvas = document.getElementById('draw-canvas');
    // Resize the canvas element
    resizeCanvas();

    /** Mouse events for desktop computers. */
    canvas.addEventListener('mousedown', (e) => {
        if (!isModelLoaded)
            return ;

        drawing = true;
        stopPrediction = false;
        haveAlreadyPredicted = false;
        lastPosition = { x: e.offsetX, y: e.offsetY };
    });

    canvas.addEventListener('mouseout', async () => {
        let wasDrawing = drawing;
        drawing = false;
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_ON_MOUSE_OUT);
        if (stopPrediction)
            stopPrediction = false;
        else if (isModelLoaded && wasDrawing && !drawing)
            predict();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing)
            return ;
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastPosition = { x: e.offsetX, y: e.offsetY };
    });

    canvas.addEventListener('mouseup', async () => {
        let wasDrawing = drawing;
        drawing = false;
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_ON_STOP_DRAWING);
        if (stopPrediction)
            stopPrediction = false;
        else if (isModelLoaded && wasDrawing && !drawing)
            predict();
    });


    /** Touch events for touch devices. */
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();

        if (!isModelLoaded)
            return ;

        drawing = true;
        haveAlreadyPredicted = false;
        stopPrediction = false;

        let clientRect = canvas.getBoundingClientRect();
        let touch = e.touches[0];
        let x = touch.pageX - clientRect.x;
        let y = touch.pageY - clientRect.y;
        lastPosition = { x, y };
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();

        if (!drawing)
            return ;

        let clientRect = canvas.getBoundingClientRect();
        let touch = e.touches[0];
        let x = touch.pageX - clientRect.x;
        let y = touch.pageY - clientRect.y;
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPosition = { x, y };
    });

    canvas.addEventListener('touchend', async () => {
        let wasDrawing = drawing;
        drawing = false;
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_ON_STOP_DRAWING);
        if (stopPrediction)
            stopPrediction = false;
        else if (isModelLoaded && wasDrawing && !drawing)
            predict();
    });
}


function createButton(innerText, selector, id, listener, disabled = false)
{
    const btn = document.createElement('BUTTON');
    btn.innerText = innerText;
    btn.id = id;
    btn.disabled = disabled;
    btn.addEventListener('click', listener);
    document.querySelector(selector).appendChild(btn);
}


function enableButton(selector)
{
    // Activates a button
    document.getElementById(selector).disabled = false;
}


function disableButton(selector)
{
    // Disables a button
    document.getElementById(selector).disabled = true;
}


async function loadModel()
{
    const canvas = document.getElementById('draw-canvas');

    // Load the model saved at `PATH_TO_THE_MODEL`
    model = await tf.loadLayersModel(PATH_TO_THE_MODEL);

    if (LOGS)
        console.log("Info: The model was loaded successfully!");

    canvas.title = '';
    canvas.style.cursor = 'crosshair';

    isModelLoaded = true;
    enableButton('clear-btn');
    printOutput();
}


async function predict()
{
    const canvas = document.getElementById('draw-canvas');

    // Get the canvas image from pixels and apply some transformations necessary for being
    // a good input on the model.
    // Below can be used either `resizeBilinear` or `resizeNearestNeighbor` for resizing the image.
    const InPut = tf.browser.fromPixels(canvas).resizeBilinear(IMAGE_RESIZE_SHAPE)
        .mean(2).pad(PADDING).expandDims().expandDims(3).toFloat().div(255.0);


    if (!isModelLoaded || drawing)
        return ;
    else if (InPut.sum().dataSync()[0] === 0) {
        // The condition above checks if the sum of all pixels on the canvas is equal to zero,
        // if true that means that nothing is drawn on the canvas.
        printOutput('<strong>TIP</strong>: Click and Hold to draw');
        return ;
    }
    else
        disableButton('clear-btn');


    // HaveAlreadyPredicted prevents the same prediction to be predicted again
    if (haveAlreadyPredicted === false) {
        printOutput('Analyzing The Drawing(<strong>...</strong>)');
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_THE_IMAGE);
    } else
        haveAlreadyPredicted = false;


    if (stopPrediction) {
        stopPrediction = false;
        enableButton('clear-btn');
        printOutput();
        return ;
    }

    // Prevents high usage of gpu
    tf.engine().startScope();

    // ForwardPropagates the input and return the output with ten probabilities,
    // corresponding on the probability of being each of the ten digits.
    const predictions = model.predict(InPut).dataSync();

    // The predicted number will be the index which has the greater probability
    const predictedNumber = tf.argMax(predictions).dataSync();

    // The greater probability represents how certain the model is on its prediction
    const greaterProbability = tf.max(predictions).dataSync()[0];

    printOutput(`The number drawn is <strong>${predictedNumber}</strong> (<strong>${GetNumberVoc[predictedNumber]}</strong>)`);

    // Prevents high usage of gpu
    tf.engine().endScope();

    if (LOGS)
    {
        const d = new Date();

        console.log(`At (${d.getUTCHours() - 1}:${d.getUTCMinutes()}:${d.getUTCSeconds()})\n` +
        `* Prediction: ${predictedNumber}\n` + `* Certainty: ${(greaterProbability.toPrecision(4) * 100)}%`);
    }

    enableButton('clear-btn');
    haveAlreadyPredicted = true;
}


/**
 * @info Function which initialize the program
 */
(function () {
    prepareCanvas();
    resizePage();

    const clearBtn = document.getElementById('clear-btn');
    const output = document.getElementById('predict-output');
    const pipe = document.getElementById('pipeline');

    let width = `${getCanvasSize()}px`;
    output.style.width = width;
    pipe.style.width = width;

    clearBtn.addEventListener('click', () => {
        const SIZE = getCanvasSize();
        ctx.clearRect(0, 0, SIZE, SIZE);

        if (isModelLoaded)
            printOutput();

        stopPrediction = true;
    });

    window.addEventListener('resize', () => {
        width = `${getCanvasSize()}px`;
        output.style.width = width;
        pipe.style.width = width;

        resizeCanvas();
        resizePage();

        if (isModelLoaded)
            printOutput();
    });

    if (LOGS)
        console.log('Welcome to the Digit Recognition Web App!');

    // Load the model at last
    loadModel();
})();

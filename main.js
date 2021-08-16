let model;
let isModelLoaded = false;
const IMAGE_SIZE = 28;
const MODEL_PATH = './tfjs/DigitRec/model.json';
const INITIAL_MESSAGE = 'Draw any digit between <strong>0</strong> to <strong>9</strong>';

let lastPosition = {x: 0, y: 0};
let drawing = false;
let stopPrediction = false;
let haveAlreadyPredicted = false;
let ctx;

const MAX_CANVAS_SIZE = 400;
const MAX_CTX_SIZE = 22;
const CANVAS_RESIZE_SUBTRACT_VALUE = 30;
const CTX_SCALE_DIVISOR_VALUE = MAX_CANVAS_SIZE / MAX_CTX_SIZE;
const TIME_TO_WAIT_BEFORE_PREDICT_ON_STOP_DRAWING = 1300;
const TIME_TO_WAIT_BEFORE_PREDICT_ON_MOUSE_OUT = 1500;
const TIME_TO_WAIT_BEFORE_PREDICT_THE_IMAGE = 350;



function min(a, b, ...args)
{
    let minValue;
    if (args.length > 0) {
        args.push(a, b);
        args.sort();
        minValue = args[0];
    } else {
        minValue = a < b ? a : b;
    }
    return minValue;
}

function getCanvasSize()
{
    const WINDOW_SIZE = min(window.innerWidth, window.outerWidth);
    let size = WINDOW_SIZE > (MAX_CANVAS_SIZE + CANVAS_RESIZE_SUBTRACT_VALUE) ?
        MAX_CANVAS_SIZE : (WINDOW_SIZE - CANVAS_RESIZE_SUBTRACT_VALUE);
    return size;
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
    canvas.width = canvas.height = getCanvasSize();
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
        drawing = true;
        stopPrediction = false;
        haveAlreadyPredicted = false;
        lastPosition = { x: e.offsetX, y: e.offsetY };
    });

    canvas.addEventListener('mouseout', async () => {
        let wasDrawing = drawing;
        drawing = false;
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_ON_MOUSE_OUT);
        if (wasDrawing && !drawing && isModelLoaded)
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
        drawing = false;
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_ON_STOP_DRAWING);
        if (!drawing && isModelLoaded)
            predict();
    });


    /** Touch events for touch devices. */
    canvas.addEventListener('touchstart', (e) => {
        drawing = true;
        haveAlreadyPredicted = false;
        stopPrediction = false;

        e.preventDefault();

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
        drawing = false;
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_ON_STOP_DRAWING);
        if (!drawing && isModelLoaded)
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
    // Load the saved on MODEL_PATH and await the process to be complete
    model = await tf.loadLayersModel(MODEL_PATH);
    isModelLoaded = true;

    // Uncomment the line below if you want to see output on your browser console.
    // console.log("The model was loaded successfully!");

    const p = document.getElementById("predict-output");
    p.innerHTML = INITIAL_MESSAGE;
}


async function predict()
{
    const numberTranscription = {
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
    const p = document.getElementById('predict-output');

    if (isModelLoaded === false || drawing === true)
        return ;
    else
        disableButton('clear-btn');

    // HaveAlreadyPredicted prevents showing the same prediction to be predicted again
    if (haveAlreadyPredicted === false)
    {
        p.innerText = 'Wait...';
        await sleep(TIME_TO_WAIT_BEFORE_PREDICT_THE_IMAGE);
    } else 
        haveAlreadyPredicted = false;


    if (stopPrediction === true)
    {
        stopPrediction = false;
        enableButton('clear-btn');
        p.innerHTML = INITIAL_MESSAGE;
    } else {
        // Prevents the etreme usage of gpu
        tf.engine().startScope();

        const canvas = document.getElementById('draw-canvas');
    
        // Aplicate the preprocessing transformations to be a valid input to the model
        const toPredict = tf.browser.fromPixels(canvas)
            .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE])
            .mean(2).expandDims().expandDims(3).toFloat().div(255.0);
    
        // Predict the data and return an array with the probability of all possible outputs
        const prediction = model.predict(toPredict).dataSync();
    
        // Set the prediction to the output with the max probability (greater value) and shows it to the user
        const predictedValue = tf.argMax(prediction).dataSync();
        p.innerHTML = `The number drawn is <strong>${predictedValue}</strong>` +
            ` (<strong>${numberTranscription[predictedValue]}</strong>)`;
    
        // Prevents the etreme usage of gpu
        tf.engine().endScope();

        enableButton('clear-btn');
        haveAlreadyPredicted = true;
    }
}


/** Automatic call to function init */
(function init() {
    // Prepares the canvas to be used
    prepareCanvas();

    const p = document.getElementById('predict-output');
    const pipe = document.getElementById('pipeline');
    p.style.width = pipe.style.width = `${getCanvasSize()}px`;

    // Create the clear button along with its event
    createButton('Clear', '#pipeline', 'clear-btn', () => {
        stopPrediction = true;
        let size = getCanvasSize();
        ctx.clearRect(0, 0, size, size);
        if (isModelLoaded)
            p.innerHTML = INITIAL_MESSAGE;
    });

    window.addEventListener('resize', () => {
        p.style.width = pipe.style.width = `${getCanvasSize()}px`;

        resizeCanvas();

        if (isModelLoaded)
            p.innerHTML = INITIAL_MESSAGE;
    });

    // Load the model at last
    loadModel();
})();

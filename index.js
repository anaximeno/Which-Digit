let model;
let isModelLoaded = false;
const IMAGE_SIZE = 28;

let lastPosition = {x: 0, y: 0};
let drawing = false;

const canvasSize = 500;
let ctx;
let ctxSize = 28;
let resizeSub = 25;

function sleep (milisecs)
{
    return new Promise(resolve => setTimeout(resolve, milisecs));
}

function prepareCanvas()
{
    const canvas = document.getElementById('draw-canvas');
    canvas.width = window.innerWidth > canvasSize + resizeSub ? canvasSize : window.innerWidth - resizeSub;
    canvas.height = window.innerWidth > canvasSize + resizeSub ? canvasSize : window.innerWidth  - resizeSub;

    ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = ctxSize;

    /* For the Laptop / Desktop Computer */
    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        lastPosition = { x: e.offsetX, y: e.offsetY };
    });
    canvas.addEventListener('mouseout', async () => {
    let wasDrawing = drawing;
	drawing = false;

   	await sleep(1100);
	if (wasDrawing && !drawing) predict();
    });
    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return ;

        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastPosition = { x: e.offsetX, y: e.offsetY };
    });
    canvas.addEventListener('mouseup', async () => {
        drawing = false;

        await sleep(700);
        if (!drawing) predict();
    });

    /* For touch screen */
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
    	
        let clientRect = canvas.getBoundingClientRect();
        let touch = e.touches[0];

        drawing = true;

        let x = touch.pageX - clientRect.x;
        let y = touch.pageY - clientRect.y;

        lastPosition = { x, y };
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (!drawing) return ;

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

        await sleep(550);
        if (!drawing) predict();
    });
}


function createButton(innerText, selector, id, listener, disabled = false) {
    const btn = document.createElement('BUTTON');
    btn.innerText = innerText;
    btn.id = id;
    btn.disabled = disabled;
    btn.addEventListener('click', listener);
    document.querySelector(selector).appendChild(btn);
}


function enableButton(selector)
{
    document.getElementById(selector).disabled = false;
}


function disableButton(selector)
{
    document.getElementById(selector).disabled = true;
}


async function loadModel(path)
{
    model = await tf.loadLayersModel(path);
    isModelLoaded = true;

    const p = document.getElementById("predict-output");

    // Uncomment the line below if you want to see output on your browser console.
    // console.log("The model was loaded successfully!");

    p.innerHTML = 'Try to draw any digit between <strong>0</strong> to <strong>9</strong>.';
}


async function predict()
{
    const p = document.getElementById('predict-output');
    const canvas = document.getElementById('draw-canvas');

    p.innerText = 'Predicting...';
    
    tf.engine().startScope();
    const toPredict = tf.browser.fromPixels(canvas)
        .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE])
        .mean(2)
        .expandDims()
        .expandDims(3)
        .toFloat()
        .div(255.0);
    
    const prediction = model.predict(toPredict).dataSync();
    
    await sleep(350); // Intentional sleep!

    p.innerHTML = `The Predicted value is: <strong>${tf.argMax(prediction).dataSync()}</strong>`;
    tf.engine().endScope();
}


(function init(){
    const p = document.getElementById('predict-output');

    if (window.innerWidth < 280)
        ctxSize = 15;

    prepareCanvas();

    createButton('Clear', '#pipeline', 'clear-btn', () => {
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        if (isModelLoaded)
            p.innerHTML = 'Try to draw any digit between <strong>0</strong> to <strong>9</strong>.';
    });

    const pipe = document.getElementById('pipeline');

    p.style.width = `${window.innerWidth > canvasSize + resizeSub ?
        canvasSize : window.innerWidth - resizeSub}px`;
    pipe.style.width = `${window.innerWidth > canvasSize + resizeSub ?
        canvasSize : window.innerWidth - resizeSub}px`;


    window.addEventListener('resize', () => {
        ctxSize = window.innerWidth > 280 ? 25 : 15;

        prepareCanvas();
	if (isModelLoaded)
        p.innerHTML = 'Try to draw any digit between <strong>0</strong> to <strong>9</strong>.';

	    p.style.width = `${window.innerWidth > canvasSize + resizeSub ?
             canvasSize : window.innerWidth - resizeSub}px`;
        pipe.style.width = `${window.innerWidth > canvasSize + resizeSub ?
             canvasSize : window.innerWidth - resizeSub}px`;
    });

    loadModel('./tfjs/DigitRec/model.json');
})();

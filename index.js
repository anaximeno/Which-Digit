/* I make this project when I was studying in the book:

    `Practical TensorFlow.js Deep Learning in Web App Development by Juan De Dios Santos Rivera`

I recommend!
*/

let model;
let isModelLoaded = false;
const IMAGE_SIZE = 28;

let lastPosition = {x: 0, y: 0};
let drawing = false;
const canvasSize = 400;
let ctx;


function prepareCanvas()
{
    const canvas = document.getElementById('draw-canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 25;

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        if (isModelLoaded) enableButton("predict-btn");

        lastPosition = { x: e.offsetX, y: e.offsetY };
    });
    
    canvas.addEventListener('mouseout', () => {
        drawing = false;
    })
    
    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return ;
    
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastPosition = { x: e.offsetX, y: e.offsetY };
    });
    
    
    canvas.addEventListener('mouseup', () => {
        drawing = false;
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


(function init(){
    prepareCanvas();

    createButton('Predict', '#pipeline', 'predict-btn', () => {
        const p = document.getElementById("predict-output");
	
	if (!isModelLoaded)
	{
		p.innerHTML = "The model was not loaded already!";
		return ;
	}
        const canvas = document.getElementById('draw-canvas');

        const toPredict = tf.browser.fromPixels(canvas)
            .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE])
            .mean(2)
            .expandDims()
            .expandDims(3)
            .toFloat()
            .div(255.0);
    
        const prediction = model.predict(toPredict).dataSync();

        p.innerHTML = `The Predicted value is: <strong>${tf.argMax(prediction).dataSync()}</strong>`;
    }, true);

    createButton('Clear', '#pipeline', 'clear-btn', () => {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        disableButton("predict-btn");

        const p = document.getElementById("predict-output");
        if (isModelLoaded)
            p.innerHTML = 'Try to draw any digit between <strong>0</strong> to <strong>9</strong>.';
    });

    loadModel('./tfjs/DigitRec/model.json');  // TODO: create a better model!
    // NOTE: when training the new model aply data augmentation by change the position of the numbers on the image.
})();

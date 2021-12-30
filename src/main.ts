import {OutputLabel, Button, sleep, max} from './common';
import {Canvas} from './canvas';


let modelWasLoaded: boolean = false;
let haltPrediction: boolean = false;
let havePredictLastDraw: boolean = true;
let firstPrediction: boolean = true;
let model: any;
const outputLabelDefaultMsg = "<div id='output-text'>Draw any digit between <strong>"
                          + "0</strong> to <strong>9</strong><\div>";
const outputLabel = new OutputLabel('output', outputLabelDefaultMsg);
const eraseButton = new Button('erase-btn', 'Erase', 'Wait');
const SHOW_DEBUG_LOGS = false;

const canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);

const initializaCanvasEvents = (
    sleepTimeOnMouseOut: number = 1500,
    sleepTimeOnMouseUp: number = 1350
) => {
    const _canvas = canvas.getCanvasElement();
    const _ctx = canvas.getCtxElement();
    
    canvas.setEvent('mousedown', (e: MouseEvent) => {
        e.preventDefault()
        if (modelWasLoaded === false)
            return ;
        canvas.drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
    });
    
    canvas.setEvent('mouseout', async (e: MouseEvent) => {
        e.preventDefault()
        const wasDrawing = canvas.drawing;
        canvas.drawing = false;
        await sleep(sleepTimeOnMouseOut);
        if (modelWasLoaded && wasDrawing && !canvas.drawing && !checkHalt())
            predictImage();
    });
    
    canvas.setEvent('mousemove', (e: MouseEvent) => {
        e.preventDefault()
        if (canvas.drawing === false)
            return ;
        let {x, y} = canvas.getLastCtxPosition();
        _ctx.beginPath();
        _ctx.moveTo(x, y);
        _ctx.lineTo(e.offsetX, e.offsetY);
        _ctx.stroke();
        canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
    });
    
    canvas.setEvent('mouseup', async (e: MouseEvent) => {
        e.preventDefault()
        const wasDrawing = canvas.drawing;
        canvas.drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !canvas.drawing && !checkHalt())
            predictImage();
    });
    
    canvas.setEvent('touchstart', (e: TouchEvent) => {
        e.preventDefault();
        if (modelWasLoaded === false)
            return ;
        canvas.drawing = true;
        havePredictLastDraw = false;
        haltPrediction = false;
        const clientRect = _canvas.getBoundingClientRect();
        const touch = e.touches[0];
        canvas.setLastCtxPosition({
            x: touch.pageX - clientRect.x,
            y: touch.pageY - clientRect.y
        });
    });
    
    canvas.setEvent('touchmove', (e: TouchEvent) => {
        e.preventDefault();
        if (canvas.drawing === false)
            return ;
        const clientRect = _canvas.getBoundingClientRect();
        const touch = e.touches[0];
        let {x, y} = canvas.getLastCtxPosition();
        _ctx.beginPath();
        _ctx.moveTo(x, y);
        x = touch.pageX - clientRect.x;
        y = touch.pageY - clientRect.y;
        _ctx.lineTo(x, y);
        _ctx.stroke();
        canvas.setLastCtxPosition({ x, y });
    });
    
    canvas.setEvent('touchend', async (e: TouchEvent) => {
        e.preventDefault()
        const wasDrawing = canvas.drawing;
        canvas.drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !canvas.drawing && !checkHalt())
            predictImage();
    });
}

function resizeTheEntirePage(pageMarginIncrease: number = 300) {
    const innerH = window.innerHeight;
    const output = document.getElementById('output');
    const pipe = document.getElementById('pipeline');
    const main = document.getElementsByTagName('html')[0];

    const canvasSize = canvas.canvasBetterSize();

    main.style.height = max(
        innerH, pageMarginIncrease + canvasSize
    ).toString() + "px";

    output.style.width = canvasSize.toString() + "px"
    pipe.style.width = output.style.width;

    canvas.resize();
}


function checkHalt(): boolean {
    if (haltPrediction === true) {
        haltPrediction = false;
        return true;
    }
    return false;
}


function isFirstPrediction(): boolean {
    if (firstPrediction === true) {
        firstPrediction = false;
        return true;
    }
    return false;
}


function checkLastDrawPredicted(): boolean {
    if (havePredictLastDraw === true) {
        havePredictLastDraw = false;
        return true;
    }
    return false;
}


function writeLog(message: string, showTime: boolean = true, timeDiff: number = -1): boolean {
    const zeroPad = (num: number): string =>  num < 10 ? '0'+num.toString() : num.toString();

    if (!SHOW_DEBUG_LOGS)
        return SHOW_DEBUG_LOGS;

    const date = new Date();
    const UTCHours = date.getUTCHours();
    const hour = zeroPad(UTCHours !== 0 || timeDiff >= 0 ? UTCHours + timeDiff :  24 + timeDiff);
    const minutes = zeroPad(date.getUTCMinutes());
    const seconds = zeroPad(date.getUTCSeconds());

    console.log(showTime ? `${hour}:${minutes}:${seconds} - ` + message : message);
    return SHOW_DEBUG_LOGS;
}


function getDigitName(number: number): string {
    return {0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
        5: 'Five', 6: 'Six',7: 'Seven', 8: 'Eight', 9: 'Nine'
    }[number];
}


function setCanvasEvents(canvas: HTMLCanvasElement = undefined, sleepTimeOnMouseOut: number = 1500, sleepTimeOnMouseUp: number = 1350): void {
    const _canvas: HTMLCanvasElement = canvas || (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = _canvas.getContext('2d');

    
}


async function loadDigitRecognizerModel(path: string) {
    const canvas: HTMLCanvasElement = (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    eraseButton.write('Wait');
    model = await tf.loadLayersModel(path);
    writeLog("The model was loaded successfully!");
    canvas.style.cursor = 'crosshair';
    modelWasLoaded = true;
    eraseButton.enable();
    outputLabel.defaultMessage();
}


async function predictImage(inputSize: number = 36, padding: number = 5, waitTime: number = 150) {
    const _canvas = canvas.getCanvasElement();
    const inputShape = [inputSize - 2*padding, inputSize - 2*padding];
    const paddingShape = [[padding, padding], [padding, padding]];
    const threeDotsSVG = ('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">' +
        '<path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>' +
    '</svg>'); // TODO: I've definetelly to rewrite this in react!

    eraseButton.disable();
    outputLabel.write(threeDotsSVG);

    /* To resize the image, it can be used either `resizeBilinear` or `resizeNearestNeighbor` transforms. */
    const InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);

    try {
        if (modelWasLoaded === false || canvas.drawing === true)
            throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
        else if (InPut.sum().dataSync()[0] === 0) {
            eraseButton.enable();
            outputLabel.write("<div id='output-text'><strong>TIP</strong>: Click and Hold to draw.<\div>");
            throw Error('Canvas has no drawing, prediction canceled!');
        }

        if (checkLastDrawPredicted() === false)
            await (isFirstPrediction() ? sleep((Number((waitTime / 2).toFixed(0)))) : sleep(waitTime));

        if (checkHalt() === true) {
            eraseButton.enable();
            outputLabel.defaultMessage();
            throw Error('Halt Received, prediction was canceled!');
        }
    } catch (error) {
        writeLog(error);
        return false;
    }

    tf.engine().startScope(); //Prevents high usage of gpu
    const output = model.predict(InPut).dataSync();
    const prediction: number = tf.argMax(output).dataSync();
    const prob: number = tf.max(output).dataSync()[0];
    const percentProb = Number((prob * 100).toFixed(2));
    tf.engine().endScope(); //Prevents high usage of gpu
    outputLabel.write(
        `<div id='output-text'>The number drawn is <strong>${prediction}</strong> (<strong>${getDigitName(prediction)}</strong>)<\div>`
    );
    
    writeLog(`Prediction: ${prediction} ... Certainty: ${percentProb}%`, false);
    eraseButton.enable();
    havePredictLastDraw = true;
}


(function (welcomeMessage: string) {    
    initializaCanvasEvents();
    resizeTheEntirePage();

    const _ctx = canvas.getCtxElement();
    const _canvas = canvas.getCanvasElement();

    eraseButton.setEvent('click', () => {
        canvas.clear();
        if (modelWasLoaded === true)
            outputLabel.defaultMessage();
        haltPrediction = true;
    });

    window.addEventListener('resize', () => {
        resizeTheEntirePage();
        if (modelWasLoaded === true)
            outputLabel.defaultMessage();
    });
    loadDigitRecognizerModel('./data/compiled/model.json');
    console.log(`Logs ${SHOW_DEBUG_LOGS ? 'enabled' : 'disabled'}.`);
    writeLog(welcomeMessage);
}) ('Welcome to the Digit Recognition Web App!');

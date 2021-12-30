import {
    CtxPosI,
    OutputLabel,
    Button,
    sleep,
    min,
    max,
} from './common';


let lastCTXPos: CtxPosI = {x: 0, y: 0};
let modelWasLoaded: boolean = false;
let drawing: boolean = false;
let haltPrediction: boolean = false;
let havePredictLastDraw: boolean = true;
let firstPrediction: boolean = true;
let model: any;
const outputLabelDefaultMsg = "<div id='output-text'>Draw any digit between <strong>"
                          + "0</strong> to <strong>9</strong><\div>";
const outputLabel = new OutputLabel('output', outputLabelDefaultMsg);
const eraseButton = new Button('erase-btn', 'Erase', 'Wait');
const SHOW_DEBUG_LOGS = false;


function resizePage(canvas?: HTMLCanvasElement, pageAddSize: number = 300) {
    const output: HTMLElement = document.getElementById('output');
    const pipe: HTMLElement = document.getElementById('pipeline');
    const main: HTMLElement = document.getElementsByTagName('html')[0];
    const innerH: number = window.innerHeight;
    main.style.height = max(innerH, pageAddSize + calculateNewCanvasSize()).toString() + "px";
    output.style.width = pipe.style.width = calculateNewCanvasSize().toString() + "px";
    resizeCanvas(canvas);
}


function calculateNewCanvasSize(maxSize: number = 400, increaseSize: number = 30): number {
    const innerW: number = window.innerWidth;
    const outerW: number = window.outerWidth;
    const width: number = min(innerW, outerW) || innerW;
    return width > (maxSize + increaseSize) ? maxSize : (width - increaseSize);
}


function calculateNewCtxSize(maxCTXSize: number = 22, maxCanvasSize: number = 400): number {
    return (calculateNewCanvasSize(maxCanvasSize) * maxCTXSize) / maxCanvasSize;
}


function resizeCanvas(canvas?: HTMLCanvasElement, maxCanvasSize: number = 400, maxCTXSize: number = 22) {
    const _canvas: HTMLCanvasElement = canvas || (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    const _ctx: CanvasRenderingContext2D = _canvas.getContext('2d');
    _canvas.width = _canvas.height = calculateNewCanvasSize(maxCanvasSize);
    _ctx.lineWidth = calculateNewCtxSize(maxCTXSize, maxCanvasSize);
    _ctx.strokeStyle = 'white';
    _ctx.fillStyle = 'white';
    _ctx.lineJoin = 'round';
    _ctx.lineCap = 'round';
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

    _canvas.addEventListener('mousedown', (e) => {
        e.preventDefault()
        if (modelWasLoaded === false)
            return ;
        drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        lastCTXPos = { x: e.offsetX, y: e.offsetY };
    });

    _canvas.addEventListener('mouseout', async (e) => {
        e.preventDefault()
        const wasDrawing: boolean = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseOut);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage(_canvas);
    });

    _canvas.addEventListener('mousemove', (e) => {
        e.preventDefault()
        if (drawing === false)
            return ;
        ctx.beginPath();
        ctx.moveTo(lastCTXPos.x, lastCTXPos.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastCTXPos = { x: e.offsetX, y: e.offsetY };
    });

    _canvas.addEventListener('mouseup', async (e) => {
        e.preventDefault()
        const wasDrawing: boolean = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage(_canvas);
    });

    _canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (modelWasLoaded === false)
            return ;
        drawing = true;
        havePredictLastDraw = false;
        haltPrediction = false;
        const clientRect: DOMRect = _canvas.getBoundingClientRect();
        const touch: Touch = e.touches[0];
        lastCTXPos = {
            x: touch.pageX - clientRect.x,
            y: touch.pageY - clientRect.y
        };
    });

    _canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (drawing === false)
            return ;
        const clientRect: DOMRect = _canvas.getBoundingClientRect();
        const touch: Touch = e.touches[0];
        let x: number = touch.pageX - clientRect.x;
        let y: number = touch.pageY - clientRect.y;
        ctx.beginPath();
        ctx.moveTo(lastCTXPos.x, lastCTXPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastCTXPos = { x, y };
    });

    _canvas.addEventListener('touchend', async (e) => {
        e.preventDefault()
        const wasDrawing: boolean = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage(_canvas);
    });
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


async function predictImage(canvas: HTMLCanvasElement = undefined, inputSize: number = 36, padding: number = 5, waitTime: number = 150) {
    const inputShape = [inputSize - 2*padding, inputSize - 2*padding];
    const paddingShape = [[padding, padding], [padding, padding]];
    const _canvas = canvas || (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    const threeDotsSVG = ('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">' +
        '<path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>' +
    '</svg>'); // TODO: I've definetelly to rewrite this in react!

    eraseButton.disable();
    outputLabel.write(threeDotsSVG);

    /* To resize the image, it can be used either `resizeBilinear` or `resizeNearestNeighbor` transforms. */
    const InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);

    try {
        if (modelWasLoaded === false || drawing === true)
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
    const canvas = (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    setCanvasEvents(canvas); resizePage(canvas);
    const ctx = canvas.getContext('2d');
    eraseButton.setEvent('click', () => {
        ctx.clearRect(0, 0, calculateNewCanvasSize(), calculateNewCanvasSize());
        if (modelWasLoaded === true)
            outputLabel.defaultMessage();
        haltPrediction = true;
    });
    window.addEventListener('resize', () => {
        resizePage(canvas);
        if (modelWasLoaded === true)
            outputLabel.defaultMessage();
    });
    loadDigitRecognizerModel('./data/compiled/model.json');
    console.log(`Logs ${SHOW_DEBUG_LOGS ? 'enabled' : 'disabled'}.`);
    writeLog(welcomeMessage);
}) ('Welcome to the Digit Recognition Web App!');

const SHOW_LOGS = true;
interface PositionalInteface {
    x: number;
    y: number;
};
let modelWasLoaded: boolean = false;
let drawing: boolean = false;
let haltPrediction: boolean = false;
let havePredictLastDraw: boolean = false;
let lastPos: PositionalInteface = {x: 0, y: 0};
let model: any;
let firstPrediction: boolean = true;


class OutputSectionController {
    private readonly selector: string;
    private readonly defaultMessage: string;
    private readonly element: HTMLElement;
    constructor(id: string, defaultMsg: string) {
        this.selector = id;
        this.element = document.getElementById(this.selector);
        this.defaultMessage = defaultMsg;
    }
    print(message: string) {
        this.element.innerHTML = message;
    }
    printDefaultMessage() {
        this.print(this.defaultMessage);
    }
};


const Out: OutputSectionController = new OutputSectionController(
    'output', 'Draw any digit between <strong>0</strong> to <strong>9</strong>'
);


function sleep(milisecs: number): any {
    // Stops the execution by 'milisecs' miliseconds.
    return new Promise(resolve => setTimeout(resolve, milisecs));
}


function min(...args: number[]): number
{
    if (args.length < 2)
        throw Error('At least 2 elements are required for calculating the minimum!');
    let minimun: number = args[0];
    for (let i = 1 ; i < args.length ; ++i)
        minimun = minimun > args[i] ? args[i] : minimun;
    return minimun;
}


function max(...args: number[]): number
{
    if (args.length < 2)
        throw Error('At least 2 elements are required for calculating the maximum!');
    let maximum: number = args[0];
    for (let i = 1 ; i < args.length ; ++i)
        maximum = maximum < args[i] ? args[i] : maximum;
    return maximum;
}


function resizeHTML(pageAddSize: number = 285) {
    const main: HTMLElement = document.getElementsByTagName('html')[0];
    const innerH: number = window.innerHeight;
    main.style.height = `${max(innerH, pageAddSize + calculateNewCanvasSize())}px`;
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


function enableButton(selector: string) {
    const button: HTMLButtonElement = (document.getElementById(selector) as unknown) as HTMLButtonElement;
    button.disabled = false;
}


function disableButton(selector: string) {
    const button: HTMLButtonElement = (document.getElementById(selector) as unknown) as HTMLButtonElement;
    button.disabled = true;
}


function resizeCanvas(canvas: HTMLCanvasElement = undefined, maxCanvasSize: number = 400, maxCTXSize: number = 22) {
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


function writeLog(message: string, showTime: boolean = true): boolean {
    if (!SHOW_LOGS) return false;
    const date = new Date();
    const standardrize = (time: number): string | number => {
        return time < 10 ? '0'+time : time;
    }
    const hour = standardrize(date.getUTCHours() - 1);
    const minutes = standardrize(date.getUTCMinutes());
    const seconds = standardrize(date.getUTCSeconds());
    console.log(showTime ? `${hour}:${minutes}:${seconds} - ` + message : message);
    return true;
}


function getDigitName(number: number): string {
    return {0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
        5: 'Five', 6: 'Six',7: 'Seven', 8: 'Eight', 9: 'Nine'
    }[number];
}


function setCanvasEvents(canvas: HTMLCanvasElement = undefined, sleepTimeOnMouseOut: number = 1500, sleepTimeOnMouseUp: number = 1200): void {
    const _canvas: HTMLCanvasElement = canvas || (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = _canvas.getContext('2d');

    _canvas.addEventListener('mousedown', (e) => {
        if (modelWasLoaded === false)
            return ;
        drawing = true;
        haltPrediction = false;
        havePredictLastDraw = false;
        lastPos = { x: e.offsetX, y: e.offsetY };
    });

    _canvas.addEventListener('mouseout', async () => {
        const wasDrawing: boolean = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseOut);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage(_canvas);
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
        let x: number = touch.pageX - clientRect.x;
        let y: number = touch.pageY - clientRect.y;
        lastPos = { x, y };
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
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPos = { x, y };
    });

    _canvas.addEventListener('touchend', async () => {
        const wasDrawing: boolean = drawing;
        drawing = false;
        await sleep(sleepTimeOnMouseUp);
        if (modelWasLoaded && wasDrawing && !drawing && !checkHalt())
            predictImage(_canvas);
    });
}


async function loadDigitRecognizerModel(path: string = './data/compiled/model.json') {
    const canvas: HTMLCanvasElement = (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    model = await tf.loadLayersModel(path);
    writeLog("The model was loaded successfully!");
    canvas.style.cursor = 'crosshair';
    modelWasLoaded = true;
    enableButton('clear-btn');
    Out.printDefaultMessage();
}


async function predictImage(canvas: HTMLCanvasElement = undefined, inputSize: number = 36, padding: number = 4, waitTime: number = 200)
{
    const inputShape: number[] = [inputSize - 2*padding, inputSize - 2*padding];
    const paddingShape: number[][] = [[padding, padding], [padding, padding]];
    const _canvas: HTMLCanvasElement = canvas || (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    // Get the canvas image from pixels and apply some transformations to make it a good input to the model.
    // To resize the image, it can be used either `resizeBilinear` or `resizeNearestNeighbor` transforms.
    const InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);

    try {
        if (modelWasLoaded === false || drawing === true)
            throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
        else if (InPut.sum().dataSync()[0] === 0) {
            // The condition above checks if the sum of all pixels on the canvas is equal to zero,
            // if true that means that nothing is drawn on the canvas.
            Out.print('<strong>TIP</strong>: Click and Hold to draw.');
            throw Error('Canvas has no drawing, prediction canceled!');
        }

        disableButton('clear-btn');

        if (havePredictLastDraw === false) {
            Out.print('Analyzing The Drawing(<strong>...</strong>)');
            if (firstPrediction === false)
                await sleep(waitTime);
            else // Don't sleep in the first prediction
                firstPrediction = false;
        } else
            havePredictLastDraw = false;

        if (checkHalt() === true) {
            enableButton('clear-btn');
            Out.printDefaultMessage();
            throw Error('Halt Received, prediction was canceled!');
        }
    } catch (error) {
        writeLog(error);
        return false;
    }

    tf.engine().startScope(); //Prevents high usage of gpu
    const output: number = model.predict(InPut).dataSync();
    const prediction: number = tf.argMax(output).dataSync();
    const probability: number = tf.max(output).dataSync()[0];
    Out.print(
        `The number drawn is <strong>${prediction}</strong> (<strong>${getDigitName(prediction)}</strong>)`
    );
    tf.engine().endScope(); //Prevents high usage of gpu

    writeLog(`Prediction: ${prediction} ... Certainty: ${(parseFloat(probability.toPrecision(4)) * 100)}%`, false);
    enableButton('clear-btn');
    havePredictLastDraw = true;
}


/***
 * @info main function
 ***/
(function (welcomeMessage: string) { resizeHTML();
    const canvas: HTMLCanvasElement = (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    setCanvasEvents(canvas);
    resizeCanvas(canvas);
    const clearBtn: HTMLButtonElement = (document.getElementById('clear-btn') as unknown) as HTMLButtonElement;
    const output: HTMLElement = document.getElementById('output');
    const pipe: HTMLElement = document.getElementById('pipeline');
    let width: string = `${calculateNewCanvasSize()}px`;
    output.style.width = width;
    pipe.style.width = width;
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, calculateNewCanvasSize(), calculateNewCanvasSize());
        if (modelWasLoaded === true)
            Out.printDefaultMessage();
        haltPrediction = true;
    });
    window.addEventListener('resize', () => {
        width = `${calculateNewCanvasSize()}px`;
        output.style.width = width;
        pipe.style.width = width;
        resizeCanvas(canvas); resizeHTML();
        if (modelWasLoaded === true)
            Out.printDefaultMessage();
    });
    loadDigitRecognizerModel();
    console.log(`Logs ${SHOW_LOGS ? 'enabled' : 'disabled'}.`);
    writeLog(welcomeMessage);
})('Welcome to the Digit Recognition Web App!');

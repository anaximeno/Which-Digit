interface BiDimensionalPositionInteface {
    x: number; y: number;
};

let lastCTXPos: BiDimensionalPositionInteface;
let modelWasLoaded: boolean;
let drawing: boolean;
let haltPrediction: boolean;
let havePredictLastDraw: boolean;
let firstPrediction: boolean;
let model: any;

lastCTXPos = {x: 0, y: 0};
modelWasLoaded = false;
drawing = false;
haltPrediction = false;
havePredictLastDraw = false;
firstPrediction = true;



const SHOW_DEBUG_LOGS = false;



class SectionController {
    private readonly selector: string;
    protected readonly defaultMessage: string;
    protected readonly element: HTMLElement;
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
    static setOpacity (id: string, value: number, title: string) {
        const element: HTMLElement = (document.getElementById(id) as unknown) as HTMLElement;
        element.style.opacity = value.toString();
        element.title = title;
    }
};


class ButtonController extends SectionController {
    protected readonly _btn_element: HTMLButtonElement;
    protected readonly _disabledMsg: string;
    constructor(id: string, defaultMsg: string, disabledMsg: string) {
        super(id, defaultMsg);
        this._btn_element = (this.element as unknown) as HTMLButtonElement;
        this._disabledMsg = disabledMsg;
    }
    enable() {
        this._btn_element.disabled = false;
        this.printDefaultMessage();
    }
    disable() {
        this._btn_element.disabled = true;
        this.print(this._disabledMsg);
    }
    setEvent(event: string, listener: any) {
        this._btn_element.addEventListener(event, listener);
    }
}


const outSection = new SectionController(
    'output', "<div id='output-text'>Draw any digit between <strong>0</strong> to <strong>9</strong><\div>"
);

const clearBtn = new ButtonController('clear-btn', 'Erase', 'Wait(<strong>...</strong>)');


function sleep(milisecs: number): Promise<unknown> {
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


function resizePage(canvas: HTMLCanvasElement | any = undefined, pageAddSize: number = 300) {
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


function checkFirstPrediction(): boolean {
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
    function addZero(time: number): string {
        return time < 10 ? '0' + time.toString() : time.toString();
    }

    if (!SHOW_DEBUG_LOGS)
        return SHOW_DEBUG_LOGS;

    const date = new Date();
    const UTCHours = date.getUTCHours();
    const hour = addZero(UTCHours !== 0 || timeDiff >= 0 ? UTCHours + timeDiff :  24 + timeDiff);
    const minutes = addZero(date.getUTCMinutes());
    const seconds = addZero(date.getUTCSeconds());

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
    clearBtn.print('Wait(...)');
    model = await tf.loadLayersModel(path);
    writeLog("The model was loaded successfully!");
    canvas.style.cursor = 'crosshair';
    modelWasLoaded = true;
    clearBtn.enable();
    outSection.printDefaultMessage();
}


async function predictImage(canvas: HTMLCanvasElement = undefined, inputSize: number = 36, padding: number = 2, waitTime: number = 150) {
    const inputShape = [inputSize - 2*padding, inputSize - 2*padding];
    const paddingShape = [[padding, padding], [padding, padding]];
    const _canvas = canvas || (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;

    clearBtn.disable();
    outSection.print("<div id='output-text'>Analyzing The Drawing(<strong>...</strong>)<\div>");

    /* To resize the image, it can be used either `resizeBilinear` or `resizeNearestNeighbor` transforms. */
    const InPut = tf.browser.fromPixels(_canvas).resizeNearestNeighbor(inputShape)
        .mean(2).pad(paddingShape).expandDims().expandDims(3).toFloat().div(255.0);

    try {
        if (modelWasLoaded === false || drawing === true)
            throw Error(modelWasLoaded ? 'Prediction canceled, model was not loaded yet!' : 'Drawing already, prediction canceled!');
        else if (InPut.sum().dataSync()[0] === 0) {
            clearBtn.enable();
            outSection.print("<div id='output-text'><strong>TIP</strong>: Click and Hold to draw.<\div>");
            throw Error('Canvas has no drawing, prediction canceled!');
        }

        if (checkLastDrawPredicted() === false)
            await (checkFirstPrediction() ? sleep((Number((waitTime / 2).toFixed(0)))) : sleep(waitTime));

        if (checkHalt() === true) {
            clearBtn.enable();
            outSection.printDefaultMessage();
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
    tf.engine().endScope(); //Prevents high usage of gpu
    outSection.print(
        `<div id='output-text'>The number drawn is <strong>${prediction}</strong> (<strong>${getDigitName(prediction)}</strong>)<\div>`
    );
    
    SectionController.setOpacity(
        'output-text', probability, 'The opacity of the text represents the certainty of the prediction.'
    );
    
    writeLog(`Prediction: ${prediction} ... Certainty: ${(probability * 100).toFixed(2)}%`, false);
    clearBtn.enable();
    havePredictLastDraw = true;
}


(function (welcomeMessage: string) {
    const canvas = (document.getElementById('draw-canvas') as unknown) as HTMLCanvasElement;
    setCanvasEvents(canvas); resizePage(canvas);
    const ctx = canvas.getContext('2d');
    clearBtn.setEvent('click', () => {
        ctx.clearRect(0, 0, calculateNewCanvasSize(), calculateNewCanvasSize());
        if (modelWasLoaded === true)
            outSection.printDefaultMessage();
        SectionController.setOpacity('output-text', 1, '');
        haltPrediction = true;
    });
    window.addEventListener('resize', () => {
        resizePage(canvas);
        if (modelWasLoaded === true)
            outSection.printDefaultMessage();
        SectionController.setOpacity('output-text', 1, '');
    });
    loadDigitRecognizerModel('./data/compiled/model.json');
    console.log(`Logs ${SHOW_DEBUG_LOGS ? 'enabled' : 'disabled'}.`);
    writeLog(welcomeMessage);
}) ('Welcome to the Digit Recognition Web App!');

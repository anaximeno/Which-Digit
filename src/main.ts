import {
    Logger,
    OutputLabel,
    Button,
    sleep,
    max
} from './common';
import { Canvas } from './canvas';
import { Model } from './model';


const logger = new Logger(true); // ALERT: debug moe active
const outputLabel = new OutputLabel('output', "<div id='output-text'>Draw any digit between <strong>"+
    "0</strong> to <strong>9</strong><\div>");
const eraseButton = new Button('erase-btn', 'Erase', 'Wait');
const canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
const model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel, logger);

const initializaCanvasEvents = (sleepTimeOnMouseOut: number = 1500,sleepTimeOnMouseUp: number = 1350) => {
    const _canvas = canvas.getCanvasElement();
    const _ctx = canvas.getCtxElement();
    
    canvas.setEvent('mousedown', (e: MouseEvent) => {
        e.preventDefault()
        if (model.isLoaded() === false)
            return ;
        canvas.drawing = true;
        model.deactivateHalt();
        model.lastDrawPredicted = false;
        canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
    });

    canvas.setEvent('mouseout', async (e: MouseEvent) => {
        e.preventDefault()
        const wasDrawing = canvas.drawing;
        canvas.drawing = false;
        await sleep(sleepTimeOnMouseOut);
        if (model.isLoaded() && wasDrawing && !canvas.drawing && !model.checkHalt())
            model.predict(150, false);
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
        if (model.isLoaded() && wasDrawing && !canvas.drawing && !model.checkHalt())
            model.predict(150, false);
    });
    
    canvas.setEvent('touchstart', (e: TouchEvent) => {
        e.preventDefault();
        if (model.isLoaded() === false)
            return ;
        canvas.drawing = true;
        model.lastDrawPredicted = false;
        model.deactivateHalt();
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
        if (model.isLoaded() && wasDrawing && !canvas.drawing && !model.checkHalt())
            model.predict(150, false);
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


(function (welcomeMessage: string) {    
    initializaCanvasEvents();
    resizeTheEntirePage();
    model.load();

    const _ctx = canvas.getCtxElement();
    const _canvas = canvas.getCanvasElement();

    eraseButton.setEvent('click', () => {
        canvas.clear();
        if (model.isLoaded() === true)
            outputLabel.defaultMessage();
        model.activateHalt();
    });

    window.addEventListener('resize', () => {
        resizeTheEntirePage();
        if (model.isLoaded() === true)
            outputLabel.defaultMessage();
    });

    logger.writeLog(welcomeMessage, false, true);
}) ('Welcome to the Digit Recognition Web App!');

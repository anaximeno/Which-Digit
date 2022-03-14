import { Canvas } from './canvas';
import { Model } from './model';
import { max, sleep } from './common';

import {
    Logger,
    Button,
    OutputSection
} from './common';

import {
    IAppSettings,
    IPrediction
} from './types';



export class App {
    private readonly canvas: Canvas;
    private readonly eraser: Button;
    private readonly out: OutputSection;
    private readonly model: Model;
    private readonly log: Logger;

    constructor(private settings: IAppSettings) { 
        this.log = Logger.getInstance();

        this.eraser = new Button('erase-btn', 'Clear', 'Please wait');

        this.out = new OutputSection(
            'output', 
            `<div id='output-text'>
                Draw any digit between <strong>0</strong> to <strong>9</strong>
            <\div>`
        );

        const { canvasSettings, modelSettings } = this.settings;
        const { canvasSize: width, ctxSize } = canvasSettings;
        const height = width;

        this.canvas = new Canvas('draw-canvas', { width, height }, ctxSize);
        this.model = new Model(modelSettings, this.canvas, this.eraser, this.out);
    }

    protected initializeCanvasEvents(sleepTimeOnMouseOut: number = 1500, sleepTimeOnMouseUp: number = 1350) {
        const _canvas = this.canvas.getCanvasElement();
        const _ctx = this.canvas.getCtxElement();

        this.canvas.setEvent({
            type: 'mousedown',
            listener: (e: MouseEvent) => {
                e.preventDefault()
                if (this.model.isLoaded() === false)
                    return ;
                this.canvas.drawing = true;
                this.model.deactivateHalt();
                this.model.lastDrawPredicted = false;
                this.canvas.setLastCtxPosition({
                    x: e.offsetX,
                    y: e.offsetY
                });
            }
        });

        this.canvas.setEvent({
            type: 'mouseout', 
            listener: async (e: MouseEvent) => {
                e.preventDefault()
                const wasDrawing = this.canvas.drawing;
                this.canvas.drawing = false;
                await sleep(sleepTimeOnMouseOut);
                if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt()) {
                    this.showResults(await this.model.analyzeDrawing());
                }
            }
        });

        this.canvas.setEvent({
            type: 'mousemove',
            listener: (e: MouseEvent) => {
                e.preventDefault()
                if (this.canvas.drawing === false)
                    return ;
                let {x, y} = this.canvas.getLastCtxPosition();
                _ctx.beginPath();
                _ctx.moveTo(x, y);
                _ctx.lineTo(
                    e.offsetX,
                    e.offsetY
                );
                _ctx.stroke();
                this.canvas.setLastCtxPosition({
                    x: e.offsetX,
                    y: e.offsetY
                });
            }
        });

        this.canvas.setEvent({
            type: 'mouseup',
            listener: async (e: MouseEvent) => {
                e.preventDefault()
                const wasDrawing = this.canvas.drawing;
                this.canvas.drawing = false;
                await sleep(sleepTimeOnMouseUp);
                if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt()) {
                    this.showResults(await this.model.analyzeDrawing());
                }
            }
        });

        this.canvas.setEvent({
            type: 'touchstart',
            listener: (e: TouchEvent) => {
                e.preventDefault();
                if (this.model.isLoaded() === false)
                    return ;
                this.canvas.drawing = true;
                this.model.lastDrawPredicted = false;
                this.model.deactivateHalt();
                const {x: Ux, y: Uy} = _canvas.getBoundingClientRect();
                const {pageX: Tx, pageY: Ty} = e.touches[0];
                this.canvas.setLastCtxPosition({x: Tx - Ux, y: Ty - Uy});
            }
        });

        this.canvas.setEvent({
            type: 'touchmove',
            listener: (e: TouchEvent) => {
                e.preventDefault();
                if (this.canvas.drawing === false)
                    return ;
                const clientRect = _canvas.getBoundingClientRect();
                const touch = e.touches[0];
                let {x, y} = this.canvas.getLastCtxPosition();
                _ctx.beginPath();
                _ctx.moveTo(x, y);
                x = touch.pageX - clientRect.x;
                y = touch.pageY - clientRect.y;
                _ctx.lineTo(x, y);
                _ctx.stroke();
                this.canvas.setLastCtxPosition({ x, y });
            }
        });

        this.canvas.setEvent({
            type: 'touchend',
            listener: async (e: TouchEvent) => {
                e.preventDefault()
                const wasDrawing = this.canvas.drawing;
                this.canvas.drawing = false;
                await sleep(sleepTimeOnMouseUp);
                if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt()) {
                    this.showResults(await this.model.analyzeDrawing());
                }
            }
        });
    }

    private showResults(prediction?: IPrediction) {
        if (prediction !== undefined) {
            let {name, value, certainty, ..._} = prediction; 
            const prob = Number((certainty * 100).toFixed(2));

            this.out.write(`
                <div id='output-text'>
                    The number drawn is <strong>${value}</strong> (<strong>${name}</strong>)
                <\div>`
            );

            this.log.writeLog(`Prediction: ${value}  (certainty = ${prob}%)`);
        } else {
            this.log.writeLog('App.showResults: called without prediction to show.');
        }
    }

    protected resizeTheEntirePage(pageMarginIncrease: number = 300) {
        const innerH = window.innerHeight;
        const output = document.getElementById('output');
        const pipe = document.getElementById('pipeline');
        const main = document.getElementsByTagName('html')[0];
        const size = this.canvas.idealCanvasSize();
        const increasedSize = size + pageMarginIncrease;
        const maxValue = <unknown>max(innerH, increasedSize) as string;

        main.style.height = maxValue + "px";
        output.style.width = <unknown>size as string + "px"
        pipe.style.width = output.style.width;
    
        this.canvas.resize();
    }

    run() {        
        this.eraser.setEvent({
            type: 'click',
            listener: () => {
                this.canvas.clear();
                this.model.activateHalt(() => {
                    this.log.writeLog(
                        "App: clear button clicked, canceled prediction!"
                        );
                });
                if (this.model.isLoaded() === true) {
                    this.out.defaultMessage();
                }
            }
        });

        window.addEventListener('resize', () => {
            this.resizeTheEntirePage();
            if (this.model.isLoaded() === true) {
                this.out.defaultMessage();
            }
        });

        const { onUp, onOut } = this.settings.mouseTimeSettings;

        this.initializeCanvasEvents(onOut, onUp);
        this.resizeTheEntirePage();
        this.model.load();
        this.log.writeLog(
            'App: Running the Digit Recognition Web App!'
            );
    }
};

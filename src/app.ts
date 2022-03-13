import * as canvas from './canvas';
import { Logger, OutputLabel, Button, sleep, max } from './common';
import { Model, IPrediction } from './model'


export interface ICanvasSettings {
    canvasSize: number;
    ctxSize: number;
}


export interface IMouseTimeSettings {
    onOut: number;
    onUp: number;
}


export interface IAppSettings {
    canvasSettings: ICanvasSettings;
    mouseTimeSettings: IMouseTimeSettings;
};


export class App {
    private readonly canvas: canvas.Canvas;
    private readonly eraser: Button;
    private readonly outSection: OutputLabel;
    private readonly model: Model;
    private readonly log: Logger;

    constructor(private settings: IAppSettings) { 
        this.eraser = new Button('erase-btn', 'Clear', 'Please wait');

        this.outSection = new OutputLabel(
            'output', 
            `<div id='output-text'>
                Draw any digit between <strong>0</strong> to <strong>9</strong>
            <\div>`
        );

        const { canvasSize, ctxSize } = this.settings.canvasSettings;

        this.canvas = new canvas.Canvas(
            'draw-canvas',
            {
                width: canvasSize,
                height: canvasSize
            },
            ctxSize
        );

        this.model = new Model(
            './data/compiled/model.json',
            this.canvas, this.eraser,
            this.outSection
        );

        this.log = Logger.getInstance();
    }

    protected initializeCanvasEvents = (sleepTimeOnMouseOut: number = 1500, sleepTimeOnMouseUp: number = 1350) => {
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
                this.canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
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
                    this.showResults(await this.model.analyzeDrawing(150, false));
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
                _ctx.lineTo(e.offsetX, e.offsetY);
                _ctx.stroke();
                this.canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
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
                    this.showResults(await this.model.analyzeDrawing(150, false));
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
                const {x: Ux, y: Uy, ...o} = _canvas.getBoundingClientRect();
                const {pageX: Tx, pageY: Ty, ...a} = e.touches[0];
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
                    this.showResults(await this.model.analyzeDrawing(150, false));
                }
            }
        });
    }

    private showResults = (prediction?: IPrediction) => {
        if (prediction !== undefined) {
            let {name, value, certainty, ..._} = prediction; 
            const prob = Number((certainty * 100).toFixed(2));

            this.outSection.write(`
                <div id='output-text'>
                    The number drawn is <strong>${value}</strong> (<strong>${name}</strong>)
                <\div>`
            );

            this.log.writeLog(`Prediction: ${value}  (certainty = ${prob}%)`);
        } else {
            this.log.writeLog('App.showResults: called without prediction to show.');
        }
    }

    protected resizeTheEntirePage = (pageMarginIncrease: number = 300) => {
        const innerH = window.innerHeight;
        const output = document.getElementById('output');
        const pipe = document.getElementById('pipeline');
        const main = document.getElementsByTagName('html')[0];
        const size = this.canvas.idealCanvasSize();
        const maxValue = <unknown>max(innerH, pageMarginIncrease + size) as string;

        main.style.height = maxValue + "px";
        output.style.width = <unknown>size as string + "px"
        pipe.style.width = output.style.width;
    
        this.canvas.resize();
    }

    run = () => {        
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
                    this.outSection.defaultMessage();
                }
            }
        });

        window.addEventListener('resize', () => {
            this.resizeTheEntirePage();
            if (this.model.isLoaded() === true) {
                this.outSection.defaultMessage();
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

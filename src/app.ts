import { Canvas } from './canvas';
import { Logger, OutputLabel, Button, sleep, max } from './common';
import { Model, IPrediction } from './model'


interface IAppSettings {
    sleepTimeOnMouseOut: number;
    sleepTimeOnMouseUp: number;
    pageMarginIncrease: number;
};


export class App {
    private settings: IAppSettings;

    constructor(
        private readonly model: Model,
        private readonly canvas: Canvas,
        private readonly outLabel: OutputLabel,
        private readonly eraseButton: Button,
    ) { 
        this.settings  = {
            sleepTimeOnMouseOut: 1500,
            sleepTimeOnMouseUp: 1350,
            pageMarginIncrease: 300
        };
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

            this.outLabel.write(`
                <div id='output-text'>
                    The number drawn is <strong>${value}</strong> (<strong>${name}</strong>)
                <\div>`
            );

            Logger.getInstance().writeLog(`Prediction: ${value}  (certainty = ${prob}%)`);
        } else {
            Logger.getInstance().writeLog('App.showResults: called without prediction to show.');
        }
    }

    protected resizeTheEntirePage = (pageMarginIncrease: number = 300) => {
        const innerH = window.innerHeight;
        const output = document.getElementById('output');
        const pipe = document.getElementById('pipeline');
        const main = document.getElementsByTagName('html')[0];
    
        const size = this.canvas.idealCanvasSize();
    
        main.style.height = max(innerH, pageMarginIncrease + size).toString() + "px";
        output.style.width = size.toString() + "px"
        pipe.style.width = output.style.width;
    
        this.canvas.resize();
    }

    run = (definition?: IAppSettings) => {
        if (definition !== undefined) { this.settings = definition; }
        const { sleepTimeOnMouseOut, sleepTimeOnMouseUp, pageMarginIncrease } = this.settings;
        const logger = Logger.getInstance();

        this.eraseButton.setEvent({
            type: 'click',
            listener: () => {
                this.canvas.clear();
                this.model.activateHalt(() => {
                    logger.writeLog("App: clear button clicked, canceled prediction!");
                });
                if (this.model.isLoaded() === true) {
                    this.outLabel.defaultMessage();
                }
            }
        });

        window.addEventListener('resize', () => {
            this.resizeTheEntirePage(pageMarginIncrease);
            if (this.model.isLoaded() === true) {
                this.outLabel.defaultMessage();
            }
        });

        this.initializeCanvasEvents(sleepTimeOnMouseOut, sleepTimeOnMouseUp);
        this.resizeTheEntirePage(pageMarginIncrease);
        this.model.load();
        logger.writeLog('App: Running the Digit Recognition Web App!');
    }
};

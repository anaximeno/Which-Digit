import { Canvas } from './canvas';
import { Logger, OutputLabel, Button, sleep, max } from './common';
import { Model } from './model'


export interface AppDefinitionsI {
    sleepTimeOnMouseOut: number;
    sleepTimeOnMouseUp: number;
    pageMarginIncrease: number;
};


// TODO: implement the app main class
export class App {
    private appDefinitions: AppDefinitionsI;

    constructor(
        private readonly logger: Logger,
        private readonly outLabel: OutputLabel,
        private readonly canvas: Canvas,
        private readonly eraseButton: Button,
        private readonly model: Model,
    ) { 
        this.appDefinitions  = {
            sleepTimeOnMouseOut: 1500,
            sleepTimeOnMouseUp: 1350,
            pageMarginIncrease: 300
        };
    }

    protected initializeCanvasEvents = (sleepTimeOnMouseOut: number = 1500, sleepTimeOnMouseUp: number = 1350) => {
        const _canvas = this.canvas.getCanvasElement();
        const _ctx = this.canvas.getCtxElement();
        
        this.canvas.setEvent('mousedown', (e: MouseEvent) => {
            e.preventDefault()
            if (this.model.isLoaded() === false)
                return ;
            this.canvas.drawing = true;
            this.model.deactivateHalt();
            this.model.lastDrawPredicted = false;
            this.canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
        });
    
        this.canvas.setEvent('mouseout', async (e: MouseEvent) => {
            e.preventDefault()
            const wasDrawing = this.canvas.drawing;
            this.canvas.drawing = false;
            await sleep(sleepTimeOnMouseOut);
            if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())
                this.model.predict(150, false);
        });
        
        this.canvas.setEvent('mousemove', (e: MouseEvent) => {
            e.preventDefault()
            if (this.canvas.drawing === false)
                return ;
            let {x, y} = this.canvas.getLastCtxPosition();
            _ctx.beginPath();
            _ctx.moveTo(x, y);
            _ctx.lineTo(e.offsetX, e.offsetY);
            _ctx.stroke();
            this.canvas.setLastCtxPosition({ x: e.offsetX, y: e.offsetY });
        });
        
        this.canvas.setEvent('mouseup', async (e: MouseEvent) => {
            e.preventDefault()
            const wasDrawing = this.canvas.drawing;
            this.canvas.drawing = false;
            await sleep(sleepTimeOnMouseUp);
            if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())
                this.model.predict(150, false);
        });
        
        this.canvas.setEvent('touchstart', (e: TouchEvent) => {
            e.preventDefault();
            if (this.model.isLoaded() === false)
                return ;
            this.canvas.drawing = true;
            this.model.lastDrawPredicted = false;
            this.model.deactivateHalt();
            const clientRect = _canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.canvas.setLastCtxPosition({
                x: touch.pageX - clientRect.x,
                y: touch.pageY - clientRect.y
            });
        });
    
        this.canvas.setEvent('touchmove', (e: TouchEvent) => {
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
        });
        
        this.canvas.setEvent('touchend', async (e: TouchEvent) => {
            e.preventDefault()
            const wasDrawing = this.canvas.drawing;
            this.canvas.drawing = false;
            await sleep(sleepTimeOnMouseUp);
            if (this.model.isLoaded() && wasDrawing && !this.canvas.drawing && !this.model.checkHalt())
                this.model.predict(150, false);
        });
    }

    protected resizeTheEntirePage = (pageMarginIncrease: number = 300) => {
        const innerH = window.innerHeight;
        const output = document.getElementById('output');
        const pipe = document.getElementById('pipeline');
        const main = document.getElementsByTagName('html')[0];
    
        const canvasSize = this.canvas.canvasBetterSize();
    
        main.style.height = max(
            innerH, pageMarginIncrease + canvasSize
        ).toString() + "px";
    
        output.style.width = canvasSize.toString() + "px"
        pipe.style.width = output.style.width;
    
        this.canvas.resize();
    }

    run = (definition?: AppDefinitionsI) => {
        if (definition) {
            this.appDefinitions = definition;
        }
        this.initializeCanvasEvents(
            this.appDefinitions.sleepTimeOnMouseOut,
            this.appDefinitions.sleepTimeOnMouseUp
        );
        this.resizeTheEntirePage(this.appDefinitions.pageMarginIncrease);
        this.model.load();
        this.eraseButton.setEvent('click', () => {
            this.canvas.clear();
            if (this.model.isLoaded() === true) {
                this.outLabel.defaultMessage();
            this.model.activateHalt();
            }
        });
        window.addEventListener('resize', () => {
            this.resizeTheEntirePage();
            if (this.model.isLoaded() === true) {
                this.outLabel.defaultMessage()
            }
        });
        this.logger.writeLog('Running the Digit Recognition Web App!', false, false);
    }
};
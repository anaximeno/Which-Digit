import { min, max } from "./common"

import {
    I2DPosition,
    ICanvasSize,
    IEventSetter
} from './types';


// NOTE: Default export was not used due to error in compilation time
// when using it.
export class Canvas {
    protected readonly canvasElement: HTMLCanvasElement;
    private readonly ctxElement: CanvasRenderingContext2D;
    private lastCtxPos: I2DPosition;
    public drawing: boolean;

    constructor(
        protected readonly selector: string,
        protected readonly canvasSize: ICanvasSize,
        protected readonly ctxSize: number
    ) {
        this.lastCtxPos = { x: 0, y: 0 };
        this.drawing = false;
        this.canvasElement = document.getElementById(selector) as HTMLCanvasElement;
        this.ctxElement = this.canvasElement.getContext('2d');
    }

    getCanvasElement = (): HTMLCanvasElement => this.canvasElement;

    getCtxElement = (): CanvasRenderingContext2D =>  this.ctxElement;

    getLastCtxPosition = (): I2DPosition => this.lastCtxPos;

    setLastCtxPosition = (position: I2DPosition) => {
        this.lastCtxPos = position;
    }

    idealCanvasSize = (paddingIncrement: number = 30): number => {
        const {width, height} = this.canvasSize;
        const maxSize = max(width, height);
        const {innerWidth: innerW, outerWidth: outerW, ...o} = window;
        const betterWidth = min(innerW, outerW) || innerW;
        return betterWidth > (maxSize + paddingIncrement) ? 
            maxSize : (betterWidth - paddingIncrement);
    }

    idealCtxSize = (): number => {
        const {width: canvasW, height: canvasH} = this.canvasSize;
        const maxCanvasSize = max(canvasW, canvasH);
        return (this.idealCanvasSize() * this.ctxSize) / maxCanvasSize;
    }

    private setUpCtx = (
        strokeStyle: string = 'white',
        fillStyle: string = 'white',
        lineJoin: CanvasLineJoin = 'round',
        lineCap: CanvasLineCap = 'round'
    ) => {
        this.ctxElement.strokeStyle = strokeStyle;
        this.ctxElement.fillStyle = fillStyle;
        this.ctxElement.lineJoin = lineJoin;
        this.ctxElement.lineCap = lineCap;
    }

    resize = () => {
        const canvasSize = this.idealCanvasSize();
        const ctxSize = this.idealCtxSize();
        this.canvasElement.width = canvasSize;
        this.canvasElement.height = canvasSize;
        this.ctxElement.lineWidth = ctxSize;
        this.setUpCtx();
    }

    setEvent = (event: IEventSetter) => {
        this.canvasElement.addEventListener(event.type, event.listener);
    }

    clear = () => {
        const limit = this.canvasElement.width;
        this.ctxElement.clearRect(0, 0, limit, limit);
    }
}
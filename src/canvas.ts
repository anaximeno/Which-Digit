import { min, max } from "./common"

import {
    I2DPosition,
    ICanvasSize,
    IEventSetter
} from './types';


/** The default export wasn't used to prevent errors when compiling to JavaScript. */
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
        this.drawing = false;
        this.lastCtxPos = { x: 0, y: 0 };
        this.canvasElement = <HTMLCanvasElement>document.getElementById(selector);
        this.ctxElement = this.canvasElement.getContext('2d');
    }

    getCanvasElement(): HTMLCanvasElement {
        return this.canvasElement;
    }

    getCtxElement(): CanvasRenderingContext2D {
        return this.ctxElement;
    }

    getLastCtxPosition(): I2DPosition {
        return this.lastCtxPos;
    }

    setLastCtxPosition(pos: I2DPosition) {
        this.lastCtxPos = pos;
    }

    idealCanvasSize(paddingIncrement: number = 30): number {
        const { width, height } = this.canvasSize;
        const maxSize = max(width, height);
        const { innerWidth: innerW, outerWidth: outerW } = window;
        const betterWidth = min(innerW, outerW) || innerW;
        return betterWidth > (maxSize + paddingIncrement) ? 
            maxSize : (betterWidth - paddingIncrement);
    }

    idealCtxSize(): number {
        const { width: canvasW, height: canvasH } = this.canvasSize;
        const maxCanvasSize = max(canvasW, canvasH);
        return (this.idealCanvasSize() * this.ctxSize) / maxCanvasSize;
    }

    private setUpCtx(
        strokeStyle: string = 'white',
        fillStyle:   string = 'white',
        lineJoin: CanvasLineJoin = 'round',
        lineCap:  CanvasLineCap  = 'round'
    ) {
        this.ctxElement.strokeStyle = strokeStyle;
        this.ctxElement.fillStyle   = fillStyle;
        this.ctxElement.lineJoin    = lineJoin;
        this.ctxElement.lineCap     = lineCap;
    }
 
    resize() {
        const canvasSize = this.idealCanvasSize();
        const ctxSize    = this.idealCtxSize();
        this.canvasElement.width  = canvasSize;
        this.canvasElement.height = canvasSize;
        this.ctxElement.lineWidth = ctxSize;
        this.setUpCtx();
    }

    setEvent(event: IEventSetter) {
        this.canvasElement.addEventListener(event.type, event.listener);
    }

    clear() {
        const limit = this.canvasElement.width;
        this.ctxElement.clearRect(0, 0, limit, limit);
    }
}

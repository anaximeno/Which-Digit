export interface IPrediction {
    value: number;
    name: string;
    certainty: number;
    predictedImage?: any;
};


export type IModelPadding = 0 | 1 | 2 | 3 | 4;


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
    imagePadding: IModelPadding;
};


export interface I2DPosition {
    x: number;
    y: number;
}


export interface ICanvasSize {
    width: number;
    height: number;
}


export interface IEventSetter {
    type: string,
    listener: EventListenerOrEventListenerObject
}


export interface ILogMessage {
    time: string;
    message: string;
}
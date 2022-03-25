export interface IPrediction {
    value: number;
    name: string;
    certainty: number;
    predictedImage?: any;
};


export type ModelPaddingType = 0 | 1 | 2 | 3 | 4 | 5;


export interface IModelSettings {
    sleepMilisecsOnPrediction: number;
    padding: ModelPaddingType;
    path: string;
};

export interface ICanvasSettings {
    canvasSize: number;
    ctxSize: number;
};


export interface IMouseTimeSettings {
    onOut: number;
    onUp: number;
};


export interface IAppSettings {
    mouseTimeSettings: IMouseTimeSettings;
    canvasSettings: ICanvasSettings;
    modelSettings: IModelSettings;
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
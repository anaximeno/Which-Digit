import { Button, OutputLabel, Logger, sleep } from './common';
import { Canvas } from './canvas';


export interface MPI {
    value: number;
    name: string;
    certainty: number;
    userDrawing?: any; // tf tensor output type
}


const DigitNames = {
    0: 'Zero', 1: 'One',
    2: 'Two', 3: 'Three',
    4: 'Four', 5: 'Five',
    6: 'Six',7: 'Seven',
    8: 'Eight', 9: 'Nine',
};


export class Model {
    private _model: any;
    private predictions: MPI[];
    private readonly inputShape: number[];
    private readonly paddingShape: number[][];
    private modelWasLoaded: boolean;
    public lastDrawPredicted: boolean;
    private halt: boolean;
    private haltEvent?: Function;

    constructor(
        private readonly path: string,
        private readonly canvas: Canvas,
        private readonly eraseButton: Button,
        private readonly outputLabel: OutputLabel,
        private readonly logger: Logger
    ) {
        this.modelWasLoaded = false;
        this.halt = false;
        this.lastDrawPredicted = true;
        const padding = 2;
        // TODO: try to get it automatically from the config file
        const inputSize = 36; 
        const shapeSize = inputSize - 2 * padding;
        this.inputShape = [shapeSize, shapeSize];
        this.paddingShape = [
            [padding, padding],
            [padding, padding]
        ];
        this.predictions = [];
    }

    isLoaded = (): boolean => this.modelWasLoaded;
    
    load = async () => {
        this.eraseButton.disable();
        this._model = await tf.loadLayersModel(this.path);
        this.modelWasLoaded = this._model !== undefined;
        this.logger.writeLog(this.modelWasLoaded ?
            "The model was loaded successfully!" :
            "ERROR: The model was not Loaded, try to reload the page."
        );
        if (this.modelWasLoaded === true) {
            // Predict the empty canvas at least one time,
            // because the first prediction is the slowest one.
            this.makePrediction(this.getInputTensor());
            this.canvas.getCanvasElement().style.cursor = 'crosshair';
            this.eraseButton.enable();
            this.outputLabel.defaultMessage();
        }
    }

    private getInputTensor = (): any => {
        return tf.browser
            .fromPixels(this.canvas.getCanvasElement())
            .resizeBilinear(this.inputShape)
            .mean(2)
            .pad(this.paddingShape)
            .expandDims()
            .expandDims(3)
            .toFloat()
            .div(255.0);
    }

    analyzeDrawing = async (sleepTime: number = 150, returnUserDrawing: boolean = false): Promise<MPI> => {
        this.eraseButton.disable();
        this.outputLabel.write("<<< Analyzing your Drawings >>>");

        const inputTensor = this.getInputTensor();

        if (this.modelWasLoaded === false || this.canvas.drawing === true) {
            this.activateHalt(() => {
                this.eraseButton.enable();
                this.outputLabel.defaultMessage();
                this.logger.writeLog(this.modelWasLoaded ?
                    'Prediction canceled, model was not loaded yet!' : 
                    'Drawing already, prediction canceled!'
                );
            });
        } else if (inputTensor.sum().dataSync()[0] === 0) {
            this.activateHalt(() => {
                this.eraseButton.enable();
                this.outputLabel.write("<div id='output-text'><strong>TIP</strong>:"+
                    "  Click and Hold to draw.<\div>"
                );
                this.logger.writeLog('Canvas has no drawing, prediction canceled!');
            });
        }

        await sleep(this.checkLastDrawPredicted() === false ? sleepTime : 0);

        if (this.checkHalt()) {
            return ;
        } else {
            const prediction = this.makePrediction(inputTensor, returnUserDrawing);
    
            this.outputLabel.write("Finished Analysis.");
            this.eraseButton.enable();
            this.lastDrawPredicted = true;
            this.predictions.push(prediction);
    
            return prediction;
        }
    }

    makePrediction = (inputTensor: any, returnUserDrawing: boolean = false): MPI => {
        // This prevents high usage of GPU
        tf.engine().startScope();
        const outputTensor = this._model.predict(inputTensor).dataSync();
        const predictedValue = tf.argMax(outputTensor).dataSync();
        const predictionValueName = DigitNames[predictedValue];
        const predictionCertainty = tf.max(outputTensor).dataSync();
        tf.engine().endScope();

        const prediction: MPI = {
            name: predictionValueName,
            value: predictedValue,
            certainty: predictionCertainty,
            userDrawing: returnUserDrawing ?
                        inputTensor :undefined,
        }

        return prediction;
    }

    activateHalt = (haltEvent?: Function): void => {
        this.halt = true;
        if (haltEvent) {
            this.haltEvent = haltEvent;
        }
    }

    deactivateHalt = () => {
        this.halt = false;
        this.haltEvent = undefined;
    }

    checkHalt = (): boolean => {
        if (this.halt === true) {
            if (this.haltEvent) {
                this.haltEvent();
            }
            this.deactivateHalt();
            return true;
        }
        return false;
    }
    
    checkLastDrawPredicted = (): boolean => {
        if (this.lastDrawPredicted === true) {
            this.lastDrawPredicted = false;
            return true;
        }
        return false;
    }
};
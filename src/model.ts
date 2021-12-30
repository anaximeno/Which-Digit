import { Button, OutputLabel, Logger, sleep } from './common';
import { Canvas } from './canvas';


interface SinglePredictionI {
    value: number;
    name: string;
    certainty: number;
    draw?: any; // tf tensor output type
}


const DigitNames = {
    0: 'Zero', 1: 'One',
    2: 'Two', 3: 'Three',
    4: 'Four', 5: 'Five',
    6: 'Six',7: 'Seven',
    8: 'Eight', 9: 'Nine',
};


export class Model {
    private model: any;
    private predictions: SinglePredictionI[];
    private readonly inputShape: number[];
    private readonly paddingShape: number[][];
    private modelWasLoaded: boolean;
    protected halt: boolean;
    protected isFirstPrediction: boolean;
    public lastDrawPredicted: boolean;
    

    constructor(
        private readonly path: string,
        private readonly canvas: Canvas,
        private readonly eraseButton: Button,
        private readonly outputLabel: OutputLabel,
        private readonly logger: Logger
    ) {
        this.modelWasLoaded = false;
        this.halt = false;
        this.isFirstPrediction = true;
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
        this.model = await tf.loadLayersModel(this.path);
        this.modelWasLoaded = this.model !== undefined;
        this.logger.writeLog(this.modelWasLoaded ?
            "The model was loaded successfully!" :
            "ERROR: The model was not Loaded, try to reload the page."
        );
        if (this.modelWasLoaded === true) {
            this.canvas.getCanvasElement().style.cursor = 'crosshair';
            this.eraseButton.enable();
            this.outputLabel.defaultMessage();
        }
    }

    predict = async (
        sleepTime: number = 150,
        returnDraw: boolean = false
    ): Promise<SinglePredictionI> => {
        const _canvas = this.canvas.getCanvasElement();
        this.eraseButton.disable();
        this.outputLabel.write("<-<-< Predicting >->->");
        
        const inputTensor = tf.browser.fromPixels(_canvas)
            .resizeNearestNeighbor(this.inputShape)
            .mean(2)
            .pad(this.paddingShape)
            .expandDims()
            .expandDims(3)
            .toFloat()
            .div(255.0);
        
        try {
            if (this.modelWasLoaded === false || this.canvas.drawing === true) {
                throw Error(this.modelWasLoaded ?
                    'Prediction canceled, model was not loaded yet!' : 
                    'Drawing already, prediction canceled!'
                );
            } else if (inputTensor.sum().dataSync()[0] === 0) {
                this.eraseButton.enable();
                this.outputLabel.write(
                    "<div id='output-text'><strong>TIP</strong>:"+
                    "Click and Hold to draw.<\div>"
                );
                throw Error('Canvas has no drawing, prediction canceled!');
            }
    
            if (this.checkLastDrawPredicted() === false)
                await sleep(this.checkFirstPrediction() ? 
                    Number((sleepTime/Math.PI).toFixed(0)) : sleepTime);
            if (this.checkHalt() === true) {
                this.eraseButton.enable();
                this.outputLabel.defaultMessage();
                throw Error('Halt Received, prediction was canceled!');
            }
        } catch (error) {
            this.logger.writeLog(error);
            return ;
        }

        tf.engine().startScope(); //Prevents high usage of gpu
        
        const out = this.model.predict(inputTensor).dataSync();
        const value: number = tf.argMax(out).dataSync();

        const prediction: SinglePredictionI = {
            name: DigitNames[value],
            certainty: tf.max(out).dataSync()[0],
            value,
        }

        if (returnDraw === true) {
            prediction.draw = inputTensor.dataSync();
        }

        tf.engine().endScope(); 
        
        const probability = Number((prediction.certainty * 100).toFixed(2));

        this.outputLabel.write(
            "<div id='output-text'>The number drawn is <strong>"+
            `${prediction.value}</strong> (<strong>${prediction.name}</strong>)<\div>`
        );
    
        this.logger.writeLog(`Prediction: ${prediction.value}  Certainty: ${probability}%`)
        this.eraseButton.enable();
        this.lastDrawPredicted = true;
        this.predictions.push(prediction);

        return prediction;
    }

    activateHalt = (): void => {
        this.halt = true;
    }

    deactivateHalt = () => {
        this.halt = false;
    }

    checkHalt = (): boolean => {
        if (this.halt === true) {
            this.deactivateHalt();
            return true;
        }
        return false;
    }

    /** @summary returns if this is the first time the model is predicting */
    checkFirstPrediction = (): boolean => {
        if (this.isFirstPrediction === true) {
            this.isFirstPrediction = false;
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
import { Button } from './common';
import { OutputSection } from './common';
import { Logger, sleep } from './common';
import { Canvas } from './canvas';

import  {
    IPrediction,
    IModelSettings,
} from './types';


const INPUT_SIZE = 36;


const DigitNames = {
    0: 'Zero',  1: 'One',
    2: 'Two',   3: 'Three',
    4: 'Four',  5: 'Five',
    6: 'Six',   7: 'Seven',
    8: 'Eight', 9: 'Nine',
};


export class Model {
    private mnet: any;
    private readonly log: Logger;
    private readonly inputShape: number[];
    private readonly paddingShape: number[][];
    private readonly path: string;
    private predictions: IPrediction[];
    private modelWasLoaded: boolean;

    private __haltingProcedure: Function;
    private __halt: boolean;

    public lastDrawPredicted: boolean;

    constructor(
        private readonly settings:    IModelSettings,
        private readonly canvas:      Canvas,
        private readonly eraseButton: Button,
        private readonly outputLabel: OutputSection,
    ) {
        const { padding, path } = this.settings;
        const size =   INPUT_SIZE - 2 * padding;

        this.path = path;
        this.inputShape = [ size, size ];
        this.paddingShape = [
            [padding, padding],
            [padding, padding]];
        this.predictions = [];
        this.log = Logger.getInstance();
        this.lastDrawPredicted = false;
        this.modelWasLoaded = false;
    }

    isLoaded(): boolean {
        return this.modelWasLoaded;
    }

    async load() {
        let message: string;

        this.eraseButton.disable();
        this.mnet = await tf.loadLayersModel(this.path);
        this.modelWasLoaded = this.mnet !== undefined;

        if (this.modelWasLoaded === true) {
            this.predict(this.getInputTensor());
            this.canvas.getCanvasElement().style.cursor = 'crosshair';
            this.outputLabel.defaultMessage();
            this.eraseButton.enable();
            message = 'The model was loaded successfully!';
        } else {
            message = 'Error: The model could not be loaded!';
        }

        this.log.writeLog('Model.load: ' + message);
    }

    private getInputTensor = () => {
        const input = this.canvas.getCanvasElement();
        const shape = this.inputShape;
        const padding = this.paddingShape;
        return tf.browser
            .fromPixels(input)
            .resizeBilinear(shape)
            .mean(2)
            .pad(padding)
            .expandDims()
            .expandDims(3)
            .toFloat()
            .div(255.0);
    }

    private analyzeModelAndCanvas() {
        if (this.modelWasLoaded && !this.canvas.drawing){
            return  // Stop Here
        } // Otherwise
        this.activateHalt(() => {
            this.eraseButton.enable();
            this.outputLabel.defaultMessage();
            const err = this.modelWasLoaded ? 'model was not loaded!' : 'user is drawing!';
            this.log.writeLog('Model.analyzeDrawing: Error: the prediction was cancelled, ' + err);
        });
    }

    private analyzeInputTensor(input: any) {
        if (input.sum().dataSync()[0] !== 0) {
            return ; // Stop Here
        } // Otherwise
        this.activateHalt(() => {
            this.eraseButton.enable();
            this.outputLabel.write(`
                <div id='output-text'>
                    <strong>TIP</strong>: Click and Hold to draw.
                <\div>`);
            this.log.writeLog('Model.analyzeDrawing: MSG: emtpy canvas!');
        });
    }
    
    async predictDigit(save: boolean = false): Promise<IPrediction> {
        this.eraseButton.disable();
        this.outputLabel.write("Analyzing.");

        const inputTensor = this.getInputTensor();

        this.analyzeModelAndCanvas();
        this.analyzeInputTensor(inputTensor);

        if (!this.shouldHalt()) {
            if (!this.checkLastDrawPredicted()) {
                this.outputLabel.write("Analyzing..");
                await sleep(this.settings.sleepMilisecsOnPrediction);
            }
            
            this.lastDrawPredicted = true;            
            const prediction = this.predict(inputTensor);
            this.outputLabel.write("Analyzing...");
            
            if (save) {
                this.predictions.push(prediction);
            }

            this.outputLabel.write("Got the results!");
            this.eraseButton.enable();
            return prediction;
        }
    }

    private predict<T>(inputTensor: T): IPrediction {
        // tf.engine() prevents high usage of GPU
        tf.engine().startScope();

        const output = this.mnet.predict(inputTensor).dataSync();
        const value = tf.argMax(output).dataSync();
        const name = DigitNames[value];
        const certainty = tf.max(output).dataSync();

        tf.engine().endScope();

        return { name, value, certainty }
    }

    activateHalt(haltingProcedure?: Function): void {
        this.__halt = true;
        if (haltingProcedure !== undefined) {
            this.__haltingProcedure = haltingProcedure;
        }
    }

    deactivateHalt() {
        this.__halt = false;
        this.__haltingProcedure = undefined;
    }

    shouldHalt(): boolean {
        const halt = this.__halt;

        if (halt === true) {
            if (this.__haltingProcedure !== undefined) {
                this.__haltingProcedure();
            }
            this.deactivateHalt();
        }

        return halt;
    }
    
    checkLastDrawPredicted = (): boolean => {
        const lastDrawPredicted = this.lastDrawPredicted;

        if (lastDrawPredicted === true) {
            this.lastDrawPredicted = false;
        }

        return lastDrawPredicted;
    }
};
import { Canvas } from './canvas';
import { Logger, OutputLabel, Button} from './common';
import { Model } from './model'
import { App } from "./app";


const outLabelDMSG_P1 = "<div id='output-text'>Draw any digit between <strong>";
const outLabelDMSG_P2 = "0</strong> to <strong>9</strong><\div>";


(function (build: Function) {    
    const app = build();
    app.run();
})(() => {
    const logger = new Logger(true);
    const outputLabel = new OutputLabel('output', outLabelDMSG_P1+outLabelDMSG_P2);
    const eraseButton = new Button('erase-btn', 'Erase', 'Wait');
    const canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
    const model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel, logger);
    return new App(logger, outputLabel, canvas, eraseButton, model);
});

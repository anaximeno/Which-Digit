import { Logger } from './common';
import { OutputLabel } from './common';
import { Button} from './common';
import { Canvas } from './canvas';
import { Model } from './model'
import { App } from "./app";


const DEBUG_MODE_ENABLED = true
const DefaultMsgP01 = "<div id='output-text'>Draw any digit between <strong>";
const DefaultMsgP02 = "0</strong> to <strong>9</strong><\div>";


(function (build: Function) {    
    const app = build();
    app.run();
})(() => {
    const logger = new Logger(DEBUG_MODE_ENABLED);
    const outputLabel = new OutputLabel('output', DefaultMsgP01 + DefaultMsgP02);
    const eraseButton = new Button('erase-btn', 'Clear all drawings', 'Please wait');
    const canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
    const model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel, logger);
    return new App(logger, outputLabel, canvas, eraseButton, model);
});

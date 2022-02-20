import { Logger, OutputLabel, Button } from './common';
import { Canvas } from './canvas';
import { Model } from './model'
import { App } from "./app";


(() => {
    Logger.printDebugLogs = false;

    const eraseButton = new Button('erase-btn', 'Clear', 'Please wait');
    const canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
    const outputLabel = new OutputLabel(
        'output', 
        `<div id='output-text'>
            Draw any digit between <strong>0</strong> to <strong>9</strong>
        <\div>`
    );
    const model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel);    
    const app = new App(model, canvas, outputLabel, eraseButton);

    app.run();
})();

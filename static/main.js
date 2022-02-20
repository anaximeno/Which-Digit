"use strict";
export const __esModule = true;
import { Logger, Button, OutputLabel } from "./common.js";
import { Canvas } from "./canvas.js";
import { Model } from "./model.js";
import { App } from "./app.js";
(function () {
    Logger.printDebugLogs = false;
    var eraseButton = new Button('erase-btn', 'Clear', 'Please wait');
    var canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
    var outputLabel = new OutputLabel('output', "<div id='output-text'>\n            Draw any digit between <strong>0</strong> to <strong>9</strong>\n        <div>");
    var model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel);
    var app = new App(model, canvas, outputLabel, eraseButton);
    app.run();
})();
//# sourceMappingURL=main.js.map
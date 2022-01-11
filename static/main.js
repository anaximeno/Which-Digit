"use strict";
export const __esModule = true;
import { Canvas } from "./canvas.js";
import { Logger, OutputLabel, Button } from "./common.js";
import { Model } from "./model.js";
import { App } from "./app.js";
var outLabelDMSG_P1 = "<div id='output-text'>Draw any digit between <strong>";
var outLabelDMSG_P2 = "0</strong> to <strong>9</strong><\div>";
(function (build) {
    var app = build();
    app.run();
})(function () {
    var logger = new Logger(false);
    var outputLabel = new OutputLabel('output', outLabelDMSG_P1 + outLabelDMSG_P2);
    var eraseButton = new Button('erase-btn', 'Erase', 'Wait');
    var canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
    var model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel, logger);
    return new App(logger, outputLabel, canvas, eraseButton, model);
});
//# sourceMappingURL=main.js.map
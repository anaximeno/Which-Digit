"use strict";
export const __esModule = true;
import { Logger } from "./common.js";
import { OutputLabel } from "./common.js";
import { Button } from "./common.js";
import { Canvas } from "./canvas.js";
import { Model } from "./model.js";
import { App } from "./app.js";
var DEBUG_MODE_ENABLED = false;
var DefaultMsgP01 = "<div id='output-text'>Draw any digit between <strong>";
var DefaultMsgP02 = "0</strong> to <strong>9</strong><\div>";
(function (build) {
    var app = build();
    app.run();
})(function () {
    var logger = new Logger(DEBUG_MODE_ENABLED);
    var outputLabel = new OutputLabel('output', DefaultMsgP01 + DefaultMsgP02);
    var eraseButton = new Button('erase-btn', 'Clear all drawings', 'Please wait');
    var canvas = new Canvas('draw-canvas', { width: 400, height: 400 }, 22);
    var model = new Model('./data/compiled/model.json', canvas, eraseButton, outputLabel, logger);
    return new App(logger, outputLabel, canvas, eraseButton, model);
});
//# sourceMappingURL=main.js.map
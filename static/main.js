"use strict";
export const __esModule = true;
import { Logger } from "./common.js";
import { App } from "./app.js";
(function () {
    Logger.printDebugLogs = false;
    var app = new App({
        modelSettings: {
            path: 'data/compiled/model.json',
            sleepMilisecsOnPrediction: 250,
            padding: 1
        },
        canvasSettings: {
            ctxSize: 22,
            canvasSize: 400
        },
        mouseTimeSettings: {
            onOut: 1500,
            onUp: 1350
        }
    });
    app.run();
})();
//# sourceMappingURL=main.js.map
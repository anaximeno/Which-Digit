"use strict";
export const __esModule = true;
import { Logger } from "./common.js";
import { App } from "./app.js";
(function () {
    Logger.printDebugLogs = false;
    var app = new App({
        canvasSettings: {
            ctxSize: 22,
            canvasSize: 400
        },
        mouseTimeSettings: {
            onOut: 1500,
            onUp: 1350
        },
        imagePadding: 1
    });
    app.run();
})();
//# sourceMappingURL=main.js.map
import { Logger } from "./common";
import { App } from "./app";


(() => {
    Logger.printDebugLogs = false;

    const app = new App({
        modelSettings: {
            path: 'data/compiled/model.json',
            sleepMilisecsOnPrediction: 250,
            padding: 2
        },
        canvasSettings: {
            ctxSize: 24,
            canvasSize: 400
        },
        mouseTimeSettings: {
            onOut: 1500,
            onUp: 1350
        }
    });

    app.run();
})();

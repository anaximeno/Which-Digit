import { Logger } from "./common";
import { App } from "./app";


(() => {
    Logger.printDebugLogs = false;
    
    const app = new App({
        canvasSettings: {
            ctxSize: 22,
            canvasSize: 400
        },
        mouseTimeSettings: {
            onOut: 1500,
            onUp: 1350
        },
        imagePadding: 1,
    });

    app.run();
})();

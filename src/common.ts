export interface PositionInterface {
    x: number;
    y: number;
    z?: number;
}


export const min = (...args: number[]): number => {
    let minimun: number;

    switch (args.length) {
        case 0:
            minimun = -Infinity;
            break;
        case 1:
            minimun = args[0];
            break;
        default:
            minimun = args[0];
            for (let i = 1 ; i < args.length ; ++i)
                minimun = minimun > args[i] ? args[i] : minimun;
            break;
    }

    return minimun;
}


export const max = (...args: number[]): number => {
    let maximum: number;

    switch (args.length) {
        case 0:
            maximum = Infinity;
            break;
        case 1:
            maximum = args[0];
            break;
        default:
            maximum = args[0];
            for (let i = 1 ; i < args.length ; ++i)
                maximum = maximum < args[i] ? args[i] : maximum;
            break;
    }

    return maximum;
}


export const sleep = (milisecs: number): Promise<unknown> =>
                    new Promise(resolve => setTimeout(resolve, milisecs));


export class OutputLabel {
    protected readonly element: HTMLElement;

    constructor(
        protected readonly selector: string,
        protected readonly defaultMsg: string
    ) {
        this.element = document.getElementById(this.selector);
    }

    write = (message: string) => {
        this.element.innerHTML = message;
    }

    defaultMessage = () => {
        this.write(this.defaultMsg);
    }
};


export class Button extends OutputLabel {
    protected readonly button: HTMLButtonElement;

    constructor(
        selector: string,
        defaultMsg: string,
        private readonly disableMsg: string
    ) {
        super(selector, defaultMsg);
        this.button = (this.element as unknown) as HTMLButtonElement;
    }

    enable = () => {
        this.button.disabled = false;
        this.defaultMessage();
    }

    disable = () => {
        this.button.disabled = true;
        this.write(this.disableMsg);
    }

    setEvent = (event: string, listener: any) => {
        this.button.addEventListener(event, listener);
    }
}

interface LogInterface {
    time: string;
    message: string;
}

// TODO: maybe add a section to the logger
// which can be used to determine which
// section the log is from.
export class Logger {
    static logs: LogInterface[] = [];

    constructor(public debugMode: boolean) {
        this.writeLog(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}.`, false, true);
    }

    static getTime = (): string => {
        const zeroPad = (num: number): string =>  
                      num < 10 ? '0' + num.toString() : num.toString();

        const date = new Date();
        const hours = zeroPad(date.getHours());
        const minutes = zeroPad(date.getMinutes());
        const seconds = zeroPad(date.getSeconds());

        return `${hours}:${minutes}:${seconds}`
    }

    saveLog = (message: string, time: string) => {
        Logger.logs.push({ time, message });
    }

    writeLog = (message: string, time: boolean = true, force?: boolean) => {
        const currentTime = Logger.getTime();
        const prefix = time ? `[${currentTime}] ` : '';
        this.saveLog(message, currentTime);
        if (this.debugMode === true || force === true) {
            console.log(`${prefix + message}`);
        }
    }   
}
